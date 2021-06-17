import Vue from 'vue'

import QIcon from '../icon/QIcon.js'
import QCheckbox from '../checkbox/QCheckbox.js'
import QSlideTransition from '../slide-transition/QSlideTransition.js'
import QSpinner from '../spinner/QSpinner.js'
import DarkMixin from '../../mixins/dark.js'

import { stopAndPrevent } from '../../utils/event.js'
import { shouldIgnoreKey } from '../../utils/key-composition.js'
import cache from '../../utils/cache.js'

export default Vue.extend({
  name: 'QTree',

  mixins: [ DarkMixin ],

  props: {
    nodes: {
      type: Array,
      required: true
    },
    nodeKey: {
      type: String,
      required: true
    },
    labelKey: {
      type: String,
      default: 'label'
    },
    childrenKey: {
      type: String,
      default: 'children'
    },

    color: String,
    controlColor: String,
    textColor: String,
    selectedColor: String,

    icon: String,

    tickStrategy: {
      type: String,
      default: 'none',
      validator: v => ['none', 'strict', 'leaf', 'leaf-filtered'].includes(v)
    },
    ticked: Array, // sync
    expanded: Array, // sync
    selected: {}, // sync

    defaultExpandAll: Boolean,
    accordion: Boolean,

    filter: String,
    filterMethod: {
      type: Function,
      default (node, filter) {
        const filt = filter.toLowerCase()
        return node[this.labelKey] &&
          node[this.labelKey].toLowerCase().indexOf(filt) > -1
      }
    },

    duration: Number,
    noConnectors: Boolean,

    noNodesLabel: String,
    noResultsLabel: String
  },

  computed: {
    classes () {
      return 'q-tree' +
        (this.noConnectors === true ? ' q-tree--no-connectors' : '') +
        ` q-tree--${this.darkSuffix}` +
        (this.color !== void 0 ? ` text-${this.color}` : '')
    },

    hasSelection () {
      return this.selected !== void 0
    },

    computedIcon () {
      return this.icon || this.$q.iconSet.tree.icon
    },

    computedControlColor () {
      return this.controlColor || this.color
    },

    textColorClass () {
      if (this.textColor !== void 0) {
        return `text-${this.textColor}`
      }
    },

    selectedColorClass () {
      const color = this.selectedColor || this.color
      if (color) {
        return `text-${color}`
      }
    },

    meta () {
      const meta = {}

      const travel = (node, parent) => {
        const tickStrategy = node.tickStrategy || (parent ? parent.tickStrategy : this.tickStrategy)
        const
          key = node[this.nodeKey],
          isParent = node[this.childrenKey] && node[this.childrenKey].length > 0,
          isLeaf = isParent !== true,
          selectable = node.disabled !== true && this.hasSelection === true && node.selectable !== false,
          expandable = node.disabled !== true && node.expandable !== false,
          hasTicking = tickStrategy !== 'none',
          strictTicking = tickStrategy === 'strict',
          leafFilteredTicking = tickStrategy === 'leaf-filtered',
          leafTicking = tickStrategy === 'leaf' || tickStrategy === 'leaf-filtered'

        let tickable = node.disabled !== true && node.tickable !== false
        if (leafTicking === true && tickable === true && parent && parent.tickable !== true) {
          tickable = false
        }

        let lazy = node.lazy
        if (
          lazy === true &&
          this.lazy[key] !== void 0 &&
          Array.isArray(node[this.childrenKey]) === true
        ) {
          lazy = this.lazy[key]
        }

        const m = {
          key,
          parent,
          isParent,
          isLeaf,
          lazy,
          disabled: node.disabled,
          link: node.disabled !== true && (selectable === true || (expandable === true && (isParent === true || lazy === true))),
          children: [],
          matchesFilter: this.filter ? this.filterMethod(node, this.filter) : true,

          selected: key === this.selected && selectable === true,
          selectable,
          expanded: isParent === true ? this.innerExpanded.includes(key) : false,
          expandable,
          noTick: node.noTick === true || (strictTicking !== true && lazy && lazy !== 'loaded'),
          tickable,
          tickStrategy,
          hasTicking,
          strictTicking,
          leafFilteredTicking,
          leafTicking,
          ticked: strictTicking === true
            ? this.innerTicked.includes(key)
            : (isLeaf === true ? this.innerTicked.includes(key) : false)
        }

        meta[key] = m

        if (isParent === true) {
          m.children = node[this.childrenKey].map(n => travel(n, m))

          if (this.filter) {
            if (m.matchesFilter !== true) {
              m.matchesFilter = m.children.some(n => n.matchesFilter)
            }
            else if (
              m.noTick !== true &&
              m.disabled !== true &&
              m.tickable === true &&
              leafFilteredTicking === true &&
              m.children.every(n => n.matchesFilter !== true || n.noTick === true || n.tickable !== true) === true
            ) {
              m.tickable = false
            }
          }

          if (m.matchesFilter === true) {
            if (m.noTick !== true && strictTicking !== true && m.children.every(n => n.noTick) === true) {
              m.noTick = true
            }

            if (leafTicking) {
              m.ticked = false
              m.indeterminate = m.children.some(node => node.indeterminate === true)
              m.tickable = m.tickable === true && m.children.some(node => node.tickable)

              if (m.indeterminate !== true) {
                const sel = m.children
                  .reduce((acc, meta) => meta.ticked === true ? acc + 1 : acc, 0)

                if (sel === m.children.length) {
                  m.ticked = true
                }
                else if (sel > 0) {
                  m.indeterminate = true
                }
              }

              if (m.indeterminate === true) {
                m.indeterminateNextState = m.children
                  .every(meta => meta.tickable !== true || meta.ticked !== true)
              }
            }
          }
        }

        return m
      }

      this.nodes.forEach(node => travel(node, null))
      return meta
    }
  },

  data () {
    return {
      lazy: {},
      innerTicked: this.ticked || [],
      innerExpanded: this.expanded || []
    }
  },

  watch: {
    ticked (val) {
      this.innerTicked = val
    },

    expanded (val) {
      this.innerExpanded = val
    }
  },

  methods: {
    getNodeByKey (key) {
      const reduce = [].reduce

      const find = (result, node) => {
        if (result || !node) {
          return result
        }
        if (Array.isArray(node) === true) {
          return reduce.call(Object(node), find, result)
        }
        if (node[this.nodeKey] === key) {
          return node
        }
        if (node[this.childrenKey]) {
          return find(null, node[this.childrenKey])
        }
      }

      return find(null, this.nodes)
    },

    getTickedNodes () {
      return this.innerTicked.map(key => this.getNodeByKey(key))
    },

    getExpandedNodes () {
      return this.innerExpanded.map(key => this.getNodeByKey(key))
    },

    isExpanded (key) {
      return key && this.meta[key]
        ? this.meta[key].expanded
        : false
    },

    collapseAll () {
      if (this.expanded !== void 0) {
        this.$emit('update:expanded', [])
      }
      else {
        this.innerExpanded = []
      }
    },

    expandAll () {
      const
        expanded = this.innerExpanded,
        travel = node => {
          if (node[this.childrenKey] && node[this.childrenKey].length > 0) {
            if (node.expandable !== false && node.disabled !== true) {
              expanded.push(node[this.nodeKey])
              node[this.childrenKey].forEach(travel)
            }
          }
        }

      this.nodes.forEach(travel)

      if (this.expanded !== void 0) {
        this.$emit('update:expanded', expanded)
      }
      else {
        this.innerExpanded = expanded
      }
    },

    setExpanded (key, state, node = this.getNodeByKey(key), meta = this.meta[key]) {
      if (meta.lazy && meta.lazy !== 'loaded') {
        if (meta.lazy === 'loading') {
          return
        }

        this.$set(this.lazy, key, 'loading')
        if (Array.isArray(node[this.childrenKey]) !== true) {
          this.$set(node, this.childrenKey, [])
        }
        this.$emit('lazy-load', {
          node,
          key,
          done: children => {
            this.lazy[key] = 'loaded'
            this.$set(node, this.childrenKey, Array.isArray(children) === true ? children : [])
            this.$nextTick(() => {
              const m = this.meta[key]
              if (m && m.isParent === true) {
                this.__setExpanded(key, true)
              }
            })
          },
          fail: () => {
            this.$delete(this.lazy, key)
            if (node[this.childrenKey].length === 0) {
              this.$delete(node, this.childrenKey)
            }
          }
        })
      }
      else if (meta.isParent === true && meta.expandable === true) {
        this.__setExpanded(key, state)
      }
    },

    __setExpanded (key, state) {
      let target = this.innerExpanded
      const emit = this.expanded !== void 0

      if (emit === true) {
        target = target.slice()
      }

      if (state) {
        if (this.accordion) {
          if (this.meta[key]) {
            const collapse = []
            if (this.meta[key].parent) {
              this.meta[key].parent.children.forEach(m => {
                if (m.key !== key && m.expandable === true) {
                  collapse.push(m.key)
                }
              })
            }
            else {
              this.nodes.forEach(node => {
                const k = node[this.nodeKey]
                if (k !== key) {
                  collapse.push(k)
                }
              })
            }
            if (collapse.length > 0) {
              target = target.filter(k => collapse.includes(k) === false)
            }
          }
        }

        target = target.concat([ key ])
          .filter((key, index, self) => self.indexOf(key) === index)
      }
      else {
        target = target.filter(k => k !== key)
      }

      if (emit === true) {
        this.$emit(`update:expanded`, target)
      }
      else {
        this.innerExpanded = target
      }
    },

    isTicked (key) {
      return key && this.meta[key]
        ? this.meta[key].ticked
        : false
    },

    setTicked (keys, state) {
      let target = this.innerTicked
      const emit = this.ticked !== void 0

      if (emit === true) {
        target = target.slice()
      }

      if (state) {
        target = target.concat(keys)
          .filter((key, index, self) => self.indexOf(key) === index)
      }
      else {
        target = target.filter(k => keys.includes(k) === false)
      }

      if (emit === true) {
        this.$emit(`update:ticked`, target)
      }
    },

    __getSlotScope (node, meta, key) {
      const scope = { tree: this, node, key, color: this.color, dark: this.dark }

      Object.defineProperty(scope, 'expanded', {
        get: () => { return meta.expanded },
        set: val => { val !== meta.expanded && this.setExpanded(key, val) },
        configurable: true,
        enumerable: true
      })
      Object.defineProperty(scope, 'ticked', {
        get: () => { return meta.ticked },
        set: val => { val !== meta.ticked && this.setTicked([ key ], val) },
        configurable: true,
        enumerable: true
      })

      return scope
    },

    __getChildren (h, nodes) {
      return (
        this.filter
          ? nodes.filter(n => this.meta[n[this.nodeKey]].matchesFilter)
          : nodes
      ).map(child => this.__getNode(h, child))
    },

    __getNodeMedia (h, node) {
      if (node.icon !== void 0) {
        return h(QIcon, {
          staticClass: `q-tree__icon q-mr-sm`,
          props: { name: node.icon, color: node.iconColor }
        })
      }
      const src = node.img || node.avatar
      if (src) {
        return h('img', {
          staticClass: `q-tree__${node.img ? 'img' : 'avatar'} q-mr-sm`,
          attrs: { src }
        })
      }
    },

    __getNode (h, node) {
      const
        key = node[this.nodeKey],
        meta = this.meta[key],
        header = node.header
          ? this.$scopedSlots[`header-${node.header}`] || this.$scopedSlots['default-header']
          : this.$scopedSlots['default-header']

      const children = meta.isParent === true
        ? this.__getChildren(h, node[this.childrenKey])
        : []

      const isParent = children.length > 0 || (meta.lazy && meta.lazy !== 'loaded')

      let body = node.body
        ? this.$scopedSlots[`body-${node.body}`] || this.$scopedSlots['default-body']
        : this.$scopedSlots['default-body']
      const slotScope = header !== void 0 || body !== void 0
        ? this.__getSlotScope(node, meta, key)
        : null

      if (body !== void 0) {
        body = h('div', { staticClass: 'q-tree__node-body relative-position' }, [
          h('div', { class: this.textColorClass }, [
            body(slotScope)
          ])
        ])
      }

      return h('div', {
        key,
        staticClass: 'q-tree__node relative-position',
        class: { 'q-tree__node--parent': isParent, 'q-tree__node--child': !isParent }
      }, [
        h('div', {
          staticClass: 'q-tree__node-header relative-position row no-wrap items-center',
          class: {
            'q-tree__node--link q-hoverable q-focusable': meta.link,
            'q-tree__node--selected': meta.selected,
            'q-tree__node--disabled': meta.disabled
          },
          attrs: { tabindex: meta.link ? 0 : -1 },
          on: {
            click: (e) => {
              this.__onClick(node, meta, e)
            },
            keypress: e => {
              if (shouldIgnoreKey(e) !== true) {
                if (e.keyCode === 13) { this.__onClick(node, meta, e, true) }
                else if (e.keyCode === 32) { this.__onExpandClick(node, meta, e, true) }
              }
            }
          }
        }, [
          h('div', { staticClass: 'q-focus-helper', attrs: { tabindex: -1 }, ref: `blurTarget_${meta.key}` }),

          meta.lazy === 'loading'
            ? h(QSpinner, {
              staticClass: 'q-tree__spinner q-mr-xs',
              props: { color: this.computedControlColor }
            })
            : (
              isParent === true
                ? h(QIcon, {
                  staticClass: 'q-tree__arrow q-mr-xs',
                  class: { 'q-tree__arrow--rotate': meta.expanded },
                  props: { name: this.computedIcon },
                  on: {
                    click: e => {
                      this.__onExpandClick(node, meta, e)
                    }
                  }
                })
                : null
            ),

          meta.hasTicking === true && meta.noTick !== true
            ? h(QCheckbox, {
              staticClass: 'q-mr-xs',
              props: {
                value: meta.indeterminate === true ? null : meta.ticked,
                color: this.computedControlColor,
                dark: this.dark,
                dense: true,
                keepColor: true,
                disable: meta.tickable !== true
              },
              on: {
                keydown: stopAndPrevent,
                input: v => {
                  this.__onTickedClick(meta, v)
                }
              }
            })
            : null,

          h('div', {
            'staticClass': 'q-tree__node-header-content col row no-wrap items-center',
            class: meta.selected ? this.selectedColorClass : this.textColorClass
          }, [
            header
              ? header(slotScope)
              : [
                this.__getNodeMedia(h, node),
                h('div', node[this.labelKey])
              ]
          ])
        ]),

        isParent === true
          ? h(QSlideTransition, {
            props: { duration: this.duration },
            on: cache(this, 'slide', {
              show: () => { this.$emit('after-show') },
              hide: () => { this.$emit('after-hide') }
            })
          }, [
            h('div', {
              staticClass: 'q-tree__node-collapsible',
              class: this.textColorClass,
              directives: [{ name: 'show', value: meta.expanded }]
            }, [
              body,

              h('div', {
                staticClass: 'q-tree__children',
                class: { 'q-tree__node--disabled': meta.disabled }
              }, children)
            ])
          ])
          : body
      ])
    },

    __blur (key) {
      const blurTarget = this.$refs[`blurTarget_${key}`]
      blurTarget !== void 0 && blurTarget.focus()
    },

    __onClick (node, meta, e, keyboard) {
      keyboard !== true && this.__blur(meta.key)

      if (this.hasSelection) {
        if (meta.selectable) {
          this.$emit('update:selected', meta.key !== this.selected ? meta.key : null)
        }
      }
      else {
        this.__onExpandClick(node, meta, e, keyboard)
      }

      if (typeof node.handler === 'function') {
        node.handler(node)
      }
    },

    __onExpandClick (node, meta, e, keyboard) {
      if (e !== void 0) {
        stopAndPrevent(e)
      }
      keyboard !== true && this.__blur(meta.key)
      this.setExpanded(meta.key, !meta.expanded, node, meta)
    },

    __onTickedClick (meta, state) {
      if (meta.indeterminate === true) {
        state = meta.indeterminateNextState
      }
      if (meta.strictTicking) {
        this.setTicked([ meta.key ], state)
      }
      else if (meta.leafTicking) {
        const keys = []
        const travel = meta => {
          if (meta.isParent) {
            if (state !== true && meta.noTick !== true && meta.tickable === true) {
              keys.push(meta.key)
            }
            if (meta.leafTicking === true) {
              meta.children.forEach(travel)
            }
          }
          else if (
            meta.noTick !== true &&
            meta.tickable === true &&
            (meta.leafFilteredTicking !== true || meta.matchesFilter === true)
          ) {
            keys.push(meta.key)
          }
        }
        travel(meta)
        this.setTicked(keys, state)
      }
    }
  },

  render (h) {
    const children = this.__getChildren(h, this.nodes)

    return h(
      'div', {
        class: this.classes
      },
      children.length === 0
        ? (
          this.filter
            ? this.noResultsLabel || this.$q.lang.tree.noResults
            : this.noNodesLabel || this.$q.lang.tree.noNodes
        )
        : children
    )
  },

  created () {
    this.defaultExpandAll === true && this.expandAll()
  }
})

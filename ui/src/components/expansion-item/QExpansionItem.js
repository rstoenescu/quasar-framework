import Vue from 'vue'

import QItem from '../item/QItem.js'
import QItemSection from '../item/QItemSection.js'
import QItemLabel from '../item/QItemLabel.js'
import QIcon from '../icon/QIcon.js'
import QSlideTransition from '../slide-transition/QSlideTransition.js'
import QSeparator from '../separator/QSeparator.js'

import { RouterLinkMixin } from '../../mixins/router-link.js'
import ModelToggleMixin from '../../mixins/model-toggle.js'
import DarkMixin from '../../mixins/dark.js'

import { stopAndPrevent } from '../../utils/event.js'
import { slot } from '../../utils/slot.js'
import cache from '../../utils/cache.js'

const eventName = 'q:expansion-item:close'

export default Vue.extend({
  name: 'QExpansionItem',

  mixins: [ DarkMixin, RouterLinkMixin, ModelToggleMixin ],

  props: {
    icon: String,

    label: String,
    labelLines: [ Number, String ],

    caption: String,
    captionLines: [ Number, String ],

    dense: Boolean,

    expandIcon: String,
    expandedIcon: String,
    expandIconClass: [ Array, String, Object ],
    duration: Number,

    headerInsetLevel: Number,
    contentInsetLevel: Number,

    expandSeparator: Boolean,
    defaultOpened: Boolean,
    expandIconToggle: Boolean,
    switchToggleSide: Boolean,
    denseToggle: Boolean,
    group: String,
    popup: Boolean,

    headerStyle: [Array, String, Object],
    headerClass: [Array, String, Object]
  },

  data () {
    return {
      showing: this.value !== void 0
        ? this.value
        : this.defaultOpened
    }
  },

  watch: {
    showing (val) {
      val === true && this.group !== void 0 && this.$root.$emit(eventName, this)
    },

    group (newVal, oldVal) {
      if (newVal !== void 0 && oldVal === void 0) {
        this.$root.$on(eventName, this.__eventHandler)
      }
      else if (newVal === void 0 && oldVal !== void 0) {
        this.$root.$off(eventName, this.__eventHandler)
      }
    }
  },

  computed: {
    classes () {
      return `q-expansion-item--${this.showing === true ? 'expanded' : 'collapsed'}` +
        ` q-expansion-item--${this.popup === true ? 'popup' : 'standard'}`
    },

    contentStyle () {
      if (this.contentInsetLevel !== void 0) {
        const dir = this.$q.lang.rtl === true ? 'Right' : 'Left'
        return {
          ['padding' + dir]: (this.contentInsetLevel * 56) + 'px'
        }
      }
    },

    isClickable () {
      return this.hasRouterLink === true || this.expandIconToggle !== true
    },

    expansionIcon () {
      return this.expandedIcon !== void 0 && this.showing === true
        ? this.expandedIcon
        : this.expandIcon || this.$q.iconSet.expansionItem[this.denseToggle === true ? 'denseIcon' : 'icon']
    },

    activeToggleIcon () {
      return this.disable !== true && (this.hasRouterLink === true || this.expandIconToggle === true)
    }
  },

  methods: {
    __onHeaderClick (e) {
      this.hasRouterLink !== true && this.toggle(e)
      this.$emit('click', e)
    },

    __toggleIconKeyboard (e) {
      e.keyCode === 13 && this.__toggleIcon(e, true)
    },

    __toggleIcon (e, keyboard) {
      keyboard !== true && this.$refs.blurTarget !== void 0 && this.$refs.blurTarget.focus()
      this.toggle(e)
      stopAndPrevent(e)
    },

    __eventHandler (comp) {
      this !== comp && this.group === comp.group && this.hide()
    },

    __getToggleIcon (h) {
      const data = {
        staticClass: `q-focusable relative-position cursor-pointer${this.denseToggle === true && this.switchToggleSide === true ? ' items-end' : ''}`,
        class: this.expandIconClass,
        props: {
          side: this.switchToggleSide !== true,
          avatar: this.switchToggleSide
        }
      }

      const child = [
        h(QIcon, {
          staticClass: 'q-expansion-item__toggle-icon',
          class: this.expandedIcon === void 0 && this.showing === true
            ? 'q-expansion-item__toggle-icon--rotated'
            : void 0,
          props: { name: this.expansionIcon }
        })
      ]

      if (this.activeToggleIcon === true) {
        Object.assign(data, {
          attrs: { tabindex: 0 },
          on: cache(this, 'inpExt', {
            click: this.__toggleIcon,
            keyup: this.__toggleIconKeyboard
          })
        })

        child.unshift(
          h('div', {
            ref: 'blurTarget',
            staticClass: 'q-expansion-item__toggle-focus q-icon q-focus-helper q-focus-helper--rounded',
            attrs: { tabindex: -1 }
          })
        )
      }

      return h(QItemSection, data, child)
    },

    __getHeader (h) {
      let child

      if (this.$scopedSlots.header !== void 0) {
        child = [].concat(this.$scopedSlots.header())
      }
      else {
        child = [
          h(QItemSection, [
            h(QItemLabel, {
              props: { lines: this.labelLines }
            }, [ this.label || '' ]),

            this.caption
              ? h(QItemLabel, {
                props: { lines: this.captionLines, caption: true }
              }, [ this.caption ])
              : null
          ])
        ]

        this.icon && child[this.switchToggleSide === true ? 'push' : 'unshift'](
          h(QItemSection, {
            props: {
              side: this.switchToggleSide === true,
              avatar: this.switchToggleSide !== true
            }
          }, [
            h(QIcon, {
              props: { name: this.icon }
            })
          ])
        )
      }

      this.disable !== true && child[this.switchToggleSide === true ? 'unshift' : 'push'](
        this.__getToggleIcon(h)
      )

      const data = {
        ref: 'item',
        style: this.headerStyle,
        class: this.headerClass,
        props: {
          dark: this.isDark,
          disable: this.disable,
          dense: this.dense,
          insetLevel: this.headerInsetLevel
        }
      }

      if (this.isClickable === true) {
        const evtProp = this.hasRouterLink === true ? 'nativeOn' : 'on'

        data.props.clickable = true
        data[evtProp] = {
          ...this.qListeners,
          click: this.__onHeaderClick
        }

        this.hasRouterLink === true && Object.assign(
          data.props,
          this.routerLinkProps
        )
      }

      return h(QItem, data, child)
    },

    __getContent (h) {
      const node = [
        this.__getHeader(h),

        h(QSlideTransition, {
          props: { duration: this.duration },
          on: cache(this, 'slide', {
            show: () => { this.$emit('after-show') },
            hide: () => { this.$emit('after-hide') }
          })
        }, [
          h('div', {
            staticClass: 'q-expansion-item__content relative-position',
            style: this.contentStyle,
            directives: [{ name: 'show', value: this.showing }]
          }, slot(this, 'default'))
        ])
      ]

      if (this.expandSeparator) {
        node.push(
          h(QSeparator, {
            staticClass: 'q-expansion-item__border q-expansion-item__border--top absolute-top',
            props: { dark: this.isDark }
          }),
          h(QSeparator, {
            staticClass: 'q-expansion-item__border q-expansion-item__border--bottom absolute-bottom',
            props: { dark: this.isDark }
          })
        )
      }

      return node
    }
  },

  render (h) {
    return h('div', {
      staticClass: 'q-expansion-item q-item-type',
      class: this.classes
    }, [
      h(
        'div',
        { staticClass: 'q-expansion-item__container relative-position' },
        this.__getContent(h)
      )
    ])
  },

  created () {
    this.group !== void 0 && this.$root.$on(eventName, this.__eventHandler)
  },

  beforeDestroy () {
    this.group !== void 0 && this.$root.$off(eventName, this.__eventHandler)
  }
})

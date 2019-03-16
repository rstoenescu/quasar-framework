import Vue from 'vue'

import QIcon from '../icon/QIcon.js'
import QResizeObserver from '../observer/QResizeObserver.js'

import slot from '../../utils/slot.js'

function getIndicatorClass (color, top, vertical) {
  const pos = vertical === true
    ? ['left', 'right']
    : ['top', 'bottom']

  return `absolute-${top === true ? pos[0] : pos[1]}${color ? ` text-${color}` : ''}`
}

export default Vue.extend({
  name: 'QTabs',

  provide () {
    return {
      tabs: this.tabs,
      __activateTab: this.__activateTab,
      __activateRoute: this.__activateRoute
    }
  },

  props: {
    value: [Number, String],

    vertical: Boolean,
    align: {
      type: String,
      default: 'center',
      validator: v => ['left', 'center', 'right', 'justify'].includes(v)
    },
    breakpoint: {
      type: [String, Number],
      default: 600
    },

    shrink: Boolean,

    activeColor: String,
    activeBgColor: String,
    indicatorColor: String,
    leftIcon: String,
    rightIcon: String,

    topIndicator: Boolean,
    narrowIndicator: Boolean,
    inlineLabel: Boolean,
    noCaps: Boolean,

    dense: Boolean
  },

  data () {
    return {
      tabs: {
        current: this.value,
        activeColor: this.activeColor,
        activeBgColor: this.activeBgColor,
        indicatorClass: getIndicatorClass(this.indicatorColor, this.topIndicator, this.vertical),
        narrowIndicator: this.narrowIndicator,
        inlineLabel: this.inlineLabel,
        noCaps: this.noCaps
      },
      scrollable: false,
      leftArrow: true,
      rightArrow: false,
      justify: false
    }
  },

  watch: {
    value (name) {
      this.__activateTab(name)
    },

    activeColor (v) {
      this.tabs.activeColor = v
    },

    activeBgColor (v) {
      this.tabs.activeBgColor = v
    },

    indicatorColor (v) {
      this.tabs.indicatorClass = getIndicatorClass(v, this.topIndicator)
    },

    topIndicator (v) {
      this.tabs.indicatorClass = getIndicatorClass(this.indicatorColor, v)
    },

    narrowIndicator (v) {
      this.tabs.narrowIndicator = v
    },

    inlineLabel (v) {
      this.tabs.inlineLabel = v
    },

    noCaps (v) {
      this.tabs.noCaps = v
    }
  },

  computed: {
    alignClass () {
      const align = this.scrollable === true
        ? 'left'
        : (this.justify === true ? 'justify' : this.align)

      return `q-tabs__content--align-${align}`
    },

    classes () {
      return `q-tabs--${this.scrollable === true ? '' : 'not-'}scrollable` +
        (this.dense === true ? ' q-tabs--dense' : '') +
        (this.shrink === true ? ' col-shrink' : '') +
        (this.vertical ? ' q-tabs--vertical' : '')
    }
  },

  methods: {
    __activateTab (name) {
      if (this.tabs.current !== name) {
        this.__animate(this.tabs.current, name)
        this.tabs.current = name
        this.$emit('input', name)
      }
    },

    __activateRoute (params) {
      const
        { name, selectable, exact, selected, priority } = params,
        first = !this.buffer.length,
        existingIndex = first ? -1 : this.buffer.findIndex(t => t.name === name)

      if (existingIndex > -1) {
        const buffer = this.buffer[existingIndex]
        exact && (buffer.exact = exact)
        selectable && (buffer.selectable = selectable)
        selected && (buffer.selected = selected)
        priority && (buffer.priority = priority)
      }
      else {
        this.buffer.push(params)
      }

      if (first) {
        this.bufferTimer = setTimeout(() => {
          let tab = this.buffer.find(t => t.exact && t.selected) ||
            this.buffer.find(t => t.selectable && t.selected) ||
            this.buffer.find(t => t.exact) ||
            this.buffer.filter(t => t.selectable).sort((t1, t2) => t2.priority - t1.priority)[0] ||
            this.buffer[0]

          this.buffer.length = 0
          this.__activateTab(tab.name)
        }, 100)
      }
    },

    __updateContainer ({ width, height }) {
      let scroll
      if (this.vertical) {
        scroll = this.$refs.content.scrollHeight - (this.scrollable ? this.extraOffset : 0) > height
      }
      else {
        scroll = this.$refs.content.scrollWidth - (this.scrollable ? this.extraOffset : 0) > width
      }

      if (this.scrollable !== scroll) {
        this.scrollable = scroll
      }

      scroll === true && this.$nextTick(() => this.__updateArrows())

      const justify = (this.vertical ? height : width) < parseInt(this.breakpoint, 10)
      if (this.justify !== justify) {
        this.justify = justify
      }
    },

    __animate (oldName, newName) {
      const
        oldTab = oldName
          ? this.$children.find(tab => tab.name === oldName)
          : null,
        newTab = newName
          ? this.$children.find(tab => tab.name === newName)
          : null

      if (oldTab && newTab) {
        const
          oldEl = oldTab.$el.getElementsByClassName('q-tab__indicator')[0],
          newEl = newTab.$el.getElementsByClassName('q-tab__indicator')[0]

        clearTimeout(this.animateTimer)

        oldEl.style.transition = 'none'
        oldEl.style.transform = 'none'
        newEl.style.transition = 'none'
        newEl.style.transform = 'none'

        const
          oldPos = oldEl.getBoundingClientRect(),
          newPos = newEl.getBoundingClientRect()

        if (this.vertical) {
          newEl.style.transform = `translate3d(0, ${oldPos.top - newPos.top}px, 0) scale3d(1, ${newPos.height ? oldPos.height / newPos.height : 1}, 1)`
        }
        else {
          newEl.style.transform = `translate3d(${oldPos.left - newPos.left}px, 0, 0) scale3d(${newPos.width ? oldPos.width / newPos.width : 1}, 1, 1)`
        }

        // allow scope updates to kick in
        this.$nextTick(() => {
          this.animateTimer = setTimeout(() => {
            newEl.style.transition = 'transform .25s cubic-bezier(.4, 0, .2, 1)'
            newEl.style.transform = 'none'
          }, 30)
        })
      }

      if (newTab && this.scrollable) {
        const
          { left, width, top, height } = this.$refs.content.getBoundingClientRect(),
          newPos = newTab.$el.getBoundingClientRect()

        let offset = this.vertical ? newPos.top - top : newPos.left - left

        if (offset < 0) {
          this.$refs.content[this.vertical ? 'scrollTop' : 'scrollLeft'] += offset
          this.__updateArrows()
          return
        }

        offset += this.vertical ? newPos.height - height : newPos.width - width
        if (offset > 0) {
          this.$refs.content[this.vertical ? 'scrollTop' : 'scrollLeft'] += offset
          this.__updateArrows()
        }
      }
    },

    __updateArrows () {
      const
        content = this.$refs.content,
        left = this.vertical ? content.scrollTop : content.scrollLeft

      this.leftArrow = left > 0
      if (this.vertical) {
        this.rightArrow = left + content.getBoundingClientRect().height + 5 < content.scrollHeight
      }
      else {
        this.rightArrow = left + content.getBoundingClientRect().width + 5 < content.scrollWidth
      }
    },

    __animScrollTo (value) {
      this.__stopAnimScroll()
      this.__scrollTowards(value)

      this.scrollTimer = setInterval(() => {
        if (this.__scrollTowards(value)) {
          this.__stopAnimScroll()
        }
      }, 5)
    },

    __scrollToStart () {
      this.__animScrollTo(0)
    },

    __scrollToEnd () {
      this.__animScrollTo(9999)
    },

    __stopAnimScroll () {
      clearInterval(this.scrollTimer)
    },

    __scrollTowards (value) {
      let
        content = this.$refs.content,
        left = this.vertical ? content.scrollTop : content.scrollLeft,
        direction = value < left ? -1 : 1,
        done = false

      left += direction * 5
      if (left < 0) {
        done = true
        left = 0
      }
      else if (
        (direction === -1 && left <= value) ||
        (direction === 1 && left >= value)
      ) {
        done = true
        left = value
      }

      content[this.vertical ? 'scrollTop' : 'scrollLeft'] = left
      this.__updateArrows()
      return done
    }
  },

  created () {
    this.buffer = []
  },

  beforeDestroy () {
    clearTimeout(this.bufferTimer)
    clearTimeout(this.animateTimer)
  },

  render (h) {
    return h('div', {
      staticClass: 'q-tabs row no-wrap items-center',
      class: this.classes,
      on: this.$listeners,
      attrs: { role: 'tablist' }
    }, [
      h(QResizeObserver, {
        on: { resize: this.__updateContainer }
      }),

      h(QIcon, {
        staticClass: 'q-tabs__arrow q-tabs__arrow--left q-tab__icon',
        class: this.leftArrow ? '' : 'q-tabs__arrow--faded',
        props: { name: this.leftIcon || this.vertical ? this.$q.iconSet.tabs.up : this.$q.iconSet.tabs.left },
        nativeOn: {
          mousedown: this.__scrollToStart,
          touchstart: this.__scrollToStart,
          mouseup: this.__stopAnimScroll,
          mouseleave: this.__stopAnimScroll,
          touchend: this.__stopAnimScroll
        }
      }),

      h('div', {
        ref: 'content',
        staticClass: 'q-tabs__content row no-wrap items-center',
        class: this.alignClass
      }, slot(this, 'default')),

      h(QIcon, {
        staticClass: 'q-tabs__arrow q-tabs__arrow--right q-tab__icon',
        class: this.rightArrow ? '' : 'q-tabs__arrow--faded',
        props: { name: this.rightIcon || this.vertical ? this.$q.iconSet.tabs.down : this.$q.iconSet.tabs.right },
        nativeOn: {
          mousedown: this.__scrollToEnd,
          touchstart: this.__scrollToEnd,
          mouseup: this.__stopAnimScroll,
          mouseleave: this.__stopAnimScroll,
          touchend: this.__stopAnimScroll
        }
      })
    ])
  }
})

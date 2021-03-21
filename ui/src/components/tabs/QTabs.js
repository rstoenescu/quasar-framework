import Vue from 'vue'

import QIcon from '../icon/QIcon.js'
import QResizeObserver from '../resize-observer/QResizeObserver.js'

import TimeoutMixin from '../../mixins/timeout.js'
import ListenersMixin from '../../mixins/listeners.js'

import { stop, noop } from '../../utils/event.js'
import { slot } from '../../utils/slot.js'
import cache from '../../utils/cache.js'
import { isBuggyRTLScroll } from '../../utils/scroll.js'

function getIndicatorClass (color, top, vertical) {
  const pos = vertical === true
    ? ['left', 'right']
    : ['top', 'bottom']

  return `absolute-${top === true ? pos[0] : pos[1]}${color ? ` text-${color}` : ''}`
}

function bufferPrioritySort (t1, t2) {
  if (t1.priorityMatched === t2.priorityMatched) {
    return t2.priorityHref - t1.priorityHref
  }
  return t2.priorityMatched - t1.priorityMatched
}

function bufferCleanSelected (t) {
  t.selected = false
  return t
}

const
  bufferFilters = [
    t => t.selected === true && t.exact === true && t.redirected !== true,
    t => t.selected === true && t.exact === true,
    t => t.selected === true && t.redirected !== true,
    t => t.selected === true,
    t => t.exact === true && t.redirected !== true,
    t => t.redirected !== true,
    t => t.exact === true,
    t => true
  ],
  bufferFiltersLen = bufferFilters.length

export default Vue.extend({
  name: 'QTabs',

  mixins: [ TimeoutMixin, ListenersMixin ],

  provide () {
    return {
      tabs: this.tabs,
      __registerTab: this.__registerTab,
      __unregisterTab: this.__unregisterTab,
      __activateTab: this.__activateTab,
      __activateRoute: this.__activateRoute,
      __focusTab: this.__focusTab,
      __unfocusTab: this.__unfocusTab,
      __onKbdNavigate: this.__onKbdNavigate
    }
  },

  props: {
    value: [Number, String],

    align: {
      type: String,
      default: 'center',
      validator: v => ['left', 'center', 'right', 'justify'].includes(v)
    },
    breakpoint: {
      type: [String, Number],
      default: 600
    },

    vertical: Boolean,
    shrink: Boolean,
    stretch: Boolean,

    activeColor: String,
    activeBgColor: String,
    indicatorColor: String,
    leftIcon: String,
    rightIcon: String,

    outsideArrows: Boolean,
    mobileArrows: Boolean,

    switchIndicator: Boolean,

    narrowIndicator: Boolean,
    inlineLabel: Boolean,
    noCaps: Boolean,

    dense: Boolean,

    contentClass: String
  },

  data () {
    return {
      tabs: {
        current: this.value,
        focused: false,
        hasCurrent: false,
        activeColor: this.activeColor,
        activeBgColor: this.activeBgColor,
        indicatorClass: getIndicatorClass(
          this.indicatorColor,
          this.switchIndicator,
          this.vertical
        ),
        narrowIndicator: this.narrowIndicator,
        inlineLabel: this.inlineLabel,
        noCaps: this.noCaps
      },
      scrollable: false,
      startArrow: true,
      endArrow: false,
      justify: false
    }
  },

  watch: {
    value (name) {
      this.__activateTab(name, true, true)
    },

    activeColor (v) {
      this.tabs.activeColor = v
    },

    activeBgColor (v) {
      this.tabs.activeBgColor = v
    },

    vertical (v) {
      this.tabs.indicatorClass = getIndicatorClass(this.indicatorColor, this.switchIndicator, v)
    },

    indicatorColor (v) {
      this.tabs.indicatorClass = getIndicatorClass(v, this.switchIndicator, this.vertical)
    },

    switchIndicator (v) {
      this.tabs.indicatorClass = getIndicatorClass(this.indicatorColor, v, this.vertical)
    },

    narrowIndicator (v) {
      this.tabs.narrowIndicator = v
    },

    inlineLabel (v) {
      this.tabs.inlineLabel = v
    },

    noCaps (v) {
      this.tabs.noCaps = v
    },

    outsideArrows () {
      this.__recalculateScroll()
    },

    arrowsEnabled (v) {
      this.__updateArrows = v === true
        ? this.__updateArrowsFn
        : noop

      this.__recalculateScroll()
    }
  },

  computed: {
    arrowsEnabled () {
      return this.$q.platform.is.desktop === true || this.mobileArrows === true
    },

    arrowIcons () {
      const sides = this.vertical === true || this.$q.lang.rtl !== true
        ? [ 'start', 'end' ]
        : [ 'end', 'start' ]

      return {
        [sides[0]]: this.leftIcon || (this.vertical === true ? this.$q.iconSet.tabs.up : this.$q.iconSet.tabs.left),
        [sides[1]]: this.rightIcon || (this.vertical === true ? this.$q.iconSet.tabs.down : this.$q.iconSet.tabs.right)
      }
    },

    alignClass () {
      const align = this.scrollable === true
        ? 'left'
        : (this.justify === true ? 'justify' : this.align)

      return `q-tabs__content--align-${align}`
    },

    classes () {
      return `q-tabs--${this.scrollable === true ? '' : 'not-'}scrollable` +
        ` q-tabs--${this.vertical === true ? 'vertical' : 'horizontal'}` +
        ` q-tabs__arrows--${this.arrowsEnabled === true && this.outsideArrows === true ? 'outside' : 'inside'}` +
        (this.dense === true ? ' q-tabs--dense' : '') +
        (this.shrink === true ? ' col-shrink' : '') +
        (this.stretch === true ? ' self-stretch' : '')
    },

    innerClass () {
      return this.alignClass +
        (this.contentClass !== void 0 ? ` ${this.contentClass}` : '') +
        (this.$q.platform.is.mobile === true ? ' scroll' : '')
    },

    domProps () {
      return this.vertical === true
        ? { container: 'height', content: 'offsetHeight', scroll: 'scrollHeight' }
        : { container: 'width', content: 'offsetWidth', scroll: 'scrollWidth' }
    },

    onEvents () {
      return {
        input: stop,
        ...this.qListeners
      }
    }
  },

  methods: {
    __activateTab (name, setCurrent, skipEmit) {
      if (this.tabs.current !== name) {
        skipEmit !== true && this.$emit('input', name)
        if (setCurrent === true || this.qListeners.input === void 0) {
          this.__animate(this.tabs.current, name)
          this.tabs.current = name
          this.tabs.hasCurrent = this.tabNames.indexOf(name) > -1
        }
      }
    },

    __activateRoute (params) {
      if (this.bufferRoute !== this.$route && this.buffer.length > 0) {
        clearTimeout(this.bufferTimer)
        this.bufferTimer = void 0
        this.buffer.length = 0
      }
      this.bufferRoute = this.$route

      if (params !== void 0) {
        if (params.remove === true) {
          this.buffer = this.buffer.filter(t => t.name !== params.name)
        }
        else {
          this.buffer.push(params)
        }
      }

      if (this.bufferTimer === void 0) {
        this.bufferTimer = setTimeout(() => {
          let tabs = []

          for (let i = 0; i < bufferFiltersLen && tabs.length === 0; i++) {
            tabs = this.buffer.filter(bufferFilters[i])
          }

          tabs.sort(bufferPrioritySort)
          this.__activateTab(tabs.length === 0 ? null : tabs[0].name, true)
          this.buffer = this.buffer.map(bufferCleanSelected)
          this.bufferTimer = void 0
        }, 1)
      }
    },

    __recalculateScroll () {
      this.__nextTick(() => {
        this._isDestroyed !== true && this.__updateContainer({
          width: this.$el.offsetWidth,
          height: this.$el.offsetHeight
        })
      })

      this.__prepareTick()
    },

    __updateContainer (domSize) {
      const
        size = domSize[this.domProps.container],
        scrollSize = Math.min(
          this.$refs.content[this.domProps.scroll],
          Array.prototype.reduce.call(
            this.$refs.content.children,
            (acc, el) => acc + el[this.domProps.content],
            0
          )
        ),
        scroll = size > 0 && scrollSize > size // when there is no tab, in Chrome, size === 0 and scrollSize === 1

      if (this.scrollable !== scroll) {
        this.scrollable = scroll
      }

      // Arrows need to be updated even if the scroll status was already true
      scroll === true && this.$nextTick(() => this.__updateArrows())

      const justify = size < parseInt(this.breakpoint, 10)

      if (this.justify !== justify) {
        this.justify = justify
      }
    },

    __getScrollPosition (el) {
      if (this.vertical === true) {
        return el.scrollTop
      }
      return this.$q.lang.rtl !== true
        ? el.scrollLeft
        : (this.isBuggyRTLScroll === true ? el.scrollWidth - el.clientWidth : 1) - el.scrollLeft
    },

    __getScrollOffset (el) {
      if (this.vertical === true) {
        return el.offsetTop
      }
      return this.$q.lang.rtl !== true || this.isBuggyRTLScroll === true
        ? el.offsetLeft
        : el.offsetParent.offsetWidth - el.offsetLeft - el.clientWidth
    },

    __setScrollPosition (el, value) {
      if (this.vertical === true) {
        el.scrollTop = value
      }
      else {
        el.scrollLeft = this.$q.lang.rtl !== true
          ? value
          : (this.isBuggyRTLScroll === true ? el.scrollWidth - el.clientWidth : 1) - value
      }
    },

    __animate (oldName, newName) {
      const
        oldTab = oldName !== void 0 && oldName !== null && oldName !== ''
          ? this.$children.find(tab => tab.name === oldName)
          : null,
        newTab = newName !== void 0 && newName !== null && newName !== ''
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

        newEl.style.transform = this.vertical === true
          ? `translate3d(0,${oldPos.top - newPos.top}px,0) scale3d(1,${newPos.height ? oldPos.height / newPos.height : 1},1)`
          : `translate3d(${oldPos.left - newPos.left}px,0,0) scale3d(${newPos.width ? oldPos.width / newPos.width : 1},1,1)`

        // allow scope updates to kick in (QRouteTab needs more time)
        this.$nextTick(() => {
          this.animateTimer = setTimeout(() => {
            newEl.style.transition = 'transform .25s cubic-bezier(.4, 0, .2, 1)'
            newEl.style.transform = 'none'
          }, 70)
        })
      }

      if (newTab && this.scrollable === true) {
        this.__scrollToTab(newTab.$el, void 0, true)
      }
      else {
        this.__updateArrows()
      }
    },

    __updateArrowsFn () {
      const { content } = this.$refs

      if (content !== void 0) {
        const
          rect = content.getBoundingClientRect(),
          pos = this.__getScrollPosition(content)

        this.startArrow = pos > (this.vertical === true || this.$q.lang.rtl !== true ? 0 : 1)
        this.endArrow = this.vertical === true
          ? Math.ceil(pos + rect.height) < content.scrollHeight
          : Math.ceil(pos + rect.width) < content.scrollWidth
      }
    },

    __animScrollTo (value, onEnd) {
      this.__stopAnimScroll()

      this.__onAnimScrollEnd = onEnd
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
      this.__animScrollTo(Number.MAX_SAFE_INTEGER)
    },

    __stopAnimScroll () {
      clearInterval(this.scrollTimer)

      if (this.__onAnimScrollEnd !== void 0) {
        this.__onAnimScrollEnd()
        this.__onAnimScrollEnd = void 0
      }
    },

    __scrollTowards (value) {
      const content = this.$refs.content
      const max = this.vertical === true ? content.scrollHeight - content.offsetHeight : content.scrollWidth - content.offsetWidth

      let pos = this.__getScrollPosition(content)
      let done = false

      value = Math.max(0, Math.min(max, value))

      const direction = value < pos ? -1 : 1

      pos += direction * 5
      if (
        (direction === -1 && pos <= value) ||
        (direction === 1 && pos >= value)
      ) {
        done = true
        pos = value
      }

      this.__setScrollPosition(content, pos)
      this.__updateArrows()

      return done
    },

    __scrollToTab (tab, alignEnd, skipFocus) {
      if (this.$refs.content === void 0) {
        return
      }

      const content = this.$refs.content
      const startContent = this.__getScrollPosition(content)
      const sizeContent = this.vertical === true ? content.offsetHeight : content.offsetWidth
      const sizeScroll = this.vertical === true ? content.scrollHeight : content.scrollWidth

      const startTab = this.__getScrollOffset(tab)
      const endTab = startTab + (this.vertical === true ? tab.offsetHeight : tab.offsetWidth)

      const startsBefore = startTab < startContent
      const endsAfter = endTab > startContent + sizeContent

      if (startsBefore !== true && endsAfter !== true) {
        alignEnd = void 0
      }
      else if (alignEnd === void 0) {
        if (endTab >= sizeScroll - 1) {
          alignEnd = true
        }
        else if (startsBefore === true || (endsAfter === true && startTab < endTab - sizeContent)) {
          alignEnd = false
        }
        else if (startsBefore !== endsAfter) {
          alignEnd = endsAfter
        }
      }

      if (alignEnd !== void 0) {
        this.__animScrollTo(
          alignEnd === true ? (endTab >= sizeScroll - 1 ? sizeScroll : endTab - sizeContent) : (startTab <= 1 ? 0 : startTab),
          skipFocus !== true
            ? () => {
              setTimeout(() => {
                tab && tab.focus()
              })
            }
            : void 0
        )
      }
      else if (skipFocus !== true) {
        tab.focus()
      }
    },

    __focusTab (tab) {
      if (this.tabs.focused !== true) {
        this.tabs.focused = true

        this.__scrollToTab(tab, void 0, true)
        this.__recalculateScroll()
      }
    },

    __unfocusTab () {
      if (this.tabs.focused !== false) {
        this.tabs.focused = false
      }
    },

    __onKbdNavigate (keyCode, fromEl) {
      const matchTab = el => el === fromEl || el.matches('.q-tab.q-focusable') === true
      const tabs = Array.prototype.filter.call(this.$refs.content.children, matchTab)
      const tabsLength = tabs.length

      if (tabsLength === 0) {
        return
      }

      if (keyCode === 36) { // Home
        if (tabs[0].contains(document.activeElement) === true) {
          return false
        }

        this.__scrollToTab(tabs[0], false)
        this.__recalculateScroll()

        return true
      }
      if (keyCode === 35) { // End
        if (tabs[tabsLength - 1].contains(document.activeElement) === true) {
          return false
        }

        this.__scrollToTab(tabs[tabsLength - 1], true)
        this.__recalculateScroll()

        return true
      }

      const dirPrev = (this.vertical === true && keyCode === 38 /* ArrowUp */) ||
        (this.vertical !== true && keyCode === 37 /* ArrowLeft */)
      const dirNext = (this.vertical === true && keyCode === 40 /* ArrowDown */) ||
        (this.vertical !== true && keyCode === 39 /* ArrowRight */)
      const dir = dirPrev === true ? -1 : (dirNext === true ? 1 : void 0)

      if (dir !== void 0) {
        const rtlDir = this.vertical !== true && this.$q.lang.rtl === true ? -1 : 1
        const index = tabs.indexOf(fromEl) + dir * rtlDir

        if (
          index < 0 ||
          index >= tabsLength ||
          tabs[index].contains(document.activeElement) === true
        ) {
          return false
        }

        this.__scrollToTab(tabs[index], dir === rtlDir)
        this.__recalculateScroll()

        return true
      }
    },

    __registerTab (name) {
      if (this.tabNames.indexOf(name) === -1) {
        this.tabNames.push(name)
        this.tabs.hasCurrent = this.tabNames.indexOf(this.tabs.current) > -1
      }
      this.__recalculateScroll()
    },

    __unregisterTab (name) {
      const index = this.tabNames.indexOf(name)
      if (index > -1) {
        this.tabNames.splice(index, 1)
        this.tabs.hasCurrent = this.tabNames.indexOf(this.tabs.current) > -1
      }
      this.__recalculateScroll()
    }
  },

  activated () {
    this.__recalculateScroll()
  },

  created () {
    this.buffer = []
    this.tabNames = []

    this.__updateArrows = this.arrowsEnabled === true
      ? this.__updateArrowsFn
      : noop
  },

  mounted () {
    this.isBuggyRTLScroll = isBuggyRTLScroll()
  },

  beforeDestroy () {
    clearTimeout(this.bufferTimer)
    clearTimeout(this.animateTimer)
  },

  render (h) {
    const child = [
      h(QResizeObserver, {
        on: cache(this, 'resize', { resize: this.__updateContainer })
      }),

      h('div', {
        ref: 'content',
        staticClass: 'q-tabs__content row no-wrap items-center self-stretch hide-scrollbar relative-position',
        class: this.innerClass,
        on: this.arrowsEnabled === true ? cache(this, 'scroll', { scroll: this.__updateArrowsFn }) : void 0
      }, slot(this, 'default'))
    ]

    this.arrowsEnabled === true && child.push(
      h(QIcon, {
        staticClass: 'q-tabs__arrow q-tabs__arrow--start absolute q-tab__icon',
        class: this.startArrow === true ? '' : 'q-tabs__arrow--faded',
        props: { name: this.arrowIcons.start },
        on: cache(this, 'onS', {
          mousedown: this.__scrollToStart,
          touchstart: this.__scrollToStart,
          mouseup: this.__stopAnimScroll,
          mouseleave: this.__stopAnimScroll,
          touchend: this.__stopAnimScroll
        })
      }),

      h(QIcon, {
        staticClass: 'q-tabs__arrow q-tabs__arrow--end absolute q-tab__icon',
        class: this.endArrow === true ? '' : 'q-tabs__arrow--faded',
        props: { name: this.arrowIcons.end },
        on: cache(this, 'onE', {
          mousedown: this.__scrollToEnd,
          touchstart: this.__scrollToEnd,
          mouseup: this.__stopAnimScroll,
          mouseleave: this.__stopAnimScroll,
          touchend: this.__stopAnimScroll
        })
      })
    )

    return h('div', {
      staticClass: 'q-tabs row no-wrap items-center',
      class: this.classes,
      on: this.onEvents,
      attrs: { role: 'tablist' }
    }, child)
  }
})

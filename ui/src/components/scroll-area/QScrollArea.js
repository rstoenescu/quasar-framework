import Vue from 'vue'

import { between } from '../../utils/format.js'
import { setScrollPosition, setHorizontalScrollPosition } from '../../utils/scroll.js'
import { mergeSlot } from '../../utils/slot.js'
import cache from '../../utils/cache.js'
import debounce from '../../utils/debounce.js'

import QResizeObserver from '../resize-observer/QResizeObserver.js'
import QScrollObserver from '../scroll-observer/QScrollObserver.js'
import TouchPan from '../../directives/TouchPan.js'
import DarkMixin from '../../mixins/dark.js'
import { ariaHidden } from '../../mixins/attrs'

export default Vue.extend({
  name: 'QScrollArea',

  mixins: [ DarkMixin ],

  directives: {
    TouchPan
  },

  props: {
    barStyle: [ Array, String, Object ],
    thumbStyle: Object,
    contentStyle: [ Array, String, Object ],
    contentActiveStyle: [ Array, String, Object ],

    delay: {
      type: [String, Number],
      default: 1000
    },

    visible: {
      type: Boolean,
      default: null
    },

    horizontal: Boolean,

    tabindex: [String, Number]
  },

  data () {
    return {
      // state management
      tempShowing: false,
      panning: false,
      hover: false,

      // other...
      containerWidth: 0,
      containerHeight: 0,
      scrollPosition: 0,
      scrollSize: 0
    }
  },

  computed: {
    classes () {
      return 'q-scrollarea' +
        ` q-scrollarea--${this.darkSuffix}`
    },

    thumbHidden () {
      return (
        (this.visible === null ? this.hover : this.visible) !== true &&
        this.tempShowing === false &&
        this.panning === false
      ) || this.scrollSize <= this.containerSize
    },

    thumbSize () {
      return Math.round(
        between(
          this.containerSize * this.containerSize / this.scrollSize,
          50,
          this.containerSize
        )
      )
    },

    style () {
      const pos = this.scrollPercentage * (this.containerSize - this.thumbSize)
      return Object.assign(
        {},
        this.thumbStyle,
        this.horizontal === true
          ? {
            left: `${pos}px`,
            width: `${this.thumbSize}px`
          }
          : {
            top: `${pos}px`,
            height: `${this.thumbSize}px`
          }
      )
    },

    mainStyle () {
      return this.thumbHidden === true
        ? this.contentStyle
        : this.contentActiveStyle
    },

    scrollPercentage () {
      const p = between(this.scrollPosition / (this.scrollSize - this.containerSize), 0, 1)
      return Math.round(p * 10000) / 10000
    },

    containerSize () {
      return this[`container${this.dirProps.suffix}`]
    },

    dirProps () {
      return this.horizontal === true
        ? { prefix: 'horizontal', suffix: 'Width', scroll: 'scrollLeft', classSuffix: 'h absolute-bottom', dir: 'right', dist: 'x' }
        : { prefix: 'vertical', suffix: 'Height', scroll: 'scrollTop', classSuffix: 'v absolute-right', dir: 'down', dist: 'y' }
    },

    thumbClass () {
      return `q-scrollarea__thumb--${this.dirProps.classSuffix}` +
        (this.thumbHidden === true ? ' q-scrollarea__thumb--invisible' : '')
    },

    barClass () {
      return `q-scrollarea__bar--${this.dirProps.classSuffix}` +
        (this.thumbHidden === true ? ' q-scrollarea__bar--invisible' : '')
    },

    thumbDirectives () {
      return [{
        name: 'touch-pan',
        modifiers: {
          [ this.horizontal === true ? 'horizontal' : 'vertical' ]: true,
          prevent: true,
          mouse: true,
          mouseAllDir: true
        },
        value: this.__panThumb
      }]
    },

    scrollAttrs () {
      if (this.tabindex !== void 0) {
        return { tabindex: this.tabindex }
      }
    }
  },

  methods: {
    getScrollTarget () {
      return this.$refs.target
    },

    getScrollPosition () {
      return this.scrollPosition
    },

    setScrollPosition (offset, duration) {
      const fn = this.horizontal === true
        ? setHorizontalScrollPosition
        : setScrollPosition

      fn(this.$refs.target, offset, duration)
    },

    setScrollPercentage (percentage, duration) {
      this.setScrollPosition(
        percentage * (this.scrollSize - this.containerSize),
        duration
      )
    },

    __updateContainer ({ height, width }) {
      let change = false

      if (this.containerWidth !== width) {
        this.containerWidth = width
        change = true
      }

      if (this.containerHeight !== height) {
        this.containerHeight = height
        change = true
      }

      change === true && this.__startTimer()
    },

    __updateScroll (info) {
      if (this.scrollPosition !== info.position) {
        this.scrollPosition = info.position
        this.__startTimer()
      }
    },

    __updateScrollSize ({ height, width }) {
      if (this.horizontal === true) {
        if (this.scrollSize !== width) {
          this.scrollSize = width
          this.__startTimer()
        }
      }
      else if (this.scrollSize !== height) {
        this.scrollSize = height
        this.__startTimer()
      }
    },

    __panThumb (e) {
      if (e.isFirst === true) {
        if (this.thumbHidden === true) {
          return
        }

        this.refPos = this.scrollPosition
        this.panning = true
      }
      else if (this.panning !== true) {
        return
      }

      if (e.isFinal === true) {
        this.panning = false
      }

      const multiplier = (this.scrollSize - this.containerSize) / (this.containerSize - this.thumbSize)
      const distance = e.distance[this.dirProps.dist]
      const pos = this.refPos + (e.direction === this.dirProps.dir ? 1 : -1) * distance * multiplier

      this.__setScroll(pos)
    },

    __mouseDown (evt) {
      if (this.thumbHidden !== true) {
        const pos = evt[`offset${this.horizontal === true ? 'X' : 'Y'}`] - this.thumbSize / 2
        this.__setScroll(pos / this.containerSize * this.scrollSize)

        // activate thumb pan
        if (this.$refs.thumb !== void 0) {
          this.$refs.thumb.dispatchEvent(new MouseEvent(evt.type, evt))
        }
      }
    },

    __startTimer () {
      if (this.tempShowing === true) {
        clearTimeout(this.timer)
      }
      else {
        this.tempShowing = true
      }

      this.timer = setTimeout(() => {
        this.tempShowing = false
      }, this.delay)

      this.__emitScroll()
    },

    __setScroll (offset) {
      this.$refs.target[this.dirProps.scroll] = offset
    }
  },

  render (h) {
    return h('div', {
      class: this.classes,
      on: cache(this, 'desk', {
        mouseenter: () => { this.hover = true },
        mouseleave: () => { this.hover = false }
      })
    }, [
      h('div', {
        ref: 'target',
        staticClass: 'scroll relative-position fit hide-scrollbar',
        attrs: this.scrollAttrs
      }, [
        h('div', {
          staticClass: 'absolute',
          style: this.mainStyle,
          class: `full-${this.horizontal === true ? 'height' : 'width'}`
        }, mergeSlot([
          h(QResizeObserver, {
            on: cache(this, 'resizeIn', { resize: this.__updateScrollSize })
          })
        ], this, 'default')),

        h(QScrollObserver, {
          props: { horizontal: this.horizontal },
          on: cache(this, 'scroll', { scroll: this.__updateScroll })
        })
      ]),

      h(QResizeObserver, {
        on: cache(this, 'resizeOut', { resize: this.__updateContainer })
      }),

      h('div', {
        staticClass: 'q-scrollarea__bar',
        style: this.barStyle,
        class: this.barClass,
        attrs: ariaHidden,
        on: cache(this, 'bar', {
          mousedown: this.__mouseDown
        })
      }),

      h('div', {
        ref: 'thumb',
        staticClass: 'q-scrollarea__thumb',
        style: this.style,
        class: this.thumbClass,
        attrs: ariaHidden,
        directives: this.thumbDirectives
      })
    ])
  },

  created () {
    // we have lots of listeners, so
    // ensure we're not emitting same info
    // multiple times
    this.__emitScroll = debounce(() => {
      if (this.$listeners.scroll !== void 0) {
        const info = { ref: this }
        const prefix = this.dirProps.prefix

        info[prefix + 'Position'] = this.scrollPosition
        info[prefix + 'Percentage'] = this.scrollPercentage
        info[prefix + 'Size'] = this.scrollSize
        info[prefix + 'ContainerSize'] = this.containerSize

        this.$emit('scroll', info)
      }
    }, 0)
  }
})

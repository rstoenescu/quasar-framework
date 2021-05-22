import debounce from '../utils/debounce.js'
import { isBuggyRTLScroll } from '../utils/scroll.js'

const aggBucketSize = 1000

const scrollToEdges = [
  'start',
  'center',
  'end',
  'start-force',
  'center-force',
  'end-force'
]

const slice = Array.prototype.slice

function sumFn (acc, h) {
  return acc + h
}

function getScrollDetails (
  parent,
  child,
  beforeRef,
  afterRef,
  horizontal,
  rtl,
  stickyStart,
  stickyEnd
) {
  const
    parentCalc = parent === window ? document.scrollingElement || document.documentElement : parent,
    propElSize = horizontal === true ? 'offsetWidth' : 'offsetHeight',
    details = {
      scrollStart: 0,
      scrollViewSize: -stickyStart - stickyEnd,
      scrollMaxSize: 0,
      offsetStart: -stickyStart,
      offsetEnd: -stickyEnd
    }

  if (horizontal === true) {
    if (parent === window) {
      details.scrollStart = window.pageXOffset || window.scrollX || document.body.scrollLeft || 0
      details.scrollViewSize += document.documentElement.clientWidth
    }
    else {
      details.scrollStart = parentCalc.scrollLeft
      details.scrollViewSize += parentCalc.clientWidth
    }
    details.scrollMaxSize = parentCalc.scrollWidth

    if (rtl === true) {
      details.scrollStart = (isBuggyRTLScroll() === true ? details.scrollMaxSize - details.scrollViewSize : 0) - details.scrollStart
    }
  }
  else {
    if (parent === window) {
      details.scrollStart = window.pageYOffset || window.scrollY || document.body.scrollTop || 0
      details.scrollViewSize += document.documentElement.clientHeight
    }
    else {
      details.scrollStart = parentCalc.scrollTop
      details.scrollViewSize += parentCalc.clientHeight
    }
    details.scrollMaxSize = parentCalc.scrollHeight
  }

  if (beforeRef !== void 0) {
    for (let el = beforeRef.previousElementSibling; el !== null; el = el.previousElementSibling) {
      if (el.classList.contains('q-virtual-scroll--skip') === false) {
        details.offsetStart += el[propElSize]
      }
    }
  }
  if (afterRef !== void 0) {
    for (let el = afterRef.nextElementSibling; el !== null; el = el.nextElementSibling) {
      if (el.classList.contains('q-virtual-scroll--skip') === false) {
        details.offsetEnd += el[propElSize]
      }
    }
  }

  if (child !== parent) {
    const
      parentRect = parentCalc.getBoundingClientRect(),
      childRect = child.getBoundingClientRect()

    if (horizontal === true) {
      details.offsetStart += childRect.left - parentRect.left
      details.offsetEnd -= childRect.width
    }
    else {
      details.offsetStart += childRect.top - parentRect.top
      details.offsetEnd -= childRect.height
    }

    if (parent !== window) {
      details.offsetStart += details.scrollStart
    }
    details.offsetEnd += details.scrollMaxSize - details.offsetStart
  }

  return details
}

function setScroll (parent, scroll, horizontal, rtl) {
  if (parent === window) {
    if (horizontal === true) {
      if (rtl === true) {
        scroll = (isBuggyRTLScroll() === true ? document.body.scrollWidth - document.documentElement.clientWidth : 0) - scroll
      }
      window.scrollTo(scroll, window.pageYOffset || window.scrollY || document.body.scrollTop || 0)
    }
    else {
      window.scrollTo(window.pageXOffset || window.scrollX || document.body.scrollLeft || 0, scroll)
    }
  }
  else if (horizontal === true) {
    if (rtl === true) {
      scroll = (isBuggyRTLScroll() === true ? parent.scrollWidth - parent.offsetWidth : 0) - scroll
    }
    parent.scrollLeft = scroll
  }
  else {
    parent.scrollTop = scroll
  }
}

function sumSize (sizeAgg, size, from, to) {
  if (from >= to) { return 0 }

  const
    lastTo = size.length,
    fromAgg = Math.floor(from / aggBucketSize),
    toAgg = Math.floor((to - 1) / aggBucketSize) + 1

  let total = sizeAgg.slice(fromAgg, toAgg).reduce(sumFn, 0)

  if (from % aggBucketSize !== 0) {
    total -= size.slice(fromAgg * aggBucketSize, from).reduce(sumFn, 0)
  }
  if (to % aggBucketSize !== 0 && to !== lastTo) {
    total -= size.slice(to, toAgg * aggBucketSize).reduce(sumFn, 0)
  }

  return total
}

const commonVirtScrollProps = {
  virtualScrollSliceSize: {
    type: [ Number, String ],
    default: null
  },

  virtualScrollSliceRatioBefore: {
    type: [ Number, String ],
    default: 1
  },

  virtualScrollSliceRatioAfter: {
    type: [ Number, String ],
    default: 1
  },

  virtualScrollItemSize: {
    type: [ Number, String ],
    default: 24
  },

  virtualScrollStickySizeStart: {
    type: [ Number, String ],
    default: 0
  },

  virtualScrollStickySizeEnd: {
    type: [ Number, String ],
    default: 0
  },

  tableColspan: [ Number, String ]
}

let id = 1

function setOverflowAnchor (id, index) {
  if (setOverflowAnchor.isSupported === void 0) {
    setOverflowAnchor.isSupported = window.getComputedStyle(document.body).overflowAnchor !== void 0
  }

  if (setOverflowAnchor.isSupported === false) {
    return
  }

  const ssId = id + '_ss'

  let styleSheet = document.getElementById(ssId)

  if (styleSheet === null) {
    styleSheet = document.createElement('style')
    styleSheet.type = 'text/css'
    styleSheet.id = ssId
    document.head.appendChild(styleSheet)
  }

  if (styleSheet.qChildIndex !== index) {
    styleSheet.qChildIndex = index
    styleSheet.innerHTML = `#${id} > *:nth-child(${index}) { overflow-anchor: auto }`
  }
}

export const commonVirtPropsList = Object.keys(commonVirtScrollProps)

export default {
  props: {
    virtualScrollHorizontal: Boolean,
    ...commonVirtScrollProps
  },

  data () {
    return {
      virtualScrollSliceRange: { from: 0, to: 0 },
      id: 'qvs_' + id++
    }
  },

  watch: {
    needsSliceRecalc () {
      this.__setVirtualScrollSize()
    },

    needsReset () {
      this.reset()
    }
  },

  computed: {
    needsReset () {
      return ['virtualScrollItemSizeComputed', 'virtualScrollHorizontal']
        .map(p => this[p]).join(';')
    },

    needsSliceRecalc () {
      return this.needsReset + ';' + ['virtualScrollSliceRatioBefore', 'virtualScrollSliceRatioAfter']
        .map(p => this[p]).join(';')
    },

    colspanAttr () {
      return this.tableColspan !== void 0
        ? { colspan: this.tableColspan }
        : { colspan: 100 }
    },

    virtualScrollItemSizeComputed () {
      return this.virtualScrollItemSize
    }
  },

  methods: {
    reset () {
      this.__resetVirtualScroll(this.prevToIndex, true)
    },

    refresh (toIndex) {
      this.__resetVirtualScroll(toIndex === void 0 ? this.prevToIndex : toIndex)
    },

    scrollTo (toIndex, edge) {
      const scrollEl = this.__getVirtualScrollTarget()

      if (scrollEl === void 0 || scrollEl === null || scrollEl.nodeType === 8) {
        return
      }

      const scrollDetails = getScrollDetails(
        scrollEl,
        this.__getVirtualScrollEl(),
        this.$refs.before,
        this.$refs.after,
        this.virtualScrollHorizontal,
        this.$q.lang.rtl,
        this.virtualScrollStickySizeStart,
        this.virtualScrollStickySizeEnd
      )

      this.__scrollViewSize !== scrollDetails.scrollViewSize && this.__setVirtualScrollSize(scrollDetails.scrollViewSize)

      this.__setVirtualScrollSliceRange(
        scrollEl,
        scrollDetails,
        Math.min(this.virtualScrollLength - 1, Math.max(0, parseInt(toIndex, 10) || 0)),
        0,
        scrollToEdges.indexOf(edge) > -1 ? edge : (this.prevToIndex > -1 && toIndex > this.prevToIndex ? 'end' : 'start')
      )
    },

    __onVirtualScrollEvt () {
      const scrollEl = this.__getVirtualScrollTarget()

      if (scrollEl === void 0 || scrollEl === null || scrollEl.nodeType === 8) {
        return
      }

      const
        scrollDetails = getScrollDetails(
          scrollEl,
          this.__getVirtualScrollEl(),
          this.$refs.before,
          this.$refs.after,
          this.virtualScrollHorizontal,
          this.$q.lang.rtl,
          this.virtualScrollStickySizeStart,
          this.virtualScrollStickySizeEnd
        ),
        listLastIndex = this.virtualScrollLength - 1,
        listEndOffset = scrollDetails.scrollMaxSize - scrollDetails.offsetStart - scrollDetails.offsetEnd - this.virtualScrollPaddingAfter

      if (this.prevScrollStart === scrollDetails.scrollStart) {
        return
      }

      if (scrollDetails.scrollMaxSize <= 0) {
        this.__setVirtualScrollSliceRange(scrollEl, scrollDetails, 0, 0)

        return
      }

      this.__scrollViewSize !== scrollDetails.scrollViewSize && this.__setVirtualScrollSize(scrollDetails.scrollViewSize)

      this.__updateVirtualScrollSizes(this.virtualScrollSliceRange.from)

      const scrollMaxStart = Math.floor(scrollDetails.scrollMaxSize -
        Math.max(scrollDetails.scrollViewSize, scrollDetails.offsetEnd) -
        Math.min(this.virtualScrollSizes[listLastIndex], scrollDetails.scrollViewSize / 2))

      if (scrollMaxStart > 0 && Math.ceil(scrollDetails.scrollStart) >= scrollMaxStart) {
        this.__setVirtualScrollSliceRange(
          scrollEl,
          scrollDetails,
          listLastIndex,
          scrollDetails.scrollMaxSize - scrollDetails.offsetEnd - this.virtualScrollSizesAgg.reduce(sumFn, 0)
        )

        return
      }

      let
        toIndex = 0,
        listOffset = scrollDetails.scrollStart - scrollDetails.offsetStart,
        offset = listOffset

      if (listOffset <= listEndOffset && listOffset + scrollDetails.scrollViewSize >= this.virtualScrollPaddingBefore) {
        listOffset -= this.virtualScrollPaddingBefore
        toIndex = this.virtualScrollSliceRange.from
        offset = listOffset
      }
      else {
        for (let j = 0; listOffset >= this.virtualScrollSizesAgg[j] && toIndex < listLastIndex; j++) {
          listOffset -= this.virtualScrollSizesAgg[j]
          toIndex += aggBucketSize
        }
      }

      while (listOffset > 0 && toIndex < listLastIndex) {
        listOffset -= this.virtualScrollSizes[toIndex]
        if (listOffset > -scrollDetails.scrollViewSize) {
          toIndex++
          offset = listOffset
        }
        else {
          offset = this.virtualScrollSizes[toIndex] + listOffset
        }
      }

      this.__setVirtualScrollSliceRange(
        scrollEl,
        scrollDetails,
        toIndex,
        offset
      )
    },

    __setVirtualScrollSliceRange (scrollEl, scrollDetails, toIndex, offset, align) {
      const alignForce = typeof align === 'string' && align.indexOf('-force') > -1
      const alignEnd = alignForce === true ? align.replace('-force', '') : align
      const alignRange = alignEnd !== void 0 ? alignEnd : 'start'

      let
        from = Math.max(0, toIndex - this.virtualScrollSliceSizeComputed[alignRange]),
        to = from + this.virtualScrollSliceSizeComputed.total

      if (to > this.virtualScrollLength) {
        to = this.virtualScrollLength
        from = Math.max(0, to - this.virtualScrollSliceSizeComputed.total)
      }

      this.prevScrollStart = scrollDetails.scrollStart

      const rangeChanged = from !== this.virtualScrollSliceRange.from || to !== this.virtualScrollSliceRange.to

      if (rangeChanged === false && alignEnd === void 0) {
        this.__emitScroll(toIndex)

        return
      }

      const { activeElement } = document
      if (
        rangeChanged === true &&
        this.$refs.content !== void 0 &&
        this.$refs.content !== activeElement &&
        this.$refs.content.contains(activeElement) === true
      ) {
        const onBlurFn = () => {
          this.$refs.content.focus()
        }

        activeElement.addEventListener('blur', onBlurFn, true)

        requestAnimationFrame(() => {
          activeElement.removeEventListener('blur', onBlurFn, true)
        })
      }

      setOverflowAnchor(this.id, toIndex - from + 1)

      const sizeBefore = alignEnd !== void 0 ? this.virtualScrollSizes.slice(from, toIndex).reduce(sumFn, 0) : 0

      if (rangeChanged === true) {
        // vue key matching algorithm works only if
        // the array of VNodes changes on only one of the ends
        // so we first change one end and then the other

        const tempTo = to >= this.virtualScrollSliceRange.from && from <= this.virtualScrollSliceRange.to
          ? this.virtualScrollSliceRange.to
          : to
        this.virtualScrollSliceRange = { from, to: tempTo }
        this.virtualScrollPaddingBefore = sumSize(this.virtualScrollSizesAgg, this.virtualScrollSizes, 0, from)
        this.virtualScrollPaddingAfter = sumSize(this.virtualScrollSizesAgg, this.virtualScrollSizes, this.virtualScrollSliceRange.to, this.virtualScrollLength)

        requestAnimationFrame(() => {
          if (this.virtualScrollSliceRange.to !== to && this.prevScrollStart === scrollDetails.scrollStart) {
            this.virtualScrollSliceRange = { from: this.virtualScrollSliceRange.from, to }
            this.virtualScrollPaddingAfter = sumSize(this.virtualScrollSizesAgg, this.virtualScrollSizes, to, this.virtualScrollLength)
          }
        })
      }

      requestAnimationFrame(() => {
        // if the scroll was changed give up
        // (another call to __setVirtualScrollSliceRange before animation frame)
        if (this.prevScrollStart !== scrollDetails.scrollStart) {
          return
        }

        if (rangeChanged === true) {
          this.__updateVirtualScrollSizes(from)
        }

        const
          sizeAfter = this.virtualScrollSizes.slice(from, toIndex).reduce(sumFn, 0),
          posStart = sizeAfter + scrollDetails.offsetStart + this.virtualScrollPaddingBefore,
          posEnd = posStart + this.virtualScrollSizes[toIndex]

        let scrollPosition = posStart + offset

        if (alignEnd !== void 0) {
          const sizeDiff = sizeAfter - sizeBefore
          const scrollStart = scrollDetails.scrollStart + sizeDiff

          scrollPosition = alignForce !== true && scrollStart < posStart && posEnd < scrollStart + scrollDetails.scrollViewSize
            ? scrollStart
            : (
              alignEnd === 'end'
                ? posEnd - scrollDetails.scrollViewSize
                : posStart - (alignEnd === 'start' ? 0 : Math.round((scrollDetails.scrollViewSize - this.virtualScrollSizes[toIndex]) / 2))
            )
        }

        this.prevScrollStart = scrollPosition

        setScroll(
          scrollEl,
          scrollPosition,
          this.virtualScrollHorizontal,
          this.$q.lang.rtl
        )

        this.__emitScroll(toIndex)
      })
    },

    __updateVirtualScrollSizes (from) {
      const contentEl = this.$refs.content

      if (contentEl !== void 0) {
        const
          children = slice.call(contentEl.children || []).filter(el => el.classList.contains('q-virtual-scroll--skip') === false), // fallback [] for IE
          childrenLength = children.length,
          sizeFn = this.virtualScrollHorizontal === true
            ? el => el.getBoundingClientRect().width
            : el => el.offsetHeight

        let
          index = from,
          size, diff

        for (let i = 0; i < childrenLength;) {
          size = sizeFn(children[i])
          i++

          while (i < childrenLength && children[i].classList.contains('q-virtual-scroll--with-prev') === true) {
            size += sizeFn(children[i])
            i++
          }

          diff = size - this.virtualScrollSizes[index]

          if (diff !== 0) {
            this.virtualScrollSizes[index] += diff
            this.virtualScrollSizesAgg[Math.floor(index / aggBucketSize)] += diff
          }

          index++
        }
      }
    },

    __resetVirtualScroll (toIndex, fullReset) {
      const defaultSize = 1 * this.virtualScrollItemSizeComputed

      if (fullReset === true || Array.isArray(this.virtualScrollSizes) === false) {
        this.virtualScrollSizes = []
      }

      const oldVirtualScrollSizesLength = this.virtualScrollSizes.length

      this.virtualScrollSizes.length = this.virtualScrollLength

      for (let i = this.virtualScrollLength - 1; i >= oldVirtualScrollSizesLength; i--) {
        this.virtualScrollSizes[i] = defaultSize
      }

      const jMax = Math.floor((this.virtualScrollLength - 1) / aggBucketSize)
      this.virtualScrollSizesAgg = []
      for (let j = 0; j <= jMax; j++) {
        let size = 0
        const iMax = Math.min((j + 1) * aggBucketSize, this.virtualScrollLength)
        for (let i = j * aggBucketSize; i < iMax; i++) {
          size += this.virtualScrollSizes[i]
        }
        this.virtualScrollSizesAgg.push(size)
      }

      this.prevToIndex = -1
      this.prevScrollStart = void 0

      if (toIndex >= 0) {
        this.__updateVirtualScrollSizes(this.virtualScrollSliceRange.from)

        this.$nextTick(() => {
          this.scrollTo(toIndex)
        })
      }
      else {
        this.virtualScrollPaddingBefore = sumSize(this.virtualScrollSizesAgg, this.virtualScrollSizes, 0, this.virtualScrollSliceRange.from)
        this.virtualScrollPaddingAfter = sumSize(this.virtualScrollSizesAgg, this.virtualScrollSizes, this.virtualScrollSliceRange.to, this.virtualScrollLength)

        this.__onVirtualScrollEvt()
      }
    },

    __setVirtualScrollSize (scrollViewSize) {
      if (scrollViewSize === void 0 && typeof window !== 'undefined') {
        const scrollEl = this.__getVirtualScrollTarget()

        if (scrollEl !== void 0 && scrollEl !== null && scrollEl.nodeType !== 8) {
          scrollViewSize = getScrollDetails(
            scrollEl,
            this.__getVirtualScrollEl(),
            this.$refs.before,
            this.$refs.after,
            this.virtualScrollHorizontal,
            this.$q.lang.rtl,
            this.virtualScrollStickySizeStart,
            this.virtualScrollStickySizeEnd
          ).scrollViewSize
        }
      }

      this.__scrollViewSize = scrollViewSize

      const multiplier = 1 + this.virtualScrollSliceRatioBefore + this.virtualScrollSliceRatioAfter
      const view = scrollViewSize === void 0 || scrollViewSize <= 0
        ? 1
        : Math.ceil(scrollViewSize / this.virtualScrollItemSizeComputed)
      const baseSize = Math.max(
        10,
        view,
        Math.ceil(this.virtualScrollSliceSize / multiplier)
      )

      this.virtualScrollSliceSizeComputed = {
        total: Math.ceil(baseSize * multiplier),
        start: Math.ceil(baseSize * this.virtualScrollSliceRatioBefore),
        center: Math.ceil(baseSize * (0.5 + this.virtualScrollSliceRatioBefore)),
        end: Math.ceil(baseSize * (1 + this.virtualScrollSliceRatioBefore)),
        view
      }
    },

    __padVirtualScroll (h, tag, content) {
      const paddingSize = this.virtualScrollHorizontal === true ? 'width' : 'height'
      const style = {
        ['--q-virtual-scroll-item-' + paddingSize]: this.virtualScrollItemSizeComputed + 'px'
      }

      return [
        tag === 'tbody'
          ? h(tag, {
            staticClass: 'q-virtual-scroll__padding',
            key: 'before',
            ref: 'before'
          }, [
            h('tr', [
              h('td', {
                style: { [paddingSize]: `${this.virtualScrollPaddingBefore}px`, ...style },
                attrs: this.colspanAttr
              })
            ])
          ])
          : h(tag, {
            staticClass: 'q-virtual-scroll__padding',
            key: 'before',
            ref: 'before',
            style: { [paddingSize]: `${this.virtualScrollPaddingBefore}px`, ...style }
          }),

        h(tag, {
          staticClass: 'q-virtual-scroll__content',
          key: 'content',
          ref: 'content',
          attrs: { id: this.id, tabindex: -1 }
        }, content),

        tag === 'tbody'
          ? h(tag, {
            staticClass: 'q-virtual-scroll__padding',
            key: 'after',
            ref: 'after'
          }, [
            h('tr', [
              h('td', {
                style: { [paddingSize]: `${this.virtualScrollPaddingAfter}px`, ...style },
                attrs: this.colspanAttr
              })
            ])
          ])
          : h(tag, {
            staticClass: 'q-virtual-scroll__padding',
            key: 'after',
            ref: 'after',
            style: { [paddingSize]: `${this.virtualScrollPaddingAfter}px`, ...style }
          })
      ]
    },

    __emitScroll (index) {
      if (this.prevToIndex !== index) {
        this.qListeners['virtual-scroll'] !== void 0 && this.$emit('virtual-scroll', {
          index,
          from: this.virtualScrollSliceRange.from,
          to: this.virtualScrollSliceRange.to - 1,
          direction: index < this.prevToIndex ? 'decrease' : 'increase',
          ref: this
        })

        this.prevToIndex = index
      }
    }
  },

  created () {
    this.__setVirtualScrollSize()
  },

  beforeMount () {
    this.__onVirtualScrollEvt = debounce(this.__onVirtualScrollEvt, this.$q.platform.is.ios === true ? 120 : 35)
    this.__setVirtualScrollSize()
  },

  beforeDestroy () {
    const styleSheet = document.getElementById(this.id + '_ss')
    styleSheet !== null && styleSheet.remove()
  }
}

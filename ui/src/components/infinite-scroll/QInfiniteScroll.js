import Vue from 'vue'

import ListenersMixin from '../../mixins/listeners.js'

import debounce from '../../utils/debounce.js'
import { height } from '../../utils/dom.js'
import { getScrollTarget, getScrollHeight, getScrollPosition, setScrollPosition } from '../../utils/scroll.js'
import { listenOpts } from '../../utils/event.js'
import { slot, uniqueSlot } from '../../utils/slot.js'

const DIRECTIONS = {
  none: 'none',
  bottom: 'bottom',
  top: 'top',
  both: 'both'
}

export default Vue.extend({
  name: 'QInfiniteScroll',

  mixins: [ ListenersMixin ],

  props: {
    offset: {
      type: Number,
      default: 500
    },

    debounce: {
      type: [ String, Number ],
      default: 100
    },

    scrollTarget: {
      default: void 0
    },

    initialIndex: Number,

    disable: Boolean,
    reverse: Boolean,
    direction: {
      type: String,
      default: null
    }
  },

  data () {
    return {
      index: this.initialIndex || 0,
      fetchingTop: false,
      fetchingBottom: false,
      working: true
    }
  },

  watch: {
    disable (val) {
      if (val === true) {
        this.stop()
      }
      else {
        this.resume()
      }
    },

    scrollTarget () {
      this.updateScrollTarget()
    },

    debounce (val) {
      this.__setDebounce(val)
    },

    direction (val) {
      if (val === DIRECTIONS.none) {
        this.stop()
      }
      else if (val && this.disable !== true) {
        this.$nextTick(() => this.resume())
      }
    }
  },

  methods: {
    poll () {
      if (this.disable === true || this.working === false || this.direction === DIRECTIONS.none) {
        return
      }

      const
        scrollHeight = getScrollHeight(this.__scrollTarget),
        scrollPosition = getScrollPosition(this.__scrollTarget),
        containerHeight = height(this.__scrollTarget)

      if (this.direction) {
        if (this.direction === DIRECTIONS.bottom || this.direction === DIRECTIONS.both) {
          if (scrollPosition + containerHeight + this.offset >= scrollHeight) {
            this.trigger(DIRECTIONS.bottom)
          }
        }
        if (this.direction === DIRECTIONS.top || this.direction === DIRECTIONS.both) {
          if (scrollPosition < this.offset) {
            this.trigger(DIRECTIONS.top)
          }
        }
      }
      else {
        if (this.reverse === false) {
          if (scrollPosition + containerHeight + this.offset >= scrollHeight) {
            this.trigger(DIRECTIONS.bottom)
          }
        }
        else {
          if (scrollPosition < this.offset) {
            this.trigger(DIRECTIONS.top)
          }
        }
      }
    },

    trigger (direction) {
      const isTop = direction === DIRECTIONS.top
      if (this.disable === true || (isTop && this.fetchingTop === true) || (!isTop && this.fetchingBottom === true) || this.working === false || this.direction === DIRECTIONS.none) {
        return
      }

      this.index++ // in case direction === both, should index be index-range [number, number]?
      this[isTop ? 'fetchingTop' : 'fetchingBottom'] = true

      const heightBefore = getScrollHeight(this.__scrollTarget)

      this.$emit('load', this.index, stop => {
        if (this.working === true && (this.direction !== DIRECTIONS.none || !this.direction)) {
          this[isTop ? 'fetchingTop' : 'fetchingBottom'] = false
          this.$nextTick(() => {
            if ((this.reverse === true && !this.direction) || direction === DIRECTIONS.top) {
              const
                heightAfter = getScrollHeight(this.__scrollTarget),
                scrollPosition = getScrollPosition(this.__scrollTarget),
                heightDifference = heightAfter - heightBefore

              setScrollPosition(this.__scrollTarget, scrollPosition + heightDifference)
            }

            if (stop === true) {
              this.stop()
            }
            else {
              this.$el.closest('body') && this.poll()
            }
          })
        }
      }, direction)
    },

    reset () {
      this.index = 0
    },

    resume () {
      if (this.working === false) {
        this.working = true
        this.__scrollTarget.addEventListener('scroll', this.poll, listenOpts.passive)
      }
      this.immediatePoll()
    },

    stop () {
      if (this.working === true) {
        this.working = false
        this.fetchingBottom = false
        this.fetchingTop = false
        this.__scrollTarget.removeEventListener('scroll', this.poll, listenOpts.passive)
      }
    },

    updateScrollTarget () {
      if (this.__scrollTarget && this.working === true && this.direction !== DIRECTIONS.none) {
        this.__scrollTarget.removeEventListener('scroll', this.poll, listenOpts.passive)
      }

      this.__scrollTarget = getScrollTarget(this.$el, this.scrollTarget)

      if (this.working === true && this.direction !== DIRECTIONS.none) {
        this.__scrollTarget.addEventListener('scroll', this.poll, listenOpts.passive)
      }
    },

    setIndex (index) {
      this.index = index
    },

    __setDebounce (val) {
      val = parseInt(val, 10)

      const oldPoll = this.poll

      this.poll = val <= 0
        ? this.immediatePoll
        : debounce(this.immediatePoll, isNaN(val) === true ? 100 : val)

      if (this.__scrollTarget && this.working === true && this.direction !== DIRECTIONS.none) {
        if (oldPoll !== void 0) {
          this.__scrollTarget.removeEventListener('scroll', oldPoll, listenOpts.passive)
        }

        this.__scrollTarget.addEventListener('scroll', this.poll, listenOpts.passive)
      }
    }
  },

  mounted () {
    this.immediatePoll = this.poll
    this.__setDebounce(this.debounce)

    this.updateScrollTarget()

    if (this.reverse === true || this.direction === DIRECTIONS.top || this.direction === DIRECTIONS.both) {
      const
        scrollHeight = getScrollHeight(this.__scrollTarget),
        containerHeight = height(this.__scrollTarget)

      let scrollPos = scrollHeight - containerHeight
      if (this.direction === DIRECTIONS.both) {
        scrollPos = scrollPos / 2
      }
      setScrollPosition(this.__scrollTarget, scrollPos)
    }

    this.immediatePoll()
  },

  beforeDestroy () {
    if (this.working === true) {
      this.__scrollTarget.removeEventListener('scroll', this.poll, listenOpts.passive)
    }
  },

  render (h) {
    const child = uniqueSlot(this, 'default', [])

    if (this.disable !== true && this.working === true && this.direction !== DIRECTIONS.none) {
      const bottomLoading = h('div', {
        staticClass: 'q-infinite-scroll__loading',
        class: this.fetchingBottom === true ? '' : 'invisible'
      }, slot(this, 'loading'))

      const topLoading = h('div', {
        staticClass: 'q-infinite-scroll__loading',
        class: this.fetchingTop === true ? '' : 'invisible'
      }, slot(this, 'loading'))

      if (this.direction === DIRECTIONS.bottom || this.direction === DIRECTIONS.both || (!this.direction && this.reverse === false)) {
        child.push(bottomLoading)
      }
      if (this.direction === DIRECTIONS.top || this.direction === DIRECTIONS.both || (!this.direction && this.reverse === true)) {
        child.unshift(topLoading)
      }
    }

    return h('div', {
      staticClass: 'q-infinite-scroll',
      on: { ...this.qListeners }
    }, child)
  }
})

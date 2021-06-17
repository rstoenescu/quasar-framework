import Vue from 'vue'

import TouchPan from '../../directives/TouchPan.js'

import DarkMixin from '../../mixins/dark.js'
import ListenersMixin from '../../mixins/listeners.js'

import { slot, mergeSlot } from '../../utils/slot.js'
import { stop } from '../../utils/event.js'
import cache from '../../utils/cache.js'

export default Vue.extend({
  name: 'QSplitter',

  mixins: [ DarkMixin, ListenersMixin ],

  directives: {
    TouchPan
  },

  props: {
    value: {
      type: Number,
      required: true
    },
    reverse: Boolean,
    unit: {
      type: String,
      default: '%',
      validator: v => [ '%', 'px' ].includes(v)
    },

    limits: {
      type: Array,
      validator: v => {
        if (v.length !== 2) return false
        if (typeof v[0] !== 'number' || typeof v[1] !== 'number') return false
        return v[0] >= 0 && v[0] <= v[1]
      }
    },

    emitImmediately: Boolean,

    horizontal: Boolean,
    disable: Boolean,

    beforeClass: [Array, String, Object],
    afterClass: [Array, String, Object],

    separatorClass: [Array, String, Object],
    separatorStyle: [Array, String, Object]
  },

  watch: {
    value: {
      immediate: true,
      handler (v) {
        this.__normalize(v, this.computedLimits)
      }
    },

    limits: {
      deep: true,
      handler () {
        this.$nextTick(() => {
          this.__normalize(this.value, this.computedLimits)
        })
      }
    }
  },

  computed: {
    classes () {
      return (this.horizontal === true ? 'column' : 'row') +
        ` q-splitter--${this.horizontal === true ? 'horizontal' : 'vertical'}` +
        ` q-splitter--${this.disable === true ? 'disabled' : 'workable'}` +
        ` q-splitter--${this.darkSuffix}`
    },

    prop () {
      return this.horizontal === true ? 'height' : 'width'
    },

    side () {
      return this.reverse !== true ? 'before' : 'after'
    },

    computedLimits () {
      return this.limits !== void 0
        ? this.limits
        : (this.unit === '%' ? [ 10, 90 ] : [ 50, Infinity ])
    },

    styles () {
      return {
        [this.side]: {
          [this.prop]: this.__getCSSValue(this.value)
        }
      }
    },

    separatorDirectives () {
      if (this.disable !== true) {
        return [{
          name: 'touch-pan',
          value: this.__pan,
          modifiers: {
            [ this.horizontal === true ? 'vertical' : 'horizontal' ]: true,
            prevent: true,
            stop: true,
            mouse: true,
            mouseAllDir: true
          }
        }]
      }
    }
  },

  methods: {
    __pan (evt) {
      if (evt.isFirst === true) {
        const size = this.$el.getBoundingClientRect()[this.prop]

        this.__dir = this.horizontal === true ? 'up' : 'left'
        this.__maxValue = this.unit === '%' ? 100 : size
        this.__value = Math.min(this.__maxValue, this.computedLimits[1], Math.max(this.computedLimits[0], this.value))
        this.__multiplier = (this.reverse !== true ? 1 : -1) *
          (this.horizontal === true ? 1 : (this.$q.lang.rtl === true ? -1 : 1)) *
          (this.unit === '%' ? (size === 0 ? 0 : 100 / size) : 1)

        this.$el.classList.add('q-splitter--active')
        return
      }

      if (evt.isFinal === true) {
        if (this.__normalized !== this.value) {
          this.$emit('input', this.__normalized)
        }

        this.$el.classList.remove('q-splitter--active')
        return
      }

      const val = this.__value +
        this.__multiplier *
        (evt.direction === this.__dir ? -1 : 1) *
        evt.distance[this.horizontal === true ? 'y' : 'x']

      this.__normalized = Math.min(this.__maxValue, this.computedLimits[1], Math.max(this.computedLimits[0], val))

      this.$refs[this.side].style[this.prop] = this.__getCSSValue(this.__normalized)

      if (this.emitImmediately === true && this.value !== this.__normalized) {
        this.$emit('input', this.__normalized)
      }
    },

    __normalize (val, limits) {
      if (val < limits[0]) {
        this.$emit('input', limits[0])
      }
      else if (val > limits[1]) {
        this.$emit('input', limits[1])
      }
    },

    __getCSSValue (value) {
      return (this.unit === '%' ? value : Math.round(value)) + this.unit
    }
  },

  render (h) {
    const attrs = this.disable === true ? { 'aria-disabled': 'true' } : void 0
    const child = [
      h('div', {
        ref: 'before',
        staticClass: 'q-splitter__panel q-splitter__before' + (this.reverse === true ? ' col' : ''),
        style: this.styles.before,
        class: this.beforeClass,
        on: cache(this, 'stop', { input: stop })
      }, slot(this, 'before')),

      h('div', {
        staticClass: 'q-splitter__separator',
        style: this.separatorStyle,
        class: this.separatorClass,
        attrs
      }, [
        h('div', {
          staticClass: 'absolute-full q-splitter__separator-area',
          directives: this.separatorDirectives
        }, slot(this, 'separator'))
      ]),

      h('div', {
        ref: 'after',
        staticClass: 'q-splitter__panel q-splitter__after' + (this.reverse === true ? '' : ' col'),
        style: this.styles.after,
        class: this.afterClass,
        on: cache(this, 'stop', { input: stop })
      }, slot(this, 'after'))
    ]

    return h('div', {
      staticClass: 'q-splitter no-wrap',
      class: this.classes,
      on: { ...this.qListeners }
    }, mergeSlot(child, this, 'default'))
  }
})

import Vue from 'vue'

import DarkMixin from '../../mixins/dark.js'

export const skeletonTypes = [
  'text', 'rect', 'circle',
  'QBtn', 'QBadge', 'QChip', 'QToolbar',
  'QCheckbox', 'QRadio', 'QToggle',
  'QSlider', 'QRange', 'QInput',
  'QAvatar'
]

export const skeletonAnimations = [
  'wave', 'pulse', 'pulse-x', 'pulse-y', 'fade', 'blink', 'none'
]

export const skeletonAnimationSpeeds = [
  'slowest', 'slow', 'normal', 'fast', 'fastest'
]

export default Vue.extend({
  name: 'QSkeleton',

  mixins: [ DarkMixin ],

  props: {
    type: {
      type: String,
      validator: v => skeletonTypes.includes(v),
      default: 'rect'
    },

    animation: {
      type: String,
      validator: v => skeletonAnimations.includes(v),
      default: 'wave'
    },

    animationSpeed: {
      type: String,
      validator: v => skeletonAnimationSpeeds.includes(v),
      default: 'normal'
    },

    square: Boolean,
    bordered: Boolean,

    size: String,
    width: String,
    height: String,

    tag: {
      type: String,
      default: 'div'
    }
  },

  computed: {
    style () {
      return this.size !== void 0
        ? { width: this.size, height: this.size }
        : { width: this.width, height: this.height }
    },

    classes () {
      return `q-skeleton--${this.isDark === true ? 'dark' : 'light'} q-skeleton--type-${this.type}` +
        (this.animation !== 'none' ? ` q-skeleton--anim-${this.animation}` : '') +
        (this.animationSpeed !== 'none' ? ` q-skeleton--anim-speed-${this.animationSpeed}` : '') +
        (this.square === true ? ' q-skeleton--square' : '') +
        (this.bordered === true ? ' q-skeleton--bordered' : '')
    }
  },

  render (h) {
    return h(this.tag, {
      staticClass: 'q-skeleton',
      class: this.classes,
      style: this.style
    })
  }
})

import AlignMixin from './align.js'
import RippleMixin from './ripple.js'
import ListenersMixin from './listeners.js'
import { getSizeMixin } from './size.js'

const padding = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
}

export default {
  mixins: [
    ListenersMixin,
    RippleMixin,
    AlignMixin,
    getSizeMixin({
      xs: 8,
      sm: 10,
      md: 14,
      lg: 20,
      xl: 24
    })
  ],

  props: {
    type: String,
    to: [ Object, String ],
    replace: Boolean,

    label: [ Number, String ],
    icon: String,
    iconRight: String,

    round: Boolean,
    outline: Boolean,
    flat: Boolean,
    unelevated: Boolean,
    rounded: Boolean,
    push: Boolean,
    glossy: Boolean,

    size: String,
    fab: Boolean,
    fabMini: Boolean,
    padding: String,

    color: String,
    textColor: String,
    noCaps: Boolean,
    noWrap: Boolean,
    dense: Boolean,

    tabindex: [ Number, String ],

    align: { default: 'center' },
    stack: Boolean,
    stretch: Boolean,
    loading: {
      type: Boolean,
      default: null
    },
    disable: Boolean
  },

  computed: {
    style () {
      if (this.fab === false && this.fabMini === false) {
        return this.sizeStyle
      }
    },

    isRounded () {
      return this.rounded === true || this.fab === true || this.fabMini === true
    },

    isActionable () {
      return this.disable !== true && this.loading !== true
    },

    computedTabIndex () {
      return this.isActionable === true ? this.tabindex || 0 : -1
    },

    hasRouterLink () {
      return this.disable !== true && this.to !== void 0 && this.to !== null && this.to !== ''
    },

    isLink () {
      return this.type === 'a' || this.hasRouterLink === true
    },

    design () {
      if (this.flat === true) return 'flat'
      if (this.outline === true) return 'outline'
      if (this.push === true) return 'push'
      if (this.unelevated === true) return 'unelevated'
      return 'standard'
    },

    attrs () {
      const attrs = { tabindex: this.computedTabIndex }

      if (this.type !== 'a') {
        attrs.type = this.type || 'button'
      }

      if (this.hasRouterLink === true) {
        attrs.href = this.$router.resolve(this.to, this.$route).href
        attrs.role = 'link'
      }
      else {
        attrs.role = this.type === 'a' ? 'link' : 'button'
      }

      if (this.loading === true && this.percentage !== void 0) {
        attrs.role = 'progressbar'
        attrs['aria-valuemin'] = 0
        attrs['aria-valuemax'] = 100
        attrs['aria-valuenow'] = this.percentage
      }

      if (this.disable === true) {
        attrs.disabled = ''
        attrs['aria-disabled'] = ''
      }

      return attrs
    },

    classes () {
      let colors

      if (this.color !== void 0) {
        if (this.flat === true || this.outline === true) {
          colors = `text-${this.textColor || this.color}`
        }
        else {
          colors = `bg-${this.color} text-${this.textColor || 'white'}`
        }
      }
      else if (this.textColor) {
        colors = `text-${this.textColor}`
      }

      return `q-btn--${this.design} ` +
        `q-btn--${this.round === true ? 'round' : `rectangle${this.isRounded === true ? ' q-btn--rounded' : ''}`}` +
        (colors !== void 0 ? ' ' + colors : '') +
        (this.isActionable === true ? ' q-btn--actionable q-focusable q-hoverable' : (this.disable === true ? ' disabled' : '')) +
        (this.fab === true ? ' q-btn--fab' : (this.fabMini === true ? ' q-btn--fab-mini' : '')) +
        (this.noCaps === true ? ' q-btn--no-uppercase' : '') +
        (this.noWrap === true ? '' : ' q-btn--wrap') + // this is for IE11
        (this.dense === true ? ' q-btn--dense' : '') +
        (this.stretch === true ? ' no-border-radius self-stretch' : '') +
        (this.glossy === true ? ' glossy' : '')
    },

    innerClasses () {
      return this.alignClass + (this.stack === true ? ' column' : ' row') +
        (this.noWrap === true ? ' no-wrap text-no-wrap' : '') +
        (this.loading === true ? ' q-btn__content--hidden' : '')
    },

    wrapperStyle () {
      if (this.padding !== void 0) {
        return {
          padding: this.padding
            .split(/\s+/)
            .map(v => v in padding ? padding[v] + 'px' : v)
            .join(' '),
          minWidth: '0',
          minHeight: '0'
        }
      }
    }
  }
}

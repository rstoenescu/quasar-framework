import Vue from 'vue'

import QSpinner from '../spinner/QSpinner.js'

import TransitionMixin from '../../mixins/transition.js'
import DarkMixin from '../../mixins/dark.js'
import ListenersMixin from '../../mixins/listeners.js'

export default Vue.extend({
  name: 'QInnerLoading',

  mixins: [ListenersMixin, DarkMixin, TransitionMixin],

  props: {
    showing: Boolean,

    label: String,
    labelColor: String,

    color: String,

    size: {
      type: [String, Number],
      default: 42
    }
  },

  computed: {
    hasLabel () {
      return this.label !== void 0 && this.label !== null && this.label !== ''
    },
    hasLabelColor () {
      return this.labelColor !== void 0 && this.labelColor !== null && this.labelColor !== ''
    }
  },

  render (h) {
    const inner = [h(QSpinner, {
      props: {
        size: this.size,
        color: this.color
      }
    })]

    this.hasLabel === true && inner.push(
      h('span', {
        staticClass: 'q-pt-sm block',
        class: this.hasLabelColor ? `text-${this.labelColor}` : ''
      }, [this.label])
    )

    const child = this.showing === true
      ? [
        h('div',
          {
            staticClass: 'q-inner-loading absolute-full column flex-center',
            class: this.isDark === true ? 'q-inner-loading--dark' : null,
            on: { ...this.qListeners }
          },
          this.$scopedSlots.default !== void 0
            ? this.$scopedSlots.default()
            : inner
        )
      ]
      : void 0

    return h('transition', {
      props: {
        name: this.transition,
        appear: true
      }
    }, child)
  }
})

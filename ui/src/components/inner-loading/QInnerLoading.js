import Vue from 'vue'

import QSpinner from '../spinner/QSpinner.js'

import TransitionMixin from '../../mixins/transition.js'
import DarkMixin from '../../mixins/dark.js'
import ListenersMixin from '../../mixins/listeners.js'

export default Vue.extend({
  name: 'QInnerLoading',

  mixins: [ ListenersMixin, DarkMixin, TransitionMixin ],

  props: {
    showing: Boolean,
    color: String,

    size: {
      type: [String, Number],
      default: 42
    }
  },

  render (h) {
    const child = this.showing === true
      ? [
        h('div',
          {
            staticClass: 'q-inner-loading absolute-full column flex-center' +
              ` q-inner-loading--${this.darkSuffix}`,
            on: { ...this.qListeners }
          },
          this.$scopedSlots.default !== void 0
            ? this.$scopedSlots.default()
            : [
              h(QSpinner, {
                props: {
                  size: this.size,
                  color: this.color
                }
              })
            ]
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

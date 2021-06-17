import Vue from 'vue'

import DarkMixin from '../../mixins/dark.js'
import ListenersMixin from '../../mixins/listeners.js'

import { slot } from '../../utils/slot.js'

const attrs = { role: 'toolbar' }

export default Vue.extend({
  name: 'QBar',

  mixins: [ ListenersMixin, DarkMixin ],

  props: {
    dense: Boolean
  },

  computed: {
    classes () {
      return `q-bar--${this.dense === true ? 'dense' : 'standard'}` +
        ` q-bar--${this.darkSuffix}`
    }
  },

  render (h) {
    return h('div', {
      staticClass: 'q-bar row no-wrap items-center',
      class: this.classes,
      attrs,
      on: { ...this.qListeners }
    }, slot(this, 'default'))
  }
})

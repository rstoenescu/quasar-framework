import Vue from 'vue'

import DarkMixin from '../../mixins/dark.js'
import ListenersMixin from '../../mixins/listeners.js'

import { slot } from '../../utils/slot.js'

export default Vue.extend({
  name: 'QList',

  mixins: [ ListenersMixin, DarkMixin ],

  props: {
    bordered: Boolean,
    dense: Boolean,
    separator: Boolean,
    padding: Boolean
  },

  computed: {
    classes () {
      return 'q-list' +
        (this.bordered === true ? ' q-list--bordered' : '') +
        (this.dense === true ? ' q-list--dense' : '') +
        (this.separator === true ? ' q-list--separator' : '') +
        ` q-list--${this.darkSuffix}` +
        (this.padding === true ? ' q-list--padding' : '')
    }
  },

  render (h) {
    return h('div', {
      class: this.classes,
      on: { ...this.qListeners }
    }, slot(this, 'default'))
  }
})

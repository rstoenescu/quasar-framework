import Vue from 'vue'

import DarkMixin from '../../mixins/dark.js'
import TagMixin from '../../mixins/tag.js'
import ListenersMixin from '../../mixins/listeners.js'

import { slot } from '../../utils/slot.js'

export default Vue.extend({
  name: 'QCard',

  mixins: [ ListenersMixin, DarkMixin, TagMixin ],

  props: {
    square: Boolean,
    flat: Boolean,
    bordered: Boolean
  },

  computed: {
    classes () {
      return 'q-card' +
        ` q-card--${this.darkSuffix} q-${this.darkSuffix}` +
        (this.bordered === true ? ' q-card--bordered' : '') +
        (this.square === true ? ' q-card--square no-border-radius' : '') +
        (this.flat === true ? ' q-card--flat no-shadow' : '')
    }
  },

  render (h) {
    return h(this.tag, {
      class: this.classes,
      on: { ...this.qListeners }
    }, slot(this, 'default'))
  }
})

import Vue from 'vue'

import DarkMixin from '../../mixins/dark.js'
import ListenersMixin from '../../mixins/listeners.js'

import { slot } from '../../utils/slot.js'

export default Vue.extend({
  name: 'QTimeline',

  mixins: [ DarkMixin, ListenersMixin ],

  provide () {
    return {
      __timeline: this
    }
  },

  props: {
    color: {
      type: String,
      default: 'primary'
    },
    side: {
      type: String,
      default: 'right',
      validator: v => ['left', 'right'].includes(v)
    },
    layout: {
      type: String,
      default: 'dense',
      validator: v => ['dense', 'comfortable', 'loose'].includes(v)
    }
  },

  computed: {
    classes () {
      return `q-timeline--${this.layout} q-timeline--${this.layout}--${this.side}` +
        ` q-timeline--${this.darkSuffix}`
    }
  },

  render (h) {
    return h('ul', {
      staticClass: 'q-timeline',
      class: this.classes,
      on: { ...this.qListeners }
    }, slot(this, 'default'))
  }
})

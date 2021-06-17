import Vue from 'vue'

import DarkMixin from '../../mixins/dark.js'
import ListenersMixin from '../../mixins/listeners.js'

import { slot } from '../../utils/slot.js'

export default Vue.extend({
  name: 'QMarkupTable',

  mixins: [ DarkMixin, ListenersMixin ],

  props: {
    dense: Boolean,
    flat: Boolean,
    bordered: Boolean,
    square: Boolean,
    separator: {
      type: String,
      default: 'horizontal',
      validator: v => ['horizontal', 'vertical', 'cell', 'none'].includes(v)
    },
    wrapCells: Boolean
  },

  computed: {
    classes () {
      return `q-table--${this.separator}-separator` +
        ` q-table--${this.darkSuffix} q-table__card--${this.darkSuffix} q-${this.darkSuffix}` +
        (this.dense === true ? ` q-table--dense` : '') +
        (this.flat === true ? ` q-table--flat` : '') +
        (this.bordered === true ? ` q-table--bordered` : '') +
        (this.square === true ? ` q-table--square` : '') +
        (this.wrapCells === false ? ` q-table--no-wrap` : '')
    }
  },

  render (h) {
    return h('div', {
      staticClass: 'q-markup-table q-table__container q-table__card',
      class: this.classes,
      on: { ...this.qListeners }
    }, [
      h('table', { staticClass: 'q-table' }, slot(this, 'default'))
    ])
  }
})

import Vue from 'vue'

import { PanelChildMixin } from '../../mixins/panel.js'
import { slot } from '../../utils/slot.js'

export default Vue.extend({
  name: 'QTabPanel',

  mixins: [ PanelChildMixin ],

  render (h) {
    return h('div', {
      staticClass: 'q-tab-panel',
      attrs: { role: 'tabpanel' },
      on: { ...this.qListeners }
    }, slot(this, 'default'))
  }
})

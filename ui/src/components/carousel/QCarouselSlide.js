import Vue from 'vue'

import { PanelChildMixin } from '../../mixins/panel.js'

import { slot } from '../../utils/slot.js'

export default Vue.extend({
  name: 'QCarouselSlide',

  mixins: [ PanelChildMixin ],

  props: {
    imgSrc: String
  },

  computed: {
    style () {
      if (this.imgSrc) {
        return {
          backgroundImage: `url("${this.imgSrc}")`
        }
      }
    }
  },

  render (h) {
    return h('div', {
      staticClass: 'q-carousel__slide',
      style: this.style,
      attrs: { role: 'tabpanel' },
      on: { ...this.qListeners }
    }, slot(this, 'default'))
  }
})

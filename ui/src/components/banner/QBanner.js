import Vue from 'vue'

import DarkMixin from '../../mixins/dark.js'
import ListenersMixin from '../../mixins/listeners.js'

import { slot } from '../../utils/slot.js'

const attrs = { role: 'alert' }

export default Vue.extend({
  name: 'QBanner',

  mixins: [ ListenersMixin, DarkMixin ],

  props: {
    inlineActions: Boolean,
    dense: Boolean,
    rounded: Boolean
  },

  render (h) {
    const actions = slot(this, 'action')
    const child = [
      h('div', {
        staticClass: 'q-banner__avatar col-auto row items-center self-start'
      }, slot(this, 'avatar')),

      h('div', {
        staticClass: 'q-banner__content col text-body2'
      }, slot(this, 'default'))
    ]

    actions !== void 0 && child.push(
      h('div', {
        staticClass: 'q-banner__actions row items-center justify-end',
        class: `col-${this.inlineActions === true ? 'auto' : 'all'}`
      }, actions)
    )

    return h('div', {
      staticClass: 'q-banner row items-center',
      class: {
        'q-banner--top-padding': actions !== void 0 && !this.inlineActions,
        'q-banner--dense': this.dense,
        [`q-banner--${this.darkSuffix} q-${this.darkSuffix}`]: true,
        'rounded-borders': this.rounded
      },
      attrs,
      on: { ...this.qListeners }
    }, child)
  }
})

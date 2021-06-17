import Vue from 'vue'

import StepHeader from './StepHeader.js'

import { PanelParentMixin } from '../../mixins/panel.js'
import DarkMixin from '../../mixins/dark.js'

import { slot, mergeSlot } from '../../utils/slot.js'
import { stop } from '../../utils/event.js'
import cache from '../../utils/cache.js'

export default Vue.extend({
  name: 'QStepper',

  provide () {
    return {
      stepper: this
    }
  },

  mixins: [ DarkMixin, PanelParentMixin ],

  props: {
    flat: Boolean,
    bordered: Boolean,
    alternativeLabels: Boolean,
    headerNav: Boolean,
    contracted: Boolean,
    headerClass: String,

    inactiveColor: String,
    inactiveIcon: String,
    doneIcon: String,
    doneColor: String,
    activeIcon: String,
    activeColor: String,
    errorIcon: String,
    errorColor: String
  },

  computed: {
    classes () {
      const isDark = this.dark === true || (this.dark === null && this.$q.dark.isActive !== false)

      return `q-stepper q-stepper--${this.vertical === true ? 'vertical' : 'horizontal'}` +
        (this.flat === true || isDark === true ? ' q-stepper--flat no-shadow' : '') +
        (this.bordered === true || (isDark === true && this.flat === false) ? ' q-stepper--bordered' : '') +
        (this.contracted === true ? ' q-stepper--contracted' : '') +
        ` q-stepper--${this.darkSuffix} q-${this.darkSuffix}`
    },

    headerClasses () {
      return 'q-stepper__header row items-stretch justify-between' +
        ` q-stepper__header--${this.alternativeLabels === true ? 'alternative' : 'standard'}-labels` +
        (this.flat === false || this.bordered === true ? ' q-stepper__header--border' : '') +
        (this.headerClass !== void 0 ? ` ${this.headerClass}` : '')
    }
  },

  methods: {
    __getContent (h) {
      const top = slot(this, 'message', [])

      if (this.vertical === true) {
        this.__isValidPanelName(this.value) && this.__updatePanelIndex()

        const content = h('div', {
          staticClass: 'q-stepper__content',
          // stop propagation of content emitted @input
          // which would tamper with Panel's model
          on: cache(this, 'stop', { input: stop })
        }, slot(this, 'default'))

        return top === void 0
          ? [ content ]
          : top.concat(content)
      }

      return [
        h('div', { class: this.headerClasses }, this.panels.map(panel => {
          const step = panel.componentOptions.propsData

          return h(StepHeader, {
            key: step.name,
            props: {
              stepper: this,
              step
            }
          })
        }))
      ].concat(
        top,

        h('div', {
          staticClass: 'q-stepper__content q-panel-parent',
          directives: this.panelDirectives
        }, this.__getPanelContent(h))
      )
    },

    __renderPanels (h) {
      return h('div', {
        class: this.classes,
        on: { ...this.qListeners }
      }, mergeSlot(this.__getContent(h), this, 'navigation'))
    }
  }
})

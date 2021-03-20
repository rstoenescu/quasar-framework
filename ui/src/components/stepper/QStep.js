import Vue from 'vue'

import QSlideTransition from '../slide-transition/QSlideTransition.js'
import StepHeader from './StepHeader.js'

import { PanelChildMixin } from '../../mixins/panel.js'

import { slot } from '../../utils/slot.js'

const StepWrapper = Vue.extend({
  name: 'QStepWrapper',

  render (h) {
    return h('div', {
      staticClass: 'q-stepper__step-content'
    }, [
      h('div', {
        staticClass: 'q-stepper__step-inner'
      }, slot(this, 'default'))
    ])
  }
})

export default Vue.extend({
  name: 'QStep',

  inject: {
    stepper: {
      default () {
        console.error('QStep needs to be child of QStepper')
      }
    }
  },

  mixins: [ PanelChildMixin ],

  props: {
    icon: String,
    color: String,
    title: {
      type: String,
      required: true
    },
    caption: String,
    prefix: [ String, Number ],

    doneIcon: String,
    doneColor: String,
    activeIcon: String,
    activeColor: String,
    errorIcon: String,
    errorColor: String,

    headerNav: {
      type: Boolean,
      default: true
    },
    done: Boolean,
    error: Boolean
  },

  computed: {
    isActive () {
      return this.stepper.value === this.name
    }
  },

  watch: {
    isActive (active) {
      if (
        active === true &&
        this.stepper.vertical === true
      ) {
        this.$nextTick(() => {
          if (this.$el !== void 0) {
            this.$el.scrollTop = 0
          }
        })
      }
    }
  },

  render (h) {
    const vertical = this.stepper.vertical
    const content = vertical === true && this.stepper.keepAlive === true
      ? h(
        'keep-alive',
        this.isActive === true
          ? [ h(StepWrapper, { key: this.name }, slot(this, 'default')) ]
          : void 0
      )
      : (
        vertical !== true || this.isActive === true
          ? StepWrapper.options.render.call(this, h)
          : void 0
      )

    return h(
      'div',
      {
        staticClass: 'q-stepper__step',
        attrs: { role: 'tabpanel' },
        on: { ...this.qListeners }
      },
      vertical === true
        ? [
          h(StepHeader, {
            props: {
              stepper: this.stepper,
              step: this
            }
          }),

          this.stepper.animated === true
            ? h(QSlideTransition, [ content ])
            : content
        ]
        : [ content ]
    )
  }
})

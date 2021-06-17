import Vue from 'vue'

import QRadio from '../radio/QRadio.js'
import QCheckbox from '../checkbox/QCheckbox.js'
import QToggle from '../toggle/QToggle.js'

import DarkMixin from '../../mixins/dark.js'
import ListenersMixin from '../../mixins/listeners.js'

import cache from '../../utils/cache.js'

const components = {
  radio: QRadio,
  checkbox: QCheckbox,
  toggle: QToggle
}

const typeValues = Object.keys(components)

export default Vue.extend({
  name: 'QOptionGroup',

  mixins: [ DarkMixin, ListenersMixin ],

  props: {
    value: {
      required: true
    },
    options: {
      type: Array,
      validator (opts) {
        return opts.every(opt => 'value' in opt && 'label' in opt)
      }
    },

    name: String,

    type: {
      default: 'radio',
      validator: v => typeValues.includes(v)
    },

    color: String,
    keepColor: Boolean,
    dense: Boolean,

    size: String,

    leftLabel: Boolean,
    inline: Boolean,
    disable: Boolean
  },

  computed: {
    component () {
      return components[this.type]
    },

    model () {
      return Array.isArray(this.value)
        ? this.value.slice()
        : this.value
    },

    classes () {
      return 'q-option-group q-gutter-x-sm' +
        (this.inline === true ? ' q-option-group--inline' : '')
    },

    attrs () {
      if (this.type === 'radio') {
        const attrs = {
          role: 'radiogroup'
        }

        if (this.disable === true) {
          attrs['aria-disabled'] = 'true'
        }

        return attrs
      }
    }
  },

  methods: {
    __update (value) {
      this.$emit('input', value)
    }
  },

  created () {
    const isArray = Array.isArray(this.value)

    if (this.type === 'radio') {
      if (isArray) {
        console.error('q-option-group: model should not be array')
      }
    }
    else if (isArray === false) {
      console.error('q-option-group: model should be array in your case')
    }
  },

  render (h) {
    return h('div', {
      class: this.classes,
      attrs: this.attrs,
      on: { ...this.qListeners }
    }, this.options.map(opt => h('div', [
      h(this.component, {
        props: {
          value: this.value,
          val: opt.value,
          name: opt.name === void 0 ? this.name : opt.name,
          disable: this.disable || opt.disable,
          label: opt.label,
          leftLabel: opt.leftLabel === void 0 ? this.leftLabel : opt.leftLabel,
          color: opt.color === void 0 ? this.color : opt.color,
          checkedIcon: opt.checkedIcon,
          uncheckedIcon: opt.uncheckedIcon,
          dark: opt.dark === void 0 ? this.dark : opt.dark,
          size: opt.size === void 0 ? this.size : opt.size,
          dense: this.dense,
          keepColor: opt.keepColor === void 0 ? this.keepColor : opt.keepColor
        },
        on: cache(this, 'inp', {
          input: this.__update
        })
      })
    ])))
  }
})

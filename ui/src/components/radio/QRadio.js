import Vue from 'vue'

import DarkMixin from '../../mixins/dark.js'
import OptionSizeMixin from '../../mixins/option-size.js'
import FormMixin from '../../mixins/form.js'
import RefocusTargetMixin from '../../mixins/refocus-target.js'

import { stopAndPrevent } from '../../utils/event.js'
import { slot, mergeSlot } from '../../utils/slot.js'
import cache from '../../utils/cache.js'

export default Vue.extend({
  name: 'QRadio',

  mixins: [ DarkMixin, OptionSizeMixin, FormMixin, RefocusTargetMixin ],

  props: {
    value: {
      required: true
    },
    val: {
      required: true
    },

    label: String,
    leftLabel: Boolean,

    color: String,
    keepColor: Boolean,
    dense: Boolean,

    disable: Boolean,
    tabindex: [String, Number]
  },

  computed: {
    isTrue () {
      return this.value === this.val
    },

    classes () {
      return 'q-radio cursor-pointer no-outline row inline no-wrap items-center' +
        (this.disable === true ? ' disabled' : '') +
        ` q-radio--${this.darkSuffix}` +
        (this.dense === true ? ' q-radio--dense' : '') +
        (this.leftLabel === true ? ' reverse' : '')
    },

    innerClass () {
      const color = this.color !== void 0 && (
        this.keepColor === true ||
        this.isTrue === true
      )
        ? ` text-${this.color}`
        : ''

      return `q-radio__inner--${this.isTrue === true ? 'truthy' : 'falsy'}${color}`
    },

    computedTabindex () {
      return this.disable === true ? -1 : this.tabindex || 0
    },

    formAttrs () {
      const prop = { type: 'radio' }

      this.name !== void 0 && Object.assign(prop, {
        name: this.name,
        value: this.val
      })

      return prop
    },

    formDomProps () {
      if (this.name !== void 0 && this.isTrue === true) {
        return { checked: true }
      }
    },

    attrs () {
      const attrs = {
        tabindex: this.computedTabindex,
        role: 'radio',
        'aria-label': this.label,
        'aria-checked': this.isTrue === true ? 'true' : 'false'
      }

      if (this.disable === true) {
        attrs['aria-disabled'] = 'true'
      }

      return attrs
    }
  },

  methods: {
    set (e) {
      if (e !== void 0) {
        stopAndPrevent(e)
        this.__refocusTarget(e)
      }

      if (this.disable !== true && this.isTrue !== true) {
        this.$emit('input', this.val, e)
      }
    }
  },

  render (h) {
    const content = [
      h('svg', {
        staticClass: 'q-radio__bg absolute non-selectable',
        attrs: { focusable: 'false' /* needed for IE11 */, viewBox: '0 0 24 24', 'aria-hidden': 'true' }
      }, [
        h('path', {
          attrs: {
            d: 'M12,22a10,10 0 0 1 -10,-10a10,10 0 0 1 10,-10a10,10 0 0 1 10,10a10,10 0 0 1 -10,10m0,-22a12,12 0 0 0 -12,12a12,12 0 0 0 12,12a12,12 0 0 0 12,-12a12,12 0 0 0 -12,-12'
          }
        }),

        h('path', {
          staticClass: 'q-radio__check',
          attrs: {
            d: 'M12,6a6,6 0 0 0 -6,6a6,6 0 0 0 6,6a6,6 0 0 0 6,-6a6,6 0 0 0 -6,-6'
          }
        })
      ])
    ]

    this.disable !== true && this.__injectFormInput(
      content,
      'unshift',
      'q-radio__native q-ma-none q-pa-none'
    )

    const child = [
      h('div', {
        staticClass: 'q-radio__inner relative-position',
        class: this.innerClass,
        style: this.sizeStyle
      }, content)
    ]

    if (this.__refocusTargetEl !== void 0) {
      child.push(this.__refocusTargetEl)
    }

    const label = this.label !== void 0
      ? mergeSlot([ this.label ], this, 'default')
      : slot(this, 'default')

    label !== void 0 && child.push(
      h('div', {
        staticClass: 'q-radio__label q-anchor--skip'
      }, label)
    )

    return h('div', {
      class: this.classes,
      attrs: this.attrs,
      on: cache(this, 'inpExt', {
        click: this.set,
        keydown: e => {
          if (e.keyCode === 13 || e.keyCode === 32) {
            stopAndPrevent(e)
          }
        },
        keyup: e => {
          if (e.keyCode === 13 || e.keyCode === 32) {
            this.set(e)
          }
        }
      })
    }, child)
  }
})

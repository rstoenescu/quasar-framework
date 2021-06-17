import Vue from 'vue'

import QIcon from '../icon/QIcon.js'

import DarkMixin from '../../mixins/dark.js'
import RippleMixin from '../../mixins/ripple.js'
import { getSizeMixin } from '../../mixins/size.js'

import { stopAndPrevent } from '../../utils/event.js'
import { mergeSlotSafely } from '../../utils/slot.js'
import cache from '../../utils/cache.js'

export default Vue.extend({
  name: 'QChip',

  mixins: [
    RippleMixin,
    DarkMixin,
    getSizeMixin({
      xs: 8,
      sm: 10,
      md: 14,
      lg: 20,
      xl: 24
    })
  ],

  model: {
    event: 'remove'
  },

  props: {
    dense: Boolean,

    icon: String,
    iconRight: String,
    iconRemove: String,
    iconSelected: String,
    label: [String, Number],

    color: String,
    textColor: String,

    value: {
      type: Boolean,
      default: true
    },
    selected: {
      type: Boolean,
      default: null
    },

    square: Boolean,
    outline: Boolean,
    clickable: Boolean,
    removable: Boolean,

    tabindex: [String, Number],
    disable: Boolean
  },

  computed: {
    classes () {
      const text = this.outline === true
        ? this.color || this.textColor
        : this.textColor

      return {
        [`bg-${this.color}`]: this.outline === false && this.color !== void 0,
        [`text-${text} q-chip--colored`]: text,
        disabled: this.disable,
        'q-chip--dense': this.dense,
        'q-chip--outline': this.outline,
        'q-chip--selected': this.selected,
        'q-chip--clickable cursor-pointer non-selectable q-hoverable': this.isClickable,
        'q-chip--square': this.square,
        [`q-chip--${this.darkSuffix} q-${this.darkSuffix}`]: true
      }
    },

    hasLeftIcon () {
      return this.selected === true || this.icon !== void 0
    },

    leftIcon () {
      return this.selected === true
        ? this.iconSelected || this.$q.iconSet.chip.selected
        : this.icon
    },

    removeIcon () {
      return this.iconRemove || this.$q.iconSet.chip.remove
    },

    isClickable () {
      return this.disable === false && (this.clickable === true || this.selected !== null)
    },

    attrs () {
      return this.disable === true
        ? { tabindex: -1, 'aria-disabled': 'true' }
        : { tabindex: this.tabindex || 0 }
    }
  },

  methods: {
    __onKeyup (e) {
      e.keyCode === 13 /* ENTER */ && this.__onClick(e)
    },

    __onClick (e) {
      if (!this.disable) {
        this.$emit('update:selected', !this.selected)
        this.$emit('click', e)
      }
    },

    __onRemove (e) {
      if (e.keyCode === void 0 || e.keyCode === 13) {
        stopAndPrevent(e)
        !this.disable && this.$emit('remove', false)
      }
    },

    __getContent (h) {
      const child = []

      this.isClickable === true && child.push(
        h('div', { staticClass: 'q-focus-helper' })
      )

      this.hasLeftIcon === true && child.push(
        h(QIcon, {
          staticClass: 'q-chip__icon q-chip__icon--left',
          props: { name: this.leftIcon }
        })
      )

      const label = this.label !== void 0
        ? [ h('div', { staticClass: 'ellipsis' }, [ this.label ]) ]
        : void 0

      child.push(
        h('div', {
          staticClass: 'q-chip__content col row no-wrap items-center q-anchor--skip'
        }, mergeSlotSafely(label, this, 'default'))
      )

      this.iconRight && child.push(
        h(QIcon, {
          staticClass: 'q-chip__icon q-chip__icon--right',
          props: { name: this.iconRight }
        })
      )

      this.removable === true && child.push(
        h(QIcon, {
          staticClass: 'q-chip__icon q-chip__icon--remove cursor-pointer',
          props: { name: this.removeIcon },
          attrs: this.attrs,
          on: cache(this, 'non', {
            click: this.__onRemove,
            keyup: this.__onRemove
          })
        })
      )

      return child
    }
  },

  render (h) {
    if (this.value === false) { return }

    const data = {
      staticClass: 'q-chip row inline no-wrap items-center',
      class: this.classes,
      style: this.sizeStyle
    }

    this.isClickable === true && Object.assign(data, {
      attrs: this.attrs,
      on: cache(this, 'click', {
        click: this.__onClick,
        keyup: this.__onKeyup
      }),
      directives: cache(this, 'dir#' + this.ripple, [
        { name: 'ripple', value: this.ripple }
      ])
    })

    return h('div', data, this.__getContent(h))
  }
})

import Vue from 'vue'

import { fromSSR } from '../../plugins/Platform.js'

import QIcon from '../icon/QIcon.js'
import QSpinner from '../spinner/QSpinner.js'

import ValidateMixin from '../../mixins/validate.js'
import DarkMixin from '../../mixins/dark.js'
import AttrsMixin from '../../mixins/attrs.js'

import { slot } from '../../utils/slot.js'
import uid from '../../utils/uid.js'
import { stop, prevent, stopAndPrevent } from '../../utils/event.js'
import { addFocusFn, removeFocusFn } from '../../utils/focus-manager.js'

function getTargetUid (val) {
  return val === void 0 ? `f_${uid()}` : val
}

export default Vue.extend({
  name: 'QField',

  mixins: [ DarkMixin, ValidateMixin, AttrsMixin ],

  inheritAttrs: false,

  props: {
    label: String,
    stackLabel: Boolean,
    hint: String,
    hideHint: Boolean,
    prefix: String,
    suffix: String,

    labelColor: String,
    color: String,
    bgColor: String,

    filled: Boolean,
    outlined: Boolean,
    borderless: Boolean,
    standout: [Boolean, String],

    square: Boolean,

    loading: Boolean,

    labelSlot: Boolean,

    bottomSlots: Boolean,
    hideBottomSpace: Boolean,

    rounded: Boolean,
    dense: Boolean,
    itemAligned: Boolean,

    counter: Boolean,

    clearable: Boolean,
    clearIcon: String,

    disable: Boolean,
    readonly: Boolean,

    autofocus: Boolean,

    for: String,

    maxlength: [Number, String],
    maxValues: [Number, String] // private, do not add to JSON; internally needed by QSelect
  },

  data () {
    return {
      focused: false,
      targetUid: getTargetUid(this.for),

      // used internally by validation for QInput
      // or menu handling for QSelect
      innerLoading: false
    }
  },

  watch: {
    for (val) {
      // don't transform targetUid into a computed
      // prop as it will break SSR
      this.targetUid = getTargetUid(val)
    }
  },

  computed: {
    editable () {
      return this.disable !== true && this.readonly !== true
    },

    hasValue () {
      const value = this.__getControl === void 0 ? this.value : this.innerValue

      return value !== void 0 &&
        value !== null &&
        ('' + value).length > 0
    },

    computedCounter () {
      if (this.counter !== false) {
        const len = typeof this.value === 'string' || typeof this.value === 'number'
          ? ('' + this.value).length
          : (Array.isArray(this.value) === true ? this.value.length : 0)

        const max = this.maxlength !== void 0
          ? this.maxlength
          : this.maxValues

        return len + (max !== void 0 ? ' / ' + max : '')
      }
    },

    floatingLabel () {
      return this.stackLabel === true ||
        this.focused === true ||
        (
          this.inputValue !== void 0 && this.hideSelected === true
            ? this.inputValue.length > 0
            : this.hasValue === true
        ) ||
        (
          this.displayValue !== void 0 &&
          this.displayValue !== null &&
          ('' + this.displayValue).length > 0
        )
    },

    shouldRenderBottom () {
      return this.bottomSlots === true ||
        this.hint !== void 0 ||
        this.hasRules === true ||
        this.counter === true ||
        this.error !== null
    },

    classes () {
      return {
        [this.fieldClass]: this.fieldClass !== void 0,

        [`q-field--${this.styleType}`]: true,
        'q-field--rounded': this.rounded,
        'q-field--square': this.square,

        'q-field--focused': this.focused === true,
        'q-field--highlighted': this.focused === true || this.hasError === true,
        'q-field--float': this.floatingLabel,
        'q-field--labeled': this.hasLabel,

        'q-field--dense': this.dense,
        'q-field--item-aligned q-item-type': this.itemAligned,
        'q-field--dark': this.isDark,

        'q-field--auto-height': this.__getControl === void 0,

        'q-field--with-bottom': this.hideBottomSpace !== true && this.shouldRenderBottom === true,
        'q-field--error': this.hasError,

        'q-field--readonly': this.readonly === true && this.disable !== true,
        [this.disable === true ? 'q-field--disabled' : 'q-validation-component']: true
      }
    },

    styleType () {
      if (this.filled === true) { return 'filled' }
      if (this.outlined === true) { return 'outlined' }
      if (this.borderless === true) { return 'borderless' }
      if (this.standout) { return 'standout' }
      return 'standard'
    },

    contentClass () {
      const cls = []

      if (this.hasError === true) {
        cls.push('text-negative')
      }
      else if (typeof this.standout === 'string' && this.standout.length > 0 && this.focused === true) {
        return this.standout
      }
      else if (this.color !== void 0) {
        cls.push('text-' + this.color)
      }

      if (this.bgColor !== void 0) {
        cls.push(`bg-${this.bgColor}`)
      }

      return cls
    },

    hasLabel () {
      return this.labelSlot === true || this.label !== void 0
    },

    labelClass () {
      if (
        this.labelColor !== void 0 &&
        this.hasError !== true
      ) {
        return 'text-' + this.labelColor
      }
    },

    controlSlotScope () {
      return {
        id: this.targetUid,
        field: this.$el,
        editable: this.editable,
        focused: this.focused,
        floatingLabel: this.floatingLabel,
        value: this.value,
        emitValue: this.__emitValue
      }
    },

    attrs () {
      const attrs = {
        for: this.targetUid
      }

      if (this.disable === true) {
        attrs['aria-disabled'] = 'true'
      }
      else if (this.readonly === true) {
        attrs['aria-readonly'] = 'true'
      }

      return attrs
    }
  },

  methods: {
    focus () {
      this.focusFn !== void 0 && removeFocusFn(this.focusFn)
      this.focusFn = addFocusFn(() => {
        if (this.showPopup !== void 0) {
          this.showPopup()
          return
        }

        this.__focus()
      })
    },

    blur () {
      this.focusFn !== void 0 && removeFocusFn(this.focusFn)
      const el = document.activeElement
      // IE can have null document.activeElement
      if (el !== null && this.$el.contains(el)) {
        el.blur()
      }
    },

    __focus () {
      const el = document.activeElement
      let target = this.$refs.target
      // IE can have null document.activeElement
      if (target !== void 0 && (el === null || el.id !== this.targetUid)) {
        target.hasAttribute('tabindex') === true || (target = target.querySelector('[tabindex]'))
        target !== null && target !== el && target.focus()
      }
    },

    __getContent (h) {
      const node = []

      this.$scopedSlots.prepend !== void 0 && node.push(
        h('div', {
          staticClass: 'q-field__prepend q-field__marginal row no-wrap items-center',
          key: 'prepend',
          on: this.slotsEvents
        }, this.$scopedSlots.prepend())
      )

      node.push(
        h('div', {
          staticClass: 'q-field__control-container col relative-position row no-wrap q-anchor--skip'
        }, this.__getControlContainer(h))
      )

      this.$scopedSlots.append !== void 0 && node.push(
        h('div', {
          staticClass: 'q-field__append q-field__marginal row no-wrap items-center',
          key: 'append',
          on: this.slotsEvents
        }, this.$scopedSlots.append())
      )

      this.hasError === true && this.noErrorIcon === false && node.push(
        this.__getInnerAppendNode(h, 'error', [
          h(QIcon, { props: { name: this.$q.iconSet.field.error, color: 'negative' } })
        ])
      )

      if (this.loading === true || this.innerLoading === true) {
        node.push(
          this.__getInnerAppendNode(
            h,
            'inner-loading-append',
            this.$scopedSlots.loading !== void 0
              ? this.$scopedSlots.loading()
              : [ h(QSpinner, { props: { color: this.color } }) ]
          )
        )
      }
      else if (this.clearable === true && this.hasValue === true && this.editable === true) {
        node.push(
          this.__getInnerAppendNode(h, 'inner-clearable-append', [
            h(QIcon, {
              staticClass: 'q-field__focusable-action',
              props: { tag: 'button', name: this.clearIcon || this.$q.iconSet.field.clear },
              attrs: { tabindex: 0, type: 'button' },
              on: this.clearableEvents
            })
          ])
        )
      }

      this.__getInnerAppend !== void 0 && node.push(
        this.__getInnerAppendNode(h, 'inner-append', this.__getInnerAppend(h))
      )

      this.__getControlChild !== void 0 && node.push(
        this.__getControlChild(h)
      )

      return node
    },

    __getControlContainer (h) {
      const node = []

      this.prefix !== void 0 && this.prefix !== null && node.push(
        h('div', {
          staticClass: 'q-field__prefix no-pointer-events row items-center'
        }, [ this.prefix ])
      )

      if (this.hasShadow === true && this.__getShadowControl !== void 0) {
        node.push(
          this.__getShadowControl(h)
        )
      }

      if (this.__getControl !== void 0) {
        node.push(this.__getControl(h))
      }
      // internal usage only:
      else if (this.$scopedSlots.rawControl !== void 0) {
        node.push(this.$scopedSlots.rawControl())
      }
      else if (this.$scopedSlots.control !== void 0) {
        node.push(
          h('div', {
            ref: 'target',
            staticClass: 'q-field__native row',
            attrs: {
              ...this.qAttrs,
              'data-autofocus': this.autofocus
            }
          }, this.$scopedSlots.control(this.controlSlotScope))
        )
      }

      this.hasLabel === true && node.push(
        h('div', {
          staticClass: 'q-field__label no-pointer-events absolute ellipsis',
          class: this.labelClass
        }, [ slot(this, 'label', this.label) ])
      )

      this.suffix !== void 0 && this.suffix !== null && node.push(
        h('div', {
          staticClass: 'q-field__suffix no-pointer-events row items-center'
        }, [ this.suffix ])
      )

      return node.concat(
        this.__getDefaultSlot !== void 0
          ? this.__getDefaultSlot(h)
          : slot(this, 'default')
      )
    },

    __getBottom (h) {
      let msg, key

      if (this.hasError === true) {
        if (this.computedErrorMessage !== void 0) {
          msg = [ h('div', { attrs: { role: 'alert' } }, [ this.computedErrorMessage ]) ]
          key = this.computedErrorMessage
        }
        else {
          msg = slot(this, 'error')
          key = 'q--slot-error'
        }
      }
      else if (this.hideHint !== true || this.focused === true) {
        if (this.hint !== void 0) {
          msg = [ h('div', [ this.hint ]) ]
          key = this.hint
        }
        else {
          msg = slot(this, 'hint')
          key = 'q--slot-hint'
        }
      }

      const hasCounter = this.counter === true || this.$scopedSlots.counter !== void 0

      if (this.hideBottomSpace === true && hasCounter === false && msg === void 0) {
        return
      }

      const main = h('div', {
        key,
        staticClass: 'q-field__messages col'
      }, msg)

      return h('div', {
        staticClass: 'q-field__bottom row items-start q-field__bottom--' +
          (this.hideBottomSpace !== true ? 'animated' : 'stale')
      }, [
        this.hideBottomSpace === true
          ? main
          : h('transition', { props: { name: 'q-transition--field-message' } }, [
            main
          ]),

        hasCounter === true
          ? h('div', {
            staticClass: 'q-field__counter'
          }, this.$scopedSlots.counter !== void 0 ? this.$scopedSlots.counter() : [ this.computedCounter ])
          : null
      ])
    },

    __getInnerAppendNode (h, key, content) {
      return content === null ? null : h('div', {
        staticClass: 'q-field__append q-field__marginal row no-wrap items-center q-anchor--skip',
        key
      }, content)
    },

    __onControlPopupShow (e) {
      e !== void 0 && stop(e)
      this.$emit('popup-show', e)
      this.hasPopupOpen = true
      this.__onControlFocusin(e)
    },

    __onControlPopupHide (e) {
      e !== void 0 && stop(e)
      this.$emit('popup-hide', e)
      this.hasPopupOpen = false
      this.__onControlFocusout(e)
    },

    __onControlFocusin (e) {
      if (this.editable === true && this.focused === false) {
        this.focused = true
        this.$emit('focus', e)
      }
    },

    __onControlFocusout (e, then) {
      clearTimeout(this.focusoutTimer)
      this.focusoutTimer = setTimeout(() => {
        if (
          document.hasFocus() === true && (
            this.hasPopupOpen === true ||
            this.$refs === void 0 ||
            this.$refs.control === void 0 ||
            this.$refs.control.contains(document.activeElement) !== false
          )
        ) {
          return
        }

        if (this.focused === true) {
          this.focused = false
          this.$emit('blur', e)
        }

        then !== void 0 && then()
      })
    },

    __clearValue (e) {
      // prevent activating the field but keep focus on desktop
      stopAndPrevent(e)

      if (this.$q.platform.is.mobile !== true) {
        const el = this.$refs.target || this.$el
        el.focus()
      }
      else if (this.$el.contains(document.activeElement) === true) {
        document.activeElement.blur()
      }

      if (this.type === 'file') {
        // do not let focus be triggered
        // as it will make the native file dialog
        // appear for another selection
        this.$refs.input.value = null
      }

      this.$emit('input', null)
      this.$emit('clear', this.value)

      this.$nextTick(() => {
        this.resetValidation()

        if (this.lazyRules !== 'ondemand' && this.$q.platform.is.mobile !== true) {
          this.isDirty = false
        }
      })
    },

    __emitValue (value) {
      this.$emit('input', value)
    }
  },

  render (h) {
    this.__onPreRender !== void 0 && this.__onPreRender()
    this.__onPostRender !== void 0 && this.$nextTick(this.__onPostRender)

    return h('label', {
      staticClass: 'q-field row no-wrap items-start',
      class: this.classes,
      attrs: this.attrs
    }, [
      this.$scopedSlots.before !== void 0 ? h('div', {
        staticClass: 'q-field__before q-field__marginal row no-wrap items-center',
        on: this.slotsEvents
      }, this.$scopedSlots.before()) : null,

      h('div', {
        staticClass: 'q-field__inner relative-position col self-stretch'
      }, [
        h('div', {
          ref: 'control',
          staticClass: 'q-field__control relative-position row no-wrap',
          class: this.contentClass,
          attrs: { tabindex: -1 },
          on: this.controlEvents
        }, this.__getContent(h)),

        this.shouldRenderBottom === true
          ? this.__getBottom(h)
          : null
      ]),

      this.$scopedSlots.after !== void 0 ? h('div', {
        staticClass: 'q-field__after q-field__marginal row no-wrap items-center',
        on: this.slotsEvents
      }, this.$scopedSlots.after()) : null
    ])
  },

  created () {
    this.__onPreRender !== void 0 && this.__onPreRender()

    this.slotsEvents = { click: prevent }

    this.clearableEvents = { click: this.__clearValue }

    this.controlEvents = this.__getControlEvents !== void 0
      ? this.__getControlEvents()
      : {
        focusin: this.__onControlFocusin,
        focusout: this.__onControlFocusout,
        'popup-show': this.__onControlPopupShow,
        'popup-hide': this.__onControlPopupHide
      }
  },

  mounted () {
    if (fromSSR === true && this.for === void 0) {
      this.targetUid = getTargetUid()
    }

    this.autofocus === true && this.focus()
  },

  beforeDestroy () {
    clearTimeout(this.focusoutTimer)
  }
})

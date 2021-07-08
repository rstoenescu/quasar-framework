import Vue from 'vue'

import QField from '../field/QField.js'
import QIcon from '../icon/QIcon.js'
import QChip from '../chip/QChip.js'

import QItem from '../item/QItem.js'
import QItemSection from '../item/QItemSection.js'
import QItemLabel from '../item/QItemLabel.js'

import QMenu from '../menu/QMenu.js'
import QDialog from '../dialog/QDialog.js'

import { isDeepEqual } from '../../utils/is.js'
import { stop, prevent, stopAndPrevent } from '../../utils/event.js'
import { normalizeToInterval } from '../../utils/format.js'
import { shouldIgnoreKey, isKeyCode } from '../../utils/key-composition.js'
import { mergeSlot } from '../../utils/slot.js'
import cache from '../../utils/cache.js'

import { FormFieldMixin } from '../../mixins/form.js'
import VirtualScroll from '../../mixins/virtual-scroll.js'
import CompositionMixin from '../../mixins/composition.js'
import ListenersMixin from '../../mixins/listeners.js'

const validateNewValueMode = v => ['add', 'add-unique', 'toggle'].includes(v)
const reEscapeList = '.*+?^${}()|[]\\'

export default Vue.extend({
  name: 'QSelect',

  mixins: [
    QField,
    VirtualScroll,
    CompositionMixin,
    FormFieldMixin,
    ListenersMixin
  ],

  props: {
    value: {
      required: true
    },

    multiple: Boolean,

    displayValue: [String, Number],
    displayValueSanitize: Boolean,
    dropdownIcon: String,

    options: {
      type: Array,
      default: () => []
    },

    optionValue: [Function, String],
    optionLabel: [Function, String],
    optionDisable: [Function, String],
    noOptionLabel: String,

    hideSelected: Boolean,
    hideDropdownIcon: Boolean,
    fillInput: Boolean,

    maxValues: [Number, String],

    optionsDense: Boolean,
    optionsDark: {
      type: Boolean,
      default: null
    },
    optionsSelectedClass: String,
    optionsSanitize: Boolean,

    optionsCover: Boolean,

    menuShrink: Boolean,
    menuAnchor: String,
    menuSelf: String,
    menuOffset: Array,

    popupContentClass: String,
    popupContentStyle: [String, Array, Object],

    useInput: Boolean,
    useChips: Boolean,

    newValueMode: {
      type: String,
      validator: validateNewValueMode
    },

    mapOptions: Boolean,
    emitValue: Boolean,

    inputDebounce: {
      type: [Number, String],
      default: 500
    },

    inputClass: [Array, String, Object],
    inputStyle: [Array, String, Object],

    tabindex: {
      type: [String, Number],
      default: 0
    },

    autocomplete: String,

    transitionShow: String,
    transitionHide: String,

    behavior: {
      type: String,
      validator: v => ['default', 'menu', 'dialog'].includes(v),
      default: 'default'
    },

    virtualScrollItemSize: {
      type: [ Number, String ],
      default: void 0
    }
  },

  data () {
    return {
      menu: false,
      dialog: false,
      optionIndex: -1,
      inputValue: '',
      dialogFieldFocused: false
    }
  },

  watch: {
    innerValue: {
      handler (val) {
        this.innerValueCache = val

        if (
          this.useInput === true &&
          this.fillInput === true &&
          this.multiple !== true &&
          // Prevent re-entering in filter while filtering
          // Also prevent clearing inputValue while filtering
          this.innerLoading !== true &&
          ((this.dialog !== true && this.menu !== true) || this.hasValue !== true)
        ) {
          this.userInputValue !== true && this.__resetInputValue()
          if (this.dialog === true || this.menu === true) {
            this.filter('')
          }
        }
      },
      immediate: true
    },

    fillInput () {
      this.__resetInputValue()
    },

    menu (show) {
      this.__updateMenu(show)
    }
  },

  computed: {
    isOptionsDark () {
      return this.optionsDark === null
        ? this.isDark
        : this.optionsDark
    },

    virtualScrollLength () {
      return Array.isArray(this.options)
        ? this.options.length
        : 0
    },

    fieldClass () {
      return `q-select q-field--auto-height q-select--with${this.useInput !== true ? 'out' : ''}-input` +
        ` q-select--with${this.useChips !== true ? 'out' : ''}-chips` +
        ` q-select--${this.multiple === true ? 'multiple' : 'single'}`
    },

    computedInputClass () {
      if (this.hideSelected === true || this.innerValue.length === 0) {
        return this.inputClass
      }

      return this.inputClass === void 0
        ? 'q-field__input--padding'
        : [this.inputClass, 'q-field__input--padding']
    },

    menuContentClass () {
      return (this.virtualScrollHorizontal === true ? 'q-virtual-scroll--horizontal' : '') +
        (this.popupContentClass ? ' ' + this.popupContentClass : '')
    },

    innerValue () {
      const
        mapNull = this.mapOptions === true && this.multiple !== true,
        val = this.value !== void 0 && (this.value !== null || mapNull === true)
          ? (this.multiple === true && Array.isArray(this.value) ? this.value : [ this.value ])
          : []

      if (this.mapOptions === true && Array.isArray(this.options) === true) {
        const cache = this.mapOptions === true && this.innerValueCache !== void 0
          ? this.innerValueCache
          : []
        const values = val.map(v => this.__getOption(v, cache))

        return this.value === null && mapNull === true
          ? values.filter(v => v !== null)
          : values
      }

      return val
    },

    noOptions () {
      return this.virtualScrollLength === 0
    },

    selectedString () {
      return this.innerValue
        .map(opt => this.getOptionLabel(opt))
        .join(', ')
    },

    sanitizeFn () {
      return this.optionsSanitize === true
        ? () => true
        : opt => opt !== void 0 && opt !== null && opt.sanitize === true
    },

    displayAsText () {
      return this.displayValueSanitize === true || (
        this.displayValue === void 0 && (
          this.optionsSanitize === true ||
          this.innerValue.some(this.sanitizeFn)
        )
      )
    },

    computedTabindex () {
      return this.focused === true ? this.tabindex : -1
    },

    selectedScope () {
      return this.innerValue.map((opt, i) => ({
        index: i,
        opt,
        sanitize: this.sanitizeFn(opt),
        selected: true,
        removeAtIndex: this.__removeAtIndexAndFocus,
        toggleOption: this.toggleOption,
        tabindex: this.computedTabindex
      }))
    },

    optionScope () {
      if (this.virtualScrollLength === 0) {
        return []
      }

      const { from, to } = this.virtualScrollSliceRange
      const { options, optionEls } = this.__optionScopeCache

      return this.options.slice(from, to).map((opt, i) => {
        const disable = this.isOptionDisabled(opt) === true
        const index = from + i

        const itemProps = {
          clickable: true,
          active: false,
          activeClass: this.computedOptionsSelectedClass,
          manualFocus: true,
          focused: false,
          disable,
          tabindex: -1,
          dense: this.optionsDense,
          dark: this.isOptionsDark
        }

        if (disable !== true) {
          this.isOptionSelected(opt) === true && (itemProps.active = true)
          this.optionIndex === index && (itemProps.focused = true)
        }

        const itemEvents = {
          click: () => { this.toggleOption(opt) }
        }

        if (this.$q.platform.is.desktop === true) {
          itemEvents.mousemove = () => { this.setOptionIndex(index) }
        }

        const option = {
          index,
          opt,
          sanitize: this.sanitizeFn(opt),
          selected: itemProps.active,
          focused: itemProps.focused,
          toggleOption: this.toggleOption,
          setOptionIndex: this.setOptionIndex,
          itemProps
        }

        if (options[i] === void 0 || isDeepEqual(option, options[i]) !== true) {
          options[i] = option
          optionEls[i] = void 0
        }

        return {
          ...option,
          itemEvents
        }
      })
    },

    dropdownArrowIcon () {
      return this.dropdownIcon !== void 0
        ? this.dropdownIcon
        : this.$q.iconSet.arrow.dropdown
    },

    squaredMenu () {
      return this.optionsCover === false &&
        this.outlined !== true &&
        this.standout !== true &&
        this.borderless !== true &&
        this.rounded !== true
    },

    computedOptionsSelectedClass () {
      return this.optionsSelectedClass !== void 0
        ? this.optionsSelectedClass
        : (this.color !== void 0 ? `text-${this.color}` : '')
    },

    innerOptionsValue () {
      return this.innerValue.map(opt => this.getOptionValue(opt))
    },

    // returns method to get value of an option;
    // takes into account 'option-value' prop
    getOptionValue () {
      return this.__getPropValueFn('optionValue', 'value')
    },

    // returns method to get label of an option;
    // takes into account 'option-label' prop
    getOptionLabel () {
      return this.__getPropValueFn('optionLabel', 'label')
    },

    // returns method to tell if an option is disabled;
    // takes into account 'option-disable' prop
    isOptionDisabled () {
      return this.__getPropValueFn('optionDisable', 'disable')
    },

    inputControlEvents () {
      const on = {
        input: this.__onInput,
        // Safari < 10.2 & UIWebView doesn't fire compositionend when
        // switching focus before confirming composition choice
        // this also fixes the issue where some browsers e.g. iOS Chrome
        // fires "change" instead of "input" on autocomplete.
        change: this.__onChange,
        keydown: this.__onTargetKeydown,
        keyup: this.__onTargetAutocomplete,
        keypress: this.__onTargetKeypress,
        focus: this.__selectInputText,
        click: e => {
          this.hasDialog === true && stop(e)
        }
      }

      on.compositionstart = on.compositionupdate = on.compositionend = this.__onComposition

      return on
    },

    virtualScrollItemSizeComputed () {
      return this.virtualScrollItemSize === void 0
        ? (this.dense === true ? 24 : 48)
        : this.virtualScrollItemSize
    }
  },

  methods: {
    getEmittingOptionValue (opt) {
      return this.emitValue === true
        ? this.getOptionValue(opt)
        : opt
    },

    removeAtIndex (index) {
      if (index > -1 && index < this.innerValue.length) {
        if (this.multiple === true) {
          const model = this.value.slice()
          this.$emit('remove', { index, value: model.splice(index, 1)[0] })
          this.$emit('input', model)
        }
        else {
          this.$emit('input', null)
        }
      }
    },

    __removeAtIndexAndFocus (index) {
      this.removeAtIndex(index)
      this.__focus()
    },

    add (opt, unique) {
      const val = this.getEmittingOptionValue(opt)

      if (this.multiple !== true) {
        this.fillInput === true && this.updateInputValue(
          this.getOptionLabel(opt),
          true,
          true
        )

        this.$emit('input', val)
        return
      }

      if (this.innerValue.length === 0) {
        this.$emit('add', { index: 0, value: val })
        this.$emit('input', this.multiple === true ? [ val ] : val)
        return
      }

      if (unique === true && this.isOptionSelected(opt) === true) {
        return
      }

      if (this.maxValues !== void 0 && this.value.length >= this.maxValues) {
        return
      }

      const model = this.value.slice()

      this.$emit('add', { index: model.length, value: val })
      model.push(val)
      this.$emit('input', model)
    },

    toggleOption (opt, keepOpen) {
      if (this.editable !== true || opt === void 0 || this.isOptionDisabled(opt) === true) {
        return
      }

      const optValue = this.getOptionValue(opt)

      if (this.multiple !== true) {
        if (keepOpen !== true) {
          this.updateInputValue(
            this.fillInput === true ? this.getOptionLabel(opt) : '',
            true,
            true
          )

          this.hidePopup()
        }

        this.$refs.target !== void 0 && this.$refs.target.focus()

        if (isDeepEqual(this.getOptionValue(this.innerValue[0]), optValue) !== true) {
          this.$emit('input', this.emitValue === true ? optValue : opt)
        }
        return
      }

      (this.hasDialog !== true || this.dialogFieldFocused === true) && this.__focus()

      this.__selectInputText()

      if (this.innerValue.length === 0) {
        const val = this.emitValue === true ? optValue : opt
        this.$emit('add', { index: 0, value: val })
        this.$emit('input', this.multiple === true ? [ val ] : val)
        return
      }

      const
        model = this.value.slice(),
        index = this.innerOptionsValue.findIndex(v => isDeepEqual(v, optValue))

      if (index > -1) {
        this.$emit('remove', { index, value: model.splice(index, 1)[0] })
      }
      else {
        if (this.maxValues !== void 0 && model.length >= this.maxValues) {
          return
        }

        const val = this.emitValue === true ? optValue : opt

        this.$emit('add', { index: model.length, value: val })
        model.push(val)
      }

      this.$emit('input', model)
    },

    setOptionIndex (index) {
      if (this.$q.platform.is.desktop !== true) { return }

      const val = index > -1 && index < this.virtualScrollLength
        ? index
        : -1

      if (this.optionIndex !== val) {
        this.optionIndex = val
      }
    },

    moveOptionSelection (offset = 1, skipInputValue) {
      if (this.menu === true) {
        let index = this.optionIndex
        do {
          index = normalizeToInterval(
            index + offset,
            -1,
            this.virtualScrollLength - 1
          )
        }
        while (index !== -1 && index !== this.optionIndex && this.isOptionDisabled(this.options[index]) === true)

        if (this.optionIndex !== index) {
          this.setOptionIndex(index)
          this.scrollTo(index)

          if (skipInputValue !== true && this.useInput === true && this.fillInput === true) {
            this.__setInputValue(index >= 0
              ? this.getOptionLabel(this.options[index])
              : this.defaultInputValue
            )
          }
        }
      }
    },

    __getOption (value, innerValueCache) {
      const fn = opt => isDeepEqual(this.getOptionValue(opt), value)
      return this.options.find(fn) || innerValueCache.find(fn) || value
    },

    __getPropValueFn (propName, defaultVal) {
      const val = this[propName] !== void 0
        ? this[propName]
        : defaultVal

      return typeof val === 'function'
        ? val
        : opt => Object(opt) === opt && val in opt
          ? opt[val]
          : opt
    },

    isOptionSelected (opt) {
      const val = this.getOptionValue(opt)
      return this.innerOptionsValue.find(v => isDeepEqual(v, val)) !== void 0
    },

    __selectInputText () {
      if (this.useInput === true && this.$refs.target !== void 0) {
        this.$refs.target.select()
      }
    },

    __onTargetKeyup (e) {
      // if ESC and we have an opened menu
      // then stop propagation (might be caught by a QDialog
      // and so it will also close the QDialog, which is wrong)
      if (isKeyCode(e, 27) === true && this.menu === true) {
        stop(e)
        // on ESC we need to close the dialog also
        this.hidePopup()
        this.__resetInputValue()
      }

      this.$emit('keyup', e)
    },

    __onTargetAutocomplete (e) {
      const { value } = e.target

      if (e.keyCode !== void 0) {
        this.__onTargetKeyup(e)
        return
      }

      e.target.value = ''
      clearTimeout(this.inputTimer)
      this.__resetInputValue()

      if (typeof value === 'string' && value.length > 0) {
        const needle = value.toLocaleLowerCase()

        let fn = opt => this.getOptionValue(opt).toLocaleLowerCase() === needle
        let option = this.options.find(fn)

        if (option !== void 0) {
          if (this.innerValue.indexOf(option) === -1) {
            this.toggleOption(option)
          }
          else {
            this.hidePopup()
          }
        }
        else {
          fn = opt => this.getOptionLabel(opt).toLocaleLowerCase() === needle
          option = this.options.find(fn)

          if (option !== void 0) {
            if (this.innerValue.indexOf(option) === -1) {
              this.toggleOption(option)
            }
            else {
              this.hidePopup()
            }
          }
          else {
            this.filter(value, true)
          }
        }
      }
      else {
        this.__clearValue(e)
      }
    },

    __onTargetKeypress (e) {
      this.$emit('keypress', e)
    },

    __onTargetKeydown (e) {
      this.$emit('keydown', e)

      if (shouldIgnoreKey(e) === true) {
        return
      }

      const newValueModeValid = this.inputValue.length > 0 &&
        (this.newValueMode !== void 0 || this.qListeners['new-value'] !== void 0)
      const tabShouldSelect = e.shiftKey !== true &&
        this.multiple !== true &&
        (this.optionIndex > -1 || newValueModeValid === true)

      // escape
      if (e.keyCode === 27) {
        prevent(e) // prevent clearing the inputValue
        return
      }

      // tab
      if (e.keyCode === 9 && tabShouldSelect === false) {
        this.__closeMenu()
        return
      }

      if (e.target === void 0 || e.target.id !== this.targetUid) { return }

      // down
      if (
        e.keyCode === 40 &&
        this.innerLoading !== true &&
        this.menu === false
      ) {
        stopAndPrevent(e)
        this.showPopup()
        return
      }

      // backspace
      if (
        e.keyCode === 8 &&
        this.hideSelected !== true &&
        this.inputValue.length === 0
      ) {
        if (this.multiple === true && Array.isArray(this.value)) {
          this.removeAtIndex(this.value.length - 1)
        }
        else if (this.multiple !== true && this.value !== null) {
          this.$emit('input', null)
        }
        return
      }

      // home, end - 36, 35
      if (
        (e.keyCode === 35 || e.keyCode === 36) &&
        (typeof this.inputValue !== 'string' || this.inputValue.length === 0)
      ) {
        stopAndPrevent(e)
        this.optionIndex = -1
        this.moveOptionSelection(e.keyCode === 36 ? 1 : -1, this.multiple)
      }

      // pg up, pg down - 33, 34
      if (
        (e.keyCode === 33 || e.keyCode === 34) &&
        this.virtualScrollSliceSizeComputed !== void 0
      ) {
        stopAndPrevent(e)
        this.optionIndex = Math.max(
          -1,
          Math.min(
            this.virtualScrollLength,
            this.optionIndex + (e.keyCode === 33 ? -1 : 1) * this.virtualScrollSliceSizeComputed.view
          )
        )
        this.moveOptionSelection(e.keyCode === 33 ? 1 : -1, this.multiple)
      }

      // up, down
      if (e.keyCode === 38 || e.keyCode === 40) {
        stopAndPrevent(e)
        this.moveOptionSelection(e.keyCode === 38 ? -1 : 1, this.multiple)
      }

      const optionsLength = this.virtualScrollLength

      // clear search buffer if expired
      if (this.searchBuffer === void 0 || this.searchBufferExp < Date.now()) {
        this.searchBuffer = ''
      }

      // keyboard search when not having use-input
      if (
        optionsLength > 0 &&
        this.useInput !== true &&
        e.key !== void 0 &&
        e.key.length === 1 && // printable char
        e.altKey === e.ctrlKey && // not kbd shortcut
        (e.keyCode !== 32 || this.searchBuffer.length > 0) // space in middle of search
      ) {
        this.menu !== true && this.showPopup(e)

        const
          char = e.key.toLocaleLowerCase(),
          keyRepeat = this.searchBuffer.length === 1 && this.searchBuffer[0] === char

        this.searchBufferExp = Date.now() + 1500
        if (keyRepeat === false) {
          stopAndPrevent(e)
          this.searchBuffer += char
        }

        const searchRe = new RegExp('^' + this.searchBuffer.split('').map(l => reEscapeList.indexOf(l) > -1 ? '\\' + l : l).join('.*'), 'i')

        let index = this.optionIndex

        if (keyRepeat === true || index < 0 || searchRe.test(this.getOptionLabel(this.options[index])) !== true) {
          do {
            index = normalizeToInterval(index + 1, -1, optionsLength - 1)
          }
          while (index !== this.optionIndex && (
            this.isOptionDisabled(this.options[index]) === true ||
            searchRe.test(this.getOptionLabel(this.options[index])) !== true
          ))
        }

        if (this.optionIndex !== index) {
          this.$nextTick(() => {
            this.setOptionIndex(index)
            this.scrollTo(index)

            if (index >= 0 && this.useInput === true && this.fillInput === true) {
              this.__setInputValue(this.getOptionLabel(this.options[index]))
            }
          })
        }

        return
      }

      // enter, space (when not using use-input and not in search), or tab (when not using multiple and option selected)
      // same target is checked above
      if (
        e.keyCode !== 13 &&
        (e.keyCode !== 32 || this.useInput === true || this.searchBuffer !== '') &&
        (e.keyCode !== 9 || tabShouldSelect === false)
      ) { return }

      e.keyCode !== 9 && stopAndPrevent(e)

      if (this.optionIndex > -1 && this.optionIndex < optionsLength) {
        this.toggleOption(this.options[this.optionIndex])
        return
      }

      if (newValueModeValid === true) {
        const done = (val, mode) => {
          if (mode) {
            if (validateNewValueMode(mode) !== true) {
              return
            }
          }
          else {
            mode = this.newValueMode
          }

          if (val === void 0 || val === null) {
            return
          }

          this.updateInputValue('', this.multiple !== true, true)

          this[mode === 'toggle' ? 'toggleOption' : 'add'](
            val,
            mode === 'add-unique'
          )

          if (this.multiple !== true) {
            this.$refs.target !== void 0 && this.$refs.target.focus()
            this.hidePopup()
          }
        }

        if (this.qListeners['new-value'] !== void 0) {
          this.$emit('new-value', this.inputValue, done)
        }
        else {
          done(this.inputValue)
        }

        if (this.multiple !== true) {
          return
        }
      }

      if (this.menu === true) {
        this.__closeMenu()
      }
      else if (this.innerLoading !== true) {
        this.showPopup()
      }
    },

    __getVirtualScrollEl () {
      return this.hasDialog === true
        ? this.$refs.menuContent
        : (
          this.$refs.menu !== void 0 && this.$refs.menu.__portal !== void 0
            ? this.$refs.menu.__portal.$el
            : void 0
        )
    },

    __getVirtualScrollTarget () {
      return this.__getVirtualScrollEl()
    },

    __getSelection (h) {
      if (this.hideSelected === true) {
        return []
      }

      if (this.$scopedSlots['selected-item'] !== void 0) {
        return this.selectedScope.map(scope => this.$scopedSlots['selected-item'](scope)).slice()
      }

      if (this.$scopedSlots.selected !== void 0) {
        return this.$scopedSlots.selected().slice()
      }

      if (this.useChips === true) {
        return this.selectedScope.map((scope, i) => h(QChip, {
          key: 'option-' + i,
          props: {
            removable: this.editable === true && this.isOptionDisabled(scope.opt) !== true,
            dense: true,
            textColor: this.color,
            tabindex: this.computedTabindex
          },
          on: cache(this, 'rem#' + i, {
            remove () { scope.removeAtIndex(i) }
          })
        }, [
          h('span', {
            staticClass: 'ellipsis',
            domProps: {
              [scope.sanitize === true ? 'textContent' : 'innerHTML']: this.getOptionLabel(scope.opt)
            }
          })
        ]))
      }

      return [
        h('span', {
          domProps: {
            [this.displayAsText ? 'textContent' : 'innerHTML']: this.displayValue !== void 0
              ? this.displayValue
              : this.selectedString
          }
        })
      ]
    },

    __getControl (h, fromDialog) {
      const child = this.__getSelection(h)
      const isTarget = fromDialog === true || this.dialog !== true || this.hasDialog !== true

      if (this.useInput === true) {
        child.push(this.__getInput(h, fromDialog, isTarget))
      }
      // there can be only one (when dialog is opened the control in dialog should be target)
      else if (this.editable === true && isTarget === true) {
        child.push(
          h('div', {
            ref: 'target',
            key: 'd_t',
            staticClass: 'no-outline',
            attrs: {
              id: this.targetUid,
              tabindex: this.tabindex
            },
            on: cache(this, 'f-tget', {
              keydown: this.__onTargetKeydown,
              keyup: this.__onTargetKeyup,
              keypress: this.__onTargetKeypress
            })
          })
        )

        if (typeof this.autocomplete === 'string' && this.autocomplete.length > 0) {
          child.push(
            h('input', {
              staticClass: 'q-select__autocomplete-input no-outline',
              attrs: { autocomplete: this.autocomplete },
              on: cache(this, 'autoinp', {
                keyup: this.__onTargetAutocomplete
              })
            })
          )
        }
      }

      if (this.nameProp !== void 0 && this.disable !== true && this.innerOptionsValue.length > 0) {
        const opts = this.innerOptionsValue.map(value => h('option', {
          attrs: { value, selected: true }
        }))

        child.push(
          h('select', {
            staticClass: 'hidden',
            attrs: {
              name: this.nameProp,
              multiple: this.multiple
            }
          }, opts)
        )
      }

      return h('div', { staticClass: 'q-field__native row items-center', attrs: this.qAttrs }, child)
    },

    __getOptions (h) {
      if (this.menu !== true) {
        return void 0
      }

      if (
        this.$scopedSlots.option !== void 0 &&
        this.__optionScopeCache.optionSlot !== this.$scopedSlots.option
      ) {
        this.__optionScopeCache.optionSlot = this.$scopedSlots.option
        this.__optionScopeCache.optionEls = []
      }

      const fn = this.$scopedSlots.option !== void 0
        ? this.$scopedSlots.option
        : scope => h(QItem, {
          key: scope.index,
          props: scope.itemProps,
          on: scope.itemEvents
        }, [
          h(QItemSection, [
            h(QItemLabel, {
              domProps: {
                [scope.sanitize === true ? 'textContent' : 'innerHTML']: this.getOptionLabel(scope.opt)
              }
            })
          ])
        ])

      const { optionEls } = this.__optionScopeCache

      let options = this.__padVirtualScroll(h, 'div', this.optionScope.map((scope, i) => {
        if (optionEls[i] === void 0) {
          optionEls[i] = fn(scope)
        }

        return optionEls[i]
      }))

      if (this.$scopedSlots['before-options'] !== void 0) {
        options = this.$scopedSlots['before-options']().concat(options)
      }

      return mergeSlot(options, this, 'after-options')
    },

    __getInnerAppend (h) {
      return this.loading !== true && this.innerLoadingIndicator !== true && this.hideDropdownIcon !== true
        ? [
          h(QIcon, {
            staticClass: 'q-select__dropdown-icon' + (this.menu === true ? ' rotate-180' : ''),
            props: { name: this.dropdownArrowIcon }
          })
        ]
        : null
    },

    __getInput (h, fromDialog, isTarget) {
      const options = {
        ref: isTarget === true ? 'target' : void 0,
        key: 'i_t',
        staticClass: 'q-field__input q-placeholder col',
        style: this.inputStyle,
        class: this.computedInputClass,
        domProps: { value: this.inputValue !== void 0 ? this.inputValue : '' },
        attrs: {
          // required for Android in order to show ENTER key when in form
          type: 'search',
          ...this.qAttrs,
          id: this.targetUid,
          maxlength: this.maxlength, // this is converted to prop by QField
          tabindex: this.tabindex,
          autocomplete: this.autocomplete,
          'data-autofocus': fromDialog === true ? false : this.autofocus,
          disabled: this.disable === true,
          readonly: this.readonly === true
        },
        on: this.inputControlEvents
      }

      if (fromDialog !== true && this.hasDialog === true) {
        options.staticClass += ' no-pointer-events'
      }

      return h('input', options)
    },

    __onChange (e) {
      this.__onComposition(e)
    },

    __onInput (e) {
      clearTimeout(this.inputTimer)

      if (e && e.target && e.target.composing === true) {
        return
      }

      this.__setInputValue(e.target.value || '')
      // mark it here as user input so that if updateInputValue is called
      // before filter is called the indicator is reset
      this.userInputValue = true
      this.defaultInputValue = this.inputValue

      if (
        this.focused !== true &&
        (this.hasDialog !== true || this.dialogFieldFocused === true)
      ) {
        this.__focus()
      }

      if (this.qListeners.filter !== void 0) {
        this.inputTimer = setTimeout(() => {
          this.filter(this.inputValue)
        }, this.inputDebounce)
      }
    },

    __setInputValue (inputValue) {
      if (this.inputValue !== inputValue) {
        this.inputValue = inputValue
        this.$emit('input-value', inputValue)
      }
    },

    updateInputValue (val, noFiltering, internal) {
      this.userInputValue = internal !== true

      if (this.useInput === true) {
        this.__setInputValue(val)

        if (noFiltering === true || internal !== true) {
          this.defaultInputValue = val
        }

        noFiltering !== true && this.filter(val)
      }
    },

    filter (val, keepClosed) {
      if (this.qListeners.filter === void 0 || (keepClosed !== true && this.focused !== true)) {
        return
      }

      if (this.innerLoading === true) {
        this.$emit('filter-abort')
      }
      else {
        this.innerLoading = true
        this.innerLoadingIndicator = true
      }

      if (
        val !== '' &&
        this.multiple !== true &&
        this.innerValue.length > 0 &&
        this.userInputValue !== true &&
        val === this.getOptionLabel(this.innerValue[0])
      ) {
        val = ''
      }

      const filterId = setTimeout(() => {
        this.menu === true && (this.menu = false)
      }, 10)
      clearTimeout(this.filterId)
      this.filterId = filterId

      this.$emit(
        'filter',
        val,
        (fn, afterFn) => {
          if ((keepClosed === true || this.focused === true) && this.filterId === filterId) {
            clearTimeout(this.filterId)

            typeof fn === 'function' && fn()

            // hide indicator to allow arrow to animate
            this.innerLoadingIndicator = false

            this.$nextTick(() => {
              this.innerLoading = false

              if (this.editable === true) {
                if (keepClosed === true) {
                  this.menu === true && this.hidePopup()
                }
                else if (this.menu === true) {
                  this.__updateMenu(true)
                }
                else {
                  this.menu = true
                }
              }

              typeof afterFn === 'function' && this.$nextTick(() => { afterFn(this) })
            })
          }
        },
        () => {
          if (this.focused === true && this.filterId === filterId) {
            clearTimeout(this.filterId)
            this.innerLoading = false
            this.innerLoadingIndicator = false
          }
          this.menu === true && (this.menu = false)
        }
      )
    },

    __getControlEvents () {
      const focusout = e => {
        this.__onControlFocusout(e, () => {
          this.__resetInputValue()
          this.__closeMenu()
        })
      }

      return {
        focusin: this.__onControlFocusin,
        focusout,
        'popup-show': this.__onControlPopupShow,
        'popup-hide': e => {
          e !== void 0 && stop(e)
          this.$emit('popup-hide', e)
          this.hasPopupOpen = false
          focusout(e)
        },
        click: e => {
          if (this.hasDialog !== true) {
            // label from QField will propagate click on the input (except IE)
            prevent(e)

            if (this.menu === true) {
              this.__closeMenu()
              this.$refs.target !== void 0 && this.$refs.target.focus()
              return
            }
          }

          this.showPopup(e)
        }
      }
    },

    __getControlChild (h) {
      if (
        this.editable !== false && (
          this.dialog === true || // dialog always has menu displayed, so need to render it
          this.noOptions !== true ||
          this.$scopedSlots['no-option'] !== void 0 ||
          this.noOptionLabel !== void 0
        )
      ) {
        return this[`__get${this.hasDialog === true ? 'Dialog' : 'Menu'}`](h)
      }
    },

    __getMenu (h) {
      const child = this.noOptions === true
        ? (
          this.$scopedSlots['no-option'] !== void 0
            ? this.$scopedSlots['no-option']({ inputValue: this.inputValue })
            : (this.noOptionLabel !== void 0 ? [h(QItem, {}, [
              h(QItemSection, [
                h(QItemLabel, {
                  staticClass: 'text-grey',
                  domProps: { textContent: this.noOptionLabel }
                })
              ])
            ])] : null)
        )
        : this.__getOptions(h)

      return h(QMenu, {
        ref: 'menu',
        props: {
          value: this.menu,
          fit: this.menuShrink !== true,
          cover: this.optionsCover === true && this.noOptions !== true && this.useInput !== true,
          anchor: this.menuAnchor,
          self: this.menuSelf,
          offset: this.menuOffset,
          contentClass: this.menuContentClass,
          contentStyle: this.popupContentStyle,
          dark: this.isOptionsDark,
          noParentEvent: true,
          noRefocus: true,
          noFocus: true,
          square: this.squaredMenu,
          transitionShow: this.transitionShow,
          transitionHide: this.transitionHide,
          separateClosePopup: true
        },
        on: cache(this, 'menu', {
          '&scroll': this.__onVirtualScrollEvt,
          'before-hide': this.__closeMenu,
          show: this.__onMenuShow
        })
      }, child)
    },

    __onMenuShow () {
      this.__setVirtualScrollSize()
    },

    __onDialogFieldFocus (e) {
      stop(e)
      this.$refs.target !== void 0 && this.$refs.target.focus()
      this.dialogFieldFocused = true
      window.scrollTo(window.pageXOffset || window.scrollX || document.body.scrollLeft || 0, 0)
    },

    __onDialogFieldBlur (e) {
      stop(e)
      this.$nextTick(() => {
        this.dialogFieldFocused = false
      })
    },

    __getDialog (h) {
      const content = [
        h(QField, {
          staticClass: `col-auto ${this.fieldClass}`,
          props: {
            ...this.$props,
            for: this.targetUid,
            dark: this.isOptionsDark,
            square: true,
            filled: true,
            itemAligned: false,
            loading: this.innerLoadingIndicator,
            stackLabel: this.inputValue.length > 0
          },
          on: {
            ...this.qListeners,
            focus: this.__onDialogFieldFocus,
            blur: this.__onDialogFieldBlur
          },
          scopedSlots: {
            ...this.$scopedSlots,
            rawControl: () => this.__getControl(h, true),
            before: void 0,
            after: void 0
          }
        })
      ]

      this.menu === true && content.push(
        h('div', {
          ref: 'menuContent',
          staticClass: 'scroll',
          class: this.menuContentClass,
          style: this.popupContentStyle,
          on: cache(this, 'virtMenu', {
            click: prevent,
            '&scroll': this.__onVirtualScrollEvt
          })
        }, (
          this.noOptions === true
            ? (
              this.$scopedSlots['no-option'] !== void 0
                ? this.$scopedSlots['no-option']({ inputValue: this.inputValue })
                : (this.noOptionLabel !== void 0 ? [h(QItem, {}, [
                  h(QItemSection, [
                    h(QItemLabel, {
                      staticClass: 'text-grey',
                      domProps: { textContent: this.noOptionLabel }
                    })
                  ])
                ])] : null)
            )
            : this.__getOptions(h)
        ))
      )

      return h(QDialog, {
        ref: 'dialog',
        props: {
          value: this.dialog,
          dark: this.isOptionsDark,
          position: this.useInput === true ? 'top' : void 0,
          transitionShow: this.transitionShowComputed,
          transitionHide: this.transitionHide
        },
        on: cache(this, 'dialog', {
          'before-hide': this.__onDialogBeforeHide,
          hide: this.__onDialogHide,
          show: this.__onDialogShow
        })
      }, [
        h('div', {
          staticClass: 'q-select__dialog' +
            (this.isOptionsDark === true ? ' q-select__dialog--dark q-dark' : '') +
            (this.dialogFieldFocused === true ? ' q-select__dialog--focused' : '')
        }, content)
      ])
    },

    __onDialogBeforeHide () {
      this.$refs.dialog.__refocusTarget = this.$el.querySelector('.q-field__native > [tabindex]:last-child')
      this.focused = false
    },

    __onDialogHide (e) {
      this.hidePopup()
      this.focused === false && this.$emit('blur', e)
      this.__resetInputValue()
    },

    __onDialogShow () {
      const el = document.activeElement
      // IE can have null document.activeElement
      if (
        (el === null || el.id !== this.targetUid) &&
        this.$refs.target !== el &&
        this.$refs.target !== void 0
      ) {
        this.$refs.target.focus()
      }

      this.__setVirtualScrollSize()
    },

    __closeMenu () {
      if (this.__optionScopeCache !== void 0) {
        this.__optionScopeCache.optionEls = []
      }

      if (this.dialog === true) {
        return
      }

      this.optionIndex = -1

      if (this.menu === true) {
        this.menu = false
      }

      if (this.focused === false) {
        clearTimeout(this.filterId)
        this.filterId = void 0

        if (this.innerLoading === true) {
          this.$emit('filter-abort')
          this.innerLoading = false
          this.innerLoadingIndicator = false
        }
      }
    },

    showPopup (e) {
      if (this.editable !== true) {
        return
      }

      if (this.hasDialog === true) {
        this.__onControlFocusin(e)
        this.dialog = true
        this.$nextTick(() => {
          this.__focus()
        })
      }
      else {
        this.__focus()
      }

      if (this.qListeners.filter !== void 0) {
        this.filter(this.inputValue)
      }
      else if (this.noOptions !== true || this.$scopedSlots['no-option'] !== void 0 || this.noOptionLabel !== void 0) {
        this.menu = true
      }
    },

    hidePopup () {
      this.dialog = false
      this.__closeMenu()
    },

    __resetInputValue () {
      this.useInput === true && this.updateInputValue(
        this.multiple !== true && this.fillInput === true && this.innerValue.length > 0
          ? this.getOptionLabel(this.innerValue[0]) || ''
          : '',
        true,
        true
      )
    },

    __updateMenu (show) {
      let optionIndex = -1

      if (show === true) {
        if (this.innerValue.length > 0) {
          const val = this.getOptionValue(this.innerValue[0])
          optionIndex = this.options.findIndex(v => isDeepEqual(this.getOptionValue(v), val))
        }

        this.__resetVirtualScroll(optionIndex)
      }

      this.setOptionIndex(optionIndex)
    },

    __onPreRender () {
      this.hasDialog = this.$q.platform.is.mobile !== true && this.behavior !== 'dialog'
        ? false
        : this.behavior !== 'menu' && (
          this.useInput === true
            ? this.$scopedSlots['no-option'] !== void 0 || this.noOptionLabel !== void 0 || this.qListeners.filter !== void 0 || this.noOptions === false
            : true
        )

      this.transitionShowComputed = this.hasDialog === true && this.useInput === true && this.$q.platform.is.ios === true
        ? 'fade'
        : this.transitionShow
    },

    __onPostRender () {
      if (this.dialog === false && this.$refs.menu !== void 0) {
        this.$refs.menu.updatePosition()
      }
    },

    updateMenuPosition () {
      this.__onPostRender()
    }
  },

  beforeMount () {
    this.__optionScopeCache = {
      optionSlot: this.$scopedSlots.option,
      options: [],
      optionEls: []
    }
  },

  beforeDestroy () {
    this.__optionScopeCache = void 0
    clearTimeout(this.inputTimer)
  }
})

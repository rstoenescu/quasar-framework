import Vue from 'vue'

import QDialog from '../dialog/QDialog.js'
import QBtn from '../btn/QBtn.js'

import clone from '../../utils/clone.js'
import { isKeyCode } from '../../utils/key-composition.js'

import QCard from '../card/QCard.js'
import QCardSection from '../card/QCardSection.js'
import QCardActions from '../card/QCardActions.js'
import QSeparator from '../separator/QSeparator.js'

import QInput from '../input/QInput.js'
import QOptionGroup from '../option-group/QOptionGroup.js'

import QSpinner from '../spinner/QSpinner.js'

import DarkMixin from '../../mixins/dark.js'
import AttrsMixin from '../../mixins/attrs.js'

import cache from '../../utils/cache.js'

export default Vue.extend({
  name: 'DialogPlugin',

  mixins: [ DarkMixin, AttrsMixin ],

  inheritAttrs: false,

  props: {
    title: String,
    message: String,
    prompt: Object,
    options: Object,
    progress: [ Boolean, Object ],

    html: Boolean,

    ok: {
      type: [ String, Object, Boolean ],
      default: true
    },
    cancel: [ String, Object, Boolean ],
    focus: {
      type: String,
      default: 'ok',
      validator: v => ['ok', 'cancel', 'none'].includes(v)
    },

    stackButtons: Boolean,
    color: String,

    cardClass: [ String, Array, Object ],
    cardStyle: [ String, Array, Object ]
  },

  computed: {
    classes () {
      return 'q-dialog-plugin' +
        ` q-dialog-plugin--${this.darkSuffix} q-${this.darkSuffix}` +
        (this.progress !== false ? ' q-dialog-plugin--progress' : '')
    },

    spinner () {
      if (this.progress !== false) {
        return Object(this.progress) === this.progress
          ? {
            component: this.progress.spinner || QSpinner,
            props: { color: this.progress.color || this.vmColor }
          }
          : {
            component: QSpinner,
            props: { color: this.vmColor }
          }
      }
    },

    hasForm () {
      return this.prompt !== void 0 || this.options !== void 0
    },

    okLabel () {
      return Object(this.ok) === this.ok
        ? this.$q.lang.label.ok
        : (
          this.ok === true
            ? this.$q.lang.label.ok
            : this.ok
        )
    },

    cancelLabel () {
      return Object(this.cancel) === this.cancel
        ? this.$q.lang.label.cancel
        : (
          this.cancel === true
            ? this.$q.lang.label.cancel
            : this.cancel
        )
    },

    vmColor () {
      return this.color || `dialog-plugin-${this.darkSuffix}`
    },

    okDisabled () {
      if (this.prompt !== void 0) {
        return this.prompt.isValid !== void 0 &&
          this.prompt.isValid(this.prompt.model) !== true
      }
      if (this.options !== void 0) {
        return this.options.isValid !== void 0 &&
          this.options.isValid(this.options.model) !== true
      }
    },

    okProps () {
      return {
        color: this.vmColor,
        label: this.okLabel,
        ripple: false,
        ...(Object(this.ok) === this.ok ? this.ok : { flat: true }),
        disable: this.okDisabled
      }
    },

    cancelProps () {
      return {
        color: this.vmColor,
        label: this.cancelLabel,
        ripple: false,
        ...(Object(this.cancel) === this.cancel ? this.cancel : { flat: true })
      }
    }
  },

  methods: {
    show () {
      this.$refs.dialog.show()
    },

    hide () {
      this.$refs.dialog.hide()
    },

    getPrompt (h) {
      return [
        h(QInput, {
          props: {
            value: this.prompt.model,
            type: this.prompt.type,

            label: this.prompt.label,
            stackLabel: this.prompt.stackLabel,

            outlined: this.prompt.outlined,
            filled: this.prompt.filled,
            standout: this.prompt.standout,
            rounded: this.prompt.rounded,
            square: this.prompt.square,

            counter: this.prompt.counter,
            maxlength: this.prompt.maxlength,
            prefix: this.prompt.prefix,
            suffix: this.prompt.suffix,

            color: this.vmColor,
            dense: true,
            autofocus: true,
            dark: this.dark
          },
          attrs: this.prompt.attrs,
          on: cache(this, 'prompt', {
            input: v => { this.prompt.model = v },
            keyup: evt => {
              // if ENTER key
              if (
                this.okDisabled !== true &&
                this.prompt.type !== 'textarea' &&
                isKeyCode(evt, 13) === true
              ) {
                this.onOk()
              }
            }
          })
        })
      ]
    },

    getOptions (h) {
      return [
        h(QOptionGroup, {
          props: {
            value: this.options.model,
            type: this.options.type,
            color: this.vmColor,
            inline: this.options.inline,
            options: this.options.items,
            dark: this.dark
          },
          on: cache(this, 'opts', {
            input: v => { this.options.model = v }
          })
        })
      ]
    },

    getButtons (h) {
      const child = []

      this.cancel && child.push(h(QBtn, {
        props: this.cancelProps,
        attrs: { 'data-autofocus': this.focus === 'cancel' && this.hasForm !== true },
        on: cache(this, 'cancel', { click: this.onCancel })
      }))

      this.ok && child.push(h(QBtn, {
        props: this.okProps,
        attrs: { 'data-autofocus': this.focus === 'ok' && this.hasForm !== true },
        on: cache(this, 'ok', { click: this.onOk })
      }))

      if (child.length > 0) {
        return h(QCardActions, {
          staticClass: this.stackButtons === true ? 'items-end' : null,
          props: {
            vertical: this.stackButtons,
            align: 'right'
          }
        }, child)
      }
    },

    onOk () {
      this.$emit('ok', clone(this.getData()))
      this.hide()
    },

    onCancel () {
      this.hide()
    },

    getData () {
      return this.prompt !== void 0
        ? this.prompt.model
        : (this.options !== void 0 ? this.options.model : void 0)
    },

    getSection (h, staticClass, text) {
      return this.html === true
        ? h(QCardSection, {
          staticClass,
          domProps: { innerHTML: text }
        })
        : h(QCardSection, { staticClass }, [ text ])
    }
  },

  render (h) {
    const child = []

    this.title && child.push(
      this.getSection(h, 'q-dialog__title', this.title)
    )

    this.progress !== false && child.push(
      h(QCardSection, { staticClass: 'q-dialog__progress' }, [
        h(this.spinner.component, {
          props: this.spinner.props
        })
      ])
    )

    this.message && child.push(
      this.getSection(h, 'q-dialog__message', this.message)
    )

    if (this.prompt !== void 0) {
      child.push(
        h(
          QCardSection,
          { staticClass: 'scroll q-dialog-plugin__form' },
          this.getPrompt(h)
        )
      )
    }
    else if (this.options !== void 0) {
      child.push(
        h(QSeparator, { props: { dark: this.dark } }),
        h(
          QCardSection,
          { staticClass: 'scroll q-dialog-plugin__form' },
          this.getOptions(h)
        ),
        h(QSeparator, { props: { dark: this.dark } })
      )
    }

    if (this.ok || this.cancel) {
      child.push(this.getButtons(h))
    }

    return h(QDialog, {
      ref: 'dialog',

      props: {
        ...this.qAttrs,
        value: this.value
      },

      on: cache(this, 'hide', {
        hide: () => {
          this.$emit('hide')
        }
      })
    }, [
      h(QCard, {
        staticClass: this.classes,
        style: this.cardStyle,
        class: this.cardClass,
        props: { dark: this.dark }
      }, child)
    ])
  }
})

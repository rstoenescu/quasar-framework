<template>
  <div class="q-layout-padding q-mx-auto">
    <div class="row justify-center q-mt-xl q-pt-xl">
      <q-toggle class="q-mb-xl" v-model="dark" label="Dark" :false-value="null" />
      <div class="q-gutter-md" style="max-width: 700px">
        <q-btn label="Alert" flat color="primary" @click="alert" />
        <q-btn label="Alert - custom" flat color="primary" @click="alertCustom" />
        <q-btn label="Confirm" flat color="primary" @click="confirm()" />
        <q-btn label="Confirm (ok)" flat color="primary" @click="confirm('ok')" />
        <q-btn label="Confirm (cancel)" flat color="primary" @click="confirm('cancel')" />
        <q-btn label="Confirm (none)" flat color="primary" @click="confirm('none')" />
        <q-btn label="Prompt" flat color="primary" @click="prompt" />
        <q-btn label="Radio Options" flat color="primary" @click="radio" />
        <q-btn label="Checkbox Options" flat color="primary" @click="checkbox" />
        <q-btn label="Toggle Options" flat color="primary" @click="toggle" />
        <q-btn label="Update test" flat color="primary" @click="updateTest" />
        <q-btn label="Progress" flat color="primary" @click="progress" />
        <q-btn label="Positioned" flat color="primary" @click="positioned" />
        <q-btn label="Stacked Buttons" flat color="primary" @click="stacked" />
        <q-btn label="Auto Closing" flat color="primary" @click="autoClose" />
        <q-btn label="Custom component with Parent" no-caps flat color="primary" @click="customComponentWithParent(false)" />
        <q-btn label="Custom component w/o Parent" no-caps flat color="primary" @click="customComponentNoParent(false)" />
        <q-btn label="Custom component with Parent (async)" no-caps flat color="primary" @click="customComponentWithParent(true)" />
        <q-btn label="Custom component w/o Parent (async)" no-caps flat color="primary" @click="customComponentNoParent(true)" />
        <q-btn label="With HTML" flat color="primary" @click="unsafe" />
        <q-btn label="Prompt (validation)" flat color="primary" @click="promptValidation" />
        <q-btn label="Radio (validation)" flat color="primary" @click="radioValidation" />
        <q-btn label="Checkbox (validation)" flat color="primary" @click="checkboxValidation" />
        <q-btn-dropdown color="accent" label="Open from dropdown" unelevated>
          <q-list flat>
            <q-item @click="alert" clickable v-close-popup>
              <q-item-section>
                <q-item-label>Alert - list item</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-btn label="Alert" flat color="primary" @click="alert" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-btn label="Alert - custom" flat color="primary" @click="alertCustom" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-btn label="Confirm" flat color="primary" @click="confirm" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-btn label="Prompt" flat color="primary" @click="prompt" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-btn label="Radio Options" flat color="primary" @click="radio" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-btn label="Checkbox Options" flat color="primary" @click="checkbox" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-btn label="Toggle Options" flat color="primary" @click="toggle" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-btn label="Positioned" flat color="primary" @click="positioned" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-btn label="Stacked Buttons" flat color="primary" @click="stacked" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-btn label="Auto Closing" flat color="primary" @click="autoClose" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-btn label="Custom component with Parent" no-caps flat color="primary" @click="customComponentWithParent" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-btn label="Custom component w/o Parent" no-caps flat color="primary" @click="customComponentNoParent" />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-btn label="With HTML" flat color="primary" @click="unsafe" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <div class="text-center text-caption q-mt-xl" style="height: 1500px">
      <div v-for="n in 10" :key="n">
        Page has scroll on purpose
      </div>
    </div>
  </div>
</template>

<script>
import { QSpinnerGears, QSpinnerCube } from 'quasar'

import DialogComponentWithParent from './dialog-component-with-parent.js'
import DialogComponentNoParent from './dialog-component-no-parent.js'

export default {
  provide: {
    providedTest: 'Provide/Inject works!'
  },

  data () {
    return {
      dark: null
    }
  },

  methods: {
    hideDialog () {
      if (this.dialogHandler !== void 0) {
        this.dialogHandler.hide()
      }
    },

    alert () {
      this.dialogHandler = this.$q.dialog({
        title: 'Alert',
        message: 'Some message',
        dark: this.dark
      }).onOk(() => {
        console.log('OK')
      }).onCancel(() => {
        console.log('Cancel')
      }).onDismiss(() => {
        this.dialogHandler = void 0
      })
    },

    alertCustom () {
      this.dialogHandler = this.$q.dialog({
        title: 'Alert',
        message: 'Some message',
        class: 'custom-dialog',
        dark: this.dark,
        ok: {
          color: 'black'
        }
      }).onOk(() => {
        console.log('OK')
      }).onCancel(() => {
        console.log('Cancel')
      }).onDismiss(() => {
        this.dialogHandler = void 0
      })
    },

    confirm (focus) {
      this.dialogHandler = this.$q.dialog({
        title: 'Confirm',
        message: 'Would you like to turn on the wifi?',
        ok: {
          push: true,
          textColor: this.dark ? 'primary' : 'white'
        },
        cancel: {
          push: true,
          color: 'negative'
        },
        focus,
        persistent: true,
        dark: this.dark
      }).onOk(() => {
        console.log('>>>> OK')
      }).onOk(() => {
        console.log('>>>> second OK catcher')
      }).onCancel(() => {
        console.log('>>>> Cancel')
      }).onDismiss(() => {
        this.dialogHandler = void 0
      })
    },

    prompt () {
      this.dialogHandler = this.$q.dialog({
        title: 'Prompt',
        message: 'What is your name?',
        prompt: {
          model: '',
          type: 'text' // optional
        },
        cancel: true,
        persistent: true,
        color: 'secondary',
        dark: this.dark
      }).onOk(data => {
        console.log('>>>> OK, received', data)
      }).onCancel(() => {
        console.log('>>>> Cancel')
      }).onDismiss(() => {
        this.dialogHandler = void 0
      })
    },

    promptValidation () {
      this.dialogHandler = this.$q.dialog({
        title: 'Prompt',
        message: 'Length > 0',
        prompt: {
          model: '',
          isValid: val => val.length > 0,
          type: 'text' // optional
        },
        cancel: true,
        persistent: true,
        color: 'secondary',
        dark: this.dark
      }).onOk(data => {
        console.log('>>>> OK, received', data)
      }).onCancel(() => {
        console.log('>>>> Cancel')
      }).onDismiss(() => {
        this.dialogHandler = void 0
      })
    },

    radio () {
      this.dialogHandler = this.$q.dialog({
        title: 'Options',
        message: 'Choose your options',
        options: {
          type: 'radio',
          model: 'opt1',
          // inline: true
          items: [
            { label: 'Option 1', value: 'opt1', color: 'secondary' },
            { label: 'Option 2', value: 'opt2' },
            { label: 'Option 3', value: 'opt3' }
          ]
        },
        cancel: true,
        persistent: true,
        dark: this.dark
      }).onOk(data => {
        console.log('>>>> OK, received', data)
      }).onCancel(() => {
        console.log('>>>> Cancel')
      }).onDismiss(() => {
        this.dialogHandler = void 0
      })
    },

    radioValidation () {
      this.dialogHandler = this.$q.dialog({
        title: 'Options',
        message: 'Need to select option 2',
        options: {
          type: 'radio',
          model: 'opt1',
          isValid: val => val === 'opt2',
          // inline: true
          items: [
            { label: 'Option 1', value: 'opt1', color: 'secondary' },
            { label: 'Option 2', value: 'opt2' },
            { label: 'Option 3', value: 'opt3' }
          ]
        },
        cancel: true,
        persistent: true,
        dark: this.dark
      }).onOk(data => {
        console.log('>>>> OK, received', data)
      }).onCancel(() => {
        console.log('>>>> Cancel')
      }).onDismiss(() => {
        this.dialogHandler = void 0
      })
    },

    checkbox () {
      this.dialogHandler = this.$q.dialog({
        title: 'Options',
        message: 'Choose your options',
        options: {
          type: 'checkbox',
          model: [],
          // inline: true
          items: [
            { label: 'Option 1', value: 'opt1', color: 'secondary' },
            { label: 'Option 2', value: 'opt2' },
            { label: 'Option 3', value: 'opt3' }
          ]
        },
        cancel: true,
        persistent: true,
        dark: this.dark
      }).onOk(data => {
        console.log('>>>> OK, received', data)
      }).onCancel(() => {
        console.log('>>>> Cancel')
      }).onDismiss(() => {
        this.dialogHandler = void 0
      })
    },

    checkboxValidation () {
      this.dialogHandler = this.$q.dialog({
        title: 'Options',
        message: 'Need to checkmark option 1',
        options: {
          type: 'checkbox',
          model: [],
          isValid: val => val.includes('opt1'),
          // inline: true
          items: [
            { label: 'Option 1', value: 'opt1', color: 'secondary' },
            { label: 'Option 2', value: 'opt2' },
            { label: 'Option 3', value: 'opt3' }
          ]
        },
        cancel: true,
        persistent: true,
        dark: this.dark
      }).onOk(data => {
        console.log('>>>> OK, received', data)
      }).onCancel(() => {
        console.log('>>>> Cancel')
      }).onDismiss(() => {
        this.dialogHandler = void 0
      })
    },

    toggle () {
      this.dialogHandler = this.$q.dialog({
        title: 'Options',
        message: 'Choose your options',
        options: {
          type: 'toggle',
          model: [],
          // inline: true,
          items: [
            { label: 'Option 1', value: 'opt1', color: 'secondary' },
            { label: 'Option 2', value: 'opt2' },
            { label: 'Option 3', value: 'opt3' }
          ]
        },
        cancel: true,
        persistent: true,
        dark: this.dark
      }).onOk(data => {
        console.log('>>>> OK, received', data)
      }).onCancel(() => {
        console.log('>>>> Cancel')
      }).onDismiss(() => {
        this.dialogHandler = void 0
      })
    },

    updateTest () {
      const dialog = this.$q.dialog({
        dark: true,
        title: 'Prompt',
        message: 'What is your name?',
        prompt: {
          model: '',
          label: 'Text',
          type: 'text' // optional
        },
        progress: true,
        cancel: true,
        persistent: true
      })

      setTimeout(() => {
        dialog.update({
          title: void 0,
          message: 'New message',
          dark: false,
          prompt: { model: 'new value' },
          ok: false,
          persistent: false,
          cancel: false
        })
      }, 1000)

      setTimeout(() => {
        dialog.update({
          message: 'Lorem ipsum dolor amit. Lorem ipsum dolor amit. Lorem ipsum dolor amit. Lorem ipsum dolor amit. Lorem ipsum dolor amit. Lorem ipsum dolor amit. Lorem ipsum dolor amit. Lorem ipsum dolor amit. Lorem ipsum dolor amit. ',
          prompt: void 0,
          progress: {
            spinner: QSpinnerGears
          }
        })
      }, 2000)

      setTimeout(() => {
        dialog.update({
          message: 'Some other message',
          progress: {
            color: 'amber'
          }
        })
      }, 3000)

      setTimeout(() => {
        dialog.update({
          message: 'Click/tap outside to close this dialog',
          progress: {
            spinner: QSpinnerCube
          }
        })
      }, 4000)
    },

    progress () {
      const dialog = this.$q.dialog({
        message: 'Uploading... 0%',
        progress: true,
        persistent: true,
        ok: false
      })

      let percentage = 0
      const interval = setInterval(() => {
        percentage = Math.min(100, percentage + Math.floor(Math.random() * 22))
        dialog.update({
          message: `Uploading... ${percentage}%`
        })

        if (percentage === 100) {
          clearInterval(interval)
          setTimeout(() => {
            dialog.hide()
          }, 300)
        }
      }, 500)
    },

    positioned () {
      this.dialogHandler = this.$q.dialog({
        title: 'Positioned',
        message: 'This dialog appears from bottom.',
        position: 'bottom',
        dark: this.dark
      }).onOk(() => {
        console.log('OK')
      }).onCancel(() => {
        console.log('Cancel')
      }).onDismiss(() => {
        this.dialogHandler = void 0
      })
    },

    stacked () {
      this.dialogHandler = this.$q.dialog({
        title: 'Stacked Buttons',
        stackButtons: true,
        cancel: true,
        dark: this.dark
      }).onOk(() => {
        console.log('OK')
      }).onCancel(() => {
        console.log('Cancel')
      }).onDismiss(() => {
        this.dialogHandler = void 0
      })
    },

    autoClose () {
      let seconds = 3

      this.dialogHandler = this.$q.dialog({
        title: 'Alert',
        message: `Autoclosing in ${seconds} seconds.`,
        dark: this.dark
      }).onOk(() => {
        console.log('OK')
        clearTimeout(timer)
      }).onCancel(() => {
        console.log('Cancel')
        clearTimeout(timer)
      }).onDismiss(() => {
        this.dialogHandler = void 0
      })

      const timer = setInterval(() => {
        if (this.dialogHandler !== void 0) {
          seconds--
          if (seconds > 0) {
            this.dialogHandler.update({
              message: `Autoclosing in ${seconds} second${seconds > 1 ? 's' : ''}.`
            })
          }
          else {
            clearInterval(timer)
            this.dialogHandler.hide()
          }
        }
        else {
          clearInterval(timer)
        }
      }, 1000)
    },

    customComponentWithParent (async) {
      this.dialogHandler = this.$q.dialog({
        parent: this,
        component: async !== true ? DialogComponentWithParent : () => import('./dialog-component-with-parent.js'),
        // props forwarded to component:
        text: 'gigi'
      }).onOk(() => {
        console.log('OK')
      }).onCancel(() => {
        console.log('Cancel')
      }).onDismiss(() => {
        this.dialogHandler = void 0
      })
    },

    customComponentNoParent (async) {
      this.dialogHandler = this.$q.dialog({
        component: async !== true ? DialogComponentNoParent : () => import('./dialog-component-no-parent.js'),
        // props forwarded to component:
        text: 'gigi'
      }).onOk(() => {
        console.log('OK')
      }).onCancel(() => {
        console.log('Cancel')
      }).onDismiss(() => {
        this.dialogHandler = void 0
      })
    },

    unsafe () {
      this.dialogHandler = this.$q.dialog({
        title: 'Alert <span class="text-red">me</span>',
        message: 'Some <strong>unsafe</strong> <em>message</em>',
        html: true,
        dark: this.dark,
        ok: {
          color: 'black'
        }
      }).onOk(() => {
        console.log('OK')
      }).onCancel(() => {
        console.log('Cancel')
      }).onDismiss(() => {
        this.dialogHandler = void 0
      })
    }
  },

  beforeRouteLeave (to, from, next) {
    this.hideDialog()
    next()
  }
}
</script>

<style lang="stylus">
.custom-dialog
  color #33c
  background-color #ee9
  padding 40px
</style>

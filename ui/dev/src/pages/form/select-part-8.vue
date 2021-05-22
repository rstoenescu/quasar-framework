<template>
  <div class="q-layout-padding" style="width: 100vw; height: 100vh;">
    <!--
      This is for fast tests.
      Use this page but don't add it into your commits (leave it outside
      of your commit).

      For some test that you think it should be persistent,
      make a new *.vue file here or in another folder under /dev/components.
    -->
    <div class="q-pa-md" style="max-width: 350px">
      <q-btn round dense flas icon="settings" color="black" text-color="white">
        <q-menu content-class="q-menu-class">
          <q-list bordered padding>
            <q-item-label header>User Controls</q-item-label>

            <q-item clickable v-ripple>
              <q-item-section>
                <q-item-label>Device selection (select only one)</q-item-label>
                <q-item-label caption class="text-bold">Only on mobile device (tested on Android), when an item is selected, the nativ keyboard appears when it is not the expected behaviour because the q-select does not need keyboard interaction.</q-item-label>
                <q-item-label class="text-red">Unexpected behaviour !</q-item-label>
                <q-item-label>
                  <q-select
                    v-model="selectedUserControl"
                    :options="userControl"
                    dense options-dense outlined
                  />
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple>
              <q-item-section>
                <q-item-label>Color selection (select multiple values)</q-item-label>
                <q-item-label caption class="text-bold">But with multiple select, when items are selected, the nativ keyboard does not appear.</q-item-label>
                <q-item-label class="text-green">Expected behaviour !</q-item-label>
                <q-item-label>
                  <q-select
                    v-model="selectedUserColors"
                    :options="userColors"
                    multiple
                    dense options-dense outlined
                    emit-value map-options
                  >
                    <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                      <q-item
                        v-bind="itemProps"
                        v-on="itemEvents"
                      >
                        <q-item-section>
                          <q-item-label v-html="opt.label" ></q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-toggle :value="selected" @input="toggleOption(opt)" />
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-select label="delayed filter" rounded outlined :options="quizList" v-model="quiz" @filter="getQuiz" behavior="menu">
              <template v-slot:selected>
                <div class="text-body1 text-black">{{ quiz.label }}</div>
              </template>
            </q-select>

            <q-separator spaced />
            <q-item-label header>General</q-item-label>

            <q-item tag="label" v-ripple>
              <q-item-section side top>
                <q-checkbox v-model="check1"></q-checkbox>
              </q-item-section>

              <q-item-section>
                <q-item-label>Notifications</q-item-label>
                <q-item-label caption>
                  Notify me about updates to apps or games that I downloaded
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple>
              <q-item-section side top>
                <q-checkbox v-model="check2"></q-checkbox>
              </q-item-section>

              <q-item-section>
                <q-item-label>Sound</q-item-label>
                <q-item-label caption>
                  Auto-update apps at anytime. Data charges may apply
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple>
              <q-item-section side top>
                <q-checkbox v-model="check3"></q-checkbox>
              </q-item-section>

              <q-item-section>
                <q-item-label>Auto-add widgets</q-item-label>
                <q-item-label caption>
                  Automatically add home screen widgets
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-separator spaced />
            <q-item-label header>Notifications</q-item-label>

            <q-item tag="label" v-ripple>
              <q-item-section>
                <q-item-label>Battery too low</q-item-label>
              </q-item-section>
              <q-item-section side >
                <q-toggle color="blue" v-model="notif1" val="battery"></q-toggle>
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple>
              <q-item-section>
                <q-item-label>Friend request</q-item-label>
                <q-item-label caption>Allow notification</q-item-label>
              </q-item-section>
              <q-item-section side top>
                <q-toggle color="green" v-model="notif2" val="friend"></q-toggle>
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple>
              <q-item-section>
                <q-item-label>Picture uploaded</q-item-label>
                <q-item-label caption>Allow notification when uploading images</q-item-label>
              </q-item-section>
              <q-item-section side top>
                <q-toggle color="red" v-model="notif3" val="picture"></q-toggle>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>

    <q-btn class="q-ma-lg" color="primary" label="dialog" @click="dialog = true" />
    <q-dialog v-model="dialog">
      <q-card style="width: 80vw">
        <q-card-section class="q-gutter-lg">
          <q-select
            label="simple"
            v-model="selectedUserControl"
            :options="userControl"
            dense options-dense outlined
          />

          <q-select
            label="simple - forced menu"
            behavior="menu"
            v-model="selectedUserControl"
            :options="userControl"
            dense options-dense outlined
          />

          <q-select
            label="multiple"
            v-model="selectedUserColors"
            :options="userColors"
            multiple
            dense options-dense outlined
            emit-value map-options
          >
            <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
              <q-item v-bind="itemProps" v-on="itemEvents">
                <q-item-section>
                  <q-item-label v-html="opt.label" ></q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle :value="selected" @input="toggleOption(opt)" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select
            label="multiple - forced menu"
            behavior="menu"
            v-model="selectedUserColors"
            :options="userColors"
            multiple
            dense options-dense outlined
            emit-value map-options
          >
            <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
              <q-item v-bind="itemProps" v-on="itemEvents">
                <q-item-section>
                  <q-item-label v-html="opt.label" ></q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle :value="selected" @input="toggleOption(opt)" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select
            label="simple + use-input; menu"
            use-input
            v-model="selectedUserControl"
            :options="userControl"
            dense options-dense outlined
            behavior="menu"
          />

          <q-select
            label="multiple + use-input; menu"
            use-input
            v-model="selectedUserColors"
            :options="userColors"
            multiple
            dense options-dense outlined
            emit-value map-options
            behavior="menu"
          >
            <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
              <q-item v-bind="itemProps" v-on="itemEvents">
                <q-item-section>
                  <q-item-label v-html="opt.label" ></q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle :value="selected" @input="toggleOption(opt)" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select label="delayed filter" rounded outlined :options="quizList" v-model="quiz" @filter="getQuiz" behavior="menu">
            <template v-slot:selected>
              <div class="text-body1 text-black">{{ quiz.label }}</div>
            </template>
          </q-select>
        </q-card-section>
      </q-card>
    </q-dialog>

    <div class="column q-gutter-y-md" style="max-width: 300px">
      <q-select
        v-model="selectedUserControl"
        :options="userControl"
        outlined
        popup-content-class="test-select__popup--as-menu"
        behavior="menu"
        label="Single - Open as menu with styling"
      />

      <q-select
        v-model="selectedUserControl"
        :options="userControl"
        outlined
        dialog-content-class="test-select__dialog--as-dialog"
        popup-content-class="test-select__popup--as-dialog"
        behavior="dialog"
        label="Single - Open as dialog with styling"
      />

      <q-select
        v-model="selectedUserControls"
        :options="userControl"
        outlined
        multiple
        popup-content-class="test-select__popup--as-menu"
        behavior="menu"
        label="Multiple - Open as menu with styling"
      />

      <q-select
        v-model="selectedUserControls"
        :options="userControl"
        outlined
        multiple
        dialog-content-class="test-select__dialog--as-dialog"
        popup-content-class="test-select__popup--as-dialog"
        behavior="dialog"
        label="Multiple - Open as dialog with styling"
      />
    </div>
  </div>
</template>

<script>
const quizOptions = [
  { label: 'Google', value: 1 },
  { label: 'Facebook', value: 2 }
]

export default {
  data () {
    return {
      dialog: false,
      selectedUserControl: null,
      selectedUserControls: null,
      userControl: [' Joypad', 'Keyboard', 'Mouse'],
      selectedUserColors: [],
      userColors: [
        { label: 'Blue', value: 1 },
        { label: 'Green', value: 2 },
        { label: 'White', value: 3 },
        { label: 'Red', value: 4 }
      ],
      check1: true,
      check2: false,
      check3: false,

      notif1: true,
      notif2: true,
      notif3: false,

      volume: 6,
      brightness: 3,
      mic: 8,

      quiz: {},
      quizList: null
    }
  },
  methods: {
    getQuiz (value, update, abort) {
      if (this.quizList !== null) {
        update()
        return
      }

      setTimeout(() => {
        update(() => {
          this.quizList = quizOptions
        })
      }, 2000)
    }
  }
}
</script>

<style lang="sass">
.test-select
  &__dialog
    &--as-dialog
      .q-dialog__backdrop
        background: rgba($primary, 0.4)

  &__popup
    &--as-dialog
      outline: 3px solid $accent
      outline-offset: -3px

    &--as-menu
      box-shadow: 0 0 2px 2px $accent

</style>

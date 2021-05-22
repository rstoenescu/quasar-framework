<template>
  <div class="q-layout-padding">
    <div class="row items-center bg-black text-white q-pa-sm">
      <q-checkbox v-model="forceMenu" toggle-indeterminate dark :label="forceMenuLabel" />
      <q-checkbox v-model="dialogCloseIcon" toggle-indeterminate dark :label="dialogCloseIconLabel" />
    </div>

    <div class="bg-black text-white q-pa-sm q-mb-xl">
      <div>ModelS: {{ modelS || 'null' }}</div>
      <div>ModelM: {{ modelM || 'null' }}</div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-xs-12 col-md-4 q-gutter-y-md">
        <!-- Single -->
        <q-select
          filled
          color="amber"
          v-model="modelS"
          label="Single"
          :options="options"
          clearable
          :dialog-close-icon="dialogCloseIconValue"
          :behavior="behavior"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>

          <template v-slot:prepend>
            <q-icon name="colorize" />
          </template>

          <template v-slot:append>
            <q-icon name="lock" />
          </template>
        </q-select>

        <q-select
          filled
          color="green"
          v-model="modelS"
          label="Single - useInput"
          :options="options"
          use-input
          input-debounce="0"
          @filter="filterFn"
          clearable
          :dialog-close-icon="dialogCloseIconValue"
          :behavior="behavior"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>

          <template v-slot:prepend>
            <q-icon name="colorize" />
          </template>

          <template v-slot:append>
            <q-icon name="lock" />
          </template>
        </q-select>

        <q-select
          filled
          color="purple"
          v-model="modelS"
          label="Single - useInput - hideSelected"
          :options="options"
          use-input
          input-debounce="0"
          hide-selected
          @filter="filterFn"
          clearable
          :dialog-close-icon="dialogCloseIconValue"
          :behavior="behavior"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          filled
          color="deep-orange"
          v-model="modelS"
          label="Single - useInput - fillInput"
          :options="options"
          use-input
          input-debounce="0"
          fill-input
          @filter="filterFn"
          clearable
          :dialog-close-icon="dialogCloseIconValue"
          :behavior="behavior"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          filled
          v-model="modelS"
          label="Single - useInput - hideSelected - fillInput"
          :options="options"
          use-input
          input-debounce="0"
          hide-selected
          fill-input
          @filter="filterFn"
          clearable
          :dialog-close-icon="dialogCloseIconValue"
          :behavior="behavior"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <div class="col-xs-12 col-md-4 q-gutter-y-md">
        <!-- Multiple -->
        <q-select
          filled
          v-model="modelM"
          multiple
          label="Multiple"
          :options="options"
          clearable
          :dialog-close-icon="dialogCloseIconValue"
          :behavior="behavior"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          filled
          v-model="modelM"
          multiple
          label="Multiple - useInput"
          :options="options"
          use-input
          input-debounce="0"
          @filter="filterFn"
          clearable
          :dialog-close-icon="dialogCloseIconValue"
          :behavior="behavior"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          filled
          v-model="modelM"
          multiple
          label="Multiple - useInput - hideSelected"
          :options="options"
          use-input
          input-debounce="0"
          hide-selected
          @filter="filterFn"
          clearable
          :dialog-close-icon="dialogCloseIconValue"
          :behavior="behavior"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          filled
          v-model="modelM"
          multiple
          label="Multiple - useInput - fillInput"
          :options="options"
          use-input
          input-debounce="0"
          fill-input
          @filter="filterFn"
          clearable
          :dialog-close-icon="dialogCloseIconValue"
          :behavior="behavior"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          filled
          v-model="modelM"
          multiple
          label="Multiple - useInput - hideSelected - fillInput"
          :options="options"
          use-input
          input-debounce="0"
          hide-selected
          fill-input
          @filter="filterFn"
          clearable
          :dialog-close-icon="dialogCloseIconValue"
          :behavior="behavior"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <div class="col-xs-12 col-md-4 q-gutter-y-md">
        <!-- Multiple Chips -->
        <q-select
          filled
          v-model="modelM"
          multiple
          use-chips
          label="Multiple Chips"
          :options="options"
          clearable
          :dialog-close-icon="dialogCloseIconValue"
          :behavior="behavior"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          filled
          v-model="modelM"
          multiple
          use-chips
          label="Multiple Chips - useInput"
          :options="options"
          use-input
          input-debounce="0"
          @filter="filterFn"
          clearable
          :dialog-close-icon="dialogCloseIconValue"
          :behavior="behavior"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          filled
          v-model="modelM"
          multiple
          use-chips
          label="Multiple Chips - useInput - hideSelected"
          :options="options"
          use-input
          input-debounce="0"
          hide-selected
          @filter="filterFn"
          clearable
          :dialog-close-icon="dialogCloseIconValue"
          :behavior="behavior"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          filled
          v-model="modelM"
          multiple
          use-chips
          label="Multiple Chips - useInput - fillInput"
          :options="options"
          use-input
          input-debounce="0"
          fill-input
          @filter="filterFn"
          clearable
          :dialog-close-icon="dialogCloseIconValue"
          :behavior="behavior"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          filled
          v-model="modelM"
          multiple
          use-chips
          label="Multiple Chips - useInput - hideSelected - fillInput"
          :options="options"
          use-input
          input-debounce="0"
          hide-selected
          fill-input
          @filter="filterFn"
          clearable
          :dialog-close-icon="dialogCloseIconValue"
          :behavior="behavior"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          filled
          v-model="modelO"
          map-options
          emit-value
          multiple
          use-chips
          label="Obj (map-options, emit-value) - Multiple Chips - useInput"
          :options="objOptions"
          use-input
          input-debounce="0"
          @filter="filterFnObj"
          clearable
          :dialog-close-icon="dialogCloseIconValue"
          :behavior="behavior"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </div>

    <div class="column q-gutter-y-md q-mt-lg">
      <q-select
        filled
        v-model="modelK"
        label="Single - strings - kbd search - option label/value str"
        :options="optionsK"
        option-value="value"
        option-label="label"
        clearable
        :dialog-close-icon="dialogCloseIconValue"
        :behavior="behavior"
      />

      <q-select
        filled
        v-model="modelK"
        label="Single - strings - kbd search - option label/value str - map"
        :options="optionsK"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        clearable
        :dialog-close-icon="dialogCloseIconValue"
        :behavior="behavior"
      />

      <q-select
        filled
        v-model="modelK"
        label="Single - objs - kbd search - option label/value str - map"
        :options="objOptionsK"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        clearable
        :dialog-close-icon="dialogCloseIconValue"
        :behavior="behavior"
      />

      <q-select
        filled
        v-model="modelKO"
        label="Single - objs - kbd search - option label/value str"
        :options="objOptionsK"
        option-value="value"
        option-label="label"
        clearable
        :dialog-close-icon="dialogCloseIconValue"
        :behavior="behavior"
      />

      <q-select
        filled
        v-model="modelK"
        label="Single - strings - kbd search - option label/value fn"
        :options="optionsK"
        :option-value="kOptionValue"
        :option-label="kOptionLabel"
        clearable
        :dialog-close-icon="dialogCloseIconValue"
        :behavior="behavior"
      />

      <q-select
        filled
        v-model="modelK"
        label="Single - strings - kbd search - option label/value fn - map"
        :options="optionsK"
        :option-value="kOptionValue"
        :option-label="kOptionLabel"
        emit-value
        map-options
        clearable
        :dialog-close-icon="dialogCloseIconValue"
        :behavior="behavior"
      />

      <q-select
        filled
        v-model="modelK"
        label="Single - objs - kbd search - option label/value fn - map"
        :options="objOptionsK"
        :option-value="kOptionValue"
        :option-label="kOptionLabel"
        emit-value
        map-options
        clearable
        :dialog-close-icon="dialogCloseIconValue"
        :behavior="behavior"
      />

      <q-select
        filled
        v-model="modelKO"
        label="Single - objs - kbd search - option label/value fn"
        :options="objOptionsK"
        :option-value="kOptionValue"
        :option-label="kOptionLabel"
        clearable
        :dialog-close-icon="dialogCloseIconValue"
        :behavior="behavior"
      />
    </div>
  </div>
</template>

<script>
const
  options = [
    'Google 1', 'Facebook 1', 'Twitter 1', 'Apple 1', 'Oracle 1',
    'Google 2', 'Facebook 2', 'Twitter 2', 'Apple 2', 'Oracle 2',
    'Google 3', 'Facebook 3', 'Twitter 3', 'Apple 3', 'Oracle 3',
    'A very long text of an options that goes over the length limit when you open the debugger'
  ],
  objOptions = options.map((label, value) => ({ label, value })),

  optionsK = [
    'A A label', 'A B label', 'A C label',
    'B A label', 'B B label', 'B C label',
    'C A label', 'C B label', 'C C label'
  ],
  objOptionsK = optionsK.map((label, value) => ({ label, value }))

export default {
  data () {
    return {
      modelS: null,
      modelM: null,
      modelO: [3, 4, 5],
      modelK: null,
      modelKO: null,
      options,
      optionsK,
      objOptions,
      objOptionsK,
      forceMenu: null,
      dialogCloseIcon: false
    }
  },

  computed: {
    behavior () {
      return this.forceMenu === null
        ? 'default'
        : (this.forceMenu === true ? 'menu' : 'dialog')
    },

    forceMenuLabel () {
      if (this.forceMenu === true) {
        return 'Force menu'
      }

      return this.forceMenu === false ? 'Force dialog' : 'Based on platform'
    },

    dialogCloseIconValue () {
      return this.dialogCloseIcon === null
        ? 'close'
        : this.dialogCloseIcon
    },

    dialogCloseIconLabel () {
      if (this.dialogCloseIcon === true) {
        return 'Default dialog close icon'
      }

      return this.dialogCloseIcon === false ? 'No dialog close icon' : 'Custom dialog close icon'
    },
  },

  methods: {
    filterFn (val, update) {
      console.log('filterFn', val)

      if (val === '') {
        update(() => {
          this.options = options
        })
        return
      }

      update(
        () => {
          const needle = val.toLowerCase()
          this.options = options.filter(v => v.toLowerCase().indexOf(needle) > -1)
        },
        ref => {
          ref.setOptionIndex(-1)
          ref.moveOptionSelection(1, true)
        }
      )
    },

    filterFnObj (val, update) {
      console.log('filterFnObj', val)
      if (val === '') {
        update(() => {
          this.objOptions = objOptions
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.objOptions = objOptions.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
      })
    },

    kOptionValue (item) {
      item === void 0 && console.trace('kOptionValue', item)

      return item === Object(item) ? item.value : item
    },

    kOptionLabel (item) {
      item === void 0 && console.trace('kOptionLabel', item)

      return item === Object(item) ? item.label : item
    }
  }
}
</script>

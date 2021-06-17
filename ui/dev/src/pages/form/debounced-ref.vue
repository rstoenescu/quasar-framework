<template>
  <div class="q-layout-padding column q-gutter-y-md">
    <div class="q-pa-md bg-grey-3">
      <div>original1: [{{ original1 }}]</div>
      <input type="number" v-model.number="original1" step="1" />

      <div>debounced1: [{{ debounced1.value }}]</div>
      <input type="number" v-model.number="debounced1.value" step="1" />
      <q-input type="number" v-model.number="debounced1.value" step="1" />
      <q-slider v-model="debounced1.value" :step="1" />
    </div>

    <div class="q-pa-md bg-grey-3">
      <div>original2: [{{ original2 }}]</div>
      <input type="number" v-model.number="original2.test" step="1" />

      <div>debounced2test: [{{ debounced2test.value }}]</div>
      <input type="number" v-model.number="debounced2test.value" step="1" />
      <q-input type="number" v-model.number="debounced2test.value" step="1" />
      <q-slider v-model="debounced2test.value" :step="1" />
    </div>

    <div class="q-pa-md bg-grey-3">
      <div>original3: [{{ original3 }}]</div>
      <input type="number" v-model.number="original3.min" step="1" />
      <input type="number" v-model.number="original3.max" step="1" />

      <div>debounced3: [{{ debounced3.value }}]</div>
      <q-range v-model="debounced3.value" drag-range :step="1" />
    </div>
  </div>
</template>

<script>
import { debouncedRef } from 'quasar'

export default {
  data () {
    return {
      original1: 1,
      debounced1: debouncedRef(this, 'original1', 1000),

      original2: {
        test: 2,
        other: 3
      },
      debounced2test: debouncedRef(this, 'original2test', 1000),

      original3: {
        min: 10,
        max: 40
      },
      debounced3: debouncedRef(this, 'original3', 1000)
    }
  },

  computed: {
    original2test: {
      get () { return this.original2.test },
      set (value) { this.original2.test = value }
    }
  },

  beforeDestroy () {
    console.log('beforeDestroy 1', this.original1, this.original2.test, this.original3.min, this.original3.max)

    this.$nextTick(() => {
      console.log('beforeDestroy 2', this.original1, this.original2.test, this.original3.min, this.original3.max)
    })
  }
}
</script>

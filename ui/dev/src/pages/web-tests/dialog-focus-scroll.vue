<template>
  <div class="q-layout-padding">
    <q-dialog ref="dlg1">
      <q-stepper v-model="stepNum"
        vertical
        header-nav
      >
        <q-step v-for="(step, index) in steps" :key="index"
          :name="index"
          :title="step.title"
        >
          <q-input v-for="i in index + 1" :key="i" :autofocus="i === 1" />
        </q-step>
      </q-stepper>
    </q-dialog>

    <q-dialog ref="dlg2">
      <q-stepper v-model="stepNum"
        vertical
        header-nav
      >
        <q-step v-for="(step, index) in steps" :key="index"
          :name="index"
          :title="step.title"
        >
          <q-input v-for="i in index" :key="i" :autofocus="i === 1" />
        </q-step>
      </q-stepper>
    </q-dialog>

    <q-dialog ref="dlg3">
      <q-stepper v-model="stepNum"
        vertical
        header-nav
      >
        <q-step v-for="(step, index) in steps" :key="index"
          :name="index"
          :title="step.title"
        >
          <q-input v-for="i in index + 1" :key="i" :autofocus="i === 2" />
        </q-step>
      </q-stepper>
    </q-dialog>

    <div class="row q-gutter-md">
      <q-btn color="grey-8" label="Show Popup 1" @click="$refs.dlg1.show()"></q-btn>
      <q-btn color="grey-8" label="Show Popup 2" @click="$refs.dlg2.show()"></q-btn>
      <q-btn color="grey-8" label="Show Popup 3" @click="$refs.dlg3.show()"></q-btn>
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      stepNum: 0,
      steps: [
        { title: 'Step 1' },
        { title: 'Step 2' },
        { title: 'Step 3' },
        { title: 'Step 4' },
        { title: 'Step 5' }
      ]
    }
  }
}
</script>

<template>
  <div class="q-pa-md" style="max-width: 300px">
    <div class="q-gutter-md">
      <q-file v-model="model" label="Standard" />

      <q-file filled v-model="model" label="Filled" />

      <q-file outlined v-model="model" label="Outlined" />

      <q-file outlined outlined-bg-color="white" v-model="model" label="Outlined - Material Design" />

      <q-file standout v-model="model" label="Standout" />

      <q-file standout="bg-teal text-white" v-model="model" label="Custom standout" />

      <q-file borderless v-model="model" label="Borderless" />

      <q-file rounded filled v-model="model" label="Rounded filled" />

      <q-file rounded outlined v-model="model" label="Rounded outlined" />

      <q-file rounded standout v-model="model" label="Rounded standout" />

      <q-file square filled v-model="model" label="Square filled" />

      <q-file square outlined v-model="model" label="Square outlined" />

      <q-file square outlined outlined-bg-color="white" v-model="model" label="Square outlined - Material Design" />

      <q-file square standout v-model="model" label="Square standout" />
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      model: null
    }
  }
}
</script>

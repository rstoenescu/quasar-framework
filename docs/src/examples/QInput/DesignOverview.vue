<template>
  <div class="q-pa-md">
    <div class="q-gutter-md" style="max-width: 300px">
      <q-input v-model="text" label="Standard" />

      <q-input filled v-model="text" label="Filled" />

      <q-input outlined v-model="text" label="Outlined" />

      <q-input outlined outlined-bg-color="white" v-model="text" label="Outlined - Material Design" />

      <q-input standout v-model="text" label="Standout" />

      <q-input standout="bg-teal text-white" v-model="text" label="Custom standout" />

      <q-input borderless v-model="text" label="Borderless" />

      <q-input rounded filled v-model="text" label="Rounded filled" />

      <q-input rounded outlined v-model="text" label="Rounded outlined" />

      <q-input rounded standout v-model="text" label="Rounded standout" />

      <q-input square filled v-model="text" label="Square filled" />

      <q-input square outlined v-model="text" label="Square outlined" />

      <q-input square outlined outlined-bg-color="white" v-model="text" label="Square outlined - Material Design" />

      <q-input square standout v-model="text" label="Square standout" />
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      text: ''
    }
  }
}
</script>

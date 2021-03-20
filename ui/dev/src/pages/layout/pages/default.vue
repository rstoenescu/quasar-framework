<template>
  <q-page padding class="page-default-padding">
    <q-toggle v-model="extra" label="Extra content" />
    <div v-if="extra">
      <div v-for="n in 2">
        {{ n }} Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </div>

      <div class="row items-center q-col-gutter-sm">
        <q-select class="col-6 col-md-3" behavior="menu" label="Menu" v-model="selection" :options="options" clearable dialog-close-icon />
        <q-select class="col-6 col-md-3" behavior="menu" label="Menu input" use-input v-model="selection" :options="options" clearable dialog-close-icon />
        <q-select class="col-6 col-md-3" behavior="dialog" label="Dialog" v-model="selection" :options="options" clearable dialog-close-icon />
        <q-select class="col-6 col-md-3" behavior="dialog" label="Dialog input" use-input v-model="selection" :options="options" clearable dialog-close-icon />
      </div>

      <div v-for="n in 23">
        {{ n }} Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </div>

      <div class="row items-center q-col-gutter-sm">
        <q-select class="col-6 col-md-3" behavior="menu" label="Menu" v-model="selection" :options="options" clearable dialog-close-icon />
        <q-select class="col-6 col-md-3" behavior="menu" label="Menu input" use-input v-model="selection" :options="options" clearable dialog-close-icon />
        <q-select class="col-6 col-md-3" behavior="dialog" label="Dialog" v-model="selection" :options="options" clearable dialog-close-icon />
        <q-select class="col-6 col-md-3" behavior="dialog" label="Dialog input" use-input v-model="selection" :options="options" clearable dialog-close-icon />
      </div>

      <div v-for="n in 23">
        {{ n }} Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </div>

      <div class="row items-center q-col-gutter-sm">
        <q-select class="col-6 col-md-3" behavior="menu" label="Menu" v-model="selection" :options="options" clearable dialog-close-icon />
        <q-select class="col-6 col-md-3" behavior="menu" label="Menu input" use-input v-model="selection" :options="options" clearable dialog-close-icon />
        <q-select class="col-6 col-md-3" behavior="dialog" label="Dialog" v-model="selection" :options="options" clearable dialog-close-icon />
        <q-select class="col-6 col-md-3" behavior="dialog" label="Dialog input" use-input v-model="selection" :options="options" clearable dialog-close-icon />
      </div>

      <div v-for="n in 2">
        {{ n }} Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </div>
    </div>

    <q-page-sticky position="top-left" :offset="[18, 58]">
      <q-btn round color="primary" icon="arrow_back" class="rotate-45" />
    </q-page-sticky>
    <q-page-sticky position="top-right" :offset="[18, 58]">
      <q-btn round color="primary" icon="arrow_upward" class="rotate-45" />
    </q-page-sticky>
    <q-page-sticky position="bottom-left" :offset="[18, 18]">
      <q-btn round color="primary" icon="arrow_forward" class="rotate-135" />
    </q-page-sticky>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn round color="primary" icon="arrow_forward" class="rotate-45" />
    </q-page-sticky>

    <q-page-sticky position="top" expand>
      <q-toolbar class="bg-white text-black">
        <q-btn flat round dense icon="map" @click="dialog = true" />
        <q-btn flat round dense icon="edit" @click="dialogPrompt = true" />
        <q-toolbar-title>Title</q-toolbar-title>
      </q-toolbar>
    </q-page-sticky>

    <q-page-scroller position="bottom" :scroll-offset="50">
      <q-btn fab icon="keyboard_arrow_up" color="red" />
    </q-page-scroller>

    <q-page-scroller position="top" reverse :scroll-offset="50">
      <q-btn fab icon="keyboard_arrow_down" color="red" />
    </q-page-scroller>

    <q-dialog v-model="dialog">
      <q-card>
        <q-card-section>
          hogehgoe
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogPrompt">
      <q-card>
        <q-card-section>
          <q-input v-model="text" label="Text" autofocus />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style lang="stylus">
.page-default-padding
  padding-top calc(2.5rem + 50px)
</style>

<script>
export default {
  data () {
    return {
      extra: true,
      dialog: false,
      dialogPrompt: false,

      text: '',
      selection: null,
      options: ['Facebook', 'Google', 'Apple', 'Tesla', 'Farmexpert']
    }
  }
}
</script>

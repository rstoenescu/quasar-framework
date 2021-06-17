<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md column" style="max-width: 300px">
      <q-toggle v-model="dense" label="Dense QInput" />

      <q-input outlined outlined-bg-color="white" v-model="text" :dense="dense" />

      <q-input outlined outlined-bg-color="white" v-model="text" label="Label (stacked)" stack-label :dense="dense" />

      <q-input outlined outlined-bg-color="white" v-model="text" label="Label" :dense="dense" />

      <q-input outlined outlined-bg-color="white" v-model="ph" label="Label" placeholder="Placeholder" hint="With placeholder" :dense="dense" />

      <q-input outlined outlined-bg-color="white" v-model="ph" placeholder="Placeholder" hint="With placeholder" :dense="dense" />

      <q-input outlined outlined-bg-color="white" square v-model="text" hint="With perfect square borders" :dense="dense" />

      <q-input outlined outlined-bg-color="white" v-model="text" :dense="dense">
        <template v-slot:prepend>
          <q-icon name="event" />
        </template>
      </q-input>

      <div class="bg-grey-10 q-pa-sm rounded-borders q-gutter-y-md">
        <q-input dark outlined outlined-bg-color="grey-10" color="white" v-model="text" :dense="dense">
          <template v-slot:append>
            <q-avatar>
              <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">
            </q-avatar>
          </template>
        </q-input>

        <q-input dark outlined outlined-bg-color="grey-10" color="yellow" bottom-slots v-model="text" label="Label" counter :dense="dense">
          <template v-slot:prepend>
            <q-icon name="place" />
          </template>
          <template v-slot:append>
            <q-icon name="close" @click="text = ''" class="cursor-pointer" />
          </template>

          <template v-slot:hint>
            Field hint
          </template>
        </q-input>

        <q-input dark outlined outlined-bg-color="grey-10" color="orange" bottom-slots v-model="text" label="Label" counter maxlength="12" :dense="dense">
          <template v-slot:before>
            <q-icon name="flight_takeoff" />
          </template>

          <template v-slot:append>
            <q-icon v-if="text !== ''" name="close" @click="text = ''" class="cursor-pointer" />
            <q-icon name="search" />
          </template>

          <template v-slot:hint>
            Field hint
          </template>
        </q-input>
      </div>

      <q-input outlined outlined-bg-color="white" bottom-slots v-model="text" label="Label" counter maxlength="12" :dense="dense">
        <template v-slot:before>
          <q-avatar>
            <img src="https://cdn.quasar.dev/img/avatar5.jpg">
          </q-avatar>
        </template>

        <template v-slot:append>
          <q-icon v-if="text !== ''" name="close" @click="text = ''" class="cursor-pointer" />
          <q-icon name="schedule" />
        </template>

        <template v-slot:hint>
          Field hint
        </template>

        <template v-slot:after>
          <q-btn round dense flat icon="send" />
        </template>
      </q-input>

      <q-input outlined outlined-bg-color="white" bottom-slots v-model="text" label="Label" counter maxlength="12" :dense="dense">
        <template v-slot:before>
          <q-icon name="event" />
        </template>

        <template v-slot:hint>
          Field hint
        </template>

        <template v-slot:append>
          <q-btn round dense flat icon="add" />
        </template>
      </q-input>

      <q-input outlined outlined-bg-color="white" v-model="text" hint="Disable" :dense="dense" disable />

      <q-input outlined outlined-bg-color="white" v-model="text" hint="Readonly" :dense="dense" readonly />

      <q-input outlined outlined-bg-color="white" v-model="text" hint="Disable and readonly" :dense="dense" disable readonly />
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      text: '',
      ph: '',

      dense: false
    }
  }
}
</script>

<template>
  <div class="q-layout-padding column q-gutter-y-md">
    <q-input filled v-model="date1" label="YYYY-MM-DD HH:mm:ssZ">
      <template v-slot:prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-date v-model="date1" mask="YYYY-MM-DD HH:mm:ssZ" />
          </q-popup-proxy>
        </q-icon>
      </template>

      <template v-slot:append>
        <q-icon name="access_time" class="cursor-pointer">
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-time v-model="date1" mask="YYYY-MM-DD HH:mm:ssZ" format24h with-seconds />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <q-input filled v-model="date2" label="YYYY-MM-DD HH:mm ZZ">
      <template v-slot:prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-date v-model="date2" mask="YYYY-MM-DD HH:mm ZZ" />
          </q-popup-proxy>
        </q-icon>
      </template>

      <template v-slot:append>
        <q-icon name="access_time" class="cursor-pointer">
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-time v-model="date2" mask="YYYY-MM-DD HH:mm ZZ" format24h />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <q-input filled v-model="date3" label="YYYY-MM-DD HH:mm">
      <template v-slot:prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-date v-model="date3" mask="YYYY-MM-DD HH:mm" />
          </q-popup-proxy>
        </q-icon>
      </template>

      <template v-slot:append>
        <q-icon name="access_time" class="cursor-pointer">
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-time v-model="date3" mask="YYYY-MM-DD HH:mm" format24h />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script>
import { date as qDate } from 'quasar'

export default {
  data () {
    return {
      date1: '2020-03-18 17:40:45+05:00',
      date2: '2020-03-18 17:40 -0730',
      date3: '2020-03-18 17:40'
    }
  },
  methods: {
    test (dateString, formatMask) {
      const date = new Date(dateString)
      console.log('date [' + dateString + ']: ', date)
      console.log('extr [' + dateString + ']: ', qDate.extractDate(dateString, formatMask))
    }
  },
  mounted () {
    this.test('2020-03-14 10:44:05+05:00', 'YYYY-MM-DD HH:mm:ssZ')
    this.test('2020-03-14 10:44:05+02:00', 'YYYY-MM-DD HH:mm:ssZ')
    this.test('2020-03-14 10:44:05+05:30', 'YYYY-MM-DD HH:mm:ssZ')
    this.test('2020-03-14 10:44:05-05:30', 'YYYY-MM-DD HH:mm:ssZ')

    this.test('2020-03-14 10:44:05+0500', 'YYYY-MM-DD HH:mm:ssZZ')
    this.test('2020-03-14 10:44:05+0200', 'YYYY-MM-DD HH:mm:ssZZ')
    this.test('2020-03-14 10:44:05+0530', 'YYYY-MM-DD HH:mm:ssZZ')
    this.test('2020-03-14 10:44:05-0530', 'YYYY-MM-DD HH:mm:ssZZ')

    this.test('2020-03-14 10:44:05', 'YYYY-MM-DD HH:mm:ss')
    this.test('2020-03-14 10:44:05', 'YYYY-MM-DD HH:mm:ss')
    this.test('2020-03-14 10:44:05', 'YYYY-MM-DD HH:mm:ss')
    this.test('2020-03-14 10:44:05', 'YYYY-MM-DD HH:mm:ss')
  }
}
</script>

<style lang="stylus">
</style>

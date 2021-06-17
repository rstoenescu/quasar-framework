<template>
  <div class="q-layout-padding">
    <div class="row q-gutter-md q-pb-md">
      <q-btn label="Null model" @click="nullify" />
      <q-btn label="Reset" @click="reset" />
      <q-toggle v-model="noUnset" label="No unset" />
    </div>

    <div class="q-gutter-md">
      <div>Single {{ day || 'none ' }}:</div>
      <q-date v-model="day" today-btn @input="onInput" :no-unset="noUnset" />

      <div>Multiple {{ days || 'none ' }}:</div>
      <q-date v-model="days" multiple today-btn @input="onInput" :no-unset="noUnset" />

      <div>Range {{ dayRange || 'none ' }}:</div>
      <q-date v-model="dayRange" today-btn range @input="onInput" @range-start="onRangeStart" @range-end="onRangeEnd" :no-unset="noUnset" />

      <div>Multiple + Range {{ daysRange || 'none ' }}:</div>
      <div class="row no-wrap">
        <q-date ref="daysRange" v-model="daysRange" multiple today-btn range day-as-range @input="onInput" @range-start="onRangeStart" @range-end="onRangeEnd" :no-unset="noUnset" />
        <div class="q-gutter-sm q-ml-sm">
          <q-btn label="setEditingRange(from)" @click="setRangeFrom" no-caps />
          <q-btn label="setEditingRange(from, to)" @click="setRangeFromTo" no-caps />
          <q-btn label="setEditingRange()" @click="setRangeNull" no-caps />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */

export default {
  data () {
    return {
      noUnset: false,

      day: null,
      days: null,
      dayRange: null,
      daysRange: null,

      day: '2020/07/02',
      days: [
        '2020/08/02',
        '2020/08/10',
        // '2021/09/11',
      ],
      dayRange: { from: '2020/07/08', to: '2020/07/17' },
      daysRange: [
        { from: '2020/08/12', to: '2020/08/16' },
        '2020/08/02',
        { from: '2020/08/03', to: '2020/08/03' },
        { from: '2020/08/07', to: '2020/08/05' },
        '2020/08/10',
        { from: '2020/08/27', to: '2020/10/15' }
      ]
    }
  },
  methods: {
    nullify () {
      this.day = null
      this.days = null
      this.dayRange = null
      this.daysRange = null
    },

    reset () {
      this.day = '2020/07/02'
      this.days = [
        '2020/08/02',
        '2020/08/10',
        // '2021/09/11',
      ]
      this.dayRange = { from: '2020/07/08', to: '2020/07/17' }
      this.daysRange = [
        '2020/08/02',
        '2020/08/10',
        { from: '2020/08/12', to: '2020/08/16' },
        { from: '2020/08/27', to: '2020/09/15' }
        // '2021/09/11',
      ]
    },

    onInput (value, reason, details) {
      console.log('@input:', value, reason, details)
    },

    onRangeStart (payload) {
      console.log('@range-start', payload)
    },

    onRangeEnd (payload) {
      console.log('@range-end', payload)
    },

    setRangeFrom () {
      this.$refs.daysRange.setEditingRange(
        { year: 2020, month: 8, day: 4 }
      )
    },

    setRangeFromTo () {
      this.$refs.daysRange.setEditingRange(
        { year: 2020, month: 8, day: 4 },
        { year: 2020, month: 8, day: 6 }
      )
    },

    setRangeNull () {
      this.$refs.daysRange.setEditingRange()
    }
  }
}
</script>

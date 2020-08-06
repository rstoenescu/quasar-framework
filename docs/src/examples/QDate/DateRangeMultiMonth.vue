<template>
  <div class="q-pa-md">
    <div class="q-gutter-md row items-start">
      <div class="q-gutter-y-md">
        <q-date
          v-model="date1"
          @input="onInput"
          flat square
          :date-range.sync="dateRange"
        />
        <q-date
          v-model="date2"
          @input="onInput"
          flat square
          :date-range.sync="dateRange"
        />
      </div>
      <div class="q-gutter-y-md" style="border: 1px solid #c0c0c0;">
        <q-date
          v-model="date1"
          @input="onInput"
          flat square minimal
          :date-range.sync="dateRange"
        />
        <q-date
          v-model="date2"
          @input="onInput"
          flat square minimal
          :date-range.sync="dateRange"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      date1: '2019/02/20',
      date2: '2019/03/05',
      dateRange: [ '2019/02/20', '2019/03/05' ]
    }
  },

  methods: {
    onInput (value, reason, date) {
      if (this.dateRange[0].length > 0 && this.dateRange[1].length > 0) {
        this.$set(this.dateRange, 0, value)
        this.$set(this.dateRange, 1, '')
      }
      else {
        this.$set(this.dateRange, 1, value)
      }
    }
  }
}
</script>

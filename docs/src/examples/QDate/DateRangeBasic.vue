<template>
  <div class="q-pa-md">
    <div class="q-gutter-md row items-start">
      <q-date
        v-model="date"
        :date-range.sync="dateRange"
        @input="onInput"
      />

      <q-date
        v-model="date"
        :date-range.sync="dateRange"
        minimal
        @input="onInput"
      />
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      date: '2019/02/01',
      dateRange: [ '2019/02/01', '2019/02/05' ]
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

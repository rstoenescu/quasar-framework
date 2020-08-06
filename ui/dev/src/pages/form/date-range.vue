<template>
  <div class="q-layout-padding">
    <div class="q-gutter-md">
      <div class="q-gutter-y-md">
        <q-date
          v-model="date1"
          v-bind="props"
          @input="inputLog"
          flat square
          :date-range.sync="dateRange"
          range-color="#82b1ff"
          range-text-color='white'
        />
      </div>
      <div class="q-gutter-y-md">
        <q-date
          v-model="date1"
          v-bind="props"
          @input="inputLog"
          flat square
          :date-range.sync="dateRange"
        />
        <q-date
          v-model="date2"
          v-bind="props"
          @input="inputLog"
          flat square
          :date-range.sync="dateRange"
        />
      </div>
      <div class="q-gutter-y-md">
        <q-date
          v-model="date1"
          v-bind="props"
          @input="inputLog"
          flat square minimal
          :date-range.sync="dateRange"
        />
        <q-date
          v-model="date2"
          v-bind="props"
          @input="inputLog"
          flat square minimal
          :date-range.sync="dateRange"
        />
      </div>
      <div class="q-gutter-y-md">
        <q-date
          v-model="date1"
          v-bind="props"
          @input="inputLog"
          flat square landscape
          :date-range.sync="dateRange"
        />
        <q-date
          v-model="date2"
          v-bind="props"
          @input="inputLog"
          flat square landscape
          :date-range.sync="dateRange"
        />
      </div>
      <div class="q-gutter-y-md">
        <q-date
          v-model="date1"
          v-bind="props"
          @input="inputLog"
          flat square landscape minimal
          :date-range.sync="dateRange"
        />
        <q-date
          v-model="date2"
          v-bind="props"
          @input="inputLog"
          flat square landscape minimal
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
      date1: '2018/11/01',
      date2: '2018/12/01',
      dateRange: ['2018/11/20', '2018/12/05']
    }
  },

  computed: {
    props () {
      return {
        noNavigation: true
      }
    }
  },

  methods: {
    inputLog (value, reason, date) {
      // console.log('@input', value, reason, date)
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

import { __splitDate } from '../utils/date.js'

// Reason for these functions (perf):
// https://jsperf.com/datebetween
function getDateIdentifier (year, month, day) {
  return year * 100000000 + month * 1000000 + day * 10000
}

function isBetweenDates (day, startDate, endDate) {
  return day >= startDate && day <= endDate
}

export default {
  props: {
    dateRange: {
      type: Array,
      validator: v => v.length === 2
    },
    rangeColor: {
      type: String,
      default: '#bbdefb'
    },
    rangeTextColor: String
  },

  mounted () {
    this.__normalizeDateRanges()
  },

  watch: {
    dateRange () {
      this.__normalizeDateRanges()
    }
  },

  computed: {
    isDateRangeValid () {
      return this.dateRange !== void 0 && Array.isArray(this.dateRange) && this.dateRange.length === 2
    },

    isRangeStartDateValid () {
      return this.rangeStartDate !== void 0 && this.rangeStartDate !== ''
    },

    isRangeEndDateValid () {
      return this.rangeEndDate !== void 0 && this.rangeEndDate !== ''
    },

    rangeStartDate () {
      if (this.isDateRangeValid === true) {
        const start = __splitDate(this.dateRange[0],
          this.calendar === 'persian' ? 'YYYY/MM/DD' : this.mask,
          this.__getComputedLocale(),
          this.calendar
        )
        if (start.year === null) return ''
        return start
      }
    },

    rangeEndDate () {
      if (this.isDateRangeValid === true) {
        const end = __splitDate(this.dateRange[1],
          this.calendar === 'persian' ? 'YYYY/MM/DD' : this.mask,
          this.__getComputedLocale(),
          this.calendar
        )
        if (end.year === null) return ''
        return end
      }
    }
  },

  methods: {
    __normalizeDateRanges () {
      // the start date, must be less than the end date
      // if not true, then swap them
      if (this.isRangeStartDateValid === true && this.isRangeEndDateValid === true) {
        const from = getDateIdentifier(this.rangeStartDate.year, this.rangeStartDate.month, this.rangeStartDate.day)
        const to = getDateIdentifier(this.rangeEndDate.year, this.rangeEndDate.month, this.rangeEndDate.day)
        if (from > to) {
          const temp = this.dateRange[0]
          this.$set(this.dateRange, 0, this.dateRange[1])
          this.$set(this.dateRange, 1, temp)
          this.$emit('update:date-ranges', this.dateRanges)
        }
      }
    },

    __isSelectedDateRange (day, month, year) {
      if (this.isDateRangeValid === true) {
        if (this.isRangeStartDateValid === true) {
          const start = this.rangeStartDate
          if (year === start.year && month === start.month && day === start.day) {
            return true
          }
        }
        if (this.isRangeEndDateValid === true) {
          const end = this.rangeEndDate
          if (year === end.year && month === end.month && day === end.day) {
            return true
          }
        }
      }
      return false
    },

    __getRangeClasses (day) {
      let output = ''
      if (this.isRangeStartDateValid === true &&
        this.innerModel.year === this.rangeStartDate.year &&
        this.innerModel.month === this.rangeStartDate.month &&
        day.i === this.rangeStartDate.day
      ) {
        if (this.isRangeEndDateValid === true) {
          output += ' q-date__range--start'
        }
      }
      if (this.isRangeEndDateValid === true &&
        this.innerModel.year === this.rangeEndDate.year &&
        this.innerModel.month === this.rangeEndDate.month &&
        day.i === this.rangeEndDate.day
      ) {
        output += ' q-date__range--end'
      }
      if (this.isRangeStartDateValid === true && this.isRangeEndDateValid === true) {
        const date = getDateIdentifier(this.innerModel.year, this.innerModel.month, day.i)
        const from = getDateIdentifier(this.rangeStartDate.year, this.rangeStartDate.month, this.rangeStartDate.day)
        const to = getDateIdentifier(this.rangeEndDate.year, this.rangeEndDate.month, this.rangeEndDate.day)
        if (isBetweenDates(date, from, to)) {
          output += ' q-date__range'
        }
      }
      if (output.length > 0 && this.rangeTextColor !== void 0) {
        output += ` text-${this.rangeTextColor}`
      }
      return output
    },

    __getRangeStyle (day) {
      if (this.rangeColor) {
        let output = {}
        let isValid = false
        if (this.isRangeStartDateValid === true &&
          this.innerModel.year === this.rangeStartDate.year &&
          this.innerModel.month === this.rangeStartDate.month &&
          day.i === this.rangeStartDate.day
        ) {
          isValid = true
        }
        if (isValid === false && this.isRangeEndDateValid === true &&
          this.innerModel.year === this.rangeEndDate.year &&
          this.innerModel.month === this.rangeEndDate.month &&
          day.i === this.rangeEndDate.day
        ) {
          isValid = true
        }
        if (isValid === false && this.isRangeStartDateValid === true && this.isRangeEndDateValid === true) {
          const date = getDateIdentifier(this.innerModel.year, this.innerModel.month, day.i)
          const from = getDateIdentifier(this.rangeStartDate.year, this.rangeStartDate.month, this.rangeStartDate.day)
          const to = getDateIdentifier(this.rangeEndDate.year, this.rangeEndDate.month, this.rangeEndDate.day)
          if (isBetweenDates(date, from, to)) {
            isValid = true
          }
        }
        if (isValid === true) {
          output['--q-color-blue-1'] = this.rangeColor
        }
        return output
      }
    }
  }
}

import Vue from 'vue'

import QBtn from '../btn/QBtn.js'
import DateTimeMixin from '../../mixins/datetime.js'
import DateRangeMixin from '../../mixins/date-range.js'

import { slot } from '../../utils/slot.js'
import { formatDate, __splitDate } from '../../utils/date.js'
import { pad } from '../../utils/format.js'
import { jalaaliMonthLength, toGregorian } from '../../utils/date-persian.js'
import cache from '../../utils/cache.js'

const yearsInterval = 20
const viewIsValid = v => ['Calendar', 'Years', 'Months'].includes(v)

export default Vue.extend({
  name: 'QDate',

  mixins: [ DateTimeMixin, DateRangeMixin ],

  props: {
    title: String,
    subtitle: String,

    emitImmediately: Boolean,

    mask: {
      // this mask is forced
      // when using persian calendar
      default: 'YYYY/MM/DD'
    },

    defaultYearMonth: {
      type: String,
      validator: v => /^-?[\d]+\/[0-1]\d$/.test(v)
    },

    yearsInMonthView: Boolean,

    events: [Array, Function],
    eventColor: [String, Function],

    options: [Array, Function],

    firstDayOfWeek: [String, Number],
    todayBtn: Boolean,
    minimal: Boolean,
    defaultView: {
      type: String,
      default: 'Calendar',
      validator: viewIsValid
    }
  },

  data () {
    const
      { inner, external } = this.__getModels(this.value, this.mask, this.__getComputedLocale()),
      direction = this.$q.lang.rtl === true ? 'right' : 'left'

    return {
      view: this.defaultView,
      monthDirection: direction,
      yearDirection: direction,
      startYear: inner.year - inner.year % yearsInterval - (inner.year < 0 ? yearsInterval : 0),
      innerModel: inner,
      extModel: external
    }
  },

  watch: {
    value (v) {
      const { inner, external } = this.__getModels(v, this.mask, this.__getComputedLocale())

      if (
        this.extModel.dateHash !== external.dateHash ||
        this.extModel.timeHash !== external.timeHash
      ) {
        this.extModel = external
      }

      if (inner.dateHash !== this.innerModel.dateHash) {
        this.monthDirection = (this.innerModel.dateHash < inner.dateHash) === (this.$q.lang.rtl !== true) ? 'left' : 'right'
        if (inner.year !== this.innerModel.year) {
          this.yearDirection = this.monthDirection
        }

        this.$nextTick(() => {
          this.startYear = inner.year - inner.year % yearsInterval - (inner.year < 0 ? yearsInterval : 0)
          this.innerModel = inner
        })
      }
    },

    view () {
      this.$refs.blurTarget !== void 0 && this.$refs.blurTarget.focus()
    }
  },

  computed: {
    classes () {
      const type = this.landscape === true ? 'landscape' : 'portrait'
      return `q-date q-date--${type} q-date--${type}-${this.minimal === true ? 'minimal' : 'standard'}` +
        (this.isDark === true ? ' q-date--dark q-dark' : '') +
        (this.bordered === true ? ` q-date--bordered` : '') +
        (this.square === true ? ` q-date--square no-border-radius` : '') +
        (this.flat === true ? ` q-date--flat no-shadow` : '') +
        (this.disable === true ? ' disabled' : (this.readonly === true ? ' q-date--readonly' : ''))
    },

    headerTitle () {
      if (this.title !== void 0 && this.title !== null && this.title.length > 0) {
        return this.title
      }

      const model = this.extModel
      if (model.dateHash === null) { return ' --- ' }

      let date

      if (this.calendar !== 'persian') {
        date = new Date(model.year, model.month - 1, model.day)
      }
      else {
        const gDate = toGregorian(model.year, model.month, model.day)
        date = new Date(gDate.gy, gDate.gm - 1, gDate.gd)
      }

      if (isNaN(date.valueOf()) === true) { return ' --- ' }

      if (this.computedLocale.headerTitle !== void 0) {
        return this.computedLocale.headerTitle(date, model)
      }

      return this.computedLocale.daysShort[ date.getDay() ] + ', ' +
        this.computedLocale.monthsShort[ model.month - 1 ] + ' ' +
        model.day
    },

    headerSubtitle () {
      return this.subtitle !== void 0 && this.subtitle !== null && this.subtitle.length > 0
        ? this.subtitle
        : (
          this.extModel.year !== null
            ? this.extModel.year
            : ' --- '
        )
    },

    dateArrow () {
      const val = [ this.$q.iconSet.datetime.arrowLeft, this.$q.iconSet.datetime.arrowRight ]
      return this.$q.lang.rtl === true ? val.reverse() : val
    },

    computedFirstDayOfWeek () {
      return this.firstDayOfWeek !== void 0
        ? Number(this.firstDayOfWeek)
        : this.computedLocale.firstDayOfWeek
    },

    daysOfWeek () {
      const
        days = this.computedLocale.daysShort,
        first = this.computedFirstDayOfWeek

      return first > 0
        ? days.slice(first, 7).concat(days.slice(0, first))
        : days
    },

    daysInMonth () {
      return this.__getDaysInMonth(this.innerModel)
    },

    today () {
      return this.__getCurrentDate()
    },

    evtFn () {
      return typeof this.events === 'function'
        ? this.events
        : date => this.events.includes(date)
    },

    evtColor () {
      return typeof this.eventColor === 'function'
        ? this.eventColor
        : date => this.eventColor
    },

    isInSelection () {
      return typeof this.options === 'function'
        ? this.options
        : date => this.options.includes(date)
    },

    days () {
      let date, endDay

      const res = []

      if (this.calendar !== 'persian') {
        date = new Date(this.innerModel.year, this.innerModel.month - 1, 1)
        endDay = (new Date(this.innerModel.year, this.innerModel.month - 1, 0)).getDate()
      }
      else {
        const gDate = toGregorian(this.innerModel.year, this.innerModel.month, 1)
        date = new Date(gDate.gy, gDate.gm - 1, gDate.gd)
        let prevJM = this.innerModel.month - 1
        let prevJY = this.innerModel.year
        if (prevJM === 0) {
          prevJM = 12
          prevJY--
        }
        endDay = jalaaliMonthLength(prevJY, prevJM)
      }

      const days = (date.getDay() - this.computedFirstDayOfWeek - 1)

      const len = days < 0 ? days + 7 : days
      if (len < 6) {
        for (let i = endDay - len; i <= endDay; i++) {
          res.push({ i, fill: true })
        }
      }

      const
        index = res.length,
        prefix = this.innerModel.year + '/' + pad(this.innerModel.month) + '/'

      for (let i = 1; i <= this.daysInMonth; i++) {
        const day = prefix + pad(i)

        if (this.options !== void 0 && this.isInSelection(day) !== true) {
          res.push({ i })
        }
        else {
          const event = this.events !== void 0 && this.evtFn(day) === true
            ? this.evtColor(day)
            : false

          res.push({ i, in: true, flat: true, event })
        }
      }

      if (this.innerModel.year === this.extModel.year && this.innerModel.month === this.extModel.month) {
        const i = index + this.innerModel.day - 1
        res[i] !== void 0 && Object.assign(res[i], {
          unelevated: true,
          flat: false,
          color: this.computedColor,
          textColor: this.computedTextColor
        })
      }

      if (this.innerModel.year === this.today.year && this.innerModel.month === this.today.month) {
        res[index + this.today.day - 1].today = true
      }

      const left = res.length % 7
      if (left > 0) {
        const afterDays = 7 - left
        for (let i = 1; i <= afterDays; i++) {
          res.push({ i, fill: true })
        }
      }

      return res
    },

    attrs () {
      if (this.disable === true) {
        return { 'aria-disabled': 'true' }
      }
      if (this.readonly === true) {
        return { 'aria-readonly': 'true' }
      }
    }
  },

  methods: {
    setToday () {
      this.__updateValue({ ...this.today }, 'today')
      this.view = 'Calendar'
    },

    setView (view) {
      if (viewIsValid(view) === true) {
        this.view = view
      }
    },

    offsetCalendar (type, descending) {
      if (['month', 'year'].includes(type)) {
        this[`__goTo${type === 'month' ? 'Month' : 'Year'}`](
          descending === true ? -1 : 1
        )
      }
    },

    __getModels (val, mask, locale) {
      const external = __splitDate(
        val,
        this.calendar === 'persian' ? 'YYYY/MM/DD' : mask,
        locale,
        this.calendar
      )

      return {
        external,
        inner: external.dateHash === null
          ? this.__getDefaultModel()
          : { ...external }
      }
    },

    __getDefaultModel () {
      let year, month

      if (this.defaultYearMonth !== void 0) {
        const d = this.defaultYearMonth.split('/')
        year = parseInt(d[0], 10)
        month = parseInt(d[1], 10)
      }
      else {
        // may come from data() where computed
        // props are not yet available
        const d = this.today !== void 0
          ? this.today
          : this.__getCurrentDate()

        year = d.year
        month = d.month
      }

      return {
        year,
        month,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        dateHash: year + '/' + pad(month) + '/01'
      }
    },

    __getHeader (h) {
      if (this.minimal === true) { return }

      return h('div', {
        staticClass: 'q-date__header',
        class: this.headerClass
      }, [
        h('div', {
          staticClass: 'relative-position'
        }, [
          h('transition', {
            props: {
              name: 'q-transition--fade'
            }
          }, [
            h('div', {
              key: 'h-yr-' + this.headerSubtitle,
              staticClass: 'q-date__header-subtitle q-date__header-link',
              class: this.view === 'Years' ? 'q-date__header-link--active' : 'cursor-pointer',
              attrs: { tabindex: this.computedTabindex },
              on: cache(this, 'vY', {
                click: () => { this.view = 'Years' },
                keyup: e => { e.keyCode === 13 && (this.view = 'Years') }
              })
            }, [ this.headerSubtitle ])
          ])
        ]),

        h('div', {
          staticClass: 'q-date__header-title relative-position flex no-wrap'
        }, [
          h('div', {
            staticClass: 'relative-position col'
          }, [
            h('transition', {
              props: {
                name: 'q-transition--fade'
              }
            }, [
              h('div', {
                key: 'h-sub' + this.headerTitle,
                staticClass: 'q-date__header-title-label q-date__header-link',
                class: this.view === 'Calendar' ? 'q-date__header-link--active' : 'cursor-pointer',
                attrs: { tabindex: this.computedTabindex },
                on: cache(this, 'vC', {
                  click: () => { this.view = 'Calendar' },
                  keyup: e => { e.keyCode === 13 && (this.view = 'Calendar') }
                })
              }, [ this.headerTitle ])
            ])
          ]),

          this.todayBtn === true ? h(QBtn, {
            staticClass: 'q-date__header-today',
            props: {
              icon: this.$q.iconSet.datetime.today,
              flat: true,
              size: 'sm',
              round: true,
              tabindex: this.computedTabindex
            },
            on: cache(this, 'today', { click: this.setToday })
          }) : null
        ])
      ])
    },

    __getNavigation (h, { label, view, key, dir, goTo, cls }) {
      return [
        h('div', {
          staticClass: 'row items-center q-date__arrow'
        }, [
          h(QBtn, {
            props: {
              round: true,
              dense: true,
              size: 'sm',
              flat: true,
              icon: this.dateArrow[0],
              tabindex: this.computedTabindex
            },
            on: cache(this, 'go-#' + view, { click () { goTo(-1) } })
          })
        ]),

        h('div', {
          staticClass: 'relative-position overflow-hidden flex flex-center' + cls
        }, [
          h('transition', {
            props: {
              name: 'q-transition--jump-' + dir
            }
          }, [
            h('div', { key }, [
              h(QBtn, {
                props: {
                  flat: true,
                  dense: true,
                  noCaps: true,
                  label,
                  tabindex: this.computedTabindex
                },
                on: cache(this, 'view#' + view, { click: () => { this.view = view } })
              })
            ])
          ])
        ]),

        h('div', {
          staticClass: 'row items-center q-date__arrow'
        }, [
          h(QBtn, {
            props: {
              round: true,
              dense: true,
              size: 'sm',
              flat: true,
              icon: this.dateArrow[1],
              tabindex: this.computedTabindex
            },
            on: cache(this, 'go+#' + view, { click () { goTo(1) } })
          })
        ])
      ]
    },

    __getCalendarView (h) {
      return [
        h('div', {
          key: 'calendar-view',
          staticClass: 'q-date__view q-date__calendar'
        }, [
          h('div', {
            staticClass: 'q-date__navigation row items-center no-wrap'
          }, this.__getNavigation(h, {
            label: this.computedLocale.months[ this.innerModel.month - 1 ],
            view: 'Months',
            key: this.innerModel.month,
            dir: this.monthDirection,
            goTo: this.__goToMonth,
            cls: ' col'
          }).concat(this.__getNavigation(h, {
            label: this.innerModel.year,
            view: 'Years',
            key: this.innerModel.year,
            dir: this.yearDirection,
            goTo: this.__goToYear,
            cls: ''
          }))),

          h('div', {
            staticClass: 'q-date__calendar-weekdays row items-center no-wrap'
          }, this.daysOfWeek.map(day => h('div', { staticClass: 'q-date__calendar-item' }, [ h('div', [ day ]) ]))),

          h('div', {
            staticClass: 'q-date__calendar-days-container relative-position overflow-hidden'
          }, [
            h('transition', {
              props: {
                name: 'q-transition--slide-' + this.monthDirection
              }
            }, [
              h('div', {
                key: this.innerModel.year + '/' + this.innerModel.month,
                staticClass: 'q-date__calendar-days fit'
              }, this.days.map(day => this.__renderDayWrapper(h, day)))
            ])
          ])
        ])
      ]
    },

    __getMonthsView (h) {
      const currentYear = this.innerModel.year === this.today.year

      const content = this.computedLocale.monthsShort.map((month, i) => {
        const active = this.innerModel.month === i + 1

        return h('div', {
          staticClass: 'q-date__months-item flex flex-center'
        }, [
          h(QBtn, {
            staticClass: currentYear === true && this.today.month === i + 1 ? 'q-date__today' : null,
            props: {
              flat: active !== true,
              label: month,
              unelevated: active,
              color: active === true ? this.computedColor : null,
              textColor: active === true ? this.computedTextColor : null,
              tabindex: this.computedTabindex
            },
            on: cache(this, 'month#' + i, { click: () => { this.__setMonth(i + 1) } })
          })
        ])
      })

      this.yearsInMonthView === true && content.unshift(
        h('div', { staticClass: 'row no-wrap full-width' }, [
          this.__getNavigation(h, {
            label: this.innerModel.year,
            view: 'Years',
            key: this.innerModel.year,
            dir: this.yearDirection,
            goTo: this.__goToYear,
            cls: ' col'
          })
        ])
      )

      return h('div', {
        key: 'months-view',
        staticClass: 'q-date__view q-date__months flex flex-center'
      }, content)
    },

    __getYearsView (h) {
      const
        start = this.startYear,
        stop = start + yearsInterval,
        years = []

      for (let i = start; i <= stop; i++) {
        const active = this.innerModel.year === i

        years.push(
          h('div', {
            staticClass: 'q-date__years-item flex flex-center'
          }, [
            h(QBtn, {
              key: 'yr' + i,
              staticClass: this.today.year === i ? 'q-date__today' : null,
              props: {
                flat: !active,
                label: i,
                dense: true,
                unelevated: active,
                color: active ? this.computedColor : null,
                textColor: active ? this.computedTextColor : null,
                tabindex: this.computedTabindex
              },
              on: cache(this, 'yr#' + i, { click: () => { this.__setYear(i) } })
            })
          ])
        )
      }

      return h('div', {
        staticClass: 'q-date__view q-date__years flex flex-center'
      }, [
        h('div', {
          staticClass: 'col-auto'
        }, [
          h(QBtn, {
            props: {
              round: true,
              dense: true,
              flat: true,
              icon: this.dateArrow[0],
              tabindex: this.computedTabindex
            },
            on: cache(this, 'y-', { click: () => { this.startYear -= yearsInterval } })
          })
        ]),

        h('div', {
          staticClass: 'q-date__years-content col self-stretch row items-center'
        }, years),

        h('div', {
          staticClass: 'col-auto'
        }, [
          h(QBtn, {
            props: {
              round: true,
              dense: true,
              flat: true,
              icon: this.dateArrow[1],
              tabindex: this.computedTabindex
            },
            on: cache(this, 'y+', { click: () => { this.startYear += yearsInterval } })
          })
        ])
      ])
    },

    __getDaysInMonth (obj) {
      return this.calendar !== 'persian'
        ? (new Date(obj.year, obj.month, 0)).getDate()
        : jalaaliMonthLength(obj.year, obj.month)
    },

    __goToMonth (offset) {
      let
        month = Number(this.innerModel.month) + offset,
        yearDir = this.yearDirection

      if (month === 13) {
        month = 1
        this.innerModel.year++
        yearDir = (this.$q.lang.rtl !== true) ? 'left' : 'right'
      }
      else if (month === 0) {
        month = 12
        this.innerModel.year--
        yearDir = (this.$q.lang.rtl !== true) ? 'right' : 'left'
      }

      this.monthDirection = (offset > 0) === (this.$q.lang.rtl !== true) ? 'left' : 'right'
      this.yearDirection = yearDir
      this.innerModel.month = month
      this.emitImmediately === true && this.__updateValue({}, 'month')
    },

    __goToYear (offset) {
      this.monthDirection = this.yearDirection = (offset > 0) === (this.$q.lang.rtl !== true) ? 'left' : 'right'
      this.innerModel.year = Number(this.innerModel.year) + offset
      this.emitImmediately === true && this.__updateValue({}, 'year')
    },

    __setYear (year) {
      this.innerModel.year = year
      this.emitImmediately === true && this.__updateValue({ year }, 'year')
      this.view = this.extModel.month === null || this.defaultView === 'Years' ? 'Months' : 'Calendar'
    },

    __setMonth (month) {
      this.innerModel.month = month
      this.emitImmediately === true && this.__updateValue({ month }, 'month')
      this.view = 'Calendar'
    },

    __setDay (day) {
      this.__updateValue({ day }, 'day')
    },

    __updateValue (date, reason) {
      if (date.year === void 0) {
        date.year = this.innerModel.year
      }
      if (date.month === void 0) {
        date.month = this.innerModel.month
      }
      if (
        date.day === void 0 ||
        (this.emitImmediately === true && (reason === 'year' || reason === 'month'))
      ) {
        date.day = this.innerModel.day
        const maxDay = this.emitImmediately === true
          ? this.__getDaysInMonth(date)
          : this.daysInMonth

        date.day = Math.min(Math.max(1, date.day), maxDay)
      }

      const val = this.calendar === 'persian'
        ? date.year + '/' + pad(date.month) + '/' + pad(date.day)
        : formatDate(
          new Date(
            date.year,
            date.month - 1,
            date.day,
            this.extModel.hour,
            this.extModel.minute,
            this.extModel.second,
            this.extModel.millisecond
          ),
          this.mask,
          this.computedLocale,
          date.year,
          this.extModel.timezoneOffset
        )

      date.changed = val !== this.value
      this.$emit('input', val, reason, date)

      if (val === this.value && reason === 'today') {
        const newHash = date.year + '/' + pad(date.month) + '/' + pad(date.day)
        const curHash = this.innerModel.year + '/' + pad(this.innerModel.month) + '/' + pad(this.innerModel.day)

        if (newHash !== curHash) {
          this.monthDirection = (curHash < newHash) === (this.$q.lang.rtl !== true) ? 'left' : 'right'
          if (date.year !== this.innerModel.year) {
            this.yearDirection = this.monthDirection
          }

          this.$nextTick(() => {
            this.startYear = date.year - date.year % yearsInterval - (date.year < 0 ? yearsInterval : 0)
            Object.assign(this.innerModel, {
              year: date.year,
              month: date.month,
              day: date.day,
              dateHash: newHash
            })
          })
        }
      }
    },

    __renderDayWrapper (h, day) {
      return h('div', {
        staticClass: `q-date__calendar-item q-date__calendar-item--${day.fill === true ? 'fill' : (day.in === true ? 'in' : 'out')}` + this.__getRangeClasses(day),
        style: this.__getRangeStyle(day)
      }, [
        this.__renderDay(h, day)
      ])
    },

    __renderDay (h, day) {
      if (day.in === true) {
        const isRangeDate = this.isDateRangeValid === true && this.__isSelectedDateRange(day.i, this.innerModel.month, this.innerModel.year)
        const color = this.isDateRangeValid === true ? isRangeDate === true ? this.computedColor : void 0 : day.color
        const textColor = this.isDateRangeValid === true ? isRangeDate === true ? this.computedTextColor : void 0 : day.textColor
        const flat = isRangeDate === true ? false : day.flat
        const unelevated = isRangeDate === true ? false : day.unelevated
        const staticClass = isRangeDate === true || day.today === true ? 'q-date__today' : ''

        return h(QBtn, {
          staticClass: staticClass,
          props: {
            dense: true,
            flat: flat,
            unelevated: unelevated,
            color: color,
            textColor: textColor,
            label: day.i,
            tabindex: this.computedTabindex
          },
          on: cache(this, 'day#' + day.i, { click: () => { this.__setDay(day.i) } })
        }, day.event !== false ? [
          h('div', { staticClass: 'q-date__event bg-' + day.event })
        ] : null)
      }

      return h('div', [ day.i ])
    }
  },

  render (h) {
    const content = [
      h('div', {
        staticClass: 'q-date__content col relative-position'
      }, [
        h('transition', {
          props: { name: 'q-transition--fade' }
        }, [
          this[`__get${this.view}View`](h)
        ])
      ])
    ]

    const def = slot(this, 'default')
    def !== void 0 && content.push(
      h('div', { staticClass: 'q-date__actions' }, def)
    )

    if (this.name !== void 0 && this.disable !== true) {
      this.__injectFormInput(content, 'push')
    }

    return h('div', {
      class: this.classes,
      attrs: this.attrs,
      on: { ...this.qListeners }
    }, [
      this.__getHeader(h),

      h('div', {
        staticClass: 'q-date__main col column',
        attrs: { tabindex: -1 },
        ref: 'blurTarget'
      }, content)
    ])
  }
})

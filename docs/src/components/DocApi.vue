<template lang="pug">
q-card.doc-api.q-my-lg(v-if="ready", flat, bordered)
  q-toolbar.text-grey-8.bg-white
    card-title(:title="name", prefix="API--")
    q-space
    .col-auto.text-grey {{ type }}

  q-separator

  div.doc-api-tabs--top.bg-grey-2.text-grey-7.flex.no-wrap
    q-tabs.col(v-model="currentTab", indicator-color="primary", align="left", :breakpoint="0", dense)
      q-tab(
        v-for="tab in tabs"
        :key="`api-tab-${tab}`"
        :name="tab"
      )
        .row.no-wrap.items-center
          span.q-mr-xs.text-uppercase.text-weight-medium {{ tab }}
          q-badge(v-if="tabCount[tab]") {{ tabCount[tab] }}

    q-input.q-mx-sm(
      v-if="$q.screen.gt.xs"
      ref="input",
      v-model="filter",
      dense,
      input-class="text-right",
      borderless,
      placeholder="Filter..."
      style="min-width: 150px"
    )
      template(v-slot:append)
        q-icon.cursor-pointer(
          :name="filter !== '' ? 'clear' : 'search'"
          @click="onFilterClick"
        )

  q-separator

  q-tab-panels(v-model="currentTab", animated)
    q-tab-panel(v-for="tab in tabs", :name="tab", :key="tab" class="q-pa-none")
      .row.no-wrap.api-container(v-if="aggregationModel[tab]")
        .col-auto.row.no-wrap.bg-grey-1.text-grey-7.q-py-lg
          q-tabs(
            v-model="currentInnerTab[tab]",
            active-color="primary",
            indicator-color="primary",
            :breakpoint="0",
            vertical,
            dense,
            shrink
          )
            q-tab(
              v-for="category in apiTabs(tab)"
              :key="`api-inner-tab-${category}`"
              class="inner-tab"
              :name="category"
            )
              .row.no-wrap.items-center.self-stretch
                span.q-mr-xs.text-capitalize.text-weight-medium {{ category }}
                .col
                q-badge(v-if="apiInnerCount(tab, category)") {{ formattedApiInnerCount(tab, category) }}

        q-separator(vertical)

        q-tab-panels.col(
          v-model="currentInnerTab[tab]",
          animated,
          transition-prev="slide-down",
          transition-next="slide-up"
        )
          q-tab-panel(v-for="category in apiTabs(tab)", :name="category", :key="category", class="q-pa-none")
            ApiRows(:which="tab", :apiKey="category", :api="filteredApi[tab]")
      .api-container(v-else)
        ApiRows(:which="tab", :api="filteredApi")
</template>

<script>
import ApiRows from './ApiRows.js'
import CardTitle from './CardTitle.vue'
import { format } from 'quasar'
const { pad } = format

const groupBy = (list, groupKey, defaultGroupKeyValue) => {
  const res = {}

  for (const key in list) {
    if (list[key] !== void 0) {
      const value = list[key]
      const groupKeyValue = (value[groupKey] || defaultGroupKeyValue).split('|')

      for (const groupKeyV of groupKeyValue) {
        if (res[groupKeyV] === void 0) {
          res[groupKeyV] = {}
        }
        res[groupKeyV][key] = value
      }
    }
  }

  return res
}

export default {
  name: 'DocApi',

  components: {
    ApiRows,
    CardTitle
  },

  props: {
    file: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      ready: false,
      currentTab: null,
      currentInnerTab: {
        props: null
      },
      filter: '',
      filteredApi: {},
      tabCount: {}
    }
  },

  watch: {
    filter (val) {
      val = val.trim().toLowerCase()

      if (val === '') {
        this.filteredApi = this.api
        this.tabs.forEach(tab => {
          this.tabCount[tab] = this.apiCount(tab)
        })
        return
      }

      const api = {}

      this.tabs.forEach(tab => {
        if (tab === 'injection') {
          api[tab] = this.api[tab]
          return
        }

        const filterApi = tabApi => {
          const filtered = {}

          Object.keys(tabApi).forEach(name => {
            if (
              (name.toLowerCase().indexOf(val) > -1) ||
              (tabApi[name].desc !== void 0 && tabApi[name].desc.toLowerCase().indexOf(val) > -1)
            ) {
              filtered[name] = tabApi[name]
            }
          })
          return filtered
        }

        if (this.aggregationModel[tab]) {
          api[tab] = {}

          for (const group in this.api[tab]) {
            if (this.api[tab][group] !== void 0) {
              api[tab][group] = filterApi(this.api[tab][group])
            }
          }

          if (this.currentTab === tab) {
            let apiWithResultsCount = 0,
              lastFoundApiWithResults = null
            for (const group in this.api[tab]) {
              if (Object.keys(api[tab][group]).length > 0) {
                apiWithResultsCount++
                lastFoundApiWithResults = group
              }
            }

            if (apiWithResultsCount === 1) {
              this.currentInnerTab[tab] = lastFoundApiWithResults
            }
          }
        }
        else {
          api[tab] = filterApi(this.api[tab])
        }
      })

      this.filteredApi = api
      this.tabs.forEach(tab => {
        this.tabCount[tab] = this.apiCount(tab)
      })
    }
  },

  methods: {
    parseJson (name, { type, behavior, meta, ...api }) {
      this.aggregationModel = {}

      if (type === 'component' && api.props !== void 0) {
        for (const apiGroup of [ 'props' ]) {
          api[apiGroup] = groupBy(api[apiGroup], 'category', 'general')
          this.currentInnerTab[apiGroup] = this.apiTabs(apiGroup, api)[0]
          this.aggregationModel[apiGroup] = true
        }
      }

      this.api = api
      this.filteredApi = api
      this.apiType = type

      this.name = name
      this.type = `${type === 'plugin' ? 'Quasar' : 'Vue'} ${type.charAt(0).toUpperCase()}${type.substring(1)}`
      this.tabs = Object.keys(api)

      if (
        behavior !== void 0 &&
        behavior.$listeners !== void 0
      ) {
        !this.tabs.includes('events') && this.tabs.push('events')
        this.api.events = {
          $listeners: behavior.$listeners,
          ...(this.api.events || {})
        }
      }

      this.currentTab = this.tabs[0]
      this.tabs.forEach(tab => {
        this.tabCount[tab] = this.apiCount(tab)
      })
    },

    onFilterClick () {
      if (this.filter !== '') {
        this.filter = ''
      }
      this.$refs.input.focus()
    },

    apiTabs (tab, api) {
      return Object.keys((api || this.filteredApi)[tab]).sort()
    },

    apiCount (tab) {
      if (this.apiType !== 'plugin' && tab === 'props') {
        let total = 0

        if (this.currentTabMaxCategoryPropCount > 0) {
          Object.keys(this.filteredApi[tab]).forEach(key => {
            total += Object.keys(this.filteredApi[tab][key]).length
          })
        }

        return total
      }

      if ([ 'value', 'arg', 'quasarConfOptions', 'injection' ].includes(tab)) {
        return 1
      }

      return Object.keys(this.filteredApi[tab]).length
    },

    apiInnerCount (tab, category) {
      return Object.keys(this.filteredApi[tab][category]).length
    },

    formattedApiInnerCount (tab, category) {
      return pad(this.apiInnerCount(tab, category), (this.currentTabMaxCategoryPropCount + '').length)
    }
  },

  computed: {
    currentTabMaxCategoryPropCount () {
      if (this.aggregationModel[this.currentTab]) {
        let max = -1
        for (const category in this.filteredApi[this.currentTab]) {
          const count = this.apiInnerCount(this.currentTab, category)
          if (count > max) {
            max = count
          }
        }
        return max
      }

      return 0
    }
  },

  mounted () {
    import(
      /* webpackChunkName: "quasar-api" */
      /* webpackMode: "lazy-once" */
      `quasar/dist/api/${this.file}.json`
    ).then(json => {
      this.parseJson(this.file, json.default)
      this.ready = true
    })
  }
}
</script>

<style lang="sass">
.doc-api
  .q-tab
    height: 40px

  .inner-tab
    justify-content: left
    .q-tab__content
      width: 100%

  .api-container
    max-height: 600px
</style>

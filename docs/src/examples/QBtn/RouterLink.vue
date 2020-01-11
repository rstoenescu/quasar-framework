<template>
  <div class="q-pa-md column q-gutter-sm">
    <router-link :to="{ hash: '#Handling-links' }">
      <template v-slot="props">
        <q-btn v-bind="buttonProps(props)" />
      </template>
    </router-link>

    <router-link :to="{ hash: '#Handling-links', query: { search: '1' } }">
      <template v-slot="props">
        <q-btn v-bind="buttonProps(props)" />
      </template>
    </router-link>

    <router-link :to="{ hash: '#Handling-links', query: { search: '1', test: '1' } }">
      <template v-slot="props">
        <q-btn v-bind="buttonProps(props)" />
      </template>
    </router-link>

    <router-link :to="{ hash: '#Handling-links', query: { search: '1', test: '2' } }">
      <template v-slot="props">
        <q-btn v-bind="buttonProps(props)" />
      </template>
    </router-link>

    <router-link :to="{ hash: '#Handling-links', query: { search: '1', test: '1' } }">
      <template v-slot="props">
        <q-btn v-bind="buttonProps(props)" icon-right="timer_3" @click="linkClick" />
      </template>
    </router-link>
  </div>
</template>

<script>
export default {
  methods: {
    linkClick (e, go) {
      e.navigate = false // we choose when we navigate

      // console.log('triggering navigation in 3s')
      setTimeout(() => {
        // console.log('navigating as promised 3s ago')
        go()
      }, 3000)
    },

    buttonProps ({ href, route, isActive, isExactActive }) {
      const props = {
        color: 'grey-7',
        noCaps: true,
        label: `To "${route.fullPath}"`,
        outline: true,
        to: href
      }

      if (isActive === true) {
        props.color = isExactActive === true ? 'primary' : 'amber-9'
      }
      else {
        props.color = 'grey-7'
      }

      return props
    }
  }
}
</script>

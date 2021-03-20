<template>
  <div class="q-pa-md column no-wrap q-gutter-y-md" style="max-width: 500px">
    <q-btn color="black" label="First focusable element" />

    <q-list bordered padding v-key-group-navigation.vertical>
      <q-item-label header>List with controls</q-item-label>

      <q-item clickable v-ripple>
        <q-item-section>
          <q-item-label>Vertical navigation</q-item-label>
          <q-item-label caption>
            Navigate using <kbd>PG_UP</kbd>, <kbd>ARROW_UP</kbd>, <kbd>ARROW_DOWN</kbd>, <kbd>PG_DOWN</kbd>
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple>
        <q-item-section>
          <q-item-label>Horizontal navigation</q-item-label>
          <q-item-label caption>
            Navigate using <kbd>HOME</kbd>, <kbd>ARROW_LEFT</kbd>, <kbd>ARROW_RIGHT</kbd>, <kbd>END</kbd>
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple>
        <q-item-section>
          <q-item-label>Default</q-item-label>
          <q-item-label caption>
            Navigate using any of the above keys
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section side top>
          <q-checkbox v-model="check" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Notifications</q-item-label>
          <q-item-label caption>
            Notify me about updates to apps or games that I downloaded
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Battery too low</q-item-label>
        </q-item-section>
        <q-item-section side >
          <q-toggle color="blue" v-model="notif" val="battery" />
        </q-item-section>
      </q-item>
    </q-list>

    <q-btn color="black" label="Last focusable element" />
  </div>
</template>

<script>
export default {
  data () {
    return {
      check: true,
      notif: true
    }
  }
}
</script>

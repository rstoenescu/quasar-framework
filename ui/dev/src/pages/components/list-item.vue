<template>
  <div :class="dark ? 'bg-black text-white' : ''">
    <div class="q-layout-padding q-mx-auto" style="max-width: 500px">
      <q-item tag="label" dark class="q-my-sm bg-primary shadow-1" style="border-radius: 30px">
        <q-item-section>
          <q-item-label>Dark background</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-toggle v-model="dark" color="accent" :dark="dark" :false-value="null" />
        </q-item-section>
      </q-item>

      <q-item tag="label" dark class="q-my-sm bg-secondary shadow-1" style="border-radius: 30px">
        <q-item-section>
          <q-item-label>Separator</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-toggle v-model="separator" color="accent" :dark="dark" />
        </q-item-section>
      </q-item>

      <q-item tag="label" dark class="q-my-sm bg-secondary shadow-1" style="border-radius: 30px">
        <q-item-section>
          <q-item-label>Group Key Navigation in first list</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-toggle v-model="keyNavEnabled" color="accent" :dark="dark" />
        </q-item-section>
      </q-item>

      <q-list bordered padding class="q-my-md" :dark="dark" :separator="separator" v-key-group-navigation.vertical="keyNavEnabled">
        <q-item clickable class="text-primary" @click="onClick">
          <q-item-section>Single line item</q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section>Single line item longer text</q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="onClick">
          <q-item-section avatar>
            <q-icon color="primary" name="bluetooth" />
          </q-item-section>
          <q-item-section>List item</q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon color="primary" name="img:https://cdn.quasar.dev/logo/svg/quasar-logo.svg" />
          </q-item-section>
          <q-item-section>List item</q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="signal_wifi_off" />
          </q-item-section>
          <q-item-section>List item</q-item-section>
        </q-item>

        <q-item clickable inset>
          <q-item-section>Inset list item</q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" icon="bluetooth" />
          </q-item-section>
          <q-item-section>List item</q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" rounded icon="bluetooth" />
          </q-item-section>
          <q-item-section>List item</q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section avatar>
            <q-avatar>
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
          </q-item-section>
          <q-item-section>List item</q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section avatar>
            <q-avatar square>
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
          </q-item-section>
          <q-item-section>List item</q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section avatar>
            <q-avatar rounded>
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
          </q-item-section>
          <q-item-section>List item</q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section avatar>
            <q-avatar rounded>
              <img src="https://cdn.quasar.dev/img/mountains.jpg">
            </q-avatar>
          </q-item-section>
          <q-item-section>List item</q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section thumbnail>
            <img src="https://cdn.quasar.dev/img/mountains.jpg">
          </q-item-section>
          <q-item-section>List item</q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section>List item</q-item-section>
          <q-item-section thumbnail>
            <img src="https://cdn.quasar.dev/img/mountains.jpg">
          </q-item-section>
        </q-item>
      </q-list>

      <p class="caption">
        Links
      </p>
      <q-list bordered class="q-my-md" :dark="dark">
        <q-item to="/" exact>
          <q-item-section avatar>
            <q-icon name="bluetooth" />
          </q-item-section>
          <q-item-section>Inactive link</q-item-section>
        </q-item>

        <q-item to="/" exact disable>
          <q-item-section avatar>
            <q-icon name="bluetooth" />
          </q-item-section>
          <q-item-section>Inactive link - Disabled</q-item-section>
        </q-item>

        <q-item :to="$route.path">
          <q-item-section avatar>
            <q-icon name="signal_wifi_off" />
          </q-item-section>
          <q-item-section>Active link</q-item-section>
        </q-item>

        <q-item to="/" exact>
          <q-item-section avatar>
            <q-icon name="bluetooth" />
          </q-item-section>
          <q-item-section>Inactive link</q-item-section>
        </q-item>

        <q-item :to="$route.path">
          <q-item-section avatar>
            <q-icon name="signal_wifi_off" />
          </q-item-section>
          <q-item-section>Active link</q-item-section>
        </q-item>

        <!-- check .my-link CSS class below -->
        <q-item to="/components/list-item" active-class="my-link">
          <q-item-section avatar>
            <q-icon name="signal_wifi_off" />
          </q-item-section>
          <q-item-section>Customized active link</q-item-section>
        </q-item>
      </q-list>

      <p class="caption">
        Active
      </p>
      <q-list padding bordered :dark="dark">
        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="signal_wifi_off" />
          </q-item-section>
          <q-item-section>Normal</q-item-section>
          <q-item-section side>
            Side
          </q-item-section>
        </q-item>
        <q-item clickable v-ripple active>
          <q-item-section avatar>
            <q-icon name="signal_wifi_off" />
          </q-item-section>
          <q-item-section>Active</q-item-section>
          <q-item-section side>
            Side
          </q-item-section>
        </q-item>
        <q-item clickable v-ripple active active-class="text-orange">
          <q-item-section avatar>
            <q-icon name="signal_wifi_off" />
          </q-item-section>
          <q-item-section>Active, Active Color</q-item-section>
          <q-item-section side>
            Side
          </q-item-section>
        </q-item>
      </q-list>

      <p class="caption">
        Dense
      </p>
      <q-list dense padding bordered class="q-my-md" :dark="dark">
        <q-item clickable class="text-primary">
          <q-item-section>Single line item</q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section>Single line item</q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section>Single line item longer text</q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon color="primary" name="bluetooth" />
          </q-item-section>
          <q-item-section>List item</q-item-section>
        </q-item>

        <q-separator spaced :dark="dark" />
        <q-item-label header>
          Dense
        </q-item-label>

        <q-item clickable>
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" icon="bluetooth" />
          </q-item-section>
          <q-item-section>List item</q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" rounded icon="bluetooth" />
          </q-item-section>
          <q-item-section>List item</q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section avatar>
            <q-avatar>
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
          </q-item-section>
          <q-item-section>List item</q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section avatar>
            <q-avatar square>
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
          </q-item-section>
          <q-item-section>List item</q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section avatar>
            <q-avatar rounded>
              <img src="https://cdn.quasar.dev/img/mountains.jpg">
            </q-avatar>
          </q-item-section>
          <q-item-section>List item</q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section thumbnail>
            <img src="https://cdn.quasar.dev/img/mountains.jpg">
          </q-item-section>
          <q-item-section>List item</q-item-section>
        </q-item>
      </q-list>

      <q-list bordered padding class="q-my-md" :dark="dark">
        <q-item>
          <q-item-section>Single line item</q-item-section>
        </q-item>

        <q-item>
          <q-item-section>Single line item longer text</q-item-section>
        </q-item>

        <q-item>
          <q-item-section>List item</q-item-section>
          <q-item-section avatar>
            <q-icon color="primary" name="bluetooth" />
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>List item</q-item-section>
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" icon="bluetooth" />
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>List item</q-item-section>
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" rounded icon="bluetooth" />
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>List item</q-item-section>
          <q-item-section avatar>
            <q-avatar>
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>List item</q-item-section>
          <q-item-section avatar>
            <q-avatar square>
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>List item</q-item-section>
          <q-item-section thumbnail>
            <img src="https://cdn.quasar.dev/img/mountains.jpg">
          </q-item-section>
        </q-item>
      </q-list>

      <q-list bordered padding class="q-my-md" :dark="dark">
        <q-item>
          <q-item-section>
            <q-item-label overline>
              OVERLINE
            </q-item-label>
            <q-item-label>Single line item</q-item-label>
            <q-item-label caption>
              Secondary line text. Lorem ipsum dolor sit amet, consectetur adipiscit elit.
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced :dark="dark" />
        <q-item-label header>
          Section
        </q-item-label>

        <q-item>
          <q-item-section avatar>
            <q-icon color="primary" name="bluetooth" />
          </q-item-section>
          <q-item-section>List item</q-item-section>
        </q-item>

        <q-separator spaced :dark="dark" inset="item" />

        <q-item>
          <q-item-section top avatar>
            <q-avatar color="primary" text-color="white" icon="bluetooth" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Single line item</q-item-label>
            <q-item-label caption>
              Secondary line text. Lorem ipsum dolor sit amet, consectetur adipiscit elit.
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced :dark="dark" inset="item" />

        <q-item>
          <q-item-section top avatar>
            <q-avatar color="primary" text-color="white" square icon="bluetooth" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Single line item</q-item-label>
            <q-item-label caption>
              Secondary line text. Lorem ipsum dolor sit amet, consectetur adipiscit elit.
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced :dark="dark" inset="item" />

        <q-item>
          <q-item-section top avatar>
            <q-avatar>
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>Single line item</q-item-label>
            <q-item-label caption>
              Secondary line text. Lorem ipsum dolor sit amet, consectetur adipiscit elit.
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced :dark="dark" inset="item" />

        <q-item>
          <q-item-section top avatar>
            <q-avatar square>
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>Single line item</q-item-label>
            <q-item-label caption>
              Secondary line text. Lorem ipsum dolor sit amet, consectetur adipiscit elit.
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced :dark="dark" inset="item-thumbnail" />

        <q-item>
          <q-item-section thumbnail>
            <img src="https://cdn.quasar.dev/img/mountains.jpg">
          </q-item-section>

          <q-item-section>
            <q-item-label>Single line item</q-item-label>
            <q-item-label caption>
              Secondary line text. Lorem ipsum dolor sit amet, consectetur adipiscit elit.
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-list bordered padding class="q-my-md" :dark="dark">
        <q-item>
          <q-item-section>
            <q-item-label overline>
              OVERLINE
            </q-item-label>
            <q-item-label>Single line item</q-item-label>
            <q-item-label caption>
              Secondary line text. Lorem ipsum dolor sit amet, consectetur adipiscit elit.
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption>
              5 min ago
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced :dark="dark" />
        <q-item-label header>
          Section
        </q-item-label>

        <q-item>
          <q-item-section avatar>
            <q-icon color="primary" name="bluetooth" />
          </q-item-section>
          <q-item-section>List item</q-item-section>
          <q-item-section side>
            <q-item-label caption>
              meta
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced :dark="dark" inset="item" />

        <q-item>
          <q-item-section top avatar>
            <q-avatar color="primary" text-color="white" icon="bluetooth" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Single line item</q-item-label>
            <q-item-label caption lines="2">
              Secondary line text. Lorem ipsum dolor sit amet, consectetur adipiscit elit.
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption>
              5 min ago
            </q-item-label>
            <q-icon name="star" color="yellow" />
          </q-item-section>
        </q-item>

        <q-separator spaced :dark="dark" inset="item" />

        <q-item>
          <q-item-section top avatar>
            <q-avatar color="primary" text-color="white" square icon="bluetooth" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Single line item</q-item-label>
            <q-item-label caption>
              Secondary line text. Lorem ipsum dolor sit amet, consectetur adipiscit elit.
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption>
              meta
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced :dark="dark" inset="item" />

        <q-item>
          <q-item-section top avatar>
            <q-avatar>
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>Single line item</q-item-label>
            <q-item-label caption>
              Secondary line text. Lorem ipsum dolor sit amet, consectetur adipiscit elit.
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-chip color="primary" text-color="white" dense square>
              10k
            </q-chip>
          </q-item-section>
        </q-item>

        <q-separator spaced :dark="dark" inset="item" />

        <q-item>
          <q-item-section top avatar>
            <q-avatar rounded>
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>Single line item</q-item-label>
            <q-item-label caption>
              Secondary line text. Lorem ipsum dolor sit amet, consectetur adipiscit elit.
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption>
              meta
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced :dark="dark" />

        <q-item>
          <q-item-section top thumbnail class="q-ml-none">
            <img class="rounded-borders" src="https://cdn.quasar.dev/img/mountains.jpg">
          </q-item-section>

          <q-item-section>
            <q-item-label>Single line item</q-item-label>
            <q-item-label caption>
              Secondary line text. Lorem ipsum dolor sit amet, consectetur adipiscit elit.
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption>
              meta
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-list bordered padding :dark="dark">
        <q-item-label header>
          User Controls
        </q-item-label>

        <q-item>
          <q-item-section>
            <q-item-label>Content filtering</q-item-label>
            <q-item-label caption>
              Set the content filtering level to restrict
              apps that can be downloaded
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label>Password</q-item-label>
            <q-item-label caption>
              Require password for purchase or use
              password to restrict purchase
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced :dark="dark" />
        <q-item-label header>
          General
        </q-item-label>

        <q-item>
          <q-item-section class="scroll">
            <q-input v-model="text" label="Text field label - Text field label - Text field label - Text field label - Text field label - Text field label" filled />
          </q-item-section>
        </q-item>

        <q-item tag="label">
          <q-item-section>
            Label for input:
          </q-item-section>
          <q-item-section class="scroll">
            <q-input v-model="text" filled />
          </q-item-section>
        </q-item>

        <q-item tag="label">
          <q-item-section>
            Label for input:
          </q-item-section>
          <q-item-section class="scroll">
            <q-input v-model="text" label="Has label" filled />
          </q-item-section>
        </q-item>

        <q-item tag="label">
          <q-item-section side>
            <q-checkbox :dark="dark" v-model="check1" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Notifications</q-item-label>
            <q-item-label caption>
              Notify me about updates to apps or games that I downloaded
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item tag="label">
          <q-item-section side>
            <q-checkbox :dark="dark" v-model="check2" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Sound</q-item-label>
            <q-item-label caption>
              Auto-update apps at anytime. Data charges may apply
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item tag="label">
          <q-item-section side>
            <q-checkbox :dark="dark" v-model="check3" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Auto-add widgets</q-item-label>
            <q-item-label caption>
              Automatically add home screen widgets
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <div class="q-layout-padding" style="max-width: 700px">
      <q-item-label header>
        Google Inbox style
      </q-item-label>
      <q-list class="shadow-1 q-pa-none">
        <q-item>
          <q-item-section avatar top>
            <q-icon name="fab fa-github" color="black" size="34px" />
          </q-item-section>

          <q-item-section top class="col-2 gt-sm">
            <q-item-label class="q-mt-sm">
              GitHub
            </q-item-label>
          </q-item-section>

          <q-item-section top>
            <q-item-label lines="1">
              <span class="text-weight-medium">[quasarframework/quasar]</span>
              <span class="text-grey-8"> - GitHub repository</span>
            </q-item-label>
            <q-item-label caption lines="1">
              @rstoenescu in #3: > Generic type parameter for props
            </q-item-label>
            <div class="q-mt-xs text-body2 text-weight-bold text-primary text-uppercase">
              <span class="cursor-pointer">Open in GitHub</span>
            </div>
          </q-item-section>

          <q-item-section top class="col-auto">
            <div class="text-grey-8 q-gutter-xs">
              <q-btn size="12px" flat dense round icon="delete" />
              <q-btn size="12px" flat dense round icon="done" />
              <q-btn size="12px" flat dense round icon="more_vert" />
            </div>
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section avatar top>
            <q-icon name="fab fa-github" color="black" size="34px" />
          </q-item-section>

          <q-item-section top class="col-2 gt-sm">
            <q-item-label class="q-mt-sm">
              GitHub
            </q-item-label>
          </q-item-section>

          <q-item-section top>
            <q-item-label lines="1">
              <span class="text-weight-medium">[quasarframework/quasar-cli]</span>
              <span class="text-grey-8"> - GitHub repository</span>
            </q-item-label>
            <q-item-label caption lines="1">
              @rstoenescu in #1: > The build system
            </q-item-label>
            <div class="q-mt-xs text-body2 text-weight-bold text-primary text-uppercase">
              <span class="cursor-pointer">Open in GitHub</span>
            </div>
          </q-item-section>

          <q-item-section top class="col-auto">
            <div class="text-grey-8 q-gutter-xs">
              <q-btn size="12px" flat dense round icon="delete" />
              <q-btn size="12px" flat dense round icon="done" />
              <q-btn size="12px" flat dense round icon="more_vert" />
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <q-list class="q-my-sm" bordered style="max-width: 100px">
        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white">
              R
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label lines="2">
              Ruddy Jedrzej
            </q-item-label>
            <q-item-label caption lines="1">
              VERRRYY LOOONNNGGGGGG TEXTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-item-label lines="1">
              Ruddy Jedrzej
            </q-item-label>
            <q-item-label caption lines="1">
              VERRRYY LOOONNNGGGGGG TEXTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      dark: null,
      separator: false,
      keyNavEnabled: true,

      check1: true,
      check2: false,
      check3: false,

      text: 'text'
    }
  },

  methods: {
    onClick () {
      console.log('onClick')
    }
  }
}
</script>

<style lang="stylus">
.my-link
  color white
  background $deep-orange
</style>

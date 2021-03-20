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

      <q-input v-model="text" filled label="QInput" />

      <q-select v-model="select" :options="selectOptions" filled label="QSelect" />

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

    <q-bar v-key-group-navigation>
      <q-btn flat dense color="black" no-caps label="File" class="q-px-sm">
        <q-menu>
          <q-list dense style="min-width: 100px" v-key-group-navigation>
            <q-item clickable v-close-popup>
              <q-item-section>Open...</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section>New</q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable>
              <q-item-section>Preferences</q-item-section>
              <q-item-section side>
                <q-icon name="keyboard_arrow_right" />
              </q-item-section>

              <q-menu anchor="top right" self="top left">
                <q-list v-key-group-navigation>
                  <q-item
                    v-for="n in 3"
                    :key="n"
                    dense
                    clickable
                  >
                    <q-item-section>Submenu Label</q-item-section>
                    <q-item-section side>
                      <q-icon name="keyboard_arrow_right" />
                    </q-item-section>
                    <q-menu auto-close anchor="top right" self="top left">
                      <q-list v-key-group-navigation>
                        <q-item
                          v-for="n in 3"
                          :key="n"
                          dense
                          clickable
                        >
                          <q-item-section>3rd level Label</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>

            <q-separator />

            <q-item clickable v-close-popup>
              <q-item-section>Quit</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-btn flat dense color="black" no-caps label="Edit" class="q-px-sm q-ml-md">
        <q-menu auto-close>
          <q-list dense style="min-width: 100px" v-key-group-navigation>
            <q-item clickable>
              <q-item-section>Cut</q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section>Copy</q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section>Paste</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable>
              <q-item-section>Select All</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-space />

      <q-btn dense flat icon="minimize" />
      <q-btn dense flat icon="crop_square" />
      <q-btn dense flat icon="close" />
    </q-bar>

    <q-toolbar class="bg-primary text-white q-my-md shadow-2" v-key-group-navigation>
      <q-btn flat round dense icon="menu" class="q-mr-sm" />
      <q-separator dark vertical inset />
      <q-btn stretch flat label="Link" />

      <q-space />

      <q-btn-dropdown stretch flat label="Dropdown">
        <q-list v-key-group-navigation>
          <q-item-label header>Folders</q-item-label>
          <q-item v-for="n in 3" :key="`x.${n}`" clickable v-close-popup tabindex="0">
            <q-item-section avatar>
              <q-avatar icon="folder" color="secondary" text-color="white" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Photos</q-item-label>
              <q-item-label caption>February 22, 2016</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="info" />
            </q-item-section>
          </q-item>
          <q-separator inset spaced />
          <q-item-label header>Files</q-item-label>
          <q-item v-for="n in 3" :key="`y.${n}`" clickable v-close-popup tabindex="0">
            <q-item-section avatar>
              <q-avatar icon="assignment" color="primary" text-color="white" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Vacation</q-item-label>
              <q-item-label caption>February 22, 2016</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="info" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <q-separator dark vertical />
      <q-btn stretch flat label="Link" />
      <q-separator dark vertical />
      <q-btn stretch flat label="Link" />
    </q-toolbar>

    <q-toolbar class="bg-purple text-white shadow-2 rounded-borders" v-key-group-navigation>
      <q-btn stretch flat label="Menu" />
      <q-btn stretch flat label="Homepage" />
      <q-space />

      <!--
        notice shrink property since we are placing it
        as child of QToolbar
      -->
      <q-tabs v-model="tab" shrink>
        <q-tab name="tab1" label="Tab 1" />
        <q-tab name="tab2" label="Tab 2" />
        <q-tab name="tab3" label="Tab 3" />
        <q-tab name="tab4" label="Tab 4" />
        <q-tab name="tab5" label="Tab 5" />
        <q-tab name="tab6" label="Tab 6" />
      </q-tabs>
    </q-toolbar>

    <!-- QEditor already uses the keyboard navigation inside -->
    <q-editor v-model="editor" min-height="5rem" />

    <!-- QDate already uses the keyboard navigation inside -->
    <q-date v-model="date" />

    <div class="column no-wrap q-gutter-y-sm q-px-sm q-pb-sm bg-grey-6" v-key-group-navigation>
      <div class="q-pa-md bg-grey-4 rounded-borders" tabindex="0">Key navigation - 1</div>
      <div class="q-pa-md bg-grey-4 rounded-borders" tabindex="0">Key navigation - 2</div>
      <div class="q-pa-md bg-grey-4 rounded-borders" tabindex="0">Key navigation - 3</div>
    </div>

    <div class="column no-wrap q-gutter-y-sm q-px-sm q-pb-sm bg-grey-6" v-key-group-navigation>
      <div class="q-pa-md bg-grey-4 rounded-borders" tabindex="0">Key navigation - 1</div>
      <div class="q-pa-md bg-grey-4 rounded-borders" tabindex="0">Key navigation - 2</div>
      <div class="q-pa-md bg-grey-4 rounded-borders" tabindex="0">Key navigation - 3</div>
    </div>

    <q-btn color="black" label="Last focusable element" />
  </div>
</template>

<script>
export default {
  data () {
    return {
      text: null,
      select: null,
      selectOptions: [ 'one', 'two', 'three' ],
      check: true,
      notif: true,
      tab: null,
      editor: 'What you see is <b>what</b> you get.',
      date: '2019/02/01'
    }
  }
}
</script>

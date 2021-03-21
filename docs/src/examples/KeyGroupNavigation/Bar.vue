<template>
  <div class="q-pa-md column no-wrap q-gutter-y-md" style="max-width: 500px">
    <q-btn color="black" label="First focusable element" />

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

    <q-btn color="black" label="Last focusable element" />
  </div>
</template>

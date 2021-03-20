<template>
  <div>
    <div class="q-layout-padding">
      <div class="caption row items-center justify-between" style="margin-top: 134px;">
        This page has intended scroll so you can see multiple scenarios.

        <q-select
          v-model="transition"
          :options="transitions"
          map-options
          emit-value
          label="transition"
          clearable
          color="deep-orange"
          outlined
          dense
          style="min-width: 14em"
          behavior="menu"
        />
      </div>

      <div class="q-gutter-sm">
        <q-toggle v-model="toggle" class="z-max fixed-top-left" />
        <q-btn color="primary" label="Persistent">
          <q-menu
            v-model="toggle"
            ref="popover1"
            persistent
            transition-show="jump-down"
            @show="log('@show popover1 persistent')"
            @hide="log('@hide popover1 persistent')"
          >
            <input v-model="gigi">
            <q-list padding style="min-width: 100px">
              <q-item
                v-for="n in 20"
                :key="n"
                clickable
                v-close-popup
                @click="showNotify()"
              >
                <q-item-section>Label {{ n }}/20</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn color="primary" label="Decoupled">
          <q-menu
            :value="toggle"
            ref="popover11"
            persistent
            transition-show="jump-up"
            anchor="top end"
            @show="log('@show popover11 decoupled')"
            @hide="log('@hide popover11 decoupled')"
          >
            <input v-model="gigi">
            <q-list padding style="min-width: 100px">
              <q-item
                v-for="n in 20"
                :key="n"
                clickable
                v-close-popup
                @click="showNotify()"
              >
                <q-item-section>Label {{ n }}/20</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn color="primary" icon="map">
          <q-menu @show="log('@show popover_map')" @hide="log('@hide popover_map')" transition-show="flip-right" transition-hide="flip-left">
            <q-list style="min-width: 100px">
              <div style="height: 50px" class="bg-grey-3">
                Weee
              </div>

              <q-item
                v-for="n in 20"
                :key="n"
                clickable
                v-close-popup
                @click="showNotify()"
              >
                <q-item-section>Label {{ n }}/20</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn color="primary" label="Cover">
          <q-menu cover @show="log('@show cover')" @hide="log('@hide cover')" v-bind="transition">
            <q-list style="min-width: 100px">
              <q-item
                v-for="n in 20"
                :key="n"
                clickable
                v-close-popup
                @click="showNotify()"
              >
                <q-item-section>Label {{ n }}/20</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn color="primary" label="Menu with select">
          <q-menu cover @show="log('@show cover')" @hide="log('@hide cover')" content-class="q-pa-md" v-bind="transition">
            <div class="column q-gutter-md">
              <q-select v-model="selectModelS" :options="selectOptions" behavior="menu" filled label="Select single - menu use-input" clearable use-input autofocus />
              <q-select v-model="selectModelS" :options="selectOptions" behavior="menu" filled label="Select single - menu" clearable />
              <q-select v-model="selectModelM" :options="selectOptions" behavior="menu" filled multiple label="Select multiple - menu" clearable />
              <q-select v-model="selectModelS" :options="selectOptions" behavior="dialog" filled label="Select single - dialog" clearable />
              <q-select v-model="selectModelM" :options="selectOptions" behavior="dialog" filled multiple label="Select multiple - dialog" clearable />
            </div>
          </q-menu>
        </q-btn>

        <q-btn @click="dialog = true" label="Dialog" />
        <q-dialog v-model="dialog">
          <q-card class="q-pa-xl">
            <div class="q-gutter-md">
              <q-btn label="Close Dialog" v-close-popup />
              <q-btn label="Open Dialog" @click="dialog2 = true" />
              <q-btn label="Menu" color="primary">
                <q-menu>
                  <q-list>
                    <q-item clickable @click="dialog2 = true">
                      <q-item-section>
                        Open Dialog
                      </q-item-section>
                    </q-item>
                    <q-item v-close-popup clickable @click="dialog2 = true">
                      <q-item-section>
                        Close Menu and Open Dialog
                      </q-item-section>
                    </q-item>
                    <q-item v-for="n in 5" :key="n" v-close-popup clickable>
                      <q-item-section>Menu Item {{ n }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </q-card>
        </q-dialog>

        <q-dialog v-model="dialog2">
          <q-card class="q-pa-xl">
            <div class="q-gutter-md">
              <q-btn label="Close Dialog" v-close-popup />
              <q-btn label="Menu" color="primary">
                <q-menu>
                  <q-list>
                    <q-item v-for="n in 5" :key="n" v-close-popup clickable>
                      <q-item-section>Menu Item {{ n }}/5</q-item-section>
                    </q-item>
                    <q-item clickable>
                      <q-item-section>Submenu Label</q-item-section>
                      <q-item-section side>
                        <q-icon name="keyboard_arrow_right" />
                      </q-item-section>
                      <q-menu anchor="top right" self="top left">
                        <q-list>
                          <q-item v-for="n in 5" :key="n" v-close-popup clickable>
                            <q-item-section>Menu Item {{ n }}/5</q-item-section>
                          </q-item>
                          <q-item clickable v-close-popup="2">
                            <q-item-section>Close dialog</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </q-card>
        </q-dialog>

        <q-btn color="purple" label="Account Settings">
          <q-menu v-bind="transition">
            <div class="row no-wrap q-pa-md">
              <div class="column">
                <div class="text-h6 q-mb-md">Settings</div>
                <q-toggle v-model="mobileData" label="Use Mobile Data" />
                <q-toggle v-model="bluetooth" label="Bluetooth" />
              </div>

              <q-separator vertical inset class="q-mx-lg" />

              <div class="column items-center">
                <q-avatar size="72px">
                  <img src="https://cdn.quasar.dev/img/avatar4.jpg">
                </q-avatar>

                <div class="text-subtitle1 q-mt-md q-mb-xs">John Doe</div>

                <q-btn
                  color="primary"
                  label="Logout"
                  push
                  size="sm"
                  v-close-popup
                />
              </div>
            </div>
          </q-menu>
        </q-btn>

        <q-btn color="brown" label="Max Height Menu">
          <q-menu max-height="130px" v-bind="transition">
            <q-list style="min-width: 100px">
              <q-item clickable>
                <q-item-section>New tab</q-item-section>
              </q-item>
              <q-item clickable>
                <q-item-section>New incognito tab</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable>
                <q-item-section>Recent tabs</q-item-section>
              </q-item>
              <q-item clickable>
                <q-item-section>History</q-item-section>
              </q-item>
              <q-item clickable>
                <q-item-section>Downloads</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable>
                <q-item-section>Settings</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable>
                <q-item-section>Help &amp; Feedback</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn color="indigo" label="Max Width Menu">
          <q-menu max-width="80px" v-bind="transition">
            <q-list style="min-width: 100px">
              <q-item clickable>
                <q-item-section>
                  <q-item-label lines="1">New tab</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable>
                <q-item-section>
                  <q-item-label lines="1">New incognito tab</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable>
                <q-item-section>
                  <q-item-label lines="1">Recent tabs</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable>
                <q-item-section>
                  <q-item-label lines="1">History</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable>
                <q-item-section>
                  <q-item-label lines="1">Downloads</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable>
                <q-item-section>
                  <q-item-label lines="1">Settings</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable>
                <q-item-section>
                  <q-item-label lines="1">Help & Feedback</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <div class="q-gutter-md q-my-md">
        <q-card class="q-mx-auto" style="width: 500px; max-width: 90vw;">
          <q-card-section class="bg-primary text-center">
            <q-btn push color="orange" label="Tap Me Large">
              <q-menu
                :fit="fit"
                :cover="cover"
                :anchor="anchor"
                :self="self"
                :offset="calculatedOffset"
                auto-close
                v-bind="transition"
              >
                <q-list style="min-width: 400px">
                  <q-item
                    v-for="n in 50"
                    :key="n"
                    clickable
                    @click="showNotify()"
                  >
                    <q-item-section>Label {{ n }}/50</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            <q-btn push color="orange" label="Tap Me Small" class="on-right">
              <q-menu
                :fit="fit"
                :cover="cover"
                :anchor="anchor"
                :self="self"
                :offset="calculatedOffset"
                v-bind="transition"
              >
                <q-list>
                  <q-item
                    v-for="n in 5"
                    :key="n"
                    v-close-popup
                    clickable
                    @click="showNotify()"
                  >
                    <q-item-section>Label {{ n }}/5</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-card-section>

          <div class="text-weight-bold text-center q-my-md">
            Configure the Popover for button above.
          </div>
          <div class="text-center" v-if="cover">
            <q-chip square color="primary" text-color="white">
              cover
            </q-chip>
            <q-chip square color="primary" text-color="white">
              anchor="{{ anchor }}"
            </q-chip>
          </div>
          <div class="text-center" v-else>
            <q-chip v-if="fit" square color="primary" text-color="white">
              fit
            </q-chip>
            <q-chip square color="primary" text-color="white">
              anchor="{{ anchor }}"
            </q-chip>
            <q-chip square color="primary" text-color="white">
              self="{{ self }}"
            </q-chip>
          </div>
          <div class="row flex-center q-my-sm q-gutter-md">
            <q-toggle v-model="fit" label="Fit" />
            <q-toggle v-model="cover" label="Cover" />
            <q-toggle v-model="offset" label="Offset [50, 50]" />
          </div>
          <q-card-section class="row" :class="cover ? 'justify-center' : ''">
            <div class="column items-center col-6">
              <div class="text-weight-bold">
                Anchor Origin
              </div>
              <div class="flex q-gutter-sm">
                <div class="column">
                  <div>Vertical</div>
                  <q-radio v-model="anchorOrigin.vertical" val="top" label="Top" />
                  <q-radio v-model="anchorOrigin.vertical" val="center" label="Center" />
                  <q-radio v-model="anchorOrigin.vertical" val="bottom" label="Bottom" />
                </div>
                <div class="column">
                  <div>Horizontal</div>
                  <q-radio v-model="anchorOrigin.horizontal" val="left" label="Left" />
                  <q-radio v-model="anchorOrigin.horizontal" val="middle" label="Middle" />
                  <q-radio v-model="anchorOrigin.horizontal" val="right" label="Right" />
                  <q-radio v-model="anchorOrigin.horizontal" val="start" label="Start" />
                  <q-radio v-model="anchorOrigin.horizontal" val="end" label="End" />
                </div>
              </div>
            </div>

            <div class="column items-center col-6" v-if="!cover">
              <div class="text-weight-bold">
                Self Origin
              </div>
              <div class="flex q-gutter-sm">
                <div class="column">
                  <div>Vertical</div>
                  <q-radio v-model="selfOrigin.vertical" val="top" label="Top" />
                  <q-radio v-model="selfOrigin.vertical" val="center" label="Center" />
                  <q-radio v-model="selfOrigin.vertical" val="bottom" label="Bottom" />
                </div>
                <div class="column">
                  <div>Horizontal</div>
                  <q-radio v-model="selfOrigin.horizontal" val="left" label="Left" />
                  <q-radio v-model="selfOrigin.horizontal" val="middle" label="Middle" />
                  <q-radio v-model="selfOrigin.horizontal" val="right" label="Right" />
                  <q-radio v-model="selfOrigin.horizontal" val="start" label="Start" />
                  <q-radio v-model="selfOrigin.horizontal" val="end" label="End" />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="q-mx-auto" style="width: 500px; max-width: 90vw;">
          <q-card-section>
            <div class="q-gutter-sm">
              <q-toggle label="touch-position" v-model="touchPosition" toggle-indeterminate :indeterminate-value="null" />
              <q-toggle label="context-menu" v-model="contextMenu" />
            </div>
          </q-card-section>
          <q-img src="https://cdn.quasar.dev/img/material.png" style="height: 100px">
            <q-menu
              :touch-position="touchPosition"
              :context-menu="contextMenu"
              :offset="calculatedOffset"
              :fit="fit"
              :cover="cover"
            >
              <q-list>
                <q-item
                  v-for="n in 5"
                  :key="n"
                  v-close-popup
                  clickable
                  @click="showNotify()"
                >
                  <q-item-section>Label {{ n }}/5</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-img>
          <div>With model: {{ menuModelTouch }}</div>
          <q-img src="https://cdn.quasar.dev/img/material.png" style="height: 100px">
            <q-menu
              v-model="menuModelTouch"
              :touch-position="touchPosition"
              :context-menu="contextMenu"
              :offset="calculatedOffset"
              :fit="fit"
              :cover="cover"
            >
              <q-list>
                <q-item
                  v-for="n in 5"
                  :key="n"
                  v-close-popup
                  clickable
                  @click="showNotify()"
                >
                  <q-item-section>Label {{ n }}/5</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-img>
        </q-card>

        <q-card class="q-mx-auto" style="width: 500px; max-width: 90vw;">
          <q-card-section>
            <q-toggle v-model="vIfTest" label="v-if test" />
          </q-card-section>
          <q-img src="https://cdn.quasar.dev/img/material.png" style="height: 100px" v-if="vIfTest">
            <div class="absolute-bottom-right">
              attached to q-img
            </div>
            <q-menu touch-position>
              <q-list>
                <q-item
                  v-for="n in 5"
                  :key="n"
                  v-close-popup
                  clickable
                  @click="showNotify()"
                >
                  <q-item-section>Label {{ n }}/5</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-img>
          <q-img src="https://cdn.quasar.dev/img/parallax2.jpg" style="height: 100px">
            <div class="absolute-bottom-right">
              attached to q-menu
            </div>
            <q-menu touch-position v-if="vIfTest">
              <q-list>
                <q-item
                  v-for="n in 5"
                  :key="n"
                  v-close-popup
                  clickable
                  @click="showNotify()"
                >
                  <q-item-section>Label {{ n }}/5</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-img>
        </q-card>

        <q-card class="q-mx-auto" style="width: 500px; max-width: 90vw;">
          <q-card-section>
            <div class="row items-center q-gutter-sm">
              <q-chip square color="primary" text-color="white">
                target
              </q-chip>
              <q-radio v-model="targetEl" :val="false" label="false (no target whatsoever)" />
              <q-radio v-model="targetEl" :val="true" label="true (original parent)" />
              <q-radio v-model="targetEl" val="#target-img-1" label="#target-img-1" />
              <q-radio v-model="targetEl" val="#target-img-2" label="#target-img-2" />
              <q-radio v-model="targetEl" val="#bogus" label="#bogus" />
            </div>
          </q-card-section>
          <q-img src="https://cdn.quasar.dev/img/material.png" id="target-img-1" style="height: 100px">
            <div class="absolute-bottom-right">
              #target-img-1
            </div>
          </q-img>
          <q-img src="https://cdn.quasar.dev/img/parallax2.jpg" id="target-img-2" style="height: 100px">
            <div class="absolute-bottom-right">
              #target-img-2
            </div>
          </q-img>
          <q-img src="https://cdn.quasar.dev/img/blueish.jpg" style="height: 100px">
            <div class="absolute-bottom-right">
              Original parent
            </div>
            <q-menu touch-position :target="targetEl">
              <q-list>
                <q-item
                  v-for="n in 5"
                  :key="n"
                  v-close-popup
                  clickable
                  @click="showNotify()"
                >
                  <q-item-section>Label {{ n }}/5</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-img>
        </q-card>

        <q-card class="q-mx-auto" style="width: 500px; max-width: 90vw;">
          <q-card-section>
            Menu in menu
          </q-card-section>
          <q-img src="https://cdn.quasar.dev/img/parallax1.jpg" style="height: 100px">
            <q-menu touch-position>
              <q-list>
                <q-item
                  v-close-popup
                  clickable
                >
                  <q-item-section>v-close-popup</q-item-section>
                </q-item>

                <q-item
                  v-for="n in 3"
                  :key="n"
                  clickable
                >
                  <q-item-section>Label</q-item-section>
                  <q-item-section side>
                    <q-icon name="keyboard_arrow_right" />
                  </q-item-section>

                  <q-menu anchor="top end" self="top start">
                    <q-list>
                      <q-item
                        v-close-popup
                        clickable
                      >
                        <q-item-section>v-close-popup</q-item-section>
                      </q-item>

                      <q-item
                        v-for="x in 3"
                        :key="x"
                        clickable
                      >
                        <q-item-section>Submenu autoclose</q-item-section>
                        <q-item-section side>
                          <q-icon name="keyboard_arrow_right" />
                        </q-item-section>
                        <q-menu auto-close anchor="top end" self="top start">
                          <q-list>
                            <q-item
                              v-for="y in 3"
                              :key="y"
                              clickable
                            >
                              <q-item-section>3rd level Label</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-item>

                      <q-item clickable>
                        <q-item-section>Submenu closepopup</q-item-section>
                        <q-item-section side>
                          <q-icon name="keyboard_arrow_right" />
                        </q-item-section>
                        <q-menu anchor="top end" self="top start">
                          <q-list>
                            <q-item
                              v-for="x in 3"
                              :key="x"
                              clickable
                              v-close-popup
                            >
                              <q-item-section>3rd level Label</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-item>
              </q-list>
            </q-menu>
          </q-img>
        </q-card>
      </div>

      <div style="width: 110vw; height: 40vh">
        <div class="row q-pa-sm">
          <div class="col-4">Left col</div>
          <div class="col-4">
            <q-select v-model="selectModelS" :options="selectOptions" behavior="menu" filled label="Select single - menu - fit" />
          </div>
        </div>
        <div class="row q-pa-sm">
          <div class="col-4">Left col</div>
          <div class="col-4">
            <q-select v-model="selectModelS" :options="selectOptions" behavior="menu" filled label="Select single - menu - cover" options-cover />
          </div>
        </div>
      </div>

      <q-btn color="secondary" class="fixed-top-right" icon="directions" style="margin: 65px 35px;">
        <q-menu ref="popover3" v-bind="transition">
          <q-img
            src="https://cdn.quasar.dev/img/map.png"
            style="height: 150px; width: 200px;"
            @click.native="showNotify(), $refs.popover3.hide()"
            tabindex="0"
          />
        </q-menu>
      </q-btn>

      <q-btn color="accent" class="fixed-bottom-right" icon="plus_one" style="margin: 35px;">
        <q-menu ref="popover4" v-bind="transition">
          <div class="group" style="width: 220px; text-align: center;">
            <q-btn icon="thumb_up" flat color="primary" @click="showNotify(), $refs.popover4.hide()" />
            <q-btn icon="thumb_down" flat color="primary" @click="showNotify(), $refs.popover4.hide()" />
            <q-btn icon="share" flat color="secondary" @click="showNotify(), $refs.popover4.hide()" />
          </div>
        </q-menu>
      </q-btn>
    </div>

    <q-btn icon="menu" color="primary" class="fixed-bottom-left" style="margin: 35px;">
      <q-menu ref="popover5" v-bind="transition">
        <q-list style="min-width: 200px">
          <q-item
            v-for="n in 20"
            :key="n"
            clickable
            @click.native="showNotify(), $refs.popover5.hide()"
          >
            <q-item-section>Label {{ n }}/20</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
</template>

<script>
export default {
  data () {
    const list = []
    for (let i = 0; i < 26 * 30; i += 1) {
      const c = String.fromCharCode(97 + (i % 26))
      const v = `${c}${c}${c}${c}${c}#${i}`
      list.push({ label: v, value: v })
    }
    return {
      gigi: '',
      fit: false,
      cover: false,
      offset: false,
      toggle: true,
      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
      selfOrigin: { vertical: 'top', horizontal: 'left' },
      terms: '',
      modelDate: null,
      model: 30,
      menuModelTouch: false,
      min: 0,
      max: 50,
      list,

      selectModelS: null,
      selectModelM: null,
      selectOptions: list,

      vIfTest: true,
      touchPosition: true,
      contextMenu: true,
      targetEl: '#target-img-1',

      dialog: false,
      dialog2: false,

      mobileData: true,
      bluetooth: false,

      transitions: [
        { label: 'Flip', value: { transitionShow: 'flip-right', transitionHide: 'flip-left' } },
        { label: 'Scale', value: { transitionShow: 'scale', transitionHide: 'scale' } },
        { label: 'Jump', value: { transitionShow: 'jump-down', transitionHide: 'jump-up' } },
        { label: 'Rotate', value: { transitionShow: 'rotate', transitionHide: 'rotate' } }
      ],
      transition: null
    }
  },
  computed: {
    anchor () {
      return `${this.anchorOrigin.vertical} ${this.anchorOrigin.horizontal}`
    },
    self () {
      return `${this.selfOrigin.vertical} ${this.selfOrigin.horizontal}`
    },
    calculatedOffset () {
      return this.offset === true ? [50, 50] : void 0
    }
  },
  methods: {
    showNotify () {
      this.$q.notify((this.$q.platform.is.desktop ? 'Clicked' : 'Tapped') + ' on a QMenu item')
    },
    log (msg) {
      console.log(msg)
    }
  }
}
</script>

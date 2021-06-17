<template>
  <div class="q-pa-md">
    <div class="q-gutter-md" style="max-width: 300px">
      <q-field label="Standard" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">Field content</div>
        </template>
      </q-field>

      <q-field filled label="Filled" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">Field content</div>
        </template>
      </q-field>

      <q-field outlined label="Outlined" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">Field content</div>
        </template>
      </q-field>

      <q-field outlined outlined-bg-color="white" label="Outlined - Material Design" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">Field content</div>
        </template>
      </q-field>

      <q-field standout label="Standout" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">Field content</div>
        </template>
      </q-field>

      <q-field standout="bg-teal text-white" label="Custom standout" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">Field content</div>
        </template>
      </q-field>

      <q-field borderless label="Borderless" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">Field content</div>
        </template>
      </q-field>

      <q-field rounded filled label="Rounded filled" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">Field content</div>
        </template>
      </q-field>

      <q-field rounded outlined label="Rounded outlined" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">Field content</div>
        </template>
      </q-field>

      <q-field rounded standout label="Rounded standout" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">Field content</div>
        </template>
      </q-field>

      <q-field square filled label="Square filled" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">Field content</div>
        </template>
      </q-field>

      <q-field square outlined label="Square outlined" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">Field content</div>
        </template>
      </q-field>

      <q-field square outlined outlined-bg-color="white" label="Square outlined - Material Design" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">Field content</div>
        </template>
      </q-field>

      <q-field square standout label="Square standout" stack-label>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">Field content</div>
        </template>
      </q-field>
    </div>
  </div>
</template>

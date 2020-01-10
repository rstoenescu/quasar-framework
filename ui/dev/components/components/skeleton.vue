<template>
  <div class="q-layout-padding" style="max-width: 500px">
    <div>
      <q-toggle v-model="bordered" label="Bordered" />
      <q-toggle v-model="dark" label="Dark" :false-value="null" />
    </div>

    <div class="q-gutter-y-lg q-pt-lg">
      <q-skeleton v-bind="props" type="text" class="text-h6" />
      <q-skeleton v-bind="props" class="text-h6" />
      <q-skeleton v-bind="props" animation="pulse" />
      <q-skeleton v-bind="props" animation="pulse-x" />
      <q-skeleton v-bind="props" animation="pulse-y" />
      <q-skeleton v-bind="props" animation="wave" />
      <q-skeleton v-bind="props" square animation="fade" />
      <q-skeleton v-bind="props" square animation="blink" />

      <q-skeleton v-bind="props" square animation="wave" class="bg-teal" />

      <q-skeleton v-bind="props" type="circle" />
      <q-skeleton v-bind="props" type="circle" animation="pulse" />
      <q-skeleton v-bind="props" type="circle" size="150px" animation="wave" />
      <q-skeleton v-bind="props" type="circle" size="100px" animation="fade" />
      <q-skeleton v-bind="props" type="circle" size="100px" animation="blink" />
    </div>

    <h6>Animation Speed</h6>

    <q-skeleton v-bind="props" type="text" class="text-h6" animation-speed="slowest" />
    <q-skeleton v-bind="props" type="text" class="text-h6" animation-speed="slow" />
    <q-skeleton v-bind="props" type="text" class="text-h6" animation-speed="normal" />
    <q-skeleton v-bind="props" type="text" class="text-h6" animation-speed="fast" />
    <q-skeleton v-bind="props" type="text" class="text-h6" animation-speed="fastest" />

    <h6>Predefined types</h6>
    <div class="q-gutter-md">
      <div v-for="type in skeletonTypes" :key="type">
        <q-badge :label="type" />
        <q-skeleton v-bind="props" :type="type" />
      </div>
    </div>

    <h6>Card</h6>
    <q-card>
      <q-item>
        <q-item-section avatar>
          <q-skeleton v-bind="props" type="QAvatar" />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <q-skeleton v-bind="props" type="text" />
          </q-item-label>
          <q-item-label caption>
            <q-skeleton v-bind="props" type="text" />
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-skeleton v-bind="props" height="200px" square />

      <q-card-actions align="right" class="q-gutter-md">
        <q-skeleton v-bind="props" type="QBadge" />
        <q-skeleton v-bind="props" type="QChip" />
        <q-skeleton v-bind="props" type="QBtn" />
        <q-skeleton v-bind="props" type="QBtn" />
      </q-card-actions>
    </q-card>

    <q-card class="q-mt-lg">
      <q-item>
        <q-item-section avatar>
          <q-skeleton v-bind="props" type="QAvatar" animation="pulse" />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <q-skeleton v-bind="props" type="text" animation="pulse-y" />
          </q-item-label>
          <q-item-label caption>
            <q-skeleton v-bind="props" type="text" animation="pulse-y" />
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-skeleton v-bind="props" height="200px" square />

      <q-card-actions align="right" class="q-gutter-md">
        <q-skeleton v-bind="props" type="QBadge" animation="pulse" />
        <q-skeleton v-bind="props" type="QChip" animation="pulse" />
        <q-skeleton v-bind="props" type="QBtn" animation="pulse" />
        <q-skeleton v-bind="props" type="QBtn" animation="pulse" />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { skeletonTypes } from 'src/components/skeleton/QSkeleton.js'

export default {
  data () {
    return {
      bordered: false,
      dark: null,
      skeletonTypes
    }
  },

  computed: {
    props () {
      return {
        bordered: this.bordered,
        dark: this.dark
      }
    }
  }
}
</script>

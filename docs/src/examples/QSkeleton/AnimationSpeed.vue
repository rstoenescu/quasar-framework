<template>
  <div class="q-pa-md">
    <div class="q-gutter-md row items-start">
      <q-card flat bordered v-for="animationSpeed in skeletonAnimationSpeeds" :key="animationSpeed" style="width: 250px">
        <q-card-section>
          <div class="text-caption">"{{ animationSpeed }}"</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-skeleton :animation-speed="animationSpeed" />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      skeletonAnimationSpeeds: [
        'slowest', 'slow', 'normal', 'fast', 'fastest'
      ]
    }
  }
}
</script>

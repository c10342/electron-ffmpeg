<template>
  <video autoplay :src="url" controls class="video"></video>
</template>

<script setup lang="ts">
import { ref } from "vue";

const url = ref("");

window.api.onPreviewFile((options) => {
  // console.log(options);
  const path = "atom:///" + options.output;
  // state.audio = path

  url.value = path;
});
</script>

<style lang="scss" scoped>
.video {
  width: 100%;
  height: 100%;
}
</style>

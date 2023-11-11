<template>
  <div class="page-header" @click="onClick">
    <span class="title">{{ title }}</span>
    <div class="line"></div>
    <span class="more">
      {{ show ? "收起" : "展开" }}
    </span>
  </div>
  <slot v-if="show" />
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps({
  title: {
    type: String,
    default: ""
  }
});

const show = ref(true);

const onClick = () => {
  show.value = !show.value;
};
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  margin-bottom: 20px;
  cursor: pointer;
  &::before {
    position: absolute;
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 3px;
    background-color: var(--el-color-primary);
  }
  .title {
    padding: 0 10px;
    color: var(--el-text-color-regular);
    font-size: 15px;
  }
  .line {
    flex: 1;
    background-color: var(--el-color-primary);
    height: 2px;
  }
  .more {
    font-size: 13px;
    color: var(--el-text-color-regular);
    margin-left: 10px;
  }
}
</style>

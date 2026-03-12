<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()

const title = computed(() => {
  const metaTitle = route.meta?.title
  return typeof metaTitle === "string" && metaTitle ? metaTitle : route.name || "Page"
})

const componentKey = computed(() => {
  const key = route.meta?.componentKey
  return typeof key === "string" ? key : ""
})
</script>

<template>
  <div class="placeholder">
    <h1>{{ title }}</h1>
    <p>页面组件还未创建。</p>
    <p v-if="componentKey">componentKey: {{ componentKey }}</p>
  </div>
</template>

<style scoped>
.placeholder {
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}
</style>

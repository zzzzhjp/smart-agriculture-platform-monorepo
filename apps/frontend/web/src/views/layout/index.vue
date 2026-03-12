<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/store/useUserStore"

const router = useRouter()
const userStore = useUserStore()

const menus = computed(() => userStore.menu)

const onSelect = (path: string) => {
  if (!path) {
    return
  }
  router.push(path)
}

const onLogout = () => {
  localStorage.removeItem("TOKEN")
  userStore.clearUserState()
  router.replace("/login")
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <h2 class="brand">Smart Agri</h2>
      <el-menu class="menu" :default-active="$route.path" @select="onSelect">
        <template v-for="item in menus" :key="item.path">
          <el-sub-menu v-if="item.children?.length" :index="item.path">
            <template #title>{{ item.meta?.title || item.name }}</template>
            <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path">
              {{ child.meta?.title || child.name }}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.path">
            {{ item.meta?.title || item.name }}
          </el-menu-item>
        </template>
      </el-menu>
      <el-button class="logout" type="danger" plain @click="onLogout">退出登录</el-button>
    </aside>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
  background: #f4f6fb;
}

.sidebar {
  padding: 16px;
  border-right: 1px solid #e5e7eb;
  background: #ffffff;
}

.brand {
  margin: 4px 0 16px;
  font-size: 18px;
}

.menu {
  border-right: none;
}

.logout {
  margin-top: 16px;
  width: 100%;
}

.content {
  padding: 24px;
}
</style>

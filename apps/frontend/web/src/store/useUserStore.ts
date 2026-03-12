import { defineStore } from "pinia"
import { getUserRoute } from "@/api/user"
import type { UserRouterChildren } from "@/interface/user.interface"

interface UserState {
  menu: UserRouterChildren[]
  loading: boolean
  loaded: boolean
  error: string | null
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    menu: [],
    loading: false,
    loaded: false,
    error: null,
  }),

  actions: {
    async getRouter(force = false): Promise<UserRouterChildren[]> {
      if (!force && this.loaded && this.menu.length > 0) {
        return this.menu
      }

      this.loading = true
      this.error = null

      try {
        const routes = await getUserRoute()
        this.menu = Array.isArray(routes) ? routes : []
        this.loaded = true
        return this.menu
      } catch (error: any) {
        this.menu = []
        this.loaded = false
        this.error = error?.response?.data?.message || error?.message || "获取路由失败"
        throw error
      } finally {
        this.loading = false
      }
    },

    clearUserState() {
      this.menu = []
      this.loading = false
      this.loaded = false
      this.error = null
    },
  },

  persist: {
    pick: ["menu", "loaded"],
  },
})

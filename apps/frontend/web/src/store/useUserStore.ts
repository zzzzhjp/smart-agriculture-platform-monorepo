import { defineStore } from "pinia"
import { getUserRoute } from "@/api/user"
import type { UserRouterChildren } from "@/interface/user.interface"

interface UserState {
  menu: UserRouterChildren[]
  loading: boolean
  loaded: boolean
  error: string | null
}

const hrRoute: UserRouterChildren = {
  path: "/hr",
  name: "Hr",
  componentKey: "Layout",
  meta: {
    title: "人力资源管理",
  },
  children: [
    {
      path: "/hr/employee",
      name: "HrEmployee",
      componentKey: "views/hr/employee/index",
      meta: {
        title: "员工管理",
      },
    },
  ],
}

function mergeLocalRoutes(routes: UserRouterChildren[]): UserRouterChildren[] {
  const nextRoutes = Array.isArray(routes) ? [...routes] : []
  const hasHrRoute = nextRoutes.some((item) => item.path === hrRoute.path)

  if (!hasHrRoute) {
    nextRoutes.push(hrRoute)
  }

  return nextRoutes
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
        this.menu = mergeLocalRoutes(Array.isArray(routes) ? routes : [])
        this.loaded = true
        return this.menu
      } catch (error: any) {
        this.menu = mergeLocalRoutes([])
        this.loaded = true
        this.error = error?.response?.data?.message || error?.message || "获取路由失败"
        return this.menu
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

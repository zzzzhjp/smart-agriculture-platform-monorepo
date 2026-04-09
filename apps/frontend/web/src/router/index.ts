import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router"
import pinia from '@/store'
import { useUserStore } from '@/store/useUserStore'
import type { UserRouterChildren } from "@/interface/user.interface"

const viewModules = import.meta.glob("/src/views/**/*.vue")

const staticRoutes: RouteRecordRaw[] = [
    {
        path: "/login",
        name: "Login",
        component: () => import("@/views/login/index.vue"),
    },
    {
        path: "/",
        redirect: "/dashboard/home",
    },
    {
        path: "/cesium",
        name: "Cesium",
        component: () => import("@/views/cesiumHome/index.vue")
    },
    {
        path: "/hr",
        name: "HR",
        component: () => import("@/views/hr/employee/index.vue")
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes: staticRoutes,
})

let dynamicRoutesReady = false

function resolveRouteComponent(componentKey: string) {
    if (componentKey === "Layout") {
        return () => import("@/views/layout/index.vue")
    }

    const viewPath = `/src/${componentKey}.vue`
    const loader = viewModules[viewPath]

    if (loader) {
        return loader
    }

    return () => import("@/views/common/placeholder.vue")
}

function toChildPath(parentPath: string, childPath: string): string {
    if (!childPath) {
        return childPath
    }

    if (!childPath.startsWith("/")) {
        return childPath
    }

    const parentPrefix = `${parentPath}/`
    if (childPath.startsWith(parentPrefix)) {
        return childPath.slice(parentPrefix.length)
    }

    return childPath.slice(1)
}

function mapBackendRoute(route: UserRouterChildren, parentPath?: string): RouteRecordRaw {
    const record: RouteRecordRaw = {
        path: parentPath ? toChildPath(parentPath, route.path) : route.path,
        name: route.name,
        component: resolveRouteComponent(route.componentKey),
        meta: {
            ...(route.meta ?? {}),
            componentKey: route.componentKey,
        },
    }

    if (route.children?.length) {
        ; (record as RouteRecordRaw & { children?: RouteRecordRaw[] }).children = route.children.map((child) =>
            mapBackendRoute(child, route.path)
        )
    }

    return record
}

function addDynamicRoutes(routes: UserRouterChildren[]) {
    const mapped = routes.map((item) => mapBackendRoute(item))
    for (const route of mapped) {
        if (typeof route.name === "string" && router.hasRoute(route.name)) {
            continue
        }
        router.addRoute(route)
    }
}

function findFirstRoutePath(routes: UserRouterChildren[]): string {
    for (const route of routes) {
        if (route.children?.length) {
            const childPath = findFirstRoutePath(route.children)
            if (childPath) {
                return childPath
            }
        }

        if (route.path) {
            return route.path
        }
    }

    return "/dashboard/home"
}

export async function ensureDynamicRoutes(force = false): Promise<string> {
    const token = localStorage.getItem("TOKEN")
    if (!token) {
        dynamicRoutesReady = false
        return "/login"
    }

    if (dynamicRoutesReady && !force) {
        const userStore = useUserStore(pinia)
        return findFirstRoutePath(userStore.menu)
    }

    const userStore = useUserStore(pinia)
    const backendRoutes = await userStore.getRouter(force)
    addDynamicRoutes(backendRoutes)
    dynamicRoutesReady = true

    return findFirstRoutePath(backendRoutes)
}

router.beforeEach(async (to) => {
    const token = localStorage.getItem("TOKEN")

    if (!token && to.path !== "/login") {
        return "/login"
    }

    if (token && to.path === "/login") {
        const homePath = await ensureDynamicRoutes()
        return homePath
    }

    if (token) {
        await ensureDynamicRoutes()

        if (to.matched.length === 0) {
            const homePath = await ensureDynamicRoutes()
            return homePath
        }
    }

    return true
})

export default router



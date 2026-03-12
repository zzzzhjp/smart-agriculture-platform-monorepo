export interface UserRouteMeta {
    title?: string
    icon?: string
}

export interface UserRouterChildren {
    path: string
    name: string
    componentKey: string
    meta?: UserRouteMeta
    children?: UserRouterChildren[]
}

import http from "@/utils/require";
import type { UserRouterChildren } from "@/interface/user.interface";

export const getUserRoute = (): Promise<UserRouterChildren[]> => {
    return http.get<UserRouterChildren[]>("/crm/permission/my-routes")
}

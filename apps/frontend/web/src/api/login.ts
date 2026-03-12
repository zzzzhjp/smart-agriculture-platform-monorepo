import http from "@/utils/require";
import type { CRMLoginRequest, UserRuleForm } from "@/interface/login.interface";

export const loginByJson = (data: UserRuleForm): Promise<CRMLoginRequest> => {
    return http.post<CRMLoginRequest>("/crm/login", data)
}

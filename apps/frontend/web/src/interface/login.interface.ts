export interface CRMLoginRequest {
    code: number
    msg: string
    data?: string | null
}

export interface UserRuleForm {
    admin_account: string
    admin_password: string
}

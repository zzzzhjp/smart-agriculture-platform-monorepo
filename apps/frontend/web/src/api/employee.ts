import http from "@/utils/require"

export interface EmployeeRecord {
  id: number
  employee_name: string
  employee_phone: string
  employee_address: string
  join_time: string
  resign_time: string | null
}

export interface EmployeePayload {
  id?: number
  employee_name: string
  employee_phone: string
  employee_address: string
  join_time: string
  resign_time?: string
}

export const getEmployeeList = (): Promise<EmployeeRecord[]> => {
  return http.get<EmployeeRecord[]>("/crm/employee/all")
}

export const addEmployee = (data: EmployeePayload): Promise<EmployeeRecord> => {
  return http.post<EmployeeRecord>("/crm/employee/add", data)
}

export const updateEmployee = (data: EmployeePayload): Promise<EmployeeRecord> => {
  return http.post<EmployeeRecord>("/crm/employee/update", data)
}

export const deleteEmployee = (id: number): Promise<void> => {
  return http.get<void>(`/crm/employee/delete/${id}`)
}

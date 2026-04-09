<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  addEmployee,
  deleteEmployee,
  getEmployeeList,
  updateEmployee,
  type EmployeePayload,
  type EmployeeRecord,
} from "@/api/employee"

interface EmployeeForm {
  id?: number
  employee_name: string
  employee_phone: string
  employee_address: string
  join_time: string
  resign_time: string
}

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const keyword = ref("")
const employees = ref<EmployeeRecord[]>([])

const formRef = ref()
const form = reactive<EmployeeForm>({
  employee_name: "",
  employee_phone: "",
  employee_address: "",
  join_time: "",
  resign_time: "",
})

const rules = {
  employee_name: [{ required: true, message: "请输入员工姓名", trigger: "blur" }],
  employee_phone: [{ required: true, message: "请输入联系电话", trigger: "blur" }],
  employee_address: [{ required: true, message: "请输入联系地址", trigger: "blur" }],
  join_time: [{ required: true, message: "请选择入职日期", trigger: "change" }],
}

const filteredEmployees = computed(() => {
  const search = keyword.value.trim().toLowerCase()

  if (!search) {
    return employees.value
  }

  return employees.value.filter((item) =>
    [item.employee_name, item.employee_phone, item.employee_address]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(search)),
  )
})

const activeEmployees = computed(
  () => employees.value.filter((item) => !item.resign_time).length,
)

const resignedEmployees = computed(
  () => employees.value.filter((item) => Boolean(item.resign_time)).length,
)

const latestJoinDate = computed(() => {
  if (employees.value.length === 0) {
    return "--"
  }

  const latest = [...employees.value]
    .map((item) => item.join_time)
    .filter(Boolean)
    .sort((a, b) => (a < b ? 1 : -1))[0]

  return latest || "--"
})

function normalizeDate(value?: string | null) {
  if (!value) {
    return ""
  }

  return value.slice(0, 10)
}

function resetForm() {
  form.id = undefined
  form.employee_name = ""
  form.employee_phone = ""
  form.employee_address = ""
  form.join_time = ""
  form.resign_time = ""
}

async function loadEmployees() {
  loading.value = true

  try {
    const list = await getEmployeeList()
    employees.value = Array.isArray(list) ? list : []
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || error?.message || "员工数据加载失败")
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

function openEditDialog(row: EmployeeRecord) {
  isEdit.value = true
  form.id = row.id
  form.employee_name = row.employee_name
  form.employee_phone = row.employee_phone
  form.employee_address = row.employee_address
  form.join_time = normalizeDate(row.join_time)
  form.resign_time = normalizeDate(row.resign_time)
  dialogVisible.value = true
}

function buildPayload(): EmployeePayload {
  return {
    ...(form.id ? { id: form.id } : {}),
    employee_name: form.employee_name.trim(),
    employee_phone: form.employee_phone.trim(),
    employee_address: form.employee_address.trim(),
    join_time: form.join_time,
    resign_time: form.resign_time || "",
  }
}

async function submitForm() {
  if (!formRef.value) {
    return
  }

  await formRef.value.validate()
  saving.value = true

  try {
    const payload = buildPayload()

    if (isEdit.value) {
      await updateEmployee(payload)
      ElMessage.success("员工信息已更新")
    } else {
      await addEmployee(payload)
      ElMessage.success("员工已新增")
    }

    dialogVisible.value = false
    resetForm()
    await loadEmployees()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || error?.message || "保存失败")
  } finally {
    saving.value = false
  }
}

async function handleDelete(row: EmployeeRecord) {
  try {
    await ElMessageBox.confirm(`确认删除员工“${row.employee_name}”吗？`, "删除确认", {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消",
    })

    await deleteEmployee(row.id)
    ElMessage.success("员工已删除")
    await loadEmployees()
  } catch (error: any) {
    if (error === "cancel" || error === "close") {
      return
    }

    ElMessage.error(error?.response?.data?.message || error?.message || "删除失败")
  }
}

onMounted(() => {
  loadEmployees()
})
</script>

<template>
  <section class="hr-page">
    <div class="hero">
      <div>
        <p class="eyebrow">Human Resources</p>
        <h1>人力资源管理</h1>
        <p class="hero-text">集中维护员工档案、在离职状态和联系方式，方便农业平台统一管理组织人力信息。</p>
      </div>
      <el-button type="primary" size="large" @click="openCreateDialog">新增员工</el-button>
    </div>

    <div class="metrics">
      <article class="metric-card">
        <span>员工总数</span>
        <strong>{{ employees.length }}</strong>
      </article>
      <article class="metric-card">
        <span>在职人数</span>
        <strong>{{ activeEmployees }}</strong>
      </article>
      <article class="metric-card">
        <span>离职人数</span>
        <strong>{{ resignedEmployees }}</strong>
      </article>
      <article class="metric-card">
        <span>最近入职</span>
        <strong>{{ latestJoinDate }}</strong>
      </article>
    </div>

    <div class="panel">
      <div class="panel-header">
        <div>
          <h2>员工档案</h2>
          <p>支持按姓名、电话或地址快速筛选。</p>
        </div>
        <div class="toolbar">
          <el-input v-model="keyword" clearable placeholder="搜索员工信息" style="width: 240px" />
          <el-button plain @click="loadEmployees">刷新</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="filteredEmployees" stripe>
        <el-table-column prop="employee_name" label="姓名" min-width="120" />
        <el-table-column prop="employee_phone" label="联系电话" min-width="140" />
        <el-table-column prop="employee_address" label="联系地址" min-width="220" />
        <el-table-column prop="join_time" label="入职日期" min-width="120">
          <template #default="{ row }">
            {{ normalizeDate(row.join_time) || "--" }}
          </template>
        </el-table-column>
        <el-table-column prop="resign_time" label="离职日期" min-width="120">
          <template #default="{ row }">
            {{ normalizeDate(row.resign_time) || "在职" }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.resign_time ? 'info' : 'success'">
              {{ row.resign_time ? "已离职" : "在职" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="actions">
              <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑员工' : '新增员工'"
      width="560px"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="姓名" prop="employee_name">
          <el-input v-model="form.employee_name" placeholder="请输入员工姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="employee_phone">
          <el-input v-model="form.employee_phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="地址" prop="employee_address">
          <el-input v-model="form.employee_address" placeholder="请输入联系地址" />
        </el-form-item>
        <el-form-item label="入职日期" prop="join_time">
          <el-date-picker
            v-model="form.join_time"
            type="date"
            placeholder="选择入职日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="离职日期">
          <el-date-picker
            v-model="form.resign_time"
            type="date"
            placeholder="未离职可留空"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<style scoped>
.hr-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-end;
  padding: 28px;
  color: #f7f4ed;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(250, 204, 21, 0.28), transparent 32%),
    linear-gradient(135deg, #244034 0%, #315847 48%, #15231d 100%);
  box-shadow: 0 18px 40px rgba(21, 35, 29, 0.18);
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 248, 235, 0.72);
}

.hero h1 {
  margin: 0;
  color: #fffaf1;
  font-size: 32px;
  font-weight: 600;
}

.hero-text {
  max-width: 720px;
  margin: 12px 0 0;
  color: rgba(255, 248, 235, 0.78);
  line-height: 1.7;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.metric-card,
.panel {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(204, 212, 224, 0.8);
  box-shadow: 0 16px 36px rgba(28, 53, 42, 0.08);
}

.metric-card {
  padding: 20px 22px;
  border-radius: 20px;
}

.metric-card span {
  display: block;
  color: #5e6a67;
  font-size: 13px;
}

.metric-card strong {
  display: block;
  margin-top: 10px;
  color: #183126;
  font-size: 28px;
}

.panel {
  padding: 22px;
  border-radius: 24px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
}

.panel-header h2 {
  margin: 0;
  color: #183126;
}

.panel-header p {
  margin: 8px 0 0;
  color: #64706d;
}

.toolbar,
.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

@media (max-width: 960px) {
  .hero,
  .panel-header {
    flex-direction: column;
    align-items: stretch;
  }

  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .metrics {
    grid-template-columns: 1fr;
  }
}
</style>

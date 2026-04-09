<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { getEmployeeList, type EmployeeRecord } from "@/api/employee"

const router = useRouter()
const loading = ref(false)
const employees = ref<EmployeeRecord[]>([])

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

  return formatDate(latest)
})

const recentEmployees = computed(() =>
  [...employees.value]
    .sort((a, b) => (a.join_time < b.join_time ? 1 : -1))
    .slice(0, 5),
)

function formatDate(value?: string | null) {
  if (!value) {
    return "--"
  }

  return value.slice(0, 10)
}

async function loadEmployees() {
  loading.value = true

  try {
    const list = await getEmployeeList()
    employees.value = Array.isArray(list) ? list : []
  } catch {
    employees.value = []
  } finally {
    loading.value = false
  }
}

function openHrPage() {
  router.push("/hr/employee")
}

onMounted(() => {
  loadEmployees()
})
</script>

<template>
  <section class="dashboard-page">
    <div class="hero-card">
      <div>
        <p class="eyebrow">Smart Agriculture Workspace</p>
        <h1>工作台首页</h1>
        <p class="hero-text">
          在首页集中查看组织人力概况，快速进入员工管理，减少在多个菜单之间来回切换。
        </p>
      </div>
      <el-button type="primary" size="large" @click="openHrPage">进入人力资源管理</el-button>
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

    <div class="content-grid">
      <article class="panel">
        <div class="panel-header">
          <div>
            <p class="panel-kicker">HR Overview</p>
            <h2>人力资源管理</h2>
          </div>
          <el-button text @click="openHrPage">查看详情</el-button>
        </div>
        <p class="panel-text">
          首页已接入人力资源管理模块，可以直接查看员工规模、在离职状态和最近入职动态，并一键跳转到完整员工管理页面。
        </p>
        <div class="feature-list">
          <div class="feature-item">
            <strong>员工档案</strong>
            <span>统一维护姓名、电话、地址、入离职时间。</span>
          </div>
          <div class="feature-item">
            <strong>状态洞察</strong>
            <span>快速判断当前在职与离职人数，辅助组织调度。</span>
          </div>
          <div class="feature-item">
            <strong>快捷入口</strong>
            <span>从工作台首页直接进入员工管理，不需要额外找菜单。</span>
          </div>
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <p class="panel-kicker">Recent Joins</p>
            <h2>最近入职员工</h2>
          </div>
          <el-button plain @click="loadEmployees">刷新</el-button>
        </div>

        <el-table v-loading="loading" :data="recentEmployees" size="small" stripe>
          <el-table-column prop="employee_name" label="姓名" min-width="110" />
          <el-table-column prop="employee_phone" label="电话" min-width="130" />
          <el-table-column label="入职日期" min-width="110">
            <template #default="{ row }">
              {{ formatDate(row.join_time) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.resign_time ? 'info' : 'success'" size="small">
                {{ row.resign_time ? "已离职" : "在职" }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </article>
    </div>
  </section>
</template>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-card {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 28px;
  border-radius: 24px;
  color: #f9f5ed;
  background:
    radial-gradient(circle at top right, rgba(245, 158, 11, 0.28), transparent 30%),
    linear-gradient(135deg, #2d4f41 0%, #365f4d 52%, #15231d 100%);
  box-shadow: 0 18px 40px rgba(21, 35, 29, 0.18);
}

.eyebrow,
.panel-kicker {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.eyebrow {
  color: rgba(255, 248, 235, 0.72);
}

.hero-card h1,
.panel h2 {
  margin: 0;
}

.hero-card h1 {
  color: #fffaf1;
  font-size: 32px;
  font-weight: 600;
}

.hero-text {
  max-width: 720px;
  margin: 12px 0 0;
  line-height: 1.7;
  color: rgba(255, 248, 235, 0.8);
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.metric-card,
.panel {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(209, 215, 223, 0.9);
  box-shadow: 0 16px 36px rgba(28, 53, 42, 0.08);
}

.metric-card {
  padding: 20px 22px;
  border-radius: 20px;
}

.metric-card span {
  display: block;
  color: #63706d;
  font-size: 13px;
}

.metric-card strong {
  display: block;
  margin-top: 10px;
  color: #183126;
  font-size: 28px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 20px;
}

.panel {
  padding: 22px;
  border-radius: 24px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.panel-kicker {
  color: #87938f;
}

.panel h2 {
  color: #183126;
}

.panel-text {
  margin: 0 0 18px;
  color: #64706d;
  line-height: 1.8;
}

.feature-list {
  display: grid;
  gap: 14px;
}

.feature-item {
  padding: 16px 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f6fbf8 0%, #eef5ef 100%);
  border: 1px solid #dbe7de;
}

.feature-item strong {
  display: block;
  margin-bottom: 6px;
  color: #204033;
}

.feature-item span {
  color: #667370;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .hero-card,
  .panel-header {
    flex-direction: column;
    align-items: stretch;
  }

  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .metrics {
    grid-template-columns: 1fr;
  }
}
</style>

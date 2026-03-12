<script setup lang="ts">
import { reactive, ref } from "vue"
import { ElMessage, type FormInstance, type FormRules } from "element-plus"
import { loginByJson } from "@/api/login"
import type { CRMLoginRequest } from "@/interface/login.interface"
import { useUserStore } from "@/store/useUserStore"
import router, { ensureDynamicRoutes } from "@/router"

const formRef = ref<FormInstance>()
const form = reactive({
  username: "",
  password: ""
})
const isLoading = ref<boolean>(false)
const userStore = useUserStore()

const rules: FormRules<typeof form> = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }]
}

const onSignIn = async (formEl: FormInstance | undefined) => {
  if (!formEl) {
    return
  }

  const valid = await formEl.validate().catch(() => false)
  if (!valid) {
    return
  }

  isLoading.value = true

  try {
    const res = await loginByJson({
      admin_account: form.username,
      admin_password: form.password
    })

    await handleLoginResult(res)
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || "登录失败"
    ElMessage.error(message)
  } finally {
    isLoading.value = false
  }
}

const handleLoginResult = async (res: CRMLoginRequest) => {
  if (res.code !== 200 || !res.data) {
    ElMessage.error(res.msg || "登录失败")
    return
  }

  localStorage.setItem("TOKEN", res.data)
  await userStore.getRouter(true)
  const firstPath = await ensureDynamicRoutes(true)
  await router.replace(firstPath)
}
</script>

<template>
  <div class="auth-wrap">
    <el-card class="auth-card" shadow="never">
      <div class="auth-grid">
        <section class="panel panel-left">
          <div class="decor decor-top" />
          <div class="decor decor-bottom" />

          <h2 class="title">3D Agriculture platform</h2>
          <p class="desc">
            Keep connected with us and sign in<br />
            with your personal information.
          </p>
        </section>

        <section class="panel panel-right">
          <h2 class="title">Admin Login</h2>
          <div class="sub">Use your account to continue</div>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-position="top"
            class="form"
            status-icon
          >
            <el-form-item prop="username" class="input">
              <el-input v-model="form.username" placeholder="your account"size="large" clearable />
            </el-form-item>

            <el-form-item prop="password" class="input">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="password"
                size="large"
                show-password
              />
            </el-form-item>

            <el-button class="pill primary" type="primary" size="large" round @click="onSignIn(formRef)">
              login
            </el-button>
  
          </el-form>
        </section>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
:global(:root) {
  --page-bg: #eef2f6;
  --card-bg: #f7f9fc;
  --panel-bg: #f4f7fb;
  --accent: #4a6cf7;
  --text: #1f2937;
  --muted: #94a3b8;
}

$shadow: 0 16px 40px rgba(15, 23, 42, 0.1);
$radius: 18px;

.auth-wrap {
  height: 100%;
  display: grid;
  place-items: center;
  padding: 32px;
}

.auth-card {
  width: min(980px, 92vw);
  border-radius: $radius;
  overflow: hidden;
  background: var(--card-bg);
  box-shadow: $shadow;

  :deep(.el-card__body) {
    overflow: hidden;
    padding: 0;
  }
}

.auth-grid {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  min-height: 460px;
}

.panel {
  position: relative;
  padding: 64px 56px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 18px;

  &.panel-left {
    background: var(--panel-bg);
  }

  &.panel-right {
    background: #f6f8fc;
  }
}

.title {
  margin: 0;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: var(--text);
}

.desc {
  margin: 0;
  text-align: center;
  color: var(--muted);
  line-height: 1.6;
  font-size: 14px;
}

.sub {
  margin-top: -6px;
  color: var(--muted);
  font-size: 12px;
}

.form {
  width: min(360px, 100%);
  display: grid;
  gap: 6px;
  margin-top: 8px;

  .divider {
    margin: 4px 0 8px;
  }
}

.input {
  :deep(.el-input__wrapper) {
    border-radius: 10px;
    background: #eef3fb;
    border: 1px solid rgba(148, 163, 184, 0.35);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }
}

.pill {
  border-radius: 999px !important;
  padding: 12px 34px;
  font-weight: 700;
  letter-spacing: 1px;
}

.primary {
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 10px 22px rgba(74, 108, 247, 0.25);
}

.decor {
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0) 70%);
  opacity: 0.85;
  pointer-events: none;

  &.decor-top {
    top: -110px;
    right: -110px;
  }

  &.decor-bottom {
    bottom: -120px;
    left: -120px;
  }
}

@media (max-width: 860px) {
  .auth-grid {
    grid-template-columns: 1fr;
  }

  .panel {
    padding: 44px 26px;
  }
}
</style>



import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
const app = createApp(App)

//router
import router from '@router/index'

//scss
import '@assets/main.scss'

//pinia
import pinia from '@store/index'

//element-plus
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

//cesium
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { CESIUM_BASE_URL, CESIUM_ACCESS_TOKEN } from './config/CesiumBase'

declare global {
  interface Window {
    CESIUM_BASE_URL: string
  }
}

window.CESIUM_BASE_URL = CESIUM_BASE_URL
Cesium.Ion.defaultAccessToken = CESIUM_ACCESS_TOKEN

app.use(ElementPlus)
app.use(pinia)
app.use(router)
app.mount('#app')


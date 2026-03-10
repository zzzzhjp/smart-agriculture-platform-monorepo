import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'

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

const app = createApp(App)
app.use(PrimeVue)
app.mount('#app')

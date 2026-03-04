import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { PrimeVue } from 'primevue'

const app = createApp(App)
app.use(PrimeVue)
app.mount('#app')

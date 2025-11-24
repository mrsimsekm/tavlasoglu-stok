import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/userStore' // Store'u import ettik

const app = createApp(App)
const pinia = createPinia()

app.use(pinia) // Önce Pinia'yı yükle

// Store'u kullanıma al
const userStore = useUserStore()

// Uygulamayı başlatmadan önce kullanıcı oturumunu kontrol et
// Bu işlem, F5 atıldığında Login sayfasına atma sorununu çözer
userStore.fetchUser().then(() => {
  app.use(router) // Router'ı kullanıcı bilgisi geldikten sonra yükle
  app.mount('#app')
})
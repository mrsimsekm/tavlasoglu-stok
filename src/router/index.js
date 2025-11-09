// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore.js'
import AppLayout from '../layouts/AppLayout.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import MusterilerView from '../views/MusterilerView.vue'
import StokView from '../views/StokView.vue'
import AnlasmalarView from '../views/AnlasmalarView.vue'
import IsEmirleriView from '../views/IsEmirleriView.vue'
import IsEmriFormView from '../views/IsEmriFormView.vue'
import IsEmriDetayView from '../views/IsEmriDetayView.vue'
import StokGirisView from '../views/StokGirisView.vue'
import SatisciIsEmirleriView from '../views/SatisciIsEmirleriView.vue'
import YonetimPaneliView from '../views/YonetimPaneliView.vue'
// Depolar rotası için view'i import etmeyi unutmayın
import DepoStoklariView from '../views/DepoStoklariView.vue' 

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    {
      path: '/app',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: 'dashboard', name: 'dashboard', component: DashboardView },
        { path: 'musteriler', name: 'musteriler', component: MusterilerView },
        { path: 'stok', name: 'stok-kartlari', component: StokView },
        { path: 'stok/giris', name: 'stok-giris', component: StokGirisView },
        // EKSİK OLAN ROTA EKLENDİ
        { path: 'stok/depolar', name: 'depo-stoklari', component: DepoStoklariView },
        { path: 'anlasmalar', name: 'anlasmalar', component: AnlasmalarView },
        { path: 'is-emirleri', name: 'is-emirleri-liste', component: IsEmirleriView },
        { path: 'is-emirleri/yeni', name: 'is-emri-yeni', component: IsEmriFormView },
        { path: 'is-emirleri/:id', name: 'is-emri-detay', component: IsEmriDetayView },
        { path: 'is-emirleri-satisci', name: 'satisci-is-emirleri', component: SatisciIsEmirleriView },
        { 
          path: 'yonetim', 
          name: 'yonetim-paneli', 
          component: YonetimPaneliView,
          meta: { requiresYonetici: true }
        },
      ]
    },
    { path: '/', redirect: '/app/dashboard' }
  ]
})

router.beforeEach((to, from, next) => {
  // Store'a her zaman guard'ın içinde erişin
  const userStore = useUserStore()
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresYonetici = to.matched.some(record => record.meta.requiresYonetici);
  
  // Oturum gerektiren bir sayfa ve kullanıcı giriş yapmamış
  if (requiresAuth && !userStore.user) { 
    next('/login') 
  } 
  // Zaten giriş yapmışken login sayfasına gitmeye çalışırsa
  else if (to.path === '/login' && userStore.user) { 
    next('/app/dashboard') 
  } 
  // Yönetici yetkisi gerektiren sayfa ama kullanıcı yönetici değil
  else if (requiresYonetici && !userStore.isYonetici) {
    alert('Bu sayfaya erişim yetkiniz bulunmamaktadır.');
    next(from.path || '/app/dashboard') // Geldiği sayfaya veya dashboard'a geri yolla
  } 
  // Diğer tüm durumlar
  else { 
    next() 
  }
})

export default router
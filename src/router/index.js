import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore.js'
import AppLayout from '../layouts/AppLayout.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import MusterilerView from '../views/MusterilerView.vue'
import StokView from '../views/StokView.vue'
import AnlasmalarView from '../views/AnlasmalarView.vue'
import IsEmirleriView from '../views/IsEmirleriView.vue'
import SatisciIsEmirleriView from '../views/SatisciIsEmirleriView.vue' 
import IsEmriFormView from '../views/IsEmriFormView.vue'
import IsEmriDetayView from '../views/IsEmriDetayView.vue'
import StokGirisView from '../views/StokGirisView.vue'
import YonetimPaneliView from '../views/YonetimPaneliView.vue'
import DepoStoklariView from '../views/DepoStoklariView.vue'
import YetkisizView from '../views/YetkisizView.vue'
import AlacaklarView from '../views/AlacaklarView.vue' 
import SatisciPerformansView from '../views/SatisciPerformansView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    { path: '/yetkisiz', name: 'yetkisiz', component: YetkisizView },
    {
      path: '/app',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { 
          path: 'dashboard', 
          name: 'dashboard', 
          component: DashboardView 
        },
        { 
          path: 'musteriler', 
          name: 'musteriler', 
          component: MusterilerView 
        },
        { 
          path: 'stok', 
          name: 'stok-kartlari', 
          component: StokView 
        },
        { 
          path: 'stok/giris', 
          name: 'stok-giris', 
          component: StokGirisView 
        },
        { 
          path: 'anlasmalar', 
          name: 'anlasmalar', 
          component: AnlasmalarView 
        },
        { 
          path: 'is-emirleri', 
          name: 'is-emirleri-liste', 
          component: IsEmirleriView 
        },
        { 
          path: 'is-emirleri-satisci', 
          name: 'is-emirleri-satiscilara-gore', 
          component: SatisciIsEmirleriView,
          meta: {
            roles: ['satisci', 'yonetici', 'muhasebeci'] 
          }
        },
        { 
          path: 'is-emirleri/yeni', 
          name: 'is-emri-yeni', 
          component: IsEmriFormView 
        },
        { 
          path: 'is-emirleri/:id', 
          name: 'is-emri-detay', 
          component: IsEmriDetayView 
        },
        {
          path: 'alacaklar',
          name: 'alacaklar',
          component: AlacaklarView,
          meta: {
            roles: ['yonetici', 'muhasebeci']
          }
        },
        { 
          path: 'yonetim', 
          name: 'yonetim-paneli', 
          component: YonetimPaneliView,
          meta: { 
            roles: ['yonetici'] 
          }
        },
        {
          path: 'stok/depolar', 
          name: 'depo-stoklari', 
          component: DepoStoklariView 
        },
        {
          path: 'satisci-performans',
          name: 'satisci-performans',
          component: SatisciPerformansView,
          meta: {
            roles: ['yonetici']
          }
        },
        // --- PROFORMA ROTALARI (GÜNCELLENDİ: /app/ önekleri kaldırıldı) ---
        {
          path: 'proformalar',
          name: 'proformalar',
          component: () => import('../views/ProformalarView.vue')
        },
        {
          path: 'proformalar/yeni',
          name: 'yeni-proforma',
          component: () => import('../views/ProformaFormView.vue')
        },
        {
          path: 'proformalar/:id',
          name: 'proforma-detay',
          component: () => import('../views/ProformaDetayView.vue')
        },
        {
          path: '/app/emanetler',
          name: 'emanetler',
          component: () => import('../views/EmanetlerView.vue')
        },
        {
          path: '/app/stok/cikis-log',
          name: 'stok-cikis-log',
          component: () => import('../views/StokCikisLogView.vue')
        },
        {
          path: '/app/stok/rezerve',
          name: 'stok-rezerve',
          component: () => import('../views/RezerveStokView.vue')
        },
      ]
    },
    { path: '/', redirect: '/app/is-emirleri' }
  ]
})

// YETKİ KONTROLÜ
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  if (userStore.profile === null && !userStore.loading) {
    await userStore.fetchUser()
  }

  const isAuthenticated = !!userStore.user
  const userRole = userStore.profile?.rol

  if (isAuthenticated && userStore.isYetkisiz) {
    if (to.path !== '/yetkisiz') {
      return next({ name: 'yetkisiz', replace: true })
    } else {
      return next()
    }
  }

  if (to.path === '/yetkisiz' && userStore.isYetkili) {
    return next({ name: 'dashboard', replace: true })
  }

  if (to.name === 'login' && isAuthenticated) {
    if (userStore.isYetkisiz) {
      return next({ name: 'yetkisiz', replace: true })
    }
    return next({ name: 'dashboard', replace: true })
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (requiresAuth && !isAuthenticated) {
    return next({ name: 'login' })
  }

  const requiredRoles = to.meta.roles
  if (requiredRoles && Array.isArray(requiredRoles) && requiredRoles.length > 0) {
    if (!requiredRoles.includes(userRole)) {
      return next({ name: 'dashboard', replace: true })
    }
  }
  
  next()
})

export default router
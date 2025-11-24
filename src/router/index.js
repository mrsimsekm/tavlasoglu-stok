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
        // 2. ROTA EKLENDİ
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
            roles: ['yonetici'] // Sadece yetkililer görsün
          }
        },
      ]
    },
    { path: '/', redirect: '/app/is-emirleri' }
  ]
})

// YETKİ KONTROLÜ - Yetkisiz kullanıcılar için tam engelleme
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // Profil bilgisi henüz yüklenmediyse fetchUser'ı çalıştır
  if (userStore.profile === null && !userStore.loading) {
    await userStore.fetchUser()
  }

  const isAuthenticated = !!userStore.user
  const userRole = userStore.profile?.rol

  console.log('Router kontrol:', {
    gidilenSayfa: to.path,
    authenticated: isAuthenticated,
    rol: userRole,
    isYetkisiz: userStore.isYetkisiz
  })

  // 1. YETKİSİZ KULLANICI KONTROLÜ (EN ÖNCELİKLİ)
  // Yetkisiz kullanıcı SADECE /yetkisiz sayfasını görebilir
  if (isAuthenticated && userStore.isYetkisiz) {
    if (to.path !== '/yetkisiz') {
      console.warn('❌ Yetkisiz kullanıcı engellendi:', to.path)
      return next({ name: 'yetkisiz', replace: true })
    } else {
      // Yetkisiz sayfasındaysa izin ver
      return next()
    }
  }

  // 2. Yetkisiz sayfasına yetkili kullanıcı erişmeye çalışıyorsa
  if (to.path === '/yetkisiz' && userStore.isYetkili) {
    console.log('✅ Yetkili kullanıcı dashboard\'a yönlendiriliyor')
    return next({ name: 'dashboard', replace: true })
  }

  // 3. Giriş yapmış kullanıcı login sayfasına gitmeye çalışırsa
  if (to.name === 'login' && isAuthenticated) {
    if (userStore.isYetkisiz) {
      return next({ name: 'yetkisiz', replace: true })
    }
    return next({ name: 'dashboard', replace: true })
  }
  
  // 4. Gidilmek istenen sayfa yetki gerektiriyor mu?
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (requiresAuth && !isAuthenticated) {
    console.log('❌ Giriş yapılmamış, login\'e yönlendiriliyor')
    return next({ name: 'login' })
  }

  // 5. Gidilmek istenen sayfa özel roller gerektiriyor mu?
  const requiredRoles = to.meta.roles
  if (requiredRoles && Array.isArray(requiredRoles) && requiredRoles.length > 0) {
    if (!requiredRoles.includes(userRole)) {
      console.warn(`❌ Yetkisiz erişim: Kullanıcı rolü '${userRole}', gereken roller '${requiredRoles.join(', ')}'`)
      return next({ name: 'dashboard', replace: true })
    }
  }
  
  // Tüm kontrollerden geçti
  console.log('✅ Erişim izni verildi:', to.path)
  next()
})

export default router
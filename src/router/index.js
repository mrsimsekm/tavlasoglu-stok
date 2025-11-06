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
import DepoStoklariView from '../views/DepoStoklariView.vue'
import AlacaklarView from '../views/AlacaklarView.vue'

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
        { path: 'stok/depolar', name: 'depo-stoklari', component: DepoStoklariView },
        { path: 'alacaklar', name: 'alacaklar', component: AlacaklarView },
        { path: 'anlasmalar', name: 'anlasmalar', component: AnlasmalarView },
        { path: 'is-emirleri', name: 'is-emirleri-liste', component: IsEmirleriView },
        { path: 'is-emirleri/yeni', name: 'is-emri-yeni', component: IsEmriFormView },
        { path: 'is-emirleri/:id', name: 'is-emri-detay', component: IsEmriDetayView },
      ]
    },
    { path: '/', redirect: '/app/dashboard' }
  ]
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  if (userStore.user === null) { await userStore.fetchUser() }
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth && !userStore.user) { next('/login') }
  else if (to.path === '/login' && userStore.user) { next('/app/dashboard') }
  else { next() }
})

export default router
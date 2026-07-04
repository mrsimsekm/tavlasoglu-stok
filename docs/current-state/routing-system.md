# Routing System

## Overview
The application uses Vue Router 4 for client-side routing with comprehensive route protection based on authentication status and user roles.

## Router Configuration

### Route Structure
The application has a hierarchical route structure with three main sections:

1. **Public Routes**: Accessible without authentication
2. **Authenticated Routes**: Protected routes requiring login
3. **Role-Restricted Routes**: Routes with specific role requirements

### Route Definitions

#### Public Routes
```javascript
[
  { path: '/login', name: 'login', component: LoginView },
  { path: '/yetkisiz', name: 'yetkisiz', component: YetkisizView },
  { path: '/', redirect: '/app/is-emirleri' }
]
```

#### Authenticated Routes (under `/app`)
All authenticated routes are children of the `/app` path using `AppLayout` as the parent component:

```javascript
{
  path: '/app',
  component: AppLayout,
  meta: { requiresAuth: true },
  children: [
    // Dashboard
    { path: 'dashboard', name: 'dashboard', component: DashboardView },
    
    // Stock Management
    { path: 'stok', name: 'stok-kartlari', component: StokView },
    { path: 'stok/giris', name: 'stok-giris', component: StokGirisView },
    { path: 'stok/depolar', name: 'depo-stoklari', component: DepoStoklariView },
    { path: 'stok/cikis-log', name: 'stok-cikis-log', component: () => import('../views/StokCikisLogView.vue') },
    { path: 'stok/rezerve', name: 'stok-rezerve', component: () => import('../views/RezerveStokView.vue') },
    
    // Work Orders
    { path: 'is-emirleri', name: 'is-emirleri-liste', component: IsEmirleriView },
    { path: 'is-emirleri/yeni', name: 'is-emri-yeni', component: IsEmriFormView },
    { path: 'is-emirleri/:id', name: 'is-emri-detay', component: IsEmriDetayView },
    { path: 'is-emirleri-satisci', name: 'is-emirleri-satiscilara-gore', component: SatisciIsEmirleriView, meta: { roles: ['satisci', 'yonetici', 'muhasebeci'] } },
    
    // Customers and Agreements
    { path: 'musteriler', name: 'musteriler', component: MusterilerView },
    { path: 'anlasmalar', name: 'anlasmalar', component: AnlasmalarView },
    
    // Financial
    { path: 'alacaklar', name: 'alacaklar', component: AlacaklarView, meta: { roles: ['yonetici', 'muhasebeci'] } },
    
    // Administration
    { path: 'yonetim', name: 'yonetim-paneli', component: YonetimPaneliView, meta: { roles: ['yonetici'] } },
    { path: 'satisci-performans', name: 'satisci-performans', component: SatisciPerformansView, meta: { roles: ['yonetici'] } },
    
    // Proformas
    { path: 'proformalar', name: 'proformalar', component: () => import('../views/ProformalarView.vue') },
    { path: 'proformalar/yeni', name: 'yeni-proforma', component: () => import('../views/ProformaFormView.vue') },
    { path: 'proformalar/:id', name: 'proforma-detay', component: () => import('../views/ProformaDetayView.vue') },
    { path: 'proformalar/ayarlar', name: 'ProformaAyarlari', component: () => import('../views/ProformaAyarlariView.vue'), meta: { requiresAuth: true } },
    
    // Deposits
    { path: 'emanetler', name: 'emanetler', component: () => import('../views/EmanetlerView.vue') }
  ]
}
```

## Route Protection

### Authentication Guards
The router implements comprehensive guards in the `beforeEach` hook:

1. **Session Restoration**: Ensures user profile is loaded before route evaluation
2. **Authentication Check**: Verifies user is logged in for protected routes
3. **Authorization Check**: Validates user roles for role-restricted routes
4. **Unauthorized User Handling**: Manages 'yetkisiz' users appropriately

#### Guard Logic
```javascript
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // Restore session if needed
  if (userStore.profile === null && !userStore.loading) {
    await userStore.fetchUser()
  }
  
  const isAuthenticated = !!userStore.user
  const userRole = userStore.profile?.rol
  
  // Handle unauthorized users
  if (isAuthenticated && userStore.isYetkisiz) {
    if (to.path !== '/yetkisiz') {
      return next({ name: 'yetkisiz', replace: true })
    } else {
      return next()
    }
  }
  
  // Redirect authorized users away from unauthorized page
  if (to.path === '/yetkisiz' && userStore.isYetkili) {
    return next({ name: 'dashboard', replace: true })
  }
  
  // Redirect authenticated users away from login
  if (to.name === 'login' && isAuthenticated) {
    if (userStore.isYetkisiz) {
      return next({ name: 'yetkisiz', replace: true })
    }
    return next({ name: 'dashboard', replace: true })
  }
  
  // Enforce authentication for protected routes
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (requiresAuth && !isAuthenticated) {
    return next({ name: 'login' })
  }
  
  // Enforce role-based access control
  const requiredRoles = to.meta.roles
  if (requiredRoles && Array.isArray(requiredRoles) && requiredRoles.length > 0) {
    if (!requiredRoles.includes(userRole)) {
      return next({ name: 'dashboard', replace: true })
    }
  }
  
  next()
})
```

## Route Metadata

### Authentication Requirements
Routes can specify authentication requirements through `meta` properties:

- `requiresAuth: true`: Route requires authentication
- `roles: ['role1', 'role2']`: Route requires specific user roles

### Lazy Loading
Some routes use lazy loading for better performance:

```javascript
{
  path: 'proformalar',
  name: 'proformalar',
  component: () => import('../views/ProformalarView.vue')
}
```

## Route Parameters

### Dynamic Routes
Several routes use dynamic parameters:

- `is-emirleri/:id`: Work order detail view with ID parameter
- `proformalar/:id`: Proforma detail view with ID parameter

## Navigation Patterns

### Programmatic Navigation
Components navigate programmatically using router methods:

```javascript
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    
    const navigateToOrder = (orderId) => {
      router.push({ name: 'is-emri-detay', params: { id: orderId } })
    }
    
    return { navigateToOrder }
  }
}
```

### Named Routes
The application predominantly uses named routes for better maintainability:

```javascript
router.push({ name: 'is-emri-detay', params: { id: orderId } })
```

## Recent Improvements

### Enhanced Route Protection
Improved authentication and authorization handling:
- More robust session restoration
- Better handling of edge cases
- Clearer user feedback for access denials

### Route Organization
Better organization of route structure:
- Logical grouping of related features
- Consistent naming conventions
- Clear separation of concerns

## Future Considerations

### Route Enhancements
Potential improvements to the routing system:
- Nested route optimization
- Advanced route transition animations
- Progressive route loading
- Route-based code splitting optimization

### Navigation Improvements
Areas for navigation enhancement:
- Breadcrumb navigation support
- Navigation history management
- Advanced routing guards
- Route analytics integration
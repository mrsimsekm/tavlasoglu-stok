# Frontend Architecture

## Component Structure

### Views (Pages)
The application follows a view-based architecture where each route corresponds to a view component:

- **DashboardView.vue**: Main dashboard showing company information
- **LoginView.vue**: Authentication page
- **StokView.vue**: Product card management with CRUD operations
- **StokGirisView.vue**: Stock entry management
- **IsEmirleriView.vue**: Work order list
- **IsEmriFormView.vue**: Work order creation form
- **IsEmriDetayView.vue**: Work order detail and editing
- **MusterilerView.vue**: Customer management
- **AnlasmalarView.vue**: Agreement management
- **YonetimPaneliView.vue**: Administration panel (admin only)
- **DepoStoklariView.vue**: Warehouse stock overview
- **YetkisizView.vue**: Unauthorized access page
- **AlacaklarView.vue**: Receivables tracking
- **SatisciIsEmirleriView.vue**: Salesperson work order view
- **SatisciPerformansView.vue**: Sales performance reports
- **ProformalarView.vue**: Proforma invoice list
- **ProformaFormView.vue**: Proforma invoice creation
- **ProformaDetayView.vue**: Proforma invoice detail
- **ProformaAyarlariView.vue**: Proforma settings
- **EmanetlerView.vue**: Deposit management
- **StokCikisLogView.vue**: Stock exit logs
- **RezerveStokView.vue**: Reserved stock tracking

### Components (Reusable UI Elements)
- **BaseModal.vue**: Generic modal component
- **IsEmriKalemEkle.vue**: Work order item addition component
- **IsEmriKapanisModal.vue**: Work order closing modal
- **MusteriAramaInput.vue**: Customer search input
- **NumaraDuzenleModal.vue**: Number editing modal

### Layouts
- **AppLayout.vue**: Main application layout with navigation

### Stores (Pinia)
- **userStore.js**: User authentication and profile management
- **counter.js**: Example store (likely for demonstration)

### Composables
- **useLoading.js**: Loading state management with prevention of duplicate submissions
- **useYetki.js**: Authorization helper functions

### Utilities
- **adminApi.js**: Administrative API functions

## Routing System

The application uses Vue Router with role-based access control:

### Route Protection
Routes are protected based on authentication status and user roles:
- Unauthenticated users can only access `/login`
- Authenticated users with 'yetkisiz' role are redirected to `/yetkisiz`
- Routes with `meta.roles` array restrict access to specific roles
- Default redirect to `/app/is-emirleri` for authenticated users

### Route Structure
```
/app (authenticated area)
  ├── dashboard
  ├── musteriler
  ├── stok
  │   ├── (stok-kartlari - product cards)
  │   └── giris (stock entry)
  ├── stok/depolar
  ├── stok/cikis-log
  ├── stok/rezerve
  ├── anlasmalar
  ├── is-emirleri
  │   ├── (list)
  │   ├── yeni (new)
  │   └── :id (detail/:id)
  ├── is-emirleri-satisci
  ├── alacaklar
  ├── yonetim
  ├── satisci-performans
  ├── proformalar
  │   ├── (list)
  │   ├── yeni (new)
  │   ├── :id (detail/:id)
  │   └── ayarlar (settings)
  └── emanetler
/login (unauthenticated)
/yetkisiz (unauthorized)
```

## State Management

### User Store (`userStore.js`)
Manages authentication state, user profile information, and role-based permissions:
- `user`: Current authenticated user object
- `profile`: User profile with role information
- `isYonetici`, `isSatisci`, `isMuhasebeci`, `isYetkisiz`: Role checking computed properties
- `fetchUser()`: Loads user and profile data from Supabase
- `logout()`: Signs out the user
- `refreshProfile()`: Refreshes user profile information

## Authentication Flow

1. Application initializes and loads user store
2. `main.js` calls `userStore.fetchUser()` to restore session
3. Router guards check authentication status before each route navigation
4. Unauthenticated users are redirected to login
5. 'Yetkisiz' users are redirected to unauthorized page
6. Role-based route access is enforced through route metadata

## Data Handling Patterns

### Loading States
Most views implement comprehensive loading state management:
- Initial data loading indicators
- Search/loading states with spinners
- Error handling with user-friendly messages
- Empty state displays

### CRUD Operations
Standard patterns for Create, Read, Update, Delete operations:
- Modal-based forms for data entry
- Table displays with sorting and pagination
- Column visibility management with localStorage persistence
- Search functionality with debouncing
- Confirmation dialogs for destructive operations

### Error Handling
- Try-catch blocks around Supabase operations
- User-friendly error messages
- Console logging for debugging
- Specific error handling for constraint violations (unique keys, foreign keys)

## Styling and UI Components

### Tailwind CSS
The application uses Tailwind CSS for styling with a consistent design system:
- Responsive grid layouts
- Consistent color palette (indigo primary, gray secondary)
- Card-based UI components with shadows and borders
- Interactive elements with hover states
- Mobile-responsive design

### Common UI Patterns
- Button styles with icons
- Form inputs with consistent styling
- Data tables with sorting capabilities
- Modal dialogs with header/body/footer sections
- Navigation menus with active state indication
- Loading spinners and progress indicators
- Alert and notification patterns

## Recent Improvements

### Atomic Transaction Patterns
Recent updates implemented atomic database operations to ensure data consistency:
- **StokGirisView**: Uses `stok_giris_grubu_guncelle` RPC for atomic stock entry editing
- **IsEmriDetayView**: Uses `is_emri_kalemleri_guncelle_atomic` RPC for atomic work order item management

These changes resolved critical data consistency issues:
1. Stock entry editing failures when changing warehouses
2. Work order resource change failures when converting to deposit sources

### Improved Error Handling
Enhanced error messages and handling for better user experience:
- Specific error messages for constraint violations
- Better handling of duplicate entry attempts
- More informative feedback for failed operations
# Authentication and Authorization System

## Overview
The application uses Supabase Authentication for user management with a custom role-based access control (RBAC) system implemented through the `profiller` table.

## Authentication Flow

### Initialization
1. Application starts in `main.js`
2. User store is initialized with `useUserStore()`
3. `userStore.fetchUser()` is called to restore session
4. User data and profile are loaded from Supabase

### Session Management
- **Auto-session restoration**: Sessions are automatically restored on page reload
- **Profile loading**: User profile (including role) is fetched from `profiller` table
- **Automatic logout**: Users with 'yetkisiz' role are automatically logged out

### Login Process
1. User submits credentials via LoginView
2. Supabase authentication is performed
3. User profile is fetched from `profiller` table
4. Successful login redirects to dashboard

## Authorization System

### User Roles
The system implements four distinct user roles:

1. **`yonetici` (Administrator)**
   - Full access to all features
   - Access to administration panel
   - Can manage users and system settings
   - Access to sales performance reports

2. **`satisci` (Salesperson)**
   - Access to customer management
   - Work order creation and management
   - Access to personal work order list
   - Limited access to stock information

3. **`muhasebeci` (Accountant)**
   - Access to receivables tracking
   - Work order cost management
   - Access to agreements
   - Limited administrative access

4. **`yetkisiz` (Unauthorized)**
   - No access to application features
   - Automatically redirected to unauthorized page
   - Forced logout on detection

### Role-Based Route Protection
Routes implement granular access control through route metadata:

```javascript
// Admin-only route
{
  path: 'yonetim', 
  name: 'yonetim-paneli', 
  component: YonetimPaneliView,
  meta: { 
    roles: ['yonetici'] 
  }
}

// Multi-role route
{
  path: 'is-emirleri-satisci', 
  name: 'is-emirleri-satiscilara-gore', 
  component: SatisciIsEmirleriView,
  meta: {
    roles: ['satisci', 'yonetici', 'muhasebeci'] 
  }
}
```

### Route Guards
The router implements comprehensive guards in `beforeEach`:

1. **Session Check**: Ensures user profile is loaded
2. **Authentication Enforcement**: Redirects unauthenticated users to login
3. **Authorization Enforcement**: Restricts access based on user roles
4. **Unauthorized User Handling**: Redirects 'yetkisiz' users to unauthorized page
5. **Post-login Redirects**: Prevents authenticated users from accessing login page

## User Store Implementation

### State Management
The `userStore` manages authentication state:

```javascript
const user = ref(null)          // Authenticated user object
const profile = ref(null)       // User profile with role information
const loading = ref(false)      // Loading state
```

### Computed Properties
Role checking through reactive computed properties:

```javascript
const isYonetici = computed(() => profile.value?.rol === 'yonetici')
const isSatisci = computed(() => profile.value?.rol === 'satisci')
const isMuhasebeci = computed(() => profile.value?.rol === 'muhasebeci')
const isYetkisiz = computed(() => profile.value?.rol === 'yetkisiz')
const isYetkili = computed(() => {
  const rol = profile.value?.rol
  return rol && rol !== 'yetkisiz'
})
```

### Methods

#### `fetchUser()`
Loads current user and profile information:
- Calls `supabase.auth.getUser()` to get auth user
- Fetches profile from `profiller` table using user ID
- Automatically logs out 'yetkisiz' users
- Handles errors gracefully

#### `logout()`
Signs out the user:
- Calls `supabase.auth.signOut()`
- Clears user and profile state

#### `refreshProfile()`
Refreshes user profile information:
- Useful after role changes
- Automatically logs out if user becomes 'yetkisiz'

## Profile Management

### Profile Table Structure
The `profiller` table contains essential user information:
- `id`: User ID (foreign key to auth.users)
- `rol`: User role (enum: 'yonetici', 'satisci', 'muhasebeci', 'yetkisiz')
- `tam_ad`: Full name of the user
- Other profile fields as needed

### Role Display Names
User-friendly role names are provided through computed properties:
- 'yonetici' → 'Yönetici'
- 'satisci' → 'Satışçı'
- 'muhasebeci' → 'Muhasebeci'
- 'yetkisiz' → 'Yetkisiz'

## Security Considerations

### Session Security
- Automatic session restoration with proper validation
- Profile refresh capability for dynamic role changes
- Immediate logout for unauthorized users

### Route Security
- Client-side route guarding backed by server-side validation
- Role-based access control enforced at both UI and API levels
- Prevention of privilege escalation attempts

### Data Protection
- Role information stored separately from auth credentials
- Profile updates require proper authorization
- Sensitive operations validated server-side

## Recent Improvements

### Enhanced Error Handling
Improved handling of authentication edge cases:
- Better error messages for failed authentication
- Graceful handling of profile load failures
- Clear user feedback for authorization issues

### Session Consistency
Enhanced session management:
- Reliable session restoration across page reloads
- Proper cleanup of user state on logout
- Consistent handling of role changes
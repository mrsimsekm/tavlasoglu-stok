# State Management (Pinia Stores)

## Overview
The application uses Pinia for state management, which is the official state management library for Vue.js. Pinia provides a intuitive API and excellent TypeScript support.

## Store Structure

### User Store (`src/stores/userStore.js`)
The primary store managing authentication and user-related state.

#### State
```javascript
const user = ref(null)        // Supabase auth user object
const profile = ref(null)     // User profile with role information
const loading = ref(false)    // Loading state for user data fetching
```

#### Getters (Computed Properties)
The store exposes several computed properties for role checking:

- `isYonetici`: Returns true if user has 'yonetici' role
- `isSatisci`: Returns true if user has 'satisci' role
- `isMuhasebeci`: Returns true if user has 'muhasebeci' role
- `isYetkisiz`: Returns true if user has 'yetkisiz' role
- `isYetkili`: Returns true if user has any role except 'yetkisiz'
- `fullName`: Returns user's full name or email
- `role`: Returns user's role string
- `roleDisplayName`: Returns localized role name in Turkish

#### Actions
The store provides methods for user management:

##### `fetchUser()`
Fetches the current user and profile information:
- Gets auth user from Supabase
- Fetches profile from `profiller` table
- Automatically logs out 'yetkisiz' users
- Handles loading states and errors

##### `logout()`
Signs out the current user:
- Calls Supabase signOut
- Clears user and profile state

##### `refreshProfile()`
Refreshes the user profile:
- Useful after role changes
- Automatically handles 'yetkisiz' role assignment

#### Usage Example
```javascript
import { useUserStore } from '@/stores/userStore'

export default {
  setup() {
    const userStore = useUserStore()
    
    // Access state
    const isAuthenticated = computed(() => !!userStore.user)
    
    // Access getters
    const canAccessAdmin = userStore.isYonetici
    
    // Call actions
    const handleLogout = () => userStore.logout()
    
    return {
      isAuthenticated,
      canAccessAdmin,
      handleLogout
    }
  }
}
```

### Counter Store (`src/stores/counter.js`)
A simple example store, likely used for demonstration purposes.

#### State
```javascript
const count = ref(0)
const name = ref('Tavlasoğlu')
```

#### Getters
- `doubleCount`: Returns count multiplied by 2

#### Actions
- `increment()`: Increments the count value

## Store Initialization
Stores are initialized in `main.js`:

```javascript
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
```

## Best Practices Implemented

### Reactive State Management
- Uses Vue's reactivity system with `ref` and `computed`
- Proper state isolation per store
- Reactive getters for derived state

### Asynchronous Operations
- Proper loading state handling
- Error handling in async actions
- Automatic state cleanup

### Type Safety
While the current implementation is in JavaScript, the structure follows patterns that would support TypeScript migration:
- Clear state shape definition
- Explicit return types for getters
- Well-defined action signatures

## Store Usage Patterns

### Component Integration
Stores are typically used in the `setup()` function or `<script setup>`:

```javascript
<script setup>
import { useUserStore } from '@/stores/userStore'
import { computed } from 'vue'

const userStore = useUserStore()

// Reactive state access
const user = computed(() => userStore.user)
const profile = computed(() => userStore.profile)

// Action usage
const logout = () => userStore.logout()
</script>
```

### Composition API Benefits
- Stores can be used anywhere in the component tree
- Automatic optimization (only accessed stores are instantiated)
- DevTools integration for debugging
- Hot module replacement support

## Recent Improvements

### Enhanced User Management
Improvements to user store handling:
- Better session restoration
- More robust error handling
- Automatic authorization enforcement
- Profile refresh capabilities

### Loading State Management
Improved loading state handling:
- Dedicated loading refs for different operations
- Prevention of duplicate requests
- Better user feedback during operations

## Future Considerations

### Additional Stores
Potential candidates for future stores:
- Stock management state
- Work order state
- Notification system
- Form validation state

### Performance Optimization
Considerations for store performance:
- Selective state persistence
- Memory leak prevention
- Efficient reactive dependency tracking
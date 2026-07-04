# Utilities and Composables

## Composables

### useLoading (`src/composables/useLoading.js`)
A reusable composable for managing loading states and preventing duplicate submissions.

#### Purpose
Prevents multiple simultaneous executions of asynchronous operations and provides visual feedback to users.

#### State
```javascript
const isLoading = ref(false)  // Tracks if an operation is in progress
```

#### Methods

##### `withLoading(asyncFunc)`
Wraps an async function with loading state management:
- Prevents execution if already loading
- Sets loading state to true before execution
- Sets loading state to false after completion (success or error)
- Handles errors appropriately

#### Usage Example
```javascript
import { useLoading } from '@/composables/useLoading'

export default {
  setup() {
    const { isLoading, withLoading } = useLoading()
    
    const saveData = async () => {
      await withLoading(async () => {
        // Supabase operations or other async work
        const { error } = await supabase.from('table').insert(data)
        if (error) throw error
      })
    }
    
    return {
      isLoading,
      saveData
    }
  }
}
```

#### Template Usage
```vue
<template>
  <button @click="saveData" :disabled="isLoading">
    {{ isLoading ? 'Saving...' : 'Save' }}
  </button>
</template>
```

#### Benefits
- Prevents accidental double-clicks/submissions
- Provides consistent loading feedback
- Centralized error handling
- Reusable across components

### useYetki (`src/composables/useYetki.js`)
Authorization helper functions that provide fine-grained permission checking.

#### Purpose
Provides granular permission checks for specific operations in the application.

#### State
Utilizes the user store for role-based permission checking.

#### Methods

##### `yetkiVarMi(islem, context = {})`
Checks if the current user has permission for a specific operation:
- `tahsilat`: Payment collection (accountant and admin only)
- `kalem_sil`: Item deletion (depends on saved status and user role)
- `is_emri_ac`: Work order creation (specific roles)
- `is_emri_duzenle`: Work order editing (depends on saved status)
- `is_emri_kapat`: Work order closing (specific roles)
- `raporlar`: Reports viewing (accountant and admin only)

Context parameter allows for conditional permissions based on record state.

##### `yetkiUyarisi(islem)`
Returns user-friendly warning messages for permission denied scenarios.

#### Usage Example
```javascript
import { useYetki } from '@/composables/useYetki'

export default {
  setup() {
    const { yetkiVarMi, yetkiUyarisi } = useYetki()
    
    const handlePayment = () => {
      if (!yetkiVarMi('tahsilat')) {
        alert(yetkiUyarisi('tahsilat'))
        return
      }
      // Proceed with payment logic
    }
    
    const canEditOrder = (isSaved) => {
      return yetkiVarMi('is_emri_duzenle', { kaydedilmis: isSaved })
    }
    
    return {
      handlePayment,
      canEditOrder
    }
  }
}
```

## Utility Functions

### adminApi (`src/utils/adminApi.js`)
Administrative API functions for managing system operations through Supabase Edge Functions.

#### Purpose
Provides helper functions for administrative tasks that require elevated privileges, communicating with Supabase Edge Functions.

#### Functions

##### `listUsers()`
Retrieves a list of all users in the system.

##### `createUser({ email, password, tam_ad, rol })`
Creates a new user with the specified credentials and role.

##### `updateUser({ userId, tam_ad, rol })`
Updates user profile information and role.

##### `resetPassword({ userId, newPassword })`
Resets a user's password to the specified new password.

#### Implementation Details
- Uses Supabase Edge Functions for secure administrative operations
- Requires active session with administrator privileges
- Handles authentication token automatically
- Provides structured error handling

#### Usage Example
```javascript
import { adminApi } from '@/utils/adminApi'

export default {
  setup() {
    const createUser = async (userData) => {
      try {
        const result = await adminApi.createUser(userData)
        console.log('User created:', result)
      } catch (error) {
        console.error('Failed to create user:', error.message)
      }
    }
    
    return { createUser }
  }
}
```

## Best Practices

### Composable Design
All composables follow Vue 3 Composition API patterns:
- Use `ref` and `computed` for reactive state
- Return objects with state and methods
- Follow single responsibility principle
- Provide clear TypeScript-like documentation

### Reusability
Composables are designed to be:
- Self-contained and independent
- Easy to integrate into any component
- Configurable through parameters where needed
- Consistent in naming conventions

### Error Handling
Utilities implement proper error handling:
- Try-catch blocks for async operations
- Meaningful error messages
- Graceful degradation
- Console logging for debugging

## Recent Improvements

### Loading State Management
Enhanced loading state handling:
- Better prevention of duplicate operations
- More reliable state transitions
- Improved user feedback mechanisms

### Performance Optimization
Optimizations in utility functions:
- Reduced memory footprint
- Faster execution times
- Better resource management

## Future Considerations

### Additional Composables
Potential candidates for future composables:
- Form validation helpers
- Data formatting utilities
- Date/time manipulation functions
- Pagination helpers
- Search/debounce utilities

### Utility Expansion
Areas for utility function expansion:
- CSV/import-export utilities
- Report generation helpers
- Chart data preparation
- Notification system utilities

## Integration Patterns

### Component Integration
Utilities are typically integrated in the `setup()` function:

```javascript
<script setup>
import { useLoading } from '@/composables/useLoading'
import { useYetki } from '@/composables/useYetki'

const { isLoading, withLoading } = useLoading()
const { hasPermission } = useYetki()

// Use in methods
const performAction = async () => {
  if (!hasPermission('edit')) return
  
  await withLoading(async () => {
    // Perform action
  })
}
</script>
```

### Store Integration
Some utilities may be integrated into stores for shared functionality:

```javascript
// In a store
import { useLoading } from '@/composables/useLoading'

export const useDataStore = defineStore('data', () => {
  const { withLoading } = useLoading()
  
  const fetchData = async () => {
    await withLoading(async () => {
      // Fetch data logic
    })
  }
  
  return { fetchData }
})
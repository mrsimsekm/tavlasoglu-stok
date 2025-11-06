// src/composables/useLoading.js
// Çift tıklama ve tekrar submit engelleyici

import { ref } from 'vue'

export function useLoading() {
  const isLoading = ref(false)
  
  /**
   * Async işlemi loading state ile çalıştırır
   * İşlem devam ederken tekrar çalıştırılmasını engeller
   */
  const withLoading = async (asyncFunc) => {
    if (isLoading.value) {
      console.warn('İşlem devam ediyor, lütfen bekleyin...')
      return null
    }
    
    isLoading.value = true
    
    try {
      const result = await asyncFunc()
      return result
    } catch (error) {
      console.error('İşlem hatası:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    isLoading,
    withLoading
  }
}

// KULLANIM ÖRNEĞİ:
// 
// <script setup>
// import { useLoading } from '@/composables/useLoading'
// 
// const { isLoading, withLoading } = useLoading()
// 
// const kaydet = async () => {
//   await withLoading(async () => {
//     // Supabase işlemleri
//     const { error } = await supabase.from('tablo').insert(...)
//     if (error) throw error
//     alert('Başarılı!')
//   })
// }
// </script>
// 
// <template>
//   <button @click="kaydet" :disabled="isLoading">
//     {{ isLoading ? 'Kaydediliyor...' : 'Kaydet' }}
//   </button>
// </template>
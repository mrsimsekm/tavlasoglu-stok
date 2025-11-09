// src/stores/userStore.js

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase.js'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const profil = ref(null)

  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser()
    user.value = data.user
    
    if (user.value) {
      await fetchProfil()
    } else {
      profil.value = null
    }
  }

  const fetchProfil = async () => {
    if (!user.value) return
    
    // .single() yerine .maybeSingle() kullanıyoruz.
    // Bu, sonuç bulunamazsa hata vermez, null döndürür.
    const { data, error } = await supabase
      .from('profiller') 
      .select('*')
      .eq('id', user.value.id)
      .maybeSingle() // <-- DEĞİŞİKLİK BURADA
    
    if (error) {
      console.error('Profil çekilirken hata:', error.message)
      profil.value = null
    } else {
      profil.value = data
    }
  }

  // Geri kalan kod aynı...
  const rol = computed(() => profil.value?.rol || null)
  const isYonetici = computed(() => rol.value === 'yonetici')
  const isMuhasebeci = computed(() => rol.value === 'muhasebeci')
  const isSatisci = computed(() => rol.value === 'satisci')

  const yetkiler = {
    tahsilatYapabilir: computed(() => isMuhasebeci.value || isYonetici.value),
    isEmriKalemSilebilir: computed(() => isYonetici.value),
    isEmriAcabilir: computed(() => true),
    isEmriDuzenleyebilir: (isEmriKaydedilmis) => {
      if (!isEmriKaydedilmis) return true
      return isYonetici.value
    },
    isEmriKapatabilir: computed(() => true),
    raporlariGorebilir: computed(() => isMuhasebeci.value || isYonetici.value),
  }

  return { 
    user, 
    profil,
    rol,
    isYonetici,
    isMuhasebeci,
    isSatisci,
    yetkiler,
    fetchUser,
    fetchProfil
  }
})
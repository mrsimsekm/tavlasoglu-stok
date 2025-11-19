import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase.js'

export const useUserStore = defineStore('user', () => {
  // Kullanıcı bilgilerini tutacak olan değişken
  const user = ref(null)
  
  // Kullanıcının profil bilgileri (rol dahil)
  const profile = ref(null)
  
  // Yükleme durumu
  const loading = ref(false)

  // Supabase'den mevcut kullanıcıyı ve profil bilgilerini getiren fonksiyon
  const fetchUser = async () => {
    loading.value = true
    try {
      // Kullanıcı auth bilgisini al
      const { data: userData } = await supabase.auth.getUser()
      user.value = userData.user
      
      // Eğer kullanıcı varsa, profil bilgilerini de çek
      if (userData.user) {
        const { data: profileData, error } = await supabase
          .from('profiller')
          .select('*')
          .eq('id', userData.user.id)
          .single()
        
        if (!error && profileData) {
          profile.value = profileData
          console.log('Profil yüklendi:', profileData)
          
          // Yetkisiz kullanıcı kontrolü
          if (profileData.rol === 'yetkisiz') {
            console.warn('Yetkisiz kullanıcı tespit edildi, çıkış yapılıyor...')
            await logout()
            return
          }
        } else {
          console.error('Profil bilgisi alınamadı:', error)
          profile.value = null
        }
      } else {
        profile.value = null
      }
    } catch (error) {
      console.error('Kullanıcı bilgisi alınamadı:', error)
      user.value = null
      profile.value = null
    } finally {
      loading.value = false
    }
  }

  // Kullanıcı çıkış yapsın
  const logout = async () => {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  // Profili yeniden yükle (rol güncellendikten sonra)
  const refreshProfile = async () => {
    if (!user.value) return
    
    try {
      const { data: profileData, error } = await supabase
        .from('profiller')
        .select('*')
        .eq('id', user.value.id)
        .single()
      
      if (!error && profileData) {
        profile.value = profileData
        console.log('Profil yenilendi:', profileData)
        
        // Yetkisiz olmuşsa çıkış yap
        if (profileData.rol === 'yetkisiz') {
          console.warn('Yetkiniz kaldırıldı, çıkış yapılıyor...')
          await logout()
        }
      } else {
        console.error('Profil yenileme hatası:', error)
      }
    } catch (error) {
      console.error('Profil yenileme hatası:', error)
    }
  }

  // Kullanıcının rolünü kontrol eden computed özellikler
  const isYonetici = computed(() => {
    const rol = profile.value?.rol
    console.log('isYonetici kontrol:', rol)
    return rol === 'yonetici'
  })
  
  const isSatisci = computed(() => profile.value?.rol === 'satisci')
  const isMuhasebeci = computed(() => profile.value?.rol === 'muhasebeci')
  const isYetkisiz = computed(() => profile.value?.rol === 'yetkisiz')
  
  // Yetkili kullanıcı mı (yetkisiz DEĞİL)
  const isYetkili = computed(() => {
    const rol = profile.value?.rol
    return rol && rol !== 'yetkisiz'
  })
  
  // Kullanıcının tam adı
  const fullName = computed(() => profile.value?.tam_ad || user.value?.email || 'Kullanıcı')
  
  // Kullanıcının rolü (string)
  const role = computed(() => profile.value?.rol || 'bilinmiyor')
  
  // Rol görünen adı (Türkçe)
  const roleDisplayName = computed(() => {
    const roleNames = {
      'yonetici': 'Yönetici',
      'satisci': 'Satışçı',
      'muhasebeci': 'Muhasebeci',
      'yetkisiz': 'Yetkisiz'
    }
    return roleNames[profile.value?.rol] || 'Bilinmiyor'
  })

  // Kullanıcı bilgilerini dışarıya açıyoruz
  return { 
    user, 
    profile,
    loading,
    fetchUser,
    refreshProfile,
    logout,
    isYonetici,
    isSatisci,
    isMuhasebeci,
    isYetkisiz,
    isYetkili,
    fullName,
    role,
    roleDisplayName
  }
})
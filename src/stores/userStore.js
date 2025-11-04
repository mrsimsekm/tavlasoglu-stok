import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase.js'

export const useUserStore = defineStore('user', () => {
  // Kullanıcı bilgilerini tutacak olan değişken. Başlangıçta null.
  const user = ref(null)

  // Supabase'den mevcut kullanıcıyı getiren ve 'user' değişkenine atayan fonksiyon.
  // Bu, sayfa yenilendiğinde bile kullanıcının oturumunu kontrol etmemizi sağlar.
  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser()
    user.value = data.user
  }

  // Kullanıcı bilgilerini dışarıya açıyoruz ki diğer bileşenler kullanabilsin.
  return { user, fetchUser }
})
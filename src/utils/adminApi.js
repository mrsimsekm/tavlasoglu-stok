// src/utils/adminApi.js
import { supabase } from '../supabase.js'

/**
 * Yönetici işlemleri için Edge Function çağrıları
 */

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-user-management`

const callAdminFunction = async (action, data = {}) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Oturum bulunamadı')
  }

  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, data })
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'İşlem başarısız')
  }

  return result
}

export const adminApi = {
  /**
   * Tüm kullanıcıları listele
   */
  async listUsers() {
    return await callAdminFunction('list-users')
  },

  /**
   * Yeni kullanıcı oluştur
   */
  async createUser({ email, password, tam_ad, rol }) {
    return await callAdminFunction('create-user', { email, password, tam_ad, rol })
  },

  /**
   * Kullanıcı bilgilerini güncelle (profil)
   */
  async updateUser({ userId, tam_ad, rol }) {
    return await callAdminFunction('update-user', { userId, tam_ad, rol })
  },

  /**
   * Kullanıcı şifresini sıfırla
   */
  async resetPassword({ userId, newPassword }) {
    return await callAdminFunction('reset-password', { userId, newPassword })
  }
}
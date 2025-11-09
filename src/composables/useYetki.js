import { useUserStore } from '../stores/userStore.js'

/**
 * Yetki kontrollerini kolaylaştıran composable
 * Kullanım: const { yetkiVarMi } = useYetki()
 */
export function useYetki() {
  const userStore = useUserStore()

  /**
   * Belirli bir işlem için yetki kontrolü yapar
   * @param {string} islem - 'tahsilat', 'kalem_sil', 'is_emri_ac', vb.
   * @param {object} context - Ek bağlam bilgileri (örn: { kaydedilmis: true })
   * @returns {boolean}
   */
  const yetkiVarMi = (islem, context = {}) => {
    switch (islem) {
      case 'tahsilat':
        return userStore.yetkiler.tahsilatYapabilir.value

      case 'kalem_sil':
        if (!context.kaydedilmis) return true // Kaydedilmemiş iş emirlerinde herkes silebilir
        return userStore.yetkiler.isEmriKalemSilebilir.value

      case 'is_emri_ac':
        return userStore.yetkiler.isEmriAcabilir.value

      case 'is_emri_duzenle':
        return userStore.yetkiler.isEmriDuzenleyebilir(context.kaydedilmis || false)

      case 'is_emri_kapat':
        return userStore.yetkiler.isEmriKapatabilir.value

      case 'raporlar':
        return userStore.yetkiler.raporlariGorebilir.value

      default:
        return false
    }
  }

  /**
   * Yetki yoksa kullanıcıya uyarı gösterir
   * @param {string} islem
   */
  const yetkiUyarisi = (islem) => {
    const mesajlar = {
      tahsilat: 'Tahsilat yapma yetkisi sadece muhasebeci ve yöneticilerde bulunmaktadır.',
      kalem_sil: 'Kaydedilmiş iş emrinden kalem silme yetkisi sadece yöneticilerde bulunmaktadır.',
      is_emri_duzenle: 'Bu iş emrini düzenleme yetkiniz bulunmamaktadır.',
      raporlar: 'Raporları görüntüleme yetkisi sadece muhasebeci ve yöneticilerde bulunmaktadır.'
    }

    return mesajlar[islem] || 'Bu işlem için yetkiniz bulunmamaktadır.'
  }

  return {
    yetkiVarMi,
    yetkiUyarisi,
    userStore
  }
}
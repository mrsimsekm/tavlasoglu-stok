<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Uyarı Kartı -->
      <div class="bg-white rounded-lg shadow-2xl p-8 text-center">
        <!-- İkon -->
        <div class="mb-6">
          <div class="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>

        <!-- Başlık -->
        <h1 class="text-3xl font-bold text-gray-800 mb-4">
          Erişim Engellendi
        </h1>

        <!-- Açıklama -->
        <div class="mb-6 space-y-3">
          <p class="text-gray-600 text-lg">
            Hesabınız <span class="font-semibold text-red-600">yetkisiz</span> olarak işaretlenmiştir.
          </p>
          <p class="text-gray-500">
            Sisteme erişim yetkiniz kaldırılmıştır. Lütfen sistem yöneticiniz ile iletişime geçin.
          </p>
        </div>

        <!-- Kullanıcı Bilgileri -->
        <div v-if="userStore.user" class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="text-sm text-gray-600 space-y-1">
            <p><span class="font-medium">Email:</span> {{ userStore.user.email }}</p>
            <p><span class="font-medium">Ad Soyad:</span> {{ userStore.fullName }}</p>
            <p><span class="font-medium">Durum:</span> <span class="text-red-600 font-semibold">{{ userStore.roleDisplayName }}</span></p>
          </div>
        </div>

        <!-- İletişim Bilgisi -->
        <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p class="text-sm text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Yardım için sistem yöneticinize başvurun
          </p>
        </div>

        <!-- Çıkış Butonu -->
        <button 
          @click="handleLogout" 
          class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Çıkış Yap
        </button>

        <!-- Son Güncelleme Zamanı -->
        <p class="mt-6 text-xs text-gray-400">
          Sayfa yüklenme zamanı: {{ currentTime }}
        </p>
      </div>

      <!-- Ek Bilgi -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Bu bir güvenlik önlemidir. Eğer bunun bir hata olduğunu düşünüyorsanız, 
          lütfen yöneticinize bilgi verin.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore.js'

const router = useRouter()
const userStore = useUserStore()
const currentTime = ref('')

const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}

onMounted(() => {
  // Sayfa yüklenme zamanını göster
  currentTime.value = new Date().toLocaleString('tr-TR')
  
  // Eğer kullanıcı yetkili olmuşsa (yanlışlıkla bu sayfaya gelmişse)
  if (userStore.isYetkili) {
    router.push('/app/dashboard')
  }
})
</script>

<style scoped>
/* Animasyonlar */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.max-w-md {
  animation: fadeIn 0.5s ease-out;
}
</style>
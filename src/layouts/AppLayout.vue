<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <!-- OVERLAY (Mobile) -->
    <div 
      v-if="sidebarAcik" 
      @click="sidebarAcik = false"
      class="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
    ></div>

    <!-- SIDEBAR -->
    <aside 
      :class="[
        'w-64 flex-shrink-0 bg-gray-800 text-white p-4 fixed lg:relative h-full z-30 transition-transform duration-300',
        sidebarAcik ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Close Button (Mobile) -->
      <button 
        @click="sidebarAcik = false"
        class="lg:hidden absolute top-4 right-4 text-white hover:text-gray-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div class="mb-6 flex flex-col items-center">
        <div class="w-36 h-18 bg-white rounded-lg flex items-center justify-center mb-2">
          <img src="/logo.png" alt="Şirket Logo" class="max-w-full max-h-full object-contain p-2">
        </div>
      </div>
      <div class="text-2xl font-bold mb-8">Stok Takip</div>
      <nav>
          <!-- YETKİSİZ KULLANICI İÇİN MESAJ -->
        <div v-if="userStore.isYetkisiz" class="text-center py-8 px-4">
          <div class="bg-red-900 rounded-lg p-4 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-red-300 mb-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
            </svg>
            <p class="text-red-200 text-sm font-semibold">Erişim Yetkiniz Yok</p>
            <p class="text-red-300 text-xs mt-2">Sistem yöneticisi ile iletişime geçin</p>
          </div>
        </div>
        <ul>
          <li class="mb-4">
            <RouterLink to="/app/dashboard" class="link-style" active-class="bg-gray-600">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                Ana Sayfa
              </div>
            </RouterLink>
          </li>
          
          <li class="mb-4">
            <RouterLink to="/app/musteriler" class="link-style" active-class="bg-gray-600">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Müşteriler
              </div>
            </RouterLink>
          </li>
          
          <!-- Stok Menüsü -->
          <li class="mb-2">
            <div @click="toggleStokMenu" class="link-style flex justify-between items-center cursor-pointer">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
                </svg>
                <span>Stok</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform transition-transform" :class="{'rotate-90': stokMenuAcik}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              </div>

            </div>
            <ul v-if="stokMenuAcik" class="mt-2 ml-4 space-y-2">
              <li>
                <RouterLink to="/app/stok" class="link-style-sub" active-class="bg-gray-600 text-white" @click="sidebarAcik = false">
                  Stok Kartları
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/app/stok/giris" class="link-style-sub" active-class="bg-gray-600 text-white" @click="sidebarAcik = false">
                  Stok Girişleri
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/app/stok/depolar" class="link-style-sub" active-class="bg-gray-600 text-white" @click="sidebarAcik = false">
                  Depo Stokları
                </RouterLink>
              </li>
            </ul>
          </li>

          <!-- İş Emirleri Menüsü - YENİ -->
          <li class="mb-2">
            <div @click="toggleIsEmriMenu" class="link-style flex justify-between items-center cursor-pointer">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                </svg>
                <span>İş Emirleri</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform transition-transform" :class="{'rotate-90': isEmriMenuAcik}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              </div>
              
            </div>
            <ul v-if="isEmriMenuAcik" class="mt-2 ml-4 space-y-2">
              <li>
                <RouterLink to="/app/is-emirleri" class="link-style-sub" active-class="bg-gray-600 text-white" @click="sidebarAcik = false">
                  Tüm İş Emirleri
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/app/is-emirleri-satisci" class="link-style-sub" active-class="bg-gray-600 text-white" @click="sidebarAcik = false">
                  Satışçılara Göre
                </RouterLink>
              </li>
            </ul>
          </li>
          
          <li class="mb-4">
            <RouterLink to="/app/anlasmalar" class="link-style" active-class="bg-gray-600">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                </svg>
                Anlaşmalar
              </div>
            </RouterLink>
          </li>

          <!-- YÖNETİM PANELİ - Sadece Yönetici -->
          <li v-if="userStore.isYonetici" class="mb-4 mt-8 pt-4 border-t border-gray-600">
            <RouterLink to="/app/yonetim" class="link-style" active-class="bg-gray-600">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                </svg>
                Yönetim Paneli
              </div>
            </RouterLink>
          </li>
        </ul>
      </nav>
      
      <div class="absolute bottom-4">
        <button @click="handleLogout" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-56">
          Çıkış Yap
        </button>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="flex-1 overflow-y-auto">
      <!-- Hamburger Button (Mobile) -->
      <div class="lg:hidden bg-white shadow-sm p-4 flex items-center">
        <button 
          @click="sidebarAcik = true"
          class="text-gray-600 hover:text-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="ml-4 text-lg font-bold text-gray-800">Stok Takip</h1>
      </div>

      <div class="p-4 lg:p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
.link-style { 
  @apply p-2 block rounded transition-colors hover:bg-gray-700; 
}

.link-style-sub { 
  @apply p-1 block rounded text-sm text-gray-300 hover:bg-gray-700 hover:text-white; 
}
</style>

<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { supabase } from '../supabase.js'
import { useUserStore } from '@/stores/userStore.js'; // <-- 1. EKLENEN SATIR

const router = useRouter()
const userStore = useUserStore(); // <-- 2. EKLENEN SATIR

const stokMenuAcik = ref(false)
const isEmriMenuAcik = ref(false) // YENİ
const sidebarAcik = ref(false)

const toggleStokMenu = () => { 
  stokMenuAcik.value = !stokMenuAcik.value 
}

const toggleIsEmriMenu = () => { // YENİ
  isEmriMenuAcik.value = !isEmriMenuAcik.value 
}

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push('/login');
}
</script>
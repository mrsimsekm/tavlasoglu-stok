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

      <div class="text-2xl font-bold mb-8">Stok Takip</div>
      <nav>
        <ul>
          <li class="mb-4">
            <RouterLink to="/app/dashboard" class="link-style" active-class="bg-gray-600" @click="sidebarAcik = false">
              Ana Sayfa
            </RouterLink>
          </li>
          
          <li class="mb-4">
            <RouterLink to="/app/musteriler" class="link-style" active-class="bg-gray-600" @click="sidebarAcik = false">
              Müşteriler
            </RouterLink>
          </li>
          
          <!-- STOK MENÜSÜ -->
          <li class="mb-2">
            <div @click="toggleStokMenu" class="link-style flex justify-between items-center cursor-pointer">
              <span>Stok</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform transition-transform" :class="{'rotate-90': stokMenuAcik}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
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
          
          <li class="mb-4">
            <RouterLink to="/app/is-emirleri" class="link-style" active-class="bg-gray-600" @click="sidebarAcik = false">
              İş Emirleri
            </RouterLink>
          </li>
          
          <!-- ALACAKLAR -->
          <li class="mb-4">
            <RouterLink to="/app/alacaklar" class="link-style" active-class="bg-gray-600" @click="sidebarAcik = false">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
                </svg>
                Alacaklar
              </div>
            </RouterLink>
          </li>
          
          <li class="mb-4">
            <RouterLink to="/app/anlasmalar" class="link-style" active-class="bg-gray-600" @click="sidebarAcik = false">
              Anlaşmalar
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

const router = useRouter()
const stokMenuAcik = ref(false)
const sidebarAcik = ref(false) // YENİ: Mobile sidebar kontrolü

const toggleStokMenu = () => { 
  stokMenuAcik.value = !stokMenuAcik.value 
}

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push('/login');
}
</script>
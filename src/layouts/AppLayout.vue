<template>
  <div class="flex h-screen bg-gray-100">
    <aside class="w-64 flex-shrink-0 bg-gray-800 text-white p-4">
      <div class="text-2xl font-bold mb-8">Stok Takip</div>
      <nav>
        <ul>
          <li class="mb-4">
            <RouterLink to="/app/dashboard" class="link-style" active-class="bg-gray-600">
              Ana Sayfa
            </RouterLink>
          </li>
          
          <li class="mb-4">
            <RouterLink to="/app/musteriler" class="link-style" active-class="bg-gray-600">
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
                <RouterLink to="/app/stok" class="link-style-sub" active-class="bg-gray-600 text-white">
                  Stok Kartları
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/app/stok/giris" class="link-style-sub" active-class="bg-gray-600 text-white">
                  Stok Girişleri
                </RouterLink>
              </li>
            </ul>
          </li>
          
          <li class="mb-4">
            <RouterLink to="/app/is-emirleri" class="link-style" active-class="bg-gray-600">
              İş Emirleri
            </RouterLink>
          </li>
          
          <!-- ALACAKLAR - YENİ -->
          <li class="mb-4">
            <RouterLink to="/app/alacaklar" class="link-style" active-class="bg-gray-600">
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
            <RouterLink to="/app/anlasmalar" class="link-style" active-class="bg-gray-600">
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
    
    <main class="flex-1 p-8 overflow-y-auto">
      <RouterView />
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

const toggleStokMenu = () => { 
  stokMenuAcik.value = !stokMenuAcik.value 
}

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push('/login');
}
</script>
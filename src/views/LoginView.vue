<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Stok Takip Sistemine Giriş
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              E-posta Adresi
            </label>
            <div class="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                v-model="email"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Parola
            </label>
            <div class="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                v-model="password"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Giriş Yap
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase.js' 
import { useRouter } from 'vue-router'

// Vue Router'ı kullanmak için bir değişken oluşturuyoruz.
const router = useRouter()

// Form inputlarındaki verileri tutmak için reaktif değişkenler oluşturuyoruz.
const email = ref('')
const password = ref('')

// Giriş yapma fonksiyonu
const handleLogin = async () => {
  try {
    // Supabase'in giriş fonksiyonunu çağırıyoruz
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    // Eğer bir hata varsa, hatayı konsola yazdır ve fonksiyonu durdur.
    if (error) throw error
    
    // Hata yoksa, kullanıcıyı '/dashboard' adresine yönlendir.
    router.push('/app/dashboard')
    
  } catch (error) {
    // Hata oluşursa, hatanın detaylarını konsola yazdır.
    console.error('Giriş sırasında hata:', error.message)
    alert('Hata: ' + error.message) // Kullanıcıya hatayı göster.
  }
}
</script>
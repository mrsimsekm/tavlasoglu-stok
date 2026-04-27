<template>
  <div class="container mx-auto px-4 py-6">
    <!-- HEADER -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Proforma Ayarları</h1>
        <p class="text-sm text-gray-500 mt-1">Proformalarda otomatik çıkan kategori ve genel şart metinlerini buradan düzenleyebilirsiniz.</p>
      </div>
      <RouterLink to="/app/proformalar" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition shadow-sm flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Proformalara Dön
      </RouterLink>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="flex flex-col items-center">
        <svg class="animate-spin h-8 w-8 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span class="text-gray-500">Ayarlar yükleniyor...</span>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-12 gap-6">
      
      <!-- SOL MENÜ: Kategoriler -->
      <div class="md:col-span-4 bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div class="bg-gray-50 px-4 py-3 border-b font-bold text-gray-700 uppercase tracking-wider text-sm">
          Şart Kategorileri
        </div>
        <ul class="divide-y divide-gray-100 h-full max-h-[600px] overflow-y-auto">
          <li 
            v-for="ayar in ayarlar" 
            :key="ayar.id"
            @click="seciliAyar = { ...ayar }"
            class="px-4 py-3 cursor-pointer transition-colors flex justify-between items-center"
            :class="seciliAyar?.id === ayar.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-gray-50 border-l-4 border-transparent'"
          >
            <span class="font-medium text-sm" :class="seciliAyar?.id === ayar.id ? 'text-indigo-700' : 'text-gray-700'">
              {{ ayar.kategori_adi }}
            </span>
            <svg v-if="seciliAyar?.id === ayar.id" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
          </li>
        </ul>
      </div>

      <!-- SAĞ ALAN: Düzenleme Editörü -->
      <div class="md:col-span-8 bg-white rounded-lg shadow border border-gray-200 flex flex-col">
        <div v-if="seciliAyar" class="flex-1 flex flex-col">
          <div class="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
            <h2 class="text-lg font-bold text-indigo-700">
              {{ seciliAyar.kategori_adi }} Şartları
            </h2>
            <span v-if="seciliAyar.guncellenme_tarihi" class="text-xs text-gray-500 font-medium">
              Son Güncelleme: {{ new Date(seciliAyar.guncellenme_tarihi).toLocaleDateString('tr-TR') }}
            </span>
          </div>
          
          <div class="p-6 flex-1 flex flex-col">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Metni Düzenle:</label>
            <textarea 
              v-model="seciliAyar.sart_metni"
              rows="15"
              class="w-full flex-1 border border-gray-300 rounded-lg p-4 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 leading-relaxed resize-none shadow-inner"
              placeholder="Bu kategori seçildiğinde proformada otomatik çıkacak metni buraya yazın..."
            ></textarea>
            
            <div class="mt-4 flex justify-end">
              <button 
                @click="kaydet" 
                :disabled="saving"
                class="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="saving" class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                {{ saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="h-full flex flex-col items-center justify-center text-gray-400 p-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          <p class="text-lg font-medium">Düzenlemek için soldan bir kategori seçin.</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase.js';

const ayarlar = ref([]);
const seciliAyar = ref(null);
const loading = ref(true);
const saving = ref(false);

const fetchAyarlar = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('proforma_ayarlari')
      .select('*')
      .order('kategori_adi', { ascending: true }); // Alfabetik çek
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      // YENİ: GENEL kategorisini bul ve en başa taşı
      const genelIndex = data.findIndex(a => a.kategori_adi === 'GENEL');
      if (genelIndex > -1) {
        const genelItem = data.splice(genelIndex, 1)[0];
        data.unshift(genelItem); // Dizinin en başına ekle
      }
      
      ayarlar.value = data;
      seciliAyar.value = { ...ayarlar.value[0] }; // İlk elemanı (artık GENEL) seç
    } else {
      ayarlar.value = [];
    }
  } catch (err) {
    alert("Ayarlar yüklenirken hata oluştu: " + err.message);
  } finally {
    loading.value = false;
  }
};

const kaydet = async () => {
  if (!seciliAyar.value) return;
  saving.value = true;
  
  try {
    const { error } = await supabase
      .from('proforma_ayarlari')
      .update({ 
        sart_metni: seciliAyar.value.sart_metni,
        guncellenme_tarihi: new Date().toISOString()
      })
      .eq('id', seciliAyar.value.id);
      
    if (error) throw error;
    
    const index = ayarlar.value.findIndex(a => a.id === seciliAyar.value.id);
    if (index !== -1) {
      ayarlar.value[index].sart_metni = seciliAyar.value.sart_metni;
      ayarlar.value[index].guncellenme_tarihi = new Date().toISOString();
    }
    
    alert("Ayarlar başarıyla kaydedildi!");
  } catch (err) {
    alert("Kaydetme hatası: " + err.message);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchAyarlar();
});
</script>
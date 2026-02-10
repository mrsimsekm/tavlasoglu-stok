<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Stok Kartları</h1>
      
      <div class="flex items-center space-x-3">
        <!-- Kolon Yönetimi -->
        <div class="relative" ref="kolonMenuWrapper">
          <button 
            @click="kolonMenuAcik = !kolonMenuAcik" 
            class="flex items-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
            Kolonlar
          </button>
          
          <div v-if="kolonMenuAcik" class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 border border-gray-100">
            <div class="p-2 max-h-60 overflow-y-auto">
              <div v-for="kolon in kolonlar" :key="kolon.key" class="flex items-center px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                <input 
                  type="checkbox" 
                  :id="`col-${kolon.key}`"
                  v-model="kolon.gorunur" 
                  @change="kolonAyarlariniKaydet" 
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                >
                <label :for="`col-${kolon.key}`" class="ml-2 block text-sm text-gray-700 cursor-pointer flex-1">
                  {{ kolon.label }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Yeni Ekle Butonu -->
        <button 
          @click="formModaliniAc()" 
          class="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Yeni Stok Kartı
        </button>
      </div>
    </div>

    <!-- Arama Alanı -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div class="relative max-w-md w-full">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        <input 
          type="text" 
          v-model="aramaMetni"
          placeholder="Ürün Kodu, Açıklama, Grup Kodu..." 
          class="pl-10 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border py-2"
        >
        <!-- Loading Spinner (Input içi) -->
        <div v-if="loading && aramaMetni" class="absolute inset-y-0 right-0 pr-3 flex items-center">
          <svg class="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Tablo Alanı -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th 
                v-for="kolon in gorunurKolonlar" 
                :key="kolon.key" 
                @click="siralamayiDegistir(kolon.key)"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none group"
              >
                <div class="flex items-center space-x-1">
                  <span>{{ kolon.label }}</span>
                  <!-- Sıralama İkonları -->
                  <span v-if="sortBy === kolon.key" class="text-indigo-600">
                    <svg v-if="sortDirection === 'asc'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                  <span v-else class="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </span>
                </div>
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- Loading Durumu -->
            <tr v-if="loading && urunler.length === 0">
              <td :colspan="gorunurKolonlar.length + 1" class="px-6 py-10 text-center text-gray-500">
                <div class="flex flex-col items-center justify-center">
                  <svg class="animate-spin h-8 w-8 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Veriler yükleniyor...</span>
                </div>
              </td>
            </tr>

            <!-- Veri Yok Durumu -->
            <tr v-else-if="!loading && urunler.length === 0">
              <td :colspan="gorunurKolonlar.length + 1" class="px-6 py-10 text-center text-gray-500 italic">
                {{ aramaMetni ? 'Arama kriterlerinize uygun stok kartı bulunamadı.' : 'Henüz kayıtlı stok kartı yok.' }}
              </td>
            </tr>

            <!-- Veri Listesi -->
            <tr v-else v-for="urun in urunler" :key="urun.id" class="hover:bg-gray-50 transition-colors">
              <td v-for="kolon in gorunurKolonlar" :key="kolon.key" class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {{ formatDeger(urun[kolon.key], kolon.key) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div class="flex items-center justify-center space-x-3">
                  <button @click="formModaliniAc(urun)" class="text-indigo-600 hover:text-indigo-900 transition-colors" title="Düzenle">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button @click="urunSil(urun)" class="text-red-600 hover:text-red-900 transition-colors" title="Sil">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sayfalama (Pagination) -->
      <div class="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Toplam <span class="font-medium">{{ toplamKayitSayisi }}</span> kayıttan 
              <span class="font-medium">{{ baslangicKayit }}</span> - <span class="font-medium">{{ bitisKayit }}</span> arası gösteriliyor
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button 
                @click="sayfaDegistir(mevcutSayfa - 1)" 
                :disabled="mevcutSayfa === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Önceki</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                Sayfa {{ mevcutSayfa }} / {{ toplamSayfaSayisi }}
              </span>

              <button 
                @click="sayfaDegistir(mevcutSayfa + 1)"
                :disabled="mevcutSayfa >= toplamSayfaSayisi"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Sonraki</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Ekleme/Düzenleme Modalı -->
    <BaseModal :show="formModalGoster" @close="formModalGoster = false">
      <template #header>
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          {{ duzenlemeModu ? 'Stok Kartı Düzenle' : 'Yeni Stok Kartı Ekle' }}
        </h3>
      </template>
      <template #body>
        <form @submit.prevent="formuKaydet" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Ürün Kodu (*)</label>
              <input 
                :value="aktifUrun.urun_kodu" 
                @input="updateUrunKodu" 
                type="text" 
                required 
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                placeholder="Örn: 1001"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Ana Birim</label>
              <select 
                v-model="aktifUrun.ana_birim" 
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option disabled value="">Lütfen bir birim seçin</option>
                <option v-for="birim in birimler" :key="birim" :value="birim">{{ birim }}</option>
              </select>
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Açıklama</label>
              <textarea v-model="aktifUrun.aciklama" rows="2" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Açıklama 2</label>
              <textarea v-model="aktifUrun.aciklama_2" rows="1" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Açıklama 3</label>
              <textarea v-model="aktifUrun.aciklama_3" rows="1" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Grup Kodu</label>
              <input v-model="aktifUrun.grup_kodu" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Özel Kod</label>
              <input v-model="aktifUrun.ozel_kod" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Fiili Stok</label>
              <input v-model.number="aktifUrun.fiili_stok" type="number" step="0.01" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Gerçek Stok</label>
              <input v-model.number="aktifUrun.gercek_stok" type="number" step="0.01" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Sevkedilebilir Stok</label>
              <input v-model.number="aktifUrun.sevkedilebilir_stok" type="number" step="0.01" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <button 
          @click="formModalGoster = false" 
          class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          İptal
        </button>
        <button 
          @click="formuKaydet" 
          :disabled="isSaving" 
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSaving ? 'Kaydediliyor...' : (duzenlemeModu ? 'Güncelle' : 'Kaydet') }}
        </button>      
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch } from 'vue';
import { supabase } from '../supabase.js';
import BaseModal from '../components/BaseModal.vue';
import { useLoading } from '../composables/useLoading.js';

// --- Durum Değişkenleri ---
const urunler = ref([]);
const loading = ref(false);
const aramaMetni = ref('');
const kolonMenuAcik = ref(false);
const kolonMenuWrapper = ref(null);
const birimler = ref(['Adet', 'm', 'm2', 'm3', 'kg', 'lt', 'Paket', 'Kutu']);

// --- Sıralama ve Sayfalama ---
const mevcutSayfa = ref(1);
const sayfaBasinaKayit = 10;
const toplamKayitSayisi = ref(0);
const sortBy = ref('urun_kodu'); // Varsayılan sıralama kolonu
const sortDirection = ref('asc'); // Varsayılan yön

// --- Modal & Form ---
const formModalGoster = ref(false);
const duzenlemeModu = ref(false);
const aktifUrun = ref({});
const { isLoading: isSaving, withLoading } = useLoading();

// --- Kolon Ayarları ---
const localStorageKey = 'stok-kolon-ayarlari';
const varsayilanKolonlar = [
  { key: 'urun_kodu', label: 'Ürün Kodu', gorunur: true }, 
  { key: 'aciklama', label: 'Açıklama', gorunur: true }, 
  { key: 'ana_birim', label: 'Ana Birim', gorunur: true }, 
  { key: 'grup_kodu', label: 'Grup Kodu', gorunur: true }, 
  { key: 'fiili_stok', label: 'Fiili Stok', gorunur: true }, 
  { key: 'gercek_stok', label: 'Gerçek Stok', gorunur: false }, 
  { key: 'sevkedilebilir_stok', label: 'Sevk. Stok', gorunur: false }, 
  { key: 'aciklama_2', label: 'Açıklama 2', gorunur: false }, 
  { key: 'aciklama_3', label: 'Açıklama 3', gorunur: false }, 
  { key: 'ozel_kod', label: 'Özel Kod', gorunur: false },
];
const kolonlar = ref([]);

// --- Lifecycle Hooks ---
onMounted(() => {
  const kayitliAyarlar = localStorage.getItem(localStorageKey);
  kolonlar.value = kayitliAyarlar ? JSON.parse(kayitliAyarlar) : JSON.parse(JSON.stringify(varsayilanKolonlar));
  
  document.addEventListener('mousedown', handleClickOutside);
  getUrunler();
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

// --- Computed Properties ---
const gorunurKolonlar = computed(() => kolonlar.value.filter(k => k.gorunur));
const toplamSayfaSayisi = computed(() => Math.ceil(toplamKayitSayisi.value / sayfaBasinaKayit) || 1);
const baslangicKayit = computed(() => toplamKayitSayisi.value === 0 ? 0 : ((mevcutSayfa.value - 1) * sayfaBasinaKayit) + 1);
const bitisKayit = computed(() => Math.min(mevcutSayfa.value * sayfaBasinaKayit, toplamKayitSayisi.value));

// --- Arama (Debounce) ---
let debounceTimeout;
watch(aramaMetni, () => {
  clearTimeout(debounceTimeout);
  loading.value = true;
  debounceTimeout = setTimeout(() => {
    mevcutSayfa.value = 1;
    getUrunler();
  }, 500);
});

// --- Sıralama Değiştirme ---
const siralamayiDegistir = (kolonKey) => {
  if (sortBy.value === kolonKey) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = kolonKey;
    sortDirection.value = 'asc';
  }
  getUrunler();
};

// --- Sayfa Değiştirme ---
const sayfaDegistir = (sayfa) => {
  if (sayfa < 1 || sayfa > toplamSayfaSayisi.value) return;
  mevcutSayfa.value = sayfa;
  getUrunler();
};

// --- Veri Çekme (Server-Side) ---
const getUrunler = async () => {
  loading.value = true;
  try {
    const from = (mevcutSayfa.value - 1) * sayfaBasinaKayit;
    const to = from + sayfaBasinaKayit - 1;

    let query = supabase
      .from('urunler')
      .select('*', { count: 'exact' });

    // Arama
    if (aramaMetni.value) {
      const arama = aramaMetni.value.trim();
      // String alanlarda arama
      query = query.or(`urun_kodu.ilike.%${arama}%,aciklama.ilike.%${arama}%,aciklama_2.ilike.%${arama}%,aciklama_3.ilike.%${arama}%,grup_kodu.ilike.%${arama}%,ozel_kod.ilike.%${arama}%`);
    }

    // Sıralama
    query = query
      .order(sortBy.value, { ascending: sortDirection.value === 'asc' })
      .range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    urunler.value = data;
    toplamKayitSayisi.value = count;

  } catch (error) {
    console.error('Veri çekme hatası:', error.message);
  } finally {
    loading.value = false;
  }
};

// --- Format Yardımcısı ---
const formatDeger = (deger, kolonKey) => {
  if (deger === null || deger === undefined || deger === '') return '-';
  if (['fiili_stok', 'gercek_stok', 'sevkedilebilir_stok'].includes(kolonKey)) {
    return Number(deger).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return deger;
};

// --- UI İşlemleri ---
const updateUrunKodu = (event) => {
  const sayisalDeger = event.target.value.replace(/[^0-9]/g, '');
  if (aktifUrun.value) {
    aktifUrun.value.urun_kodu = sayisalDeger;
    event.target.value = sayisalDeger;
  }
};

const kolonAyarlariniKaydet = () => {
  localStorage.setItem(localStorageKey, JSON.stringify(kolonlar.value));
};

const handleClickOutside = (event) => {
  if (kolonMenuWrapper.value && !kolonMenuWrapper.value.contains(event.target)) {
    kolonMenuAcik.value = false;
  }
};

// --- CRUD İşlemleri ---
const formModaliniAc = (urun = null) => {
  if (urun) {
    duzenlemeModu.value = true;
    aktifUrun.value = { ...urun };
  } else {
    duzenlemeModu.value = false;
    aktifUrun.value = { 
      urun_kodu: '', aciklama: '', aciklama_2: '', aciklama_3: '', ana_birim: '', 
      grup_kodu: '', ozel_kod: '', fiili_stok: 0, gercek_stok: 0, sevkedilebilir_stok: 0 
    };
  }
  formModalGoster.value = true;
};

const formuKaydet = async () => {
  if (!aktifUrun.value.urun_kodu) {
    alert('Ürün Kodu alanı zorunludur.');
    return;
  }

  await withLoading(async () => {
    let error;
    if (duzenlemeModu.value) {
      const { id, ...guncellenecekVeri } = aktifUrun.value;
      ({ error } = await supabase.from('urunler').update(guncellenecekVeri).match({ id }));
    } else {
      ({ error } = await supabase.from('urunler').insert([aktifUrun.value]));
    }

    if (error) {
       if (error.code === '23505') throw new Error('Bu ürün kodu ile kayıtlı bir stok kartı zaten mevcut.');
       throw error;
    }

    formModalGoster.value = false;
    await getUrunler();
  });
};

const urunSil = async (urun) => {
  if (confirm(`'${urun.urun_kodu}' kodlu stok kartını silmek istediğinizden emin misiniz?`)) {
    try {
      loading.value = true;
      const { error } = await supabase.from('urunler').delete().match({ id: urun.id });
      if (error) throw error;
      
      // Sayfa boşaldıysa geri git
      if (urunler.value.length === 1 && mevcutSayfa.value > 1) {
        mevcutSayfa.value--;
      }
      
      await getUrunler();
    } catch (error) {
      console.error('Silme hatası:', error.message);
      if (error.code === '23503') {
        alert('Bu ürüne ait stok hareketleri veya iş emri kalemleri mevcut. Önce onları silmelisiniz.');
      } else {
        alert('Silme işlemi başarısız: ' + error.message);
      }
    } finally {
      loading.value = false;
    }
  }
};
</script>
<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-4">Stok Kartları</h1>
    <div class="flex justify-between items-center mb-6">
      <div class="relative w-1/3">
        <input 
          type="text" 
          placeholder="Ürün ara (Kod, Açıklama...)" 
          v-model="aramaMetni" 
          @input="aramayiYap"
          class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
        />
        <div class="absolute top-0 left-0 inline-flex items-center p-2 mt-1 ml-2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <div class="relative" ref="kolonMenuWrapper">
          <button @click="kolonMenuAcik = !kolonMenuAcik" class="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
            Kolonlar
          </button>
          <div v-if="kolonMenuAcik" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
            <ul class="py-1">
              <li v-for="kolon in kolonlar" :key="kolon.key">
                <label class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                  <input type="checkbox" v-model="kolon.gorunur" @change="kolonAyarlariniKaydet" class="mr-2">
                  {{ kolon.label }}
                </label>
              </li>
            </ul>
          </div>
        </div>
        <button @click="formModaliniAc()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
          + Yeni Stok Kartı Ekle
        </button>
      </div>
    </div>
    <div class="bg-white shadow-md rounded-lg overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th v-for="kolon in gorunurKolonlar" :key="kolon.key" @click="siralamayiDegistir(kolon.key)" class="th-style cursor-pointer hover:bg-gray-200">
              <div class="flex items-center">
                <span>{{ kolon.label }}</span>
                <span v-if="sortBy === kolon.key" class="ml-2">
                  <svg v-if="sortDirection === 'asc'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </th>
            <th class="th-style text-center">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="gorunurKolonlar.length + 1" class="text-center py-4">Yükleniyor...</td>
          </tr>
          <tr v-else-if="filtrelenmisUrunler.length === 0">
            <td :colspan="gorunurKolonlar.length + 1" class="text-center py-4">
              {{ aramaMetni ? 'Arama kriterlerine uygun stok kartı bulunamadı.' : 'Henüz stok kartı eklenmemiş.' }}
            </td>
          </tr>
          <tr v-else v-for="urun in filtrelenmisUrunler" :key="urun.id">
            <td v-for="kolon in gorunurKolonlar" :key="kolon.key" class="td-style">
              <p class="text-gray-900 whitespace-no-wrap">{{ formatDeger(urun[kolon.key], kolon.key) }}</p>
            </td>
            <td class="td-style text-center">
              <div class="flex item-center justify-center space-x-2">
                <button @click="formModaliniAc(urun)" class="text-yellow-500 hover:text-yellow-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button @click="urunSil(urun)" class="text-red-500 hover:text-red-700">
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
    <BaseModal :show="formModalGoster" @close="formModalGoster = false">
      <template #header>{{ duzenlemeModu ? 'Stok Kartı Düzenle' : 'Yeni Stok Kartı Ekle' }}</template>
      <template #body>
        <form @submit.prevent="formuKaydet" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label-style">Ürün Kodu (*)</label>
              <input :value="aktifUrun.urun_kodu" @input="updateUrunKodu" type="text" required class="form-input" placeholder="Sadece rakam giriniz">
            </div>
            <div>
              <label class="label-style">Ana Birim</label>
              <select v-model="aktifUrun.ana_birim" class="form-input">
                <option disabled value="">Lütfen bir birim seçin</option>
                <option v-for="birim in birimler" :key="birim" :value="birim">{{ birim }}</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="label-style">Açıklama</label>
              <textarea v-model="aktifUrun.aciklama" rows="2" class="form-input"></textarea>
            </div>
            <div class="col-span-2">
              <label class="label-style">Açıklama 2</label>
              <textarea v-model="aktifUrun.aciklama_2" rows="2" class="form-input"></textarea>
            </div>
            <div class="col-span-2">
              <label class="label-style">Açıklama 3</label>
              <textarea v-model="aktifUrun.aciklama_3" rows="2" class="form-input"></textarea>
            </div>
            <div>
              <label class="label-style">Grup Kodu</label>
              <input v-model="aktifUrun.grup_kodu" type="text" class="form-input">
            </div>
            <div>
              <label class="label-style">Özel Kodu</label>
              <input v-model="aktifUrun.ozel_kod" type="text" class="form-input">
            </div>
            <div>
              <label class="label-style">Fiili Stok</label>
              <input v-model.number="aktifUrun.fiili_stok" type="number" step="0.01" class="form-input">
            </div>
            <div>
              <label class="label-style">Gerçek Stok</label>
              <input v-model.number="aktifUrun.gercek_stok" type="number" step="0.01" class="form-input">
            </div>
            <div>
              <label class="label-style">Sevkedilebilir Stok</label>
              <input v-model.number="aktifUrun.sevkedilebilir_stok" type="number" step="0.01" class="form-input">
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <button @click="formModalGoster = false" class="btn-secondary">İptal</button>
        <button @click="formuKaydet" class="btn-primary">{{ duzenlemeModu ? 'Güncelle' : 'Kaydet' }}</button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.th-style { @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider; }
.td-style { @apply px-5 py-5 border-b border-gray-200 bg-white text-sm; }
.label-style { @apply block text-sm font-medium text-gray-700; }
.form-input { @apply mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
.btn-primary { @apply bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded; }
.btn-secondary { @apply bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded; }
</style>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { supabase } from '../supabase.js';
import BaseModal from '../components/BaseModal.vue';

const tumUrunler = ref([]);
const loading = ref(true);
const aramaMetni = ref('');
const formModalGoster = ref(false);
const duzenlemeModu = ref(false);
const aktifUrun = ref({});
const kolonMenuAcik = ref(false);
const kolonMenuWrapper = ref(null);
const birimler = ref(['Adet', 'm', 'm2', 'm3', 'kg', 'lt', 'Paket', 'Kutu']);
const sortBy = ref('urun_kodu');
const sortDirection = ref('asc');

let aramaDebounce = null;

const siralamayiDegistir = (kolonKey) => {
  if (sortBy.value === kolonKey) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = kolonKey;
    sortDirection.value = 'asc';
  }
  getUrunler();
};

const getUrunler = async () => {
  try {
    loading.value = true;
    const { data, error } = await supabase
      .from('urunler')
      .select('*')
      .order(sortBy.value, { ascending: sortDirection.value === 'asc', nullsFirst: false }); 
    
    if (error) throw error;
    tumUrunler.value = data || [];
  } catch (error) {
    console.error('Ürünler çekilirken hata oluştu:', error.message);
  } finally {
    loading.value = false;
  }
};

// Arama fonksiyonu - debounce ile
const aramayiYap = () => {
  clearTimeout(aramaDebounce);
  aramaDebounce = setTimeout(() => {
    // Arama otomatik olarak filtrelenmisUrunler computed'da yapılacak
  }, 300);
};

const updateUrunKodu = (event) => {
  const sayisalDeger = event.target.value.replace(/[^0-9]/g, '');
  if (aktifUrun.value) {
    aktifUrun.value.urun_kodu = sayisalDeger;
    event.target.value = sayisalDeger;
  }
};

const localStorageKey = 'stok-kolon-ayarlari';
const kolonAyarlariniKaydet = () => { 
  localStorage.setItem(localStorageKey, JSON.stringify(kolonlar.value)); 
};

const kolonAyarlariniYukle = () => {
  const kayitliAyarlar = localStorage.getItem(localStorageKey);
  if (kayitliAyarlar) { 
    return JSON.parse(kayitliAyarlar); 
  }
  return [
    { key: 'urun_kodu', label: 'Ürün Kodu', gorunur: true }, 
    { key: 'aciklama', label: 'Açıklama', gorunur: true }, 
    { key: 'ana_birim', label: 'Ana Birim', gorunur: true }, 
    { key: 'grup_kodu', label: 'Grup Kodu', gorunur: true }, 
    { key: 'aciklama_2', label: 'Açıklama 2', gorunur: false }, 
    { key: 'aciklama_3', label: 'Açıklama 3', gorunur: false }, 
    { key: 'fiili_stok', label: 'Fiili Stok', gorunur: false }, 
    { key: 'gercek_stok', label: 'Gerçek Stok', gorunur: false }, 
    { key: 'sevkedilebilir_stok', label: 'Sevkedilebilir Stok', gorunur: false }, 
    { key: 'ozel_kod', label: 'Özel Kod', gorunur: false },
  ];
};

const kolonlar = ref(kolonAyarlariniYukle());
const gorunurKolonlar = computed(() => kolonlar.value.filter(k => k.gorunur));

const handleClickOutside = (event) => {
  if (!kolonMenuAcik.value || (kolonMenuWrapper.value && kolonMenuWrapper.value.contains(event.target))) { 
    return; 
  }
  kolonMenuAcik.value = false;
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
  getUrunler();
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  clearTimeout(aramaDebounce);
});

// GELİŞMİŞ FİLTRELEME - TÜM ALANLARDA ARAMA
const filtrelenmisUrunler = computed(() => {
  if (!aramaMetni.value || aramaMetni.value.trim() === '') { 
    return tumUrunler.value; 
  }
  
  const arama = aramaMetni.value.toLowerCase().trim();
  
  return tumUrunler.value.filter(urun => {
    // Tüm string alanlarında arama yap
    const aramaAlanlari = [
      urun.urun_kodu,
      urun.aciklama,
      urun.aciklama_2,
      urun.aciklama_3,
      urun.grup_kodu,
      urun.ozel_kod,
      urun.ana_birim,
      urun.tur
    ];
    
    // Herhangi bir alanda eşleşme var mı kontrol et
    return aramaAlanlari.some(alan => {
      if (alan === null || alan === undefined) return false;
      return String(alan).toLowerCase().includes(arama);
    });
  });
});

const formatDeger = (deger, kolonKey) => {
  if (deger === null || deger === undefined || deger === '') return '-';
  
  // Sayısal kolonlar için formatla
  if (['fiili_stok', 'gercek_stok', 'sevkedilebilir_stok'].includes(kolonKey)) {
    return Number(deger).toFixed(2);
  }
  
  return deger;
};

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
  try {
    let error;
    if (duzenlemeModu.value) {
      const { id, ...guncellenecekVeri } = aktifUrun.value;
      ({ error } = await supabase.from('urunler').update(guncellenecekVeri).match({ id }));
    } else {
      ({ error } = await supabase.from('urunler').insert([aktifUrun.value]));
    }
    if (error) throw error;
    await getUrunler();
    formModalGoster.value = false;
    alert(`Stok kartı başarıyla ${duzenlemeModu.value ? 'güncellendi' : 'eklendi'}!`);
  } catch (error) {
    console.error('Stok kartı kaydedilirken hata:', error.message);
    alert('Hata: ' + error.message);
  }
};

const urunSil = async (urun) => {
  if (confirm(`'${urun.urun_kodu}' kodlu stok kartını silmek istediğinizden emin misiniz?`)) {
    try {
      const { error } = await supabase.from('urunler').delete().match({ id: urun.id });
      if (error) throw error;
      alert('Stok kartı başarıyla silindi.');
      await getUrunler();
    } catch (error) {
      console.error('Stok kartı silinirken hata:', error.message);
      alert('Hata: ' + error.message);
    }
  }
};
</script>
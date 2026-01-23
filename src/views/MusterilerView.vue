<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-4">Müşteri Listesi</h1>
    
    <div class="flex justify-between items-center mb-6">
      <div class="relative w-1/3">
        <input type="text" placeholder="Müşteri ara (Unvan, VKN, Tel, İl)..." v-model="aramaMetni" class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <div class="absolute top-0 left-0 inline-flex items-center p-2 mt-1 ml-2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
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
        <button @click="formModaliniAc()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">+ Yeni Müşteri Ekle</button>
      </div>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th v-for="kolon in gorunurKolonlar" :key="kolon.key" class="th-style">{{ kolon.label }}</th>
            <th class="th-style text-center">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td :colspan="gorunurKolonlar.length + 1" class="text-center py-4">Yükleniyor...</td></tr>
          <tr v-else-if="filtrelenmisMusteriler.length === 0"><td :colspan="gorunurKolonlar.length + 1" class="text-center py-4">Arama kriterlerine uygun müşteri bulunamadı.</td></tr>
          <tr v-else v-for="musteri in filtrelenmisMusteriler" :key="musteri.id">
            <td v-for="kolon in gorunurKolonlar" :key="kolon.key" class="td-style"><p class="text-gray-900 whitespace-no-wrap">{{ musteri[kolon.key] || '-' }}</p></td>
            <td class="td-style text-center">
              <div class="flex item-center justify-center space-x-2">
                <button @click="formModaliniAc(musteri)" class="text-yellow-500 hover:text-yellow-700" title="Düzenle"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                <button @click="musteriSil(musteri)" class="text-red-500 hover:text-red-700" title="Sil"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal :show="formModalGoster" @close="formModalGoster = false">
      <template #header>{{ duzenlemeModu ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle' }}</template>
      <template #body>
        <form @submit.prevent="formuKaydet" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label class="label-style">Unvan (*)</label><input v-model="aktifMusteri.unvan" type="text" required class="form-input"></div>
            <div><label class="label-style">İlgili Kişi</label><input v-model="aktifMusteri.ilgili_kisi" type="text" class="form-input"></div>
            <div><label class="label-style">Vergi Dairesi</label><input v-model="aktifMusteri.vergi_dairesi" type="text" class="form-input"></div>
            <div><label class="label-style">Vergi No</label><input v-model="aktifMusteri.vergi_no" type="text" class="form-input"></div>
            <div><label class="label-style">Telefon</label><input v-model="aktifMusteri.telefon" type="text" class="form-input"></div>
            <div><label class="label-style">TCKN</label><input v-model="aktifMusteri.tckn" type="text" class="form-input"></div>
            <div class="col-span-2"><label class="label-style">Adres</label><textarea v-model="aktifMusteri.adres" rows="2" class="form-input"></textarea></div>
            <div><label class="label-style">İlçe</label><input v-model="aktifMusteri.ilce" type="text" class="form-input"></div>
            <div><label class="label-style">İl</label><input v-model="aktifMusteri.il" type="text" class="form-input"></div>
          </div>
        </form>
      </template>
      <template #footer>
        <button @click="formModalGoster = false" class="btn-secondary">İptal</button>
        <button @click="formuKaydet" :disabled="musteriKayitYapiliyor" class="btn-primary">
          {{ musteriKayitYapiliyor ? 'Kaydediliyor...' : (duzenlemeModu ? 'Güncelle' : 'Kaydet') }}
        </button>      
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
import { useLoading } from '../composables/useLoading.js';

const { isLoading: musteriKayitYapiliyor, withLoading } = useLoading();
const tumMusteriler = ref([]);
const loading = ref(true);
const aramaMetni = ref('');
const kolonMenuAcik = ref(false);
const kolonMenuWrapper = ref(null);
const formModalGoster = ref(false);
const duzenlemeModu = ref(false);
const aktifMusteri = ref({});

const formModaliniAc = (musteri = null) => {
  if (musteri) {
    duzenlemeModu.value = true;
    aktifMusteri.value = { ...musteri };
  } else {
    duzenlemeModu.value = false;
    aktifMusteri.value = { unvan: '', ilgili_kisi: '', vergi_dairesi: '', vergi_no: '', telefon: '', tckn: '', adres: '', ilce: '', il: '' };
  }
  formModalGoster.value = true;
};

const formuKaydet = async () => {
  if (!aktifMusteri.value.unvan) {
    alert('Ünvan alanı zorunludur.');
    return;
  }
  
  await withLoading(async () => {
    let error;
    if (duzenlemeModu.value) {
      const { id, ...guncellenecekVeri } = aktifMusteri.value;
      ({ error } = await supabase.from('musteriler').update(guncellenecekVeri).match({ id }));
    } else {
      ({ error } = await supabase.from('musteriler').insert([aktifMusteri.value]));
    }
    if (error) throw error;
    await getMusteriler();
    formModalGoster.value = false;
    alert(`Müşteri başarıyla ${duzenlemeModu.value ? 'güncellendi' : 'eklendi'}!`);
  });
};

const musteriSil = async (musteri) => {
  if (confirm(`'${musteri.unvan}' unvanlı müşteriyi silmek istediğinizden emin misiniz?`)) {
    try {
      const { error } = await supabase.from('musteriler').delete().match({ id: musteri.id });
      if (error) throw error;
      alert('Müşteri başarıyla silindi.');
      await getMusteriler();
    } catch (error) {
      console.error('Müşteri silinirken hata:', error.message);
      alert('Hata: ' + error.message);
    }
  }
};

const handleClickOutside = (event) => {
  if (!kolonMenuAcik.value || (kolonMenuWrapper.value && kolonMenuWrapper.value.contains(event.target))) { return; }
  kolonMenuAcik.value = false;
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
  getMusteriler();
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

const localStorageKey = 'musteri-kolon-ayarlari';
const kolonAyarlariniKaydet = () => { localStorage.setItem(localStorageKey, JSON.stringify(kolonlar.value)); };
const kolonAyarlariniYukle = () => {
  const kayitliAyarlar = localStorage.getItem(localStorageKey);
  if (kayitliAyarlar) { 
    const parsed = JSON.parse(kayitliAyarlar);
    return parsed.filter(k => k.key !== 'musteri_kodu'); 
  }
  return [
    { key: 'unvan', label: 'Unvan', gorunur: true }, 
    { key: 'ilgili_kisi', label: 'İlgili Kişi', gorunur: true }, 
    { key: 'telefon', label: 'Telefon', gorunur: true }, 
    { key: 'il', label: 'İl', gorunur: true }, 
    { key: 'ilce', label: 'İlçe', gorunur: false }, 
    { key: 'tckn', label: 'TCKN', gorunur: false }, 
    { key: 'adres', label: 'Adres', gorunur: false }, 
    { key: 'vergi_dairesi', label: 'Vergi Dairesi', gorunur: false }, 
    { key: 'vergi_no', label: 'Vergi No', gorunur: false },
  ];
};

const kolonlar = ref(kolonAyarlariniYukle());
const gorunurKolonlar = computed(() => kolonlar.value.filter(k => k.gorunur));

const filtrelenmisMusteriler = computed(() => {
  if (!aramaMetni.value) { return tumMusteriler.value; }
  const arama = aramaMetni.value.toLowerCase();
  return tumMusteriler.value.filter(musteri => Object.values(musteri).some(val => String(val).toLowerCase().includes(arama)));
});

const getMusteriler = async () => {
  try {
    loading.value = true;
    const { data, error } = await supabase.from('musteriler').select('*');
    
    if (error) throw error;
    
    // GÜNCELLEME: Frontend tarafında özel sıralama (Harfler önce, Rakamlar sonra)
    if (data) {
      data.sort((a, b) => {
        const unvanA = a.unvan || '';
        const unvanB = b.unvan || '';
        
        // İlk karakterin rakam olup olmadığını kontrol et
        const isANumber = /^\d/.test(unvanA);
        const isBNumber = /^\d/.test(unvanB);

        if (isANumber && !isBNumber) return 1; // A rakam, B harf ise -> B önce gelir (A sona gider)
        if (!isANumber && isBNumber) return -1; // A harf, B rakam ise -> A önce gelir
        
        // İkisi de aynı türdense (ikisi de harf veya ikisi de rakam) normal Türkçe sıralama
        return unvanA.localeCompare(unvanB, 'tr');
      });
    }

    tumMusteriler.value = data;
  } catch (error) {
    console.error('Müşteriler çekilirken hata oluştu:', error.message);
  } finally {
    loading.value = false;
  }
};
</script>
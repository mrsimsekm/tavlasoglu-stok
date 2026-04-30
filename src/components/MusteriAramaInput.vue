<template>
  <div class="relative">
    <!-- ARAMA INPUTU -->
    <div class="relative">
      <input 
        type="text" 
        v-model="aramaMetni" 
        @input="musteriAra" 
        @focus="aramaKutusuOdaklandi = true"
        placeholder="Müşteri Unvanı, Vergi No veya Telefon..." 
        class="w-full p-2 pl-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
        autocomplete="off"
      />
      
      <!-- YÜKLENİYOR İKONU -->
      <div v-if="aramaYapiliyor" class="absolute right-3 top-2.5">
         <svg class="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
           <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
           <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
         </svg>
      </div>
    </div>

    <!-- ARAMA SONUÇLARI DROPDOWN -->
    <div v-if="aramaMetni.length >= 2 && aramaKutusuOdaklandi" class="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
      <ul class="max-h-60 overflow-y-auto">
        <!-- SONUÇLAR -->
        <li 
          v-for="musteri in aramaSonuclari" 
          :key="musteri.id" 
          @click="musteriSec(musteri)" 
          class="p-3 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0 transition-colors group"
        >
          <div class="font-bold text-gray-800 group-hover:text-indigo-700">{{ musteri.unvan }}</div>
          <div class="text-xs text-gray-500 flex justify-between mt-1">
             <span>{{ musteri.il ? musteri.il + '/' : '' }}{{ musteri.ilce }}</span>
             <span v-if="musteri.vergi_no" class="font-mono bg-gray-100 px-1 rounded">VKN: {{ musteri.vergi_no }}</span>
          </div>
        </li>
        
        <!-- SONUÇ BULUNAMADI MESAJI -->
        <li v-if="aramaSonuclari.length === 0 && !aramaYapiliyor" class="p-3 text-center text-gray-500 text-sm italic">
          Aradığınız kriterde kayıtlı müşteri bulunamadı.
        </li>
      </ul>

      <!-- YENİ MÜŞTERİ EKLE BUTONU (HER ZAMAN GÖRÜNÜR) -->
      <div class="p-2 bg-gray-50 border-t border-gray-200">
        <button 
          type="button" 
          @click="modalAc" 
          class="w-full py-2 px-4 bg-white border border-indigo-300 text-indigo-700 font-bold rounded shadow-sm hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Yeni Müşteri Ekle
        </button>
      </div>
    </div>

    <!-- MÜŞTERİ EKLEME MODALI -->
    <div v-if="showModal" class="fixed inset-0 z-[9999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <!-- Backdrop -->
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="modalKapat"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <!-- Modal Panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 border-b pb-2 mb-4" id="modal-title">
                  Hızlı Müşteri Ekle
                </h3>
                
                <form @submit.prevent="yeniMusteriKaydet" class="space-y-4">
                  <!-- Ünvan -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Firma Unvanı <span class="text-red-500">*</span></label>
                    <input type="text" v-model="yeniMusteri.unvan" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Firma tam adı">
                  </div>

                  <!-- İlgili Kişi & Telefon -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">İlgili Kişi</label>
                      <input type="text" v-model="yeniMusteri.ilgili_kisi" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Telefon</label>
                      <input type="text" v-model="yeniMusteri.telefon" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                  </div>

                  <!-- Vergi Bilgileri -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Vergi Dairesi</label>
                      <input type="text" v-model="yeniMusteri.vergi_dairesi" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Vergi No / TCKN</label>
                      <input type="text" v-model="yeniMusteri.vergi_no" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                  </div>

                  <!-- Adres Bilgileri -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">İl</label>
                      <input type="text" v-model="yeniMusteri.il" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">İlçe</label>
                      <input type="text" v-model="yeniMusteri.ilce" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    </div>
                  </div>
                  
                   <div>
                      <label class="block text-sm font-medium text-gray-700">Adres</label>
                      <textarea v-model="yeniMusteri.adres" rows="2" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                   </div>

                  <div v-if="kayitHatasi" class="text-red-600 text-sm font-bold bg-red-50 p-2 rounded">
                    {{ kayitHatasi }}
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              @click="yeniMusteriKaydet" 
              :disabled="kaydediliyor"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400"
            >
              {{ kaydediliyor ? 'Kaydediliyor...' : 'Kaydet ve Seç' }}
            </button>
            <button 
              type="button" 
              @click="modalKapat" 
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { supabase } from '../supabase.js';

const emit = defineEmits(['musteri-secildi']);

const aramaMetni = ref('');
const aramaSonuclari = ref([]);
const aramaKutusuOdaklandi = ref(false);
const aramaYapiliyor = ref(false);

// Modal State
const showModal = ref(false);
const kaydediliyor = ref(false);
const kayitHatasi = ref('');

const yeniMusteri = reactive({
  unvan: '',
  ilgili_kisi: '',
  telefon: '',
  vergi_dairesi: '',
  vergi_no: '',
  il: 'Erzurum', // Varsayılan il
  ilce: '',
  adres: ''
});

let debounceTimer;

// Dışarı tıklandığında dropdown'ı kapat
const handleClickOutside = (e) => {
  if (!e.target.closest('.relative')) {
    aramaKutusuOdaklandi.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const musteriAra = () => {
  aramaYapiliyor.value = true;
  clearTimeout(debounceTimer);
  
  debounceTimer = setTimeout(async () => {
    if (aramaMetni.value.length < 2) { 
      aramaSonuclari.value = []; 
      aramaYapiliyor.value = false;
      return; 
    }
    
    const arama = aramaMetni.value;
    
    try {
      const { data, error } = await supabase.from('musteriler')
        .select('id, unvan, vergi_no, telefon, il, ilce, ilgili_kisi, adres, vergi_dairesi')
        .or(`unvan.ilike.%${arama}%,vergi_no.ilike.%${arama}%,telefon.ilike.%${arama}%,il.ilike.%${arama}%,ilce.ilike.%${arama}%`)
        .limit(10);

      if (error) throw error;
      aramaSonuclari.value = data || [];
    } catch (err) {
      console.error('Arama hatası:', err);
    } finally {
      aramaYapiliyor.value = false;
    }
  }, 400); // 400ms debounce
};

const musteriSec = (musteri) => {
  aramaMetni.value = musteri.unvan;
  aramaSonuclari.value = [];
  aramaKutusuOdaklandi.value = false;
  emit('musteri-secildi', musteri);
};

// --- MODAL İŞLEMLERİ ---

const modalAc = () => {
  // Eğer kullanıcı arama kutusuna bir isim yazdıysa onu formda unvana taşı
  yeniMusteri.unvan = aramaMetni.value.length > 2 ? aramaMetni.value : '';
  // Diğer alanları temizle
  yeniMusteri.ilgili_kisi = '';
  yeniMusteri.telefon = '';
  yeniMusteri.vergi_no = '';
  yeniMusteri.vergi_dairesi = '';
  yeniMusteri.ilce = '';
  yeniMusteri.adres = '';
  
  kayitHatasi.value = '';
  aramaKutusuOdaklandi.value = false; // Dropdown'ı kapat
  showModal.value = true;
};

const modalKapat = () => {
  showModal.value = false;
};

const yeniMusteriKaydet = async () => {
  if (!yeniMusteri.unvan) {
    kayitHatasi.value = "Firma unvanı zorunludur.";
    return;
  }

  kaydediliyor.value = true;
  kayitHatasi.value = '';

  try {
    // Benzersiz Müşteri Kodu Oluştur (M + Timestamp son 6 hane)
    const uniqueCode = 'M' + Date.now().toString().slice(-6);

    const { data, error } = await supabase.from('musteriler').insert([{
      musteri_kodu: uniqueCode,
      unvan: yeniMusteri.unvan,
      ilgili_kisi: yeniMusteri.ilgili_kisi,
      telefon: yeniMusteri.telefon,
      vergi_dairesi: yeniMusteri.vergi_dairesi,
      vergi_no: yeniMusteri.vergi_no,
      il: yeniMusteri.il,
      ilce: yeniMusteri.ilce,
      adres: yeniMusteri.adres
    }]).select().single();

    if (error) throw error;

    // Başarılı kayıt sonrası:
    // 1. Modalı kapat
    showModal.value = false;
    // 2. Müşteriyi seçili hale getir
    musteriSec(data);
    
    alert('Yeni müşteri başarıyla oluşturuldu ve seçildi.');

  } catch (err) {
    console.error(err);
    if (err.code === '23505') { // Unique constraint violation
      kayitHatasi.value = 'Bu müşteri zaten kayıtlı veya unvan/vergi no mükerrer.';
    } else {
      kayitHatasi.value = 'Kaydetme hatası: ' + err.message;
    }
  } finally {
    kaydediliyor.value = false;
  }
};
</script>
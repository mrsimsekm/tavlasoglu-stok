<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Stok Girişleri</h1>
      <button @click="formModaliniAc()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
        + Yeni Stok Girişi
      </button>
    </div>
    
    <div class="bg-white shadow-md rounded-lg">
       <p class="p-4 text-gray-500 text-center">Geçmiş stok girişleri özelliği daha sonra eklenecektir.</p>
    </div>

    <!-- YENİ STOK GİRİŞİ MODAL'I -->
    <BaseModal :show="formModalGoster" @close="formModalGoster = false">
      <template #header>Yeni Stok Girişi</template>
      <template #body>
         <div class="space-y-4">
            <div>
              <label class="label-style">Ürün (*)</label>
              <!-- Ürün arama component'i buraya gelecek - Şimdilik basit input -->
               <div class="relative mt-1">
                <input type="text" v-model="urunAramaMetni" @input="urunAra" placeholder="Ürün kodu veya açıklama..." class="form-input" />
                <div v-if="urunAramaSonuclari.length > 0" class="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                  <ul><li v-for="urun in urunAramaSonuclari" :key="urun.id" @click="urunSec(urun)" class="p-2 hover:bg-gray-100 cursor-pointer">{{ urun.urun_kodu }} - {{ urun.aciklama }}</li></ul>
                </div>
              </div>
            </div>
            <div>
              <label class="label-style">Depo (*)</label>
              <select v-model="yeniGiris.depo_id" class="form-input">
                <option :value="null" disabled>Depo Seçin</option>
                <option v-for="depo in depolar" :key="depo.id" :value="depo.id">{{ depo.ad }}</option>
              </select>
            </div>
            <div>
              <label class="label-style">Giriş Miktarı (*)</label>
              <input v-model.number="yeniGiris.miktar" type="number" step="0.01" class="form-input">
            </div>
         </div>
      </template>
       <template #footer>
        <button @click="formModalGoster = false" class="btn-secondary">İptal</button>
        <button @click="stokGirisiKaydet" class="btn-primary ml-2">Kaydet</button>
      </template>
    </BaseModal>

  </div>
</template>

<style>
.label-style { @apply block text-sm font-medium text-gray-700; }
.form-input { @apply mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
.btn-primary { @apply bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded; }
.btn-secondary { @apply bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded; }
</style>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase.js';
import BaseModal from '../components/BaseModal.vue';

const formModalGoster = ref(false);
const depolar = ref([]);
const urunAramaMetni = ref('');
const urunAramaSonuclari = ref([]);

const yeniGiris = ref({
  urun_id: null,
  depo_id: null,
  miktar: 0,
});

const formModaliniAc = () => {
  // Formu sıfırla
  yeniGiris.value = { urun_id: null, depo_id: null, miktar: 0 };
  urunAramaMetni.value = '';
  urunAramaSonuclari.value = [];
  formModalGoster.value = true;
};

// Depoları ve Tedarikçileri çek
onMounted(async () => {
  const { data: depolarData } = await supabase.from('depolar').select('*');
  depolar.value = depolarData || [];
});

// Ürün arama mantığı
let debounceTimer;
const urunAra = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (urunAramaMetni.value.length < 2) { urunAramaSonuclari.value = []; return; }
    const { data } = await supabase.from('urunler').select('id, urun_kodu, aciklama').or(`urun_kodu.ilike.%${urunAramaMetni.value}%,aciklama.ilike.%${urunAramaMetni.value}%`).limit(10);
    urunAramaSonuclari.value = data || [];
  }, 300);
};

const urunSec = (urun) => {
  yeniGiris.value.urun_id = urun.id;
  urunAramaMetni.value = `${urun.urun_kodu} - ${urun.aciklama}`;
  urunAramaSonuclari.value = [];
};

// Kaydetme mantığı
const stokGirisiKaydet = async () => {
  const { urun_id, depo_id, miktar } = yeniGiris.value;

  if (!urun_id || !depo_id || !miktar || miktar <= 0) {
    alert('Lütfen tüm zorunlu alanları doldurun ve miktar 0\'dan büyük olsun.');
    return;
  }

  try {
    // Supabase'de `stok_arttir` adında bir fonksiyon çağırıyoruz.
    // Bu fonksiyonu bir sonraki adımda oluşturacağız.
    const { error } = await supabase.rpc('stok_arttir', {
      p_urun_id: urun_id,
      p_depo_id: depo_id,
      p_miktar: miktar
    });

    if (error) throw error;

    alert('Stok girişi başarıyla yapıldı!');
    formModalGoster.value = false;
    // İleride buraya geçmiş girişleri listeleyen fonksiyonu yeniden çağırma kodu gelecek.
  } catch (err) {
    console.error("Stok girişi hatası:", err);
    alert('Hata: ' + err.message);
  }
};
</script>
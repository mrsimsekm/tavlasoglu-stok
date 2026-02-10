<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-start mb-6">
      <h1 class="text-3xl font-bold text-gray-800 mt-2">Alacak Takibi</h1>
      
      <!-- TOPLAM ALACAK KARTI -->
      <div class="bg-white px-6 py-4 rounded-lg shadow-md border border-gray-200 min-w-[240px]">
        <p class="text-xs font-bold text-gray-500 uppercase tracking-wider border-b pb-2 mb-2">Toplam Açık Alacaklar</p>
        <div v-if="ozetBilgiler.length > 0" class="space-y-2">
          <div v-for="ozet in ozetBilgiler" :key="ozet.para_birimi" class="flex justify-between items-center">
            <span class="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{{ ozet.para_birimi }}</span>
            <span class="text-lg font-bold text-red-600">{{ formatParaBirimi(ozet.toplam_kalan, ozet.para_birimi) }}</span>
          </div>
        </div>
        <div v-else class="text-right">
          <span class="text-lg font-bold text-gray-400">0,00 ₺</span>
        </div>
      </div>
    </div>

    <!-- FİLTRELEME ALANI -->
    <div class="bg-white shadow-md rounded-lg p-4 mb-6 border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label-style">Müşteri Ara</label>
          <input v-model="filtreler.musteriArama" type="text" placeholder="Unvan veya Vergi No..." class="form-input">
        </div>
        <div>
          <label class="label-style">Durum</label>
          <select v-model="filtreler.durum" @change="filtrele" class="form-input">
            <option :value="null">Tümü</option>
            <option value="Açık">Açık</option>
            <option value="Kısmi Ödendi">Kısmi Ödendi</option>
            <option value="Kapandı">Kapandı</option>
          </select>
        </div>
      </div>
    </div>

    <!-- ALACAKLAR LİSTESİ -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <div class="overflow-x-auto">
        <table class="min-w-full leading-normal">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              
              <th @click="siralamayiDegistir('olusturulma_tarihi')" class="th-sortable group">
                <div class="flex items-center">Tarih <SiralamaIcon kolon="olusturulma_tarihi" :aktifKolon="sortBy" :yon="sortDirection" /></div>
              </th>
              
              <th @click="siralamayiDegistir('musteri_unvan')" class="th-sortable group">
                <div class="flex items-center">Müşteri <SiralamaIcon kolon="musteri_unvan" :aktifKolon="sortBy" :yon="sortDirection" /></div>
              </th>
              
              <th @click="siralamayiDegistir('is_emri_numara')" class="th-sortable group">
                <div class="flex items-center">İş Emri No <SiralamaIcon kolon="is_emri_numara" :aktifKolon="sortBy" :yon="sortDirection" /></div>
              </th>
              
              <th class="th-style text-right">Toplam Tutar</th>
              
              <th @click="siralamayiDegistir('kalan_tutar')" class="th-sortable group text-right">
                <div class="flex items-center justify-end">Kalan Tutar <SiralamaIcon kolon="kalan_tutar" :aktifKolon="sortBy" :yon="sortDirection" /></div>
              </th>
              
              <th class="th-style text-center">Durum</th>
              
              <th @click="siralamayiDegistir('vade_tarihi')" class="th-sortable group">
                <div class="flex items-center">Vade Tarihi <SiralamaIcon kolon="vade_tarihi" :aktifKolon="sortBy" :yon="sortDirection" /></div>
              </th>
              
              <th class="th-style text-center">İşlemler</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="8" class="text-center py-10 text-gray-500">
                 <div class="flex justify-center items-center"><span class="animate-spin mr-2">⟳</span> Yükleniyor...</div>
              </td>
            </tr>
            <tr v-else-if="alacaklar.length === 0">
              <td colspan="8" class="text-center py-10 text-gray-500 italic">Kayıt bulunamadı.</td>
            </tr>
            <tr v-else v-for="alacak in alacaklar" :key="alacak.id" class="hover:bg-gray-50 transition duration-150">
              <td class="td-style text-gray-600">{{ formatTarih(alacak.olusturulma_tarihi) }}</td>
              <td class="td-style">
                <p class="text-gray-900 font-semibold">{{ alacak.musteri_unvan || '-' }}</p>
                <p v-if="alacak.musteri_vergi_no" class="text-xs text-gray-500">VN: {{ alacak.musteri_vergi_no }}</p>
              </td>
              <td class="td-style">
                <p class="text-indigo-600 font-mono font-bold text-sm bg-indigo-50 px-2 py-1 rounded inline-block">
                  {{ alacak.is_emri_numara || 'N/A' }}
                </p>
              </td>
              <td class="td-style text-right">
                <p class="text-gray-900 font-medium">{{ formatParaBirimi(alacak.tutar, alacak.para_birimi) }}</p>
              </td>
              <td class="td-style text-right">
                <p :class="alacak.kalan_tutar > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'">
                  {{ formatParaBirimi(alacak.kalan_tutar, alacak.para_birimi) }}
                </p>
              </td>
              <td class="td-style text-center">
                <span :class="getDurumRenk(alacak.durum)">{{ alacak.durum }}</span>
              </td>
              <td class="td-style text-gray-600">{{ alacak.vade_tarihi ? formatTarih(alacak.vade_tarihi) : '-' }}</td>
              <td class="td-style text-center">
                <div class="flex item-center justify-center space-x-2">
                  <button 
                    v-if="alacak.durum !== 'Kapandı'" 
                    @click="tahsilatModaliniAc(alacak)" 
                    class="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 p-1.5 rounded transition"
                    title="Tahsilat Yap"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <button 
                    @click="odemeleriniGor(alacak)" 
                    class="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-1.5 rounded transition"
                    title="Ödeme Geçmişi"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sayfalama -->
      <div class="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div>
          <p class="text-sm text-gray-700">
            Toplam <span class="font-medium">{{ totalCount }}</span> kayıttan 
            <span class="font-medium">{{ (mevcutSayfa - 1) * limit + 1 }}</span> - 
            <span class="font-medium">{{ Math.min(mevcutSayfa * limit, totalCount) }}</span> arası gösteriliyor.
          </p>
        </div>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button @click="sayfaDegistir(mevcutSayfa - 1)" :disabled="mevcutSayfa === 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">Önceki</button>
          <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">Sayfa {{ mevcutSayfa }}</span>
          <button @click="sayfaDegistir(mevcutSayfa + 1)" :disabled="mevcutSayfa * limit >= totalCount" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">Sonraki</button>
        </nav>
      </div>
    </div>

    <!-- MODALLAR (Aynı kalıyor, sadece değişken bağlamaları düzeltildi) -->
    <!-- TAHSİLAT MODAL -->
    <BaseModal :show="tahsilatModalGoster" @close="tahsilatModalGoster = false">
      <template #header>Alacak Tahsilatı</template>
      <template #body>
        <div v-if="aktifAlacak" class="space-y-4">
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p class="text-sm text-gray-600">Müşteri</p>
            <p class="text-lg font-bold text-gray-800">{{ aktifAlacak.musteri_unvan }}</p>
            <div class="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500 uppercase">Toplam Tutar</p>
                <p class="text-md font-semibold text-gray-700">{{ formatParaBirimi(aktifAlacak.tutar, aktifAlacak.para_birimi) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 uppercase">Kalan Bakiye</p>
                <p class="text-lg font-bold text-red-600">{{ formatParaBirimi(aktifAlacak.kalan_tutar, aktifAlacak.para_birimi) }}</p>
              </div>
            </div>
          </div>
          <div>
            <label class="label-style">Tahsilat Tutarı (*)</label>
            <div class="relative mt-1">
              <input v-model.number="tahsilatForm.tutar" type="number" step="0.01" :max="aktifAlacak.kalan_tutar" class="form-input pr-12" placeholder="0.00">
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span class="text-gray-500 font-bold">{{ aktifAlacak.para_birimi || 'TRY' }}</span>
              </div>
            </div>
          </div>
          <div>
            <label class="label-style">Ödeme Yöntemi (*)</label>
            <select v-model="tahsilatForm.yontem" class="form-input">
              <option value="">Seçiniz</option>
              <option value="Nakit">Nakit</option>
              <option value="Kredi Kartı">Kredi Kartı</option>
              <option value="Havale/EFT">Havale/EFT</option>
              <option value="Çek">Çek</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>
          <div>
            <label class="label-style">Notlar</label>
            <textarea v-model="tahsilatForm.notlar" rows="3" class="form-input" placeholder="İsteğe bağlı notlar..."></textarea>
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="tahsilatModalGoster = false" class="btn-secondary">İptal</button>
        <button @click="tahsilatYap" :disabled="tahsilatYapiliyor" class="btn-primary ml-2">
          {{ tahsilatYapiliyor ? 'İşleniyor...' : 'Tahsil Et' }}
        </button>
      </template>
    </BaseModal>

    <!-- ÖDEME GEÇMİŞİ MODAL -->
    <BaseModal :show="odemelerModalGoster" @close="odemelerModalGoster = false">
      <template #header>Ödeme Geçmişi</template>
      <template #body>
        <div v-if="aktifAlacak" class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p class="text-sm text-gray-600">Müşteri</p>
            <p class="text-lg font-bold text-gray-800">{{ aktifAlacak.musteri_unvan }}</p>
            <p class="text-xs text-gray-500 mt-1">İş Emri: {{ aktifAlacak.is_emri_numara }}</p>
          </div>
          <div v-if="loadingOdemeler" class="text-center py-4 text-gray-500">Yükleniyor...</div>
          <div v-else-if="odemeler.length === 0" class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">Henüz ödeme kaydı bulunmuyor.</div>
          <div v-else class="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            <div v-for="odeme in odemeler" :key="odeme.id" class="border rounded-lg p-3 hover:bg-gray-50 transition bg-white">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-bold text-green-600 text-lg">{{ formatParaBirimi(odeme.tutar, aktifAlacak.para_birimi) }}</p>
                  <p class="text-sm font-medium text-gray-700">{{ odeme.yontem }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ formatTarih(odeme.olusturulma_tarihi) }}</p>
                </div>
                <div class="text-right max-w-[50%]">
                  <p v-if="odeme.notlar" class="text-xs text-gray-600 italic bg-gray-100 p-1 rounded">{{ odeme.notlar }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="odemelerModalGoster = false" class="btn-secondary w-full sm:w-auto">Kapat</button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.th-style { @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider; }
.th-sortable { @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors select-none; }
.td-style { @apply px-5 py-4 border-b border-gray-200 bg-white text-sm; }
.label-style { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input { @apply block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors; }
.btn-primary { @apply bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition disabled:bg-gray-400 disabled:cursor-not-allowed; }
.btn-secondary { @apply bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 rounded-lg shadow-sm transition; }
</style>

<script setup>
import { ref, onMounted, defineAsyncComponent, watch } from 'vue';
import { supabase } from '../supabase.js';
import { useUserStore } from '../stores/userStore.js';
import BaseModal from '../components/BaseModal.vue';
import { useLoading } from '../composables/useLoading.js';

// --- COMPONENTS ---
const SiralamaIcon = defineAsyncComponent(() => 
  Promise.resolve({
    props: ['kolon', 'aktifKolon', 'yon'],
    template: `
      <div class="inline-block w-4 h-4 ml-1 text-gray-400 group-hover:text-gray-600">
          <svg v-if="aktifKolon === kolon && yon === 'asc'" class="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
          <svg v-else-if="aktifKolon === kolon && yon === 'desc'" class="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          <svg v-else class="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
      </div>`
  })
);

// --- COMPOSABLES & STORES ---
const { isLoading: tahsilatYapiliyor, withLoading } = useLoading();
const { isLoading: loadingOdemeler, withLoading: odemelerWithLoading } = useLoading();
const userStore = useUserStore();

// --- STATE ---
const loading = ref(false);
const alacaklar = ref([]);
const ozetBilgiler = ref([]); // { para_birimi: 'TRY', toplam_kalan: 100 }
const odemeler = ref([]);
const totalCount = ref(0);

// Filtreler
const filtreler = ref({
  musteriArama: '',
  durum: null
});
let aramaDebounce;

// Sayfalama & Sıralama
const mevcutSayfa = ref(1);
const limit = 10;
const sortBy = ref('olusturulma_tarihi');
const sortDirection = ref('desc');

// Modallar
const tahsilatModalGoster = ref(false);
const odemelerModalGoster = ref(false);
const aktifAlacak = ref(null);
const tahsilatForm = ref({ tutar: 0, yontem: '', notlar: '' });

// --- ACTIONS ---
const filtrele = () => {
  mevcutSayfa.value = 1;
  verileriGetir();
};

const sayfaDegistir = (yeniSayfa) => {
  if (yeniSayfa < 1 || (yeniSayfa - 1) * limit >= totalCount.value) return;
  mevcutSayfa.value = yeniSayfa;
  verileriListesiniGuncelle();
};

const siralamayiDegistir = (kolonKey) => {
  if (sortBy.value === kolonKey) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = kolonKey;
    sortDirection.value = 'desc';
  }
  mevcutSayfa.value = 1;
  verileriListesiniGuncelle();
};

// --- DATA FETCHING (Parallel RPC Calls) ---
const verileriGetir = async () => {
  loading.value = true;
  await Promise.all([verileriListesiniGuncelle(), ozetiGuncelle()]);
  loading.value = false;
};

const verileriListesiniGuncelle = async () => {
  try {
    const offset = (mevcutSayfa.value - 1) * limit;
    const { data, error } = await supabase.rpc('get_alacaklar_paginated', {
      p_limit: limit,
      p_offset: offset,
      p_musteri_arama: filtreler.value.musteriArama || null,
      p_durum: filtreler.value.durum || null,
      p_sort_by: sortBy.value,
      p_sort_direction: sortDirection.value
    });

    if (error) throw error;
    alacaklar.value = data || [];
    totalCount.value = data && data.length > 0 ? data[0].total_count : 0;
  } catch (err) {
    console.error("Liste çekme hatası:", err);
  }
};

const ozetiGuncelle = async () => {
  try {
    const { data, error } = await supabase.rpc('get_alacaklar_ozet', {
      p_musteri_arama: filtreler.value.musteriArama || null,
      p_durum: filtreler.value.durum || null
    });
    if (error) throw error;
    ozetBilgiler.value = data || [];
  } catch (err) {
    console.error("Özet çekme hatası:", err);
  }
};

// Arama için Debounce
watch(() => filtreler.value.musteriArama, () => {
  clearTimeout(aramaDebounce);
  aramaDebounce = setTimeout(() => {
    filtrele();
  }, 500);
});

// --- TAHSİLAT & ÖDEME ---
const tahsilatModaliniAc = (alacak) => {
  aktifAlacak.value = alacak;
  tahsilatForm.value = { tutar: alacak.kalan_tutar, yontem: '', notlar: '' };
  tahsilatModalGoster.value = true;
};

const tahsilatYap = async () => {
  if (!tahsilatForm.value.tutar || tahsilatForm.value.tutar <= 0) return alert('Geçerli bir tutar giriniz.');
  if (!tahsilatForm.value.yontem) return alert('Ödeme yöntemi seçiniz.');
  if (tahsilatForm.value.tutar > aktifAlacak.value.kalan_tutar) return alert('Tutar bakiyeden fazla olamaz.');

  await withLoading(async () => {
    const { data, error } = await supabase.rpc('alacak_tahsil_et', {
      p_alacak_id: aktifAlacak.value.id,
      p_tutar: tahsilatForm.value.tutar,
      p_yontem: tahsilatForm.value.yontem,
      p_notlar: tahsilatForm.value.notlar || null,
      p_kullanici_id: userStore.user?.id || null
    });

    if (error) throw error;
    if (data && !data.success) throw new Error(data.message || 'Hata');

    alert('Tahsilat kaydedildi.');
    tahsilatModalGoster.value = false;
    // Verileri yenile
    await verileriGetir();
  });
};

const odemeleriniGor = async (alacak) => {
  aktifAlacak.value = alacak;
  odemelerModalGoster.value = true;
  await odemelerWithLoading(async () => {
    const { data } = await supabase.from('alacak_odemeleri').select('*').eq('alacak_id', alacak.id).order('olusturulma_tarihi', { ascending: false });
    odemeler.value = data || [];
  });
};

// --- HELPERS ---
const getDurumRenk = (durum) => {
  const renkler = {
    'Açık': 'px-2 py-1 text-xs font-bold rounded bg-red-100 text-red-700 border border-red-200',
    'Kısmi Ödendi': 'px-2 py-1 text-xs font-bold rounded bg-yellow-100 text-yellow-700 border border-yellow-200',
    'Kapandı': 'px-2 py-1 text-xs font-bold rounded bg-green-100 text-green-700 border border-green-200'
  };
  return renkler[durum] || '';
};

const formatTarih = (t) => t ? new Date(t).toLocaleDateString('tr-TR') : '-';
const formatParaBirimi = (val, currency = 'TRY') => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency || 'TRY' }).format(val || 0);

onMounted(verileriGetir);
</script>
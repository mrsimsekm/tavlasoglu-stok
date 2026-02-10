<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <h1 class="text-3xl font-bold text-gray-800">İş Emirleri</h1>
      
      <div class="flex items-center space-x-3">
        <button 
          @click="silmeModuAktif = !silmeModuAktif"
          class="flex items-center px-4 py-2 rounded-lg border transition-all duration-300 shadow-sm text-sm font-semibold"
          :class="silmeModuAktif 
            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 ring-2 ring-red-500 ring-opacity-50' 
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'"
        >
          <svg v-if="!silmeModuAktif" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" /></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" clip-rule="evenodd" /></svg>
          {{ silmeModuAktif ? 'Düzenleme Modunu Kapat' : 'Kayıtları Yönet' }}
        </button>

        <RouterLink 
          to="/app/is-emirleri/yeni" 
          class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" /></svg>
          Yeni İş Emri
        </RouterLink>
      </div>
    </div>

    <!-- FİLTRELEME VE ARAMA BÖLÜMÜ -->
    <div class="mb-6 p-4 bg-white rounded-lg shadow-md border border-gray-200 space-y-4">
      <!-- Arama Kutusu -->
      <div>
        <label for="arama" class="text-sm font-medium text-gray-700">Ara (Müşteri Unvanı, İş Emri No)</label>
        <div class="relative mt-1">
          <input 
            id="arama"
            type="text" 
            placeholder="Aramak için en az 3 karakter girin..." 
            v-model="aramaMetni" 
            class="w-full p-2 pl-10 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-4 pt-4 border-t border-gray-200">
        <!-- Ana Durum Filtreleri -->
        <div class="md:col-span-1">
          <label class="text-sm font-medium text-gray-700 block mb-2">İş Emri Durumu</label>
          <div class="flex flex-col space-y-2">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" v-model="filtreler.durum.acik" @change="filtrele" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
              <span class="text-sm text-gray-800">Açık</span>
            </label>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" v-model="filtreler.durum.kapali" @change="filtrele" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
              <span class="text-sm text-gray-800">Kapalı</span>
            </label>
          </div>
        </div>

        <!-- Alt Kategori Filtreleri -->
        <div class="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4">
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-2">Fatura Durumu</label>
            <div class="flex flex-col space-y-2">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" v-model="filtreler.fatura.kesilmemis" @change="filtrele" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <span class="text-sm text-gray-800">Kesilmemiş</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" v-model="filtreler.fatura.kesilmis" @change="filtrele" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <span class="text-sm text-gray-800">Kesilmiş</span>
              </label>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-2">Tahsilat Durumu</label>
            <div class="flex flex-col space-y-2">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" v-model="filtreler.tahsilat.eksik" @change="filtrele" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <span class="text-sm text-gray-800">Eksik</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" v-model="filtreler.tahsilat.tamam" @change="filtrele" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <span class="text-sm text-gray-800">Tamamlanmış</span>
              </label>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-2">Maliyet Durumu</label>
            <div class="flex flex-col space-y-2">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" v-model="filtreler.maliyet.girilmemis" @change="filtrele" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <span class="text-sm text-gray-800">Girilmemiş</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" v-model="filtreler.maliyet.girilmis" @change="filtrele" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <span class="text-sm text-gray-800">Girilmiş</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <div class="overflow-x-auto">
        <table class="min-w-full leading-normal">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th @click="siralamayiDegistir('numara')" class="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group">
                  <SiralamaIcon kolon="numara" :aktifKolon="sortBy" :yon="sortDirection" />
                  <span>İş Emri No</span>
              </th>
              <th @click="siralamayiDegistir('siparis_tarihi')" class="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group">
                <SiralamaIcon kolon="siparis_tarihi" :aktifKolon="sortBy" :yon="sortDirection" />
                <span>Sipariş Tarihi</span>
              </th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Müşteri Unvanı</th>
              <th @click="siralamayiDegistir('fatura_no')" class="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group">
                <SiralamaIcon kolon="fatura_no" :aktifKolon="sortBy" :yon="sortDirection" />
                <span>Fatura No</span>
              </th>
              <th @click="siralamayiDegistir('toplam_tutar')" class="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group">
                <SiralamaIcon kolon="toplam_tutar" :aktifKolon="sortBy" :yon="sortDirection" />
                <span>Toplam Tutar</span>
              </th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Kalan Bakiye</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Durum</th>
              <th class="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="8" class="text-center py-10 text-gray-500">
                <div class="flex flex-col items-center justify-center">
                  <svg class="animate-spin h-8 w-8 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Veriler yükleniyor...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="isEmirleri.length === 0">
              <td colspan="8" class="text-center py-10 text-gray-500 italic">Filtre kriterlerine uygun iş emri bulunamadı.</td>
            </tr>
            <tr v-else v-for="isEmri in isEmirleri" :key="isEmri.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-5 py-4 text-sm">
                <div class="flex items-center space-x-2">
                  <span class="font-mono font-semibold text-indigo-600">{{ isEmri.numara || 'N/A' }}</span>
                  <transition name="fade">
                    <button v-if="silmeModuAktif" @click="numaraDuzenleModalAc(isEmri)" class="text-gray-400 hover:text-indigo-600 p-1 rounded-full" title="Numarayı Düzenle">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </transition>
                </div>
              </td>
              <td class="px-5 py-4 text-sm">{{ formatTarih(isEmri.siparis_tarihi) }}</td>
              <td class="px-5 py-4 text-sm font-medium text-gray-800">{{ isEmri.musteri_unvani || 'Müşteri Bulunamadı' }}</td>
              <td class="px-5 py-4 text-sm font-mono">{{ isEmri.fatura_no || '-' }}</td>
              <td class="px-5 py-4 text-sm text-right font-semibold">{{ formatPara(isEmri.toplam_tutar, isEmri.para_birimi) }}</td>
              <td class="px-5 py-4 text-sm text-right font-semibold" :class="isEmri.kalan_bakiye > 0 ? 'text-red-600' : 'text-green-600'">{{ formatPara(isEmri.kalan_bakiye, isEmri.para_birimi) }}</td>
              <td class="px-5 py-4 text-sm">
                <span class="px-2 py-1 font-semibold leading-tight rounded-full text-xs" :class="getDurumRenk(isEmri.durum)">{{ isEmri.durum }}</span>
              </td>
              <td class="px-5 py-4 text-sm text-center">
                <div class="flex items-center justify-center space-x-3">
                  <RouterLink :to="`/app/is-emirleri/${isEmri.id}`" class="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline" title="Görüntüle">Görüntüle</RouterLink>
                  <transition name="fade">
                    <button v-if="silmeModuAktif" @click="isEmriSil(isEmri.id, isEmri.numara)" class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors" title="Sil">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                    </button>
                  </transition>
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
            Toplam <span class="font-medium">{{ toplamKayitSayisi }}</span> kayıttan 
            <span class="font-medium">{{ (mevcutSayfa - 1) * sayfaBasinaKayit + 1 }}</span> - 
            <span class="font-medium">{{ Math.min(mevcutSayfa * sayfaBasinaKayit, toplamKayitSayisi) }}</span> arası gösteriliyor.
          </p>
        </div>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button @click="sayfaDegistir(mevcutSayfa - 1)" :disabled="mevcutSayfa === 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">Önceki</button>
          <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">Sayfa {{ mevcutSayfa }}</span>
          <button @click="sayfaDegistir(mevcutSayfa + 1)" :disabled="mevcutSayfa * sayfaBasinaKayit >= toplamKayitSayisi" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">Sonraki</button>
        </nav>
      </div>
    </div>

    <!-- NUMARA DÜZENLEME MODALI -->
    <NumaraDuzenleModal
      v-if="seciliKayit"
      v-model="modalAcik"
      :kayit-id="seciliKayit.id"
      tablo-adi="is_emirleri"
      alan-adi="numara"
      :mevcut-numara="seciliKayit.numara"
      baslik="İş Emri Numarasını Düzenle"
      @guncellendi="verileriGetir"
    />

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.9); }
</style>

<script setup>
import { ref, onMounted, defineAsyncComponent, reactive, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { supabase } from '../supabase.js';
import NumaraDuzenleModal from '../components/NumaraDuzenleModal.vue';

const SiralamaIcon = defineAsyncComponent(() => 
  Promise.resolve({
    props: ['kolon', 'aktifKolon', 'yon'],
    template: `
      <div class="inline-flex items-center">
        <div class="inline-block w-4 h-4 mr-1 text-gray-400 group-hover:text-gray-600">
          <svg v-if="aktifKolon === kolon && yon === 'asc'" class="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
          <svg v-else-if="aktifKolon === kolon && yon === 'desc'" class="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>`
  })
);

// --- STATE ---
const isEmirleri = ref([]);
const loading = ref(true);
const aramaMetni = ref('');
const silmeModuAktif = ref(false);
let aramaDebounceTimer;

// MODAL STATE
const modalAcik = ref(false);
const seciliKayit = ref(null);

// Sayfalama & Sıralama
const mevcutSayfa = ref(1);
const sayfaBasinaKayit = 10;
const toplamKayitSayisi = ref(0);
const sortBy = ref('numara');
const sortDirection = ref('desc');

const filtreler = reactive({
  durum: { acik: true, kapali: false },
  fatura: { kesilmemis: false, kesilmis: false },
  tahsilat: { eksik: false, tamam: false },
  maliyet: { girilmemis: false, girilmis: false }
});

// --- LIFECYCLE & WATCHERS ---
onMounted(() => {
  verileriGetir();
});

watch(aramaMetni, () => {
  clearTimeout(aramaDebounceTimer);
  aramaDebounceTimer = setTimeout(() => {
    filtrele();
  }, 500);
});

// --- DATA FETCHING (RPC) ---
const verileriGetir = async () => {
  loading.value = true;
  try {
    const realOffset = (mevcutSayfa.value - 1) * sayfaBasinaKayit;
    const params = {
      p_limit: sayfaBasinaKayit, p_offset: realOffset, p_arama_metni: aramaMetni.value.length >= 3 ? aramaMetni.value : null,
      p_sort_by: sortBy.value, p_sort_direction: sortDirection.value, p_durum_acik: filtreler.durum.acik,
      p_durum_kapali: filtreler.durum.kapali, p_fatura_kesilmemis: filtreler.fatura.kesilmemis,
      p_fatura_kesilmis: filtreler.fatura.kesilmis, p_tahsilat_eksik: filtreler.tahsilat.eksik,
      p_tahsilat_tamam: filtreler.tahsilat.tamam, p_maliyet_girilmemis: filtreler.maliyet.girilmemis,
      p_maliyet_girilmis: filtreler.maliyet.girilmis
    };
    const { data, error } = await supabase.rpc('get_is_emirleri_paginated', params);
    if (error) throw error;
    isEmirleri.value = data || [];
    toplamKayitSayisi.value = data && data.length > 0 ? data[0].total_count : 0;
  } catch (error) {
    console.error('İş emirleri çekilirken hata oluştu:', error.message);
    isEmirleri.value = [];
    toplamKayitSayisi.value = 0;
  } finally {
    loading.value = false;
  }
};

// --- SİLME İŞLEMİ ---
const isEmriSil = async (id, numara) => {
  if (!confirm(`${numara} numaralı iş emrini ve buna bağlı tüm kayıtları (Stok, Tahsilat, Ödemeler vb.) silmek istediğinize emin misiniz?\n\nBU İŞLEM GERİ ALINAMAZ!`)) {
    return;
  }
  loading.value = true;
  try {
    const { error } = await supabase.rpc('is_emri_sil', { p_is_emri_id: id });
    if (error) throw error;
    alert('İş emri başarıyla silindi.');
    verileriGetir();
  } catch (err) {
    alert('Silme işlemi başarısız: ' + err.message);
    loading.value = false;
  }
};

// --- MODAL İŞLEMLERİ ---
const numaraDuzenleModalAc = (isEmri) => {
  seciliKayit.value = isEmri;
  modalAcik.value = true;
};

// --- UI ACTIONS ---
const filtrele = () => { mevcutSayfa.value = 1; verileriGetir(); };
const sayfaDegistir = (yeniSayfa) => { if (yeniSayfa < 1 || (yeniSayfa - 1) * sayfaBasinaKayit >= toplamKayitSayisi.value) { return; } mevcutSayfa.value = yeniSayfa; verileriGetir(); };
const siralamayiDegistir = (kolonKey) => { if (sortBy.value === kolonKey) { sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'; } else { sortBy.value = kolonKey; sortDirection.value = 'desc'; } mevcutSayfa.value = 1; verileriGetir(); };

// --- HELPERS ---
const formatTarih = (tarih) => { if (!tarih) return '-'; return new Date(tarih).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
const formatPara = (tutar, currency = 'TRY') => { if (tutar === null || tutar === undefined) tutar = 0; return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency || 'TRY' }).format(tutar); };
const getDurumRenk = (durum) => { const renkler = { 'Açık': 'bg-green-100 text-green-800', 'Kapalı': 'bg-gray-200 text-gray-700' }; return renkler[durum] || 'bg-yellow-100 text-yellow-700'; };
</script>
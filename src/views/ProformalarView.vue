<template>
  <div class="container mx-auto px-4 py-6">
    <!-- HEADER -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <h1 class="text-3xl font-bold text-gray-800">Proforma Faturalar</h1>

      <!-- AKSİYON BUTONLARI GRUBU -->
      <div class="flex items-center space-x-3">
        
        <!-- 1. GÜVENLİK KİLİDİ BUTONU -->
        <button 
          @click="silmeModuAktif = !silmeModuAktif"
          class="flex items-center px-4 py-2 rounded-lg border transition-all duration-300 shadow-sm text-sm font-semibold"
          :class="silmeModuAktif 
            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 ring-2 ring-red-500 ring-opacity-50' 
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'"
        >
          <svg v-if="!silmeModuAktif" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" /></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" clip-rule="evenodd" /></svg>
          {{ silmeModuAktif ? 'Yönetim Modunu Kapat' : 'Kayıtları Yönet' }}
        </button>

        <!-- 2. YENİ PROFORMA BUTONU -->
        <RouterLink to="/app/proformalar/yeni" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-150 flex items-center text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" /></svg>
          Yeni Proforma
        </RouterLink>
      </div>
    </div>

    <!-- FİLTRE & ARAMA PANELİ --> 
    <div class="bg-white shadow rounded-lg p-4 mb-6 border border-gray-200">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Sol Taraf: Metin ve Durum Arama -->
        <div class="lg:col-span-5 grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Arama</label>
            <div class="relative">
              <input v-model="aramaMetni" type="text" placeholder="No veya Müşteri Ara..." class="form-input pl-8">
              <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <div class="col-span-2">
            <label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Durum</label>
            <select v-model="durumFiltresi" @change="filtrele" class="form-input">
              <option value="Tümü">Tüm Durumlar</option>
              <option value="Taslak">Taslak</option>
              <option value="Gönderildi">Gönderildi</option>
              <option value="Dönüştürüldü">İş Emrine Dönüştü</option>
            </select>
          </div>
        </div>

        <!-- Sağ Taraf: Kategori Filtreleme -->
        <div class="lg:col-span-7 border-t lg:border-t-0 lg:border-l border-gray-200 lg:pl-6 pt-4 lg:pt-0">
          <label class="block text-xs font-bold text-gray-500 mb-2 uppercase">Kategoriye Göre Filtrele</label>
          <div class="flex flex-wrap gap-2">
            <label 
              v-for="kat in kategoriListesi" 
              :key="kat" 
              class="flex items-center space-x-2 cursor-pointer bg-gray-50 px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-100 transition select-none"
              :class="{'bg-indigo-50 border-indigo-200 text-indigo-700': secilenKategoriler.includes(kat)}"
            >
              <input type="checkbox" :value="kat" v-model="secilenKategoriler" @change="filtrele" class="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300">
              <span class="text-xs font-medium">{{ kat }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- LİSTE TABLOSU -->
    <div class="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
      <div class="overflow-x-auto">
        <table class="min-w-full leading-normal">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th @click="siralamayiDegistir('proforma_no')" class="th-sortable group"><div class="flex items-center">No<SiralamaIcon kolon="proforma_no" :aktifKolon="sortBy" :yon="sortDirection" /></div></th>
              <th @click="siralamayiDegistir('musteri_unvani')" class="th-sortable group"><div class="flex items-center">Müşteri<SiralamaIcon kolon="musteri_unvani" :aktifKolon="sortBy" :yon="sortDirection" /></div></th>
              <th @click="siralamayiDegistir('olusturma_tarihi')" class="th-sortable group"><div class="flex items-center">Oluşturma Tarihi<SiralamaIcon kolon="olusturma_tarihi" :aktifKolon="sortBy" :yon="sortDirection" /></div></th>
              <th class="th-style">Kategoriler</th>
              <th class="th-style">Geçerlilik</th>
              <th @click="siralamayiDegistir('toplam_tutar')" class="th-sortable group text-right"><div class="flex items-center justify-end">Toplam Tutar<SiralamaIcon kolon="toplam_tutar" :aktifKolon="sortBy" :yon="sortDirection" /></div></th>
              <th class="th-style text-center">Durum</th>
              <th class="th-style text-right w-[180px]">İşlemler</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="loading"><td colspan="8" class="text-center py-10 text-gray-500"><div class="flex flex-col items-center justify-center"><svg class="animate-spin h-8 w-8 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Veriler yükleniyor...</span></div></td></tr>
            <tr v-else-if="proformalar.length === 0"><td colspan="8" class="text-center py-10 text-gray-500 italic">Kriterlere uygun kayıt bulunamadı.</td></tr>
            <tr v-else v-for="proforma in proformalar" :key="proforma.id" class="hover:bg-gray-50 transition group">
              <td class="td-style">
                 <div class="flex items-center space-x-2">
                   <span class="font-mono font-bold text-indigo-600">{{ proforma.proforma_no }}</span>
                   <transition name="fade">
                     <button v-if="silmeModuAktif" @click="numaraDuzenleModalAc(proforma)" class="text-gray-400 hover:text-indigo-600 p-1 rounded-full" title="Numarayı Düzenle">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                     </button>
                   </transition>
                 </div>
              </td>
              <td class="td-style font-medium text-gray-900">{{ proforma.musteri_unvani || '-' }}</td>
              <td class="td-style text-gray-600">{{ formatTarih(proforma.olusturma_tarihi) }}</td>
              <td class="td-style"><div class="flex flex-wrap gap-1 max-w-[200px]"><span v-for="k in (proforma.kategoriler || [])" :key="k" class="text-[10px] leading-tight px-2 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-md">{{ k }}</span><span v-if="!proforma.kategoriler || proforma.kategoriler.length === 0" class="text-xs text-gray-300 italic">-</span></div></td>
              <td class="td-style"><div class="flex flex-col"><span class="text-gray-600">{{ formatTarih(proforma.gecerlilik_tarihi) }}</span><span v-if="suresiGectiMi(proforma)" class="mt-1 text-[10px] text-red-600 font-bold bg-red-50 px-1 rounded w-fit border border-red-100">Süresi Doldu</span></div></td>
              <td class="td-style text-right font-bold text-gray-800">{{ formatPara(proforma.toplam_tutar, proforma.para_birimi) }}</td>
              <td class="td-style text-center"><span :class="getDurumBadge(proforma.durum)">{{ proforma.durum }}</span></td>
              <td class="td-style text-right"><div class="flex justify-end items-center space-x-2">
                <button @click="router.push(`/app/proformalar/${proforma.id}`)" class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition" title="Detay & Düzenle"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                <button @click="yazdirProforma(proforma)" class="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition" title="Hızlı Yazdır"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg></button>
                <transition name="fade">
                  <button v-if="silmeModuAktif" @click="proformaSil(proforma.id, proforma.proforma_no)" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors flex items-center justify-center shadow-sm" title="Kalıcı Olarak Sil"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
                </transition>
                <button v-if="proforma.durum !== 'Dönüştürüldü' && !silmeModuAktif" @click="detayaGitVeDonustur(proforma)" class="ml-2 text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-md font-medium transition flex items-center" title="İş Emrine Dönüştür"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>İş Emri</button>
                <span v-if="proforma.durum === 'Dönüştürüldü' && !silmeModuAktif" class="ml-2 text-[10px] uppercase font-bold tracking-wider text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100 select-none cursor-default">Dönüştü</span>
              </div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sayfalama -->
      <div class="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div><p class="text-sm text-gray-700">Toplam <span class="font-medium">{{ totalCount }}</span> kayıttan <span class="font-medium">{{ (mevcutSayfa - 1) * limit + 1 }}</span> - <span class="font-medium">{{ Math.min(mevcutSayfa * limit, totalCount) }}</span> arası gösteriliyor.</p></div>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button @click="sayfaDegistir(mevcutSayfa - 1)" :disabled="mevcutSayfa === 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Önceki</button>
          <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">Sayfa {{ mevcutSayfa }}</span>
          <button @click="sayfaDegistir(mevcutSayfa + 1)" :disabled="mevcutSayfa * limit >= totalCount" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Sonraki</button>
        </nav>
      </div>
    </div>

    <!-- NUMARA DÜZENLEME MODALI -->
    <NumaraDuzenleModal
      v-if="seciliKayit"
      v-model="modalAcik"
      :kayit-id="seciliKayit.id"
      tablo-adi="proformalar"
      alan-adi="proforma_no"
      :mevcut-numara="seciliKayit.proforma_no"
      baslik="Proforma Numarasını Düzenle"
      @guncellendi="verileriGetir"
    />
  </div>
</template>

<style scoped>
.th-style { @apply px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider; }
.th-sortable { @apply px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none; }
.td-style { @apply px-5 py-4 bg-white text-sm align-middle; }
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.9); }
</style>

<script setup>
import { ref, onMounted, defineAsyncComponent, watch } from 'vue';
import { supabase } from '../supabase.js';
import { useRouter } from 'vue-router';
import NumaraDuzenleModal from '../components/NumaraDuzenleModal.vue';

const router = useRouter();

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

// --- STATE ---
const loading = ref(false);
const proformalar = ref([]);
const totalCount = ref(0);
const silmeModuAktif = ref(false);

// MODAL STATE
const modalAcik = ref(false);
const seciliKayit = ref(null);

// Filtreler
const aramaMetni = ref('');
const durumFiltresi = ref('Tümü');
const secilenKategoriler = ref([]);

// Sayfalama & Sıralama
const mevcutSayfa = ref(1);
const limit = 10;
const sortBy = ref('olusturma_tarihi');
const sortDirection = ref('desc');

const kategoriListesi = ['KLİMA', 'VRF', 'HAVA PERDESİ', 'SOĞUK ODA', 'DX', 'ISI POMPASI', 'İŞÇİLİK', 'YEDEK PARÇA'];
let aramaDebounce;

// --- DATA FETCHING (RPC) ---
const verileriGetir = async () => {
  try {
    loading.value = true;
    const offset = (mevcutSayfa.value - 1) * limit;

    const { data, error } = await supabase.rpc('get_proformalar_paginated', {
      p_limit: limit,
      p_offset: offset,
      p_arama_metni: aramaMetni.value || null,
      p_durum: durumFiltresi.value,
      p_kategoriler: secilenKategoriler.value.length > 0 ? secilenKategoriler.value : null,
      p_sort_by: sortBy.value,
      p_sort_direction: sortDirection.value
    });

    if (error) throw error;
    
    proformalar.value = data || [];
    totalCount.value = data && data.length > 0 ? data[0].total_count : 0;

  } catch (err) {
    console.error("Veri çekme hatası:", err);
    alert("Hata: " + err.message);
  } finally {
    loading.value = false;
  }
};

// --- SİLME FONKSİYONU ---
const proformaSil = async (id, proformaNo) => {
  if (!confirm(`${proformaNo} numaralı proformayı ve bağlı kalemleri kalıcı olarak silmek istediğinize emin misiniz?\n\nBU İŞLEM GERİ ALINAMAZ!`)) {
    return;
  }
  
  loading.value = true;
  try {
    const { error } = await supabase.rpc('proforma_sil', { p_proforma_id: id });
    if (error) throw error;
    
    alert('Proforma başarıyla silindi.');
    await verileriGetir(); // Listeyi yenile
  } catch (err) {
    alert('Silme işlemi başarısız: ' + err.message);
    loading.value = false;
  }
};

// --- MODAL İŞLEMLERİ ---
const numaraDuzenleModalAc = (proforma) => {
  seciliKayit.value = proforma;
  modalAcik.value = true;
};

// --- ACTIONS & WATCHERS ---
const filtrele = () => { mevcutSayfa.value = 1; verileriGetir(); };
const sayfaDegistir = (yeniSayfa) => { if (yeniSayfa < 1 || (yeniSayfa - 1) * limit >= totalCount.value) return; mevcutSayfa.value = yeniSayfa; verileriGetir(); };
const siralamayiDegistir = (kolonKey) => { if (sortBy.value === kolonKey) { sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'; } else { sortBy.value = kolonKey; sortDirection.value = 'desc'; } mevcutSayfa.value = 1; verileriGetir(); };
watch(aramaMetni, () => { clearTimeout(aramaDebounce); aramaDebounce = setTimeout(filtrele, 500); });

// --- HELPER FUNCTIONS ---
const suresiGectiMi = (proforma) => { if (proforma.durum === 'Dönüştürüldü') return false; const bugun = new Date().toISOString().split('T')[0]; return proforma.gecerlilik_tarihi < bugun; };
const getDurumBadge = (durum) => { if (durum === 'Taslak') return 'px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-600'; if (durum === 'Gönderildi') return 'px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-600'; if (durum === 'Dönüştürüldü') return 'px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-600'; return 'px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800'; };
const formatTarih = (t) => t ? new Date(t).toLocaleDateString('tr-TR') : '-';
const formatPara = (val, currency = 'TRY') => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency || 'TRY' }).format(val || 0);
const detayaGitVeDonustur = (proforma) => router.push({ path: `/app/proformalar/${proforma.id}`, query: { otomatikDonustur: 'true' } });

// --- YAZDIRMA ---
const yazdirProforma = async (proforma) => {
  try {
    const { data: kalemler, error } = await supabase.from('proforma_kalemleri').select(`*, depolar(ad), tedarikciler(ad), anlasmalar(ad)`).eq('proforma_id', proforma.id);
    if (error) throw error;
    
    let musteri = {};
    const { data: fullProforma, error: proformaError } = await supabase.from('proformalar').select('*, musteriler(*)').eq('id', proforma.id).single();
    if(proformaError) throw proformaError;
    musteri = fullProforma.musteriler || {};
    

    const logoUrl = window.location.origin + '/logo11.png';
    const tarih = formatTarih(proforma.olusturma_tarihi);
    const gecerlilik = formatTarih(proforma.gecerlilik_tarihi);
    const pb = proforma.para_birimi || 'TRY';
    const kdvDahil = proforma.kdv_dahil; 

    const kalemlerHTML = kalemler.map((kalem, index) => {
      let tutar = kalem.miktar * kalem.birim_fiyat;
      if (!kdvDahil) tutar = tutar * 1.2;
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${index + 1}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${kalem.aciklama}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${kalem.miktar}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(kalem.birim_fiyat, pb)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(tutar, pb)}</td>
        </tr>
      `;
    }).join('');

    const genelToplam = proforma.toplam_tutar;
    const araToplam = genelToplam / 1.2;
    const toplamKDV = genelToplam - araToplam;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <title>Proforma Fatura - ${proforma.proforma_no}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; background: #f3f4f6; padding: 8px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .logo { height: 80px; }
        </style>
      </head>
      <body>
        <div style="max-width: 800px; margin: 0 auto;">
           <div class="header">
              <img src="${logoUrl}" class="logo">
              <div style="text-align: right;">
                 <h2 style="margin:0">PROFORMA FATURA</h2>
                 <div>No: ${proforma.proforma_no}</div>
                 <div>Tarih: ${tarih}</div>
              </div>
           </div>
           
           <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
              <div style="width: 48%; border: 1px solid #eee; padding: 10px; border-radius: 5px;">
                 <strong>SAYIN:</strong><br>
                 ${musteri.unvan || '-'}<br>
                 ${musteri.vergi_dairesi ? 'V.D: ' + musteri.vergi_dairesi : ''} 
                 ${musteri.vergi_no ? 'V.No: ' + musteri.vergi_no : ''}<br>
                 ${musteri.adres || ''}
              </div>
           </div>

           <table>
             <thead><tr><th>#</th><th>Açıklama</th><th style="text-align:center">Miktar</th><th style="text-align:right">Birim Fiyat</th><th style="text-align:right">Tutar</th></tr></thead>
             <tbody>${kalemlerHTML}</tbody>
           </table>

           <div style="text-align: right; margin-top: 20px;">
              <div>Ara Toplam: ${formatPara(araToplam, pb)}</div>
              <div>KDV (%20): ${formatPara(toplamKDV, pb)}</div>
              <div style="font-size: 16px; font-weight: bold; margin-top: 5px;">GENEL TOPLAM: ${formatPara(genelToplam, pb)}</div>
           </div>
        </div>
      </body>
      </html>
    `;
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
  } catch (err) {
    alert('Yazdırma hatası: ' + err.message);
  }
};

onMounted(verileriGetir);
</script>
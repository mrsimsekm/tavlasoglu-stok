<template>
  <div class="container mx-auto px-4 py-6">
    <!-- HEADER -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <h1 class="text-3xl font-bold text-gray-800">Proforma Faturalar</h1>

      <!-- AKSİYON BUTONLARI GRUBU -->
      <div class="flex items-center space-x-3">
        
        <!-- YENİ: AYARLAR BUTONU -->
        <RouterLink to="/app/proformalar/ayarlar" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-3 rounded-lg border border-gray-300 shadow-sm transition duration-150 flex items-center text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Ayarlar
        </RouterLink>

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

const kategoriListesi = ['KLİMA', 'VRF', 'HAVA PERDESİ', 'SOĞUK ODA', 'DX', 'ISI POMPASI', 'ENDÜSTRİYEL MUTFAK', 'İŞÇİLİK', 'YEDEK PARÇA'];
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
    await verileriGetir(); 
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

// --- YAZDIRMA (STANDART, KURUMSAL FORMAT) ---
const yazdirProforma = async (proforma) => {
  try {
    const { data: kalemler, error } = await supabase.from('proforma_kalemleri').select(`*, depolar(ad), tedarikciler(ad), anlasmalar(ad)`).eq('proforma_id', proforma.id);
    if (error) throw error;
    
    const { data: fullProforma, error: proformaError } = await supabase.from('proformalar').select('*, musteriler(*)').eq('id', proforma.id).single();
    if(proformaError) throw proformaError;
    const musteri = fullProforma.musteriler || {};
    
    const logoUrl = window.location.origin + '/logo11.png';
    const tarih = formatTarih(proforma.olusturma_tarihi);
    const pb = proforma.para_birimi || 'TRY';
    const ilgiliKisi = fullProforma.ilgili_kisi || musteri.ilgili_kisi || '-';

    const kalemlerHTML = kalemler.map((kalem, index) => {
      let tutar = kalem.miktar * kalem.birim_fiyat;
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${index + 1}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 500;">${kalem.aciklama}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${kalem.miktar}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${kalem.birim || 'Adet'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(kalem.birim_fiyat, pb)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: 700;">${formatPara(tutar, pb)}</td>
        </tr>
      `;
    }).join('');

    const araToplam = kalemler.reduce((acc, k) => acc + (k.miktar * k.birim_fiyat), 0);
    const toplamKDV = araToplam * 0.20;
    const genelToplam = araToplam + toplamKDV;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>Proforma Fatura - ${proforma.proforma_no}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          @page { margin: 1cm; size: A4; }
          body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.4; margin: 0; padding: 0; font-size: 11px; }
          .container { max-width: 210mm; margin: 0 auto; background: white; padding-bottom: 20px; }
          
          /* HEADER */
          .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; border-bottom: 2px solid #005BBB; padding-bottom: 15px; }
          .logo-area img { height: 75px; object-fit: contain; }
          .doc-title { text-align: right; }
          .doc-title h2 { margin: 0; font-size: 22px; color: #005BBB; font-weight: 800; letter-spacing: 0.5px; }
          .doc-title .sub { font-size: 11px; color: #666; margin-top: 5px; font-weight: 500; }
          
          /* INFO GRID */
          .info-grid { display: flex; justify-content: space-between; margin-bottom: 25px; gap: 20px; }
          .info-box { flex: 1; border: 1px solid #e5e7eb; background: #f9fafb; padding: 12px; border-radius: 6px; }
          .box-title { font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
          .info-text { font-size: 11.5px; color: #111827; margin-bottom: 3px; }
          .info-text strong { color: #000; }
          
          /* TABLE */
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #005BBB; color: white; padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          th:first-child { border-radius: 4px 0 0 0; }
          th:last-child { border-radius: 0 4px 0 0; }
          
          /* TOTALS */
          .totals { display: flex; justify-content: flex-end; margin-top: 15px; }
          .total-wrapper { width: 250px; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
          .total-row { display: flex; justify-content: space-between; padding: 6px 12px; font-size: 11px; border-bottom: 1px solid #f3f4f6; }
          .total-row.final { background: #005BBB; color: white; font-weight: bold; font-size: 13px; border-bottom: none; }
          
          /* FOOTER */
          .footer-note { position: fixed; bottom: 0; left: 0; width: 100%; text-align: center; font-size: 9px; color: #999; padding: 5px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-area"><img src="${logoUrl}" alt="Tavlaşoğlu"></div>
            <div class="doc-title">
                <h2>PROFORMA FATURA</h2>
                <div class="sub">Tarih: ${tarih} &nbsp;|&nbsp; No: ${proforma.proforma_no}</div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-box">
              <div class="box-title">MÜŞTERİ BİLGİLERİ</div>
              <div class="info-text"><strong>${musteri.unvan || '-'}</strong></div>
              <div class="info-text">İlgili: ${ilgiliKisi}</div>
              <div class="info-text">${musteri.adres || '-'}</div>
              <div class="info-text">${musteri.vergi_dairesi ? 'V.D: ' + musteri.vergi_dairesi : ''} ${musteri.vergi_no ? 'V.No: ' + musteri.vergi_no : ''}</div>
            </div>
            
            <div class="info-box" style="text-align: right;">
              <div class="box-title">TEKLİF VEREN</div>
              <div class="info-text"><strong>Tavlaşoğlu Isıtma Soğutma</strong></div>
              <div class="info-text">Doğalgaz Sis. Tic. San. ve Ltd. Şti.</div>
              <div class="info-text">Lalapaşa Mah. Samih Kobal Cad.</div>
              <div class="info-text">Tel: 0(442) 238 83 83</div>
              ${fullProforma.proje_adi ? `<div style="margin-top:8px; padding-top:8px; border-top: 1px solid #e5e7eb; color:#005BBB; font-weight:700; font-size:12px;">PROJE: ${fullProforma.proje_adi}</div>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: center; width: 30px;">#</th>
                <th>Açıklama</th>
                <th style="text-align: center; width: 60px;">Miktar</th>
                <th style="text-align: center; width: 60px;">Birim</th>
                <th style="text-align: right; width: 100px;">Birim Fiyat</th>
                <th style="text-align: right; width: 100px;">Tutar</th>
              </tr>
            </thead>
            <tbody>
              ${kalemlerHTML}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-wrapper">
                <div class="total-row"><span>Ara Toplam:</span><span>${formatPara(araToplam, pb)}</span></div>
                <div class="total-row"><span>KDV (%20):</span><span>${formatPara(toplamKDV, pb)}</span></div>
                <div class="total-row final"><span>GENEL TOPLAM:</span><span>${formatPara(genelToplam, pb)}</span></div>
            </div>
          </div>
          
          <div style="margin-top: 25px;">
            <div style="font-size: 11px; font-weight: bold; color: #005BBB; text-transform: uppercase; margin-bottom: 5px;">Şartlar ve Koşullar</div>
            <div style="white-space: pre-wrap; font-size: 10px; color: #444; line-height: 1.4; background: #fafafa; padding: 10px; border-left: 3px solid #005BBB;">${fullProforma.sartlar || 'Şart belirtilmemiş.'}</div>
          </div>

          ${fullProforma.notlar ? `<div style="margin-top:15px;"><div style="font-size: 10px; font-weight: bold; color: #333;">NOTLAR:</div><div style="font-size: 10px; color: #555;">${fullProforma.notlar}</div></div>` : ''}
          
          <div class="footer-note">
            Bu belge bilgilendirme amaçlıdır.
          </div>
        </div>
      </body>
      </html>
    `;
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
    
  } catch (err) {
    alert('Yazdırma hatası: ' + err.message);
  }
};

onMounted(verileriGetir);
</script>
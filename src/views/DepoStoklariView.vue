<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Depo Stokları</h1>
    
    <!-- FİLTRE -->
    <div class="bg-white shadow-md rounded-lg p-4 mb-6 border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ürün Ara</label>
          <input 
            v-model="filtreler.urunArama" 
            type="text" 
            placeholder="Ürün kodu veya açıklama..." 
            class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Depo</label>
          <select v-model="filtreler.depoId" @change="filtrele" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option :value="null">Tüm Depolar (Grup Görünümü)</option>
            <option v-for="depo in depolar" :key="depo.id" :value="depo.id">
              {{ depo.ad }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Stok Durumu</label>
          <select v-model="filtreler.stokDurumu" @change="filtrele" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="tumu">Tümü</option>
            <option value="var">Stokta Var</option>
            <option value="yok">Stokta Yok</option>
            <option value="dusuk">Düşük Stok (≤10)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- STOK LİSTESİ -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <div class="overflow-x-auto">
        <table class="min-w-full leading-normal table-fixed">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-2 py-3 w-12 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
              <th v-for="kolon in kolonlar" :key="kolon.key" 
                  @click="siralamayiDegistir(kolon.sortable ? kolon.key : null)"
                  :class="[kolon.width, kolon.align, {'cursor-pointer hover:bg-gray-100': kolon.sortable}]"
                  class="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider select-none group">
                <div class="flex items-center" :class="kolon.justify">
                  <span>{{ kolon.label }}</span>
                  <span v-if="kolon.sortable" class="ml-1.5">
                    <svg v-if="sortBy === kolon.key && sortDirection === 'asc'" class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                    <svg v-else-if="sortBy === kolon.key && sortDirection === 'desc'" class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    <svg v-else class="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="7" class="px-6 py-10 text-center text-gray-500">
                <div class="flex flex-col items-center justify-center">
                  <svg class="animate-spin h-8 w-8 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Veriler yükleniyor...</span>
                </div>
              </td>
            </tr>
            <!-- Veri Yok -->
            <tr v-else-if="urunStoklari.length === 0">
              <td colspan="7" class="px-6 py-10 text-center text-gray-500 italic">
                Arama kriterlerine uygun stok bulunamadı.
              </td>
            </tr>
            
            <!-- Grup Döngüsü -->
            <template v-else v-for="urun in urunStoklari" :key="urun.urun_id">
              <tr 
                class="hover:bg-gray-50 transition-colors"
                :class="{'cursor-pointer': !filtreler.depoId, 'bg-indigo-50': acikUrunler.has(urun.urun_id)}"
                @click="!filtreler.depoId && toggleDetay(urun.urun_id)"
              >
                <td class="px-2 py-4 text-center">
                  <div v-if="!filtreler.depoId" class="flex items-center justify-center h-full">
                    <svg class="w-5 h-5 text-gray-400 transition-transform duration-200" :class="{'rotate-90 text-indigo-600': acikUrunler.has(urun.urun_id)}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </td>
                <td class="px-5 py-4 text-sm font-bold text-gray-900">{{ urun.urun_kodu }}</td>
                <td class="px-5 py-4 text-sm text-gray-700">
                  <p class="font-medium truncate">{{ urun.aciklama }}</p>
                  <p class="text-xs text-gray-500">{{ urun.ana_birim }}</p>
                </td>
                <td class="px-5 py-4 text-right text-sm">
                  <span v-if="!filtreler.depoId" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {{ urun.detaylar.length }} Depo
                  </span>
                  <span v-else class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {{ urun.detaylar[0]?.depolar.ad || '-' }}
                  </span>
                </td>
                <td class="px-5 py-4 text-right text-sm font-semibold text-gray-900">{{ urun.toplam_miktar }}</td>
                <td class="px-5 py-4 text-right text-sm text-orange-600 font-medium">{{ urun.toplam_rezerve }}</td>
                <td class="px-5 py-4 text-right text-lg font-bold" :class="getMevcutRenk(urun.toplam_mevcut)">
                  {{ urun.toplam_mevcut }}
                </td>
              </tr>

              <!-- Detay Satırları -->
              <template v-if="!filtreler.depoId && acikUrunler.has(urun.urun_id)">
                <tr v-for="(detay, index) in urun.detaylar" :key="detay.depo_id" class="bg-gray-50 hover:bg-gray-100">
                  <td colspan="3" class="px-5 py-2 text-right text-xs text-gray-400">
                    <span v-if="index === 0">↳ Depo Detayları</span>
                  </td>
                  <td class="px-5 py-2 text-right text-sm font-medium text-gray-800">{{ detay.depolar.ad }}</td>
                  <td class="px-5 py-2 text-right text-sm font-mono text-gray-600">{{ detay.miktar || 0 }}</td>
                  <td class="px-5 py-2 text-right text-sm font-mono text-orange-500">{{ detay.rezerve_miktar || 0 }}</td>
                  <td class="px-5 py-2 text-right text-sm font-bold font-mono" :class="getMevcutRenk((detay.miktar || 0) - (detay.rezerve_miktar || 0))">
                    {{ (detay.miktar || 0) - (detay.rezerve_miktar || 0) }}
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
      
      <!-- Sayfalama -->
      <div class="bg-gray-50 px-4 py-3 flex items-center justify-end border-t border-gray-200 sm:px-6">
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button @click="sayfaDegistir(mevcutSayfa - 1)" :disabled="mevcutSayfa === 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <span class="sr-only">Önceki</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
          </button>
          <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            Sayfa {{ mevcutSayfa }}
          </span>
          <button @click="sayfaDegistir(mevcutSayfa + 1)" :disabled="urunStoklari.length < sayfaBasinaKayit" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <span class="sr-only">Sonraki</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { supabase } from '../supabase.js'; 

// --- STATE ---
const loading = ref(false);
const depolar = ref([]);
const urunStoklari = ref([]);
const acikUrunler = ref(new Set()); 
let filtreDebounceTimer;

// Sayfalama & Sıralama
const mevcutSayfa = ref(1);
const sayfaBasinaKayit = 10;
const sortBy = ref('urun_kodu');
const sortDirection = ref('asc');

const filtreler = ref({
  urunArama: '',
  depoId: null, 
  stokDurumu: 'tumu'
});

const kolonlar = ref([
  { key: 'urun_kodu', label: 'Ürün Kodu', sortable: true, width: 'w-32', align: 'text-left', justify: 'justify-start' },
  { key: 'aciklama', label: 'Açıklama', sortable: true, width: 'w-auto', align: 'text-left', justify: 'justify-start' },
  { key: 'depo_sayisi', label: 'Depo', sortable: false, width: 'w-40', align: 'text-right', justify: 'justify-end' },
  { key: 'toplam_miktar', label: 'Toplam Miktar', sortable: true, width: 'w-32', align: 'text-right', justify: 'justify-end' },
  { key: 'toplam_rezerve', label: 'Rezerve', sortable: true, width: 'w-24', align: 'text-right', justify: 'justify-end' },
  { key: 'toplam_mevcut', label: 'Mevcut', sortable: true, width: 'w-24', align: 'text-right', justify: 'justify-end' },
]);

// --- LIFECYCLE & WATCHERS ---
onMounted(async () => {
  const { data: depolarData } = await supabase.from('depolar').select('*').order('ad');
  depolar.value = depolarData || [];
  await verileriGetir();
});

watch(() => filtreler.value.urunArama, () => {
  clearTimeout(filtreDebounceTimer);
  filtreDebounceTimer = setTimeout(() => {
    filtrele();
  }, 500);
});

// --- DATA FETCHING (RPC) ---
const verileriGetir = async () => {
  loading.value = true;
  acikUrunler.value.clear();
  urunStoklari.value = [];

  try {
    // 1. Aşama: RPC ile sayfalanmış ve filtrelenmiş ürün ID'lerini al
    const offset = (mevcutSayfa.value - 1) * sayfaBasinaKayit;
    
    const { data: urunIdData, error: rpcError } = await supabase.rpc('get_depo_stoklari_paginated', {
      p_limit: sayfaBasinaKayit,
      p_offset: offset,
      p_arama_metni: filtreler.value.urunArama || null,
      p_depo_id: filtreler.value.depoId || null,
      p_stok_durumu: filtreler.value.stokDurumu,
      p_sort_by: sortBy.value,
      p_sort_direction: sortDirection.value
    });

    if (rpcError) throw rpcError;
    if (!urunIdData || urunIdData.length === 0) return;

    // 2. Aşama: Gelen ürün ID'lerine ait stok seviyesi detaylarını çek
    // Depo filtresi varsa SADECE o depoya ait kayıtları getir
    const urunIdleri = urunIdData.map(u => u.urun_id);
    
    let detayQuery = supabase
      .from('stok_seviyeleri')
      .select('*, urunler(urun_kodu, aciklama, ana_birim), depolar(ad)')
      .in('urun_id', urunIdleri);

    // *** DÜZELTME: Depo filtresi seçiliyse sadece o depoya ait satırları çek ***
    if (filtreler.value.depoId) {
      detayQuery = detayQuery.eq('depo_id', filtreler.value.depoId);
    }

    const { data: detaylar, error: detayError } = await detayQuery;

    if (detayError) throw detayError;

    // 3. Aşama: Detayları ürün bazında grupla ve toplamları hesapla
    const groupedMap = new Map();
    
    detaylar.forEach(detay => {
      if (!groupedMap.has(detay.urun_id)) {
        groupedMap.set(detay.urun_id, {
          urun_id: detay.urun_id,
          urun_kodu: detay.urunler.urun_kodu,
          aciklama: detay.urunler.aciklama,
          ana_birim: detay.urunler.ana_birim,
          toplam_miktar: 0,
          toplam_rezerve: 0,
          toplam_mevcut: 0,
          detaylar: []
        });
      }

      const urunGrubu = groupedMap.get(detay.urun_id);
      const mevcutMiktar = (detay.miktar || 0) - (detay.rezerve_miktar || 0);
      
      urunGrubu.toplam_miktar += (detay.miktar || 0);
      urunGrubu.toplam_rezerve += (detay.rezerve_miktar || 0);
      urunGrubu.toplam_mevcut += mevcutMiktar;
      urunGrubu.detaylar.push(detay);
    });
    
    // Sıralamayı RPC'den gelen ID listesine göre yap
    urunStoklari.value = urunIdleri.map(id => groupedMap.get(id)).filter(Boolean);

  } catch (error) {
    console.error('Veri çekme hatası:', error);
    alert('Veriler yüklenirken bir hata oluştu: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// --- UI ACTIONS ---
const filtrele = () => {
  mevcutSayfa.value = 1;
  verileriGetir();
};

const sayfaDegistir = (yeniSayfa) => {
  if (yeniSayfa < 1) return;
  mevcutSayfa.value = yeniSayfa;
  verileriGetir();
};

const siralamayiDegistir = (kolonKey) => {
  if (!kolonKey) return;
  
  if (sortBy.value === kolonKey) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = kolonKey;
    sortDirection.value = 'asc';
  }
  mevcutSayfa.value = 1;
  verileriGetir();
};

const toggleDetay = (urunId) => {
  if (acikUrunler.value.has(urunId)) {
    acikUrunler.value.delete(urunId);
  } else {
    acikUrunler.value.add(urunId);
  }
};

const getMevcutRenk = (mevcut) => {
  if (mevcut <= 0) return 'text-red-600';
  if (mevcut <= 10) return 'text-orange-600';
  return 'text-green-600';
};
</script>
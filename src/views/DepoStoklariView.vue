<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-4">Depo Stokları</h1>
    
    <!-- FİLTRE -->
    <div class="bg-white shadow-md rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="label-style">Ürün Ara</label>
          <input 
            v-model="filtreler.urunArama" 
            type="text" 
            placeholder="Ürün kodu veya açıklama..." 
            class="form-input"
          >
        </div>
        <div>
          <label class="label-style">Depo</label>
          <select v-model="filtreler.depoId" class="form-input">
            <option :value="null">Tüm Depolar (Grup Görünümü)</option>
            <option v-for="depo in depolar" :key="depo.id" :value="depo.id">
              {{ depo.ad }}
            </option>
          </select>
        </div>
        <div>
          <label class="label-style">Stok Durumu (Genel)</label>
          <select v-model="filtreler.stokDurumu" class="form-input">
            <option value="tumu">Tümü</option>
            <option value="var">Stokta Var</option>
            <option value="yok">Stokta Yok</option>
            <option value="dusuk">Düşük Stok (≤10)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- STOK LİSTESİ -->
    <div class="bg-white shadow-md rounded-lg overflow-x-auto">
      <table class="min-w-full leading-normal table-fixed">
        <thead>
          <tr>
            <!-- Kolon genişliklerini buradan kontrol ediyoruz, alt satırlar buna uyacak -->
            <th class="th-style w-12 text-center"></th> <!-- Ok simgesi için dar alan -->
            <th class="th-style w-32">Ürün Kodu</th>
            <th class="th-style w-auto">Açıklama</th> <!-- Esnek genişlik -->
            <th class="th-style w-40 text-right">
              {{ filtreler.depoId ? 'Depo' : 'Depo Sayısı' }}
            </th>
            <th class="th-style w-32 text-right">Toplam Miktar</th>
            <th class="th-style w-24 text-right">Rezerve</th>
            <th class="th-style w-24 text-right">Mevcut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center py-4">Yükleniyor...</td>
          </tr>
          <tr v-else-if="urunBazliStoklar.length === 0 && !loading">
            <td colspan="7" class="text-center py-4 text-gray-500">
              Arama kriterlerine uygun stok bulunamadı.
            </td>
          </tr>
          
          <!-- Grup Döngüsü -->
          <template v-else v-for="urunStok in urunBazliStoklar" :key="urunStok.urun_id">
            
            <!-- 1. ANA SATIR (GRUP BAŞLIĞI) -->
            <tr 
              class="hover:bg-gray-100 transition duration-150 border-b border-gray-200 h-16"
              :class="{'cursor-pointer': !filtreler.depoId, 'bg-gray-50': acikDegil.has(urunStok.urun_id) && !filtreler.depoId}"
              @click="!filtreler.depoId && toggleAciklama(urunStok.urun_id)"
            >
              <!-- Kolon 1: Toggle Icon -->
              <td class="px-2 py-4 text-center">
                <div v-if="urunStok.detaylar && urunStok.detaylar.length > 0 && !filtreler.depoId"
                     class="flex items-center justify-center h-full">
                  <svg 
                    class="w-5 h-5 text-gray-500 transition-transform duration-200" 
                    :class="{'rotate-90': acikDegil.has(urunStok.urun_id)}" 
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </td>

              <!-- Kolon 2: Ürün Kodu -->
              <td class="px-5 py-4">
                <p class="font-bold text-gray-900">{{ urunStok.urun_kodu }}</p>
              </td>

              <!-- Kolon 3: Açıklama -->
              <td class="px-5 py-4">
                <p class="text-gray-800 font-medium truncate">{{ urunStok.aciklama }}</p>
                <p class="text-xs text-gray-500">{{ urunStok.ana_birim }}</p>
              </td>

              <!-- Kolon 4: Depo Bilgisi -->
              <td class="px-5 py-4 text-right">
                <span v-if="!filtreler.depoId" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {{ urunStok.detaylar.length }} Depo
                </span>
                <span v-else class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {{ urunStok.detaylar[0]?.depo_ad || '-' }}
                </span>
              </td>

              <!-- Kolon 5: Toplam Miktar -->
              <td class="px-5 py-4 text-right">
                <p class="font-semibold text-gray-900">{{ urunStok.toplam_miktar }}</p>
              </td>

              <!-- Kolon 6: Rezerve -->
              <td class="px-5 py-4 text-right">
                <p class="text-orange-600 font-medium">{{ urunStok.toplam_rezerve }}</p>
              </td>

              <!-- Kolon 7: Mevcut -->
              <td class="px-5 py-4 text-right">
                <p class="font-bold text-lg" :class="getMevcutRenk(urunStok.toplam_mevcut)">
                  {{ urunStok.toplam_mevcut }}
                </p>
              </td>
            </tr>

            <!-- 2. DETAY SATIRLARI (Doğrudan tablonun parçası, iç içe tablo değil) -->
            <!-- Sadece depo filtresi yoksa ve akordiyon açıksa göster -->
            <template v-if="!filtreler.depoId && acikDegil.has(urunStok.urun_id)">
              <tr 
                v-for="(detay, index) in urunStok.detaylar" 
                :key="detay.depo_id" 
                class="bg-gray-50 hover:bg-gray-100 border-gray-100"
                :class="{'border-b': index === urunStok.detaylar.length - 1}"
              >
                <!-- Kolon 1: Boş (Hizalama için) -->
                <td class="px-2 py-3"></td>

                <!-- Kolon 2: Boş (Hizalama için) -->
                <td class="px-5 py-3"></td>

                <!-- Kolon 3: "Depo Detayı" Görseli (Açıklama kolonunun altına gelir) -->
                <td class="px-5 py-3 text-right">
                  <div class="flex items-center justify-end text-xs text-gray-400 select-none">
                    <svg class="w-4 h-4 mr-2 rotate-90 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                    </svg>
                    <span>Depo Detayı:</span>
                  </div>
                </td>

                <!-- Kolon 4: Depo Adı (Ana tablodaki Depo kolonunun tam altına) -->
                <td class="px-5 py-3 text-right">
                  <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                    {{ detay.depo_ad }}
                  </span>
                </td>

                <!-- Kolon 5: Miktar (Ana tablodaki Miktar kolonunun tam altına) -->
                <td class="px-5 py-3 text-right text-sm text-gray-600 font-mono">
                  {{ detay.miktar || 0 }}
                </td>

                <!-- Kolon 6: Rezerve (Ana tablodaki Rezerve kolonunun tam altına) -->
                <td class="px-5 py-3 text-right text-sm text-orange-600 font-mono">
                  {{ detay.rezerve_miktar || 0 }}
                </td>

                <!-- Kolon 7: Mevcut (Ana tablodaki Mevcut kolonunun tam altına) -->
                <td class="px-5 py-3 text-right text-sm font-bold font-mono" :class="getMevcutRenk(detay.mevcut)">
                  {{ detay.mevcut }}
                </td>
              </tr>
            </template>

          </template>
        </tbody>
      </table>
    </div>

    <!-- ÖZET KARTLARI -->
    <div v-if="!filtreler.depoId" class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
      <div class="bg-white p-4 rounded-lg shadow-md">
        <p class="text-sm text-gray-600">Toplam Ürün Çeşidi</p>
        <p class="text-2xl font-bold text-blue-600">{{ toplamUrunSayisi }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-md">
        <p class="text-sm text-gray-600">Toplam Stok</p>
        <p class="text-2xl font-bold text-green-600">{{ toplamStok }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-md">
        <p class="text-sm text-gray-600">Rezerve Stok</p>
        <p class="text-2xl font-bold text-orange-600">{{ toplamRezerve }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow-md">
        <p class="text-sm text-gray-600">Mevcut Stok</p>
        <p class="text-2xl font-bold text-purple-600">{{ toplamMevcut }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Header stilleri */
.th-style { 
  @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky top-0; 
}

/* Genel input stilleri */
.label-style { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
</style>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '../supabase.js'; 

const loading = ref(false);
const stokSeviyeleri = ref([]);
const depolar = ref([]);
const acikDegil = ref(new Set()); 

const filtreler = ref({
  urunArama: '',
  depoId: null, 
  stokDurumu: 'tumu'
});

// --- VERİ ÇEKME ---
const verileriGetir = async () => {
  loading.value = true;
  try {
    const { data: depolarData, error: depoError } = await supabase.from('depolar').select('*').order('ad');
    if (depoError) throw depoError;
    depolar.value = depolarData || [];

    const { data: stokResData, error: stokError } = await supabase
      .from('stok_seviyeleri')
      .select(`
        *,
        urunler (urun_kodu, aciklama, ana_birim),
        depolar (ad)
      `)
      .order('miktar', { ascending: false });

    if (stokError) throw stokError;
    
    stokSeviyeleri.value = stokResData || [];
    groupStoklarByUrun();

  } catch (error) {
    console.error('Veriler çekilirken hata:', error);
    alert('Hata: ' + (error.message || 'Bilinmeyen bir hata oluştu.'));
  } finally {
    loading.value = false;
  }
};

// --- GRUPLAMA ---
const urunBazliStoklar = ref([]);

const groupStoklarByUrun = () => {
    if (stokSeviyeleri.value.length === 0) {
        urunBazliStoklar.value = [];
        return;
    }

    const groupedMap = new Map();

    stokSeviyeleri.value.forEach(stokKayit => {
        const urunId = stokKayit.urun_id;
        const mevcut = (stokKayit.miktar || 0) - (stokKayit.rezerve_miktar || 0);
        const depoAd = stokKayit.depolar?.ad || 'Bilinmeyen Depo';

        if (!groupedMap.has(urunId)) {
            groupedMap.set(urunId, {
                urun_id: urunId,
                urun_kodu: stokKayit.urunler?.urun_kodu || '-',
                aciklama: stokKayit.urunler?.aciklama || '-',
                ana_birim: stokKayit.urunler?.ana_birim || '',
                toplam_miktar: 0,
                toplam_rezerve: 0,
                toplam_mevcut: 0,
                detaylar: [] 
            });
        }

        const currentUrun = groupedMap.get(urunId);

        currentUrun.toplam_miktar += stokKayit.miktar || 0;
        currentUrun.toplam_rezerve += stokKayit.rezerve_miktar || 0;
        currentUrun.toplam_mevcut += mevcut;
        
        currentUrun.detaylar.push({
            depo_id: stokKayit.depo_id,
            depo_ad: depoAd,
            miktar: stokKayit.miktar || 0,
            rezerve_miktar: stokKayit.rezerve_miktar || 0,
            mevcut: mevcut
        });
    });

    let result = Array.from(groupedMap.values());
    urunBazliStoklar.value = applyFilters(result);
};

// --- FİLTRELEME ---
const applyFilters = (data) => {
    let sonuc = [...data];

    if (filtreler.value.urunArama) {
        const arama = filtreler.value.urunArama.toLowerCase();
        sonuc = sonuc.filter(s => 
            s.urun_kodu?.toLowerCase().includes(arama) ||
            s.aciklama?.toLowerCase().includes(arama)
        );
    }

    if (filtreler.value.depoId) {
        sonuc = sonuc.map(urun => {
            const filteredDetails = urun.detaylar.filter(detay => detay.depo_id === filtreler.value.depoId);
            const toplamMiktar = filteredDetails.reduce((sum, d) => sum + d.miktar, 0);
            const toplamRezerve = filteredDetails.reduce((sum, d) => sum + d.rezerve_miktar, 0);
            const toplamMevcut = filteredDetails.reduce((sum, d) => sum + d.mevcut, 0);
            
            return {
                ...urun,
                toplam_miktar: toplamMiktar,
                toplam_rezerve: toplamRezerve,
                toplam_mevcut: toplamMevcut,
                detaylar: filteredDetails, 
            };
        }).filter(urun => urun.detaylar.length > 0); 
    }

    if (filtreler.value.stokDurumu !== 'tumu') {
        sonuc = sonuc.filter(s => {
            const mevcut = s.toplam_mevcut;
            switch (filtreler.value.stokDurumu) {
                case 'var': return mevcut > 0;
                case 'yok': return mevcut <= 0;
                case 'dusuk': return mevcut > 0 && mevcut <= 10;
                default: return true;
            }
        });
    }
    
    return sonuc;
};

// --- İZLEYİCİLER ---
watch([() => filtreler.value.depoId, () => filtreler.value.stokDurumu], () => {
    if (stokSeviyeleri.value.length > 0) {
        groupStoklarByUrun();
    }
    if (filtreler.value.depoId !== null) {
        acikDegil.value.clear();
    }
}, { deep: true });

watch(() => filtreler.value.urunArama, () => {
    if (stokSeviyeleri.value.length > 0) {
        groupStoklarByUrun();
    }
});

const toggleAciklama = (urunId) => {
    if (filtreler.value.depoId) return;
    
    if (acikDegil.value.has(urunId)) {
        acikDegil.value.delete(urunId);
    } else {
        acikDegil.value.add(urunId);
    }
};

// --- HESAPLAMALAR ---
const toplamUrunSayisi = computed(() => urunBazliStoklar.value.length);
const toplamStok = computed(() => urunBazliStoklar.value.reduce((sum, s) => sum + s.toplam_miktar, 0));
const toplamRezerve = computed(() => urunBazliStoklar.value.reduce((sum, s) => sum + s.toplam_rezerve, 0));
const toplamMevcut = computed(() => urunBazliStoklar.value.reduce((sum, s) => sum + s.toplam_mevcut, 0));

const getMevcutRenk = (mevcut) => {
  if (mevcut <= 0) return 'text-red-600';
  if (mevcut <= 10) return 'text-orange-600';
  return 'text-green-600';
};

onMounted(() => {
  verileriGetir();
});
</script>
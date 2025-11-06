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
            <option :value="null">Tüm Depolar</option>
            <option v-for="depo in depolar" :key="depo.id" :value="depo.id">
              {{ depo.ad }}
            </option>
          </select>
        </div>
        <div>
          <label class="label-style">Stok Durumu</label>
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
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="th-style">Ürün Kodu</th>
            <th class="th-style">Açıklama</th>
            <th class="th-style text-right" style="width: 130px;">Depo</th>
            <th class="th-style text-right" style="width: 150px;">Toplam Miktar</th>
            <th class="th-style text-right" style="width: 100px;">Rezerve</th>
            <th class="th-style text-right" style="width: 100px;">Mevcut</th>
            <!--<th class="th-style">Durum</th>-->
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center py-4">Yükleniyor...</td>
          </tr>
          <tr v-else-if="filtrelenmisStoklar.length === 0">
            <td colspan="7" class="text-center py-4 text-gray-500">
              Arama kriterlerine uygun stok bulunamadı.
            </td>
          </tr>
          <tr v-else v-for="stok in filtrelenmisStoklar" :key="stok.id" class="hover:bg-gray-50">
            <td class="td-style">
              <p class="font-semibold text-gray-900">{{ stok.urunler?.urun_kodu || '-' }}</p>
            </td>
            <td class="td-style">
              <p class="text-gray-700">{{ stok.urunler?.aciklama || '-' }}</p>
              <p class="text-xs text-gray-500">{{ stok.urunler?.ana_birim || '' }}</p>
            </td>
            <td class="td-style">
              <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                {{ stok.depolar?.ad || '-' }}
              </span>
            </td>
            <td class="td-style text-center">
              <p class="font-semibold text-gray-900">{{ stok.miktar || 0 }}</p>
            </td>
            <td class="td-style text-center">
              <p class="text-orange-600">{{ stok.rezerve_miktar || 0 }}</p>
            </td>
            <td class="td-style text-center">
              <p class="font-bold" :class="getMevcutRenk(stok.miktar - stok.rezerve_miktar)">
                {{ (stok.miktar || 0) - (stok.rezerve_miktar || 0) }}
              </p>
            </td>
            <!--<td class="td-style">
              <span :class="getDurumBadge(stok.miktar - stok.rezerve_miktar)">
                {{ getDurumMetni(stok.miktar - stok.rezerve_miktar) }}
              </span>
            </td>-->
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ÖZET KARTLARI -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
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
.th-style { @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider; }
.td-style { @apply px-5 py-5 border-b border-gray-200 bg-white text-sm; }
.label-style { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
</style>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase.js';

const loading = ref(false);
const stokSeviyeleri = ref([]);
const depolar = ref([]);

const filtreler = ref({
  urunArama: '',
  depoId: null,
  stokDurumu: 'tumu'
});

// Depoları ve stok seviyelerini getir
const verileriGetir = async () => {
  loading.value = true;
  try {
    const [depolarRes, stokRes] = await Promise.all([
      supabase.from('depolar').select('*').order('ad'),
      supabase.from('stok_seviyeleri').select(`
        *,
        urunler (urun_kodu, aciklama, ana_birim),
        depolar (ad)
      `).order('miktar', { ascending: false })
    ]);

    if (depolarRes.error) throw depolarRes.error;
    if (stokRes.error) throw stokRes.error;

    depolar.value = depolarRes.data || [];
    stokSeviyeleri.value = stokRes.data || [];
  } catch (error) {
    console.error('Veriler çekilirken hata:', error);
    alert('Hata: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// Filtrelenmiş stoklar
const filtrelenmisStoklar = computed(() => {
  let sonuc = stokSeviyeleri.value;

  // Ürün arama
  if (filtreler.value.urunArama) {
    const arama = filtreler.value.urunArama.toLowerCase();
    sonuc = sonuc.filter(s => 
      s.urunler?.urun_kodu?.toLowerCase().includes(arama) ||
      s.urunler?.aciklama?.toLowerCase().includes(arama)
    );
  }

  // Depo filtresi
  if (filtreler.value.depoId) {
    sonuc = sonuc.filter(s => s.depo_id === filtreler.value.depoId);
  }

  // Stok durumu filtresi
  if (filtreler.value.stokDurumu !== 'tumu') {
    sonuc = sonuc.filter(s => {
      const mevcut = (s.miktar || 0) - (s.rezerve_miktar || 0);
      switch (filtreler.value.stokDurumu) {
        case 'var': return mevcut > 0;
        case 'yok': return mevcut <= 0;
        case 'dusuk': return mevcut > 0 && mevcut <= 10;
        default: return true;
      }
    });
  }

  return sonuc;
});

// Özet istatistikler
const toplamUrunSayisi = computed(() => {
  const uniqueUrunler = new Set(filtrelenmisStoklar.value.map(s => s.urun_id));
  return uniqueUrunler.size;
});

const toplamStok = computed(() => {
  return filtrelenmisStoklar.value.reduce((sum, s) => sum + (s.miktar || 0), 0);
});

const toplamRezerve = computed(() => {
  return filtrelenmisStoklar.value.reduce((sum, s) => sum + (s.rezerve_miktar || 0), 0);
});

const toplamMevcut = computed(() => {
  return filtrelenmisStoklar.value.reduce((sum, s) => {
    return sum + ((s.miktar || 0) - (s.rezerve_miktar || 0));
  }, 0);
});

// Yardımcı fonksiyonlar
const getMevcutRenk = (mevcut) => {
  if (mevcut <= 0) return 'text-red-600';
  if (mevcut <= 10) return 'text-orange-600';
  return 'text-green-600';
};

const getDurumBadge = (mevcut) => {
  if (mevcut <= 0) return 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800';
  if (mevcut <= 10) return 'px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800';
  return 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800';
};

const getDurumMetni = (mevcut) => {
  if (mevcut <= 0) return 'Stokta Yok';
  if (mevcut <= 10) return 'Düşük Stok';
  return 'Yeterli';
};

onMounted(() => {
  verileriGetir();
});
</script>
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Stok Girişleri</h1>
      <button @click="formModaliniAc()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
        + Yeni Stok Girişi
      </button>
    </div>

    <!-- FİLTRELEME ALANI -->
    <div class="bg-white shadow-md rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label-style">Ürün Ara</label>
          <input v-model="filtreler.urunArama" type="text" placeholder="Ürün kodu veya açıklama..." class="form-input">
        </div>
        <div>
          <label class="label-style">Depo</label>
          <select v-model="filtreler.depoId" class="form-input">
            <option :value="null">Tümü</option>
            <option v-for="depo in depolar" :key="depo.id" :value="depo.id">{{ depo.ad }}</option>
          </select>
        </div>
        <div>
          <label class="label-style">Başlangıç Tarihi</label>
          <input v-model="filtreler.baslangicTarihi" type="date" class="form-input">
        </div>
        <div>
          <label class="label-style">Bitiş Tarihi</label>
          <input v-model="filtreler.bitisTarihi" type="date" class="form-input">
        </div>
      </div>
      <div class="mt-4 flex justify-end space-x-2">
        <button @click="filtreleriTemizle" class="btn-secondary">Filtreleri Temizle</button>
        <button @click="hareketleriGetir" class="btn-primary">Filtrele</button>
      </div>
    </div>
    
    <!-- STOK HAREKETLERİ LİSTESİ -->
    <div class="bg-white shadow-md rounded-lg overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th @click="siralamaYap('olusturulma_tarihi')" class="th-style cursor-pointer hover:bg-gray-200">
              <div class="flex items-center">
                <span>Tarih</span>
                <span v-if="sortBy === 'olusturulma_tarihi'" class="ml-2">
                  <svg v-if="sortDirection === 'desc'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                </span>
              </div>
            </th>
            <th class="th-style">Ürün Kodu</th>
            <th class="th-style">Ürün Açıklama</th>
            <th class="th-style">Depo</th>
            <th @click="siralamaYap('miktar')" class="th-style cursor-pointer hover:bg-gray-200">
              <div class="flex items-center">
                <span>Miktar</span>
                <span v-if="sortBy === 'miktar'" class="ml-2">
                  <svg v-if="sortDirection === 'desc'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                </span>
              </div>
            </th>
            <th class="th-style">Önceki Stok</th>
            <th class="th-style">Sonraki Stok</th>
            <th class="th-style">Açıklama</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="text-center py-4">Yükleniyor...</td>
          </tr>
          <tr v-else-if="stokHareketleri.length === 0">
            <td colspan="8" class="text-center py-4 text-gray-500">
              {{ filtreler.urunArama || filtreler.depoId || filtreler.baslangicTarihi || filtreler.bitisTarihi 
                ? 'Filtreye uygun kayıt bulunamadı.' 
                : 'Henüz stok girişi yapılmamış.' }}
            </td>
          </tr>
          <tr v-else v-for="hareket in stokHareketleri" :key="hareket.id" class="hover:bg-gray-50">
            <td class="td-style">
              <p class="text-gray-900 whitespace-no-wrap">{{ formatTarih(hareket.olusturulma_tarihi) }}</p>
            </td>
            <td class="td-style">
              <p class="text-gray-900 font-semibold">{{ hareket.urunler?.urun_kodu || '-' }}</p>
            </td>
            <td class="td-style">
              <p class="text-gray-700">{{ hareket.urunler?.aciklama || '-' }}</p>
            </td>
            <td class="td-style">
              <p class="text-gray-900">{{ hareket.depolar?.ad || '-' }}</p>
            </td>
            <td class="td-style">
              <p class="text-green-600 font-bold">+{{ hareket.miktar }}</p>
            </td>
            <td class="td-style">
              <p class="text-gray-600">{{ hareket.onceki_miktar || 0 }}</p>
            </td>
            <td class="td-style">
              <p class="text-blue-600 font-semibold">{{ hareket.sonraki_miktar || 0 }}</p>
            </td>
            <td class="td-style">
              <p class="text-gray-600 text-sm">{{ hareket.aciklama || '-' }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- YENİ STOK GİRİŞİ MODAL'I -->
    <BaseModal :show="formModalGoster" @close="formModalGoster = false">
      <template #header>Yeni Stok Girişi</template>
      <template #body>
         <div class="space-y-4">
            <div>
              <label class="label-style">Ürün (*)</label>
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
            <div>
              <label class="label-style">Açıklama</label>
              <textarea v-model="yeniGiris.aciklama" rows="3" class="form-input" placeholder="İsteğe bağlı açıklama..."></textarea>
            </div>
         </div>
      </template>
       <template #footer>
        <button @click="formModalGoster = false" class="btn-secondary">İptal</button>
        <button @click="stokGirisiKaydet" :disabled="kayitYapiliyor" class="btn-primary ml-2">
          {{ kayitYapiliyor ? 'Kaydediliyor...' : 'Kaydet' }}
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
.btn-primary { @apply bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed; }
.btn-secondary { @apply bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded; }
</style>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase.js';
import { useUserStore } from '../stores/userStore.js';
import BaseModal from '../components/BaseModal.vue';

const userStore = useUserStore();
const formModalGoster = ref(false);
const loading = ref(false);
const kayitYapiliyor = ref(false);
const depolar = ref([]);
const urunAramaMetni = ref('');
const urunAramaSonuclari = ref([]);
const stokHareketleri = ref([]);

const sortBy = ref('olusturulma_tarihi');
const sortDirection = ref('desc');

const filtreler = ref({
  urunArama: '',
  depoId: null,
  baslangicTarihi: '',
  bitisTarihi: ''
});

const yeniGiris = ref({
  urun_id: null,
  depo_id: null,
  miktar: 0,
  aciklama: ''
});

const formModaliniAc = () => {
  yeniGiris.value = { urun_id: null, depo_id: null, miktar: 0, aciklama: '' };
  urunAramaMetni.value = '';
  urunAramaSonuclari.value = [];
  formModalGoster.value = true;
};

// Depoları çek
onMounted(async () => {
  const { data: depolarData } = await supabase.from('depolar').select('*');
  depolar.value = depolarData || [];
  await hareketleriGetir();
});

// Stok hareketlerini getir
const hareketleriGetir = async () => {
  loading.value = true;
  try {
    let query = supabase
      .from('stok_hareketleri')
      .select(`
        *,
        urunler (urun_kodu, aciklama, ana_birim),
        depolar (ad)
      `)
      .eq('hareket_tipi', 'giris')
      .order(sortBy.value, { ascending: sortDirection.value === 'asc' });

    // Filtreler
    if (filtreler.value.depoId) {
      query = query.eq('depo_id', filtreler.value.depoId);
    }
    
    if (filtreler.value.baslangicTarihi) {
      query = query.gte('olusturulma_tarihi', filtreler.value.baslangicTarihi);
    }
    
    if (filtreler.value.bitisTarihi) {
      const bitisTarihiSonrasi = new Date(filtreler.value.bitisTarihi);
      bitisTarihiSonrasi.setDate(bitisTarihiSonrasi.getDate() + 1);
      query = query.lt('olusturulma_tarihi', bitisTarihiSonrasi.toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    // Ürün arama filtresi (frontend'de)
    if (filtreler.value.urunArama) {
      const arama = filtreler.value.urunArama.toLowerCase();
      stokHareketleri.value = (data || []).filter(h => 
        h.urunler?.urun_kodu?.toLowerCase().includes(arama) || 
        h.urunler?.aciklama?.toLowerCase().includes(arama)
      );
    } else {
      stokHareketleri.value = data || [];
    }
  } catch (error) {
    console.error('Stok hareketleri çekilirken hata:', error.message);
    alert('Hata: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// Sıralama
const siralamaYap = (kolon) => {
  if (sortBy.value === kolon) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = kolon;
    sortDirection.value = 'desc';
  }
  hareketleriGetir();
};

// Filtreleri temizle
const filtreleriTemizle = () => {
  filtreler.value = {
    urunArama: '',
    depoId: null,
    baslangicTarihi: '',
    bitisTarihi: ''
  };
  hareketleriGetir();
};

// Ürün arama mantığı
let debounceTimer;
const urunAra = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (urunAramaMetni.value.length < 2) { 
      urunAramaSonuclari.value = []; 
      return; 
    }
    const { data } = await supabase
      .from('urunler')
      .select('id, urun_kodu, aciklama')
      .or(`urun_kodu.ilike.%${urunAramaMetni.value}%,aciklama.ilike.%${urunAramaMetni.value}%`)
      .limit(10);
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
  const { urun_id, depo_id, miktar, aciklama } = yeniGiris.value;

  if (!urun_id || !depo_id || !miktar || miktar <= 0) {
    alert('Lütfen tüm zorunlu alanları doldurun ve miktar 0\'dan büyük olsun.');
    return;
  }

  try {
    kayitYapiliyor.value = true;
    
    const { data, error } = await supabase.rpc('stok_arttir', {
      p_urun_id: urun_id,
      p_depo_id: depo_id,
      p_miktar: miktar,
      p_aciklama: aciklama || null,
      p_kullanici_id: userStore.user?.id || null
    });

    if (error) throw error;
    
    if (data && !data.success) {
      throw new Error(data.message || 'Stok girişi başarısız');
    }

    alert('Stok girişi başarıyla yapıldı!');
    formModalGoster.value = false;
    await hareketleriGetir(); // Listeyi yenile
  } catch (err) {
    console.error("Stok girişi hatası:", err);
    alert('Hata: ' + err.message);
  } finally {
    kayitYapiliyor.value = false;
  }
};

// Tarih formatlama
const formatTarih = (tarih) => {
  if (!tarih) return '-';
  const date = new Date(tarih);
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>
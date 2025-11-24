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
            <th class="th-style">Anlaşma</th>
            <th @click="siralamaYap('miktar')" class="th-style cursor-pointer hover:bg-gray-200">
              <div class="flex items-center">
                <span>Miktar</span>
                <span v-if="sortBy === 'miktar'" class="ml-2">
                  <svg v-if="sortDirection === 'desc'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                </span>
              </div>
            </th>
            <th class="th-style text-right">Tutar</th> <!-- Yeni Kolon -->
            <th class="th-style">Açıklama</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9" class="text-center py-4">Yükleniyor...</td>
          </tr>
          <tr v-else-if="stokHareketleri.length === 0">
            <td colspan="9" class="text-center py-4 text-gray-500">
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
              <p class="text-indigo-600 text-sm">{{ hareket.anlasmalar?.ad || '-' }}</p>
            </td>
            <td class="td-style">
              <p class="text-green-600 font-bold">+{{ hareket.miktar }}</p>
            </td>
            <td class="td-style text-right">
              <p v-if="hareket.tutar > 0" class="text-gray-800 font-mono">{{ formatPara(hareket.tutar) }}</p>
              <p v-else class="text-gray-400">-</p>
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
            
            <!-- ANLAŞMA SEÇİMİ -->
            <div class="bg-blue-50 p-3 rounded border border-blue-100">
              <label class="flex items-center space-x-2 cursor-pointer mb-2">
                <input type="checkbox" v-model="anlasmaDahilinde" class="form-checkbox h-4 w-4 text-indigo-600">
                <span class="text-gray-700 font-medium">Anlaşma Dahilinde mi?</span>
              </label>
              
              <div v-if="anlasmaDahilinde">
                <label class="label-style">Anlaşma Seçiniz (*)</label>
                <select v-model="yeniGiris.anlasma_id" @change="anlasmaDegisti" class="form-input">
                  <option :value="null" disabled>Anlaşma Seçin</option>
                  <option v-for="anlasma in aktifAnlasmalar" :key="anlasma.id" :value="anlasma.id">
                    {{ anlasma.ad }} ({{ anlasma.tedarikciler?.ad }} - {{ anlasma.tip }})
                  </option>
                </select>
                
                <!-- TUTAR BAZLI İSE TUTAR GİRİŞİ -->
                <div v-if="secilenAnlasmaTipi === 'Tutar Bazlı'" class="mt-3 p-2 bg-white rounded border border-blue-200">
                  <label class="label-style text-blue-800">Toplam Giriş Tutarı (TL) (*)</label>
                  <input v-model.number="yeniGiris.tutar" type="number" step="0.01" class="form-input border-blue-300 focus:ring-blue-500" placeholder="0.00">
                  <p class="text-xs text-blue-600 mt-1">Bu tutar anlaşma kotasından düşülecektir.</p>
                </div>
              </div>
            </div>

            <div>
              <label class="label-style">Ürün (*)</label>
               <div class="relative mt-1">
                <input 
                  type="text" 
                  v-model="urunAramaMetni" 
                  @input="urunAra" 
                  :placeholder="urunAramaPlaceholder" 
                  class="form-input" 
                  :disabled="anlasmaDahilinde && !yeniGiris.anlasma_id && secilenAnlasmaTipi === 'Ürün Bazlı'"
                />
                <div v-if="urunAramaSonuclari.length > 0" class="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                  <ul>
                    <li v-for="urun in urunAramaSonuclari" :key="urun.id" @click="urunSec(urun)" class="p-2 hover:bg-gray-100 cursor-pointer">
                      <span class="font-bold">{{ urun.urun_kodu }}</span> - {{ urun.aciklama }}
                    </li>
                  </ul>
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
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '../supabase.js';
import { useUserStore } from '../stores/userStore.js';
import BaseModal from '../components/BaseModal.vue';

const userStore = useUserStore();
const formModalGoster = ref(false);
const loading = ref(false);
const kayitYapiliyor = ref(false);
const depolar = ref([]);
const aktifAnlasmalar = ref([]);
const anlasmaDahilinde = ref(false);

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
  anlasma_id: null,
  miktar: 0,
  tutar: 0, // YENİ: Tutar alanı
  aciklama: ''
});

const secilenAnlasmaTipi = computed(() => {
  if (!yeniGiris.value.anlasma_id) return null;
  const anlasma = aktifAnlasmalar.value.find(a => a.id === yeniGiris.value.anlasma_id);
  return anlasma ? anlasma.tip : null;
});

const urunAramaPlaceholder = computed(() => {
  if (anlasmaDahilinde.value && !yeniGiris.value.anlasma_id) {
    return 'Önce anlaşma seçiniz...';
  }
  return 'Ürün kodu veya açıklama...';
});

const formModaliniAc = async () => {
  yeniGiris.value = { urun_id: null, depo_id: null, anlasma_id: null, miktar: 0, tutar: 0, aciklama: '' };
  anlasmaDahilinde.value = false;
  urunAramaMetni.value = '';
  urunAramaSonuclari.value = [];
  
  const { data } = await supabase
    .from('anlasmalar')
    .select('*, tedarikciler(ad), anlasma_kalemleri(urun_id)')
    .eq('aktif_mi', true);
  
  aktifAnlasmalar.value = data || [];
  
  formModalGoster.value = true;
};

// Anlaşma checkbox değişince
watch(anlasmaDahilinde, (val) => {
  if (!val) {
    yeniGiris.value.anlasma_id = null;
    yeniGiris.value.tutar = 0;
  }
  yeniGiris.value.urun_id = null;
  urunAramaMetni.value = '';
});

const anlasmaDegisti = () => {
  yeniGiris.value.urun_id = null;
  yeniGiris.value.tutar = 0; // Anlaşma değişince tutarı sıfırla
  urunAramaMetni.value = '';
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
        depolar (ad),
        anlasmalar (ad) 
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
  yeniGiris.value.urun_id = null;

  // Anlaşma seçili ve ürün bazlı ise, ürün listesini kısıtla
  if (anlasmaDahilinde.value && yeniGiris.value.anlasma_id) {
    const secilenAnlasma = aktifAnlasmalar.value.find(a => a.id === yeniGiris.value.anlasma_id);
    if (secilenAnlasma && secilenAnlasma.tip === 'Ürün Bazlı') {
      const anlasmaUrunIds = secilenAnlasma.anlasma_kalemleri.map(k => k.urun_id);
      
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        if (urunAramaMetni.value.length < 2) { 
          urunAramaSonuclari.value = []; 
          return; 
        }
        const { data } = await supabase
          .from('urunler')
          .select('id, urun_kodu, aciklama')
          .in('id', anlasmaUrunIds) // KISITLAMA
          .or(`urun_kodu.ilike.%${urunAramaMetni.value}%,aciklama.ilike.%${urunAramaMetni.value}%`)
          .limit(10);
        urunAramaSonuclari.value = data || [];
      }, 300);
      return;
    }
  }

  // Normal arama
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
  const { urun_id, depo_id, miktar, aciklama, anlasma_id, tutar } = yeniGiris.value;

  if (!urun_id || !depo_id || !miktar || miktar <= 0) {
    alert('Lütfen listeden geçerli bir ürün seçin, depoyu belirtin ve miktarı girin.');
    return;
  }

  if (anlasmaDahilinde.value) {
    if (!anlasma_id) {
      alert('Lütfen bir anlaşma seçin.');
      return;
    }
    // Tutar bazlı ise tutar zorunlu
    if (secilenAnlasmaTipi.value === 'Tutar Bazlı' && (!tutar || tutar <= 0)) {
      alert('Tutar bazlı anlaşma seçildiğinde geçerli bir tutar girilmelidir.');
      return;
    }
  }

  try {
    kayitYapiliyor.value = true;
    
    const { error: hareketError } = await supabase.from('stok_hareketleri').insert([{
        urun_id: urun_id,
        depo_id: depo_id,
        hareket_tipi: 'giris',
        miktar: miktar,
        aciklama: aciklama || null,
        kullanici_id: userStore.user?.id || null,
        anlasma_id: anlasmaDahilinde.value ? anlasma_id : null,
        tutar: (anlasmaDahilinde.value && secilenAnlasmaTipi.value === 'Tutar Bazlı') ? tutar : 0 // TUTAR KAYDI
    }]);

    if (hareketError) throw hareketError;

    // Stok seviyesini güncelle
    const { data: mevcutStok, error: stokGetirError } = await supabase
      .from('stok_seviyeleri')
      .select('*')
      .eq('urun_id', urun_id)
      .eq('depo_id', depo_id)
      .single();

    if (stokGetirError && stokGetirError.code !== 'PGRST116') throw stokGetirError;

    if (mevcutStok) {
      const { error: updateError } = await supabase
        .from('stok_seviyeleri')
        .update({ miktar: mevcutStok.miktar + miktar })
        .eq('id', mevcutStok.id);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('stok_seviyeleri')
        .insert([{ urun_id, depo_id, miktar }]);
      if (insertError) throw insertError;
    }

    alert('Stok girişi başarıyla yapıldı!');
    formModalGoster.value = false;
    await hareketleriGetir(); 
  } catch (err) {
    console.error("Stok girişi hatası:", err);
    alert('Hata: ' + err.message);
  } finally {
    kayitYapiliyor.value = false;
  }
};

const formatTarih = (tarih) => {
  if (!tarih) return '-';
  const date = new Date(tarih);
  return date.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatPara = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0);
</script>
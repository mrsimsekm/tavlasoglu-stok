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
            <th class="th-style text-right">Tutar</th>
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

    <!-- YENİ STOK GİRİŞİ MODAL'I (Toplu Ekleme Yapısı) -->
    <BaseModal :show="formModalGoster" @close="formModalGoster = false" max-width="max-w-4xl">
      <template #header>Yeni Stok Girişi (Toplu)</template>
      <template #body>
         <div class="space-y-6">
            
            <!-- 1. GENEL BİLGİLER (Tüm kalemler için ortak) -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label-style">Hangi Depoya Giriş Yapılacak? (*)</label>
                <select v-model="genelBilgiler.depo_id" class="form-input bg-white">
                  <option :value="null" disabled>Depo Seçin</option>
                  <option v-for="depo in depolar" :key="depo.id" :value="depo.id">{{ depo.ad }}</option>
                </select>
              </div>
              
              <div>
                <label class="flex items-center space-x-2 cursor-pointer mb-1 mt-1">
                  <input type="checkbox" v-model="anlasmaDahilinde" class="form-checkbox h-4 w-4 text-indigo-600">
                  <span class="text-gray-700 font-medium text-sm">Anlaşma Dahilinde mi?</span>
                </label>
                <select v-model="genelBilgiler.anlasma_id" :disabled="!anlasmaDahilinde" class="form-input bg-white disabled:bg-gray-100 disabled:text-gray-400">
                  <option :value="null">Anlaşma Seçin</option>
                  <option v-for="anlasma in aktifAnlasmalar" :key="anlasma.id" :value="anlasma.id">
                    {{ anlasma.ad }} ({{ anlasma.tedarikciler?.ad }})
                  </option>
                </select>
              </div>
            </div>

            <!-- 2. KALEM EKLEME ALANI -->
            <div class="border-t pt-4">
              <h3 class="text-sm font-bold text-gray-700 mb-2">Listeye Ürün Ekle</h3>
              <div class="flex flex-col md:flex-row gap-2 items-end bg-blue-50 p-3 rounded-lg border border-blue-100">
                <!-- Ürün Arama -->
                <div class="w-full md:w-4/12 relative">
                  <label class="text-xs font-medium text-gray-500 mb-1 block">Ürün (*)</label>
                  <input 
                    type="text" 
                    v-model="urunAramaMetni" 
                    @input="urunAra" 
                    :placeholder="urunAramaPlaceholder" 
                    class="form-input"
                    :disabled="anlasmaDahilinde && !genelBilgiler.anlasma_id && secilenAnlasmaTipi === 'Ürün Bazlı'"
                  />
                  <div v-if="urunAramaSonuclari.length > 0" class="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    <ul>
                      <li v-for="urun in urunAramaSonuclari" :key="urun.id" @click="urunSec(urun)" class="p-2 hover:bg-gray-100 cursor-pointer text-sm">
                        <span class="font-bold">{{ urun.urun_kodu }}</span> - {{ urun.aciklama }}
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Miktar -->
                <div class="w-full md:w-2/12">
                  <label class="text-xs font-medium text-gray-500 mb-1 block">Miktar (*)</label>
                  <input v-model.number="aktifSatir.miktar" type="number" min="1" class="form-input text-right" placeholder="0">
                </div>

                <!-- Tutar (Opsiyonel veya Anlaşmaya bağlı) -->
                <div class="w-full md:w-2/12">
                  <label class="text-xs font-medium text-gray-500 mb-1 block">Top. Tutar (TL)</label>
                  <input v-model.number="aktifSatir.tutar" type="number" min="0" step="0.01" class="form-input text-right" placeholder="0.00">
                </div>

                <!-- Açıklama -->
                <div class="w-full md:w-3/12">
                  <label class="text-xs font-medium text-gray-500 mb-1 block">Açıklama</label>
                  <input v-model="aktifSatir.aciklama" type="text" class="form-input" placeholder="Not...">
                </div>

                <!-- Ekle Butonu -->
                <div class="w-full md:w-1/12">
                  <button @click="satirEkle" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded h-[42px] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 3. EKLENEN LİSTE -->
            <div v-if="girisListesi.length > 0" class="border rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Ürün</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Miktar</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Tutar</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Açıklama</th>
                    <th class="px-4 py-2 text-center text-xs font-medium text-gray-500">Sil</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(item, index) in girisListesi" :key="index">
                    <td class="px-4 py-2 text-sm text-gray-900">{{ item.urun_adi }}</td>
                    <td class="px-4 py-2 text-sm text-gray-900 text-right font-bold">{{ item.miktar }}</td>
                    <td class="px-4 py-2 text-sm text-gray-900 text-right">{{ formatPara(item.tutar) }}</td>
                    <td class="px-4 py-2 text-sm text-gray-500">{{ item.aciklama || '-' }}</td>
                    <td class="px-4 py-2 text-center">
                      <button @click="satirSil(index)" class="text-red-500 hover:text-red-700 font-bold text-lg">&times;</button>
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-50">
                  <tr>
                    <td class="px-4 py-2 text-sm font-bold text-gray-700">TOPLAM</td>
                    <td class="px-4 py-2 text-right text-sm font-bold text-gray-900">{{ toplamMiktar }}</td>
                    <td class="px-4 py-2 text-right text-sm font-bold text-gray-900">{{ formatPara(toplamTutar) }}</td>
                    <td colspan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div v-else class="text-center py-6 bg-gray-50 border border-dashed rounded text-gray-400 text-sm">
              Henüz ürün eklenmedi.
            </div>

         </div>
      </template>
       <template #footer>
        <button @click="formModalGoster = false" class="btn-secondary">İptal</button>
        <button @click="topluKaydet" :disabled="kayitYapiliyor || girisListesi.length === 0" class="btn-primary ml-2">
          {{ kayitYapiliyor ? 'Kaydediliyor...' : 'Tümünü Kaydet' }}
        </button>
      </template>
    </BaseModal>

  </div>
</template>

<style scoped>
.th-style { @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider; }
.td-style { @apply px-5 py-5 border-b border-gray-200 bg-white text-sm; }
.label-style { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm; }
.btn-primary { @apply bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed; }
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

// Filtreler
const filtreler = ref({
  urunArama: '',
  depoId: null,
  baslangicTarihi: '',
  bitisTarihi: ''
});

// YENİ YAPI: Genel Bilgiler + Liste
const genelBilgiler = ref({
  depo_id: null,
  anlasma_id: null
});

const aktifSatir = ref({
  urun_id: null,
  urun_adi: '',
  miktar: '',
  tutar: '',
  aciklama: ''
});

const girisListesi = ref([]);

const toplamMiktar = computed(() => girisListesi.value.reduce((sum, item) => sum + item.miktar, 0));
const toplamTutar = computed(() => girisListesi.value.reduce((sum, item) => sum + (item.tutar || 0), 0));

const secilenAnlasmaTipi = computed(() => {
  if (!genelBilgiler.value.anlasma_id) return null;
  const anlasma = aktifAnlasmalar.value.find(a => a.id === genelBilgiler.value.anlasma_id);
  return anlasma ? anlasma.tip : null;
});

const urunAramaPlaceholder = computed(() => {
  if (anlasmaDahilinde.value && !genelBilgiler.value.anlasma_id) {
    return 'Önce anlaşma seçiniz...';
  }
  return 'Ürün kodu veya açıklama...';
});

const formModaliniAc = async () => {
  genelBilgiler.value = { depo_id: null, anlasma_id: null };
  girisListesi.value = [];
  temizleAktifSatir();
  anlasmaDahilinde.value = false;
  
  const { data } = await supabase
    .from('anlasmalar')
    .select('*, tedarikciler(ad), anlasma_kalemleri(urun_id)')
    .eq('aktif_mi', true);
  
  aktifAnlasmalar.value = data || [];
  formModalGoster.value = true;
};

const temizleAktifSatir = () => {
  aktifSatir.value = { urun_id: null, urun_adi: '', miktar: '', tutar: '', aciklama: '' };
  urunAramaMetni.value = '';
  urunAramaSonuclari.value = [];
};

// Anlaşma checkbox değişince
watch(anlasmaDahilinde, (val) => {
  if (!val) {
    genelBilgiler.value.anlasma_id = null;
  }
  temizleAktifSatir();
});

watch(() => genelBilgiler.value.anlasma_id, () => {
  temizleAktifSatir(); // Anlaşma değişince ürün aramayı sıfırla (kısıtlamalar değiştiği için)
});

// Depoları çek
onMounted(async () => {
  const { data: depolarData } = await supabase.from('depolar').select('*');
  depolar.value = depolarData || [];
  await hareketleriGetir();
});

// Stok hareketlerini getir (Liste Görünümü İçin)
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

    if (filtreler.value.depoId) query = query.eq('depo_id', filtreler.value.depoId);
    if (filtreler.value.baslangicTarihi) query = query.gte('olusturulma_tarihi', filtreler.value.baslangicTarihi);
    if (filtreler.value.bitisTarihi) {
      const bitisTarihiSonrasi = new Date(filtreler.value.bitisTarihi);
      bitisTarihiSonrasi.setDate(bitisTarihiSonrasi.getDate() + 1);
      query = query.lt('olusturulma_tarihi', bitisTarihiSonrasi.toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    if (error) throw error;
    
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

const siralamaYap = (kolon) => {
  if (sortBy.value === kolon) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = kolon;
    sortDirection.value = 'desc';
  }
  hareketleriGetir();
};

const filtreleriTemizle = () => {
  filtreler.value = { urunArama: '', depoId: null, baslangicTarihi: '', bitisTarihi: '' };
  hareketleriGetir();
};

// Ürün arama
let debounceTimer;
const urunAra = () => {
  aktifSatir.value.urun_id = null;

  if (anlasmaDahilinde.value && genelBilgiler.value.anlasma_id) {
    const secilenAnlasma = aktifAnlasmalar.value.find(a => a.id === genelBilgiler.value.anlasma_id);
    if (secilenAnlasma && secilenAnlasma.tip === 'Ürün Bazlı') {
      const anlasmaUrunIds = secilenAnlasma.anlasma_kalemleri.map(k => k.urun_id);
      
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        if (urunAramaMetni.value.length < 2) { urunAramaSonuclari.value = []; return; }
        const { data } = await supabase.from('urunler').select('id, urun_kodu, aciklama').in('id', anlasmaUrunIds).or(`urun_kodu.ilike.%${urunAramaMetni.value}%,aciklama.ilike.%${urunAramaMetni.value}%`).limit(10);
        urunAramaSonuclari.value = data || [];
      }, 300);
      return;
    }
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (urunAramaMetni.value.length < 2) { urunAramaSonuclari.value = []; return; }
    const { data } = await supabase.from('urunler').select('id, urun_kodu, aciklama').or(`urun_kodu.ilike.%${urunAramaMetni.value}%,aciklama.ilike.%${urunAramaMetni.value}%`).limit(10);
    urunAramaSonuclari.value = data || [];
  }, 300);
};

const urunSec = (urun) => {
  aktifSatir.value.urun_id = urun.id;
  aktifSatir.value.urun_adi = `${urun.urun_kodu} - ${urun.aciklama}`;
  urunAramaMetni.value = aktifSatir.value.urun_adi;
  urunAramaSonuclari.value = [];
};

// Satır Ekle / Sil
const satirEkle = () => {
  if (!aktifSatir.value.urun_id) { alert("Lütfen bir ürün seçin."); return; }
  if (!aktifSatir.value.miktar || aktifSatir.value.miktar <= 0) { alert("Geçerli bir miktar girin."); return; }

  girisListesi.value.push({ ...aktifSatir.value });
  temizleAktifSatir();
};

const satirSil = (index) => {
  girisListesi.value.splice(index, 1);
};

// TOPLU KAYDET
const topluKaydet = async () => {
  if (!genelBilgiler.value.depo_id) { alert('Lütfen bir depo seçin.'); return; }
  if (anlasmaDahilinde.value && !genelBilgiler.value.anlasma_id) { alert('Lütfen bir anlaşma seçin.'); return; }
  if (girisListesi.value.length === 0) { alert('Listeye en az bir ürün eklemelisiniz.'); return; }

  try {
    kayitYapiliyor.value = true;
    
    // Tüm satırları tek tek işle (Supabase transaction desteği olmadığı için loop daha güvenli)
    for (const satir of girisListesi.value) {
      const { error: hareketError } = await supabase.from('stok_hareketleri').insert([{
          urun_id: satir.urun_id,
          depo_id: genelBilgiler.value.depo_id,
          hareket_tipi: 'giris',
          miktar: satir.miktar,
          aciklama: satir.aciklama || null,
          kullanici_id: userStore.user?.id || null,
          anlasma_id: anlasmaDahilinde.value ? genelBilgiler.value.anlasma_id : null,
          tutar: satir.tutar || 0
      }]);

      if (hareketError) throw hareketError;

      // Stok seviyesini güncelle
      const { data: mevcutStok } = await supabase
        .from('stok_seviyeleri')
        .select('*')
        .eq('urun_id', satir.urun_id)
        .eq('depo_id', genelBilgiler.value.depo_id)
        .single();

      if (mevcutStok) {
        await supabase.from('stok_seviyeleri').update({ miktar: mevcutStok.miktar + satir.miktar }).eq('id', mevcutStok.id);
      } else {
        await supabase.from('stok_seviyeleri').insert([{ urun_id: satir.urun_id, depo_id: genelBilgiler.value.depo_id, miktar: satir.miktar }]);
      }
    }

    alert('Tüm stok girişleri başarıyla kaydedildi!');
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
  return new Date(tarih).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatPara = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0);
</script>
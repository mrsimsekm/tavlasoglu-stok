<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Stok Girişleri</h1>
      <button @click="formModaliniAc()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-150">
        + Yeni Stok Girişi
      </button>
    </div>

    <!-- FİLTRELEME ALANI -->
    <div class="bg-white shadow-md rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label-style">Ürün Ara</label>
          <input v-model="filtreler.urunArama" type="text" placeholder="Ürün kodu, açıklama..." class="form-input">
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
    
    <!-- STOK GİRİŞ FİŞLERİ LİSTESİ -->
    <div class="bg-white shadow-md rounded-lg overflow-x-auto">
      <table class="min-w-full leading-normal table-fixed">
        <thead>
          <tr>
            <th class="th-style w-10 text-center"></th>
            <th class="th-style w-40">Tarih</th>
            <th class="th-style w-32">İşlem ID</th>
            <th class="th-style w-auto">Depo & Anlaşma</th>
            <th class="th-style w-24 text-center">Kalem</th>
            <th class="th-style w-32 text-right">Top. Miktar</th>
            <th class="th-style w-32 text-right">Top. Tutar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center py-4">Yükleniyor...</td>
          </tr>
          <tr v-else-if="gruplanmisHareketler.length === 0">
            <td colspan="7" class="text-center py-4 text-gray-500">
              Kayıt bulunamadı.
            </td>
          </tr>
          <template v-else v-for="grup in gruplanmisHareketler" :key="grup.id">
            <tr 
              class="hover:bg-gray-100 transition duration-150 border-b border-gray-200 cursor-pointer h-14"
              :class="{'bg-indigo-50': acikGruplar.has(grup.id)}"
              @click="toggleGrup(grup.id)"
            >
              <td class="px-2 py-3 text-center">
                <svg 
                  class="w-5 h-5 text-gray-500 transition-transform duration-200" 
                  :class="{'rotate-90': acikGruplar.has(grup.id)}" 
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </td>
              <td class="px-5 py-3">
                <p class="text-gray-900 font-semibold">{{ formatTarih(grup.tarih) }}</p>
              </td>
              <td class="px-5 py-3">
                <span class="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded border">
                  #{{ grup.id.slice(0, 8).toUpperCase() }}
                </span>
              </td>
              <td class="px-5 py-3">
                <div class="flex flex-col">
                  <span class="text-gray-900 font-medium">{{ grup.depo_ad }}</span>
                  <span v-if="grup.anlasma_ad" class="text-xs text-indigo-600 font-medium">
                    {{ grup.anlasma_ad }}
                  </span>
                </div>
              </td>
              <td class="px-5 py-3 text-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ grup.detaylar.length }}
                </span>
              </td>
              <td class="px-5 py-3 text-right">
                <p class="text-gray-900 font-bold">{{ grup.toplam_miktar }}</p>
              </td>
              <td class="px-5 py-3 text-right">
                <p class="text-gray-700 font-mono">{{ formatPara(grup.toplam_tutar) }}</p>
              </td>
            </tr>
            <template v-if="acikGruplar.has(grup.id)">
               <tr class="bg-gray-50 border-b border-gray-200">
                  <td colspan="7" class="p-0">
                    <table class="w-full">
                      <thead>
                        <tr class="text-xs text-gray-500 bg-gray-100 border-b border-gray-200">
                          <th class="pl-16 py-2 text-left w-1/4">Ürün Kodu</th>
                          <th class="py-2 text-left w-1/3">Açıklama</th>
                          <th class="py-2 text-right pr-10">Miktar</th>
                          <th class="py-2 text-right pr-10">Birim Fiyat</th>
                          <th class="py-2 text-right pr-6">Tutar</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="detay in grup.detaylar" :key="detay.id" class="hover:bg-gray-100 border-b border-gray-100 last:border-0">
                          <td class="pl-16 py-2 text-sm font-medium text-gray-800">
                            {{ detay.urunler?.urun_kodu }}
                          </td>
                          <td class="py-2 text-sm text-gray-600">
                            <div>{{ detay.urunler?.aciklama }}</div>
                            <div v-if="detay.aciklama" class="text-xs text-gray-400 italic">{{ detay.aciklama }}</div>
                          </td>
                          <td class="py-2 pr-10 text-right text-sm font-bold text-gray-900">
                            {{ detay.miktar }} <span class="text-xs font-normal text-gray-500">{{ detay.urunler?.ana_birim }}</span>
                          </td>
                          <td class="py-2 pr-10 text-right text-sm text-gray-600 font-mono">
                             {{ detay.tutar && detay.miktar ? formatPara(detay.tutar / detay.miktar) : '-' }}
                          </td>
                          <td class="py-2 pr-6 text-right text-sm font-medium text-gray-800 font-mono">
                            {{ formatPara(detay.tutar) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
               </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>

    <!-- YENİ STOK GİRİŞİ MODAL'I -->
    <BaseModal :show="formModalGoster" @close="formModalGoster = false" max-width="max-w-5xl">
      <template #header>Yeni Stok Girişi (Toplu)</template>
      <template #body>
         <div class="space-y-4">
            
            <!-- 1. GENEL BİLGİLER -->
            <div class="bg-gray-50 p-3 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <!-- 2. KALEM EKLEME / DÜZENLEME ALANI -->
            <div class="border-t pt-2">
              <div class="flex justify-between items-center mb-1">
                <h3 class="text-sm font-bold text-gray-700">
                  {{ duzenlemeModu ? 'Satırı Düzenle' : 'Listeye Ürün Ekle' }}
                </h3>
                <button v-if="duzenlemeModu" @click="temizleAktifSatir" class="text-xs text-red-600 hover:text-red-800 underline">
                  Düzenlemeyi İptal Et
                </button>
              </div>

              <div class="flex flex-col md:flex-row gap-2 items-end bg-blue-50 p-3 rounded-lg border border-blue-100 transition-colors duration-300" :class="{'bg-orange-50 border-orange-200': duzenlemeModu}">
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

                <!-- Tutar -->
                <div class="w-full md:w-2/12">
                  <label class="text-xs font-medium text-gray-500 mb-1 block">Top. Tutar (TL)</label>
                  <input v-model.number="aktifSatir.tutar" type="number" min="0" step="0.01" class="form-input text-right" placeholder="0.00">
                </div>

                <!-- Açıklama -->
                <div class="w-full md:w-3/12">
                  <label class="text-xs font-medium text-gray-500 mb-1 block">Açıklama</label>
                  <input v-model="aktifSatir.aciklama" type="text" class="form-input" placeholder="Not...">
                </div>

                <!-- Ekle / Güncelle Butonu -->
                <div class="w-full md:w-1/12">
                  <button 
                    @click="satirIslemi" 
                    class="w-full font-bold py-2 rounded h-[42px] flex items-center justify-center transition-colors"
                    :class="duzenlemeModu ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'"
                  >
                     <span v-if="duzenlemeModu">OK</span>
                     <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 3. EKLENEN LİSTE (SCROLL FIX & DÜZENLEME) -->
            <div class="border rounded-lg overflow-hidden flex flex-col">
               <!-- Başlık -->
               <div class="bg-gray-100 border-b px-4 py-2 grid grid-cols-12 gap-2 text-xs font-medium text-gray-500">
                  <div class="col-span-4">Ürün</div>
                  <div class="col-span-2 text-right">Miktar</div>
                  <div class="col-span-2 text-right">Tutar</div>
                  <div class="col-span-3">Açıklama</div>
                  <div class="col-span-1 text-center">İşlem</div>
               </div>
               
               <!-- Scroll Edilebilir İçerik (Max Height) -->
               <div class="overflow-y-auto max-h-[250px] bg-white">
                  <div v-if="girisListesi.length === 0" class="text-center py-8 text-gray-400 text-sm">
                    Henüz ürün eklenmedi.
                  </div>
                  <div 
                    v-else 
                    v-for="(item, index) in girisListesi" 
                    :key="index"
                    class="border-b last:border-0 hover:bg-gray-50 px-4 py-2 grid grid-cols-12 gap-2 text-sm items-center transition duration-150"
                    :class="{'bg-orange-50': duzenlenenIndex === index}"
                  >
                      <div class="col-span-4 font-medium text-gray-900 truncate" :title="item.urun_adi">{{ item.urun_adi }}</div>
                      <div class="col-span-2 text-right font-bold">{{ item.miktar }}</div>
                      <div class="col-span-2 text-right text-gray-600">{{ formatPara(item.tutar) }}</div>
                      <div class="col-span-3 text-gray-500 truncate" :title="item.aciklama">{{ item.aciklama || '-' }}</div>
                      
                      <!-- İşlemler -->
                      <div class="col-span-1 flex justify-center space-x-2">
                         <button @click="satirDuzenle(index)" class="text-orange-500 hover:text-orange-700 p-1" title="Düzenle">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                         </button>
                         <button @click="satirSil(index)" class="text-red-500 hover:text-red-700 p-1" title="Sil">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                         </button>
                      </div>
                  </div>
               </div>

               <!-- Toplam Footer -->
               <div class="bg-gray-50 border-t px-4 py-2 grid grid-cols-12 gap-2 text-sm font-bold text-gray-800">
                  <div class="col-span-4">TOPLAM</div>
                  <div class="col-span-2 text-right">{{ toplamMiktar }}</div>
                  <div class="col-span-2 text-right">{{ formatPara(toplamTutar) }}</div>
                  <div class="col-span-4"></div>
               </div>
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
.th-style { @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky top-0; }
.td-style { @apply px-5 py-5 border-b border-gray-200 bg-white text-sm; }
.label-style { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm; }
.btn-primary { @apply bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed; }
.btn-secondary { @apply bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded; }

/* Modal içindeki scrollbar'ı özelleştirme (Opsiyonel) */
.overflow-y-auto::-webkit-scrollbar { width: 6px; }
.overflow-y-auto::-webkit-scrollbar-track { background: #f1f1f1; }
.overflow-y-auto::-webkit-scrollbar-thumb { background: #888; border-radius: 3px; }
.overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #555; }
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
const hamStokHareketleri = ref([]); 
const acikGruplar = ref(new Set()); 

// Filtreler
const filtreler = ref({
  urunArama: '',
  depoId: null,
  baslangicTarihi: '',
  bitisTarihi: ''
});

// Modal Verileri
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
const duzenlenenIndex = ref(null); // Düzenleme modu için state

// Computed
const duzenlemeModu = computed(() => duzenlenenIndex.value !== null);

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

// --- GRUPLAMA MANTIĞI ---
const gruplanmisHareketler = computed(() => {
  if (hamStokHareketleri.value.length === 0) return [];

  const map = new Map();

  hamStokHareketleri.value.forEach(hareket => {
    let key;
    if (hareket.grup_id) {
      key = hareket.grup_id;
    } else {
      const timeKey = new Date(hareket.olusturulma_tarihi).getTime(); 
      key = `${timeKey}-${hareket.depo_id}-${hareket.anlasma_id || 'null'}`;
    }

    if (!map.has(key)) {
      map.set(key, {
        id: key, 
        tarih: hareket.olusturulma_tarihi,
        depo_ad: hareket.depolar?.ad || 'Bilinmeyen Depo',
        anlasma_ad: hareket.anlasmalar?.ad || null,
        toplam_miktar: 0,
        toplam_tutar: 0,
        detaylar: []
      });
    }

    const grup = map.get(key);
    grup.detaylar.push(hareket);
    grup.toplam_miktar += hareket.miktar;
    grup.toplam_tutar += (hareket.tutar || 0);
  });

  return Array.from(map.values()).sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
});

// --- UI FONKSİYONLARI ---
const toggleGrup = (grupId) => {
  if (acikGruplar.value.has(grupId)) {
    acikGruplar.value.delete(grupId);
  } else {
    acikGruplar.value.add(grupId);
  }
};

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
  duzenlenenIndex.value = null; // Düzenleme modundan çık
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
  acikGruplar.value.clear(); 
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
      .order('olusturulma_tarihi', { ascending: false }); 

    if (filtreler.value.depoId) query = query.eq('depo_id', filtreler.value.depoId);
    if (filtreler.value.baslangicTarihi) query = query.gte('olusturulma_tarihi', filtreler.value.baslangicTarihi);
    if (filtreler.value.bitisTarihi) {
      const bitisTarihiSonrasi = new Date(filtreler.value.bitisTarihi);
      bitisTarihiSonrasi.setDate(bitisTarihiSonrasi.getDate() + 1);
      query = query.lt('olusturulma_tarihi', bitisTarihiSonrasi.toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    let filteredData = data || [];
    if (filtreler.value.urunArama) {
      const arama = filtreler.value.urunArama.toLowerCase();
      filteredData = filteredData.filter(h => 
        h.urunler?.urun_kodu?.toLowerCase().includes(arama) || 
        h.urunler?.aciklama?.toLowerCase().includes(arama)
      );
    }
    
    hamStokHareketleri.value = filteredData;

  } catch (error) {
    console.error('Stok hareketleri çekilirken hata:', error.message);
    alert('Hata: ' + error.message);
  } finally {
    loading.value = false;
  }
};

const filtreleriTemizle = () => {
  filtreler.value = { urunArama: '', depoId: null, baslangicTarihi: '', bitisTarihi: '' };
  hareketleriGetir();
};

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

// --- SATIR İŞLEMLERİ (EKLE / GÜNCELLE / SİL) ---
const satirIslemi = () => {
  if (!aktifSatir.value.urun_id) { alert("Lütfen bir ürün seçin."); return; }
  if (!aktifSatir.value.miktar || aktifSatir.value.miktar <= 0) { alert("Geçerli bir miktar girin."); return; }

  if (duzenlemeModu.value) {
    // Güncelleme İşlemi
    girisListesi.value[duzenlenenIndex.value] = { ...aktifSatir.value };
  } else {
    // Ekleme İşlemi (Unshift ile en başa ekle)
    girisListesi.value.unshift({ ...aktifSatir.value });
  }

  temizleAktifSatir();
};

const satirDuzenle = (index) => {
  const item = girisListesi.value[index];
  aktifSatir.value = { ...item };
  urunAramaMetni.value = item.urun_adi; // Arama kutusuna ismi geri yaz
  duzenlenenIndex.value = index;
};

const satirSil = (index) => {
  if (duzenlenenIndex.value === index) {
    temizleAktifSatir();
  }
  girisListesi.value.splice(index, 1);
};

// --- TOPLU KAYDET ---
const topluKaydet = async () => {
  if (!genelBilgiler.value.depo_id) { alert('Lütfen bir depo seçin.'); return; }
  if (anlasmaDahilinde.value && !genelBilgiler.value.anlasma_id) { alert('Lütfen bir anlaşma seçin.'); return; }
  if (girisListesi.value.length === 0) { alert('Listeye en az bir ürün eklemelisiniz.'); return; }

  try {
    kayitYapiliyor.value = true;
    
    const grupId = self.crypto.randomUUID(); 
    const islemZamani = new Date().toISOString(); 

    for (const satir of girisListesi.value) {
      const { error: hareketError } = await supabase.from('stok_hareketleri').insert([{
          urun_id: satir.urun_id,
          depo_id: genelBilgiler.value.depo_id,
          hareket_tipi: 'giris',
          miktar: satir.miktar,
          aciklama: satir.aciklama || null,
          kullanici_id: userStore.user?.id || null,
          anlasma_id: anlasmaDahilinde.value ? genelBilgiler.value.anlasma_id : null,
          tutar: satir.tutar || 0,
          olusturulma_tarihi: islemZamani, 
          grup_id: grupId 
      }]);

      if (hareketError) throw hareketError;

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

    alert('Stok girişi başarıyla kaydedildi!');
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

watch(anlasmaDahilinde, (val) => {
  if (!val) genelBilgiler.value.anlasma_id = null;
  temizleAktifSatir();
});

watch(() => genelBilgiler.value.anlasma_id, () => {
  temizleAktifSatir();
});
</script>
<template>
  <div class="relative min-h-screen">
    <!-- HEADER -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">
          Proforma Detayı <span v-if="isEditing" class="text-yellow-500 text-xl">(Düzenleme Modu)</span>
        </h1>
        <p v-if="proforma" class="text-sm text-gray-500 mt-1">
          No: <span class="font-mono font-semibold text-indigo-600">{{ proforma.proforma_no }}</span>
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <!-- YAZDIR BUTONU -->
        <button v-if="!isEditing" type="button" @click="yazdir" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg flex items-center shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Yazdır
        </button>

        <!-- AKSİYON BUTONLARI -->
        <div v-if="proforma && proforma.durum !== 'Dönüştürüldü'">
          <div v-if="!isEditing" class="flex space-x-2">
            
            <!-- İŞ EMRİNE DÖNÜŞTÜR BUTONU -->
            <button 
              type="button"
              @click="openConvertModal" 
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              İş Emrine Dönüştür
            </button>

            <button type="button" @click="baslaDuzenle" class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              Düzenle
            </button>
          </div>
          
          <div v-else class="flex space-x-2">
            <button type="button" @click="iptalEt" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">İptal</button>
            <button type="button" @click="kaydet" :disabled="loading" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              {{ loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
            </button>
          </div>
        </div>
        
        <RouterLink to="/app/proformalar" class="text-gray-600 hover:text-gray-800">&larr; Geri Dön</RouterLink>
      </div>
    </div>

    <div v-if="fetchLoading" class="text-center p-6">Yükleniyor...</div>
    
    <div v-else-if="proforma" class="space-y-6">
      
      <!-- GENEL BİLGİLER -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Belge Bilgileri</h2>
        
        <div v-if="!isEditing" class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div><p class="label-style">Müşteri</p><p class="font-semibold text-lg">{{ proforma.musteriler?.unvan }}</p></div>
          <div><p class="label-style">İlgili Kişi</p><p class="font-semibold">{{ proforma.ilgili_kisi || proforma.musteriler?.ilgili_kisi || '-' }}</p></div>
          <div><p class="label-style">Oluşturma Tarihi</p><p class="font-semibold">{{ formatTarih(proforma.olusturma_tarihi) }}</p></div>
          <div><p class="label-style">Para Birimi</p><p class="font-bold text-indigo-600">{{ proforma.para_birimi || 'TRY' }}</p></div>
          <div>
            <p class="label-style">Durum</p>
            <span :class="getDurumBadge(proforma.durum)">{{ proforma.durum }}</span>
            <div v-if="proforma.donusturulen_is_emri_id" class="mt-1 text-xs text-indigo-600 hover:underline cursor-pointer" @click="router.push(`/app/is-emirleri/${proforma.donusturulen_is_emri_id}`)">
              İş Emrine Git &rarr;
            </div>
          </div>
          <div>
             <p class="label-style">Geçerlilik Tarihi</p>
             <p class="font-semibold" :class="{'text-red-600': suresiGectiMi(proforma)}">
               {{ formatTarih(proforma.gecerlilik_tarihi) }}
               <span v-if="suresiGectiMi(proforma)" class="text-xs ml-1">(Süresi Doldu)</span>
             </p>
          </div>
          <div class="col-span-2">
            <p class="label-style">Kategoriler</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="kat in (proforma.kategoriler || [])" :key="kat" class="px-2 py-1 bg-gray-100 border rounded text-xs text-gray-600">
                {{ kat }}
              </span>
              <span v-if="!proforma.kategoriler || proforma.kategoriler.length === 0" class="text-gray-400 text-sm italic">Etiket yok</span>
            </div>
          </div>
        </div>

        <!-- Düzenleme Modu -->
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p class="label-style">Müşteri</p>
            <p class="font-semibold p-2 bg-gray-100 rounded border">{{ proforma.musteriler?.unvan }}</p>
          </div>
          <div>
             <label class="label-style">İlgili Kişi</label>
             <input v-model="form.ilgili_kisi" type="text" class="form-input">
          </div>
          <div>
            <label class="label-style">Geçerlilik Tarihi</label>
            <input v-model="form.gecerlilik_tarihi" type="date" class="form-input">
          </div>
          <div>
             <label class="label-style">Para Birimi</label>
             <select v-model="form.para_birimi" class="form-input font-bold">
               <option value="TRY">TRY</option>
               <option value="USD">USD</option>
               <option value="EUR">EUR</option>
               <option value="GBP">GBP</option>
             </select>
          </div>
          <div class="col-span-3">
             <label class="label-style">Kategoriler</label>
             <div class="grid grid-cols-4 gap-2 border p-3 rounded bg-gray-50">
                <label v-for="kat in kategoriListesi" :key="kat" class="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" :value="kat" v-model="form.kategoriler" class="h-4 w-4 text-indigo-600 rounded">
                  <span class="text-xs">{{ kat }}</span>
                </label>
             </div>
          </div>
          <div class="col-span-3">
            <label class="label-style">Notlar</label>
            <textarea v-model="form.notlar" rows="3" class="form-input" placeholder="Notları buraya giriniz..."></textarea>
          </div>
        </div>
      </div>

      <!-- KALEMLER -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4"><h2 class="text-xl font-semibold text-gray-700">Ürün ve Hizmetler</h2></div>
        
        <IsEmriKalemEkle 
           v-if="isEditing" 
           :depolar="depolar" 
           :tedarikciler="tedarikciler" 
           :anlasmalar="anlasmalar" 
           :initialKalemler="guncelKalemler" 
           :proforma-modu="true"
           :para-birimi="form.para_birimi"
           @kalemler-guncellendi="handleKalemlerGuncellendi"
        />

        <!-- Detay Tablosu (YENİ SÜTUNLAR) -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full leading-normal">
            <thead>
              <tr>
                <th class="th-style text-center w-12">#</th>
                <th class="th-style">Açıklama</th>
                <th class="th-style text-center">Miktar</th>
                <th class="th-style text-center">Birim</th>
                <th class="th-style text-right">Birim Fiyat (KDV Hariç)</th>
                <th class="th-style text-right">Tutar (KDV Hariç)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(kalem, index) in proforma.proforma_kalemleri" :key="kalem.id">
                <td class="td-style text-center">{{ index + 1 }}</td>
                <td class="td-style font-medium">{{ kalem.aciklama }}</td>
                <td class="td-style text-center font-bold">{{ kalem.miktar }}</td>
                <td class="td-style text-center text-xs">{{ kalem.birim }}</td>
                <td class="td-style text-right font-mono">{{ formatPara(kalem.birim_fiyat, proforma.para_birimi) }}</td>
                <td class="td-style text-right font-bold text-gray-800 font-mono">{{ formatPara(kalem.miktar * kalem.birim_fiyat, proforma.para_birimi) }}</td>
              </tr>
            </tbody>
          </table>
          
          <!-- Toplamlar Bölümü -->
          <div class="flex justify-end mt-4">
            <div class="w-full max-w-sm space-y-2">
               <div class="flex justify-between text-gray-600">
                  <span>Ara Toplam:</span>
                  <span class="font-semibold">{{ formatPara(toplamlar.araToplam, proforma.para_birimi) }}</span>
               </div>
               <div class="flex justify-between text-gray-600">
                  <span>KDV (%20):</span>
                  <span class="font-semibold">{{ formatPara(toplamlar.kdv, proforma.para_birimi) }}</span>
               </div>
               <div class="flex justify-between text-xl font-bold text-gray-800 border-t pt-2">
                  <span>GENEL TOPLAM:</span>
                  <span class="text-indigo-600">{{ formatPara(toplamlar.genelToplam, proforma.para_birimi) }}</span>
               </div>
            </div>
          </div>
          
          <div v-if="proforma.notlar" class="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p class="text-sm font-bold text-yellow-800 mb-1">NOTLAR:</p>
            <p class="text-sm text-yellow-900 whitespace-pre-wrap">{{ proforma.notlar }}</p>
          </div>
        </div>
      </div>

      <!-- ŞARTLAR VE KOŞULLAR -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4 border-b pb-2">
            <h2 class="text-xl font-semibold text-gray-700">Şartlar ve Koşullar</h2>
            <button v-if="!isEditing" @click="showSartlarModal = true" class="text-xs text-blue-600 hover:text-blue-800 font-bold border border-blue-200 bg-blue-50 px-3 py-1 rounded">
                Şartları Düzenle
            </button>
        </div>
        <div class="bg-gray-50 p-4 rounded border text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto font-mono">
            {{ proforma.sartlar || 'Şart belirtilmemiş.' }}
        </div>
      </div>

    </div>

    <!-- ŞARTLARI DÜZENLEME MODALI -->
    <div v-if="showSartlarModal" class="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
            <div class="px-6 py-4 border-b bg-gray-50 rounded-t-lg"><h3 class="text-lg font-bold text-gray-800">Şartlar ve Koşulları Düzenle</h3></div>
            <div class="p-6 flex-grow overflow-y-auto">
                <textarea v-model="tempSartlar" rows="15" class="w-full border p-3 rounded text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
            </div>
            <div class="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3 rounded-b-lg">
                <button @click="showSartlarModal = false" class="px-4 py-2 bg-gray-300 text-gray-800 rounded font-bold">İptal</button>
                <button @click="sartlariKaydet" class="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Kaydet</button>
            </div>
        </div>
    </div>

    <!-- İŞ EMRİNE DÖNÜŞTÜRME MODALI -->
    <div v-if="showConvertModal" class="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-5xl md:max-h-[90vh] flex flex-col">
        <div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h3 class="text-xl font-bold text-gray-800">İş Emri Oluştur - Kaynak Seçimi</h3>
          <button type="button" @click="showConvertModal = false" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div class="p-6 overflow-y-auto flex-grow">
          <div class="mb-4 bg-blue-50 p-4 rounded text-sm text-blue-800 border border-blue-100 flex justify-between items-center">
             <div>
               Lütfen her kalem için <strong>Kaynak (Hangi depodan çıkacak?)</strong> ve varsa <strong>Anlaşma</strong> seçiniz.
             </div>
             <div class="font-bold text-indigo-700">Para Birimi: {{ proforma.para_birimi || 'TRY' }}</div>
          </div>
          <table class="min-w-full divide-y divide-gray-200 border">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün / Açıklama</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Miktar / Birim</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kaynak Tipi</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kaynak Seçimi <span class="text-red-500">*</span></th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anlaşma</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok Durumu</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(item, idx) in convertItems" :key="idx">
                <td class="px-4 py-4 text-sm font-medium text-gray-900">{{ item.aciklama }}</td>
                <td class="px-4 py-4 text-sm text-center font-bold">{{ item.miktar }} <span class="text-xs text-gray-500">{{ item.birim }}</span></td>
                <td class="px-4 py-4 text-sm">
                  <select v-model="item.sourceType" @change="handleSourceTypeChange(item)" class="border rounded p-1 w-full text-sm">
                    <option value="depo">Depo</option>
                    <option value="tedarikci">Tedarikçi</option>
                    <option value="hizmet">Hizmet/Stoksuz</option>
                  </select>
                </td>
                <td class="px-4 py-4 text-sm">
                  <select v-model="item.selectedSourceId" @change="checkStock(item)" class="border rounded p-1 w-full text-sm" :disabled="item.sourceType === 'hizmet'" :class="{'bg-gray-100': item.sourceType === 'hizmet', 'border-red-500': item.sourceType !== 'hizmet' && !item.selectedSourceId}">
                    <option :value="null">Seçiniz...</option>
                    <template v-if="item.sourceType === 'depo'"><option v-for="d in depolar" :key="d.id" :value="d.id">{{ d.ad }}</option></template>
                    <template v-if="item.sourceType === 'tedarikci'"><option v-for="t in tedarikciler" :key="t.id" :value="t.id">{{ t.ad }}</option></template>
                  </select>
                </td>
                <td class="px-4 py-4 text-sm">
                  <select v-model="item.selectedAgreementId" class="border rounded p-1 w-full text-sm" :disabled="item.sourceType === 'depo' || item.sourceType === 'hizmet'" :class="{'bg-gray-100': item.sourceType === 'depo' || item.sourceType === 'hizmet'}">
                    <option :value="null">Anlaşma Yok</option>
                    <option v-for="a in anlasmalar" :key="a.id" :value="a.id">{{ a.ad }}</option>
                  </select>
                </td>
                <td class="px-4 py-4 text-sm">
                  <div v-if="item.sourceType === 'depo' && item.selectedSourceId">
                    <span v-if="item.checkingStock">Kontrol...</span>
                    <span v-else-if="item.stockError" class="text-red-600 font-bold flex items-center"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>Yetersiz ({{ item.currentStock }})</span>
                    <span v-else class="text-green-600 font-bold flex items-center"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Uygun ({{ item.currentStock }})</span>
                  </div>
                  <span v-else-if="item.sourceType === 'hizmet'" class="text-gray-400 italic">Stoksuz</span>
                  <span v-else class="text-orange-500 text-xs">Seçim Bekleniyor</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="mt-6"><label class="block text-sm font-medium text-gray-700">İş Emri Notu</label><textarea v-model="workOrderNote" rows="2" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="İş emri için özel bir notunuz varsa buraya ekleyin..."></textarea></div>
        </div>
        <div class="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3 rounded-b-lg">
          <button type="button" @click="showConvertModal = false" class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 font-bold">İptal</button>
          <button type="button" @click="convertToWorkOrder" :disabled="converting || hasStockErrors" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed">
            <span v-if="converting" class="mr-2 animate-spin">⟳</span>
            {{ converting ? 'Oluşturuluyor...' : 'Onayla ve İş Emri Oluştur' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.label-style { @apply block text-sm font-medium text-gray-500 mb-1; }
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
.th-style { @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider; }
.td-style { @apply px-5 py-5 border-b border-gray-200 bg-white text-sm; }
</style>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../supabase.js';
import IsEmriKalemEkle from '../components/IsEmriKalemEkle.vue';

const route = useRoute();
const router = useRouter();
const id = route.params.id;

const fetchLoading = ref(true);
const loading = ref(false);
const isEditing = ref(false);
const proforma = ref(null);

const showConvertModal = ref(false);
const showSartlarModal = ref(false);
const tempSartlar = ref('');
const converting = ref(false);
const convertItems = ref([]);
const workOrderNote = ref('');

const form = ref({});
const guncelKalemler = ref([]);
const depolar = ref([]);
const tedarikciler = ref([]);
const anlasmalar = ref([]);

const kategoriListesi = ['KLİMA', 'VRF', 'HAVA PERDESİ', 'SOĞUK ODA', 'ISI POMPASI', 'DX', 'İŞÇİLİK', 'YEDEK PARÇA'];

// --- VERİ ÇEKME ---
const getDetay = async () => {
  fetchLoading.value = true;
  try {
    const { data, error } = await supabase
      .from('proformalar')
      .select(`*, musteriler(*), proforma_kalemleri(*)`) // Basitleştirilmiş sorgu, ilişkiler artık kalem ekle'de
      .eq('id', id)
      .single();

    if (error) throw error;
    proforma.value = data;
    tempSartlar.value = data.sartlar || '';

    const [depolarRes, tedarikcilerRes, anlasmalarRes] = await Promise.all([
      supabase.from('depolar').select('*'),
      supabase.from('tedarikciler').select('*'),
      supabase.from('anlasmalar').select('*, anlasma_kalemleri(urun_id)').eq('aktif_mi', true)
    ]);
    depolar.value = depolarRes.data || [];
    tedarikciler.value = tedarikcilerRes.data || [];
    anlasmalar.value = anlasmalarRes.data || [];

    if (route.query.otomatikDonustur === 'true' && proforma.value.durum !== 'Dönüştürüldü') {
      setTimeout(() => { openConvertModal(); }, 500);
    }
  } catch (err) {
    alert('Veri çekme hatası: ' + err.message);
    router.push('/app/proformalar');
  } finally {
    fetchLoading.value = false;
  }
};

// --- YENİ HESAPLAMA MANTIĞI ---
const toplamlar = computed(() => {
    if (!proforma.value || !proforma.value.proforma_kalemleri) return { araToplam: 0, kdv: 0, genelToplam: 0 };
    const araToplam = proforma.value.proforma_kalemleri.reduce((acc, k) => acc + (k.miktar * k.birim_fiyat), 0);
    const kdv = araToplam * 0.20;
    const genelToplam = araToplam + kdv;
    return { araToplam, kdv, genelToplam };
});

const toplamlarDuzenleme = computed(() => {
    const araToplam = guncelKalemler.value.reduce((acc, k) => acc + (k.miktar * k.birim_fiyat), 0);
    const kdv = araToplam * 0.20;
    const genelToplam = araToplam + kdv;
    return { araToplam, kdv, genelToplam };
});

// --- DÜZENLEME MODU ---
const baslaDuzenle = () => {
  form.value = {
    gecerlilik_tarihi: proforma.value.gecerlilik_tarihi,
    ilgili_kisi: proforma.value.ilgili_kisi || proforma.value.musteriler?.ilgili_kisi || '',
    notlar: proforma.value.notlar,
    para_birimi: proforma.value.para_birimi || 'TRY',
    kategoriler: proforma.value.kategoriler || [] 
  };
  guncelKalemler.value = (proforma.value.proforma_kalemleri || []).map(k => ({ ...k }));
  isEditing.value = true;
};

const iptalEt = () => { isEditing.value = false; getDetay(); };
const handleKalemlerGuncellendi = (liste) => { guncelKalemler.value = liste; };

const sartlariKaydet = async () => {
    try {
        const { error } = await supabase.from('proformalar').update({ sartlar: tempSartlar.value }).eq('id', id);
        if(error) throw error;
        proforma.value.sartlar = tempSartlar.value;
        showSartlarModal.value = false;
        alert("Şartlar güncellendi.");
    } catch(err) {
        alert("Hata: " + err.message);
    }
};

const kaydet = async () => {
  if (guncelKalemler.value.length === 0) { alert('En az bir kalem olmalıdır.'); return; }
  loading.value = true;
  try {
    const { error: mainError } = await supabase.from('proformalar').update({
        gecerlilik_tarihi: form.value.gecerlilik_tarihi,
        ilgili_kisi: form.value.ilgili_kisi,
        notlar: form.value.notlar,
        toplam_tutar: toplamlarDuzenleme.value.genelToplam,
        para_birimi: form.value.para_birimi,
        kategoriler: form.value.kategoriler
      }).eq('id', id);
    if (mainError) throw mainError;

    await supabase.from('proforma_kalemleri').delete().eq('proforma_id', id);

    const kalemlerToInsert = guncelKalemler.value.map(k => ({
      proforma_id: id,
      urun_id: k.urun_id || null,
      aciklama: k.aciklama,
      miktar: k.miktar,
      birim: k.birim, // BİRİM EKLENDİ
      birim_fiyat: k.birim_fiyat
    }));

    const { error: insertError } = await supabase.from('proforma_kalemleri').insert(kalemlerToInsert);
    if (insertError) throw insertError;

    alert('Değişiklikler kaydedildi!');
    isEditing.value = false;
    getDetay();
  } catch (err) {
    alert('Kaydetme hatası: ' + err.message);
  } finally {
    loading.value = false;
  }
};

// --- DÖNÜŞTÜRME MODALI ---
const openConvertModal = () => {
  if (!proforma.value) return;
  convertItems.value = (proforma.value.proforma_kalemleri || []).map(k => ({
    ...k,
    sourceType: k.urun_id ? 'depo' : 'hizmet',
    selectedSourceId: null,
    selectedAgreementId: null,
    checkingStock: false,
    stockError: false,
    currentStock: 0
  }));
  workOrderNote.value = proforma.value.notlar || '';
  showConvertModal.value = true;
};

const handleSourceTypeChange = (item) => {
  item.selectedSourceId = null;
  item.selectedAgreementId = null;
  item.stockError = false;
  item.currentStock = 0;
};

const checkStock = async (item) => {
  if (item.sourceType !== 'depo' || !item.selectedSourceId || !item.urun_id) { item.stockError = false; return; }
  item.checkingStock = true;
  try {
    const { data, error } = await supabase.from('stok_seviyeleri').select('miktar, rezerve_miktar').eq('urun_id', item.urun_id).eq('depo_id', item.selectedSourceId).single();
    if (error && error.code !== 'PGRST116') throw error; 
    const eldekiMiktar = data ? (data.miktar - data.rezerve_miktar) : 0;
    item.currentStock = eldekiMiktar;
    item.stockError = eldekiMiktar < item.miktar;
  } catch (err) {
    item.stockError = true; 
  } finally {
    item.checkingStock = false;
  }
};

const hasStockErrors = computed(() => {
  const missingSelection = convertItems.value.some(item => (item.sourceType !== 'hizmet' && !item.selectedSourceId));
  if (missingSelection) return true;
  return convertItems.value.some(item => item.stockError);
});

const convertToWorkOrder = async () => {
  if (hasStockErrors.value) return;
  converting.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: yeniNo } = await supabase.rpc('is_emri_numara_olustur');
    
    const { data: isEmri, error: isEmriError } = await supabase.from('is_emirleri').insert([{
      musteri_id: proforma.value.musteri_id,
      siparis_tarihi: new Date(),
      durum: 'Açık',
      toplam_tutar: proforma.value.toplam_tutar,
      notlar: workOrderNote.value,
      olusturan_kullanici_id: user?.id,
      satisci_id: null,
      numara: yeniNo || 'IE-HATA',
      is_tamamlandi: false,
      is_emri_tipi: 'SİPARİŞ',
      sevk_adresi: proforma.value.musteriler?.adres,
      para_birimi: proforma.value.para_birimi || 'TRY',
      kdv_dahil: false
    }]).select().single();
    if (isEmriError) throw isEmriError;

    const kalemlerInsert = convertItems.value.map(item => ({
      is_emri_id: isEmri.id,
      urun_id: item.urun_id,
      miktar: item.miktar,
      birim: item.birim, // BİRİM EKLENDİ
      birim_fiyat: item.birim_fiyat,
      aciklama: item.aciklama,
      kaynak_depo_id: item.sourceType === 'depo' ? item.selectedSourceId : null,
      kaynak_tedarikci_id: item.sourceType === 'tedarikci' ? item.selectedSourceId : null,
      anlasma_id: item.selectedAgreementId
    }));
    await supabase.from('is_emri_kalemleri').insert(kalemlerInsert);
    await supabase.from('proformalar').update({ durum: 'Dönüştürüldü', donusturulen_is_emri_id: isEmri.id }).eq('id', proforma.value.id);

    alert('İş Emri başarıyla oluşturuldu!');
    showConvertModal.value = false;
    router.push(`/app/is-emirleri/${isEmri.id}`);
  } catch (err) {
    alert('Dönüştürme hatası: ' + err.message);
  } finally {
    converting.value = false;
  }
};

// --- YARDIMCI FONKSİYONLAR ---
const suresiGectiMi = (p) => {
  if (p.durum === 'Dönüştürüldü') return false;
  return p.gecerlilik_tarihi < new Date().toISOString().split('T')[0];
};

const getDurumBadge = (durum) => {
  const durumMap = { 'Taslak': 'bg-gray-100 text-gray-600', 'Gönderildi': 'bg-blue-100 text-blue-600', 'Dönüştürüldü': 'bg-purple-100 text-purple-600 font-bold' };
  return `px-2 py-1 text-xs rounded ${durumMap[durum] || 'bg-gray-100 text-gray-800'}`;
};

const formatTarih = (t) => t ? new Date(t).toLocaleDateString('tr-TR') : '-';
const formatPara = (val, currency = 'TRY') => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency || 'TRY' }).format(val || 0);

// --- YAZDIRMA FONKSİYONU ---
const yazdir = () => {
  if (!proforma.value) return;
  const p = proforma.value;
  const logoUrl = window.location.origin + '/logo11.png';
  const tarih = formatTarih(p.olusturma_tarihi);
  const musteri = p.musteriler || {};
  const ilgiliKisi = p.ilgili_kisi || musteri.ilgili_kisi || '-';
  const pb = p.para_birimi || 'TRY';

  const kalemlerHTML = p.proforma_kalemleri.map((kalem, index) => {
      let tutar = kalem.miktar * kalem.birim_fiyat;
      return `
        <tr>
          <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: center;">${index + 1}</td>
          <td style="padding: 6px; border-bottom: 1px solid #eee;">${kalem.aciklama}</td>
          <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: center;">${kalem.miktar}</td>
          <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: center;">${kalem.birim || 'Adet'}</td>
          <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(kalem.birim_fiyat, pb)}</td>
          <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(tutar, pb)}</td>
        </tr>
      `;
  }).join('');

  const htmlContent = `
      <!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Proforma - ${p.proforma_no}</title>
        <style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'); @page { margin: 1cm; size: A4; } body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.4; margin: 0; padding: 0; font-size: 11px; } .container { max-width: 210mm; margin: 0 auto; background: white; padding-bottom: 20px; } .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; } .logo-area img { height: 80px; object-fit: contain; } .company-details { text-align: right; font-size: 10px; color: #555; } .company-name { font-size: 14px; font-weight: bold; color: #111; } .doc-no { font-weight: bold; font-size: 12px; color: #333; } .info-grid { display: flex; justify-content: space-between; margin-bottom: 20px; margin-top: 10px; } .info-box { width: 48%; border: 1px solid #eee; padding: 10px; border-radius: 4px; } .box-title { font-size: 11px; font-weight: bold; border-bottom: 1px solid #ddd; margin-bottom: 5px; padding-bottom: 2px; color: #4f46e5; } .row { display: flex; justify-content: space-between; margin-bottom: 3px; } table { width: 100%; border-collapse: collapse; margin-bottom: 20px; } th { background: #f9fafb; padding: 6px; border-bottom: 2px solid #ddd; text-align: left; font-size: 10px; font-weight: bold; } .totals { display: flex; justify-content: flex-end; } .total-wrapper { width: 200px; } .total-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 10px; } .total-row.final { font-weight: bold; font-size: 12px; border-top: 2px solid #333; margin-top: 3px; padding-top: 5px; } .footer-note { position: fixed; bottom: 0; left: 0; width: 100%; text-align: center; font-size: 9px; color: #999; padding: 5px; }
        </style></head><body><div class="container"><div class="header"><div class="logo-area"><img src="${logoUrl}" alt="Logo"></div><div class="company-details"><div class="company-name">Tavlaşoğlu Isıtma Soğutma</div><div class="company-name">Doğalgaz Sis. Tic. San. ve Ltd. Şti.</div><div>Lalapaşa Mah. Samih Kobal Cad. İnanoğlu Apt. No:16/2 Yakutiye / Erzurum</div><div>Tel: 0(442) 238 83 83 | V.D: Aziziye | V.No: 8300346377</div></div></div><div class="info-grid"><div class="info-box"><div class="box-title">SAYIN / MÜŞTERİ</div><div class="row"><strong>${musteri.unvan || '-'}</strong></div><div class="row"><span>İlgili:</span> <span>${ilgiliKisi}</span></div><div class="row"><span>Adres:</span> <span>${musteri.adres || '-'}</span></div><div class="row"><span>V.No:</span> <span>${musteri.vergi_no || '-'}</span></div></div><div class="info-box"><div class="box-title">BELGE BİLGİLERİ</div><div class="row"><span>Tarih:</span> <span>${tarih}</span></div><div class="row"><span>Proforma No:</span> <span class="doc-no">${p.proforma_no}</span></div></div></div><table><thead><tr><th style="text-align: center; width: 30px;">#</th><th>Açıklama</th><th style="text-align: center; width: 60px;">Miktar</th><th style="text-align: center; width: 60px;">Birim</th><th style="text-align: right; width: 100px;">Birim Fiyat</th><th style="text-align: right; width: 100px;">Tutar</th></tr></thead><tbody>${kalemlerHTML}</tbody></table><div class="totals"><div class="total-wrapper"><div class="total-row"><span>Ara Toplam:</span><span>${formatPara(toplamlar.value.araToplam, pb)}</span></div><div class="total-row"><span>KDV (%20):</span><span>${formatPara(toplamlar.value.kdv, pb)}</span></div><div class="total-row final"><span>GENEL TOPLAM:</span><span>${formatPara(toplamlar.value.genelToplam, pb)}</span></div></div></div><div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;"><h4 style="margin: 0 0 5px 0; font-size: 10px; text-transform: uppercase;">Şartlar ve Koşullar</h4><div style="white-space: pre-wrap; font-size: 9px; color: #444; line-height: 1.3;">${p.sartlar || 'Şart belirtilmemiş.'}</div></div>${p.notlar ? `<div style="margin-top:10px; padding:10px; background:#f9fafb; font-size:9px;"><strong>NOTLAR:</strong><br>${p.notlar}</div>` : ''}<div class="footer-note">Bu belge bilgilendirme amaçlıdır. Proforma Fatura.</div></div></body></html>`;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
};

onMounted(getDetay);
</script>
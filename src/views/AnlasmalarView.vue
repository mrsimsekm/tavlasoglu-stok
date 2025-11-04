<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-4">Anlaşmalar (Bağlantılar)</h1>
    <div class="flex justify-between items-center mb-6">
      <input type="text" placeholder="Anlaşma ara (Ad, Tedarikçi...)" v-model="aramaMetni" class="w-1/3 p-2 border rounded-lg"/>
      <button @click="formModaliniAc()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">+ Yeni Anlaşma Ekle</button>
    </div>
    <div class="bg-white shadow-md rounded-lg overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="th-style w-1/3">Anlaşma Adı</th><th class="th-style">Tedarikçi</th><th class="th-style">Tip</th><th class="th-style">Kullanım Durumu</th><th class="th-style">İskonto</th><th class="th-style">Durum</th><th class="th-style text-center">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="7" class="text-center py-4">Yükleniyor...</td></tr>
          <tr v-else-if="filtrelenmisAnlasmalar.length === 0"><td colspan="7" class="text-center py-4">Gösterilecek anlaşma bulunamadı.</td></tr>
          <tr v-else v-for="anlasma in filtrelenmisAnlasmalar" :key="anlasma.id">
            <td class="td-style">{{ anlasma.ad }}</td>
            <td class="td-style">{{ anlasma.tedarikciler?.ad || '-' }}</td>
            <td class="td-style"><span class="px-2 py-1 text-xs rounded-full" :class="anlasma.tip === 'Tutar Bazlı' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'">{{ anlasma.tip }}</span></td>
            <td class="td-style">
              <div v-if="anlasma.tip === 'Tutar Bazlı'">
                <div v-if="anlasma.taahhut_tutari > 0"><div class="w-full bg-gray-200 rounded-full h-4"><div class="bg-blue-600 h-4 rounded-full text-white text-xs flex items-center justify-center" :style="{ width: anlasma.kullanim_orani + '%' }"><span v-if="anlasma.kullanim_orani > 10">{{ anlasma.kullanim_orani.toFixed(0) }}%</span></div></div><p class="text-xs text-gray-600 mt-1">{{ (anlasma.kullanilan_tutar || 0).toLocaleString('tr-TR') }} / {{ anlasma.taahhut_tutari.toLocaleString('tr-TR') }} TL</p></div>
                <div v-else><p class="text-xs text-gray-600">Taahhütsüz</p></div>
              </div>
              <div v-else-if="anlasma.tip === 'Ürün Bazlı'">
                <p class="font-semibold text-gray-700">{{ anlasma.toplam_kullanilan_adet }} / {{ anlasma.toplam_taahhut_adet }} adet</p>
                 <div class="w-full bg-gray-200 rounded-full h-2 mt-1"><div class="bg-purple-600 h-2 rounded-full" :style="{ width: anlasma.kullanim_orani + '%' }"></div></div>
              </div>
              <div v-else><p class="text-xs text-gray-600">-</p></div>
            </td>
            <td class="td-style">% {{ anlasma.iskonto_orani || 0 }}</td>
            <td class="td-style"><span :class="anlasma.aktif_mi ? 'text-green-600' : 'text-red-600'">{{ anlasma.aktif_mi ? 'Aktif' : 'Pasif' }}</span></td>
            <td class="td-style text-center">
              <div class="flex item-center justify-center space-x-4">
                <button @click="detayModaliniAc(anlasma)" class="text-blue-500 hover:text-blue-700" title="Detay"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg></button>
                <button @click="formModaliniAc(anlasma)" class="text-yellow-500 hover:text-yellow-700" title="Düzenle"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                <button @click="anlasmaSil(anlasma)" class="text-red-500 hover:text-red-700" title="Sil"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <BaseModal :show="formModalGoster" @close="formModalGoster = false">
      <template #header>{{ duzenlemeModu ? 'Anlaşma Düzenle' : 'Yeni Anlaşma Ekle' }}</template>
      <template #body>
        <form @submit.prevent="formuKaydet" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="col-span-2"><label class="label-style">Anlaşma Adı (*)</label><input v-model="aktifAnlasma.ad" type="text" required class="form-input"></div>
            <div><label class="label-style">Tedarikçi (*)</label><select v-model="aktifAnlasma.tedarikci_id" required class="form-input"><option :value="null" disabled>Tedarikçi Seçin</option><option v-for="tedarikci in tedarikciler" :key="tedarikci.id" :value="tedarikci.id">{{ tedarikci.ad }}</option></select></div>
            <div><label class="label-style">Anlaşma Tipi</label><select v-model="aktifAnlasma.tip" class="form-input" :disabled="duzenlemeModu"><option>Tutar Bazlı</option><option>Ürün Bazlı</option></select></div>
          </div>
          <div v-if="aktifAnlasma.tip === 'Tutar Bazlı'" class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div><label class="label-style">Taahhüt Tutarı</label><input v-model.number="aktifAnlasma.taahhut_tutari" type="number" step="0.01" class="form-input"></div>
            <div><label class="label-style">İskonto Oranı (%)</label><input v-model.number="aktifAnlasma.iskonto_orani" type="number" step="0.01" class="form-input"></div>
          </div>
          <div v-if="aktifAnlasma.tip === 'Ürün Bazlı'" class="border-t pt-4">
            <h3 class="font-semibold mb-2">Anlaşma Kalemleri</h3>
            <div class="grid grid-cols-5 gap-2 items-center mb-4">
               <div class="col-span-3 relative">
                 <input type="text" v-model="urunAramaMetni" @input="urunAra" placeholder="Ürün Ara..." class="form-input" />
                 <div v-if="urunAramaSonuclari.length > 0" class="absolute bg-white border w-full shadow-lg z-10 rounded-md max-h-48 overflow-y-auto"><ul><li v-for="urun in urunAramaSonuclari" :key="urun.id" @click="urunSec(urun)" class="p-2 hover:bg-gray-100 cursor-pointer">{{ urun.urun_kodu }} - {{ urun.aciklama }}</li></ul></div>
               </div>
               <div><input type="number" v-model="seciliUrunMiktar" placeholder="Miktar" class="form-input" /></div>
               <button @click="anlasmaKalemiEkle" type="button" class="btn-secondary">Ekle</button>
            </div>
            <ul class="space-y-2 mt-4 max-h-48 overflow-y-auto">
                <li v-for="(kalem, index) in aktifAnlasma.anlasma_kalemleri" :key="index" class="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{{ kalem.urunler?.aciklama || 'Ürün bilgisi yükleniyor...' }}</span>
                    <span><strong>Miktar:</strong> {{ kalem.taahhut_edilen_miktar }}</span>
                    <button @click="anlasmaKalemiSil(index)" type="button" class="text-red-500 hover:text-red-700">Sil</button>
                </li>
            </ul>
          </div>
        </form>
      </template>
      <template #footer>
        <button @click="formModalGoster = false" class="btn-secondary mr-2">İptal</button>
        <button @click="formuKaydet" class="btn-primary">{{ duzenlemeModu ? 'Güncelle' : 'Kaydet' }}</button>
      </template>
    </BaseModal>

    <!-- Anlaşma Detay Modal -->
    <BaseModal :show="detayModalGoster" @close="detayModalGoster = false" max-width="max-w-4xl">
      <template #header>{{ secilenAnlasmaDetay?.ad || 'Anlaşma Detayı' }}</template>
      <template #body>
        <div v-if="detayYukleniyor" class="text-center py-4">Yükleniyor...</div>
        <div v-else-if="secilenAnlasmaDetay" class="space-y-4">
          <!-- Anlaşma Genel Bilgileri -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold mb-2">Anlaşma Bilgileri</h3>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div><span class="font-medium">Tedarikçi:</span> {{ secilenAnlasmaDetay.tedarikciler?.ad || '-' }}</div>
              <div><span class="font-medium">Tip:</span> {{ secilenAnlasmaDetay.tip }}</div>
              <div v-if="secilenAnlasmaDetay.tip === 'Tutar Bazlı'">
                <span class="font-medium">Taahhüt Tutarı:</span> {{ (secilenAnlasmaDetay.taahhut_tutari || 0).toLocaleString('tr-TR') }} TL
              </div>
              <div v-if="secilenAnlasmaDetay.tip === 'Tutar Bazlı'">
                <span class="font-medium">Kullanılan Tutar:</span> {{ (secilenAnlasmaDetay.kullanilan_tutar || 0).toLocaleString('tr-TR') }} TL
              </div>
              <div v-if="secilenAnlasmaDetay.tip === 'Ürün Bazlı'">
                <span class="font-medium">Taahhüt Edilen:</span> {{ secilenAnlasmaDetay.toplam_taahhut_adet || 0 }} adet
              </div>
              <div v-if="secilenAnlasmaDetay.tip === 'Ürün Bazlı'">
                <span class="font-medium">Kullanılan:</span> {{ secilenAnlasmaDetay.toplam_kullanilan_adet || 0 }} adet
              </div>
            </div>
          </div>

          <!-- İş Emri Bazlı Kullanım Detayları -->
          <div>
            <h3 class="font-semibold mb-3">İş Emri Bazlı Kullanım Detayları</h3>
            <div v-if="secilenAnlasmaDetay.tip === 'Tutar Bazlı'">
              <div v-if="isEmriDetaylari.length === 0" class="text-center py-4 text-gray-500">
                Bu anlaşma henüz hiçbir iş emrinde kullanılmamış.
              </div>
              <div v-else class="overflow-x-auto max-h-96 overflow-y-auto">
                <table class="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th class="th-style">İş Emri No</th>
                      <th class="th-style">Sipariş Tarihi</th>
                      <th class="th-style">Müşteri</th>
                      <th class="th-style text-right">Kullanılan Tutar</th>
                      <th class="th-style">Durum</th>
                      <th class="th-style text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="detay in isEmriDetaylari" :key="detay.is_emri_id">
                      <td class="td-style">#{{ detay.is_emri_id.substring(0, 8) }}</td>
                      <td class="td-style">{{ new Date(detay.siparis_tarihi).toLocaleDateString('tr-TR') }}</td>
                      <td class="td-style">{{ detay.musteri_unvan }}</td>
                      <td class="td-style text-right font-semibold">
                        {{ Number(detay.kullanilan_tutar).toLocaleString('tr-TR') }} TL
                      </td>
                      <td class="td-style">
                        <span class="px-2 py-1 text-xs rounded-full" :class="detay.durum === 'Açık' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'">
                          {{ detay.durum }}
                        </span>
                      </td>
                      <td class="td-style text-center">
                        <RouterLink :to="`/app/is-emirleri/${detay.is_emri_id}`" class="text-blue-500 hover:text-blue-700 font-semibold">
                          Görüntüle
                        </RouterLink>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else-if="secilenAnlasmaDetay.tip === 'Ürün Bazlı'">
              <div v-if="isEmriDetaylari.length === 0" class="text-center py-4 text-gray-500">
                Bu anlaşmada ürün kalemi bulunmamaktadır.
              </div>
              <div v-else class="space-y-6">
                <div v-for="urunDetay in isEmriDetaylari" :key="urunDetay.urun_id" class="border rounded-lg p-4 bg-gray-50">
                  <div class="mb-3 pb-2 border-b">
                    <h4 class="font-semibold text-gray-800">{{ urunDetay.urun_kodu }} - {{ urunDetay.urun_aciklama }}</h4>
                    <div class="flex gap-4 text-sm text-gray-600 mt-1">
                      <span><strong>Taahhüt Edilen:</strong> {{ urunDetay.taahhut_edilen_miktar }} adet</span>
                      <span><strong>Kullanılan:</strong> {{ urunDetay.toplam_kullanilan }} adet</span>
                      <span><strong>Kalan:</strong> {{ Math.max(0, urunDetay.taahhut_edilen_miktar - urunDetay.toplam_kullanilan) }} adet</span>
                    </div>
                  </div>
                  <div v-if="urunDetay.is_emri_detaylari.length === 0" class="text-center py-2 text-gray-500 text-sm">
                    Bu ürün henüz hiçbir iş emrinde kullanılmamış.
                  </div>
                  <div v-else class="overflow-x-auto">
                    <table class="min-w-full leading-normal text-sm">
                      <thead>
                        <tr>
                          <th class="th-style text-xs">İş Emri No</th>
                          <th class="th-style text-xs">Sipariş Tarihi</th>
                          <th class="th-style text-xs">Müşteri</th>
                          <th class="th-style text-xs text-right">Kullanılan Miktar</th>
                          <th class="th-style text-xs">Durum</th>
                          <th class="th-style text-xs text-center">İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="isEmriDetay in urunDetay.is_emri_detaylari" :key="`${urunDetay.urun_id}-${isEmriDetay.is_emri_id}`">
                          <td class="td-style text-xs">#{{ isEmriDetay.is_emri_id.substring(0, 8) }}</td>
                          <td class="td-style text-xs">{{ new Date(isEmriDetay.siparis_tarihi).toLocaleDateString('tr-TR') }}</td>
                          <td class="td-style text-xs">{{ isEmriDetay.musteri_unvan }}</td>
                          <td class="td-style text-xs text-right font-semibold">
                            {{ isEmriDetay.kullanilan_miktar }} adet
                          </td>
                          <td class="td-style text-xs">
                            <span class="px-2 py-1 text-xs rounded-full" :class="isEmriDetay.durum === 'Açık' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'">
                              {{ isEmriDetay.durum }}
                            </span>
                          </td>
                          <td class="td-style text-xs text-center">
                            <RouterLink :to="`/app/is-emirleri/${isEmriDetay.is_emri_id}`" class="text-blue-500 hover:text-blue-700 font-semibold">
                              Görüntüle
                            </RouterLink>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="detayModalGoster = false" class="btn-secondary">Kapat</button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.th-style { @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider; }
.td-style { @apply px-5 py-5 border-b border-gray-200 bg-white text-sm; }
.label-style { @apply block text-sm font-medium text-gray-700; }
.form-input { @apply mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
.btn-primary { @apply bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded; }
.btn-secondary { @apply bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded; }
</style>

<script setup>
import { ref, onMounted, onActivated, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { supabase } from '../supabase.js';
import BaseModal from '../components/BaseModal.vue';

const tumAnlasmalar = ref([]);
const tedarikciler = ref([]);
const loading = ref(true);
const aramaMetni = ref('');
const formModalGoster = ref(false);
const duzenlemeModu = ref(false);
const aktifAnlasma = ref({ anlasma_kalemleri: [] });
const urunAramaMetni = ref('');
const urunAramaSonuclari = ref([]);
const seciliUrun = ref(null);
const seciliUrunMiktar = ref(1);
const detayModalGoster = ref(false);
const secilenAnlasmaDetay = ref(null);
const isEmriDetaylari = ref([]);
const detayYukleniyor = ref(false);

const filtrelenmisAnlasmalar = computed(() => {
  if (!aramaMetni.value) return tumAnlasmalar.value;
  const arama = aramaMetni.value.toLowerCase();
  return tumAnlasmalar.value.filter(anlasma => anlasma.ad.toLowerCase().includes(arama) || (anlasma.tedarikciler && anlasma.tedarikciler.ad.toLowerCase().includes(arama)));
});

const getAnlasmalar = async () => {
  loading.value = true;
  const { data: anlasmalarData, error: anlasmalarError } = await supabase.from('anlasmalar').select('*, tedarikciler(ad), anlasma_kalemleri(*, urunler(*))');
  if (anlasmalarError) { console.error('Anlaşmalar çekilirken hata:', anlasmalarError); loading.value = false; return; }
  
  // Tüm anlaşmalar için kullanım bilgilerini direkt is_emri_kalemleri tablosundan hesapla
  const anlasmalarWithKullanim = await Promise.all(anlasmalarData.map(async (anlasma) => {
    if (anlasma.tip === 'Tutar Bazlı') {
      // Tutar bazlı anlaşmalarda: is_emri_kalemleri tablosundan tüm iş emirlerinden kullanım hesapla
      const { data: kalemlerData } = await supabase
        .from('is_emri_kalemleri')
        .select('miktar, birim_fiyat, is_emirleri!inner(durum)')
        .eq('anlasma_id', anlasma.id)
        .not('is_emirleri.durum', 'eq', 'İptal Edildi');
      
      const kullanilanTutar = kalemlerData?.reduce((sum, kalem) => 
        sum + (Number(kalem.miktar) * Number(kalem.birim_fiyat)), 0
      ) || 0;
      
      const kullanimOrani = (anlasma.taahhut_tutari > 0) ? (kullanilanTutar / anlasma.taahhut_tutari) * 100 : 0;
      return { ...anlasma, kullanilan_tutar: kullanilanTutar, kullanim_orani: Math.min(kullanimOrani, 100) };
    } else if (anlasma.tip === 'Ürün Bazlı') {
      // Ürün bazlı anlaşmalarda: is_emri_kalemleri tablosundan tüm iş emirlerinden kullanım hesapla
      const toplamTaahhutAdet = anlasma.anlasma_kalemleri.reduce((sum, kalem) => sum + kalem.taahhut_edilen_miktar, 0);
      
      const { data: kalemlerData } = await supabase
        .from('is_emri_kalemleri')
        .select('miktar, is_emirleri!inner(durum)')
        .eq('anlasma_id', anlasma.id)
        .not('is_emirleri.durum', 'eq', 'İptal Edildi');
      
      const toplamKullanilanAdet = kalemlerData?.reduce((sum, kalem) => sum + Number(kalem.miktar), 0) || 0;
      
      const kullanimOrani = (toplamTaahhutAdet > 0) ? (toplamKullanilanAdet / toplamTaahhutAdet) * 100 : 0;
      return { ...anlasma, toplam_taahhut_adet: toplamTaahhutAdet, toplam_kullanilan_adet: toplamKullanilanAdet, kullanim_orani: Math.min(kullanimOrani, 100) };
    }
    return anlasma;
  }));
  
  tumAnlasmalar.value = anlasmalarWithKullanim.sort((a, b) => a.ad.localeCompare(b.ad));
  loading.value = false;
};

const getTedarikciler = async () => {
  const { data, error } = await supabase.from('tedarikciler').select('id, ad').order('ad');
  if (error) console.error('Tedarikçiler çekilirken hata:', error);
  else tedarikciler.value = data || [];
};

onMounted(() => {
  getTedarikciler();
});

onActivated(() => {
  getAnlasmalar();
});

const formModaliniAc = (anlasma = null) => {
  urunAramaMetni.value = ''; urunAramaSonuclari.value = []; seciliUrun.value = null; seciliUrunMiktar.value = 1;
  if (anlasma) {
    duzenlemeModu.value = true;
    aktifAnlasma.value = JSON.parse(JSON.stringify(anlasma));
  } else {
    duzenlemeModu.value = false;
    aktifAnlasma.value = { ad: '', tedarikci_id: null, aktif_mi: true, tip: 'Tutar Bazlı', anlasma_kalemleri: [] };
  }
  formModalGoster.value = true;
};

const formuKaydet = async () => {
  if (!aktifAnlasma.value.ad || !aktifAnlasma.value.tedarikci_id) { alert('Anlaşma Adı ve Tedarikçi alanları zorunludur.'); return; }
  const { tedarikciler, kullanilan_tutar, kullanim_orani, toplam_taahhut_adet, toplam_kullanilan_adet, anlasma_kalemleri, ...anlasmaVerisi } = aktifAnlasma.value;
  try {
    let anlasmaId;
    if (duzenlemeModu.value) {
      const { data, error } = await supabase.from('anlasmalar').update(anlasmaVerisi).match({ id: anlasmaVerisi.id }).select('id').single();
      if (error) throw error;
      anlasmaId = data.id;
      await supabase.from('anlasma_kalemleri').delete().match({ anlasma_id: anlasmaId });
    } else {
      const { data, error } = await supabase.from('anlasmalar').insert([anlasmaVerisi]).select('id').single();
      if (error) throw error;
      anlasmaId = data.id;
    }
    if (aktifAnlasma.value.tip === 'Ürün Bazlı' && anlasma_kalemleri?.length > 0) {
      const kalemlerToInsert = anlasma_kalemleri.map(k => ({ anlasma_id: anlasmaId, urun_id: k.urun_id, taahhut_edilen_miktar: k.taahhut_edilen_miktar, }));
      const { error: kalemError } = await supabase.from('anlasma_kalemleri').insert(kalemlerToInsert);
      if (kalemError) throw kalemError;
    }
    await getAnlasmalar();
    formModalGoster.value = false;
  } catch (err) {
    alert('Hata: ' + err.message);
  }
};

const anlasmaSil = async (anlasma) => {
  if (confirm(`'${anlasma.ad}' adlı anlaşmayı silmek istediğinizden emin misiniz?`)) {
    const { error } = await supabase.from('anlasmalar').delete().match({ id: anlasma.id });
    if (error) alert('Hata: ' + error.message);
    else await getAnlasmalar();
  }
};

let debounceTimer_urun;
const urunAra = () => {
  clearTimeout(debounceTimer_urun);
  debounceTimer_urun = setTimeout(async () => {
    if (urunAramaMetni.value.length < 2) { urunAramaSonuclari.value = []; return; }
    const { data } = await supabase.from('urunler').select('id, urun_kodu, aciklama').or(`urun_kodu.ilike.%${urunAramaMetni.value}%,aciklama.ilike.%${urunAramaMetni.value}%`).limit(5);
    urunAramaSonuclari.value = data || [];
  }, 300);
};

const urunSec = (urun) => {
  seciliUrun.value = urun;
  urunAramaMetni.value = `${urun.urun_kodu} - ${urun.aciklama}`;
  urunAramaSonuclari.value = [];
};

const anlasmaKalemiEkle = () => {
  if (!seciliUrun.value || !seciliUrunMiktar.value || seciliUrunMiktar.value <= 0) { alert('Lütfen bir ürün seçin ve geçerli bir miktar girin.'); return; }
  if (!aktifAnlasma.value.anlasma_kalemleri) { aktifAnlasma.value.anlasma_kalemleri = []; }
  const mevcutKalemIndex = aktifAnlasma.value.anlasma_kalemleri.findIndex(k => k.urun_id === seciliUrun.value.id);
  if(mevcutKalemIndex > -1) {
    aktifAnlasma.value.anlasma_kalemleri[mevcutKalemIndex].taahhut_edilen_miktar += seciliUrunMiktar.value;
  } else {
    aktifAnlasma.value.anlasma_kalemleri.push({ urun_id: seciliUrun.value.id, urunler: { aciklama: `${seciliUrun.value.urun_kodu} - ${seciliUrun.value.aciklama}` }, taahhut_edilen_miktar: seciliUrunMiktar.value, });
  }
  urunAramaMetni.value = '';
  seciliUrun.value = null;
  seciliUrunMiktar.value = 1;
};

const anlasmaKalemiSil = (index) => {
  aktifAnlasma.value.anlasma_kalemleri.splice(index, 1);
};

const detayModaliniAc = async (anlasma) => {
  secilenAnlasmaDetay.value = anlasma;
  detayModalGoster.value = true;
  detayYukleniyor.value = true;
  
  try {
    // Önce genel bilgileri güncelle - tüm iş emirlerinden kullanım hesapla (sadece İptal Edildi hariç)
    if (anlasma.tip === 'Tutar Bazlı') {
      const { data: tumData } = await supabase
        .from('is_emri_kalemleri')
        .select('miktar, birim_fiyat, is_emirleri!inner(durum)')
        .eq('anlasma_id', anlasma.id)
        .not('is_emirleri.durum', 'eq', 'İptal Edildi');
      
      if (tumData) {
        const toplamTutar = tumData.reduce((sum, kalem) => 
          sum + (Number(kalem.miktar) * Number(kalem.birim_fiyat)), 0
        );
        secilenAnlasmaDetay.value.kullanilan_tutar = toplamTutar;
      }
    } else if (anlasma.tip === 'Ürün Bazlı') {
      // Ürün bazlı anlaşmalarda: sadece anlaşma kalemlerindeki ürünler için toplam kullanım hesapla
      // Önce anlaşma kalemlerindeki ürün ID'lerini al
      if (!anlasma.anlasma_kalemleri || anlasma.anlasma_kalemleri.length === 0) {
        secilenAnlasmaDetay.value.toplam_kullanilan_adet = 0;
      } else {
        const anlasmaUrunIds = anlasma.anlasma_kalemleri.map(k => k.urun_id);
        const { data: tumData } = await supabase
          .from('is_emri_kalemleri')
          .select('miktar, is_emirleri!inner(durum)')
          .eq('anlasma_id', anlasma.id)
          .in('urun_id', anlasmaUrunIds)
          .not('is_emirleri.durum', 'eq', 'İptal Edildi');
        
        if (tumData) {
          const toplamMiktar = tumData.reduce((sum, kalem) => sum + Number(kalem.miktar), 0);
          secilenAnlasmaDetay.value.toplam_kullanilan_adet = toplamMiktar;
        } else {
          secilenAnlasmaDetay.value.toplam_kullanilan_adet = 0;
        }
      }
    }
    // İş emri bazlı kullanım detaylarını çek
    if (anlasma.tip === 'Tutar Bazlı') {
      // Tutar bazlı anlaşmalarda: is_emri_kalemleri tablosundan anlaşma_id'ye göre çek
      // Tüm iş emirlerini al (sadece 'İptal Edildi' hariç)
      const { data, error } = await supabase
        .from('is_emri_kalemleri')
        .select(`
          is_emri_id,
          miktar,
          birim_fiyat,
          is_emirleri!inner(
            id,
            siparis_tarihi,
            durum,
            musteriler!inner(unvan)
          )
        `)
        .eq('anlasma_id', anlasma.id)
        .not('is_emirleri.durum', 'eq', 'İptal Edildi');
      
      if (error) throw error;
      
      // İş emri bazlı grupla ve toplam tutarı hesapla
      const gruplanmis = {};
      data.forEach(kalem => {
        const isEmriId = kalem.is_emri_id;
        if (!gruplanmis[isEmriId]) {
          gruplanmis[isEmriId] = {
            is_emri_id: isEmriId,
            siparis_tarihi: kalem.is_emirleri.siparis_tarihi,
            durum: kalem.is_emirleri.durum,
            musteri_unvan: kalem.is_emirleri.musteriler.unvan,
            kullanilan_tutar: 0
          };
        }
        gruplanmis[isEmriId].kullanilan_tutar += Number(kalem.miktar) * Number(kalem.birim_fiyat);
      });
      
      isEmriDetaylari.value = Object.values(gruplanmis).sort((a, b) => 
        new Date(b.siparis_tarihi) - new Date(a.siparis_tarihi)
      );
    } else if (anlasma.tip === 'Ürün Bazlı') {
      // Ürün bazlı anlaşmalarda: her ürün kalemi için detay göster
      // Önce anlaşma kalemlerini al (taahhüt edilen ürünler ve miktarları)
      if (!anlasma.anlasma_kalemleri || anlasma.anlasma_kalemleri.length === 0) {
        isEmriDetaylari.value = [];
        return;
      }
      
      // Her ürün kalemi için iş emri bazlı kullanım detaylarını çek
      const urunDetaylari = [];
      
      for (const anlasmaKalemi of anlasma.anlasma_kalemleri) {
        // Bu ürün için iş emri kalemlerini çek (tüm iş emirleri, sadece 'İptal Edildi' hariç)
        const { data, error } = await supabase
          .from('is_emri_kalemleri')
          .select(`
            is_emri_id,
            miktar,
            urun_id,
            is_emirleri!inner(
              id,
              siparis_tarihi,
              durum,
              musteriler!inner(unvan)
            ),
            urunler!inner(urun_kodu, aciklama)
          `)
          .eq('anlasma_id', anlasma.id)
          .eq('urun_id', anlasmaKalemi.urun_id)
          .not('is_emirleri.durum', 'eq', 'İptal Edildi');
        
        if (error) {
          console.error('Ürün detayları çekilirken hata:', error);
          continue;
        }
        
        // Bu ürün için toplam kullanılan miktarı hesapla
        const toplamKullanilan = data.reduce((sum, kalem) => sum + Number(kalem.miktar), 0);
        
        // İş emri bazlı grupla
        const isEmriGruplari = {};
        data.forEach(kalem => {
          const isEmriId = kalem.is_emri_id;
          if (!isEmriGruplari[isEmriId]) {
            isEmriGruplari[isEmriId] = {
              is_emri_id: isEmriId,
              siparis_tarihi: kalem.is_emirleri.siparis_tarihi,
              durum: kalem.is_emirleri.durum,
              musteri_unvan: kalem.is_emirleri.musteriler.unvan,
              kullanilan_miktar: 0
            };
          }
          isEmriGruplari[isEmriId].kullanilan_miktar += Number(kalem.miktar);
        });
        
        // Ürün bilgilerini al - önce anlasma kaleminden, sonra iş emri kalemlerinden
        let urunBilgisi = anlasmaKalemi.urunler || {};
        
        // Eğer anlasma kaleminde ürün bilgisi yoksa, iş emri kalemlerinden al
        if ((!urunBilgisi.urun_kodu || !urunBilgisi.aciklama) && data.length > 0 && data[0].urunler) {
          urunBilgisi = {
            urun_kodu: data[0].urunler.urun_kodu || 'Bilinmeyen',
            aciklama: data[0].urunler.aciklama || 'Bilinmeyen'
          };
        }
        
        // Eğer hala yoksa, ürünü direkt çek
        if (!urunBilgisi.urun_kodu || urunBilgisi.urun_kodu === 'Bilinmeyen') {
          const { data: urunData } = await supabase
            .from('urunler')
            .select('urun_kodu, aciklama')
            .eq('id', anlasmaKalemi.urun_id)
            .single();
          
          if (urunData) {
            urunBilgisi = urunData;
          }
        }
        
        urunDetaylari.push({
          urun_id: anlasmaKalemi.urun_id,
          urun_kodu: urunBilgisi.urun_kodu || 'Bilinmeyen',
          urun_aciklama: urunBilgisi.aciklama || 'Bilinmeyen',
          taahhut_edilen_miktar: anlasmaKalemi.taahhut_edilen_miktar,
          toplam_kullanilan: toplamKullanilan,
          is_emri_detaylari: Object.values(isEmriGruplari).sort((a, b) => 
            new Date(b.siparis_tarihi) - new Date(a.siparis_tarihi)
          )
        });
      }
      
      isEmriDetaylari.value = urunDetaylari;
    }
  } catch (err) {
    console.error('İş emri detayları çekilirken hata:', err);
    alert('Hata: ' + err.message);
    isEmriDetaylari.value = [];
  } finally {
    detayYukleniyor.value = false;
  }
};
</script>
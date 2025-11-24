<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-4">Anlaşmalar (Bağlantılar)</h1>
    <div class="flex justify-between items-center mb-6">
      <input type="text" placeholder="Anlaşma ara (Ad, Tedarikçi...)" v-model="aramaMetni" class="w-1/3 p-2 border rounded-lg"/>
      <button @click="formModaliniAc()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">+ Yeni Anlaşma Ekle</button>
    </div>
    <!-- Ana Tablo -->
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
            <td class="td-style">{{ anlasma.iskonto_orani || '-' }}</td>
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
    
    <!-- YENİ / DÜZENLEME MODALI (AYNI KALDI) -->
    <BaseModal :show="formModalGoster" @close="formModalGoster = false" max-width="max-w-4xl">
      <template #header>{{ duzenlemeModu ? 'Anlaşma Düzenle' : 'Yeni Anlaşma Ekle' }}</template>
      <template #body>
        <form @submit.prevent="formuKaydet" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="col-span-2"><label class="label-style">Anlaşma Adı (*)</label><input v-model="aktifAnlasma.ad" type="text" required class="form-input"></div>
            <div><label class="label-style">Tedarikçi (*)</label><select v-model="aktifAnlasma.tedarikci_id" required class="form-input"><option :value="null" disabled>Tedarikçi Seçin</option><option v-for="tedarikci in tedarikciler" :key="tedarikci.id" :value="tedarikci.id">{{ tedarikci.ad }}</option></select></div>
            <div><label class="label-style">Anlaşma Tipi</label><select v-model="aktifAnlasma.tip" class="form-input" :disabled="duzenlemeModu"><option>Tutar Bazlı</option><option>Ürün Bazlı</option></select></div>
            <div class="col-span-2">
              <label class="label-style">Durum</label>
              <div class="flex items-center mt-2">
                <label class="inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="aktifAnlasma.aktif_mi" class="sr-only peer">
                  <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  <span class="ms-3 text-sm font-medium" :class="aktifAnlasma.aktif_mi ? 'text-green-700' : 'text-gray-500'">{{ aktifAnlasma.aktif_mi ? 'Aktif' : 'Pasif' }}</span>
                </label>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ aktifAnlasma.aktif_mi ? 'Anlaşma aktif olarak kullanılabilir' : 'Anlaşma pasif durumda, iş emirlerinde görünmez' }}</p>
            </div>
          </div>
          <div v-if="aktifAnlasma.tip === 'Tutar Bazlı'" class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div><label class="label-style">Taahhüt Tutarı</label><input v-model.number="aktifAnlasma.taahhut_tutari" type="number" step="0.01" class="form-input"></div>
            <div><label class="label-style">İskonto Oranı (%)</label><input v-model="aktifAnlasma.iskonto_orani" type="text" class="form-input"></div>
          </div>
          <div v-if="aktifAnlasma.tip === 'Ürün Bazlı'" class="border-t pt-4">
            <h3 class="font-semibold mb-2">Anlaşma Kalemleri</h3>
            <div class="grid grid-cols-12 gap-2 items-center mb-4">
               <div class="col-span-6 relative">
                 <input type="text" v-model="urunAramaMetni" @input="urunAra" placeholder="Ürün Ara (Kod veya Açıklama)..." class="form-input" />
                 <div v-if="urunAramaSonuclari.length > 0" class="absolute bg-white border w-full shadow-lg z-10 rounded-md max-h-48 overflow-y-auto"><ul><li v-for="urun in urunAramaSonuclari" :key="urun.id" @click="urunSec(urun)" class="p-2 hover:bg-gray-100 cursor-pointer">{{ urun.urun_kodu }} - {{ urun.aciklama }}</li></ul></div>
               </div>
               <div class="col-span-2"><input type="number" v-model="seciliUrunMiktar" placeholder="Miktar" class="form-input" /></div>
               <div class="col-span-2"><input type="number" v-model="seciliUrunBirimFiyat" placeholder="Birim Fiyat" class="form-input" step="0.01" /></div>
               
               <div class="col-span-2"><button @click="anlasmaKalemiEkle" type="button" class="btn-secondary w-full">Ekle</button></div>
            </div>
            
            <div class="mt-4 max-h-64 overflow-y-auto border rounded-lg">
              <table class="min-w-full">
                <thead class="bg-gray-50 sticky top-0">
                  <tr>
                    <th class="th-style">Ürün</th>
                    <th class="th-style text-right">Taahhüt Miktarı</th>
                    <th class="th-style text-right">Birim Fiyat</th>                    
                    <th class="th-style text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody class="bg-white">
                  <tr v-if="!aktifAnlasma.anlasma_kalemleri || aktifAnlasma.anlasma_kalemleri.length === 0">
                    <td colspan="4" class="text-center py-4 text-gray-500">Henüz anlaşma kalemi eklenmedi.</td>
                  </tr>
                  <tr v-for="(kalem, index) in aktifAnlasma.anlasma_kalemleri" :key="index">
                      <td class="td-style font-medium text-gray-800">{{ kalem.urunler?.aciklama || 'Ürün bilgisi yükleniyor...' }}</td>
                      <td class="td-style text-right">{{ kalem.taahhut_edilen_miktar }} adet</td>
                      <td class="td-style text-right">{{ (kalem.birim_fiyat || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) }}</td>
                      <td class="td-style text-center">
                        <button @click="anlasmaKalemiSil(index)" type="button" class="text-red-500 hover:text-red-700">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                        </button>
                      </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <button @click="formModalGoster = false" class="btn-secondary mr-2">İptal</button>
        <button @click="formuKaydet" :disabled="anlasmaKayitYapiliyor" class="btn-primary">
          {{ anlasmaKayitYapiliyor ? 'Kaydediliyor...' : (duzenlemeModu ? 'Güncelle' : 'Kaydet') }}
        </button>
      </template>
    </BaseModal>

    <!-- DETAY MODAL -->
    <BaseModal :show="detayModalGoster" @close="detayModalGoster = false" max-width="max-w-4xl">
      <template #header>{{ secilenAnlasmaDetay?.ad || 'Anlaşma Detayı' }}</template>
      <template #body>
        <div class="max-h-[70vh] overflow-y-auto px-1">
          
          <div v-if="detayYukleniyor" class="text-center py-4">Yükleniyor...</div>
          <div v-else-if="secilenAnlasmaDetay" class="space-y-4">
            
            <!-- ANLAŞMA BİLGİLERİ -->
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

            <div>
              <h3 class="font-semibold mb-3 mt-4">Kullanım Detayları</h3>
              
              <!-- TUTAR BAZLI ANLAŞMA DETAYI (KARIŞIK LİSTE) -->
              <div v-if="secilenAnlasmaDetay.tip === 'Tutar Bazlı'">
                <div v-if="karisikHareketler.length === 0" class="text-center py-4 text-gray-500">
                  Bu anlaşma henüz hiçbir iş emrinde veya stok girişinde kullanılmamış.
                </div>
                <div v-else class="overflow-x-auto">
                  <table class="min-w-full leading-normal">
                    <thead>
                      <tr>
                        <th class="th-style">Tarih</th>
                        <th class="th-style">İşlem Türü</th>
                        <th class="th-style">Detay (İş Emri / Depo)</th>
                        <th class="th-style text-right">Tutar</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="hareket in karisikHareketler" :key="hareket.uniqueId">
                        <td class="td-style">{{ new Date(hareket.tarih).toLocaleDateString('tr-TR') }}</td>
                        <td class="td-style">
                          <span v-if="hareket.tip === 'is_emri'" class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">İş Emri</span>
                          <span v-else class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Stok Girişi</span>
                        </td>
                        <td class="td-style">
                          <span v-if="hareket.tip === 'is_emri'">
                            <RouterLink :to="`/app/is-emirleri/${hareket.detayId}`" class="text-blue-600 hover:underline">
                              #{{ hareket.detayNo }} - {{ hareket.musteri }}
                            </RouterLink>
                          </span>
                          <span v-else>
                            {{ hareket.depo }} ({{ hareket.aciklama || 'Stok Girişi' }})
                          </span>
                        </td>
                        <td class="td-style text-right font-mono">
                          {{ formatPara(hareket.tutar) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- ÜRÜN BAZLI ANLAŞMA DETAYI (AKORDİYON YAPISI - KARIŞIK LİSTE) -->
              <div v-else-if="secilenAnlasmaDetay.tip === 'Ürün Bazlı'">
                <div v-if="urunBazliDetaylar.length === 0" class="text-center py-4 text-gray-500">
                  Bu anlaşmada ürün kalemi bulunmamaktadır.
                </div>
                <div v-else class="space-y-4">
                  
                  <div v-for="urunDetay in urunBazliDetaylar" :key="urunDetay.urun_id" class="border rounded-lg bg-white overflow-hidden shadow-sm">
                    
                    <!-- AKORDİYON BAŞLIĞI -->
                    <div 
                      @click="toggleUrunDetay(urunDetay.urun_id)"
                      class="p-4 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors flex justify-between items-center"
                    >
                      <div class="flex-1">
                         <h4 class="font-semibold text-gray-800">{{ urunDetay.urun_kodu }} - {{ urunDetay.urun_aciklama }}</h4>
                         <div class="text-sm text-gray-600 mt-1 flex gap-4">
                           <span>Kullanılan: <span class="font-bold text-indigo-700">{{ urunDetay.toplam_kullanilan }}</span> / {{ urunDetay.taahhut_edilen_miktar }} adet</span>
                         </div>
                      </div>
                      <div class="text-gray-500">
                         <svg v-if="expandedUrunler[urunDetay.urun_id]" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
                         <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                      </div>
                    </div>

                    <!-- AKORDİYON İÇERİĞİ -->
                    <div v-show="expandedUrunler[urunDetay.urun_id]" class="p-4 bg-gray-50 border-t">
                      <div v-if="urunDetay.hareketler.length === 0" class="text-center py-2 text-gray-500 text-sm">
                        Bu ürün henüz hiçbir iş emrinde veya stok girişinde kullanılmamış.
                      </div>
                      <div v-else class="overflow-x-auto">
                        <table class="min-w-full leading-normal text-sm">
                          <thead>
                            <tr>
                              <th class="th-style text-xs">Tarih</th>
                              <th class="th-style text-xs">İşlem Türü</th>
                              <th class="th-style text-xs">Detay</th>
                              <th class="th-style text-xs text-right">Miktar</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="hareket in urunDetay.hareketler" :key="hareket.uniqueId">
                              <td class="td-style text-xs">{{ new Date(hareket.tarih).toLocaleDateString('tr-TR') }}</td>
                              <td class="td-style text-xs">
                                <span v-if="hareket.tip === 'is_emri'" class="px-2 py-1 rounded-full bg-blue-100 text-blue-800">İş Emri</span>
                                <span v-else class="px-2 py-1 rounded-full bg-green-100 text-green-800">Stok Girişi</span>
                              </td>
                              <td class="td-style text-xs">
                                <span v-if="hareket.tip === 'is_emri'">
                                  <RouterLink :to="`/app/is-emirleri/${hareket.detayId}`" class="text-blue-600 hover:underline">
                                    #{{ hareket.detayNo }} - {{ hareket.musteri }}
                                  </RouterLink>
                                </span>
                                <span v-else>
                                  {{ hareket.depo }}
                                </span>
                              </td>
                              <td class="td-style text-xs text-right font-bold">
                                {{ hareket.miktar }}
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
import { useLoading } from '../composables/useLoading.js';

const { isLoading: anlasmaKayitYapiliyor, withLoading } = useLoading();
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
const seciliUrunBirimFiyat = ref(null);
const detayModalGoster = ref(false);
const secilenAnlasmaDetay = ref(null);
const detayYukleniyor = ref(false);

// GÖSTERİM İÇİN YENİ DEĞİŞKENLER
const karisikHareketler = ref([]); // Tutar bazlı için tek liste
const urunBazliDetaylar = ref([]); // Ürün bazlı için (Ürün -> Hareketler Listesi)
const expandedUrunler = ref({});

const toggleUrunDetay = (urunId) => {
  if (expandedUrunler.value[urunId]) {
    delete expandedUrunler.value[urunId];
  } else {
    expandedUrunler.value[urunId] = true;
  }
};

const filtrelenmisAnlasmalar = computed(() => {
  if (!aramaMetni.value) return tumAnlasmalar.value;
  const arama = aramaMetni.value.toLowerCase();
  return tumAnlasmalar.value.filter(anlasma => anlasma.ad.toLowerCase().includes(arama) || (anlasma.tedarikciler && anlasma.tedarikciler.ad.toLowerCase().includes(arama)));
});

const formatPara = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0);

const getAnlasmalar = async () => {
  loading.value = true;
  const { data: anlasmalarData, error: anlasmalarError } = await supabase.from('anlasmalar').select('*, tedarikciler(ad), anlasma_kalemleri(*, urunler(*))');
  if (anlasmalarError) { console.error('Anlaşmalar çekilirken hata:', anlasmalarError); loading.value = false; return; }
  
  const anlasmalarWithKullanim = await Promise.all(anlasmalarData.map(async (anlasma) => {
    if (anlasma.tip === 'Tutar Bazlı') {
      const { data: kalemlerData } = await supabase
        .from('is_emri_kalemleri')
        .select('miktar, birim_fiyat, is_emirleri!inner(durum)')
        .eq('anlasma_id', anlasma.id)
        .not('is_emirleri.durum', 'eq', 'İptal Edildi');
      
      const isEmriTutari = kalemlerData?.reduce((sum, kalem) => 
        sum + (Number(kalem.miktar) * Number(kalem.birim_fiyat)), 0
      ) || 0;

      const { data: stokData } = await supabase
        .from('stok_hareketleri')
        .select('tutar')
        .eq('anlasma_id', anlasma.id)
        .eq('hareket_tipi', 'giris');
      
      const stokTutari = stokData?.reduce((sum, stok) => sum + (Number(stok.tutar) || 0), 0) || 0;

      const kullanilanTutar = isEmriTutari + stokTutari;
      
      const kullanimOrani = (anlasma.taahhut_tutari > 0) ? (kullanilanTutar / anlasma.taahhut_tutari) * 100 : 0;
      return { ...anlasma, kullanilan_tutar: kullanilanTutar, kullanim_orani: Math.min(kullanimOrani, 100) };
    } else if (anlasma.tip === 'Ürün Bazlı') {
      const toplamTaahhutAdet = anlasma.anlasma_kalemleri.reduce((sum, kalem) => sum + kalem.taahhut_edilen_miktar, 0);
      
      const { data: kalemlerData } = await supabase
        .from('is_emri_kalemleri')
        .select('miktar, is_emirleri!inner(durum)')
        .eq('anlasma_id', anlasma.id)
        .not('is_emirleri.durum', 'eq', 'İptal Edildi');
      
      const isEmriMiktari = kalemlerData?.reduce((sum, kalem) => sum + Number(kalem.miktar), 0) || 0;

      const { data: stokData } = await supabase
        .from('stok_hareketleri')
        .select('miktar')
        .eq('anlasma_id', anlasma.id)
        .eq('hareket_tipi', 'giris');
      
      const stokMiktari = stokData?.reduce((sum, stok) => sum + Number(stok.miktar), 0) || 0;
      
      const toplamKullanilanAdet = isEmriMiktari + stokMiktari;
      
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
  urunAramaMetni.value = ''; 
  urunAramaSonuclari.value = []; 
  seciliUrun.value = null; 
  seciliUrunMiktar.value = 1;
  seciliUrunBirimFiyat.value = null;
  if (anlasma) { duzenlemeModu.value = true; aktifAnlasma.value = JSON.parse(JSON.stringify(anlasma)); } 
  else { duzenlemeModu.value = false; aktifAnlasma.value = { ad: '', tedarikci_id: null, aktif_mi: true, tip: 'Tutar Bazlı', anlasma_kalemleri: [] }; }
  formModalGoster.value = true;
};

const formuKaydet = async () => {
  if (!aktifAnlasma.value.ad || !aktifAnlasma.value.tedarikci_id) { alert('Anlaşma Adı ve Tedarikçi alanları zorunludur.'); return; }
  await withLoading(async () => {
    const { tedarikciler, kullanilan_tutar, kullanim_orani, toplam_taahhut_adet, toplam_kullanilan_adet, anlasma_kalemleri, ...anlasmaVerisi } = aktifAnlasma.value;
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
      const kalemlerToInsert = anlasma_kalemleri.map(k => ({ anlasma_id: anlasmaId, urun_id: k.urun_id, taahhut_edilen_miktar: k.taahhut_edilen_miktar, birim_fiyat: k.birim_fiyat }));
      const { error: kalemError } = await supabase.from('anlasma_kalemleri').insert(kalemlerToInsert);
      if (kalemError) throw kalemError;
    }
    await getAnlasmalar();
    formModalGoster.value = false;
  });
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
    const { data, error } = await supabase.from('urunler').select('id, urun_kodu, aciklama').or(`urun_kodu.ilike.%${urunAramaMetni.value}%,aciklama.ilike.%${urunAramaMetni.value}%`).limit(5);
    if (error) { console.error('Supabase sorgu hatası:', error); }
    urunAramaSonuclari.value = data || [];
  }, 300);
};
const urunSec = (urun) => { seciliUrun.value = urun; urunAramaMetni.value = `${urun.urun_kodu} - ${urun.aciklama}`; urunAramaSonuclari.value = []; seciliUrunBirimFiyat.value = null; };
const anlasmaKalemiEkle = () => {
  if (!seciliUrun.value || !seciliUrunMiktar.value || seciliUrunMiktar.value <= 0 || seciliUrunBirimFiyat.value === null || seciliUrunBirimFiyat.value < 0) { alert('Lütfen bir ürün seçin ve geçerli bir miktar ve birim fiyat girin.'); return; }
  if (!aktifAnlasma.value.anlasma_kalemleri) { aktifAnlasma.value.anlasma_kalemleri = []; }
  const mevcutKalemIndex = aktifAnlasma.value.anlasma_kalemleri.findIndex(k => k.urun_id === seciliUrun.value.id);
  if(mevcutKalemIndex > -1) {
    const mevcutKalem = aktifAnlasma.value.anlasma_kalemleri[mevcutKalemIndex];
    mevcutKalem.taahhut_edilen_miktar += seciliUrunMiktar.value;
    mevcutKalem.birim_fiyat = seciliUrunBirimFiyat.value;
  } else {
    aktifAnlasma.value.anlasma_kalemleri.push({ urun_id: seciliUrun.value.id, urunler: { aciklama: `${seciliUrun.value.urun_kodu} - ${seciliUrun.value.aciklama}` }, taahhut_edilen_miktar: seciliUrunMiktar.value, birim_fiyat: seciliUrunBirimFiyat.value });
  }
  urunAramaMetni.value = ''; seciliUrun.value = null; seciliUrunMiktar.value = 1; seciliUrunBirimFiyat.value = null;
};
const anlasmaKalemiSil = (index) => { aktifAnlasma.value.anlasma_kalemleri.splice(index, 1); };

// --- YENİ DETAY MANTIĞI (TAB YOK, KARIŞIK LİSTE) ---
const detayModaliniAc = async (anlasma) => {
  secilenAnlasmaDetay.value = anlasma;
  detayModalGoster.value = true;
  detayYukleniyor.value = true;
  expandedUrunler.value = {}; 
  karisikHareketler.value = [];
  urunBazliDetaylar.value = [];
  
  try {
    // === ORTAK VERİLERİ ÇEKME (İş Emirleri ve Stok Girişleri) ===
    
    // 1. İş Emirleri
    const { data: isEmriData, error: isEmriError } = await supabase
      .from('is_emri_kalemleri')
      .select(`
        is_emri_id, miktar, birim_fiyat, urun_id,
        is_emirleri!inner(id, siparis_tarihi, durum, numara, musteriler!inner(unvan)),
        urunler(urun_kodu, aciklama)
      `)
      .eq('anlasma_id', anlasma.id)
      .not('is_emirleri.durum', 'eq', 'İptal Edildi');
    
    if (isEmriError) throw isEmriError;

    // 2. Stok Girişleri
    const { data: stokData, error: stokError } = await supabase
      .from('stok_hareketleri')
      .select(`
        *,
        urunler ( urun_kodu, aciklama ),
        depolar ( ad )
      `)
      .eq('anlasma_id', anlasma.id)
      .eq('hareket_tipi', 'giris');
    
    if (stokError) throw stokError;

    // === VERİLERİ İŞLEME ===

    if (anlasma.tip === 'Tutar Bazlı') {
      const tumHareketler = [];

      // İş Emirlerini Ekle
      isEmriData.forEach(item => {
        tumHareketler.push({
          uniqueId: `ie-${item.is_emri_id}-${Math.random()}`, // Unique key
          tip: 'is_emri',
          tarih: item.is_emirleri.siparis_tarihi,
          detayId: item.is_emri_id,
          detayNo: item.is_emirleri.numara || 'N/A',
          musteri: item.is_emirleri.musteriler.unvan,
          tutar: Number(item.miktar) * Number(item.birim_fiyat)
        });
      });

      // Stok Girişlerini Ekle
      stokData.forEach(item => {
        tumHareketler.push({
          uniqueId: `stok-${item.id}`,
          tip: 'stok_giris',
          tarih: item.olusturulma_tarihi,
          depo: item.depolar?.ad,
          aciklama: item.aciklama,
          tutar: Number(item.tutar) || 0
        });
      });

      // Tarihe göre sırala (Yeniden eskiye)
      karisikHareketler.value = tumHareketler.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));

      // Toplam kullanım güncelle
      const toplamTutar = tumHareketler.reduce((sum, h) => sum + h.tutar, 0);
      secilenAnlasmaDetay.value.kullanilan_tutar = toplamTutar;

    } else if (anlasma.tip === 'Ürün Bazlı') {
      // Anlaşmadaki ürünlerin listesini hazırla
      if (!anlasma.anlasma_kalemleri || anlasma.anlasma_kalemleri.length === 0) {
        urunBazliDetaylar.value = [];
      } else {
        const tempUrunDetaylari = [];
        let genelToplamKullanilan = 0;

        for (const anlasmaKalemi of anlasma.anlasma_kalemleri) {
          const urunId = anlasmaKalemi.urun_id;
          
          // Bu ürüne ait iş emirleri
          const urunIsEmirleri = isEmriData.filter(ie => ie.urun_id === urunId).map(ie => ({
            uniqueId: `ie-${ie.is_emri_id}-${Math.random()}`,
            tip: 'is_emri',
            tarih: ie.is_emirleri.siparis_tarihi,
            detayId: ie.is_emri_id,
            detayNo: ie.is_emirleri.numara || 'N/A',
            musteri: ie.is_emirleri.musteriler.unvan,
            miktar: Number(ie.miktar)
          }));

          // Bu ürüne ait stok girişleri
          const urunStokGirisleri = stokData.filter(s => s.urun_id === urunId).map(s => ({
            uniqueId: `stok-${s.id}`,
            tip: 'stok_giris',
            tarih: s.olusturulma_tarihi,
            depo: s.depolar?.ad,
            miktar: Number(s.miktar)
          }));

          const urunHareketleri = [...urunIsEmirleri, ...urunStokGirisleri].sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
          const toplamKullanilan = urunHareketleri.reduce((sum, h) => sum + h.miktar, 0);
          genelToplamKullanilan += toplamKullanilan;

          // Ürün bilgilerini bul (API'den gelen veya anlasmaKalemi içinden)
          let urunBilgisi = anlasmaKalemi.urunler || {};
          if (!urunBilgisi.urun_kodu) {
             // Listede varsa oradan al
             const foundInList = isEmriData.find(i => i.urun_id === urunId);
             if (foundInList && foundInList.urunler) urunBilgisi = foundInList.urunler;
             else {
                const foundInStok = stokData.find(s => s.urun_id === urunId);
                if (foundInStok && foundInStok.urunler) urunBilgisi = foundInStok.urunler;
             }
          }
          // Hala yoksa DB'den çekmek gerekebilir ama şimdilik Bilinmeyen diyelim (Performans için)
          
          tempUrunDetaylari.push({
            urun_id: urunId,
            urun_kodu: urunBilgisi.urun_kodu || '...',
            urun_aciklama: urunBilgisi.aciklama || '...',
            taahhut_edilen_miktar: anlasmaKalemi.taahhut_edilen_miktar,
            toplam_kullanilan: toplamKullanilan,
            hareketler: urunHareketleri
          });
        }
        urunBazliDetaylar.value = tempUrunDetaylari;
        secilenAnlasmaDetay.value.toplam_kullanilan_adet = genelToplamKullanilan;
      }
    }

  } catch (err) {
    console.error('Detay hatası:', err);
    alert('Hata: ' + err.message);
  } finally {
    detayYukleniyor.value = false;
  }
};
</script>
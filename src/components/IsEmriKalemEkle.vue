<template>
  <div class="space-y-4">
    
    <!-- GRUP VE EKLEME FORMU -->
    <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 relative">
      <div v-if="duzenlemeModu" class="absolute top-0 right-0 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-bl-lg border-b border-l border-yellow-200">
        Kalem Düzenleniyor
      </div>

      <!-- GRUP SEÇİMİ / OLUŞTURMA -->
      <div v-if="proformaModu" class="flex items-center space-x-2 mb-3 pb-3 border-b border-gray-200">
         <div class="flex-grow">
            <label class="label-style">Aktif Grup (Ürünler bu gruba eklenecek)</label>
            <div class="flex space-x-2">
               <div class="relative flex-grow">
                 <input 
                   v-model="aktifGrup" 
                   type="text" 
                   class="form-input font-bold text-indigo-700" 
                   placeholder="Grup Adı (Örn: Salon Grubu)"
                   list="mevcutGruplarListesi"
                 />
                 <datalist id="mevcutGruplarListesi">
                    <option v-for="g in mevcutGruplar" :key="g" :value="g"></option>
                 </datalist>
               </div>
               <button type="button" @click="aktifGrup = 'Genel'" class="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded hover:bg-gray-300 transition" title="Varsayıla Dön">
                 Sıfırla
               </button>
            </div>
         </div>
      </div>

      <!-- FORM ALANI -->
      <div class="grid grid-cols-12 gap-2 items-end">
        
        <!-- 1. KALEM TİPİ -->
        <div class="col-span-6 md:col-span-2 lg:col-span-1">
          <label class="label-style">Kalem Tipi</label>
          <select v-model="yeniKalemTipi" class="form-input mt-1" :disabled="duzenlemeModu">
            <option value="malzeme">Malzeme</option>
            <option value="hizmet">Hizmet</option>
          </select>
        </div>

        <!-- 2. MALZEME / HİZMET SEÇİMİ -->
        <div :class="genislikAyari.urunInputClass">
          <label class="label-style">{{ yeniKalemTipi === 'malzeme' ? 'Malzeme Seç' : 'Hizmet Açıklaması' }}</label>
          
          <div v-if="yeniKalemTipi === 'malzeme'" class="relative mt-1">
            <input 
              type="text" 
              v-model="urunAramaMetni" 
              @input="urunAra" 
              :placeholder="!proformaModu && urunBazliAnlasmaVeAnlasmaYok ? 'Önce anlaşma seçin' : 'Ürün ara...'" 
              class="form-input" 
              :disabled="!proformaModu && urunBazliAnlasmaVeAnlasmaYok"
              :class="{ 'bg-gray-100 cursor-not-allowed': !proformaModu && urunBazliAnlasmaVeAnlasmaYok }"
            />
            
            <!-- ARAMA SONUÇLARI -->
            <div v-if="urunAramaSonuclari.length > 0 && (proformaModu || !urunBazliAnlasmaVeAnlasmaYok)" class="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
              <ul>
                <li 
                  v-for="urun in urunAramaSonuclari" 
                  :key="urun.id" 
                  @click="urunSec(urun)" 
                  class="p-2 hover:bg-gray-100 cursor-pointer text-xs border-b last:border-0"
                >
                  <span class="font-bold text-blue-600">{{ urun.urun_kodu }}</span>
                  <span class="text-gray-600 block truncate">{{ urun.aciklama }}</span>
                </li>
              </ul>
            </div>
             <!-- YENİ: !yeniKalem.urun_id kuralı eklendi (Uyarı asılı kalmasın diye) -->
             <div v-else-if="urunAramaMetni.length >= 2 && !aramaYapiliyor && urunAramaSonuclari.length === 0 && !urunBazliAnlasmaVeAnlasmaYok && !yeniKalem.urun_id" class="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-20 p-2 text-xs text-gray-500">
               Uygun ürün bulunamadı.
             </div>
          </div>
          
          <input v-else v-model="yeniKalem.aciklama" type="text" placeholder="Örn: Montaj" class="form-input mt-1" />
        </div>
        
        <!-- 3. KAYNAK SEÇİMİ -->
        <div v-if="!proformaModu" class="col-span-6 md:col-span-2 lg:col-span-2">
          <label class="label-style">Kaynak</label>
          <select v-model="secilenKaynak" class="form-input mt-1 text-xs truncate" :disabled="yeniKalemTipi === 'hizmet'" :class="{ 'bg-gray-100': yeniKalemTipi === 'hizmet' }">
            <option :value="null">Seçiniz</option>
            <optgroup label="Depolar">
              <option v-for="depo in props.depolar" :key="depo.id" :value="{ tip: 'depo', id: depo.id, ad: depo.ad }">{{ depo.ad }}</option>
            </optgroup>
            <optgroup label="Dış Kaynaklar">
              <option v-for="tedarikci in props.tedarikciler" :key="tedarikci.id" :value="{ tip: 'tedarikci', id: tedarikci.id, ad: tedarikci.ad }">Tedarikçi: {{ tedarikci.ad }}</option>
              <option :value="{ tip: 'emanet', id: 'emanet', ad: 'Emanet (Stok Borç)' }">Emanet (Stok Borçlanma)</option>
            </optgroup>
          </select>
        </div>

        <!-- 4.A EMANET -->
        <div v-if="!proformaModu && secilenKaynak?.tip === 'emanet'" class="col-span-6 md:col-span-2 lg:col-span-2">
           <label class="label-style text-orange-600">Kimden Alındı? (Not)</label>
           <input 
            v-model="emanetKisiNotu"
            type="text" 
            placeholder="Örn: Ahmet Usta" 
            class="form-input mt-1 border-orange-300 focus:ring-orange-500"
           />
        </div>

        <!-- 4.B ANLAŞMA SEÇİMİ -->
        <div v-else-if="!proformaModu" class="col-span-6 md:col-span-2 lg:col-span-2">
          <label class="label-style">Anlaşma</label>
          <select 
            v-model="yeniKalem.anlasma_id" 
            class="form-input mt-1 text-xs truncate" 
            :disabled="yeniKalemTipi === 'hizmet' || (secilenKaynak && secilenKaynak.tip === 'depo')" 
            :class="{ 'bg-gray-100': yeniKalemTipi === 'hizmet' || (secilenKaynak && secilenKaynak.tip === 'depo') }"
          >
            <option :value="null">Yok</option>
            <option v-for="anlasma in props.anlasmalar" :key="anlasma.id" :value="anlasma.id">{{ anlasma.ad }}</option>
          </select>
        </div>

        <!-- 5. MİKTAR -->
        <div class="col-span-3 md:col-span-1 lg:col-span-1">
          <label class="label-style">Miktar</label>
          <input v-model.number="yeniKalem.miktar" type="number" min="1" class="form-input no-spinner form-input mt-1 font-bold text-center px-1" :class="{'border-red-500': !proformaModu && stokYetersiz}"/>
          <div v-if="!proformaModu && stokYetersiz" class="relative">
               <span class="text-[9px] text-red-500 absolute top-0 left-0 whitespace-nowrap bg-white px-1 border border-red-200 rounded shadow-sm z-10">Stok: {{ mevcutStok }}</span>
          </div>
        </div>
        
        <!-- 6. BİRİM -->
        <div class="col-span-3 md:col-span-1 lg:col-span-1">
          <label class="label-style">Birim</label>
          <input 
              v-model="yeniKalem.birim" 
              type="text" 
              list="birimlerListesi"
              class="form-input mt-1 text-center px-1 text-xs" 
              placeholder="Birim"
          />
          <datalist id="birimlerListesi">
              <option v-for="birim in birimListesi" :key="birim" :value="birim"></option>
          </datalist>
        </div>

        <!-- 7. BİRİM FİYAT / MALİYET -->
        <div class="col-span-6 md:col-span-2 lg:col-span-1">
          <label class="label-style truncate" :title="secilenKaynak?.tip === 'emanet' ? 'Bu emanet kaydı için esas alınacak maliyet' : 'KDV Hariç'">
            {{ secilenKaynak?.tip === 'emanet' ? 'Maliyet' : 'Birim Fiyat' }} 
            <span class="text-[9px] font-normal text-gray-500" v-if="secilenKaynak?.tip !== 'emanet'">(KDV'siz)</span>
          </label>
          <div class="relative mt-1 rounded-md shadow-sm">
              <input 
                  v-model.number="yeniKalem.birim_fiyat" 
                  type="number" 
                  step="0.01" 
                  class="form-input no-spinner form-input pr-10 font-mono text-sm" 
                  :class="{'border-orange-300': secilenKaynak?.tip === 'emanet'}"
                  placeholder="0"
              />
              <div class="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <span class="text-gray-500 text-xs font-bold">{{ props.paraBirimi }}</span>
              </div>
          </div>
        </div>

        <!-- 8. EKLE / GÜNCELLE BUTONU -->
        <div class="col-span-6 md:col-span-1 lg:col-span-1 flex space-x-1">
          <button v-if="duzenlemeModu" @click="kalemDuzenlemeyiIptalEt" type="button" class="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-1 rounded-lg text-xs shadow transition-colors h-[38px] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
          </button>
          <button @click="kalemEkle" type="button" class="w-full font-bold py-2 px-1 rounded-lg text-xs shadow transition-colors h-[38px] flex items-center justify-center" 
            :class="duzenlemeModu ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : (secilenKaynak?.tip === 'emanet' ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white')"
            :disabled="!proformaModu && stokYetersiz">
            {{ duzenlemeModu ? 'Güncelle' : 'Ekle' }}
          </button>
        </div>
      </div>
    </div>

    <!-- GRUPLANMIŞ TABLO GÖRÜNÜMÜ -->
    <div v-if="gruplanmisKalemlerListesi.length === 0" class="text-center py-6 text-gray-400 italic bg-gray-50 border border-gray-200 rounded-lg">
        Henüz malzeme veya hizmet eklenmedi.
    </div>

    <div v-else class="space-y-4">
        <div v-for="(grup, gIndex) in gruplanmisKalemlerListesi" :key="gIndex" class="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div class="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                <h3 class="font-bold text-gray-700 text-sm uppercase tracking-wider">{{ grup.ad }}</h3>
                <span class="text-xs text-gray-500 font-mono">{{ grup.kalemler.length }} kalem</span>
            </div>
            
            <table class="min-w-full leading-normal">
                <thead>
                    <tr>
                    <th class="th-style pl-4">Açıklama</th>
                    <th v-if="!proformaModu" class="th-style text-center">Kaynak / Anlaşma</th>
                    <th class="th-style text-center">Miktar</th>
                    <th class="th-style text-center">Birim</th>
                    <th class="th-style text-right">Birim Fiyat</th>
                    <th class="th-style text-right">Toplam (KDV Hariç)</th>
                    <th class="th-style w-20 text-center">İşlem</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                    <tr v-for="(kalem) in grup.kalemler" :key="kalem._originalIndex" class="hover:bg-gray-50 transition-colors" :class="{'bg-yellow-50': duzenlemeIndex === kalem._originalIndex}">
                        <td class="td-style pl-4 font-medium text-gray-700">
                          {{ kalem.aciklama }}
                          <span v-if="kalem.is_emanet" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-800">
                             Emanet
                          </span>
                        </td>
                        
                        <td v-if="!proformaModu" class="td-style text-center text-xs text-gray-500">
                            <div v-if="kalem.is_emanet">
                              <span class="text-orange-600 font-bold block">Emanet</span>
                              <span class="text-gray-400 italic">{{ kalem.emanet_tedarikci_notu }}</span>
                            </div>
                            <div v-else>
                              <div v-if="kalem.kaynak_adi">{{ kalem.kaynak_adi }}</div>
                              <div v-if="kalem.anlasma_id" class="text-indigo-600 font-medium">{{ anlasmaAdiBul(kalem.anlasma_id) }}</div>
                            </div>
                        </td>
                        
                        <td class="td-style text-center font-bold text-gray-800">{{ kalem.miktar }}</td>
                        <td class="td-style text-center text-gray-600 text-xs">{{ kalem.birim }}</td>
                        <td class="td-style text-right font-mono text-gray-600">{{ formatPara(kalem.birim_fiyat) }}</td>
                        <td class="td-style text-right font-bold text-gray-900 font-mono">
                            {{ formatPara(kalem.miktar * kalem.birim_fiyat) }}
                        </td>
                        
                        <td class="td-style text-center">
                            <div class="flex items-center justify-center space-x-1">
                                <button @click="kalemDuzenle(kalem._originalIndex)" class="text-yellow-500 hover:text-yellow-700 p-1 rounded-full hover:bg-yellow-50 transition-colors" title="Düzenle">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                </button>
                                <button @click="kalemSil(kalem._originalIndex)" class="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors" title="Sil">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

  </div>
</template>

<style scoped>
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.no-spinner { -moz-appearance: textfield; }
.label-style { @apply block text-[10px] font-bold text-gray-600 mb-1 ml-1 uppercase tracking-wide; }
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2 px-2 text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-shadow h-[38px]; }
.th-style { @apply px-3 py-3 bg-gray-100 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200; }
.td-style { @apply px-3 py-3 text-sm; }
</style>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { supabase } from '../supabase.js';

const props = defineProps({
  initialKalemler: Array,
  depolar: Array,
  tedarikciler: Array,
  anlasmalar: Array,
  varsayilanAnlasma: Object,
  proformaModu: { type: Boolean, default: false },
  paraBirimi: { type: String, default: 'TRY' }
});

const emit = defineEmits(['kalemler-guncellendi']);

const kalemler = ref([]);
const yeniKalem = ref({});
const secilenKaynak = ref(null);
const emanetKisiNotu = ref(''); 
const yeniKalemTipi = ref('malzeme');
const urunAramaMetni = ref('');
const urunAramaSonuclari = ref([]);
const aramaYapiliyor = ref(false);
const mevcutStok = ref(Infinity);
const birimListesi = ref(['Adet', 'Metre', 'Kg', 'Saat', 'Takım', 'Lt', 'Paket']); 

const duzenlemeIndex = ref(null);
const duzenlemeModu = computed(() => duzenlemeIndex.value !== null);

const aktifGrup = ref('Genel');

const mevcutGruplar = computed(() => {
    const set = new Set(kalemler.value.map(k => k.grup_adi || 'Genel'));
    set.add('Genel');
    if (aktifGrup.value) set.add(aktifGrup.value);
    return Array.from(set).sort();
});

const genislikAyari = computed(() => {
  if (props.proformaModu) return { urunInputClass: 'col-span-12 md:col-span-4 lg:col-span-5' };
  return { urunInputClass: 'col-span-12 md:col-span-4 lg:col-span-3' };
});

const gruplanmisKalemlerListesi = computed(() => {
    const gruplar = {};
    kalemler.value.forEach((kalem, index) => {
        const grupAdi = kalem.grup_adi || 'Genel';
        if (!gruplar[grupAdi]) gruplar[grupAdi] = [];
        gruplar[grupAdi].push({ ...kalem, _originalIndex: index });
    });
    
    return Object.keys(gruplar).map(key => ({
        ad: key,
        kalemler: gruplar[key]
    }));
});

const stokYetersiz = computed(() => {
  if (props.proformaModu) return false;
  if (secilenKaynak.value?.tip === 'emanet') return false; 
  return yeniKalem.value.miktar > mevcutStok.value;
});

const bosKalemOlustur = () => ({ 
  id: null, // YENİ: ID alanı tutulacak
  urun_id: null, 
  aciklama: '', 
  miktar: 1, 
  birim: 'Adet', 
  birim_fiyat: 0, 
  kaynak_depo_id: null, 
  kaynak_tedarikci_id: null, 
  kaynak_adi: '', 
  anlasma_id: props.varsayilanAnlasma?.id || null,
  grup_adi: aktifGrup.value,
  is_emanet: false,
  emanet_tedarikci_notu: ''
});

const formatPara = (val) => {
  return new Intl.NumberFormat('tr-TR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val || 0);
};

onMounted(async () => {
  if (props.initialKalemler) {
    kalemler.value = [...props.initialKalemler];
  }
  yeniKalem.value = bosKalemOlustur();

  try {
    const { data, error } = await supabase.from('urunler').select('ana_birim');
    if (data && !error) {
        const dbBirimler = data.map(u => u.ana_birim).filter(b => b && b.trim() !== '');
        const birlesik = new Set([...birimListesi.value, ...dbBirimler]);
        birimListesi.value = Array.from(birlesik).sort();
    }
  } catch (err) {
    console.error("Birim listesi çekilemedi:", err);
  }
});

const anlasmaAdiBul = (anlasmaId) => {
  if (!anlasmaId || !props.anlasmalar) return '-';
  const anlasma = props.anlasmalar.find(a => a.id === anlasmaId);
  return anlasma ? anlasma.ad : 'Bilinmiyor';
};

const secilenAnlasmaTipi = computed(() => {
    const anlasmaId = yeniKalem.value.anlasma_id;
    if (!anlasmaId || !props.anlasmalar) return null;
    const secilenAnlasma = props.anlasmalar.find(a => a.id === anlasmaId);
    return secilenAnlasma?.tip || null;
});

const urunBazliAnlasmaVeAnlasmaYok = computed(() => {
  if (props.proformaModu) return false;
  if (secilenKaynak.value?.tip === 'emanet') return false;
  if (props.varsayilanAnlasma && props.varsayilanAnlasma.tip === 'Ürün Bazlı' && !yeniKalem.value.anlasma_id) return true;
  if (secilenAnlasmaTipi.value === 'Ürün Bazlı' && !yeniKalem.value.anlasma_id) return true;
  return false;
});

let debounceTimer;
const urunAra = () => {
  if (!props.proformaModu && urunBazliAnlasmaVeAnlasmaYok.value) { 
    urunAramaSonuclari.value = []; 
    return; 
  }
  
  // Eğer kullanıcı manuel siliyorsa ürün_id'yi sıfırla ki arama temizlensin
  if (urunAramaMetni.value.length < 2) {
     yeniKalem.value.urun_id = null;
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const aramaMetni = urunAramaMetni.value.trim();
    if (aramaMetni.length < 2) { 
      urunAramaSonuclari.value = []; 
      return; 
    }
    
    aramaYapiliyor.value = true;
    let filterIds = null; 

    try {
        if (!props.proformaModu && secilenAnlasmaTipi.value === 'Ürün Bazlı' && yeniKalem.value.anlasma_id) {
          const secilenAnlasma = props.anlasmalar.find(a => a.id === yeniKalem.value.anlasma_id);
          if (secilenAnlasma && secilenAnlasma.anlasma_kalemleri) {
            filterIds = secilenAnlasma.anlasma_kalemleri.map(k => k.urun_id);
          }
        }

        const { data, error } = await supabase.rpc('urun_ara', {
            arama_metni: aramaMetni,
            filtre_ids: filterIds, 
            limit_val: 20
        });

        if (error) throw error;
        urunAramaSonuclari.value = data || [];

    } catch (err) {
        console.error("Ürün arama hatası:", err);
        urunAramaSonuclari.value = [];
    } finally {
        aramaYapiliyor.value = false;
    }

  }, 300);
};

const stokKontrolEt = async () => {
  if (props.proformaModu) { mevcutStok.value = Infinity; return; }
  if (secilenKaynak.value?.tip === 'emanet') { mevcutStok.value = Infinity; return; }
  if (!yeniKalem.value.urun_id || !secilenKaynak.value || secilenKaynak.value.tip !== 'depo') { mevcutStok.value = Infinity; return; }
  
  try {
    const { data, error } = await supabase.from('stok_seviyeleri').select('miktar, rezerve_miktar').eq('urun_id', yeniKalem.value.urun_id).eq('depo_id', secilenKaynak.value.id).single();
    if (error) { mevcutStok.value = 0; return; }
    mevcutStok.value = (data.miktar || 0) - (data.rezerve_miktar || 0);
    
    // YENİ: Eğer düzenleme modundaysak, mevcut miktarı mevcutStok'a ekle (kendi stok hakkı)
    if (duzenlemeModu.value && kalemler.value[duzenlemeIndex.value].urun_id === yeniKalem.value.urun_id) {
       mevcutStok.value += kalemler.value[duzenlemeIndex.value].miktar;
    }
  } catch (err) { mevcutStok.value = 0; }
};

const urunSec = (urun) => {
  yeniKalem.value.urun_id = urun.id;
  yeniKalem.value.aciklama = `${urun.urun_kodu} - ${urun.aciklama}`;
  if (urun.ana_birim) { yeniKalem.value.birim = urun.ana_birim; }
  
  urunAramaMetni.value = yeniKalem.value.aciklama;
  urunAramaSonuclari.value = [];
  
  stokKontrolEt();
};

const kalemEkle = () => {
  if (!yeniKalem.value.aciklama || yeniKalem.value.miktar <= 0) { alert('Lütfen açıklama ve miktar giriniz.'); return; }
  
  if (!props.proformaModu) {
    if (yeniKalemTipi.value === 'malzeme') {
       if (!secilenKaynak.value) { alert('Malzeme için kaynak seçiniz.'); return; }
       
       if (secilenKaynak.value.tip === 'emanet') {
          if (!emanetKisiNotu.value.trim()) { alert('Lütfen kimden emanet alındığını (Not) giriniz.'); return; }
          yeniKalem.value.is_emanet = true;
          yeniKalem.value.emanet_tedarikci_notu = emanetKisiNotu.value;
          yeniKalem.value.kaynak_depo_id = null;
          yeniKalem.value.kaynak_tedarikci_id = null;
          yeniKalem.value.kaynak_adi = 'Emanet';
          yeniKalem.value.anlasma_id = null;
       } 
       else if (secilenKaynak.value.tip === 'depo') {
          if (yeniKalem.value.miktar > mevcutStok.value) { alert(`Yetersiz stok! Mevcut: ${mevcutStok.value}`); return; }
          yeniKalem.value.is_emanet = false;
          yeniKalem.value.kaynak_depo_id = secilenKaynak.value.id; 
          yeniKalem.value.kaynak_tedarikci_id = null; 
          yeniKalem.value.kaynak_adi = secilenKaynak.value.ad; 
          yeniKalem.value.anlasma_id = null;
       } 
       else { 
          if (secilenAnlasmaTipi.value === 'Ürün Bazlı' && !yeniKalem.value.anlasma_id) { alert('Anlaşma seçmelisiniz.'); return; }
          yeniKalem.value.is_emanet = false;
          yeniKalem.value.kaynak_depo_id = null; 
          yeniKalem.value.kaynak_tedarikci_id = secilenKaynak.value.id; 
          yeniKalem.value.kaynak_adi = secilenKaynak.value.ad; 
       }
    } 
    else { 
        yeniKalem.value.is_emanet = false;
        yeniKalem.value.kaynak_depo_id = null; 
        yeniKalem.value.kaynak_tedarikci_id = null; 
        yeniKalem.value.anlasma_id = null; 
        yeniKalem.value.kaynak_adi = 'Hizmet'; 
    }
  } else {
    yeniKalem.value.is_emanet = false;
    yeniKalem.value.kaynak_depo_id = null;
    yeniKalem.value.kaynak_tedarikci_id = null;
    yeniKalem.value.kaynak_adi = null;
    yeniKalem.value.anlasma_id = null; 
    yeniKalem.value.grup_adi = aktifGrup.value || 'Genel';
  }
  
  if (duzenlemeModu.value) {
    kalemler.value[duzenlemeIndex.value] = { ...yeniKalem.value };
    duzenlemeIndex.value = null; 
  } else {
    kalemler.value.push({ ...yeniKalem.value });
  }

  yeniKalem.value = bosKalemOlustur();
  urunAramaMetni.value = '';
  secilenKaynak.value = null;
  emanetKisiNotu.value = ''; 
  mevcutStok.value = Infinity;
};

const kalemDuzenle = (index) => {
    duzenlemeIndex.value = index;
    const kalem = kalemler.value[index];
    yeniKalem.value = { ...kalem };
    
    if (kalem.urun_id) {
        yeniKalemTipi.value = 'malzeme';
        urunAramaMetni.value = kalem.aciklama;
    } else {
        yeniKalemTipi.value = 'hizmet';
    }

    if (kalem.is_emanet) {
       secilenKaynak.value = { tip: 'emanet', id: 'emanet', ad: 'Emanet (Stok Borç)' };
       emanetKisiNotu.value = kalem.emanet_tedarikci_notu;
    } else if (kalem.kaynak_depo_id) {
       const depo = props.depolar?.find(d => d.id === kalem.kaynak_depo_id);
       if (depo) secilenKaynak.value = { tip: 'depo', id: depo.id, ad: depo.ad };
    } else if (kalem.kaynak_tedarikci_id) {
       const ted = props.tedarikciler?.find(t => t.id === kalem.kaynak_tedarikci_id);
       if (ted) secilenKaynak.value = { tip: 'tedarikci', id: ted.id, ad: ted.ad };
    }

    if(kalem.grup_adi) {
        aktifGrup.value = kalem.grup_adi;
    }
    
    stokKontrolEt();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const kalemDuzenlemeyiIptalEt = () => {
    duzenlemeIndex.value = null;
    yeniKalem.value = bosKalemOlustur();
    urunAramaMetni.value = '';
    secilenKaynak.value = null;
    emanetKisiNotu.value = '';
};

const kalemSil = (index) => { 
    if(duzenlemeIndex.value === index) kalemDuzenlemeyiIptalEt();
    kalemler.value.splice(index, 1); 
};

watch(() => props.varsayilanAnlasma, (newAnlasma) => { 
  if (props.proformaModu) return;
  if (!secilenKaynak.value || secilenKaynak.value.tip !== 'depo') {
    if(secilenKaynak.value?.tip === 'emanet') {
        yeniKalem.value.anlasma_id = null;
    } else {
        yeniKalem.value.anlasma_id = newAnlasma?.id || null; 
    }
  }
});

watch(secilenKaynak, (newKaynak) => {
  if (props.proformaModu) return;
  stokKontrolEt();
  if (newKaynak) {
      if (newKaynak.tip === 'depo' || newKaynak.tip === 'emanet') {
        yeniKalem.value.anlasma_id = null; 
      }
      if (newKaynak.tip !== 'emanet') {
          emanetKisiNotu.value = '';
      }
  }
});

watch(aktifGrup, (newVal) => {
    yeniKalem.value.grup_adi = newVal;
});

watch(kalemler, (yeniListe) => { emit('kalemler-guncellendi', yeniListe); }, { deep: true });
</script>
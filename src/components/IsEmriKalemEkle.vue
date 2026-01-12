<template>
  <div>
    <div class="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg bg-gray-50">
      
      <!-- KALEM TİPİ -->
      <div class="col-span-12 md:col-span-2">
        <label class="label-style">Kalem Tipi</label>
        <select v-model="yeniKalemTipi" class="form-input mt-1">
          <option value="malzeme">Malzeme</option>
          <option value="hizmet">Hizmet</option>
        </select>
      </div>

      <!-- MALZEME / HİZMET SEÇİMİ -->
      <div :class="proformaModu ? 'col-span-12 md:col-span-6' : 'col-span-12 md:col-span-3'">
        <label class="label-style">{{ yeniKalemTipi === 'malzeme' ? 'Malzeme Seç' : 'Hizmet Açıklaması' }}</label>
        
        <div v-if="yeniKalemTipi === 'malzeme'" class="relative mt-1">
          <input 
            type="text" 
            v-model="urunAramaMetni" 
            @input="urunAra" 
            :placeholder="!proformaModu && urunBazliAnlasmaVeAnlasmaYok ? 'Önce bir anlaşma seçiniz' : 'Ürün kodu veya açıklama...'" 
            class="form-input" 
            :disabled="!proformaModu && urunBazliAnlasmaVeAnlasmaYok"
            :class="{ 'bg-gray-100 cursor-not-allowed': !proformaModu && urunBazliAnlasmaVeAnlasmaYok }"
          />
          
          <div v-if="!proformaModu && urunBazliAnlasmaVeAnlasmaYok" class="mt-1 text-xs text-orange-600">
            * Ürün bazlı anlaşma için önce anlaşma seçmelisiniz
          </div>

          <!-- ARAMA SONUÇLARI -->
          <div v-if="urunAramaSonuclari.length > 0 && (proformaModu || !urunBazliAnlasmaVeAnlasmaYok)" class="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
            <ul v-if="proformaModu || filtrelenmisUrunAramaSonuclari.length > 0">
              <li 
                v-for="urun in (proformaModu ? urunAramaSonuclari : filtrelenmisUrunAramaSonuclari)" 
                :key="urun.id" 
                @click="urunSec(urun)" 
                class="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {{ urun.urun_kodu }} - {{ urun.aciklama }}
              </li>
            </ul>
            <div v-else class="p-2 text-sm text-gray-500">Bu anlaşmada uygun ürün bulunamadı.</div>
          </div>
        </div>
        
        <input v-else v-model="yeniKalem.aciklama" type="text" placeholder="Örn: Montaj Bedeli" class="form-input mt-1" />
      </div>
      
      <!-- KAYNAK SEÇİMİ (Proforma Modunda Gizli) -->
      <div v-if="!proformaModu" class="col-span-12 md:col-span-2">
        <label class="label-style">Kaynak</label>
        <select v-model="secilenKaynak" class="form-input mt-1" :disabled="yeniKalemTipi === 'hizmet'" :class="{ 'bg-gray-100': yeniKalemTipi === 'hizmet' }">
          <option :value="null">Kaynak Seçin</option>
          <optgroup label="Depolar">
            <option v-for="depo in props.depolar" :key="depo.id" :value="{ tip: 'depo', id: depo.id, ad: depo.ad }">{{ depo.ad }}</option>
          </optgroup>
          <optgroup label="Tedarikçiler">
            <option v-for="tedarikci in props.tedarikciler" :key="tedarikci.id" :value="{ tip: 'tedarikci', id: tedarikci.id, ad: tedarikci.ad }">{{ tedarikci.ad }}</option>
          </optgroup>
        </select>
      </div>

      <!-- ANLAŞMA SEÇİMİ (Proforma Modunda Gizli) -->
      <div v-if="!proformaModu" class="col-span-12 md:col-span-2">
        <label class="label-style">Anlaşma</label>
        <select 
          v-model="yeniKalem.anlasma_id" 
          class="form-input mt-1" 
          :disabled="yeniKalemTipi === 'hizmet' || (secilenKaynak && secilenKaynak.tip === 'depo')" 
          :class="{ 'bg-gray-100': yeniKalemTipi === 'hizmet' || (secilenKaynak && secilenKaynak.tip === 'depo') }"
        >
          <option :value="null">Anlaşma Dışı</option>
          <option v-for="anlasma in props.anlasmalar" :key="anlasma.id" :value="anlasma.id">{{ anlasma.ad }}</option>
        </select>
      </div>

      <!-- MİKTAR -->
      <div class="col-span-6 md:col-span-1">
        <label class="label-style">Miktar</label>
        <p v-if="!proformaModu && stokYetersiz" class="text-xs text-red-500 mb-1">⚠️ Stok: {{ mevcutStok }}</p>
        <input v-model.number="yeniKalem.miktar" type="number" class="form-input mt-1" :class="{'border-red-500': !proformaModu && stokYetersiz}"/>
      </div>
      
      <!-- BİRİM FİYAT -->
      <div class="col-span-6 md:col-span-2">
        <!-- Para birimi etikette gösteriliyor -->
        <label class="label-style">Birim Fiyat ({{ props.paraBirimi }})</label>
        <input v-model.number="yeniKalem.birim_fiyat" type="number" step="0.01" class="form-input mt-1" />
      </div>

      <!-- EKLE BUTONU -->
      <div class="col-span-12 md:col-span-1">
        <button @click="kalemEkle" type="button" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg mt-6" :disabled="!proformaModu && stokYetersiz">
          Ekle
        </button>
      </div>
    </div>

    <!-- TABLO -->
    <div class="mt-6">
      <div class="bg-white shadow-md rounded-lg overflow-x-auto">
        <table class="min-w-full leading-normal">
          <thead>
            <tr>
              <th class="th-style">Açıklama</th>
              <th v-if="!proformaModu" class="th-style text-center">Kaynak</th>
              <th v-if="!proformaModu" class="th-style text-center">Anlaşma</th>
              <th class="th-style text-center">Miktar</th>
              <th class="th-style text-right">Birim Fiyat</th>
              <th class="th-style text-right">Toplam</th>
              <th class="th-style w-12"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="kalemler.length === 0">
              <td :colspan="proformaModu ? 5 : 7" class="text-center py-4 text-gray-500">Henüz malzeme veya hizmet eklenmedi.</td>
            </tr>
            <tr v-for="(kalem, index) in kalemler" :key="index">
              <td class="td-style">{{ kalem.aciklama }}</td>
              
              <td v-if="!proformaModu" class="td-style text-center">
                {{ kalem.kaynak_adi || getKaynakAdi(kalem) }}
              </td>
              <td v-if="!proformaModu" class="td-style text-center">{{ anlasmaAdiBul(kalem.anlasma_id) }}</td>
              
              <td class="td-style text-center">{{ kalem.miktar }}</td>
              
              <!-- DİNAMİK PARA BİRİMİ FORMATI -->
              <td class="td-style text-right">{{ formatPara(kalem.birim_fiyat) }}</td>
              <td class="td-style text-right font-semibold">{{ formatPara(kalem.miktar * kalem.birim_fiyat) }}</td>
              
              <td class="td-style text-center">
                <button @click="kalemSil(index)" class="text-red-500 hover:text-red-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.label-style { @apply block text-sm font-medium text-gray-700; }
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
.th-style { @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider; }
.td-style { @apply px-5 py-5 border-b border-gray-200 bg-white text-sm; }
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
  paraBirimi: { type: String, default: 'TRY' } // YENİ PROP
});

const emit = defineEmits(['kalemler-guncellendi']);

const kalemler = ref([]);
const yeniKalem = ref({});
const secilenKaynak = ref(null);
const yeniKalemTipi = ref('malzeme');
const urunAramaMetni = ref('');
const urunAramaSonuclari = ref([]);
const mevcutStok = ref(Infinity);

const stokYetersiz = computed(() => {
  if (props.proformaModu) return false;
  return yeniKalem.value.miktar > mevcutStok.value;
});

const bosKalemOlustur = () => ({ 
  urun_id: null, 
  aciklama: '', 
  miktar: 1, 
  birim_fiyat: 0, 
  kaynak_depo_id: null, 
  kaynak_tedarikci_id: null, 
  kaynak_adi: '', 
  anlasma_id: props.varsayilanAnlasma?.id || null 
});

// Format Yardımcısı
const formatPara = (val) => {
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: props.paraBirimi || 'TRY' 
  }).format(val || 0);
};

onMounted(() => {
  if (props.initialKalemler) {
    kalemler.value = [...props.initialKalemler];
  }
  yeniKalem.value = bosKalemOlustur();
});

const anlasmaAdiBul = (anlasmaId) => {
  if (!anlasmaId || !props.anlasmalar) return 'Anlaşma Dışı';
  const anlasma = props.anlasmalar.find(a => a.id === anlasmaId);
  return anlasma ? anlasma.ad : 'Bilinmeyen';
};

const getKaynakAdi = (kalem) => {
  if (kalem.kaynak_depo_id) {
    const depo = props.depolar?.find(d => d.id === kalem.kaynak_depo_id);
    return depo ? depo.ad : 'Bilinmeyen Depo';
  } else if (kalem.kaynak_tedarikci_id) {
    const tedarikci = props.tedarikciler?.find(t => t.id === kalem.kaynak_tedarikci_id);
    return tedarikci ? tedarikci.ad : 'Bilinmeyen Tedarikçi';
  }
  return 'Hizmet / Belirtilmemiş';
};

// ... Anlaşma ve Arama Mantığı ...
const secilenAnlasmaTipi = computed(() => {
    const anlasmaId = yeniKalem.value.anlasma_id;
    if (!anlasmaId || !props.anlasmalar) return null;
    const secilenAnlasma = props.anlasmalar.find(a => a.id === anlasmaId);
    return secilenAnlasma?.tip || null;
});

const urunBazliAnlasmaVeAnlasmaYok = computed(() => {
  if (props.proformaModu) return false;

  if (props.varsayilanAnlasma && props.varsayilanAnlasma.tip === 'Ürün Bazlı') {
    if (!yeniKalem.value.anlasma_id) return true;
  }
  if (secilenAnlasmaTipi.value === 'Ürün Bazlı') {
    if (!yeniKalem.value.anlasma_id) return true;
  }
  return false;
});

const filtrelenmisUrunAramaSonuclari = computed(() => {
  if (props.proformaModu) return urunAramaSonuclari.value; 
  
  if (urunBazliAnlasmaVeAnlasmaYok.value) return [];
  if (secilenAnlasmaTipi.value !== 'Ürün Bazlı') return urunAramaSonuclari.value;
  
  const secilenAnlasma = props.anlasmalar.find(a => a.id === yeniKalem.value.anlasma_id);
  if (!secilenAnlasma || !secilenAnlasma.anlasma_kalemleri) return [];
  
  return urunAramaSonuclari.value.filter(urun => 
    secilenAnlasma.anlasma_kalemleri.some(kalem => kalem.urun_id === urun.id)
  );
});

let debounceTimer;
const urunAra = () => {
  if (!props.proformaModu && urunBazliAnlasmaVeAnlasmaYok.value) {
    urunAramaSonuclari.value = [];
    return;
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (urunAramaMetni.value.length < 2) { urunAramaSonuclari.value = []; return; }
    
    if (!props.proformaModu && secilenAnlasmaTipi.value === 'Ürün Bazlı' && yeniKalem.value.anlasma_id) {
      const secilenAnlasma = props.anlasmalar.find(a => a.id === yeniKalem.value.anlasma_id);
      if (secilenAnlasma && secilenAnlasma.anlasma_kalemleri) {
        const anlasmaUrunIds = secilenAnlasma.anlasma_kalemleri.map(k => k.urun_id);
        const { data } = await supabase.from('urunler').select('id, urun_kodu, aciklama').in('id', anlasmaUrunIds).or(`urun_kodu.ilike.%${urunAramaMetni.value}%,aciklama.ilike.%${urunAramaMetni.value}%`).limit(10);
        urunAramaSonuclari.value = data || [];
        return;
      }
    }
    
    const { data } = await supabase.from('urunler').select('id, urun_kodu, aciklama').or(`urun_kodu.ilike.%${urunAramaMetni.value}%,aciklama.ilike.%${urunAramaMetni.value}%`).limit(10);
    urunAramaSonuclari.value = data || [];
  }, 300);
};

const stokKontrolEt = async () => {
  if (props.proformaModu) { mevcutStok.value = Infinity; return; }

  if (!yeniKalem.value.urun_id || !secilenKaynak.value || secilenKaynak.value.tip !== 'depo') { mevcutStok.value = Infinity; return; }
  try {
    const { data, error } = await supabase.from('stok_seviyeleri').select('miktar, rezerve_miktar').eq('urun_id', yeniKalem.value.urun_id).eq('depo_id', secilenKaynak.value.id).single();
    if (error) { mevcutStok.value = 0; return; }
    mevcutStok.value = (data.miktar || 0) - (data.rezerve_miktar || 0);
  } catch (err) { mevcutStok.value = 0; }
};

const urunSec = (urun) => {
  yeniKalem.value.urun_id = urun.id;
  yeniKalem.value.aciklama = `${urun.urun_kodu} - ${urun.aciklama}`;
  urunAramaMetni.value = yeniKalem.value.aciklama;
  urunAramaSonuclari.value = [];
  stokKontrolEt();
};

const kalemEkle = () => {
  if (!yeniKalem.value.aciklama || yeniKalem.value.miktar <= 0) { alert('Lütfen açıklama ve miktar alanlarını doğru girin.'); return; }

  if (!props.proformaModu) {
    if (yeniKalemTipi.value === 'malzeme' && secilenAnlasmaTipi.value === 'Ürün Bazlı') {
        if (!yeniKalem.value.anlasma_id) { alert('Anlaşma seçmelisiniz.'); return; }
    }
    
    if (yeniKalemTipi.value === 'malzeme' && secilenKaynak.value?.tip === 'depo' && yeniKalem.value.miktar > mevcutStok.value) { 
        alert(`Yetersiz stok! Mevcut: ${mevcutStok.value}`); return; 
    }
    
    if (yeniKalemTipi.value === 'malzeme') {
        if (!secilenKaynak.value) { alert('Malzeme için bir kaynak seçin.'); return; }
        if(secilenKaynak.value.tip === 'depo') { 
            yeniKalem.value.kaynak_depo_id = secilenKaynak.value.id; 
            yeniKalem.value.kaynak_tedarikci_id = null; 
            yeniKalem.value.kaynak_adi = secilenKaynak.value.ad; 
            yeniKalem.value.anlasma_id = null;
        } else { 
            yeniKalem.value.kaynak_depo_id = null; 
            yeniKalem.value.kaynak_tedarikci_id = secilenKaynak.value.id; 
            yeniKalem.value.kaynak_adi = secilenKaynak.value.ad; 
        }
    } else { 
        yeniKalem.value.kaynak_depo_id = null; 
        yeniKalem.value.kaynak_tedarikci_id = null; 
        yeniKalem.value.anlasma_id = null; 
        yeniKalem.value.kaynak_adi = 'Hizmet'; 
    }
  } else {
    yeniKalem.value.kaynak_depo_id = null;
    yeniKalem.value.kaynak_tedarikci_id = null;
    yeniKalem.value.kaynak_adi = null;
    yeniKalem.value.anlasma_id = null; 
  }
  
  kalemler.value.push({ ...yeniKalem.value });
  yeniKalem.value = bosKalemOlustur();
  urunAramaMetni.value = '';
  secilenKaynak.value = null;
  mevcutStok.value = Infinity;
};

const kalemSil = (index) => { kalemler.value.splice(index, 1); };

watch(() => props.varsayilanAnlasma, (newAnlasma) => { 
  if (props.proformaModu) return;
  if (!secilenKaynak.value || secilenKaynak.value.tip !== 'depo') {
    yeniKalem.value.anlasma_id = newAnlasma?.id || null; 
  }
});

watch(secilenKaynak, (newKaynak) => {
  if (props.proformaModu) return;
  stokKontrolEt();
  if (newKaynak && newKaynak.tip === 'depo') {
    yeniKalem.value.anlasma_id = null; 
  }
});

watch(kalemler, (yeniListe) => { emit('kalemler-guncellendi', yeniListe); }, { deep: true });
</script>
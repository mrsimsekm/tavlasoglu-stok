<template>
  <div>
    <!-- FORM ALANI -->
    <div class="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg bg-gray-50">
      
      <!-- 1. KALEM TİPİ (Küçültüldü) -->
      <div class="col-span-6 md:col-span-2 lg:col-span-1">
        <label class="label-style">Kalem Tipi</label>
        <select v-model="yeniKalemTipi" class="form-input mt-1">
          <option value="malzeme">Malzeme</option>
          <option value="hizmet">Hizmet</option>
        </select>
      </div>

      <!-- 2. MALZEME / HİZMET SEÇİMİ (Esnek Genişlik) -->
      <div :class="proformaModu ? 'col-span-12 md:col-span-4 lg:col-span-5' : 'col-span-12 md:col-span-4 lg:col-span-3'">
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
          <!-- Sonuç Bulunamadı Mesajı (Arama yapıldıysa ve sonuç yoksa) -->
           <div v-else-if="urunAramaMetni.length >= 2 && !aramaYapiliyor && urunAramaSonuclari.length === 0 && !urunBazliAnlasmaVeAnlasmaYok" class="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-20 p-2 text-xs text-gray-500">
             Uygun ürün bulunamadı.
           </div>
        </div>
        
        <input v-else v-model="yeniKalem.aciklama" type="text" placeholder="Örn: Montaj" class="form-input mt-1" />
      </div>
      
      <!-- 3. KAYNAK SEÇİMİ (Küçültüldü) -->
      <div v-if="!proformaModu" class="col-span-6 md:col-span-2 lg:col-span-2">
        <label class="label-style">Kaynak</label>
        <select v-model="secilenKaynak" class="form-input mt-1 text-xs truncate" :disabled="yeniKalemTipi === 'hizmet'" :class="{ 'bg-gray-100': yeniKalemTipi === 'hizmet' }">
          <option :value="null">Seçiniz</option>
          <optgroup label="Depolar">
            <option v-for="depo in props.depolar" :key="depo.id" :value="{ tip: 'depo', id: depo.id, ad: depo.ad }">{{ depo.ad }}</option>
          </optgroup>
          <optgroup label="Tedarikçiler">
            <option v-for="tedarikci in props.tedarikciler" :key="tedarikci.id" :value="{ tip: 'tedarikci', id: tedarikci.id, ad: tedarikci.ad }">{{ tedarikci.ad }}</option>
          </optgroup>
        </select>
      </div>

      <!-- 4. ANLAŞMA SEÇİMİ (Küçültüldü) -->
      <div v-if="!proformaModu" class="col-span-6 md:col-span-2 lg:col-span-2">
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

      <!-- 5. MİKTAR (Küçültüldü) -->
      <div class="col-span-3 md:col-span-1 lg:col-span-1">
        <label class="label-style">Miktar</label>
        <input v-model.number="yeniKalem.miktar" type="number" min="1" class="form-input no-spinner form-input mt-1 font-bold text-center px-1" :class="{'border-red-500': !proformaModu && stokYetersiz}"/>
        <div v-if="!proformaModu && stokYetersiz" class="relative">
             <span class="text-[9px] text-red-500 absolute top-0 left-0 whitespace-nowrap bg-white px-1 border border-red-200 rounded shadow-sm z-10">Stok: {{ mevcutStok }}</span>
        </div>
      </div>
      
      <!-- 6. BİRİM (Küçültüldü) -->
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

      <!-- 7. BİRİM FİYAT (Küçültüldü) -->
      <div class="col-span-6 md:col-span-2 lg:col-span-1">
        <label class="label-style truncate" title="KDV Hariç">Birim Fiyat <span class="text-[9px] font-normal text-gray-500">(KDV'siz)</span></label>
        <div class="relative mt-1 rounded-md shadow-sm">
            <input 
                v-model.number="yeniKalem.birim_fiyat" 
                type="number" 
                step="0.01" 
                class="form-input no-spinner form-input pr-10 font-mono text-sm" 
                placeholder="0"
            />
            <div class="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
              <span class="text-gray-500 text-xs font-bold">{{ props.paraBirimi }}</span>
            </div>
        </div>
      </div>

      <!-- 8. EKLE BUTONU -->
      <div class="col-span-6 md:col-span-1 lg:col-span-1">
        <button @click="kalemEkle" type="button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-1 rounded-lg text-xs shadow transition-colors h-[38px] flex items-center justify-center" :disabled="!proformaModu && stokYetersiz">
          Ekle
        </button>
      </div>
    </div>

    <!-- TABLO -->
    <div class="mt-4">
      <div class="bg-white shadow border border-gray-200 rounded-lg overflow-hidden">
        <table class="min-w-full leading-normal">
          <thead>
            <tr>
              <th class="th-style pl-4">Açıklama</th>
              <th v-if="!proformaModu" class="th-style text-center">Kaynak / Anlaşma</th>
              <th class="th-style text-center">Miktar</th>
              <th class="th-style text-center">Birim</th>
              <th class="th-style text-right">Birim Fiyat</th>
              <th class="th-style text-right">Toplam (KDV Hariç)</th>
              <th class="th-style w-10"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="kalemler.length === 0">
              <td :colspan="proformaModu ? 6 : 7" class="text-center py-6 text-gray-400 italic bg-gray-50">Henüz malzeme veya hizmet eklenmedi.</td>
            </tr>
            <tr v-for="(kalem, index) in kalemler" :key="index" class="hover:bg-gray-50 transition-colors">
              <td class="td-style pl-4 font-medium text-gray-700">{{ kalem.aciklama }}</td>
              
              <td v-if="!proformaModu" class="td-style text-center text-xs text-gray-500">
                <div v-if="kalem.kaynak_adi">{{ kalem.kaynak_adi }}</div>
                <div v-if="kalem.anlasma_id" class="text-indigo-600 font-medium">{{ anlasmaAdiBul(kalem.anlasma_id) }}</div>
              </td>
              
              <td class="td-style text-center font-bold text-gray-800">{{ kalem.miktar }}</td>
              <td class="td-style text-center text-gray-600 text-xs">{{ kalem.birim }}</td>
              
              <td class="td-style text-right font-mono text-gray-600">{{ formatPara(kalem.birim_fiyat) }}</td>

              <td class="td-style text-right font-bold text-gray-900 font-mono">
                {{ formatPara(kalem.miktar * kalem.birim_fiyat) }}
              </td>
              
              <td class="td-style text-center">
                <button @click="kalemSil(index)" class="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors" title="Sil">
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
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-spinner {
  -moz-appearance: textfield;
}
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
const yeniKalemTipi = ref('malzeme');
const urunAramaMetni = ref('');
const urunAramaSonuclari = ref([]);
const aramaYapiliyor = ref(false); // Yeni: Yükleme durumu için
const mevcutStok = ref(Infinity);
const birimListesi = ref(['Adet', 'Metre', 'Kg', 'Saat', 'Takım', 'Lt', 'Paket']); 

const stokYetersiz = computed(() => {
  if (props.proformaModu) return false;
  return yeniKalem.value.miktar > mevcutStok.value;
});

const bosKalemOlustur = () => ({ 
  urun_id: null, 
  aciklama: '', 
  miktar: 1, 
  birim: 'Adet', 
  birim_fiyat: 0, 
  kaynak_depo_id: null, 
  kaynak_tedarikci_id: null, 
  kaynak_adi: '', 
  anlasma_id: props.varsayilanAnlasma?.id || null 
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

  // Dinamik Birim Listesi
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
  if (props.varsayilanAnlasma && props.varsayilanAnlasma.tip === 'Ürün Bazlı' && !yeniKalem.value.anlasma_id) return true;
  if (secilenAnlasmaTipi.value === 'Ürün Bazlı' && !yeniKalem.value.anlasma_id) return true;
  return false;
});

// Artık RPC kullanıldığı için frontend tarafında filtreleme yapmaya gerek kalmadı,
// filtreleme veritabanı seviyesinde yapılıyor. Ancak UI uyumluluğu için mevcut
// logic yerine doğrudan urunAramaSonuclari'ni kullanacağız.
const filtrelenmisUrunAramaSonuclari = computed(() => urunAramaSonuclari.value);

let debounceTimer;
const urunAra = () => {
  // Eğer ürün bazlı bir anlaşma zorunluluğu varsa ve anlaşma seçilmemişse arama yapma
  if (!props.proformaModu && urunBazliAnlasmaVeAnlasmaYok.value) { 
    urunAramaSonuclari.value = []; 
    return; 
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const aramaMetni = urunAramaMetni.value.trim();
    
    // 2 karakterden azsa arama yapma
    if (aramaMetni.length < 2) { 
      urunAramaSonuclari.value = []; 
      return; 
    }
    
    aramaYapiliyor.value = true;
    let filterIds = null; // Varsayılan olarak tüm ürünlerde ara

    try {
        // Eğer ürün bazlı anlaşma seçiliyse, sadece o anlaşmaya ait ürünleri filtrele
        if (!props.proformaModu && secilenAnlasmaTipi.value === 'Ürün Bazlı' && yeniKalem.value.anlasma_id) {
          const secilenAnlasma = props.anlasmalar.find(a => a.id === yeniKalem.value.anlasma_id);
          if (secilenAnlasma && secilenAnlasma.anlasma_kalemleri) {
            filterIds = secilenAnlasma.anlasma_kalemleri.map(k => k.urun_id);
          }
        }

        // RPC (Remote Procedure Call) Kullanımı
        // urun_ara fonksiyonunu çağırıyoruz. Hata veren .or() sorgusunu kaldırdık.
        const { data, error } = await supabase.rpc('urun_ara', {
            arama_metni: aramaMetni,
            filtre_ids: filterIds, // null veya ID array'i
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

  }, 300); // 300ms debounce
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
  if (urun.ana_birim) { yeniKalem.value.birim = urun.ana_birim; }
  
  // Arama metnini güncelle ve sonuçları gizle
  urunAramaMetni.value = yeniKalem.value.aciklama;
  urunAramaSonuclari.value = [];
  
  stokKontrolEt();
};

const kalemEkle = () => {
  if (!yeniKalem.value.aciklama || yeniKalem.value.miktar <= 0) { alert('Lütfen açıklama ve miktar giriniz.'); return; }
  
  if (!props.proformaModu) {
    if (yeniKalemTipi.value === 'malzeme' && secilenAnlasmaTipi.value === 'Ürün Bazlı' && !yeniKalem.value.anlasma_id) { 
        alert('Anlaşma seçmelisiniz.'); return; 
    }
    if (yeniKalemTipi.value === 'malzeme' && secilenKaynak.value?.tip === 'depo' && yeniKalem.value.miktar > mevcutStok.value) { 
        alert(`Yetersiz stok! Mevcut: ${mevcutStok.value}`); return; 
    }
    if (yeniKalemTipi.value === 'malzeme') {
        if (!secilenKaynak.value) { alert('Malzeme için kaynak seçiniz.'); return; }
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
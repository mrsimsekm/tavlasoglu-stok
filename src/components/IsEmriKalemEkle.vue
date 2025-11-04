<template>
  <div>
    <div class="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg bg-gray-50">
      <div class="col-span-12 md:col-span-2"><label class="label-style">Kalem Tipi</label><select v-model="yeniKalemTipi" class="form-input mt-1"><option value="malzeme">Malzeme</option><option value="hizmet">Hizmet</option></select></div>
      <div class="col-span-12 md:col-span-3">
        <label class="label-style">{{ yeniKalemTipi === 'malzeme' ? 'Malzeme Seç' : 'Hizmet Açıklaması' }}</label>
        <div v-if="yeniKalemTipi === 'malzeme'" class="relative mt-1">
          <input 
            type="text" 
            v-model="urunAramaMetni" 
            @input="urunAra" 
            :placeholder="urunBazliAnlasmaVeAnlasmaYok ? 'Önce bir anlaşma seçiniz' : 'Ürün kodu veya açıklama...'" 
            class="form-input" 
            :disabled="urunBazliAnlasmaVeAnlasmaYok"
            :class="{ 'bg-gray-100 cursor-not-allowed': urunBazliAnlasmaVeAnlasmaYok }"
          />
          <div v-if="urunBazliAnlasmaVeAnlasmaYok" class="mt-1 text-xs text-orange-600">
            * Ürün bazlı anlaşma için önce anlaşma seçmelisiniz
          </div>
          <div v-if="urunAramaSonuclari.length > 0 && !urunBazliAnlasmaVeAnlasmaYok" class="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
            <ul v-if="filtrelenmisUrunAramaSonuclari.length > 0">
              <li v-for="urun in filtrelenmisUrunAramaSonuclari" :key="urun.id" @click="urunSec(urun)" class="p-2 hover:bg-gray-100 cursor-pointer">{{ urun.urun_kodu }} - {{ urun.aciklama }}</li>
            </ul>
            <div v-else class="p-2 text-sm text-gray-500">Bu anlaşmada uygun ürün bulunamadı.</div>
          </div>
        </div>
        <input v-else v-model="yeniKalem.aciklama" type="text" placeholder="Örn: Montaj Bedeli" class="form-input mt-1" />
      </div>
      <div class="col-span-12 md:col-span-2">
        <label class="label-style">Kaynak</label>
        <select v-model="secilenKaynak" class="form-input mt-1" :disabled="yeniKalemTipi === 'hizmet'" :class="{ 'bg-gray-100': yeniKalemTipi === 'hizmet' }">
          <option :value="null">Kaynak Seçin</option>
          <optgroup label="Depolar"><option v-for="depo in props.depolar" :key="depo.id" :value="{ tip: 'depo', id: depo.id, ad: depo.ad }">{{ depo.ad }}</option></optgroup>
          <optgroup label="Tedarikçiler"><option v-for="tedarikci in props.tedarikciler" :key="tedarikci.id" :value="{ tip: 'tedarikci', id: tedarikci.id, ad: tedarikci.ad }">{{ tedarikci.ad }}</option></optgroup>
        </select>
      </div>
      <div class="col-span-12 md:col-span-2">
        <label class="label-style">Anlaşma</label>
        <select v-model="yeniKalem.anlasma_id" class="form-input mt-1" :disabled="yeniKalemTipi === 'hizmet'" :class="{ 'bg-gray-100': yeniKalemTipi === 'hizmet' }">
          <option :value="null">Anlaşma Dışı</option>
          <option v-for="anlasma in props.anlasmalar" :key="anlasma.id" :value="anlasma.id">{{ anlasma.ad }}</option>
        </select>
      </div>
      <div class="col-span-4 md:col-span-1">
        <label class="label-style">Miktar</label>
        <input v-model.number="yeniKalem.miktar" type="number" class="form-input mt-1" :class="{'border-red-500': stokYetersiz}"/>
        <p v-if="stokYetersiz" class="text-xs text-red-500 mt-1">Stok: {{ mevcutStok }}</p>
      </div>
      <div class="col-span-4 md:col-span-1"><label class="label-style">Birim Fiyat</label><input v-model.number="yeniKalem.birim_fiyat" type="number" step="0.01" class="form-input mt-1" /></div>
      <div class="col-span-4 md:col-span-1"><button @click="kalemEkle" type="button" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg mt-6" :disabled="stokYetersiz">Ekle</button></div>
    </div>
    <div class="mt-6">
      <div class="bg-white shadow-md rounded-lg overflow-x-auto">
        <table class="min-w-full leading-normal">
          <thead><tr><th class="th-style">Açıklama</th><th class="th-style">Kaynak</th><th class="th-style">Anlaşma</th><th class="th-style">Miktar</th><th class="th-style">Birim Fiyat</th><th class="th-style text-right">Toplam</th><th class="th-style w-12"></th></tr></thead>
          <tbody>
            <tr v-if="kalemler.length === 0"><td colspan="7" class="text-center py-4 text-gray-500">Henüz malzeme veya hizmet eklenmedi.</td></tr>
            <tr v-for="(kalem, index) in kalemler" :key="index">
              <td class="td-style">{{ kalem.aciklama }}</td><td class="td-style">{{ kalem.kaynak_adi }}</td><td class="td-style">{{ anlasmaAdiBul(kalem.anlasma_id) }}</td><td class="td-style">{{ kalem.miktar }}</td><td class="td-style text-right">{{ kalem.birim_fiyat.toFixed(2) }} TL</td><td class="td-style text-right font-semibold">{{ (kalem.miktar * kalem.birim_fiyat).toFixed(2) }} TL</td>
              <td class="td-style text-center"><button @click="kalemSil(index)" class="text-red-500 hover:text-red-700"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button></td>
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
import { ref, watch, computed } from 'vue';
import { supabase } from '../supabase.js';
const props = defineProps({
  initialKalemler: Array,
  depolar: Array,
  tedarikciler: Array,
  anlasmalar: Array,
  varsayilanAnlasma: Object,
});
const emit = defineEmits(['kalemler-guncellendi']);
const kalemler = ref([...(props.initialKalemler || [])]);
const yeniKalem = ref({});
const secilenKaynak = ref(null);
const yeniKalemTipi = ref('malzeme');
const urunAramaMetni = ref('');
const urunAramaSonuclari = ref([]);
const mevcutStok = ref(Infinity);
const stokYetersiz = computed(() => yeniKalem.value.miktar > mevcutStok.value);
const bosKalemOlustur = () => ({ urun_id: null, aciklama: '', miktar: 1, birim_fiyat: 0, kaynak_depo_id: null, kaynak_tedarikci_id: null, kaynak_adi: '', anlasma_id: props.varsayilanAnlasma?.id || null });
yeniKalem.value = bosKalemOlustur();
const anlasmaAdiBul = (anlasmaId) => {
  if (!anlasmaId || !props.anlasmalar) return 'Anlaşma Dışı';
  const anlasma = props.anlasmalar.find(a => a.id === anlasmaId);
  return anlasma ? anlasma.ad : 'Bilinmeyen';
};
const secilenAnlasmaTipi = computed(() => {
    const anlasmaId = yeniKalem.value.anlasma_id;
    if (!anlasmaId || !props.anlasmalar) return null;
    const secilenAnlasma = props.anlasmalar.find(a => a.id === anlasmaId);
    return secilenAnlasma?.tip || null;
});

// Ürün bazlı anlaşmada anlaşma seçilmeden ürün aramayı engelle
const urunBazliAnlasmaVeAnlasmaYok = computed(() => {
  // Eğer varsayılan anlaşma ürün bazlı ise
  if (props.varsayilanAnlasma && props.varsayilanAnlasma.tip === 'Ürün Bazlı') {
    // Ve kalem seviyesinde anlaşma seçilmemişse (veya anlaşma dışı seçilmişse)
    if (!yeniKalem.value.anlasma_id) {
      return true;
    }
  }
  
  // Eğer kalem seviyesinde anlaşma seçilmişse ve tip Ürün Bazlı ise
  // (Bu durumda zaten anlasma_id var olmalı, ama yine de kontrol edelim)
  if (secilenAnlasmaTipi.value === 'Ürün Bazlı') {
    // Eğer anlaşma ID yoksa (edge case - anlaşma dışı seçilmiş olabilir)
    if (!yeniKalem.value.anlasma_id) {
      return true;
    }
  }
  
  return false;
});

const filtrelenmisUrunAramaSonuclari = computed(() => {
  // Eğer ürün bazlı anlaşma varsa ama anlaşma seçilmemişse boş döndür
  if (urunBazliAnlasmaVeAnlasmaYok.value) {
    return [];
  }
  
  if (secilenAnlasmaTipi.value !== 'Ürün Bazlı') {
    return urunAramaSonuclari.value;
  }
  
  const secilenAnlasma = props.anlasmalar.find(a => a.id === yeniKalem.value.anlasma_id);
  if (!secilenAnlasma || !secilenAnlasma.anlasma_kalemleri) return [];
  
  return urunAramaSonuclari.value.filter(urun => 
    secilenAnlasma.anlasma_kalemleri.some(kalem => kalem.urun_id === urun.id)
  );
});
let debounceTimer;
const urunAra = () => {
  // Ürün bazlı anlaşmada anlaşma seçilmeden arama yapma
  if (urunBazliAnlasmaVeAnlasmaYok.value) {
    urunAramaSonuclari.value = [];
    return;
  }
  
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (urunAramaMetni.value.length < 2) { urunAramaSonuclari.value = []; return; }
    
    // Eğer ürün bazlı anlaşma seçilmişse, direkt anlaşmadan ürünleri çek
    if (secilenAnlasmaTipi.value === 'Ürün Bazlı' && yeniKalem.value.anlasma_id) {
      const secilenAnlasma = props.anlasmalar.find(a => a.id === yeniKalem.value.anlasma_id);
      if (secilenAnlasma && secilenAnlasma.anlasma_kalemleri) {
        // Anlaşmadaki ürün ID'lerini al
        const anlasmaUrunIds = secilenAnlasma.anlasma_kalemleri.map(k => k.urun_id);
        // Arama metnine göre filtrele
        const { data } = await supabase
          .from('urunler')
          .select('id, urun_kodu, aciklama')
          .in('id', anlasmaUrunIds)
          .or(`urun_kodu.ilike.%${urunAramaMetni.value}%,aciklama.ilike.%${urunAramaMetni.value}%`)
          .limit(10);
        urunAramaSonuclari.value = data || [];
        return;
      }
    }
    
    // Normal arama (tutar bazlı veya anlaşma yok)
    const { data } = await supabase.from('urunler').select('id, urun_kodu, aciklama').or(`urun_kodu.ilike.%${urunAramaMetni.value}%,aciklama.ilike.%${urunAramaMetni.value}%`).limit(10);
    urunAramaSonuclari.value = data || [];
  }, 300);
};
const stokKontrolEt = async () => {
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
  // Ürün bazlı anlaşma kontrolü
  if (yeniKalemTipi.value === 'malzeme' && secilenAnlasmaTipi.value === 'Ürün Bazlı') {
    if (!yeniKalem.value.anlasma_id) {
      alert('Ürün bazlı anlaşma seçildiğinde, malzeme eklerken bir anlaşma seçmelisiniz.');
      return;
    }
    
    // Seçilen ürünün bu anlaşmada olup olmadığını kontrol et
    if (yeniKalem.value.urun_id) {
      const secilenAnlasma = props.anlasmalar.find(a => a.id === yeniKalem.value.anlasma_id);
      if (secilenAnlasma && secilenAnlasma.anlasma_kalemleri) {
        const urunAnlasmadaVar = secilenAnlasma.anlasma_kalemleri.some(kalem => kalem.urun_id === yeniKalem.value.urun_id);
        if (!urunAnlasmadaVar) {
          alert('Seçilen ürün bu anlaşmada bulunmamaktadır. Lütfen anlaşmada olan bir ürün seçin.');
          return;
        }
      }
    }
  }
  
  if (yeniKalemTipi.value === 'malzeme' && secilenKaynak.value?.tip === 'depo' && yeniKalem.value.miktar > mevcutStok.value) { alert(`Yetersiz stok! Bu ürün için seçilen depoda sadece ${mevcutStok.value} adet sevkedilebilir stok bulunmaktadır.`); return; }
  if (!yeniKalem.value.aciklama || yeniKalem.value.miktar <= 0) { alert('Lütfen açıklama ve miktar alanlarını doğru girin.'); return; }
  if (yeniKalemTipi.value === 'malzeme') {
    if (!secilenKaynak.value) { alert('Malzeme için bir kaynak seçin.'); return; }
    if(secilenKaynak.value.tip === 'depo') { yeniKalem.value.kaynak_depo_id = secilenKaynak.value.id; yeniKalem.value.kaynak_tedarikci_id = null; yeniKalem.value.kaynak_adi = secilenKaynak.value.ad; } 
    else { yeniKalem.value.kaynak_depo_id = null; yeniKalem.value.kaynak_tedarikci_id = secilenKaynak.value.id; yeniKalem.value.kaynak_adi = secilenKaynak.value.ad; }
  } else { yeniKalem.value.kaynak_depo_id = null; yeniKalem.value.kaynak_tedarikci_id = null; yeniKalem.value.anlasma_id = null; yeniKalem.value.kaynak_adi = 'Hizmet'; }
  kalemler.value.push({ ...yeniKalem.value });
  yeniKalem.value = bosKalemOlustur();
  urunAramaMetni.value = '';
  secilenKaynak.value = null;
  mevcutStok.value = Infinity;
};
const kalemSil = (index) => { kalemler.value.splice(index, 1); };
watch(() => props.varsayilanAnlasma, (newAnlasma) => { 
  yeniKalem.value.anlasma_id = newAnlasma?.id || null; 
  // Eğer varsayılan anlaşma ürün bazlı ise ve ürün seçilmişse, arama sonuçlarını temizle
  if (newAnlasma && newAnlasma.tip === 'Ürün Bazlı' && yeniKalem.value.urun_id) {
    const secilenAnlasma = props.anlasmalar.find(a => a.id === newAnlasma.id);
    if (secilenAnlasma && secilenAnlasma.anlasma_kalemleri) {
      const urunAnlasmadaVar = secilenAnlasma.anlasma_kalemleri.some(kalem => kalem.urun_id === yeniKalem.value.urun_id);
      if (!urunAnlasmadaVar) {
        // Ürün bu anlaşmada yoksa, seçimi temizle
        yeniKalem.value.urun_id = null;
        yeniKalem.value.aciklama = '';
        urunAramaMetni.value = '';
        urunAramaSonuclari.value = [];
      }
    }
  }
});
watch(yeniKalemTipi, (newValue) => {
  yeniKalem.value = bosKalemOlustur();
  urunAramaMetni.value = '';
  urunAramaSonuclari.value = [];
  mevcutStok.value = Infinity;
  if (newValue === 'hizmet') { secilenKaynak.value = null; yeniKalem.value.anlasma_id = null; }
});
watch(() => yeniKalem.value.anlasma_id, (newAnlasmaId) => {
  // Anlaşma değiştiğinde, eğer ürün bazlı anlaşma ise ve seçili ürün bu anlaşmada yoksa temizle
  if (newAnlasmaId && yeniKalem.value.urun_id) {
    const secilenAnlasma = props.anlasmalar.find(a => a.id === newAnlasmaId);
    if (secilenAnlasma && secilenAnlasma.tip === 'Ürün Bazlı' && secilenAnlasma.anlasma_kalemleri) {
      const urunAnlasmadaVar = secilenAnlasma.anlasma_kalemleri.some(kalem => kalem.urun_id === yeniKalem.value.urun_id);
      if (!urunAnlasmadaVar) {
        // Ürün bu anlaşmada yoksa, seçimi temizle
        yeniKalem.value.urun_id = null;
        yeniKalem.value.aciklama = '';
        urunAramaMetni.value = '';
        urunAramaSonuclari.value = [];
      }
    }
  }
});
watch(kalemler, (yeniListe) => { emit('kalemler-guncellendi', yeniListe); }, { deep: true });
watch(secilenKaynak, () => { stokKontrolEt(); });
</script>
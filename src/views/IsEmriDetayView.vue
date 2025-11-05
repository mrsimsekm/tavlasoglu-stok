<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">İş Emri Detayı <span v-if="isEditing" class="text-yellow-500 text-xl">(Düzenleme Modu)</span></h1>
      <div class="flex items-center space-x-4">
        <div v-if="isEmri && isEmri.durum === 'Açık'">
          <button v-if="!isEditing" @click="isEditing = true" class="btn-secondary bg-yellow-500 hover:bg-yellow-600 text-white">Düzenle</button>
          <div v-else>
            <button @click="iptalEt" class="btn-secondary">İptal</button>
            <button @click="guncelle" class="btn-primary ml-2">Değişiklikleri Kaydet</button>
          </div>
        </div>
        
        <button 
          v-if="isEmri && isEmri.durum === 'Açık'" 
          @click="kapanisModaliniAc"
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          İş Emrini Kapat
        </button>
        
        <RouterLink to="/app/is-emirleri" class="text-gray-600 hover:text-gray-800">&larr; Geri Dön</RouterLink>
      </div>
    </div>
    
    <div v-if="loading" class="text-center p-6">Yükleniyor...</div>
    <div v-else-if="error" class="bg-red-100 p-4 rounded-md text-red-700">Hata: {{ error }}</div>
    <div v-else-if="isEmri" class="space-y-6">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Genel Bilgiler</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p class="label-style">Müşteri</p>
            <p class="font-semibold">{{ isEmri.musteriler.unvan }}</p>
          </div>
          <div>
            <p class="label-style">Sipariş Tarihi</p>
            <p class="font-semibold">{{ new Date(isEmri.siparis_tarihi).toLocaleDateString('tr-TR') }}</p>
          </div>
          <div>
            <p class="label-style">Durum</p>
            <p class="font-semibold px-2 py-1 inline-block rounded" :class="getDurumRenk(isEmri.durum)">
              {{ isEmri.durum }}
            </p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-700">Kalemler</h2>
        </div>
        <IsEmriKalemEkle 
          v-if="isEditing" 
          :depolar="depolar" 
          :tedarikciler="tedarikciler" 
          :anlasmalar="anlasmalar" 
          :initialKalemler="isEmri.is_emri_kalemleri" 
          @kalemler-guncellendi="handleKalemlerGuncellendi"
        />
        <div v-else class="overflow-x-auto">
          <table class="min-w-full leading-normal">
            <thead>
              <tr>
                <th class="th-style">Açıklama</th>
                <th class="th-style">Kaynak</th>
                <th class="th-style">Anlaşma</th>
                <th class="th-style">Miktar</th>
                <th class="th-style">Birim Fiyat</th>
                <th class="th-style text-right">Toplam</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!isEmri.is_emri_kalemleri || isEmri.is_emri_kalemleri.length === 0">
                <td colspan="6" class="text-center py-4">Bu iş emrine ait kalem bulunamadı.</td>
              </tr>
              <tr v-for="kalem in isEmri.is_emri_kalemleri" :key="kalem.id">
                <td class="td-style">{{ kalem.aciklama }}</td>
                <td class="td-style">{{ kalem.depolar ? kalem.depolar.ad : (kalem.tedarikciler ? kalem.tedarikciler.ad : 'Hizmet') }}</td>
                <td class="td-style">{{ kalem.anlasmalar ? kalem.anlasmalar.ad : 'Anlaşma Dışı' }}</td>
                <td class="td-style">{{ kalem.miktar }}</td>
                <td class="td-style text-right">{{ kalem.birim_fiyat.toFixed(2) }} TL</td>
                <td class="td-style text-right font-semibold">{{ (kalem.miktar * kalem.birim_fiyat).toFixed(2) }} TL</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4 text-gray-700">Finansal Özet</h2>
        <div class="flex justify-end text-xl space-x-8 font-semibold">
          <span>Genel Toplam: <span class="text-blue-600">{{ toplamTutar.toFixed(2) }} TL</span></span>
          <span>Ödenen: <span class="text-green-600">{{ (isEmri.odenen_tutar || 0).toFixed(2) }} TL</span></span>
          <span>Kalan Bakiye: <span class="text-red-600">{{ (toplamTutar - (isEmri.odenen_tutar || 0)).toFixed(2) }} TL</span></span>
        </div>
      </div>

      <!-- YENİ: NOTLAR BÖLÜMÜ -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-700">Notlar</h2>
          <button 
            v-if="!notDuzenleniyor" 
            @click="notDuzenlemeyeBasla" 
            class="text-blue-600 hover:text-blue-800 text-sm font-semibold"
          >
            {{ isEmri.notlar ? 'Düzenle' : '+ Not Ekle' }}
          </button>
        </div>
        
        <div v-if="!notDuzenleniyor" class="min-h-[100px]">
          <p v-if="isEmri.notlar" class="text-gray-700 whitespace-pre-wrap">{{ isEmri.notlar }}</p>
          <p v-else class="text-gray-400 italic">Henüz not eklenmemiş.</p>
        </div>
        
        <div v-else>
          <textarea 
            v-model="notIcerigi"
            rows="6"
            class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="İş emri ile ilgili notlarınızı buraya yazabilirsiniz..."
          ></textarea>
          <div class="flex justify-end mt-3 space-x-2">
            <button 
              @click="notDuzenlemeIptal" 
              class="btn-secondary"
            >
              İptal
            </button>
            <button 
              @click="notuKaydet" 
              class="btn-primary"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>

    <IsEmriKapanisModal 
      :show="kapanisModalGoster"
      :is-emri="isEmri"
      @close="kapanisModalGoster = false"
      @success="kapanisBasarili"
    />
  </div>
</template>

<style>
.label-style { @apply text-sm text-gray-500; }
.form-input { @apply mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
.th-style { @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider; }
.td-style { @apply px-5 py-5 border-b border-gray-200 bg-white text-sm; }
.btn-primary { @apply bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded; }
.btn-secondary { @apply bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded; }
</style>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, RouterLink, useRouter } from 'vue-router';
import { supabase } from '../supabase.js';
import IsEmriKalemEkle from '../components/IsEmriKalemEkle.vue';
import IsEmriKapanisModal from '../components/IsEmriKapanisModal.vue';

const route = useRoute();
const router = useRouter();
const isEmriId = route.params.id;
const isEmri = ref(null);
const loading = ref(true);
const error = ref(null);
const isEditing = ref(false);
const depolar = ref([]);
const tedarikciler = ref([]);
const anlasmalar = ref([]);
const guncelKalemler = ref([]);
const kapanisModalGoster = ref(false);

// YENİ: Notlar için değişkenler
const notDuzenleniyor = ref(false);
const notIcerigi = ref('');

const toplamTutar = computed(() => {
  const kalemListesi = isEditing.value ? guncelKalemler.value : (isEmri.value?.is_emri_kalemleri || []);
  return kalemListesi.reduce((total, kalem) => total + (kalem.miktar * kalem.birim_fiyat), 0);
});

const handleKalemlerGuncellendi = (yeniListe) => { 
  guncelKalemler.value = yeniListe; 
};

const getGerekliVeriler = async () => {
  try {
    loading.value = true; 
    error.value = null;
    const [isEmriRes, depolarRes, tedarikcilerRes, anlasmalarRes] = await Promise.all([
      supabase.from('is_emirleri').select(`
        *, 
        musteriler(*), 
        anlasmalar(*), 
        is_emri_kalemleri ( 
          *, 
          anlasmalar(*), 
          depolar:kaynak_depo_id ( ad ), 
          tedarikciler:kaynak_tedarikci_id ( ad ) 
        )
      `).eq('id', isEmriId).single(),
      supabase.from('depolar').select('*'),
      supabase.from('tedarikciler').select('*'),
      supabase.from('anlasmalar').select('*, anlasma_kalemleri(urun_id, taahhut_edilen_miktar)').eq('aktif_mi', true)
    ]);
    
    if (isEmriRes.error) throw isEmriRes.error;

    const kalemler = isEmriRes.data.is_emri_kalemleri || [];
    const islenmisKalemler = kalemler.map(kalem => {
      const kaynakAdi = kalem.depolar ? kalem.depolar.ad : (kalem.tedarikciler ? kalem.tedarikciler.ad : 'Hizmet');
      return { ...kalem, kaynak_adi: kaynakAdi };
    });

    isEmri.value = { ...isEmriRes.data, is_emri_kalemleri: islenmisKalemler };
    guncelKalemler.value = [...islenmisKalemler];
    depolar.value = depolarRes.data || [];
    tedarikciler.value = tedarikcilerRes.data || [];
    anlasmalar.value = anlasmalarRes.data || [];
  } catch (err) { 
    error.value = err.message; 
  } finally { 
    loading.value = false; 
  }
};

const guncelle = async () => {
  if (!isEmri.value) return;
  const guncellenecekIsEmri = { toplam_tutar: toplamTutar.value };
  const { error: isEmriError } = await supabase.from('is_emirleri').update(guncellenecekIsEmri).eq('id', isEmriId);
  if (isEmriError) { 
    alert('Hata: ' + isEmriError.message); 
    return; 
  }
  const { error: deleteError } = await supabase.from('is_emri_kalemleri').delete().eq('is_emri_id', isEmriId);
  if (deleteError) { 
    alert('Hata: ' + deleteError.message); 
    return; 
  }
  if (guncelKalemler.value.length > 0) {
    const kalemlerToInsert = guncelKalemler.value.map(k => {
      const { id, created_at, depolar, tedarikciler, anlasmalar, kaynak_adi, ...rest } = k;
      rest.is_emri_id = isEmriId;
      return rest;
    });
    const { error: insertError } = await supabase.from('is_emri_kalemleri').insert(kalemlerToInsert);
    if (insertError) { 
      alert('Hata: ' + insertError.message); 
      return; 
    }
  }
  alert('İş emri başarıyla güncellendi!');
  isEditing.value = false;
  await getGerekliVeriler();
};

const iptalEt = async () => {
  isEditing.value = false;
  await getGerekliVeriler();
};

const kapanisModaliniAc = () => {
  if (isEmri.value.durum !== 'Açık') {
    alert('Sadece açık durumundaki iş emirleri kapatılabilir.');
    return;
  }
  kapanisModalGoster.value = true;
};

const kapanisBasarili = async () => {
  await getGerekliVeriler();
  kapanisModalGoster.value = false;
};

const getDurumRenk = (durum) => {
  const renkler = {
    'Açık': 'bg-green-100 text-green-800',
    'Kapalı': 'bg-gray-200 text-gray-700',
    'Tamamlandı': 'bg-blue-100 text-blue-800',
    'İptal': 'bg-red-100 text-red-800'
  };
  return renkler[durum] || 'bg-gray-200 text-gray-700';
};

// YENİ: Not düzenleme fonksiyonları
const notDuzenlemeyeBasla = () => {
  notIcerigi.value = isEmri.value.notlar || '';
  notDuzenleniyor.value = true;
};

const notDuzenlemeIptal = () => {
  notDuzenleniyor.value = false;
  notIcerigi.value = '';
};

const notuKaydet = async () => {
  if (!isEmri.value) return;
  
  try {
    const { error } = await supabase
      .from('is_emirleri')
      .update({ notlar: notIcerigi.value || null })
      .eq('id', isEmriId);
    
    if (error) throw error;
    
    alert('Not başarıyla kaydedildi!');
    notDuzenleniyor.value = false;
    await getGerekliVeriler();
  } catch (err) {
    console.error('Not kaydedilirken hata:', err.message);
    alert('Hata: ' + err.message);
  }
};

onMounted(() => {
  getGerekliVeriler();
});
</script>
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">İş Emri Detayı <span v-if="isEditing" class="text-yellow-500 text-xl">(Düzenleme Modu)</span></h1>
      <div class="flex items-center space-x-4">
        <div v-if="isEmri && isEmri.durum === 'Açık'"><button v-if="!isEditing" @click="isEditing = true" class="btn-secondary bg-yellow-500 hover:bg-yellow-600 text-white">Düzenle</button><div v-else><button @click="iptalEt" class="btn-secondary">İptal</button><button @click="guncelle" class="btn-primary ml-2">Değişiklikleri Kaydet</button></div></div>
        <button v-if="isEmri && isEmri.durum === 'Açık'" @click="isEmriKapatModalGoster = true" class="btn-primary bg-red-500 hover:bg-red-600">İş Emrini Kapat</button>
        <RouterLink to="/app/is-emirleri" class="text-gray-600 hover:text-gray-800">&larr; Geri Dön</RouterLink>
      </div>
    </div>
    <div v-if="loading" class="text-center p-6">Yükleniyor...</div>
    <div v-else-if="error" class="bg-red-100 p-4 rounded-md text-red-700">Hata: {{ error }}</div>
    <div v-else-if="isEmri" class="space-y-6">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Genel Bilgiler</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><p class="label-style">Müşteri</p><p class="font-semibold">{{ isEmri.musteriler.unvan }}</p></div>
          <div><p class="label-style">Sipariş Tarihi</p><p class="font-semibold">{{ new Date(isEmri.siparis_tarihi).toLocaleDateString('tr-TR') }}</p></div>
          <div><p class="label-style">Durum</p><p class="font-semibold px-2 py-1 inline-block rounded" :class="isEmri.durum === 'Açık' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'">{{ isEmri.durum }}</p></div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4"><h2 class="text-xl font-semibold text-gray-700">Kalemler</h2></div>
        <IsEmriKalemEkle v-if="isEditing" :depolar="depolar" :tedarikciler="tedarikciler" :anlasmalar="anlasmalar" :initialKalemler="isEmri.is_emri_kalemleri" @kalemler-guncellendi="handleKalemlerGuncellendi"/>
        <div v-else class="overflow-x-auto">
           <table class="min-w-full leading-normal">
            <thead><tr><th class="th-style">Açıklama</th><th class="th-style">Kaynak</th><th class="th-style">Anlaşma</th><th class="th-style">Miktar</th><th class="th-style">Birim Fiyat</th><th class="th-style text-right">Toplam</th></tr></thead>
            <tbody>
              <tr v-if="!isEmri.is_emri_kalemleri || isEmri.is_emri_kalemleri.length === 0"><td colspan="6" class="text-center py-4">Bu iş emrine ait kalem bulunamadı.</td></tr>
              <tr v-for="kalem in isEmri.is_emri_kalemleri" :key="kalem.id">
                <td class="td-style">{{ kalem.aciklama }}</td><td class="td-style">{{ kalem.depolar ? kalem.depolar.ad : (kalem.tedarikciler ? kalem.tedarikciler.ad : 'Hizmet') }}</td><td class="td-style">{{ kalem.anlasmalar ? kalem.anlasmalar.ad : 'Anlaşma Dışı' }}</td><td class="td-style">{{ kalem.miktar }}</td><td class="td-style text-right">{{ kalem.birim_fiyat.toFixed(2) }} TL</td><td class="td-style text-right font-semibold">{{ (kalem.miktar * kalem.birim_fiyat).toFixed(2) }} TL</td>
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
    </div>
    <BaseModal :show="isEmriKapatModalGoster" @close="isEmriKapatModalGoster = false">
      <template #header>İş Emrini Kapat</template>
      <template #body>
        <div v-if="isEmri" class="space-y-4">
          <p>Bu iş emrini kapatmak üzeresiniz. Lütfen aşağıdaki seçeneklerden birini seçin:</p>
          <div class="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700"><p><strong>Kalan Bakiye:</strong> {{ (toplamTutar - (isEmri.odenen_tutar || 0)).toFixed(2) }} TL</p></div>
          <div class="space-y-2 mt-4">
            <label class="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"><input type="radio" v-model="kapatmaSecenegi" value="tahsil_edildi" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"><span class="ml-3 text-sm font-medium">Tamamı Tahsil Edildi</span></label>
            <label class="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"><input type="radio" v-model="kapatmaSecenegi" value="alacak_kaydet" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"><span class="ml-3 text-sm font-medium">Kalanı Cari Hesaba Alacak Olarak Kaydet</span></label>
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="isEmriKapatModalGoster = false" class="btn-secondary">İptal</button>
        <button @click="isEmriniKapat" class="btn-primary bg-red-500 hover:bg-red-600 ml-2">Onayla ve Kapat</button>
      </template>
    </BaseModal>
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
import BaseModal from '../components/BaseModal.vue';

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
const isEmriKapatModalGoster = ref(false);
const kapatmaSecenegi = ref('tahsil_edildi');

const toplamTutar = computed(() => {
  const kalemListesi = isEditing.value ? guncelKalemler.value : (isEmri.value?.is_emri_kalemleri || []);
  return kalemListesi.reduce((total, kalem) => total + (kalem.miktar * kalem.birim_fiyat), 0);
});

const handleKalemlerGuncellendi = (yeniListe) => { guncelKalemler.value = yeniListe; };

const getGerekliVeriler = async () => {
  try {
    loading.value = true; error.value = null;
    const [isEmriRes, depolarRes, tedarikcilerRes, anlasmalarRes] = await Promise.all([
      supabase.from('is_emirleri').select(`*, musteriler(*), anlasmalar(*), is_emri_kalemleri ( *, anlasmalar(*), depolar:kaynak_depo_id ( ad ), tedarikciler:kaynak_tedarikci_id ( ad ) )`).eq('id', isEmriId).single(),
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
  } catch (err) { error.value = err.message; } 
  finally { loading.value = false; }
};

const guncelle = async () => {
  if (!isEmri.value) return;
  const guncellenecekIsEmri = { toplam_tutar: toplamTutar.value };
  const { error: isEmriError } = await supabase.from('is_emirleri').update(guncellenecekIsEmri).eq('id', isEmriId);
  if (isEmriError) { alert('Hata: ' + isEmriError.message); return; }
  const { error: deleteError } = await supabase.from('is_emri_kalemleri').delete().eq('is_emri_id', isEmriId);
  if (deleteError) { alert('Hata: ' + deleteError.message); return; }
  if (guncelKalemler.value.length > 0) {
    const kalemlerToInsert = guncelKalemler.value.map(k => {
      const { id, created_at, depolar, tedarikciler, anlasmalar, kaynak_adi, ...rest } = k;
      rest.is_emri_id = isEmriId;
      return rest;
    });
    const { error: insertError } = await supabase.from('is_emri_kalemleri').insert(kalemlerToInsert);
    if (insertError) { alert('Hata: ' + insertError.message); return; }
  }
  alert('İş emri başarıyla güncellendi!');
  isEditing.value = false;
  await getGerekliVeriler();
};

const iptalEt = async () => {
  isEditing.value = false;
  await getGerekliVeriler();
};

const isEmriniKapat = async () => {
  if (!isEmri.value) return;
  let guncellenecekVeri = { durum: 'Kapalı' };
  if (kapatmaSecenegi.value === 'tahsil_edildi') {
    guncellenecekVeri.odenen_tutar = toplamTutar.value;
  }
  try {
    const { error } = await supabase.from('is_emirleri').update(guncellenecekVeri).eq('id', isEmriId);
    if (error) throw error;
    alert('İş emri başarıyla kapatıldı.');
    isEmriKapatModalGoster.value = false;
    await getGerekliVeriler();
  } catch (err) {
    alert('Hata: ' + err.message);
  }
};

onMounted(() => {
  getGerekliVeriler();
});
</script>
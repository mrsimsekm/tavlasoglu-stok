<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">İş Emri Detayı <span v-if="isEditing" class="text-yellow-500 text-xl">(Düzenleme Modu)</span></h1>
        <p v-if="isEmri" class="text-sm text-gray-500 mt-1">
          İş Emri No: <span class="font-mono font-semibold text-indigo-600">{{ isEmri.numara || 'N/A' }}</span>
        </p>
      </div>
      <div class="flex items-center space-x-4">
            <button
              v-if="isEmri && !isEditing"
              @click="yazdirModaliniAc"
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clip-rule="evenodd" />
              </svg>
              Yazdır
            </button>
        <div v-if="isEmri && isEmri.durum === 'Açık'">
          <button v-if="!isEditing" @click="isEditing = true" class="btn-secondary bg-yellow-500 hover:bg-yellow-600 text-white">Düzenle</button>
          <div v-else>
            <button @click="iptalEt" class="btn-secondary">İptal</button>
            <button @click="guncelle" :disabled="guncellemeYapiliyor" class="btn-primary ml-2">
              {{ guncellemeYapiliyor ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
            </button>
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
        <div v-if="!isEditing" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><p class="label-style">Müşteri</p><p class="font-semibold">{{ isEmri.musteriler.unvan }}</p></div>
          <div>
            <p class="label-style">İş Emri Tipi</p>
            <p class="font-semibold px-2 py-1 inline-block rounded text-xs uppercase" :class="getTipRenk(isEmri.is_emri_tipi)">
              {{ isEmri.is_emri_tipi }}
            </p>
          </div>
          <div><p class="label-style">Sipariş Tarihi</p><p class="font-semibold">{{ new Date(isEmri.siparis_tarihi).toLocaleDateString('tr-TR') }}</p></div>
          <div><p class="label-style">Durum</p><p class="font-semibold px-2 py-1 inline-block rounded" :class="getDurumRenk(isEmri.durum)">{{ isEmri.durum }}</p></div>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p class="label-style">Müşteri</p>
            <p class="font-semibold p-2 border rounded-md bg-gray-100">{{ isEmri.musteriler.unvan }}</p>
          </div>
          <div>
            <label class="label-style">İş Emri Tipi (*)</label>
            <select v-model="duzenlemeFormu.is_emri_tipi" class="form-input">
              <option value="SİPARİŞ">Sipariş</option>
              <option value="ARIZA">Arıza / Servis</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">İş Emri Detayları</h2>
        <div v-if="!isEditing" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><p class="label-style">Satışçı</p><p class="font-semibold">{{ isEmri.satiscilar?.ad_soyad || '-' }}</p></div>
          <div><p class="label-style">Fatura No</p><p class="font-semibold">{{ isEmri.fatura_no || '-' }}</p></div>
          <div><p class="label-style">Maliyet</p><p class="font-semibold text-orange-600">{{ formatParaBirimi(isEmri.maliyet || 0) }}</p></div>
          <div><p class="label-style">İş Durumu</p><p class="font-semibold" :class="isEmri.is_tamamlandi ? 'text-green-600' : 'text-gray-400'">{{ isEmri.is_tamamlandi ? '✓ Tamamlandı' : '○ Devam Ediyor' }}</p></div>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label class="label-style">Satışçı</label><select v-model="duzenlemeFormu.satisci_id" class="form-input"><option :value="null">Satışçı Seçin</option><option v-for="satisci in satiscilar" :key="satisci.id" :value="satisci.id">{{ satisci.ad_soyad }}</option></select></div>
          <div><label class="label-style">Fatura No</label><input v-model="duzenlemeFormu.fatura_no" type="text" class="form-input" placeholder="Fatura numarası"></div>
          <div><label class="label-style">Maliyet</label><input v-model.number="duzenlemeFormu.maliyet" type="number" step="0.01" class="form-input" placeholder="0.00"></div>
          <div class="flex items-center"><label class="flex items-center cursor-pointer"><input type="checkbox" v-model="duzenlemeFormu.is_tamamlandi" class="h-5 w-5 text-green-600 rounded"><span class="ml-3 text-sm font-medium text-gray-700">İş Tamamlandı</span></label></div>
        </div>
      </div>
      
      <div v-if="isEmri.sevk_adresi || isEditing" class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Sevk Adresi</h2>
        <p v-if="!isEditing && isEmri.sevk_adresi" class="text-gray-700 whitespace-pre-wrap">{{ isEmri.sevk_adresi }}</p>
        <p v-if="!isEditing && !isEmri.sevk_adresi" class="text-gray-400 italic">Sevk adresi belirtilmemiş.</p>
        <div v-else>
          <textarea v-model="duzenlemeFormu.sevk_adresi" rows="3" class="form-input" placeholder="Teslimat adresi..."></textarea>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4"><h2 class="text-xl font-semibold text-gray-700">Kalemler</h2></div>
        <IsEmriKalemEkle v-if="isEditing" :depolar="depolar" :tedarikciler="tedarikciler" :anlasmalar="anlasmalar" :initialKalemler="guncelKalemler" :kaydedilmis-is-emri="true" @kalemler-guncellendi="handleKalemlerGuncellendi"/>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full leading-normal">
            <thead><tr><th class="th-style">Açıklama</th><th class="th-style">Kaynak</th><th class="th-style">Anlaşma</th><th class="th-style">Miktar</th><th class="th-style" style="text-align: right;">Birim Fiyat</th><th class="th-style" style="text-align: right;">Toplam</th></tr></thead>
            <tbody>
              <tr v-if="!isEmri.is_emri_kalemleri || isEmri.is_emri_kalemleri.length === 0"><td colspan="6" class="text-center py-4">Bu iş emrine ait kalem bulunamadı.</td></tr>
              <tr v-for="kalem in isEmri.is_emri_kalemleri" :key="kalem.id"><td class="td-style">{{ kalem.aciklama }}</td><td class="td-style">{{ kalem.depolar ? kalem.depolar.ad : (kalem.tedarikciler ? kalem.tedarikciler.ad : 'Hizmet') }}</td><td class="td-style">{{ kalem.anlasmalar ? kalem.anlasmalar.ad : 'Anlaşma Dışı' }}</td><td class="td-style">{{ kalem.miktar }}</td><td class="td-style text-right">{{ formatParaBirimi(kalem.birim_fiyat) }}</td><td class="td-style text-right font-semibold">{{ formatParaBirimi(kalem.miktar * kalem.birim_fiyat) }}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4"><h2 class="text-xl font-semibold text-gray-700">Notlar</h2><button v-if="!notDuzenleniyor" @click="notDuzenlemeyeBasla" class="text-blue-600 hover:text-blue-800 text-sm font-semibold">{{ isEmri.notlar ? 'Düzenle' : '+ Not Ekle' }}</button></div>
        <div v-if="!notDuzenleniyor" class="min-h-[100px]"><p v-if="isEmri.notlar" class="text-gray-700 whitespace-pre-wrap">{{ isEmri.notlar }}</p><p v-else class="text-gray-400 italic">Henüz not eklenmemiş.</p></div>
        <div v-else>
          <textarea v-model="notIcerigi" rows="6" class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="İş emri ile ilgili notlarınızı buraya yazabilirsiniz..."></textarea>
          <div class="flex justify-end mt-3 space-x-2"><button @click="notDuzenlemeIptal" class="btn-secondary">İptal</button><button @click="notuKaydet" :disabled="notKayitYapiliyor" class="btn-primary">{{ notKayitYapiliyor ? 'Kaydediliyor...' : 'Kaydet' }}</button></div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-end items-center text-xl space-x-8 font-semibold">
          <span>Genel Toplam: <span class="text-blue-600">{{ formatParaBirimi(toplamTutar) }}</span></span>
          <span>Ödenen: <span class="text-green-600">{{ formatParaBirimi(isEmri.odenen_tutar) }}</span></span>
          <span>Kalan Bakiye: <span class="text-red-600">{{ formatParaBirimi(kalanBakiye) }}</span></span>
          <button v-if="isEmri.durum === 'Açık' && kalanBakiye > 0 && (userStore.isMuhasebeci || userStore.isYonetici)" @click="tahsilatEkleModaliniAc" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-sm">+ Tahsilat Ekle</button>
        </div>
      </div>
    </div>

    <IsEmriKapanisModal :show="kapanisModalGoster" :is-emri="isEmri" @close="kapanisModalGoster = false" @success="kapanisBasarili"/>
    
    <BaseModal :show="yazdirModalGoster" @close="yazdirModalGoster = false">
      <template #header>İş Emri Yazdır</template>
      <template #body><div class="space-y-4"><p class="text-gray-700">İş emri yazdırma seçenekleri:</p><div class="border rounded-lg p-4 bg-gray-50"><label class="flex items-center cursor-pointer"><input type="checkbox" v-model="yazdirFiyatGoster" class="h-5 w-5 text-indigo-600 rounded border-gray-300"><span class="ml-3 text-sm font-medium text-gray-700">Fiyat bilgilerini dahil et</span></label><p class="text-xs text-gray-500 mt-2 ml-8">İşaretlenirse birim fiyat ve toplam tutarlar yazdırılan belgede görünür</p></div><div class="bg-blue-50 p-3 rounded-lg"><p class="text-sm text-blue-800"><strong>İş Emri No:</strong> {{ isEmri?.numara || 'N/A' }}</p><p class="text-sm text-blue-800"><strong>Müşteri:</strong> {{ isEmri?.musteriler?.unvan || '-' }}</p></div></div></template>
      <template #footer><button @click="yazdirModalGoster = false" class="btn-secondary">İptal</button><button @click="isEmriYazdir" class="btn-primary ml-2">Yazdır</button></template>
    </BaseModal> 
    
    <BaseModal :show="tahsilatEkleModalGoster" @close="tahsilatEkleModalGoster = false">
      <template #header>Tahsilat Ekle</template>
      <template #body><div class="space-y-4"><div class="bg-gray-50 p-4 rounded-lg"><p class="text-sm text-gray-600">Kalan Tutar</p><p class="text-2xl font-bold text-red-600">{{ formatParaBirimi(kalanBakiye) }}</p></div><div><label class="label-style">Tahsilat Tutarı (*)</label><input v-model.number="tahsilatEkleForm.tutar" type="number" step="0.01" class="form-input"></div><div><label class="label-style">Ödeme Yöntemi (*)</label><select v-model="tahsilatEkleForm.yontem" class="form-input"><option value="">Seçiniz</option><option value="Nakit">Nakit</option><option value="Kredi Kartı">Kredi Kartı</option><option value="Havale/EFT">Havale/EFT</option><option value="Çek">Çek</option><option value="Diğer">Diğer</option></select></div><div><label class="label-style">Notlar</label><textarea v-model="tahsilatEkleForm.notlar" rows="3" class="form-input"></textarea></div></div></template>
      <template #footer><button @click="tahsilatEkleModalGoster = false" class="btn-secondary">İptal</button><button @click="tahsilatEkle" class="btn-primary ml-2">Tahsilat Ekle</button></template>
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
import IsEmriKapanisModal from '../components/IsEmriKapanisModal.vue';
import BaseModal from '../components/BaseModal.vue';
import { useLoading } from '../composables/useLoading.js';
import { useUserStore } from '../stores/userStore.js';

const { isLoading: guncellemeYapiliyor, withLoading: guncelleWithLoading } = useLoading();
const { isLoading: notKayitYapiliyor, withLoading: notKaydetWithLoading } = useLoading();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const isEmriId = route.params.id;
const isEmri = ref(null);
const loading = ref(true);
const error = ref(null);
const isEditing = ref(false);
const depolar = ref([]);
const tedarikciler = ref([]);
const anlasmalar = ref([]);
const satiscilar = ref([]);
const guncelKalemler = ref([]);
const kapanisModalGoster = ref(false);
const notDuzenleniyor = ref(false);
const notIcerigi = ref('');
const yazdirModalGoster = ref(false);
const yazdirFiyatGoster = ref(true);
const tahsilatEkleModalGoster = ref(false);
const tahsilatEkleForm = ref({
  tutar: 0,
  yontem: '',
  notlar: ''
});

const duzenlemeFormu = ref({
  satisci_id: null,
  fatura_no: '',
  maliyet: 0,
  is_tamamlandi: false,
  is_emri_tipi: 'SİPARİŞ',
  sevk_adresi: ''
});

const getTipRenk = (tip) => {
  const renkler = { 'SİPARİŞ': 'bg-blue-100 text-blue-800', 'ARIZA': 'bg-yellow-100 text-yellow-800' };
  return renkler[tip] || 'bg-gray-200 text-gray-700';
};

const kalanBakiye = computed(() => {
  if (!isEmri.value) return 0;
  return (toplamTutar.value - (isEmri.value.odenen_tutar || 0));
});

const tahsilatEkleModaliniAc = () => {
  const kalan = kalanBakiye.value;
  tahsilatEkleForm.value = {
    tutar: kalan > 0 ? kalan : 0,
    yontem: '',
    notlar: ''
  };
  tahsilatEkleModalGoster.value = true;
};

const tahsilatEkle = async () => {
  if (!tahsilatEkleForm.value.tutar || tahsilatEkleForm.value.tutar <= 0) {
    alert('Lütfen geçerli bir tutar giriniz.');
    return;
  }
  if (!tahsilatEkleForm.value.yontem) {
    alert('Lütfen ödeme yöntemi seçiniz.');
    return;
  }
  if (tahsilatEkleForm.value.tutar > kalanBakiye.value) {
    alert(`Tahsilat tutarı kalan tutardan (${formatParaBirimi(kalanBakiye.value)}) fazla olamaz!`);
    return;
  }

  try {
    const { error: odemeError } = await supabase.from('odemeler').insert([{
      is_emri_id: isEmri.value.id,
      tutar: tahsilatEkleForm.value.tutar,
      yontem: tahsilatEkleForm.value.yontem,
      notlar: tahsilatEkleForm.value.notlar || null,
      islem_yapan_kullanici_id: userStore.user?.id || null
    }]);
    if (odemeError) throw odemeError;

    const yeniOdenenTutar = parseFloat(isEmri.value.odenen_tutar || 0) + tahsilatEkleForm.value.tutar;
    const { error: guncellemeError } = await supabase.from('is_emirleri').update({ odenen_tutar: yeniOdenenTutar }).eq('id', isEmriId);
    if (guncellemeError) throw guncellemeError;

    alert('Tahsilat başarıyla eklendi!');
    tahsilatEkleModalGoster.value = false;
    await getGerekliVeriler();
  } catch (err) {
    console.error('Tahsilat ekleme hatası:', err);
    alert('Hata: ' + err.message);
  }
};

const yazdirModaliniAc = () => {
  yazdirFiyatGoster.value = false;
  yazdirModalGoster.value = true;
};

const isEmriYazdir = () => {
  const yazdirIcerik = olusturYazdirIcerik();
  const yazdirPencere = window.open('', '_blank', 'width=800,height=600');
  yazdirPencere.document.write(yazdirIcerik);
  yazdirPencere.document.close();
  yazdirPencere.focus();
  setTimeout(() => {
    yazdirPencere.print();
    yazdirModalGoster.value = false;
  }, 250);
};

const olusturYazdirIcerik = () => {
  const kalemlerHTML = isEmri.value.is_emri_kalemleri.map(kalem => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${kalem.aciklama}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${kalem.miktar}</td>
      ${yazdirFiyatGoster.value ? `
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatParaBirimi(kalem.birim_fiyat)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">${formatParaBirimi(kalem.miktar * kalem.birim_fiyat)}</td>
      ` : ''}
    </tr>
  `).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>İş Emri - ${isEmri.value.numara || 'N/A'}</title><style>body { font-family: Arial, sans-serif; margin: 20px; } .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; } .info-section { margin-bottom: 20px; } .info-row { display: flex; justify-content: space-between; margin: 5px 0; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th { background-color: #f0f0f0; border: 1px solid #ddd; padding: 10px; text-align: left; } td { border: 1px solid #ddd; padding: 8px; } .total-section { margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold; } @media print { body { margin: 0; } button { display: none; } }</style></head><body><div class="header"><h1>İŞ EMRİ</h1><p>İş Emri No: <strong>${isEmri.value.numara || 'N/A'}</strong></p></div><div class="info-section"><div class="info-row"><span><strong>Müşteri:</strong> ${isEmri.value.musteriler?.unvan || '-'}</span><span><strong>Tarih:</strong> ${new Date(isEmri.value.siparis_tarihi).toLocaleDateString('tr-TR')}</span></div><div class="info-row"><span><strong>Durum:</strong> ${isEmri.value.durum}</span></div></div><table><thead><tr><th>Açıklama</th><th style="width: 100px; text-align: center;">Miktar</th>${yazdirFiyatGoster.value ? `<th style="width: 120px; text-align: right;">Birim Fiyat</th><th style="width: 120px; text-align: right;">Toplam</th>` : ''}</tr></thead><tbody>${kalemlerHTML}</tbody></table>${yazdirFiyatGoster.value ? `<div class="total-section">Genel Toplam: ${formatParaBirimi(toplamTutar.value)}</div>` : ''}${isEmri.value.notlar ? `<div style="margin-top: 30px; padding: 15px; background: #f9f9f9; border-left: 4px solid #333;"><strong>Notlar:</strong><br>${isEmri.value.notlar.replace(/\n/g, '<br>')}</div>` : ''}</body></html>`;
};

const formatParaBirimi = (tutar) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(tutar || 0);

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
    const [isEmriRes, depolarRes, tedarikcilerRes, anlasmalarRes, satiscilarRes] = await Promise.all([
      supabase.from('is_emirleri').select(`*, musteriler(*), anlasmalar(*), satiscilar(*), is_emri_kalemleri ( *, anlasmalar(*), depolar:kaynak_depo_id ( ad ), tedarikciler:kaynak_tedarikci_id ( ad ) )`).eq('id', isEmriId).single(),
      supabase.from('depolar').select('*'),
      supabase.from('tedarikciler').select('*'),
      supabase.from('anlasmalar').select('*, anlasma_kalemleri(urun_id, taahhut_edilen_miktar)').eq('aktif_mi', true),
      supabase.from('satiscilar').select('id, ad_soyad').eq('aktif_mi', true).order('ad_soyad')
    ]);

    if (isEmriRes.error) throw isEmriRes.error;

    isEmri.value = isEmriRes.data;
    guncelKalemler.value = [...(isEmriRes.data.is_emri_kalemleri || [])];
    depolar.value = depolarRes.data || [];
    tedarikciler.value = tedarikcilerRes.data || [];
    anlasmalar.value = anlasmalarRes.data || [];
    satiscilar.value = satiscilarRes.data || [];

    duzenlemeFormu.value = {
      satisci_id: isEmri.value.satisci_id || null,
      fatura_no: isEmri.value.fatura_no || '',
      maliyet: isEmri.value.maliyet || 0,
      is_tamamlandi: isEmri.value.is_tamamlandi || false,
      is_emri_tipi: isEmri.value.is_emri_tipi || 'SİPARİŞ',
      sevk_adresi: isEmri.value.sevk_adresi || ''
    };
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const guncelle = async () => {
  if (!isEmri.value) return;
  await guncelleWithLoading(async () => {
    const guncellenecekIsEmri = {
      toplam_tutar: toplamTutar.value,
      satisci_id: duzenlemeFormu.value.satisci_id,
      fatura_no: duzenlemeFormu.value.fatura_no,
      maliyet: duzenlemeFormu.value.maliyet,
      is_tamamlandi: duzenlemeFormu.value.is_tamamlandi,
      is_emri_tipi: duzenlemeFormu.value.is_emri_tipi,
      sevk_adresi: duzenlemeFormu.value.sevk_adresi
    };
    const { error: isEmriError } = await supabase.from('is_emirleri').update(guncellenecekIsEmri).eq('id', isEmriId);
    if (isEmriError) throw isEmriError;

    await supabase.from('is_emri_kalemleri').delete().eq('is_emri_id', isEmriId);

    if (guncelKalemler.value.length > 0) {
      const kalemlerToInsert = guncelKalemler.value.map(k => ({
        is_emri_id: isEmriId,
        // WHITELIST YÖNTEMİ: Sadece veritabanı alanlarını açıkça seçiyoruz.
        // Bu sayede UI'dan gelen 'urunler' gibi ekstra objeler hataya neden olmaz.
        urun_id: k.urun_id || null,
        aciklama: k.aciklama,
        miktar: k.miktar,
        birim_fiyat: k.birim_fiyat,
        kaynak_depo_id: k.kaynak_depo_id || null,
        kaynak_tedarikci_id: k.kaynak_tedarikci_id || null,
        anlasma_id: k.anlasma_id || null
      }));
      
      const { error: insertError } = await supabase.from('is_emri_kalemleri').insert(kalemlerToInsert);
      if (insertError) throw insertError;
    }

    alert('İş emri başarıyla güncellendi!');
    router.push('/app/is-emirleri');
  });
};

const iptalEt = async () => {
  isEditing.value = false;
  await getGerekliVeriler();
};

const kapanisModaliniAc = () => {
  if (!isEmri.value) return;
  if (isEmri.value.durum !== 'Açık') { alert('Sadece "Açık" durumundaki iş emirleri kapatılabilir.'); return; }
  if (!isEmri.value.is_tamamlandi) { alert('İş emrini kapatabilmek için öncelikle "İş Tamamlandı" olarak işaretlenmesi gerekmektedir.'); return; }
  kapanisModalGoster.value = true;
};

const kapanisBasarili = async () => {
  await getGerekliVeriler();
  kapanisModalGoster.value = false;
};

const getDurumRenk = (durum) => {
  const renkler = { 'Açık': 'bg-green-100 text-green-800', 'Kapalı': 'bg-gray-200 text-gray-700', 'İptal': 'bg-red-100 text-red-800' };
  return renkler[durum] || 'bg-gray-200 text-gray-700';
};

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
  await notKaydetWithLoading(async () => {
    const { error } = await supabase.from('is_emirleri').update({ notlar: notIcerigi.value || null }).eq('id', isEmriId);
    if (error) throw error;
    alert('Not başarıyla kaydedildi!');
    notDuzenleniyor.value = false;
    await getGerekliVeriler();
  });
};

onMounted(() => {
  getGerekliVeriler();
});
</script>
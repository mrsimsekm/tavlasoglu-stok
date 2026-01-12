<template>
  <BaseModal :show="show" @close="$emit('close')">
    <template #header>İş Emri Kapanış & Tahsilat</template>
    <template #body>
      <div v-if="isEmri" class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <!-- İŞ EMRİ ÖZETİ -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-bold text-lg mb-2">İş Emri Özeti</h3>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <p class="text-xs text-gray-500">Müşteri</p>
              <p class="text-sm font-semibold">{{ isEmri.musteriler?.unvan || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">İş Emri No</p>
              <p class="text-sm font-mono">{{ isEmri.numara || isEmri.id?.slice(0, 8) || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Toplam Tutar</p>
              <p class="text-md font-bold text-blue-600">{{ formatParaBirimi(isEmri.toplam_tutar, isEmri.para_birimi) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Daha Önce Ödenen</p>
              <p class="text-md font-semibold text-green-600">{{ formatParaBirimi(isEmri.odenen_tutar || 0, isEmri.para_birimi) }}</p>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-gray-200">
            <p class="text-xs text-gray-500">Kalan Tutar</p>
            <p class="text-2xl font-bold text-red-600">{{ formatParaBirimi(kalanTutar, isEmri.para_birimi) }}</p>
          </div>
        </div>

        <!-- ZORUNLU ALANLAR -->
        <div class="border-2 border-orange-200 bg-orange-50 p-4 rounded-lg">
          <h3 class="font-bold text-lg mb-3 text-orange-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
            Zorunlu Bilgiler
          </h3>
          <div class="space-y-3">
            <!-- Satışçı -->
            <div>
              <label class="label-style">Satışçı (*)</label>
              <select v-model="kapanisFormu.satisci_id" class="form-input" :class="{'border-red-500': hatalar.satisci}">
                <option :value="null">Satışçı Seçin</option>
                <option v-for="satisci in satiscilar" :key="satisci.id" :value="satisci.id">{{ satisci.ad_soyad }}</option>
              </select>
              <p v-if="hatalar.satisci" class="text-xs text-red-500 mt-1">{{ hatalar.satisci }}</p>
            </div>
            <!-- İş Tamamlandı -->
            <div>
              <label class="flex items-center cursor-pointer">
                <input type="checkbox" v-model="kapanisFormu.is_tamamlandi" class="h-5 w-5 text-green-600 rounded border-gray-300" :class="{'border-red-500': hatalar.is_tamamlandi}">
                <span class="ml-3 text-sm font-medium text-gray-700">İş tamamlandı (*)</span>
              </label>
              <p v-if="hatalar.is_tamamlandi" class="text-xs text-red-500 mt-1 ml-8">{{ hatalar.is_tamamlandi }}</p>
            </div>
          </div>
        </div>

        <!-- İSTEĞE BAĞLI ALANLAR -->
        <div class="border p-4 rounded-lg">
           <h3 class="font-semibold text-md mb-3 text-gray-700">İsteğe Bağlı Bilgiler</h3>
           <div class="space-y-3">
            <!-- Fatura No -->
            <div>
              <label class="label-style">Fatura No</label>
              <input v-model="kapanisFormu.fatura_no" type="text" class="form-input" placeholder="Fatura numarası girilebilir">
            </div>
            <!-- Maliyet -->
            <div>
              <label class="label-style">Maliyet</label>
              <input v-model.number="kapanisFormu.maliyet" type="number" step="0.01" class="form-input" placeholder="0.00">
            </div>
           </div>
        </div>

        <!-- HIZLI TAHSİLAT -->
        <div v-if="kalanTutar > 0" class="border-2 border-yellow-200 bg-yellow-50 p-4 rounded-lg">
          <h3 class="font-bold text-lg mb-3 text-yellow-800">Hızlı Tahsilat</h3>
          <div class="space-y-3">
            <div>
              <label class="label-style">Tahsilat Tutarı</label>
              <div class="relative mt-1">
                <input v-model.number="tahsilatForm.tutar" type="number" step="0.01" :max="kalanTutar" class="form-input pr-16" placeholder="Tahsil edilecek tutar">
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 font-bold text-sm">{{ isEmri.para_birimi || 'TRY' }}</span>
                </div>
              </div>
              <div class="flex justify-between mt-1">
                <p class="text-xs text-gray-500">Maksimum: {{ formatParaBirimi(kalanTutar, isEmri.para_birimi) }}</p>
                <button @click="tahsilatForm.tutar = kalanTutar" type="button" class="text-xs text-blue-600 hover:text-blue-800 font-semibold">Tümünü Tahsil Et</button>
              </div>
            </div>
            <div>
              <label class="label-style">Ödeme Yöntemi</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button v-for="yontem in odemeYontemleri" :key="yontem" type="button" @click="tahsilatForm.yontem = yontem" :class="['py-2 px-3 rounded-lg border-2 text-sm font-semibold transition', tahsilatForm.yontem === yontem ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400']">
                  {{ yontem }}
                </button>
              </div>
            </div>
            <div>
              <label class="label-style">Notlar</label>
              <textarea v-model="tahsilatForm.notlar" rows="2" class="form-input" placeholder="İsteğe bağlı notlar..."></textarea>
            </div>
          </div>
        </div>

        <!-- TAM ÖDENMİŞSE BİLGİ -->
        <div v-else class="border-2 border-green-200 bg-green-50 p-4 rounded-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-green-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p class="text-green-800 font-bold">Tüm tutar tahsil edilmiş</p>
          <p class="text-sm text-green-700">İş emri kapatılabilir.</p>
        </div>

        <!-- ALACAK UYARISI -->
        <div v-if="kalanTutar > 0 && tahsilatForm.tutar < kalanTutar" class="border-2 border-orange-200 bg-orange-50 p-3 rounded-lg">
          <div class="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-600 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
            <div>
              <p class="text-sm font-semibold text-orange-800">Alacak Oluşacak!</p>
              <p class="text-xs text-orange-700">Kalan {{ formatParaBirimi(kalanTutar - (tahsilatForm.tutar || 0), isEmri.para_birimi) }} tutarı için alacak kaydı oluşturulacak.</p>
            </div>
          </div>
        </div>

        <!-- NOTLAR ALANI -->
        <div>
          <label class="label-style">İş Emri Kapanış Notları</label>
          <textarea v-model="kapanisNotlari" rows="2" class="form-input" placeholder="İş emri kapanışı ile ilgili notlar (isteğe bağlı)..."></textarea>
        </div>
      </div>
    </template>
    <template #footer>
      <button @click="$emit('close')" class="btn-secondary">İptal</button>
      <button @click="isEmriKapat" :disabled="islemYapiliyor" class="btn-primary ml-2">
        {{ islemYapiliyor ? 'İşleniyor...' : 'İş Emrini Kapat' }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.label-style { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
.btn-primary { @apply bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed; }
.btn-secondary { @apply bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded; }
</style>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { supabase } from '../supabase.js';
import { useUserStore } from '../stores/userStore.js';
import BaseModal from './BaseModal.vue';

const props = defineProps({
  show: Boolean,
  isEmri: Object
});

const emit = defineEmits(['close', 'success']);

const userStore = useUserStore();
const islemYapiliyor = ref(false);
const kapanisNotlari = ref('');
const satiscilar = ref([]);
const hatalar = ref({});

const odemeYontemleri = ['Nakit', 'Kredi Kartı', 'Havale/EFT', 'Çek', 'Diğer'];

const kapanisFormu = ref({
  satisci_id: null,
  fatura_no: '',
  maliyet: null,
  is_tamamlandi: false
});

const tahsilatForm = ref({
  tutar: 0,
  yontem: '',
  notlar: ''
});

const kalanTutar = computed(() => {
  if (!props.isEmri) return 0;
  return parseFloat(props.isEmri.toplam_tutar || 0) - parseFloat(props.isEmri.odenen_tutar || 0);
});

const satiscilariYukle = async () => {
  const { data, error } = await supabase.from('satiscilar').select('id, ad_soyad').eq('aktif_mi', true).order('ad_soyad');
  if (!error) satiscilar.value = data || [];
};

watch(() => props.show, (yeniDeger) => {
  if (yeniDeger && props.isEmri) {
    kapanisFormu.value = {
      satisci_id: props.isEmri.satisci_id || null,
      fatura_no: props.isEmri.fatura_no || '',
      maliyet: props.isEmri.maliyet || null,
      is_tamamlandi: props.isEmri.is_tamamlandi || false
    };
    tahsilatForm.value = { 
      tutar: Math.max(0, kalanTutar.value), 
      yontem: '', 
      notlar: '' 
    };
    kapanisNotlari.value = '';
    hatalar.value = {};
    satiscilariYukle();
  }
});

const zorunluAlanlariKontrolEt = () => {
  hatalar.value = {};
  let gecerli = true;

  if (!kapanisFormu.value.satisci_id) {
    hatalar.value.satisci = 'Satışçı seçimi zorunludur';
    gecerli = false;
  }

  if (!kapanisFormu.value.is_tamamlandi) {
    hatalar.value.is_tamamlandi = 'İşin tamamlandığını onaylamalısınız';
    gecerli = false;
  }

  return gecerli;
};

const isEmriKapat = async () => {
  if (!props.isEmri) return;

  if (!zorunluAlanlariKontrolEt()) {
    alert('Lütfen tüm zorunlu alanları doldurun!');
    return;
  }

  if (kalanTutar.value > 0 && tahsilatForm.value.tutar > 0) {
    if (!tahsilatForm.value.yontem) { alert('Lütfen ödeme yöntemi seçiniz.'); return; }
    if (tahsilatForm.value.tutar > kalanTutar.value) { alert('Tahsilat tutarı kalan tutardan fazla olamaz!'); return; }
  }

  if (!confirm('İş emrini kapatmak istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;

  try {
    islemYapiliyor.value = true;

    if (kalanTutar.value > 0 && tahsilatForm.value.tutar > 0) {
      const { error: odemeError } = await supabase.from('odemeler').insert([{
        is_emri_id: props.isEmri.id,
        tutar: tahsilatForm.value.tutar,
        yontem: tahsilatForm.value.yontem,
        notlar: tahsilatForm.value.notlar || null,
        islem_yapan_kullanici_id: userStore.user?.id || null
      }]);
      if (odemeError) throw odemeError;

      const yeniOdenenTutar = parseFloat(props.isEmri.odenen_tutar || 0) + tahsilatForm.value.tutar;
      const { error: guncellemeError } = await supabase.from('is_emirleri').update({ odenen_tutar: yeniOdenenTutar }).eq('id', props.isEmri.id);
      if (guncellemeError) throw guncellemeError;
    }

    const guncelNotlar = kapanisNotlari.value 
      ? (props.isEmri.notlar ? props.isEmri.notlar + '\n\n[Kapanış]: ' + kapanisNotlari.value : '[Kapanış]: ' + kapanisNotlari.value)
      : props.isEmri.notlar;

    const { error: durumError } = await supabase
      .from('is_emirleri')
      .update({ 
        durum: 'Kapalı',
        notlar: guncelNotlar,
        satisci_id: kapanisFormu.value.satisci_id,
        fatura_no: kapanisFormu.value.fatura_no || null,
        is_tamamlandi: kapanisFormu.value.is_tamamlandi,
        maliyet: kapanisFormu.value.maliyet || null
      })
      .eq('id', props.isEmri.id);
    if (durumError) throw durumError;

    const yeniKalanTutar = kalanTutar.value - (tahsilatForm.value.tutar || 0);
    if (yeniKalanTutar > 0) {
      const { data: alacakData, error: alacakError } = await supabase.rpc('alacak_olustur', { p_is_emri_id: props.isEmri.id });
      if (alacakError) throw alacakError;
      if (alacakData && !alacakData.success) console.error('Alacak oluşturma uyarısı:', alacakData.message);
    }

    alert('İş emri başarıyla kapatıldı!' + (yeniKalanTutar > 0 ? '\n\nAlacak kaydı oluşturuldu: ' + formatParaBirimi(yeniKalanTutar, props.isEmri.para_birimi) : ''));
    emit('success');
    emit('close');
  } catch (error) {
    console.error('İş emri kapatma hatası:', error.message);
    alert('Hata: ' + error.message);
  } finally {
    islemYapiliyor.value = false;
  }
};

// GÜNCELLENDİ: Para Birimi Desteği
const formatParaBirimi = (tutar, currency = 'TRY') => {
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: currency || 'TRY', 
    minimumFractionDigits: 2 
  }).format(tutar || 0);
};

onMounted(() => {
  satiscilariYukle();
});
</script>
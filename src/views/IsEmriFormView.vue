<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Yeni İş Emri Oluştur</h1>
      <RouterLink to="/app/is-emirleri" class="text-gray-600 hover:text-gray-800">&larr; Geri Dön</RouterLink>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-md">
      <form @submit.prevent="kaydet" class="space-y-6">
        
        <!-- MÜŞTERİ & ANLAŞMA BİLGİLERİ -->
        <div class="border-b pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 class="text-xl font-semibold mb-4 text-gray-700">Müşteri Bilgileri</h2>
            <label class="block text-sm font-medium text-gray-700">Müşteri Seçimi (*)</label>
            <MusteriAramaInput @musteri-secildi="handleMusteriSecildi" class="mt-1" />
            <div v-if="isEmri.musteri_id" class="mt-4 p-4 bg-gray-50 rounded-lg border">
              <p><strong>Unvan:</strong> {{ secilenMusteriUnvani }}</p>
            </div>
          </div>
          <div>
            <h2 class="text-xl font-semibold mb-4 text-gray-700">Anlaşma Bilgileri</h2>
            <label class="block text-sm font-medium text-gray-700">İş Emri Anlaşması (Varsayılan)</label>
            <select v-model="secilenVarsayilanAnlasma" class="mt-1 block w-full p-2 border rounded-md bg-white">
              <option :value="null">Anlaşma Dışı</option>
              <option v-for="anlasma in anlasmalar" :key="anlasma.id" :value="anlasma">{{ anlasma.ad }}</option>
            </select>
          </div>
        </div>

        <!-- İŞ EMRİ DETAYLARI (YENİ ALANLAR EKLENDİ) -->
        <div class="border-b pb-6">
          <h2 class="text-xl font-semibold mb-4 text-gray-700">İş Emri Detayları</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- İş Emri Tipi -->
            <div>
              <label class="block text-sm font-medium text-gray-700">İş Emri Tipi (*)</label>
              <select v-model="isEmri.is_emri_tipi" required class="mt-1 block w-full p-2 border rounded-md bg-white">
                <option value="SİPARİŞ">Sipariş</option>
                <option value="ARIZA">Arıza / Servis</option>
              </select>
            </div>
            <!-- Satışçı -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Satışçı</label>
              <select v-model="isEmri.satisci_id" class="mt-1 block w-full p-2 border rounded-md bg-white">
                <option :value="null">Satışçı Seçin</option>
                <option v-for="satisci in satiscilar" :key="satisci.id" :value="satisci.id">{{ satisci.ad_soyad }}</option>
              </select>
            </div>
            <!-- Fatura No -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Fatura No</label>
              <input v-model="isEmri.fatura_no" type="text" class="mt-1 block w-full p-2 border rounded-md" placeholder="Fatura numarası girin">
            </div>
            <!-- Maliyet -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Maliyet</label>
              <input v-model.number="isEmri.maliyet" type="number" step="0.01" class="mt-1 block w-full p-2 border rounded-md" placeholder="0.00">
            </div>
            <!-- İş Tamamlandı -->
            <div class="flex items-end">
              <label class="flex items-center cursor-pointer">
                <input type="checkbox" v-model="isEmri.is_tamamlandi" class="h-5 w-5 text-green-600 rounded border-gray-300">
                <span class="ml-3 text-sm font-medium text-gray-700">İş Tamamlandı</span>
              </label>
            </div>
            <!-- Sevk Adresi -->
            <div class="md:col-span-3">
              <label class="block text-sm font-medium text-gray-700">Sevk Adresi</label>
              <textarea v-model="isEmri.sevk_adresi" rows="3" class="mt-1 block w-full p-2 border rounded-md" placeholder="Ürünlerin veya hizmetin teslim edileceği adres. Boş bırakılırsa müşterinin kayıtlı adresi varsayılır."></textarea>
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-4 text-gray-700">Malzemeler ve Hizmetler</h2>
          <IsEmriKalemEkle 
            v-if="kaynaklarHazir" 
            @kalemler-guncellendi="handleKalemlerGuncellendi" 
            :depolar="depolar" 
            :tedarikciler="tedarikciler" 
            :anlasmalar="anlasmalar" 
            :varsayilan-anlasma="secilenVarsayilanAnlasma" 
          />
          <div v-else class="text-center p-4 text-gray-500">Kaynaklar yükleniyor...</div>
        </div>
        <div class="flex justify-end pt-6 border-t">
          <button 
            type="submit" 
            :disabled="isEmriKayitYapiliyor || !isEmri.musteri_id"
            class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ isEmriKayitYapiliyor ? 'Kaydediliyor...' : 'İş Emrini Kaydet' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { supabase } from '../supabase.js';
import { useLoading } from '../composables/useLoading.js';
import MusteriAramaInput from '../components/MusteriAramaInput.vue';
import IsEmriKalemEkle from '../components/IsEmriKalemEkle.vue';

const { isLoading: isEmriKayitYapiliyor, withLoading } = useLoading();
const router = useRouter();

const isEmri = ref({
  musteri_id: null,
  anlasma_id: null,
  siparis_tarihi: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 10),
  durum: 'Açık',
  toplam_tutar: 0,
  odenen_tutar: 0,
  notlar: '',
  satisci_id: null,
  fatura_no: '',
  is_tamamlandi: false,
  maliyet: 0,
  is_emri_tipi: 'SİPARİŞ',
  sevk_adresi: ''
});

const secilenVarsayilanAnlasma = ref(null);
const isEmriKalemleri = ref([]);
const secilenMusteriUnvani = ref('');
const depolar = ref([]);
const tedarikciler = ref([]);
const anlasmalar = ref([]);
const satiscilar = ref([]);
const kaynaklarHazir = ref(false);

const handleMusteriSecildi = (musteri) => {
  isEmri.value.musteri_id = musteri.id;
  secilenMusteriUnvani.value = musteri.unvan;
};

const handleKalemlerGuncellendi = (yeniListe) => {
  isEmriKalemleri.value = yeniListe;
};

onMounted(async () => {
  const [depolarRes, tedarikcilerRes, anlasmalarRes, satiscilarRes] = await Promise.all([
    supabase.from('depolar').select('*'),
    supabase.from('tedarikciler').select('*'),
    supabase.from('anlasmalar').select('*, anlasma_kalemleri(urun_id, taahhut_edilen_miktar)').eq('aktif_mi', true),
    supabase.from('satiscilar').select('id, ad_soyad').eq('aktif_mi', true).order('ad_soyad')
  ]);
  
  depolar.value = depolarRes.data || [];
  tedarikciler.value = tedarikcilerRes.data || [];
  anlasmalar.value = anlasmalarRes.data || [];
  satiscilar.value = satiscilarRes.data || [];
  kaynaklarHazir.value = true;
});

watch(secilenVarsayilanAnlasma, (newAnlasma) => {
  isEmri.value.anlasma_id = newAnlasma ? newAnlasma.id : null;
});

const kaydet = async () => {
  if (!isEmri.value.musteri_id) { 
    alert('Lütfen bir müşteri seçin.'); 
    return; 
  }
  
  if (isEmriKalemleri.value.length === 0) { 
    alert('Lütfen en az bir malzeme veya hizmet ekleyin.'); 
    return; 
  }

  await withLoading(async () => {
    isEmri.value.toplam_tutar = isEmriKalemleri.value.reduce(
      (total, kalem) => total + (kalem.miktar * kalem.birim_fiyat), 
      0
    );
    
    const { data: isEmriData, error: isEmriError } = await supabase
      .from('is_emirleri')
      .insert(isEmri.value)
      .select('id')
      .single();
    
    if (isEmriError) throw isEmriError;
    
    const newIsEmriId = isEmriData.id;

    const kalemlerToInsert = isEmriKalemleri.value.map(kalem => ({
      is_emri_id: newIsEmriId,
      urun_id: kalem.urun_id || null,
      aciklama: kalem.aciklama,
      miktar: kalem.miktar,
      birim_fiyat: kalem.birim_fiyat,
      kaynak_depo_id: kalem.kaynak_depo_id || null,
      kaynak_tedarikci_id: kalem.kaynak_tedarikci_id || null,
      anlasma_id: kalem.anlasma_id || null,
    }));
    
    if (kalemlerToInsert.length > 0) {
      const { error: kalemlerError } = await supabase
        .from('is_emri_kalemleri')
        .insert(kalemlerToInsert);
      
      if (kalemlerError) throw kalemlerError;
    }

    alert('İş emri başarıyla kaydedildi!');
    
    // YÖNLENDİRME DEĞİŞİKLİĞİ BURADA
    // Eskisi: router.push(`/app/is-emirleri/${newIsEmriId}`); (Detay sayfası)
    // Yenisi: router.push('/app/is-emirleri'); (Liste sayfası)
    router.push('/app/is-emirleri');
  });
};
</script>
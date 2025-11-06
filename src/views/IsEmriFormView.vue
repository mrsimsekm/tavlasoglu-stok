<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Yeni İş Emri</h1>
      <RouterLink to="/app/is-emirleri" class="text-gray-600 hover:text-gray-800">&larr; Geri Dön</RouterLink>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-md">
      <form @submit.prevent="kaydet" class="space-y-6">
        <div class="border-b pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 class="text-xl font-semibold mb-4 text-gray-700">Müşteri Bilgileri</h2>
            <label class="block text-sm font-medium text-gray-700">Müşteri Seçimi</label>
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
            :disabled="isEmriKayitYapiliyor"
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
  notlar: ''
});

const secilenVarsayilanAnlasma = ref(null);
const isEmriKalemleri = ref([]);
const secilenMusteriUnvani = ref('');
const depolar = ref([]);
const tedarikciler = ref([]);
const anlasmalar = ref([]);
const kaynaklarHazir = ref(false);

const handleMusteriSecildi = (musteri) => {
  isEmri.value.musteri_id = musteri.id;
  secilenMusteriUnvani.value = musteri.unvan;
};

const handleKalemlerGuncellendi = (yeniListe) => {
  isEmriKalemleri.value = yeniListe;
};

onMounted(async () => {
  const [depolarRes, tedarikcilerRes, anlasmalarRes] = await Promise.all([
    supabase.from('depolar').select('*'),
    supabase.from('tedarikciler').select('*'),
    supabase.from('anlasmalar').select('*, anlasma_kalemleri(urun_id, taahhut_edilen_miktar)').eq('aktif_mi', true)
  ]);
  
  depolar.value = depolarRes.data || [];
  tedarikciler.value = tedarikcilerRes.data || [];
  anlasmalar.value = anlasmalarRes.data || [];
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
    // Toplam tutarı hesapla
    isEmri.value.toplam_tutar = isEmriKalemleri.value.reduce(
      (total, kalem) => total + (kalem.miktar * kalem.birim_fiyat), 
      0
    );
    
    // İş emrini kaydet
    const { data: isEmriData, error: isEmriError } = await supabase
      .from('is_emirleri')
      .insert(isEmri.value)
      .select('id')
      .single();
    
    if (isEmriError) throw isEmriError;
    
    const newIsEmriId = isEmriData.id;

    // Güvenli veri temizleme - sadece gerekli alanları al
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
    router.push('/app/is-emirleri');
  });
};
</script>
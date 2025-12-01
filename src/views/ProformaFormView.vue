<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Yeni Proforma Oluştur</h1>
      <RouterLink to="/app/proformalar" class="text-gray-600 hover:text-gray-800">&larr; Listeye Dön</RouterLink>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md">
      <form @submit.prevent="kaydet" class="space-y-6">
        
        <!-- ÜST BİLGİLER -->
        <div class="border-b pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 class="text-xl font-semibold mb-4 text-gray-700">Müşteri Seçimi</h2>
            <MusteriAramaInput @musteri-secildi="handleMusteriSecildi" />
            <div v-if="secilenMusteriUnvani" class="mt-2 p-2 bg-blue-50 text-blue-800 rounded text-sm font-semibold">
              Seçilen: {{ secilenMusteriUnvani }}
            </div>
          </div>
          <div>
            <h2 class="text-xl font-semibold mb-4 text-gray-700">Proforma Detayları</h2>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label-style">Proforma No (Otomatik)</label>
                <input v-model="form.proforma_no" type="text" class="form-input bg-gray-100" placeholder="PRF-..." readonly>
              </div>
              <div>
                <label class="label-style">Geçerlilik Tarihi (*)</label>
                <input v-model="form.gecerlilik_tarihi" type="date" required class="form-input">
              </div>
              <!-- NOTLAR ALANI TEXTAREA OLARAK GÜNCELLENDİ -->
              <div class="col-span-2">
                <label class="label-style">Notlar</label>
                <textarea 
                  v-model="form.notlar" 
                  rows="3" 
                  class="form-input" 
                  placeholder="Örn: Fiyatlar 7 gün geçerlidir. Ödeme peşindir vb."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- KALEMLER -->
        <div>
          <h2 class="text-xl font-semibold mb-4 text-gray-700">Ürün ve Hizmetler</h2>
          
          <div v-if="loadingResources" class="text-center py-4 text-gray-500">Kaynaklar yükleniyor...</div>
          
          <IsEmriKalemEkle 
             v-else
             :depolar="depolar" 
             :tedarikciler="tedarikciler" 
             :anlasmalar="anlasmalar" 
             @kalemler-guncellendi="handleKalemler" 
          />
        </div>

        <!-- KAYDET -->
        <div class="flex justify-between items-center pt-6 border-t">
          <div class="text-lg font-bold text-gray-700">
            Toplam Tutar: <span class="text-blue-600">{{ formatPara(toplamTutar) }}</span>
          </div>
          <button 
            type="submit" 
            :disabled="loading || !form.musteri_id || kalemler.length === 0"
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-8 rounded-lg disabled:bg-gray-400"
          >
            {{ loading ? 'Oluşturuluyor...' : 'Proformayı Oluştur' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped>
.label-style { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
</style>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase.js';
import MusteriAramaInput from '../components/MusteriAramaInput.vue';
import IsEmriKalemEkle from '../components/IsEmriKalemEkle.vue';

const router = useRouter();
const loading = ref(false);
const loadingResources = ref(true); // Kaynak yüklenme durumu
const secilenMusteriUnvani = ref('');
const kalemler = ref([]);

// Select verileri
const depolar = ref([]);
const tedarikciler = ref([]);
const anlasmalar = ref([]);

const form = ref({
  musteri_id: null,
  proforma_no: '',
  gecerlilik_tarihi: '', 
  notlar: ''
});

onMounted(async () => {
  // 1. Varsayılan değerler
  const date = new Date();
  const random = Math.floor(Math.random() * 1000);
  form.value.proforma_no = `PRF-${date.getFullYear()}${date.getMonth()+1}-${random}`;

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  form.value.gecerlilik_tarihi = nextWeek.toISOString().split('T')[0];

  // 2. Veritabanından kaynakları çek (Depo, Anlaşma vb.)
  try {
    const [depolarRes, tedarikcilerRes, anlasmalarRes] = await Promise.all([
      supabase.from('depolar').select('*'),
      supabase.from('tedarikciler').select('*'),
      supabase.from('anlasmalar').select('*, anlasma_kalemleri(urun_id, taahhut_edilen_miktar)').eq('aktif_mi', true)
    ]);

    depolar.value = depolarRes.data || [];
    tedarikciler.value = tedarikcilerRes.data || [];
    anlasmalar.value = anlasmalarRes.data || [];
  } catch (err) {
    console.error('Kaynaklar yüklenirken hata:', err);
  } finally {
    loadingResources.value = false;
  }
});

const handleMusteriSecildi = (musteri) => {
  form.value.musteri_id = musteri.id;
  secilenMusteriUnvani.value = musteri.unvan;
};

const handleKalemler = (liste) => {
  kalemler.value = liste;
};

const toplamTutar = computed(() => {
  return kalemler.value.reduce((sum, item) => sum + (item.miktar * item.birim_fiyat), 0);
});

const kaydet = async () => {
  try {
    loading.value = true;
    
    // 1. Proforma Başlığını Kaydet
    const { data: proforma, error: proformaError } = await supabase.from('proformalar').insert([{
      musteri_id: form.value.musteri_id,
      proforma_no: form.value.proforma_no,
      gecerlilik_tarihi: form.value.gecerlilik_tarihi,
      notlar: form.value.notlar,
      toplam_tutar: toplamTutar.value,
      durum: 'Taslak'
    }]).select().single();

    if (proformaError) throw proformaError;

    // 2. Kalemleri Kaydet
    const kalemlerToInsert = kalemler.value.map(k => ({
      proforma_id: proforma.id,
      urun_id: k.urun_id || null, 
      aciklama: k.aciklama,
      miktar: k.miktar,
      birim_fiyat: k.birim_fiyat,
      kaynak_depo_id: k.kaynak_depo_id || null,
      kaynak_tedarikci_id: k.kaynak_tedarikci_id || null,
      anlasma_id: k.anlasma_id || null
    }));

    const { error: kalemError } = await supabase.from('proforma_kalemleri').insert(kalemlerToInsert);
    if (kalemError) throw kalemError;

    alert('Proforma başarıyla oluşturuldu!');
    router.push('/app/proformalar');

  } catch (error) {
    console.error(error);
    alert('Hata: ' + error.message);
  } finally {
    loading.value = false;
  }
};

const formatPara = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0);
</script>
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

        <!-- İŞ EMRİ DETAYLARI -->
        <div class="border-b pb-6">
          <h2 class="text-xl font-semibold mb-4 text-gray-700">İş Emri Detayları</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            <!-- SATIR 1 -->
            <div>
              <label class="block text-sm font-medium text-gray-700">İş Emri Tipi (*)</label>
              <select v-model="isEmri.is_emri_tipi" required class="mt-1 block w-full p-2 border rounded-md bg-white h-[42px]">
                <option value="SİPARİŞ">Sipariş</option>
                <option value="ARIZA">Arıza / Servis</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Satışçı</label>
              <select v-model="isEmri.satisci_id" class="mt-1 block w-full p-2 border rounded-md bg-white h-[42px]">
                <option :value="null">Satışçı Seçin</option>
                <option v-for="satisci in satiscilar" :key="satisci.id" :value="satisci.id">{{ satisci.ad_soyad }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Fatura No</label>
              <input v-model="isEmri.fatura_no" type="text" class="mt-1 block w-full p-2 border rounded-md h-[42px]" placeholder="Fatura numarası">
            </div>

            <!-- SATIR 2 -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Para Birimi</label>
              <select v-model="isEmri.para_birimi" class="mt-1 block w-full p-2 border rounded-md bg-white h-[42px] font-bold text-gray-800">
                <option value="TRY">₺ Türk Lirası (TRY)</option>
                <option value="USD">$ Amerikan Doları (USD)</option>
                <option value="EUR">€ Euro (EUR)</option>
                <option value="GBP">£ İngiliz Sterlini (GBP)</option>
              </select>
            </div>

            <div class="flex items-center h-[70px]"> 
              <label class="flex items-center cursor-pointer mt-5">
                <input type="checkbox" v-model="isEmri.is_tamamlandi" class="h-5 w-5 text-green-600 rounded border-gray-300">
                <span class="ml-3 text-sm font-medium text-gray-700">İş Tamamlandı</span>
              </label>
            </div>

            <div class="md:col-span-1"></div> <!-- Boşluk -->

            <!-- SATIR 3 -->
            <div class="md:col-span-3">
              <label class="block text-sm font-medium text-gray-700">Sevk Adresi</label>
              <textarea v-model="isEmri.sevk_adresi" rows="2" class="mt-1 block w-full p-2 border rounded-md" placeholder="Teslimat adresi..."></textarea>
            </div>

            <!-- Notlar -->
            <div class="md:col-span-3">
              <label class="block text-sm font-medium text-gray-700">Notlar</label>
              <textarea v-model="isEmri.notlar" rows="2" class="mt-1 block w-full p-2 border rounded-md" placeholder="İş emri ile ilgili notlar..."></textarea>
            </div>

          </div>
        </div>

        <!-- YENİ BÖLÜM: MALİYET KALEMLERİ -->
        <div class="border-b pb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-700">Maliyet Kalemleri</h2>
            <div class="text-sm font-medium">
              Toplam Maliyet: <span class="text-orange-600 font-bold text-lg">{{ formatPara(toplamMaliyet, isEmri.para_birimi) }}</span>
            </div>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
            <div v-if="maliyetListesi.length === 0" class="text-center text-gray-400 py-2 italic text-sm">
              Henüz maliyet kalemi eklenmedi.
            </div>
            <div v-else class="space-y-2 mb-4">
              <div v-for="(item, index) in maliyetListesi" :key="index" class="flex items-center gap-3">
                <div class="flex-grow">
                  <input type="text" v-model="item.aciklama" class="w-full p-2 border rounded text-sm" placeholder="Maliyet Açıklaması (Örn: Yakıt)">
                </div>
                <div class="w-32">
                  <input type="number" v-model.number="item.tutar" step="0.01" class="w-full p-2 border rounded text-sm text-right" placeholder="0.00">
                </div>
                <button type="button" @click="maliyetListesi.splice(index, 1)" class="text-red-500 hover:text-red-700 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                </button>
              </div>
            </div>
            <button type="button" @click="maliyetEkle" class="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
              Kalem Ekle
            </button>
          </div>
        </div>

        <!-- ÜRÜN KALEMLERİ -->
        <div>
          <h2 class="text-xl font-semibold mb-4 text-gray-700">Malzemeler ve Hizmetler</h2>
          <IsEmriKalemEkle 
            v-if="kaynaklarHazir" 
            @kalemler-guncellendi="handleKalemlerGuncellendi" 
            :depolar="depolar" 
            :tedarikciler="tedarikciler" 
            :anlasmalar="anlasmalar" 
            :varsayilan-anlasma="secilenVarsayilanAnlasma"
            :para-birimi="isEmri.para_birimi" 
          />
          <div v-else class="text-center p-4 text-gray-500">Kaynaklar yükleniyor...</div>
        </div>
        
        <!-- FOOTER -->
        <div class="flex justify-end pt-6 border-t items-center space-x-4">
          <div class="text-lg font-bold text-gray-700 mr-4">
             Toplam: <span class="text-blue-600">{{ formatPara(toplamTutar, isEmri.para_birimi) }}</span>
          </div>
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
import { ref, onMounted, watch, computed } from 'vue';
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
  maliyet: 0, // Bu alan artık hesaplanan toplama eşitlenecek
  is_emri_tipi: 'SİPARİŞ',
  sevk_adresi: '',
  para_birimi: 'TRY'
});

const secilenVarsayilanAnlasma = ref(null);
const isEmriKalemleri = ref([]);
const maliyetListesi = ref([]); // Yeni Maliyet Listesi
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

// Maliyet işlemleri
const maliyetEkle = () => {
  maliyetListesi.value.push({ aciklama: '', tutar: 0 });
};

// Hesaplamalar
const toplamTutar = computed(() => isEmriKalemleri.value.reduce((total, kalem) => total + (kalem.miktar * kalem.birim_fiyat), 0));
const toplamMaliyet = computed(() => maliyetListesi.value.reduce((sum, item) => sum + (parseFloat(item.tutar) || 0), 0));

const formatPara = (val, currency = 'TRY') => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency || 'TRY' }).format(val || 0);

onMounted(async () => {
  const d = new Date();
  isEmri.value.numara = `IE-${d.getFullYear()}${d.getMonth()+1}-${Math.floor(Math.random()*10000)}`;

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
  if (!isEmri.value.musteri_id) { alert('Lütfen bir müşteri seçin.'); return; }
  if (isEmriKalemleri.value.length === 0) { alert('Lütfen en az bir malzeme veya hizmet ekleyin.'); return; }

  await withLoading(async () => {
    isEmri.value.toplam_tutar = toplamTutar.value;
    isEmri.value.maliyet = toplamMaliyet.value; // Maliyet toplamını ana tabloya yaz
    
    // 1. İş Emri Başlığını Kaydet
    const { data: isEmriData, error: isEmriError } = await supabase
      .from('is_emirleri')
      .insert([{
        ...isEmri.value,
        numara: isEmri.value.numara || `IE-${Math.floor(Math.random()*100000)}`
      }])
      .select('id')
      .single();
    
    if (isEmriError) throw isEmriError;
    const newIsEmriId = isEmriData.id;

    // 2. Ürün Kalemlerini Kaydet
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
      const { error: kalemlerError } = await supabase.from('is_emri_kalemleri').insert(kalemlerToInsert);
      if (kalemlerError) throw kalemlerError;
    }

    // 3. Maliyet Kalemlerini Kaydet (YENİ)
    const maliyetlerToInsert = maliyetListesi.value
      .filter(m => m.aciklama && m.tutar > 0)
      .map(m => ({
        is_emri_id: newIsEmriId,
        aciklama: m.aciklama,
        tutar: m.tutar
      }));

    if (maliyetlerToInsert.length > 0) {
      const { error: maliyetError } = await supabase.from('is_emri_maliyetleri').insert(maliyetlerToInsert);
      if (maliyetError) throw maliyetError;
    }

    alert('İş emri başarıyla kaydedildi!');
    router.push('/app/is-emirleri');
  });
};
</script>
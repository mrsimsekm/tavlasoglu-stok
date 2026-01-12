<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Satışçılara Göre İş Emirleri</h1>
    </div>

    <!-- FİLTRELER -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Satışçı Filtresi -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Satışçı</label>
          <select v-model="filtreler.satisci_id" @change="isEmirleriniYukle" class="w-full p-2 border rounded-md bg-white">
            <option :value="null">Tüm Satışçılar</option>
            <option v-for="satisci in satiscilar" :key="satisci.id" :value="satisci.id">
              {{ satisci.ad_soyad }}
            </option>
          </select>
        </div>

        <!-- Durum Filtresi -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Durum</label>
          <select v-model="filtreler.durum" @change="isEmirleriniYukle" class="w-full p-2 border rounded-md bg-white">
            <option value="">Tümü</option>
            <option value="Açık">Açık</option>
            <option value="Kapalı">Kapalı</option>
            <option value="Tamamlandı">Tamamlandı</option>
          </select>
        </div>

        <!-- Tarih Filtresi Türü -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tarih Aralığı</label>
          <select v-model="filtreler.tarihTuru" @change="tarihFiltresiDegisti" class="w-full p-2 border rounded-md bg-white">
            <option value="tumu">Tüm Zamanlar</option>
            <option value="bugun">Bugün</option>
            <option value="bu_hafta">Bu Hafta</option>
            <option value="bu_ay">Bu Ay</option>
            <option value="gecen_ay">Geçen Ay</option>
            <option value="bu_yil">Bu Yıl</option>
            <option value="gecen_yil">Geçen Yıl</option>
            <option value="ozel">Özel Tarih Aralığı</option>
          </select>
        </div>
      </div>

      <!-- Özel Tarih Aralığı -->
      <div v-if="filtreler.tarihTuru === 'ozel'" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Başlangıç Tarihi</label>
          <input 
            v-model="filtreler.baslangic_tarihi" 
            type="date" 
            @change="isEmirleriniYukle"
            class="w-full p-2 border rounded-md"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Bitiş Tarihi</label>
          <input 
            v-model="filtreler.bitis_tarihi" 
            type="date" 
            @change="isEmirleriniYukle"
            class="w-full p-2 border rounded-md"
          >
        </div>
      </div>

      <!-- Özet İstatistikler (Çoklu Para Birimi) -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
        <!-- Toplam İş Emri -->
        <div class="bg-blue-50 p-4 rounded-lg">
          <p class="text-sm text-blue-600 font-semibold mb-1">Toplam İş Emri</p>
          <p class="text-2xl font-bold text-blue-700">{{ isEmirleri.length }}</p>
        </div>

        <!-- Toplam Tutar -->
        <div class="bg-green-50 p-4 rounded-lg">
          <p class="text-sm text-green-600 font-semibold mb-2">Toplam Tutar</p>
          <div v-if="Object.keys(toplamTutarByCurrency).length > 0">
            <div v-for="(tutar, pb) in toplamTutarByCurrency" :key="pb" class="flex justify-between text-sm mb-1 border-b border-green-200 pb-1 last:border-0 last:pb-0">
              <span class="font-bold text-green-800">{{ pb }}:</span>
              <span class="font-bold text-green-700">{{ formatParaBirimi(tutar, pb) }}</span>
            </div>
          </div>
          <div v-else class="text-green-700 font-bold">0,00 ₺</div>
        </div>

        <!-- Toplam Maliyet -->
        <div class="bg-orange-50 p-4 rounded-lg">
          <p class="text-sm text-orange-600 font-semibold mb-2">Toplam Maliyet</p>
          <div v-if="Object.keys(toplamMaliyetByCurrency).length > 0">
            <div v-for="(tutar, pb) in toplamMaliyetByCurrency" :key="pb" class="flex justify-between text-sm mb-1 border-b border-orange-200 pb-1 last:border-0 last:pb-0">
              <span class="font-bold text-orange-800">{{ pb }}:</span>
              <span class="font-bold text-orange-700">{{ formatParaBirimi(tutar, pb) }}</span>
            </div>
          </div>
          <div v-else class="text-orange-700 font-bold">0,00 ₺</div>
        </div>

        <!-- Net Kar -->
        <div class="bg-purple-50 p-4 rounded-lg">
          <p class="text-sm text-purple-600 font-semibold mb-2">Net Kar</p>
          <div v-if="Object.keys(netKarByCurrency).length > 0">
            <div v-for="(tutar, pb) in netKarByCurrency" :key="pb" class="flex justify-between text-sm mb-1 border-b border-purple-200 pb-1 last:border-0 last:pb-0">
              <span class="font-bold text-purple-800">{{ pb }}:</span>
              <span class="font-bold text-purple-700">{{ formatParaBirimi(tutar, pb) }}</span>
            </div>
          </div>
          <div v-else class="text-purple-700 font-bold">0,00 ₺</div>
        </div>
      </div>
    </div>

    <!-- İŞ EMİRLERİ TABLOSU -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div v-if="yukleniyor" class="text-center p-6">Yükleniyor...</div>
      <div v-else-if="hata" class="bg-red-100 p-4 text-red-700">Hata: {{ hata }}</div>
      <div v-else-if="isEmirleri.length === 0" class="text-center p-6 text-gray-500">
        Seçili filtrelere göre iş emri bulunamadı.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-100 border-b-2 border-gray-200">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">İş Emri No</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Satışçı</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Müşteri</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tarih</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Durum</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Tutar</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Maliyet</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Kar</th>
              <th class="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody class="bg-white">
            <tr v-for="isEmri in isEmirleri" :key="isEmri.id" class="border-b border-gray-200 hover:bg-gray-50">
              <td class="px-5 py-4">
                <RouterLink 
                  :to="`/app/is-emirleri/${isEmri.id}`"
                  class="text-indigo-600 hover:text-indigo-800 font-mono font-semibold"
                >
                  {{ isEmri.numara || 'N/A' }}
                </RouterLink>
              </td>
              <td class="px-5 py-4 text-sm">
                {{ isEmri.satiscilar?.ad_soyad || '-' }}
              </td>
              <td class="px-5 py-4 text-sm">
                {{ isEmri.musteriler?.unvan || '-' }}
              </td>
              <td class="px-5 py-4 text-sm">
                {{ new Date(isEmri.siparis_tarihi).toLocaleDateString('tr-TR') }}
              </td>
              <td class="px-5 py-4">
                <span class="px-2 py-1 text-xs font-semibold rounded" :class="getDurumRenk(isEmri.durum)">
                  {{ isEmri.durum }}
                </span>
              </td>
              
              <!-- Tutar Alanları (Para Birimine Göre) -->
              <td class="px-5 py-4 text-right font-semibold text-sm text-blue-600">
                {{ formatParaBirimi(isEmri.toplam_tutar || 0, isEmri.para_birimi) }}
              </td>
              <td class="px-5 py-4 text-right font-semibold text-sm text-orange-600">
                {{ formatParaBirimi(isEmri.maliyet || 0, isEmri.para_birimi) }}
              </td>
              <td class="px-5 py-4 text-right font-semibold text-sm" :class="(isEmri.toplam_tutar - isEmri.maliyet) > 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatParaBirimi((isEmri.toplam_tutar || 0) - (isEmri.maliyet || 0), isEmri.para_birimi) }}
              </td>
              
              <td class="px-5 py-4 text-center">
                <RouterLink 
                  :to="`/app/is-emirleri/${isEmri.id}`"
                  class="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                >
                  Detay
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- SAYFALAMA (Opsiyonel) -->
    <div v-if="isEmirleri.length > 0" class="mt-4 text-center text-sm text-gray-600">
      Toplam {{ isEmirleri.length }} iş emri görüntüleniyor
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { supabase } from '../supabase.js';

const satiscilar = ref([]);
const isEmirleri = ref([]);
const yukleniyor = ref(false);
const hata = ref(null);

const filtreler = ref({
  satisci_id: null,
  durum: '',
  tarihTuru: 'tumu',
  baslangic_tarihi: null,
  bitis_tarihi: null
});

// Toplam Tutar (Para Birimine Göre Gruplu)
const toplamTutarByCurrency = computed(() => {
  const totals = {};
  isEmirleri.value.forEach(ie => {
    const pb = ie.para_birimi || 'TRY';
    if (!totals[pb]) totals[pb] = 0;
    totals[pb] += parseFloat(ie.toplam_tutar || 0);
  });
  return totals;
});

// Toplam Maliyet (Para Birimine Göre Gruplu)
const toplamMaliyetByCurrency = computed(() => {
  const totals = {};
  isEmirleri.value.forEach(ie => {
    const pb = ie.para_birimi || 'TRY';
    if (!totals[pb]) totals[pb] = 0;
    totals[pb] += parseFloat(ie.maliyet || 0);
  });
  return totals;
});

// Net Kar (Para Birimine Göre Gruplu)
const netKarByCurrency = computed(() => {
  const totals = {};
  isEmirleri.value.forEach(ie => {
    const pb = ie.para_birimi || 'TRY';
    const kar = (parseFloat(ie.toplam_tutar || 0) - parseFloat(ie.maliyet || 0));
    if (!totals[pb]) totals[pb] = 0;
    totals[pb] += kar;
  });
  return totals;
});

// Format (Para Birimi Destekli)
const formatParaBirimi = (tutar, currency = 'TRY') => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency || 'TRY',
    minimumFractionDigits: 2
  }).format(tutar || 0);
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

const tarihFiltresiDegisti = () => {
  const bugun = new Date();
  const yil = bugun.getFullYear();
  const ay = bugun.getMonth();
  const gun = bugun.getDate();

  switch (filtreler.value.tarihTuru) {
    case 'bugun':
      filtreler.value.baslangic_tarihi = new Date(yil, ay, gun).toISOString().split('T')[0];
      filtreler.value.bitis_tarihi = new Date(yil, ay, gun).toISOString().split('T')[0];
      break;
    
    case 'bu_hafta':
      const haftaninBaslangici = new Date(bugun);
      haftaninBaslangici.setDate(gun - bugun.getDay() + 1); // Pazartesi
      filtreler.value.baslangic_tarihi = haftaninBaslangici.toISOString().split('T')[0];
      filtreler.value.bitis_tarihi = bugun.toISOString().split('T')[0];
      break;
    
    case 'bu_ay':
      filtreler.value.baslangic_tarihi = new Date(yil, ay, 1).toISOString().split('T')[0];
      filtreler.value.bitis_tarihi = new Date(yil, ay + 1, 0).toISOString().split('T')[0];
      break;
    
    case 'gecen_ay':
      filtreler.value.baslangic_tarihi = new Date(yil, ay - 1, 1).toISOString().split('T')[0];
      filtreler.value.bitis_tarihi = new Date(yil, ay, 0).toISOString().split('T')[0];
      break;
    
    case 'bu_yil':
      filtreler.value.baslangic_tarihi = new Date(yil, 0, 1).toISOString().split('T')[0];
      filtreler.value.bitis_tarihi = new Date(yil, 11, 31).toISOString().split('T')[0];
      break;
    
    case 'gecen_yil':
      filtreler.value.baslangic_tarihi = new Date(yil - 1, 0, 1).toISOString().split('T')[0];
      filtreler.value.bitis_tarihi = new Date(yil - 1, 11, 31).toISOString().split('T')[0];
      break;
    
    case 'ozel':
      // Kullanıcı manuel girecek
      return;
    
    case 'tumu':
    default:
      filtreler.value.baslangic_tarihi = null;
      filtreler.value.bitis_tarihi = null;
      break;
  }

  isEmirleriniYukle();
};

const isEmirleriniYukle = async () => {
  try {
    yukleniyor.value = true;
    hata.value = null;

    let query = supabase
      .from('is_emirleri')
      .select(`
        *,
        musteriler(id, unvan),
        satiscilar(id, ad_soyad)
      `)
      .order('siparis_tarihi', { ascending: false });

    // Satışçı filtresi
    if (filtreler.value.satisci_id) {
      query = query.eq('satisci_id', filtreler.value.satisci_id);
    }

    // Durum filtresi
    if (filtreler.value.durum) {
      query = query.eq('durum', filtreler.value.durum);
    }

    // Tarih filtresi
    if (filtreler.value.baslangic_tarihi) {
      query = query.gte('siparis_tarihi', filtreler.value.baslangic_tarihi);
    }
    if (filtreler.value.bitis_tarihi) {
      query = query.lte('siparis_tarihi', filtreler.value.bitis_tarihi);
    }

    const { data, error } = await query;

    if (error) throw error;

    isEmirleri.value = data || [];
  } catch (err) {
    console.error('İş emirleri yükleme hatası:', err);
    hata.value = err.message;
  } finally {
    yukleniyor.value = false;
  }
};

const satiscilariYukle = async () => {
  const { data, error } = await supabase
    .from('satiscilar')
    .select('id, ad_soyad')
    .eq('aktif_mi', true)
    .order('ad_soyad');
  
  if (!error) {
    satiscilar.value = data || [];
  }
};

onMounted(async () => {
  await satiscilariYukle();
  await isEmirleriniYukle();
});
</script>
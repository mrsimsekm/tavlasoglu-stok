<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Satışçılara Göre İş Emirleri</h1>
    </div>

    <!-- FİLTRELER -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Satışçı Filtresi -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Satışçı</label>
          <select v-model="filtreler.satisci_id" @change="filtrele" class="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500">
            <option :value="null">Tüm Satışçılar</option>
            <option v-for="satisci in satiscilar" :key="satisci.id" :value="satisci.id">
              {{ satisci.ad_soyad }}
            </option>
          </select>
        </div>

        <!-- Durum Filtresi -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Durum</label>
          <select v-model="filtreler.durum" @change="filtrele" class="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500">
            <option :value="null">Tümü</option>
            <option value="Açık">Açık</option>
            <option value="Kapalı">Kapalı</option>
            <option value="Tamamlandı">Tamamlandı</option>
          </select>
        </div>

        <!-- Tarih Filtresi Türü -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tarih Aralığı</label>
          <select v-model="filtreler.tarihTuru" @change="tarihFiltresiDegisti" class="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500">
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
      <div v-if="filtreler.tarihTuru === 'ozel'" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded border border-gray-200">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Başlangıç Tarihi</label>
          <input 
            v-model="filtreler.baslangic_tarihi" 
            type="date" 
            @change="filtrele"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Bitiş Tarihi</label>
          <input 
            v-model="filtreler.bitis_tarihi" 
            type="date" 
            @change="filtrele"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
        </div>
      </div>

      <!-- Özet İstatistikler (Çoklu Para Birimi) -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
        <!-- Toplam İş Emri -->
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p class="text-sm text-blue-600 font-semibold mb-1">Toplam İş Emri</p>
          <p class="text-2xl font-bold text-blue-700">{{ toplamKayitSayisi }}</p>
        </div>

        <!-- Toplam Tutar -->
        <div class="bg-green-50 p-4 rounded-lg border border-green-100">
          <p class="text-sm text-green-600 font-semibold mb-2">Toplam Tutar</p>
          <div v-if="ozetBilgiler.length > 0">
            <div v-for="ozet in ozetBilgiler" :key="ozet.para_birimi" class="flex justify-between text-sm mb-1 border-b border-green-200 pb-1 last:border-0 last:pb-0">
              <span class="font-bold text-green-800">{{ ozet.para_birimi }}:</span>
              <span class="font-bold text-green-700">{{ formatParaBirimi(ozet.toplam_tutar, ozet.para_birimi) }}</span>
            </div>
          </div>
          <div v-else class="text-green-700 font-bold">0,00 ₺</div>
        </div>

        <!-- Toplam Maliyet -->
        <div class="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <p class="text-sm text-orange-600 font-semibold mb-2">Toplam Maliyet</p>
          <div v-if="ozetBilgiler.length > 0">
            <div v-for="ozet in ozetBilgiler" :key="ozet.para_birimi" class="flex justify-between text-sm mb-1 border-b border-orange-200 pb-1 last:border-0 last:pb-0">
              <span class="font-bold text-orange-800">{{ ozet.para_birimi }}:</span>
              <span class="font-bold text-orange-700">{{ formatParaBirimi(ozet.toplam_maliyet, ozet.para_birimi) }}</span>
            </div>
          </div>
          <div v-else class="text-orange-700 font-bold">0,00 ₺</div>
        </div>

        <!-- Net Kar -->
        <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <p class="text-sm text-purple-600 font-semibold mb-2">Net Kar</p>
          <div v-if="ozetBilgiler.length > 0">
            <div v-for="ozet in ozetBilgiler" :key="ozet.para_birimi" class="flex justify-between text-sm mb-1 border-b border-purple-200 pb-1 last:border-0 last:pb-0">
              <span class="font-bold text-purple-800">{{ ozet.para_birimi }}:</span>
              <span class="font-bold text-purple-700">{{ formatParaBirimi(ozet.toplam_tutar - ozet.toplam_maliyet, ozet.para_birimi) }}</span>
            </div>
          </div>
          <div v-else class="text-purple-700 font-bold">0,00 ₺</div>
        </div>
      </div>
    </div>

    <!-- İŞ EMİRLERİ TABLOSU -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div v-if="yukleniyor" class="text-center p-10 flex flex-col items-center">
         <svg class="animate-spin h-8 w-8 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
         <span class="text-gray-500">Yükleniyor...</span>
      </div>
      <div v-else-if="hata" class="bg-red-100 p-4 text-red-700 text-center font-bold border-l-4 border-red-500">
        Hata: {{ hata }}
      </div>
      <div v-else-if="isEmirleri.length === 0" class="text-center p-10 text-gray-500 italic">
        Seçili filtrelere göre iş emri bulunamadı.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <!-- SIRALANABİLİR KOLONLAR -->
              <th @click="siralamayiDegistir('numara')" class="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group select-none">
                <div class="flex items-center">
                   İş Emri No
                   <SiralamaIcon kolon="numara" :aktifKolon="sortBy" :yon="sortDirection" />
                </div>
              </th>
              
              <th @click="siralamayiDegistir('satisci_ad_soyad')" class="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group select-none">
                <div class="flex items-center">
                  Satışçı
                  <SiralamaIcon kolon="satisci_ad_soyad" :aktifKolon="sortBy" :yon="sortDirection" />
                </div>
              </th>

              <th @click="siralamayiDegistir('musteri_unvani')" class="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group select-none">
                <div class="flex items-center">
                  Müşteri
                  <SiralamaIcon kolon="musteri_unvani" :aktifKolon="sortBy" :yon="sortDirection" />
                </div>
              </th>

              <th @click="siralamayiDegistir('siparis_tarihi')" class="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group select-none">
                <div class="flex items-center">
                  Tarih
                  <SiralamaIcon kolon="siparis_tarihi" :aktifKolon="sortBy" :yon="sortDirection" />
                </div>
              </th>

              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Durum</th>
              
              <th @click="siralamayiDegistir('toplam_tutar')" class="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group select-none">
                <div class="flex items-center justify-end">
                  Tutar
                  <SiralamaIcon kolon="toplam_tutar" :aktifKolon="sortBy" :yon="sortDirection" />
                </div>
              </th>

              <th class="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Maliyet</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Kar</th>
              <th class="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="isEmri in isEmirleri" :key="isEmri.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-5 py-4">
                <RouterLink :to="`/app/is-emirleri/${isEmri.id}`" class="text-indigo-600 hover:text-indigo-900 font-mono font-semibold hover:underline">
                  {{ isEmri.numara || 'N/A' }}
                </RouterLink>
              </td>
              <td class="px-5 py-4 text-sm font-medium text-gray-700">{{ isEmri.satisci_ad_soyad || '-' }}</td>
              <td class="px-5 py-4 text-sm text-gray-600">{{ isEmri.musteri_unvani || '-' }}</td>
              <td class="px-5 py-4 text-sm text-gray-600">{{ isEmri.siparis_tarihi ? new Date(isEmri.siparis_tarihi).toLocaleDateString('tr-TR') : '-' }}</td>
              <td class="px-5 py-4">
                <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getDurumRenk(isEmri.durum)">
                  {{ isEmri.durum }}
                </span>
              </td>
              <td class="px-5 py-4 text-right font-semibold text-sm text-blue-600">
                {{ formatParaBirimi(isEmri.toplam_tutar, isEmri.para_birimi) }}
              </td>
              <td class="px-5 py-4 text-right font-semibold text-sm text-orange-600">
                {{ formatParaBirimi(isEmri.maliyet, isEmri.para_birimi) }}
              </td>
              <td class="px-5 py-4 text-right font-semibold text-sm" :class="(isEmri.toplam_tutar - isEmri.maliyet) > 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatParaBirimi((isEmri.toplam_tutar || 0) - (isEmri.maliyet || 0), isEmri.para_birimi) }}
              </td>
              <td class="px-5 py-4 text-center">
                <RouterLink :to="`/app/is-emirleri/${isEmri.id}`" class="text-indigo-600 hover:text-indigo-900 text-sm font-semibold hover:underline">
                  Detay
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- SAYFALAMA -->
      <div class="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div>
          <p class="text-sm text-gray-700">
            Toplam <span class="font-medium">{{ toplamKayitSayisi }}</span> kayıttan 
            <span class="font-medium">{{ (mevcutSayfa - 1) * sayfaBasinaKayit + 1 }}</span> - 
            <span class="font-medium">{{ Math.min(mevcutSayfa * sayfaBasinaKayit, toplamKayitSayisi) }}</span> arası gösteriliyor.
          </p>
        </div>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button @click="sayfaDegistir(mevcutSayfa - 1)" :disabled="mevcutSayfa === 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Önceki
          </button>
          <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            Sayfa {{ mevcutSayfa }}
          </span>
          <button @click="sayfaDegistir(mevcutSayfa + 1)" :disabled="mevcutSayfa * sayfaBasinaKayit >= toplamKayitSayisi" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Sonraki
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { RouterLink } from 'vue-router';
import { supabase } from '../supabase.js';

// --- COMPONENTS ---
const SiralamaIcon = defineAsyncComponent(() => 
  Promise.resolve({
    props: ['kolon', 'aktifKolon', 'yon'],
    template: `
      <div class="inline-block w-4 h-4 ml-1 text-gray-400 group-hover:text-gray-600">
          <svg v-if="aktifKolon === kolon && yon === 'asc'" class="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
          <svg v-else-if="aktifKolon === kolon && yon === 'desc'" class="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          <svg v-else class="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
      </div>`
  })
);

// --- STATE ---
const satiscilar = ref([]);
const isEmirleri = ref([]);
const ozetBilgiler = ref([]);
const yukleniyor = ref(false);
const hata = ref(null);

// Sayfalama & Sıralama
const mevcutSayfa = ref(1);
const sayfaBasinaKayit = 10;
const toplamKayitSayisi = ref(0);
const sortBy = ref('numara');
const sortDirection = ref('desc');

const filtreler = ref({
  satisci_id: null,
  durum: null,
  tarihTuru: 'tumu',
  baslangic_tarihi: null,
  bitis_tarihi: null
});

// --- ACTIONS ---
const filtrele = () => {
  mevcutSayfa.value = 1;
  verileriGetir();
};

const siralamayiDegistir = (kolonKey) => {
  if (sortBy.value === kolonKey) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = kolonKey;
    sortDirection.value = 'desc'; // Varsayılan sıralama yönü (örneğin tarihte yeni olan üstte olsun isterseniz desc, A-Z isterseniz asc)
  }
  mevcutSayfa.value = 1;
  verileriYukle();
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
      haftaninBaslangici.setDate(gun - bugun.getDay() + 1); 
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
      return; 
    case 'tumu':
    default:
      filtreler.value.baslangic_tarihi = null;
      filtreler.value.bitis_tarihi = null;
      break;
  }
  filtrele();
};

const sayfaDegistir = (yeniSayfa) => {
  if (yeniSayfa < 1 || (yeniSayfa - 1) * sayfaBasinaKayit >= toplamKayitSayisi.value) return;
  mevcutSayfa.value = yeniSayfa;
  verileriYukle();
};

// --- DATA FETCHING ---
const verileriGetir = async () => {
  await Promise.all([verileriYukle(), ozetiYukle()]);
};

const verileriYukle = async () => {
  try {
    yukleniyor.value = true;
    hata.value = null;
    const offset = (mevcutSayfa.value - 1) * sayfaBasinaKayit;

    const { data, error } = await supabase.rpc('get_satisci_is_emirleri_paginated', {
      p_limit: sayfaBasinaKayit,
      p_offset: offset,
      p_satisci_id: filtreler.value.satisci_id || null,
      p_durum: filtreler.value.durum || null,
      p_baslangic_tarihi: filtreler.value.baslangic_tarihi || null,
      p_bitis_tarihi: filtreler.value.bitis_tarihi || null,
      p_sort_by: sortBy.value,
      p_sort_direction: sortDirection.value
    });

    if (error) throw error;
    isEmirleri.value = data || [];
    toplamKayitSayisi.value = data && data.length > 0 ? data[0].total_count : 0;

  } catch (err) {
    console.error('İş emirleri yükleme hatası:', err);
    hata.value = err.message;
  } finally {
    yukleniyor.value = false;
  }
};

const ozetiYukle = async () => {
  try {
    const { data, error } = await supabase.rpc('get_satisci_performans_ozet', {
      p_satisci_id: filtreler.value.satisci_id || null,
      p_durum: filtreler.value.durum || null,
      p_baslangic_tarihi: filtreler.value.baslangic_tarihi || null,
      p_bitis_tarihi: filtreler.value.bitis_tarihi || null
    });

    if (error) throw error;
    ozetBilgiler.value = data || [];
  } catch (err) {
    console.error('Özet yükleme hatası:', err);
  }
};

const satiscilariYukle = async () => {
  const { data } = await supabase.from('satiscilar').select('id, ad_soyad').eq('aktif_mi', true).order('ad_soyad');
  satiscilar.value = data || [];
};

// --- HELPERS ---
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

onMounted(async () => {
  await satiscilariYukle();
  await verileriGetir();
});
</script>
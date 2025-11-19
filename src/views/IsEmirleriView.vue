<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-3xl font-bold text-gray-800">İş Emirleri</h1>
      <RouterLink to="/app/is-emirleri/yeni" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
        + Yeni İş Emri Oluştur
      </RouterLink>
    </div>

    <!-- FİLTRELEME VE ARAMA BÖLÜMÜ (YENİ 6 CHECKBOX'LI YAPI) -->
    <div class="mb-6 p-4 bg-white rounded-lg shadow-md border border-gray-200 space-y-4">
      <!-- Arama Kutusu -->
      <div>
        <label for="arama" class="text-sm font-medium text-gray-700">Ara (Müşteri, İş Emri No)</label>
        <input 
          id="arama"
          type="text" 
          placeholder="Müşteri unvanı veya iş emri no..." 
          v-model="aramaMetni" 
          class="mt-1 w-full p-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-4 pt-2 border-t">
        <!-- Ana Durum Filtreleri -->
        <div class="md:col-span-1">
          <label class="text-sm font-medium text-gray-700 block mb-2">İş Emri Durumu</label>
          <div class="flex flex-col space-y-2">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" v-model="filtreler.durum.acik" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
              <span class="text-sm text-gray-800">Açık</span>
            </label>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" v-model="filtreler.durum.kapali" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
              <span class="text-sm text-gray-800">Kapalı</span>
            </label>
          </div>
        </div>

        <!-- Alt Kategori Filtreleri -->
        <div class="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4">
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-2">Fatura Durumu</label>
            <div class="flex flex-col space-y-2">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" v-model="filtreler.fatura.kesilmemis" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <span class="text-sm text-gray-800">Kesilmemiş</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" v-model="filtreler.fatura.kesilmis" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <span class="text-sm text-gray-800">Kesilmiş</span>
              </label>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-2">Tahsilat Durumu</label>
            <div class="flex flex-col space-y-2">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" v-model="filtreler.tahsilat.eksik" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <span class="text-sm text-gray-800">Eksik</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" v-model="filtreler.tahsilat.tamam" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <span class="text-sm text-gray-800">Tamamlanmış</span>
              </label>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-2">Maliyet Durumu</label>
            <div class="flex flex-col space-y-2">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" v-model="filtreler.maliyet.girilmemis" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <span class="text-sm text-gray-800">Girilmemiş</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" v-model="filtreler.maliyet.girilmis" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <span class="text-sm text-gray-800">Girilmiş</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="th-style">İş Emri No</th>
            <th @click="siralamayiDegistir('siparis_tarihi')" class="th-style cursor-pointer hover:bg-gray-200">
              <SiralamaIcon kolon="siparis_tarihi" :aktifKolon="sortBy" :yon="sortDirection" />
              <span>Sipariş Tarihi</span>
            </th>
            <th class="th-style">Müşteri Unvanı</th>
            <th @click="siralamayiDegistir('fatura_no')" class="th-style cursor-pointer hover:bg-gray-200">
              <SiralamaIcon kolon="fatura_no" :aktifKolon="sortBy" :yon="sortDirection" />
              <span>Fatura No</span>
            </th>
            <th @click="siralamayiDegistir('toplam_tutar')" class="th-style text-right cursor-pointer hover:bg-gray-200">
              <SiralamaIcon kolon="toplam_tutar" :aktifKolon="sortBy" :yon="sortDirection" />
              <span>Toplam Tutar</span>
            </th>
            <th class="th-style text-right">Kalan Bakiye</th>
            <th class="th-style">Durum</th>
            <th class="th-style text-center">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="8" class="text-center py-8 text-gray-500">Yükleniyor...</td></tr>
          <tr v-else-if="!gosterilecekIsEmirleri || gosterilecekIsEmirleri.length === 0"><td colspan="8" class="text-center py-8 text-gray-500">Filtre kriterlerine uygun iş emri bulunamadı.</td></tr>
          <tr v-else v-for="isEmri in gosterilecekIsEmirleri" :key="isEmri.id">
            <td class="td-style">
              <span class="font-mono font-semibold text-indigo-600">
                {{ isEmri.numara || 'N/A' }}
              </span>
            </td>
            <td class="td-style">{{ formatTarih(isEmri.siparis_tarihi) }}</td>
            <td class="td-style font-medium text-gray-800">{{ isEmri.musteriler ? isEmri.musteriler.unvan : 'Müşteri Bulunamadı' }}</td>
            <td class="td-style font-mono">{{ isEmri.fatura_no || '-' }}</td>
            <td class="td-style text-right font-semibold">{{ formatPara(isEmri.toplam_tutar) }}</td>
            <td class="td-style text-right font-semibold" :class="isEmri.kalan_bakiye > 0 ? 'text-red-600' : 'text-green-600'">
              {{ formatPara(isEmri.kalan_bakiye) }}
            </td>
            <td class="td-style">
              <span class="px-2 py-1 font-semibold leading-tight rounded-full text-xs" 
                    :class="getDurumRenk(isEmri.durum)">
                {{ isEmri.durum }}
              </span>
            </td>
            <td class="td-style text-center">
              <div class="flex item-center justify-center space-x-2">
                <RouterLink :to="`/app/is-emirleri/${isEmri.id}`" class="text-blue-600 hover:text-blue-800 font-semibold">Görüntüle</RouterLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.th-style { @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider; }
.td-style { @apply px-5 py-5 border-b border-gray-200 bg-white text-sm; }
</style>

<script setup>
import { ref, onMounted, computed, defineAsyncComponent, reactive } from 'vue';
import { RouterLink } from 'vue-router';
import { supabase } from '../supabase.js';

const SiralamaIcon = defineAsyncComponent(() => 
  Promise.resolve({
    props: ['kolon', 'aktifKolon', 'yon'],
    template: `
      <div class="inline-flex items-center">
        <div class="inline-block w-4 h-4 mr-1 text-gray-400">
          <svg v-if="aktifKolon === kolon && yon === 'asc'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
          <svg v-else-if="aktifKolon === kolon && yon === 'desc'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>`
  })
);

const tumIsEmirleri = ref([]);
const loading = ref(true);
const sortBy = ref('siparis_tarihi');
const sortDirection = ref('desc');
const aramaMetni = ref('');

const filtreler = reactive({
  durum: {
    acik: true,
    kapali: false,
  },
  fatura: {
    kesilmemis: false,
    kesilmis: false,
  },
  tahsilat: {
    eksik: false,
    tamam: false,
  },
  maliyet: {
    girilmemis: false,
    girilmis: false,
  }
});

const gosterilecekIsEmirleri = computed(() => {
  let filtrelenmisListe = [...tumIsEmirleri.value];

  // 1. Ana Durum Filtreleri
  const { acik, kapali } = filtreler.durum;
  if (acik && !kapali) {
    filtrelenmisListe = filtrelenmisListe.filter(ie => ie.durum === 'Açık');
  } else if (!acik && kapali) {
    filtrelenmisListe = filtrelenmisListe.filter(ie => ie.durum === 'Kapalı');
  } else if (!acik && !kapali) {
    return []; // Hiçbir durum seçili değilse boş göster
  } // Her ikisi de seçiliyse filtreleme yapma, tümünü göster

  // 2. Alt Kategori Filtreleri
  const { fatura, tahsilat, maliyet } = filtreler;
  // Fatura
  if (fatura.kesilmemis && !fatura.kesilmis) {
    filtrelenmisListe = filtrelenmisListe.filter(ie => !ie.fatura_no);
  } else if (!fatura.kesilmemis && fatura.kesilmis) {
    filtrelenmisListe = filtrelenmisListe.filter(ie => ie.fatura_no);
  }
  // Tahsilat
  if (tahsilat.eksik && !tahsilat.tamam) {
    filtrelenmisListe = filtrelenmisListe.filter(ie => ie.kalan_bakiye > 0);
  } else if (!tahsilat.eksik && tahsilat.tamam) {
    filtrelenmisListe = filtrelenmisListe.filter(ie => ie.kalan_bakiye <= 0);
  }
  // Maliyet
  if (maliyet.girilmemis && !maliyet.girilmis) {
    filtrelenmisListe = filtrelenmisListe.filter(ie => !ie.maliyet || ie.maliyet === 0);
  } else if (!maliyet.girilmemis && maliyet.girilmis) {
    filtrelenmisListe = filtrelenmisListe.filter(ie => ie.maliyet > 0);
  }

  // 3. Arama Metni
  if (aramaMetni.value.length > 2) {
    const arama = aramaMetni.value.toLowerCase();
    filtrelenmisListe = filtrelenmisListe.filter(ie => 
      (ie.musteriler?.unvan?.toLowerCase().includes(arama)) ||
      (ie.numara?.toString().toLowerCase().includes(arama))
    );
  }
  
  sirala(filtrelenmisListe);
  return filtrelenmisListe;
});

const siralamayiDegistir = (kolonKey) => {
  if (sortBy.value === kolonKey) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = kolonKey;
    sortDirection.value = 'desc';
  }
};

const sirala = (liste) => {
  liste.sort((a, b) => {
    let valA = a[sortBy.value];
    let valB = b[sortBy.value];
    if (sortBy.value === 'siparis_tarihi') {
      valA = new Date(valA);
      valB = new Date(valB);
    }
    if (valA === null || valA === undefined) valA = sortDirection.value === 'asc' ? Infinity : -Infinity;
    if (valB === null || valB === undefined) valB = sortDirection.value === 'asc' ? Infinity : -Infinity;
    if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1;
    return 0;
  });
};

const getIsEmirleri = async () => {
  try {
    loading.value = true;
    const { data, error } = await supabase
      .from('is_emirleri')
      .select(`*, musteriler ( unvan )`);

    if (error) throw error;

    const zenginlestirilmisData = data.map(ie => ({
      ...ie,
      kalan_bakiye: (ie.toplam_tutar || 0) - (ie.odenen_tutar || 0)
    }));
    
    tumIsEmirleri.value = zenginlestirilmisData;
  } catch (error) {
    console.error('İş emirleri çekilirken hata oluştu:', error.message);
  } finally {
    loading.value = false;
  }
};

const formatTarih = (tarih) => {
  if (!tarih) return '-';
  return new Date(tarih).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatPara = (tutar) => {
  if (tutar === null || tutar === undefined) return '0,00 TL';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(tutar);
};

const getDurumRenk = (durum) => {
  const renkler = {
    'Açık': 'bg-green-100 text-green-800',
    'Kapalı': 'bg-gray-200 text-gray-700',
  };
  return renkler[durum] || 'bg-yellow-100 text-yellow-700';
};

onMounted(() => {
  getIsEmirleri();
});
</script>
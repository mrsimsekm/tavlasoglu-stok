<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Alacaklar</h1>
      <div class="bg-white px-6 py-3 rounded-lg shadow-md">
        <p class="text-sm text-gray-600">Toplam Alacak</p>
        <p class="text-2xl font-bold text-red-600">{{ formatParaBirimi(toplamAlacak) }}</p>
      </div>
    </div>

    <!-- FİLTRELEME ALANI -->
    <div class="bg-white shadow-md rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label-style">Müşteri Ara</label>
          <input v-model="filtreler.musteriArama" type="text" placeholder="Müşteri unvanı veya kodu..." class="form-input">
        </div>
        <div>
          <label class="label-style">Durum</label>
          <select v-model="filtreler.durum" class="form-input">
            <option :value="null">Tümü</option>
            <option value="Açık">Açık</option>
            <option value="Kısmi Ödendi">Kısmi Ödendi</option>
            <option value="Kapandı">Kapandı</option>
          </select>
        </div>
        <div class="col-span-2 flex items-end space-x-2">
          <button @click="filtreleriTemizle" class="btn-secondary flex-1">Temizle</button>
          <button @click="alacaklariGetir" class="btn-primary flex-1">Filtrele</button>
        </div>
      </div>
    </div>

    <!-- ALACAKLAR LİSTESİ -->
    <div class="bg-white shadow-md rounded-lg overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="th-style">Tarih</th>
            <th class="th-style">Müşteri</th>
            <th class="th-style">İş Emri No</th>
            <th class="th-style">Toplam Tutar</th>
            <th class="th-style">Kalan Tutar</th>
            <th class="th-style">Durum</th>
            <th class="th-style">Vade Tarihi</th>
            <th class="th-style text-center">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="text-center py-4">Yükleniyor...</td>
          </tr>
          <tr v-else-if="filtrelenmisAlacaklar.length === 0">
            <td colspan="8" class="text-center py-4 text-gray-500">
              {{ filtreler.musteriArama || filtreler.durum ? 'Filtreye uygun alacak bulunamadı.' : 'Alacak kaydı bulunmuyor.' }}
            </td>
          </tr>
          <tr v-else v-for="alacak in filtrelenmisAlacaklar" :key="alacak.id" class="hover:bg-gray-50">
            <td class="td-style">
              <p class="text-gray-900">{{ formatTarih(alacak.olusturulma_tarihi) }}</p>
            </td>
            <td class="td-style">
              <p class="text-gray-900 font-semibold">{{ alacak.musteriler?.unvan || '-' }}</p>
              <p class="text-xs text-gray-500">{{ alacak.musteriler?.musteri_kodu || '-' }}</p>
            </td>
            <td class="td-style">
              <p class="text-blue-600 font-mono">{{ alacak.is_emri_id?.slice(0, 8) || '-' }}</p>
            </td>
            <td class="td-style">
              <p class="text-gray-900 font-semibold">{{ formatParaBirimi(alacak.tutar) }}</p>
            </td>
            <td class="td-style">
              <p :class="alacak.kalan_tutar > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'">
                {{ formatParaBirimi(alacak.kalan_tutar) }}
              </p>
            </td>
            <td class="td-style">
              <span :class="getDurumRenk(alacak.durum)">
                {{ alacak.durum }}
              </span>
            </td>
            <td class="td-style">
              <p class="text-gray-700">{{ alacak.vade_tarihi ? formatTarih(alacak.vade_tarihi) : '-' }}</p>
            </td>
            <td class="td-style text-center">
              <div class="flex item-center justify-center space-x-2">
                <button 
                  v-if="alacak.durum !== 'Kapandı'" 
                  @click="tahsilatModaliniAc(alacak)" 
                  class="text-green-500 hover:text-green-700"
                  title="Tahsilat Yap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button 
                  @click="odemeleriniGor(alacak)" 
                  class="text-blue-500 hover:text-blue-700"
                  title="Ödeme Geçmişi"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- TAHSİLAT MODAL -->
    <BaseModal :show="tahsilatModalGoster" @close="tahsilatModalGoster = false">
      <template #header>Alacak Tahsilatı</template>
      <template #body>
        <div v-if="aktifAlacak" class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Müşteri</p>
            <p class="text-lg font-bold">{{ aktifAlacak.musteriler?.unvan }}</p>
            <div class="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500">Toplam Alacak</p>
                <p class="text-md font-semibold">{{ formatParaBirimi(aktifAlacak.tutar) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Kalan Alacak</p>
                <p class="text-md font-bold text-red-600">{{ formatParaBirimi(aktifAlacak.kalan_tutar) }}</p>
              </div>
            </div>
          </div>

          <div>
            <label class="label-style">Tahsilat Tutarı (*)</label>
            <input v-model.number="tahsilatForm.tutar" type="number" step="0.01" :max="aktifAlacak.kalan_tutar" class="form-input" placeholder="Tahsil edilecek tutar">
            <p class="text-xs text-gray-500 mt-1">Maksimum: {{ formatParaBirimi(aktifAlacak.kalan_tutar) }}</p>
          </div>

          <div>
            <label class="label-style">Ödeme Yöntemi (*)</label>
            <select v-model="tahsilatForm.yontem" class="form-input">
              <option value="">Seçiniz</option>
              <option value="Nakit">Nakit</option>
              <option value="Kredi Kartı">Kredi Kartı</option>
              <option value="Havale/EFT">Havale/EFT</option>
              <option value="Çek">Çek</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>

          <div>
            <label class="label-style">Notlar</label>
            <textarea v-model="tahsilatForm.notlar" rows="3" class="form-input" placeholder="İsteğe bağlı notlar..."></textarea>
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="tahsilatModalGoster = false" class="btn-secondary">İptal</button>
        <button @click="tahsilatYap" :disabled="tahsilatYapiliyor" class="btn-primary ml-2">
          {{ tahsilatYapiliyor ? 'İşleniyor...' : 'Tahsil Et' }}
        </button>
      </template>
    </BaseModal>

    <!-- ÖDEME GEÇMİŞİ MODAL -->
    <BaseModal :show="odemelerModalGoster" @close="odemelerModalGoster = false">
      <template #header>Ödeme Geçmişi</template>
      <template #body>
        <div v-if="aktifAlacak" class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Müşteri</p>
            <p class="text-lg font-bold">{{ aktifAlacak.musteriler?.unvan }}</p>
          </div>

          <div v-if="loadingOdemeler" class="text-center py-4">
            <p class="text-gray-500">Yükleniyor...</p>
          </div>
          <div v-else-if="odemeler.length === 0" class="text-center py-8 text-gray-500">
            Henüz ödeme kaydı bulunmuyor.
          </div>
          <div v-else class="space-y-2">
            <div v-for="odeme in odemeler" :key="odeme.id" class="border rounded-lg p-3 hover:bg-gray-50">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-semibold text-green-600">{{ formatParaBirimi(odeme.tutar) }}</p>
                  <p class="text-sm text-gray-600">{{ odeme.yontem }}</p>
                  <p class="text-xs text-gray-500">{{ formatTarih(odeme.olusturulma_tarihi) }}</p>
                </div>
                <div class="text-right">
                  <p v-if="odeme.notlar" class="text-xs text-gray-600 italic">{{ odeme.notlar }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="odemelerModalGoster = false" class="btn-secondary">Kapat</button>
      </template>
    </BaseModal>

  </div>
</template>

<style scoped>
.th-style { @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider; }
.td-style { @apply px-5 py-5 border-b border-gray-200 bg-white text-sm; }
.label-style { @apply block text-sm font-medium text-gray-700; }
.form-input { @apply mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
.btn-primary { @apply bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed; }
.btn-secondary { @apply bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded; }
</style>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase.js';
import { useUserStore } from '../stores/userStore.js';
import BaseModal from '../components/BaseModal.vue';
import { useLoading } from '../composables/useLoading.js';

const { isLoading: tahsilatYapiliyor, withLoading } = useLoading();
const userStore = useUserStore();
const loading = ref(false);
//const tahsilatYapiliyor = ref(false);
//const loadingOdemeler = ref(false);
const { isLoading: loadingOdemeler, withLoading: odemelerWithLoading } = useLoading(); // ✅
const alacaklar = ref([]);
const odemeler = ref([]);
const tahsilatModalGoster = ref(false);
const odemelerModalGoster = ref(false);
const aktifAlacak = ref(null);

const filtreler = ref({
  musteriArama: '',
  durum: null
});

const tahsilatForm = ref({
  tutar: 0,
  yontem: '',
  notlar: ''
});

// Alacakları getir
const alacaklariGetir = async () => {
  loading.value = true;
  try {
    let query = supabase
      .from('alacaklar')
      .select(`
        *,
        musteriler (musteri_kodu, unvan, telefon)
      `)
      .order('olusturulma_tarihi', { ascending: false });

    if (filtreler.value.durum) {
      query = query.eq('durum', filtreler.value.durum);
    }

    const { data, error } = await query;
    if (error) throw error;
    alacaklar.value = data || [];
  } catch (error) {
    console.error('Alacaklar çekilirken hata:', error.message);
    alert('Hata: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// Filtrelenmiş alacaklar
const filtrelenmisAlacaklar = computed(() => {
  if (!filtreler.value.musteriArama) return alacaklar.value;
  
  const arama = filtreler.value.musteriArama.toLowerCase();
  return alacaklar.value.filter(a => 
    a.musteriler?.unvan?.toLowerCase().includes(arama) ||
    a.musteriler?.musteri_kodu?.toLowerCase().includes(arama)
  );
});

// Toplam alacak hesapla
const toplamAlacak = computed(() => {
  return filtrelenmisAlacaklar.value
    .filter(a => a.durum !== 'Kapandı')
    .reduce((toplam, a) => toplam + parseFloat(a.kalan_tutar || 0), 0);
});

// Tahsilat modalını aç
const tahsilatModaliniAc = (alacak) => {
  aktifAlacak.value = alacak;
  tahsilatForm.value = {
    tutar: alacak.kalan_tutar,
    yontem: '',
    notlar: ''
  };
  tahsilatModalGoster.value = true;
};

// Tahsilat yap

const tahsilatYap = async () => {
  if (!tahsilatForm.value.tutar || tahsilatForm.value.tutar <= 0) {
    alert('Lütfen geçerli bir tutar giriniz.');
    return;
  }

  if (!tahsilatForm.value.yontem) {
    alert('Lütfen ödeme yöntemi seçiniz.');
    return;
  }

  if (tahsilatForm.value.tutar > aktifAlacak.value.kalan_tutar) {
    alert('Tahsilat tutarı kalan tutardan fazla olamaz!');
    return;
  }

  await withLoading(async () => {
    const { data, error } = await supabase.rpc('alacak_tahsil_et', {
      p_alacak_id: aktifAlacak.value.id,
      p_tutar: tahsilatForm.value.tutar,
      p_yontem: tahsilatForm.value.yontem,
      p_notlar: tahsilatForm.value.notlar || null,
      p_kullanici_id: userStore.user?.id || null
    });

    if (error) throw error;

    if (data && !data.success) {
      throw new Error(data.message || 'Tahsilat başarısız');
    }

    alert('Tahsilat başarıyla kaydedildi!');
    tahsilatModalGoster.value = false;
    await alacaklariGetir();
  });
};

// Ödemeleri gör

const odemeleriniGor = async (alacak) => {
  aktifAlacak.value = alacak;
  odemelerModalGoster.value = true;

  await odemelerWithLoading(async () => {
    const { data, error } = await supabase
      .from('alacak_odemeleri')
      .select('*')
      .eq('alacak_id', alacak.id)
      .order('olusturulma_tarihi', { ascending: false });

    if (error) throw error;
    odemeler.value = data || [];
  });
};

// Filtreleri temizle
const filtreleriTemizle = () => {
  filtreler.value = {
    musteriArama: '',
    durum: null
  };
  alacaklariGetir();
};

// Durum rengi
const getDurumRenk = (durum) => {
  const renkler = {
    'Açık': 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800',
    'Kısmi Ödendi': 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800',
    'Kapandı': 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'
  };
  return renkler[durum] || '';
};

// Tarih formatlama
const formatTarih = (tarih) => {
  if (!tarih) return '-';
  const date = new Date(tarih);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Para formatı
const formatParaBirimi = (tutar) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2
  }).format(tutar || 0);
};

onMounted(() => {
  alacaklariGetir();
});
</script>
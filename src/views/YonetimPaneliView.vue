<!-- 
  BU VERSİYON: Edge Function gerektirmez, direkt Supabase client kullanır
  NOT: Kullanıcı email bilgilerini görüntüleyemez, şifre sıfırlama e-posta ile olur
  Daha basit ama bazı özellikler sınırlı
-->

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Yönetim Paneli</h1>
      <p class="text-gray-600 mt-2">Sistem ayarlarını yönetin</p>
    </div>

    <!-- TAB MENÜ -->
    <div class="bg-white rounded-lg shadow-md mb-6">
      <div class="border-b border-gray-200">
        <nav class="flex -mb-px">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="aktifTab = tab.id"
            :class="[
              'py-4 px-6 text-sm font-medium border-b-2 transition-colors',
              aktifTab === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- TAB İÇERİKLERİ -->
      <div class="p-6">
        <!-- KULLANICILAR TAB -->
        <div v-if="aktifTab === 'kullanicilar'">
          <div class="mb-4">
            <h2 class="text-xl font-semibold mb-2">Kullanıcı Yönetimi</h2>
            <!--<div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
               <p class="text-sm text-blue-700">
              </p> 
            </div>-->
          </div>

          <div v-if="kullanicilarYukleniyor" class="text-center py-4">Yükleniyor...</div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad Soyad</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="kullanici in kullanicilar" :key="kullanici.id">
                  <td class="px-6 py-4 whitespace-nowrap">{{ kullanici.tam_ad || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getRolRenk(kullanici.rol)" class="px-2 py-1 text-xs font-semibold rounded">
                      {{ rolIsmi(kullanici.rol) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <button @click="kullaniciDuzenle(kullanici)" class="text-blue-600 hover:text-blue-800 text-sm">
                      Düzenle
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TEDARİKÇİLER TAB -->
        <div v-if="aktifTab === 'tedarikciler'">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Tedarikçi Yönetimi</h2>
            <button @click="yeniTedarikciModalAc" class="btn-primary">
              + Yeni Tedarikçi
            </button>
          </div>

          <div v-if="tedarikcilerYukleniyor" class="text-center py-4">Yükleniyor...</div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tedarikçi Adı</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İlgili Kişi</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="tedarikci in tedarikciler" :key="tedarikci.id">
                  <td class="px-6 py-4 whitespace-nowrap font-semibold">{{ tedarikci.ad }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ tedarikci.ilgili_kisi || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ tedarikci.telefon || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-center space-x-2">
                    <button @click="tedarikciDuzenle(tedarikci)" class="text-blue-600 hover:text-blue-800 text-sm">
                      Düzenle
                    </button>
                    <button @click="tedarikciSil(tedarikci)" class="text-red-600 hover:text-red-800 text-sm">
                      Sil
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- DEPOLAR TAB -->
        <div v-if="aktifTab === 'depolar'">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Depo Yönetimi</h2>
            <button @click="yeniDepoModalAc" class="btn-primary">
              + Yeni Depo
            </button>
          </div>

          <div v-if="depolarYukleniyor" class="text-center py-4">Yükleniyor...</div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Depo Adı</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adres</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="depo in depolar" :key="depo.id">
                  <td class="px-6 py-4 whitespace-nowrap font-semibold">{{ depo.ad }}</td>
                  <td class="px-6 py-4">{{ depo.adres || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-center space-x-2">
                    <button @click="depoDuzenle(depo)" class="text-blue-600 hover:text-blue-800 text-sm">
                      Düzenle
                    </button>
                    <button @click="depoSil(depo)" class="text-red-600 hover:text-red-800 text-sm">
                      Sil
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- KULLANICI MODAL -->
    <BaseModal :show="kullaniciModalGoster" @close="kullaniciModalKapat">
      <template #header>Kullanıcı Düzenle</template>
      <template #body>
        <div class="space-y-4">
          <div>
            <label class="label-style">Ad Soyad (*)</label>
            <input v-model="kullaniciForm.tam_ad" type="text" class="form-input">
          </div>
          <div>
            <label class="label-style">Rol (*)</label>
            <select v-model="kullaniciForm.rol" class="form-input">
              <option value="satisci">Satışçı</option>
              <option value="muhasebeci">Muhasebeci</option>
              <option value="yonetici">Yönetici</option>
            </select>
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="kullaniciModalKapat" class="btn-secondary">İptal</button>
        <button @click="kullaniciKaydet" :disabled="kullaniciKayitYapiliyor" class="btn-primary ml-2">
          {{ kullaniciKayitYapiliyor ? 'Kaydediliyor...' : 'Güncelle' }}
        </button>
      </template>
    </BaseModal>

    <!-- TEDARİKÇİ MODAL -->
    <BaseModal :show="tedarikciModalGoster" @close="tedarikciModalKapat">
      <template #header>{{ tedarikciDuzenlemeModu ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi Ekle' }}</template>
      <template #body>
        <div class="space-y-4">
          <div>
            <label class="label-style">Tedarikçi Adı (*)</label>
            <input v-model="tedarikciForm.ad" type="text" class="form-input">
          </div>
          <div>
            <label class="label-style">İlgili Kişi</label>
            <input v-model="tedarikciForm.ilgili_kisi" type="text" class="form-input">
          </div>
          <div>
            <label class="label-style">Telefon</label>
            <input v-model="tedarikciForm.telefon" type="tel" class="form-input">
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="tedarikciModalKapat" class="btn-secondary">İptal</button>
        <button @click="tedarikciKaydet" :disabled="tedarikciKayitYapiliyor" class="btn-primary ml-2">
          {{ tedarikciKayitYapiliyor ? 'Kaydediliyor...' : (tedarikciDuzenlemeModu ? 'Güncelle' : 'Ekle') }}
        </button>
      </template>
    </BaseModal>

    <!-- DEPO MODAL -->
    <BaseModal :show="depoModalGoster" @close="depoModalKapat">
      <template #header>{{ depoDuzenlemeModu ? 'Depo Düzenle' : 'Yeni Depo Ekle' }}</template>
      <template #body>
        <div class="space-y-4">
          <div>
            <label class="label-style">Depo Adı (*)</label>
            <input v-model="depoForm.ad" type="text" class="form-input">
          </div>
          <div>
            <label class="label-style">Adres</label>
            <textarea v-model="depoForm.adres" rows="3" class="form-input"></textarea>
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="depoModalKapat" class="btn-secondary">İptal</button>
        <button @click="depoKaydet" :disabled="depoKayitYapiliyor" class="btn-primary ml-2">
          {{ depoKayitYapiliyor ? 'Kaydediliyor...' : (depoDuzenlemeModu ? 'Güncelle' : 'Ekle') }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.label-style { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
.btn-primary { @apply bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed; }
.btn-secondary { @apply bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded; }
</style>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase.js';
import BaseModal from '../components/BaseModal.vue';

const tabs = [
  { id: 'kullanicilar', name: 'Kullanıcılar' },
  { id: 'tedarikciler', name: 'Tedarikçiler' },
  { id: 'depolar', name: 'Depolar' }
];

const aktifTab = ref('kullanicilar');

// KULLANICILAR
const kullanicilar = ref([]);
const kullanicilarYukleniyor = ref(false);
const kullaniciModalGoster = ref(false);
const kullaniciKayitYapiliyor = ref(false);
const kullaniciForm = ref({
  id: null,
  tam_ad: '',
  rol: 'satisci'
});

// TEDARİKÇİLER  
const tedarikciler = ref([]);
const tedarikcilerYukleniyor = ref(false);
const tedarikciModalGoster = ref(false);
const tedarikciDuzenlemeModu = ref(false);
const tedarikciKayitYapiliyor = ref(false);
const tedarikciForm = ref({
  id: null,
  ad: '',
  ilgili_kisi: '',
  telefon: ''
});

// DEPOLAR
const depolar = ref([]);
const depolarYukleniyor = ref(false);
const depoModalGoster = ref(false);
const depoDuzenlemeModu = ref(false);
const depoKayitYapiliyor = ref(false);
const depoForm = ref({
  id: null,
  ad: '',
  adres: ''
});

const rolIsmi = (rol) => {
  const roller = {
    'satisci': 'Satışçı',
    'muhasebeci': 'Muhasebeci',
    'yonetici': 'Yönetici'
  };
  return roller[rol] || rol;
};

const getRolRenk = (rol) => {
  const renkler = {
    'satisci': 'bg-blue-100 text-blue-800',
    'muhasebeci': 'bg-green-100 text-green-800',
    'yonetici': 'bg-purple-100 text-purple-800'
  };
  return renkler[rol] || 'bg-gray-100 text-gray-800';
};

// KULLANICI FONKSİYONLARI
const kullanicilariYukle = async () => {
  kullanicilarYukleniyor.value = true;
  try {
    const { data, error } = await supabase
      .from('profiller')
      .select('id, tam_ad, rol')
      .order('tam_ad');
    
    if (error) throw error;
    kullanicilar.value = data || [];
  } catch (error) {
    console.error('Kullanıcılar yüklenirken hata:', error);
    alert('Kullanıcılar yüklenirken hata: ' + error.message);
  } finally {
    kullanicilarYukleniyor.value = false;
  }
};

const kullaniciDuzenle = (kullanici) => {
  kullaniciForm.value = {
    id: kullanici.id,
    tam_ad: kullanici.tam_ad || '',
    rol: kullanici.rol
  };
  kullaniciModalGoster.value = true;
};

const kullaniciKaydet = async () => {
  if (!kullaniciForm.value.tam_ad || !kullaniciForm.value.rol) {
    alert('Lütfen tüm zorunlu alanları doldurun!');
    return;
  }

  kullaniciKayitYapiliyor.value = true;
  try {
    const { error } = await supabase
      .from('profiller')
      .update({
        tam_ad: kullaniciForm.value.tam_ad,
        rol: kullaniciForm.value.rol
      })
      .eq('id', kullaniciForm.value.id);

    if (error) throw error;
    alert('Kullanıcı başarıyla güncellendi!');
    kullaniciModalKapat();
    await kullanicilariYukle();
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    alert('Hata: ' + error.message);
  } finally {
    kullaniciKayitYapiliyor.value = false;
  }
};

const kullaniciModalKapat = () => {
  kullaniciModalGoster.value = false;
  kullaniciForm.value = {
    id: null,
    tam_ad: '',
    rol: 'satisci'
  };
};

// TEDARİKÇİ FONKSİYONLARI
const tedarikcileriYukle = async () => {
  tedarikcilerYukleniyor.value = true;
  try {
    const { data, error } = await supabase
      .from('tedarikciler')
      .select('*')
      .order('ad');
    
    if (error) throw error;
    tedarikciler.value = data || [];
  } catch (error) {
    console.error('Tedarikçiler yüklenirken hata:', error);
    alert('Tedarikçiler yüklenirken hata: ' + error.message);
  } finally {
    tedarikcilerYukleniyor.value = false;
  }
};

const yeniTedarikciModalAc = () => {
  tedarikciDuzenlemeModu.value = false;
  tedarikciForm.value = {
    id: null,
    ad: '',
    ilgili_kisi: '',
    telefon: ''
  };
  tedarikciModalGoster.value = true;
};

const tedarikciDuzenle = (tedarikci) => {
  tedarikciDuzenlemeModu.value = true;
  tedarikciForm.value = { ...tedarikci };
  tedarikciModalGoster.value = true;
};

const tedarikciKaydet = async () => {
  if (!tedarikciForm.value.ad) {
    alert('Tedarikçi adı zorunludur!');
    return;
  }

  tedarikciKayitYapiliyor.value = true;
  try {
    if (tedarikciDuzenlemeModu.value) {
      const { error } = await supabase
        .from('tedarikciler')
        .update({
          ad: tedarikciForm.value.ad,
          ilgili_kisi: tedarikciForm.value.ilgili_kisi,
          telefon: tedarikciForm.value.telefon
        })
        .eq('id', tedarikciForm.value.id);

      if (error) throw error;
      alert('Tedarikçi başarıyla güncellendi!');
    } else {
      const { error } = await supabase
        .from('tedarikciler')
        .insert([{
          ad: tedarikciForm.value.ad,
          ilgili_kisi: tedarikciForm.value.ilgili_kisi,
          telefon: tedarikciForm.value.telefon
        }]);

      if (error) throw error;
      alert('Tedarikçi başarıyla eklendi!');
    }

    tedarikciModalKapat();
    await tedarikcileriYukle();
  } catch (error) {
    console.error('Tedarikçi kaydetme hatası:', error);
    alert('Hata: ' + error.message);
  } finally {
    tedarikciKayitYapiliyor.value = false;
  }
};

const tedarikciSil = async (tedarikci) => {
  if (!confirm(`"${tedarikci.ad}" tedarikçisini silmek istediğinizden emin misiniz?`)) {
    return;
  }

  try {
    const { error } = await supabase
      .from('tedarikciler')
      .delete()
      .eq('id', tedarikci.id);

    if (error) throw error;
    alert('Tedarikçi başarıyla silindi!');
    await tedarikcileriYukle();
  } catch (error) {
    console.error('Tedarikçi silme hatası:', error);
    alert('Hata: ' + error.message);
  }
};

const tedarikciModalKapat = () => {
  tedarikciModalGoster.value = false;
  tedarikciForm.value = {
    id: null,
    ad: '',
    ilgili_kisi: '',
    telefon: ''
  };
};

// DEPO FONKSİYONLARI
const depolariYukle = async () => {
  depolarYukleniyor.value = true;
  try {
    const { data, error } = await supabase
      .from('depolar')
      .select('*')
      .order('ad');
    
    if (error) throw error;
    depolar.value = data || [];
  } catch (error) {
    console.error('Depolar yüklenirken hata:', error);
    alert('Depolar yüklenirken hata: ' + error.message);
  } finally {
    depolarYukleniyor.value = false;
  }
};

const yeniDepoModalAc = () => {
  depoDuzenlemeModu.value = false;
  depoForm.value = {
    id: null,
    ad: '',
    adres: ''
  };
  depoModalGoster.value = true;
};

const depoDuzenle = (depo) => {
  depoDuzenlemeModu.value = true;
  depoForm.value = { ...depo };
  depoModalGoster.value = true;
};

const depoKaydet = async () => {
  if (!depoForm.value.ad) {
    alert('Depo adı zorunludur!');
    return;
  }

  depoKayitYapiliyor.value = true;
  try {
    if (depoDuzenlemeModu.value) {
      const { error } = await supabase
        .from('depolar')
        .update({
          ad: depoForm.value.ad,
          adres: depoForm.value.adres
        })
        .eq('id', depoForm.value.id);

      if (error) throw error;
      alert('Depo başarıyla güncellendi!');
    } else {
      const { error } = await supabase
        .from('depolar')
        .insert([{
          ad: depoForm.value.ad,
          adres: depoForm.value.adres
        }]);

      if (error) throw error;
      alert('Depo başarıyla eklendi!');
    }

    depoModalKapat();
    await depolariYukle();
  } catch (error) {
    console.error('Depo kaydetme hatası:', error);
    alert('Hata: ' + error.message);
  } finally {
    depoKayitYapiliyor.value = false;
  }
};

const depoSil = async (depo) => {
  if (!confirm(`"${depo.ad}" deposunu silmek istediğinizden emin misiniz?`)) {
    return;
  }

  try {
    const { error } = await supabase
      .from('depolar')
      .delete()
      .eq('id', depo.id);

    if (error) throw error;
    alert('Depo başarıyla silindi!');
    await depolariYukle();
  } catch (error) {
    console.error('Depo silme hatası:', error);
    alert('Hata: ' + error.message);
  }
};

const depoModalKapat = () => {
  depoModalGoster.value = false;
  depoForm.value = {
    id: null,
    ad: '',
    adres: ''
  };
};

// SAYFA YÜKLENDİĞİNDE
onMounted(async () => {
  await kullanicilariYukle();
  await tedarikcileriYukle();
  await depolariYukle();
});
</script>
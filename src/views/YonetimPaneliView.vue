<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Yönetim Paneli</h1>

    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <!-- SEKME BAŞLIKLARI -->
      <div class="flex border-b">
        <button 
          @click="aktifSekme = 'kullanicilar'" 
          :class="['flex-1 py-4 px-6 text-center font-medium focus:outline-none', aktifSekme === 'kullanicilar' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700']"
        >
          Kullanıcılar & Roller
        </button>
        <button 
          @click="aktifSekme = 'tedarikciler'" 
          :class="['flex-1 py-4 px-6 text-center font-medium focus:outline-none', aktifSekme === 'tedarikciler' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700']"
        >
          Tedarikçi Yönetimi
        </button>
        <button 
          @click="aktifSekme = 'depolar'" 
          :class="['flex-1 py-4 px-6 text-center font-medium focus:outline-none', aktifSekme === 'depolar' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700']"
        >
          Depo Yönetimi
        </button>
        <button 
          @click="aktifSekme = 'satiscilar'" 
          :class="['flex-1 py-4 px-6 text-center font-medium focus:outline-none', aktifSekme === 'satiscilar' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700']"
        >
          Satışçı Yönetimi
        </button>
      </div>

      <!-- İÇERİK ALANI -->
      <div class="p-6">
        
        <!-- 1. KULLANICILAR SEKMESİ -->
        <div v-if="aktifSekme === 'kullanicilar'">
          <div class="overflow-x-auto">
            <table class="min-w-full leading-normal">
              <thead>
                <tr>
                  <th class="th-style">E-posta</th>
                  <th class="th-style">Ad Soyad</th>
                  <th class="th-style">Rol</th>
                  <th class="th-style text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="kullanici in kullanicilar" :key="kullanici.id">
                  <td class="td-style">{{ kullanici.email }}</td>
                  <td class="td-style">{{ kullanici.tam_ad || '-' }}</td>
                  <td class="td-style">
                    <span :class="getRolClass(kullanici.rol)">{{ kullanici.rol }}</span>
                  </td>
                  <td class="td-style text-center">
                    <button @click="rolDuzenleModaliniAc(kullanici)" class="text-indigo-600 hover:text-indigo-900 font-semibold">Düzenle</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. TEDARİKÇİLER SEKMESİ -->
        <div v-if="aktifSekme === 'tedarikciler'">
          <div class="flex justify-end mb-4">
            <button @click="tedarikciModaliniAc()" class="btn-primary">+ Yeni Tedarikçi</button>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full leading-normal">
              <thead>
                <tr>
                  <th class="th-style">Tedarikçi Adı</th>
                  <th class="th-style">İlgili Kişi</th>
                  <th class="th-style">Telefon</th>
                  <th class="th-style text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tedarikci in tedarikciler" :key="tedarikci.id">
                  <td class="td-style">{{ tedarikci.ad }}</td>
                  <td class="td-style">{{ tedarikci.ilgili_kisi || '-' }}</td>
                  <td class="td-style">{{ tedarikci.telefon || '-' }}</td>
                  <td class="td-style text-center">
                    <button @click="tedarikciModaliniAc(tedarikci)" class="text-yellow-500 hover:text-yellow-700 mr-2">Düzenle</button>
                    <button @click="tedarikciSil(tedarikci)" class="text-red-500 hover:text-red-700">Sil</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. DEPOLAR SEKMESİ -->
        <div v-if="aktifSekme === 'depolar'">
          <div class="flex justify-end mb-4">
            <button @click="depoModaliniAc()" class="btn-primary">+ Yeni Depo</button>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full leading-normal">
              <thead>
                <tr>
                  <th class="th-style">Depo Adı</th>
                  <th class="th-style">Adres</th>
                  <th class="th-style text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="depo in depolar" :key="depo.id">
                  <td class="td-style">{{ depo.ad }}</td>
                  <td class="td-style">{{ depo.adres || '-' }}</td>
                  <td class="td-style text-center">
                    <button @click="depoModaliniAc(depo)" class="text-yellow-500 hover:text-yellow-700 mr-2">Düzenle</button>
                    <button @click="depoSil(depo)" class="text-red-500 hover:text-red-700">Sil</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 4. SATIŞÇI YÖNETİMİ (YENİ) -->
        <div v-if="aktifSekme === 'satiscilar'">
          <div class="flex justify-end mb-4">
            <button @click="satisciModaliniAc()" class="btn-primary">+ Yeni Satışçı</button>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full leading-normal">
              <thead>
                <tr>
                  <th class="th-style">Satışçı Ad Soyad</th>
                  <th class="th-style">Telefon</th>
                  <th class="th-style">Durum</th>
                  <th class="th-style text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="satisci in satiscilar" :key="satisci.id" :class="{'bg-gray-50': !satisci.aktif_mi}">
                  <td class="td-style">{{ satisci.ad_soyad }}</td>
                  <td class="td-style">{{ satisci.telefon || '-' }}</td>
                  <td class="td-style">
                    <span 
                      class="px-2 py-1 text-xs rounded-full font-semibold"
                      :class="satisci.aktif_mi ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    >
                      {{ satisci.aktif_mi ? 'Aktif' : 'Pasif' }}
                    </span>
                  </td>
                  <td class="td-style text-center">
                    <button @click="satisciModaliniAc(satisci)" class="text-indigo-600 hover:text-indigo-900 font-semibold mr-2">Düzenle</button>
                    <button 
                      v-if="satisci.aktif_mi"
                      @click="satisciDurumDegistir(satisci, false)" 
                      class="text-red-500 hover:text-red-700 text-xs border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                    >
                      Pasife Al
                    </button>
                    <button 
                      v-else
                      @click="satisciDurumDegistir(satisci, true)" 
                      class="text-green-500 hover:text-green-700 text-xs border border-green-200 px-2 py-1 rounded hover:bg-green-50"
                    >
                      Aktif Et
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-xs text-gray-500 mt-4 italic">* Pasif satışçılar geçmiş kayıtlarda görünür ancak yeni iş emri oluşturulurken listede çıkmaz.</p>
        </div>

      </div>
    </div>

    <!-- MODALLAR -->
    
    <!-- Rol Düzenleme Modalı -->
    <BaseModal :show="rolModalGoster" @close="rolModalGoster = false">
      <template #header>Kullanıcı Rolü Düzenle</template>
      <template #body>
        <div class="space-y-4">
          <div>
            <label class="label-style">Kullanıcı</label>
            <p class="font-semibold">{{ seciliKullanici?.email }}</p>
          </div>
          <div>
            <label class="label-style">Ad Soyad</label>
            <input v-model="seciliKullanici.tam_ad" type="text" class="form-input">
          </div>
          <div>
            <label class="label-style">Rol</label>
            <select v-model="seciliKullanici.rol" class="form-input">
              <option value="satisci">Satışçı</option>
              <option value="muhasebeci">Muhasebeci</option>
              <option value="yonetici">Yönetici</option>
              <option value="yetkisiz">Yetkisiz</option>
            </select>
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="rolModalGoster = false" class="btn-secondary">İptal</button>
        <button @click="rolKaydet" :disabled="kayitYapiliyor" class="btn-primary ml-2">Kaydet</button>
      </template>
    </BaseModal>

    <!-- Tedarikçi Modalı -->
    <BaseModal :show="tedarikciModalGoster" @close="tedarikciModalGoster = false">
      <template #header>{{ seciliTedarikci.id ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi' }}</template>
      <template #body>
        <div class="space-y-4">
          <div><label class="label-style">Tedarikçi Adı (*)</label><input v-model="seciliTedarikci.ad" type="text" class="form-input"></div>
          <div><label class="label-style">İlgili Kişi</label><input v-model="seciliTedarikci.ilgili_kisi" type="text" class="form-input"></div>
          <div><label class="label-style">Telefon</label><input v-model="seciliTedarikci.telefon" type="text" class="form-input"></div>
        </div>
      </template>
      <template #footer>
        <button @click="tedarikciModalGoster = false" class="btn-secondary">İptal</button>
        <button @click="tedarikciKaydet" :disabled="kayitYapiliyor" class="btn-primary ml-2">Kaydet</button>
      </template>
    </BaseModal>

    <!-- Depo Modalı -->
    <BaseModal :show="depoModalGoster" @close="depoModalGoster = false">
      <template #header>{{ seciliDepo.id ? 'Depo Düzenle' : 'Yeni Depo' }}</template>
      <template #body>
        <div class="space-y-4">
          <div><label class="label-style">Depo Adı (*)</label><input v-model="seciliDepo.ad" type="text" class="form-input"></div>
          <div><label class="label-style">Adres</label><textarea v-model="seciliDepo.adres" rows="3" class="form-input"></textarea></div>
        </div>
      </template>
      <template #footer>
        <button @click="depoModalGoster = false" class="btn-secondary">İptal</button>
        <button @click="depoKaydet" :disabled="kayitYapiliyor" class="btn-primary ml-2">Kaydet</button>
      </template>
    </BaseModal>

    <!-- SATIŞÇI MODALI (YENİ) -->
    <BaseModal :show="satisciModalGoster" @close="satisciModalGoster = false">
      <template #header>{{ seciliSatisci.id ? 'Satışçı Düzenle' : 'Yeni Satışçı' }}</template>
      <template #body>
        <div class="space-y-4">
          <div><label class="label-style">Ad Soyad (*)</label><input v-model="seciliSatisci.ad_soyad" type="text" class="form-input"></div>
          <div><label class="label-style">Telefon</label><input v-model="seciliSatisci.telefon" type="text" class="form-input"></div>
          <div v-if="seciliSatisci.id">
            <label class="flex items-center mt-2 cursor-pointer">
              <input type="checkbox" v-model="seciliSatisci.aktif_mi" class="form-checkbox h-5 w-5 text-indigo-600">
              <span class="ml-2 text-gray-700">Aktif Satışçı</span>
            </label>
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="satisciModalGoster = false" class="btn-secondary">İptal</button>
        <button @click="satisciKaydet" :disabled="kayitYapiliyor" class="btn-primary ml-2">Kaydet</button>
      </template>
    </BaseModal>

  </div>
</template>

<style scoped>
.th-style { @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider; }
.td-style { @apply px-5 py-5 border-b border-gray-200 bg-white text-sm; }
.label-style { @apply block text-sm font-medium text-gray-700; }
.form-input { @apply mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
.btn-primary { @apply bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400; }
.btn-secondary { @apply bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded; }
</style>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase.js';
import BaseModal from '../components/BaseModal.vue';
import { useLoading } from '../composables/useLoading.js';

const { isLoading: kayitYapiliyor, withLoading } = useLoading();
const aktifSekme = ref('kullanicilar');

const kullanicilar = ref([]);
const tedarikciler = ref([]);
const depolar = ref([]);
const satiscilar = ref([]); // YENİ

// Modal Kontrolleri
const rolModalGoster = ref(false);
const tedarikciModalGoster = ref(false);
const depoModalGoster = ref(false);
const satisciModalGoster = ref(false); // YENİ

// Seçili Veriler
const seciliKullanici = ref({});
const seciliTedarikci = ref({});
const seciliDepo = ref({});
const seciliSatisci = ref({}); // YENİ

// Veri Çekme Fonksiyonları
const getKullanicilar = async () => {
  const { data, error } = await supabase.from('profiller').select('*').order('email');
  if (!error) kullanicilar.value = data;
};

const getTedarikciler = async () => {
  const { data, error } = await supabase.from('tedarikciler').select('*').order('ad');
  if (!error) tedarikciler.value = data;
};

const getDepolar = async () => {
  const { data, error } = await supabase.from('depolar').select('*').order('ad');
  if (!error) depolar.value = data;
};

const getSatiscilar = async () => {
  // Hepsini çek (Aktif + Pasif)
  const { data, error } = await supabase.from('satiscilar').select('*').order('ad_soyad');
  if (!error) satiscilar.value = data;
};

onMounted(() => {
  getKullanicilar();
  getTedarikciler();
  getDepolar();
  getSatiscilar();
});

// --- KULLANICI İŞLEMLERİ ---
const rolDuzenleModaliniAc = (kullanici) => {
  seciliKullanici.value = { ...kullanici };
  rolModalGoster.value = true;
};

const rolKaydet = async () => {
  await withLoading(async () => {
    const { error } = await supabase
      .from('profiller')
      .update({ rol: seciliKullanici.value.rol, tam_ad: seciliKullanici.value.tam_ad })
      .eq('id', seciliKullanici.value.id);
    
    if (error) throw error;
    await getKullanicilar();
    rolModalGoster.value = false;
  });
};

const getRolClass = (rol) => {
  const map = {
    'yonetici': 'bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold',
    'satisci': 'bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold',
    'muhasebeci': 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold',
    'yetkisiz': 'bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold'
  };
  return map[rol] || '';
};

// --- TEDARİKÇİ İŞLEMLERİ ---
const tedarikciModaliniAc = (tedarikci = null) => {
  seciliTedarikci.value = tedarikci ? { ...tedarikci } : { ad: '', ilgili_kisi: '', telefon: '' };
  tedarikciModalGoster.value = true;
};

const tedarikciKaydet = async () => {
  if (!seciliTedarikci.value.ad) return alert('Tedarikçi adı zorunludur');
  
  await withLoading(async () => {
    const { id, ...data } = seciliTedarikci.value;
    if (id) {
      await supabase.from('tedarikciler').update(data).eq('id', id);
    } else {
      await supabase.from('tedarikciler').insert([data]);
    }
    await getTedarikciler();
    tedarikciModalGoster.value = false;
  });
};

const tedarikciSil = async (tedarikci) => {
  if (confirm('Bu tedarikçiyi silmek istediğinize emin misiniz?')) {
    const { error } = await supabase.from('tedarikciler').delete().eq('id', tedarikci.id);
    if (error) alert('Silinemedi. Bu tedarikçiye bağlı kayıtlar olabilir.');
    else await getTedarikciler();
  }
};

// --- DEPO İŞLEMLERİ ---
const depoModaliniAc = (depo = null) => {
  seciliDepo.value = depo ? { ...depo } : { ad: '', adres: '' };
  depoModalGoster.value = true;
};

const depoKaydet = async () => {
  if (!seciliDepo.value.ad) return alert('Depo adı zorunludur');
  
  await withLoading(async () => {
    const { id, ...data } = seciliDepo.value;
    if (id) {
      await supabase.from('depolar').update(data).eq('id', id);
    } else {
      await supabase.from('depolar').insert([data]);
    }
    await getDepolar();
    depoModalGoster.value = false;
  });
};

const depoSil = async (depo) => {
  if (confirm('Bu depoyu silmek istediğinize emin misiniz?')) {
    const { error } = await supabase.from('depolar').delete().eq('id', depo.id);
    if (error) alert('Silinemedi. Bu depoda stok hareketleri olabilir.');
    else await getDepolar();
  }
};

// --- SATIŞÇI İŞLEMLERİ (YENİ) ---
const satisciModaliniAc = (satisci = null) => {
  seciliSatisci.value = satisci ? { ...satisci } : { ad_soyad: '', telefon: '', aktif_mi: true };
  satisciModalGoster.value = true;
};

const satisciKaydet = async () => {
  if (!seciliSatisci.value.ad_soyad) return alert('Ad Soyad zorunludur');
  
  await withLoading(async () => {
    const { id, created_at, ...data } = seciliSatisci.value;
    if (id) {
      await supabase.from('satiscilar').update(data).eq('id', id);
    } else {
      await supabase.from('satiscilar').insert([data]);
    }
    await getSatiscilar();
    satisciModalGoster.value = false;
  });
};

const satisciDurumDegistir = async (satisci, yeniDurum) => {
  const mesaj = yeniDurum ? 'Aktif etmek istiyor musunuz?' : 'Pasife almak istiyor musunuz?';
  if (confirm(mesaj)) {
    await withLoading(async () => {
      await supabase.from('satiscilar').update({ aktif_mi: yeniDurum }).eq('id', satisci.id);
      await getSatiscilar();
    });
  }
};
</script>
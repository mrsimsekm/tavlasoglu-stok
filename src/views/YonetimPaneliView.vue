<template>
  <div class="p-4 sm:p-6 max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Yönetim Paneli</h1>
      <p class="text-gray-600 mt-2">Sistem ayarlarını ve verilerini yönetin</p>
    </div>

    <!-- Yetki Kontrolü Mesajı -->
    <div v-if="!userStore.isYonetici" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
      <div class="flex items-center">
        <svg class="w-6 h-6 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
        <p class="text-red-800 font-medium">Bu sayfaya erişim yetkiniz yok. Sadece yöneticiler bu sayfayı görüntüleyebilir.</p>
      </div>
    </div>

    <!-- Yönetici İçeriği -->
    <div v-else>
      <!-- Sekme Navigasyonu -->
      <div class="bg-white rounded-t-lg shadow-md">
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button v-for="tab in tabs" :key="tab.id" @click="aktifTab = tab.id" :class="['py-4 px-6 text-sm font-medium border-b-2 transition-colors focus:outline-none', aktifTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']">
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Sekme İçerikleri -->
      <div class="bg-white rounded-b-lg shadow-md p-6">
        <!-- KULLANICI YÖNETİMİ SEKMESİ -->
        <div v-if="aktifTab === 'kullanicilar'">
          <h2 class="text-2xl font-semibold mb-4 flex items-center text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
            Kullanıcı Yönetimi
          </h2>
          <div v-if="kullanicilarYukleniyor" class="text-center py-8"><div class="spinner"></div></div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="th-style">Kullanıcı</th>
                  <th class="th-style">Email</th>
                  <th class="th-style">Rol</th>
                  <th class="th-style">İşlemler</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="kullanici in kullanicilar" :key="kullanici.id">
                  <td class="td-style font-medium text-gray-900">{{ kullanici.tam_ad || 'İsimsiz' }}</td>
                  <td class="td-style text-gray-500">{{ kullanici.email }}</td>
                  <td class="td-style">
                    <select v-model="kullanici.rol" @change="rolGuncelle(kullanici)" :disabled="kullanici.id === userStore.user.id || rolGuncelleniyor === kullanici.id" class="form-input text-sm py-1 disabled:bg-gray-100 disabled:cursor-not-allowed">
                      <option value="yonetici">Yönetici</option>
                      <option value="satisci">Satışçı</option>
                      <option value="muhasebeci">Muhasebeci</option>
                      <option value="yetkisiz" class="text-red-600 font-bold">⛔ Yetkisiz</option>
                    </select>
                  </td>
                  <td class="td-style text-sm">
                    <span v-if="kullanici.id === userStore.user.id" class="text-gray-400 italic">(Siz)</span>
                    <span v-if="rolGuncelleniyor === kullanici.id" class="text-indigo-600 text-xs">Kaydediliyor...</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TEDARİKÇİ YÖNETİMİ SEKMESİ -->
        <div v-if="aktifTab === 'tedarikciler'">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-semibold flex items-center text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" /></svg>
              Tedarikçi Yönetimi
            </h2>
            <button @click="yeniTedarikciModalAc" class="btn-primary">+ Yeni Tedarikçi</button>
          </div>
          <div v-if="tedarikcilerYukleniyor" class="text-center py-8"><div class="spinner"></div></div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="th-style">Tedarikçi Adı</th>
                  <th class="th-style">İlgili Kişi</th>
                  <th class="th-style">Telefon</th>
                  <th class="th-style text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="tedarikci in tedarikciler" :key="tedarikci.id">
                  <td class="td-style font-medium text-gray-900">{{ tedarikci.ad }}</td>
                  <td class="td-style">{{ tedarikci.ilgili_kisi || '-' }}</td>
                  <td class="td-style">{{ tedarikci.telefon || '-' }}</td>
                  <td class="td-style text-center space-x-4">
                    <button @click="tedarikciDuzenle(tedarikci)" class="btn-link-blue">Düzenle</button>
                    <button @click="tedarikciSil(tedarikci)" class="btn-link-red">Sil</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- DEPO YÖNETİMİ SEKMESİ -->
        <div v-if="aktifTab === 'depolar'">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-semibold flex items-center text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z" clip-rule="evenodd" /></svg>
              Depo Yönetimi
            </h2>
            <button @click="yeniDepoModalAc" class="btn-primary">+ Yeni Depo</button>
          </div>
          <div v-if="depolarYukleniyor" class="text-center py-8"><div class="spinner"></div></div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="th-style">Depo Adı</th>
                  <th class="th-style">Adres</th>
                  <th class="th-style text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="depo in depolar" :key="depo.id">
                  <td class="td-style font-medium text-gray-900">{{ depo.ad }}</td>
                  <td class="td-style">{{ depo.adres || '-' }}</td>
                  <td class="td-style text-center space-x-4">
                    <button @click="depoDuzenle(depo)" class="btn-link-blue">Düzenle</button>
                    <button @click="depoSil(depo)" class="btn-link-red">Sil</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- BİLDİRİM MESAJLARI VE MODALLAR -->
    <div v-if="basariMesaji || hataMesaji" class="fixed bottom-4 right-4 z-50">
      <div v-if="basariMesaji" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg" role="alert"><p class="font-bold">Başarılı!</p><p>{{ basariMesaji }}</p></div>
      <div v-if="hataMesaji" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg" role="alert"><p class="font-bold">Hata!</p><p>{{ hataMesaji }}</p></div>
    </div>
    <BaseModal :show="tedarikciModalGoster" @close="tedarikciModalKapat"><template #header>{{ tedarikciDuzenlemeModu ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi Ekle' }}</template><template #body><div class="space-y-4"><div><label class="label-style">Tedarikçi Adı (*)</label><input v-model="tedarikciForm.ad" type="text" class="form-input"></div><div><label class="label-style">İlgili Kişi</label><input v-model="tedarikciForm.ilgili_kisi" type="text" class="form-input"></div><div><label class="label-style">Telefon</label><input v-model="tedarikciForm.telefon" type="tel" class="form-input"></div></div></template><template #footer><button @click="tedarikciModalKapat" class="btn-secondary">İptal</button><button @click="tedarikciKaydet" :disabled="tedarikciKayitYapiliyor" class="btn-primary ml-2">{{ tedarikciKayitYapiliyor ? 'Kaydediliyor...' : (tedarikciDuzenlemeModu ? 'Güncelle' : 'Ekle') }}</button></template></BaseModal>
    <BaseModal :show="depoModalGoster" @close="depoModalKapat"><template #header>{{ depoDuzenlemeModu ? 'Depo Düzenle' : 'Yeni Depo Ekle' }}</template><template #body><div class="space-y-4"><div><label class="label-style">Depo Adı (*)</label><input v-model="depoForm.ad" type="text" class="form-input"></div><div><label class="label-style">Adres</label><textarea v-model="depoForm.adres" rows="3" class="form-input"></textarea></div></div></template><template #footer><button @click="depoModalKapat" class="btn-secondary">İptal</button><button @click="depoKaydet" :disabled="depoKayitYapiliyor" class="btn-primary ml-2">{{ depoKayitYapiliyor ? 'Kaydediliyor...' : (depoDuzenlemeModu ? 'Güncelle' : 'Ekle') }}</button></template></BaseModal>
  </div>
</template>

<style scoped>
.th-style { @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider; }
.td-style { @apply px-6 py-4 whitespace-nowrap text-sm; }
.label-style { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
.btn-primary { @apply bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors; }
.btn-secondary { @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors; }
.btn-link-blue { @apply text-blue-600 hover:text-blue-800 text-sm font-semibold; }
.btn-link-red { @apply text-red-600 hover:text-red-800 text-sm font-semibold; }
.spinner { @apply inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600; }
</style>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase.js';
import { useUserStore } from '../stores/userStore.js';
import BaseModal from '../components/BaseModal.vue';

const userStore = useUserStore();

const tabs = [
  { id: 'kullanicilar', name: 'Kullanıcı Yönetimi' },
  { id: 'tedarikciler', name: 'Tedarikçi Yönetimi' },
  { id: 'depolar', name: 'Depo Yönetimi' }
];
const aktifTab = ref('kullanicilar');

const basariMesaji = ref('');
const hataMesaji = ref('');
const kullanicilar = ref([]);
const kullanicilarYukleniyor = ref(false);
const rolGuncelleniyor = ref(null);
const tedarikciler = ref([]);
const tedarikcilerYukleniyor = ref(false);
const tedarikciModalGoster = ref(false);
const tedarikciDuzenlemeModu = ref(false);
const tedarikciKayitYapiliyor = ref(false);
const tedarikciForm = ref({ id: null, ad: '', ilgili_kisi: '', telefon: '' });
const depolar = ref([]);
const depolarYukleniyor = ref(false);
const depoModalGoster = ref(false);
const depoDuzenlemeModu = ref(false);
const depoKayitYapiliyor = ref(false);
const depoForm = ref({ id: null, ad: '', adres: '' });

const showSuccess = (msg) => {
  basariMesaji.value = msg;
  setTimeout(() => { basariMesaji.value = ''; }, 4000);
};
const showError = (msg) => {
  hataMesaji.value = msg;
  setTimeout(() => { hataMesaji.value = ''; }, 5000);
};

const kullanicilariYukle = async () => {
  kullanicilarYukleniyor.value = true;
  hataMesaji.value = '';
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const { data: profilData, error: profilError } = await supabase.from('profiller').select('*');
    if (profilError) throw profilError;

    kullanicilar.value = authData.users.map(authUser => {
      const profil = profilData.find(p => p.id === authUser.id);
      return {
        id: authUser.id,
        email: authUser.email,
        tam_ad: profil?.tam_ad || 'İsimsiz',
        rol: profil?.rol || 'satisci',
      };
    });
  } catch (error) {
    console.error('Kullanıcılar yüklenirken hata:', error);
    showError('Kullanıcılar listesi yüklenemedi. Lütfen RLS politikanızı kontrol edin.');
  } finally {
    kullanicilarYukleniyor.value = false;
  }
};


// YonetimPaneliView.vue içindeki rolGuncelle fonksiyonunu bu kodla değiştirin

const rolGuncelle = async (kullanici) => {
  rolGuncelleniyor.value = kullanici.id;
  hataMesaji.value = '';
  basariMesaji.value = '';
  
  try {
    console.log('Rol güncelleniyor:', kullanici.id, 'Yeni rol:', kullanici.rol);
    
    // Sadece profiller tablosunu güncelle (RLS otomatik kontrol edecek)
    const { data, error } = await supabase
      .from('profiller')
      .update({ rol: kullanici.rol })
      .eq('id', kullanici.id)
      .select();
    
    if (error) {
      console.error('Güncelleme hatası:', error);
      throw error;
    }
    
    console.log('Güncelleme başarılı:', data);
    showSuccess(`${kullanici.tam_ad || kullanici.email} rolü başarıyla güncellendi!`);

    // Eğer kendi rolünüzü güncellediyseniz, store'u yenile
    if (kullanici.id === userStore.user.id) {
      await userStore.refreshProfile();
      alert("Kendi rolünüzü değiştirdiniz. Değişikliklerin tam yansıması için lütfen çıkış yapıp tekrar giriş yapın.");
    }

  } catch (error) {
    console.error('Rol güncelleme hatası:', error);
    showError(`Rol güncellenemedi: ${error.message}`);
    // Hata durumunda kullanıcıları tekrar yükle (veritabanı ile senkronize et)
    await kullanicilariYukle();
  } finally {
    rolGuncelleniyor.value = null;
  }
};


const tedarikcileriYukle = async () => {
  tedarikcilerYukleniyor.value = true;
  try {
    const { data, error } = await supabase.from('tedarikciler').select('*').order('ad');
    if (error) throw error;
    tedarikciler.value = data || [];
  } catch (error) {
    console.error('Tedarikçiler yüklenirken hata:', error);
    showError('Tedarikçiler yüklenemedi.');
  } finally {
    tedarikcilerYukleniyor.value = false;
  }
};
const yeniTedarikciModalAc = () => {
  tedarikciDuzenlemeModu.value = false;
  tedarikciForm.value = { id: null, ad: '', ilgili_kisi: '', telefon: '' };
  tedarikciModalGoster.value = true;
};
const tedarikciDuzenle = (tedarikci) => {
  tedarikciDuzenlemeModu.value = true;
  tedarikciForm.value = { ...tedarikci };
  tedarikciModalGoster.value = true;
};
const tedarikciModalKapat = () => {
  tedarikciModalGoster.value = false;
};
const tedarikciKaydet = async () => {
  if (!tedarikciForm.value.ad) {
    showError('Tedarikçi adı zorunludur!');
    return;
  }
  tedarikciKayitYapiliyor.value = true;
  try {
    const formData = { ad: tedarikciForm.value.ad, ilgili_kisi: tedarikciForm.value.ilgili_kisi, telefon: tedarikciForm.value.telefon };
    if (tedarikciDuzenlemeModu.value) {
      const { error } = await supabase.from('tedarikciler').update(formData).eq('id', tedarikciForm.value.id);
      if (error) throw error;
      showSuccess('Tedarikçi başarıyla güncellendi!');
    } else {
      const { error } = await supabase.from('tedarikciler').insert([formData]);
      if (error) throw error;
      showSuccess('Tedarikçi başarıyla eklendi!');
    }
    tedarikciModalKapat();
    await tedarikcileriYukle();
  } catch (error) {
    console.error('Tedarikçi kaydetme hatası:', error);
    showError('İşlem sırasında bir hata oluştu.');
  } finally {
    tedarikciKayitYapiliyor.value = false;
  }
};
const tedarikciSil = async (tedarikci) => {
  if (!confirm(`"${tedarikci.ad}" tedarikçisini silmek istediğinizden emin misiniz?`)) return;
  try {
    const { error } = await supabase.from('tedarikciler').delete().eq('id', tedarikci.id);
    if (error) throw error;
    showSuccess('Tedarikçi başarıyla silindi!');
    await tedarikcileriYukle();
  } catch (error) {
    console.error('Tedarikçi silme hatası:', error);
    showError('Silme işlemi başarısız oldu.');
  }
};

const depolariYukle = async () => {
  depolarYukleniyor.value = true;
  try {
    const { data, error } = await supabase.from('depolar').select('*').order('ad');
    if (error) throw error;
    depolar.value = data || [];
  } catch (error) {
    console.error('Depolar yüklenirken hata:', error);
    showError('Depolar yüklenemedi.');
  } finally {
    depolarYukleniyor.value = false;
  }
};
const yeniDepoModalAc = () => {
  depoDuzenlemeModu.value = false;
  depoForm.value = { id: null, ad: '', adres: '' };
  depoModalGoster.value = true;
};
const depoDuzenle = (depo) => {
  depoDuzenlemeModu.value = true;
  depoForm.value = { ...depo };
  depoModalGoster.value = true;
};
const depoModalKapat = () => {
  depoModalGoster.value = false;
};
const depoKaydet = async () => {
  if (!depoForm.value.ad) {
    showError('Depo adı zorunludur!');
    return;
  }
  depoKayitYapiliyor.value = true;
  try {
    const formData = { ad: depoForm.value.ad, adres: depoForm.value.adres };
    if (depoDuzenlemeModu.value) {
      const { error } = await supabase.from('depolar').update(formData).eq('id', depoForm.value.id);
      if (error) throw error;
      showSuccess('Depo başarıyla güncellendi!');
    } else {
      const { error } = await supabase.from('depolar').insert([formData]);
      if (error) throw error;
      showSuccess('Depo başarıyla eklendi!');
    }
    depoModalKapat();
    await depolariYukle();
  } catch (error) {
    console.error('Depo kaydetme hatası:', error);
    showError('İşlem sırasında bir hata oluştu.');
  } finally {
    depoKayitYapiliyor.value = false;
  }
};
const depoSil = async (depo) => {
  if (!confirm(`"${depo.ad}" deposunu silmek istediğinizden emin misiniz?`)) return;
  try {
    const { error } = await supabase.from('depolar').delete().eq('id', depo.id);
    if (error) throw error;
    showSuccess('Depo başarıyla silindi!');
    await depolariYukle();
  } catch (error) {
    console.error('Depo silme hatası:', error);
    showError('Silme işlemi başarısız oldu.');
  }
};

onMounted(async () => {
  if (!userStore.profile) {
    await userStore.fetchUser();
  }
  if (userStore.isYonetici) {
    await Promise.all([
      kullanicilariYukle(),
      tedarikcileriYukle(),
      depolariYukle(),
    ]);
  }
});
</script>
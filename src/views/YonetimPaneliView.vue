<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Yönetim Paneli</h1>

    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <!-- SEKME BAŞLIKLARI -->
      <div class="flex border-b overflow-x-auto">
        <button @click="aktifSekme = 'kullanicilar'" :class="getTabClass('kullanicilar')">Kullanıcılar & Roller</button>
        <button @click="aktifSekme = 'tedarikciler'" :class="getTabClass('tedarikciler')">Tedarikçi Yönetimi</button>
        <button @click="aktifSekme = 'depolar'" :class="getTabClass('depolar')">Depo Yönetimi</button>
        <button @click="aktifSekme = 'satiscilar'" :class="getTabClass('satiscilar')">Satışçı Yönetimi</button>
        <button @click="aktifSekme = 'veri'" :class="getTabClass('veri')">Veri Yönetimi</button>
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

        <!-- 4. SATIŞÇI YÖNETİMİ -->
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

        <!-- 5. VERİ YÖNETİMİ -->
        <div v-if="aktifSekme === 'veri'" class="space-y-8">
          
          <!-- Yedekleme Bölümü -->
          <div class="border rounded-lg p-6 bg-gray-50">
            <h3 class="text-lg font-bold text-gray-800 mb-2">Veritabanı Yedekle</h3>
            <p class="text-sm text-gray-600 mb-4">Verilerinizi JSON (taşınabilir) veya SQL (sorgu) formatında indirebilirsiniz.</p>
            
            <div class="flex space-x-4">
              <!-- JSON İNDİR -->
              <button @click="yedekleJSON" :disabled="yedekleniyor" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center shadow-sm disabled:opacity-50">
                <svg v-if="!yedekleniyor" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span v-else class="mr-2">⏳</span>
                {{ yedekleniyor ? 'İndiriliyor...' : 'JSON Olarak İndir' }}
              </button>

              <!-- SQL İNDİR -->
              <button @click="yedekleSQL" :disabled="yedekleniyor" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg flex items-center shadow-sm disabled:opacity-50">
                <svg v-if="!yedekleniyor" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                <span v-else class="mr-2">⏳</span>
                {{ yedekleniyor ? 'Oluşturuluyor...' : 'SQL Olarak İndir' }}
              </button>
            </div>
          </div>

          <!-- Geri Yükleme Bölümü -->
          <div class="border rounded-lg p-6 bg-red-50 border-red-100">
            <h3 class="text-lg font-bold text-red-800 mb-2">Veri Geri Yükle (Sadece JSON)</h3>
            <p class="text-sm text-red-600 mb-4 font-semibold">⚠️ DİKKAT: Bu işlem mevcut verilerin üzerine yazar. SQL dosyalarını pgAdmin üzerinden yükleyiniz, buradan sadece JSON yüklenir.</p>
            
            <div class="flex items-center space-x-4">
              <input type="file" ref="dosyaInput" accept=".json" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-100 file:text-red-700 hover:file:bg-red-200">
              <button @click="geriYukle" :disabled="yukleniyor" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg flex items-center shadow-sm disabled:opacity-50 whitespace-nowrap">
                <svg v-if="!yukleniyor" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <span v-else class="mr-2">⏳</span>
                {{ yukleniyor ? 'Yükleniyor...' : 'Geri Yükle' }}
              </button>
            </div>
          </div>

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

    <!-- Satışçı Modalı -->
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
const satiscilar = ref([]);

// Veri Yönetimi State'leri
const yedekleniyor = ref(false);
const yukleniyor = ref(false);
const dosyaInput = ref(null);

const rolModalGoster = ref(false);
const tedarikciModalGoster = ref(false);
const depoModalGoster = ref(false);
const satisciModalGoster = ref(false);

const seciliKullanici = ref({});
const seciliTedarikci = ref({});
const seciliDepo = ref({});
const seciliSatisci = ref({});

const getTabClass = (sekme) => ['flex-1 py-4 px-6 text-center font-medium focus:outline-none whitespace-nowrap', aktifSekme.value === sekme ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'];

const getKullanicilar = async () => { const { data } = await supabase.from('profiller').select('*').order('email'); kullanicilar.value = data || []; };
const getTedarikciler = async () => { const { data } = await supabase.from('tedarikciler').select('*').order('ad'); tedarikciler.value = data || []; };
const getDepolar = async () => { const { data } = await supabase.from('depolar').select('*').order('ad'); depolar.value = data || []; };
const getSatiscilar = async () => { const { data } = await supabase.from('satiscilar').select('*').order('ad_soyad'); satiscilar.value = data || []; };

onMounted(() => { getKullanicilar(); getTedarikciler(); getDepolar(); getSatiscilar(); });

// KULLANICI & ROL
const rolDuzenleModaliniAc = (k) => { seciliKullanici.value = { ...k }; rolModalGoster.value = true; };
const rolKaydet = async () => { await withLoading(async () => { await supabase.from('profiller').update({ rol: seciliKullanici.value.rol, tam_ad: seciliKullanici.value.tam_ad }).eq('id', seciliKullanici.value.id); await getKullanicilar(); rolModalGoster.value = false; }); };
const getRolClass = (r) => ({'yonetici':'bg-purple-100 text-purple-800','satisci':'bg-blue-100 text-blue-800','muhasebeci':'bg-green-100 text-green-800','yetkisiz':'bg-red-100 text-red-800'}[r]||'px-2 py-1 rounded text-xs font-bold');

// CRUD İşlemleri
const tedarikciModaliniAc = (t) => { seciliTedarikci.value = t ? { ...t } : { ad: '' }; tedarikciModalGoster.value = true; };
const tedarikciKaydet = async () => { await withLoading(async () => { const { id, ...d } = seciliTedarikci.value; id ? await supabase.from('tedarikciler').update(d).eq('id', id) : await supabase.from('tedarikciler').insert([d]); await getTedarikciler(); tedarikciModalGoster.value = false; }); };
const tedarikciSil = async (t) => { if(confirm('Sil?')) { await supabase.from('tedarikciler').delete().eq('id', t.id); await getTedarikciler(); } };

const depoModaliniAc = (d) => { seciliDepo.value = d ? { ...d } : { ad: '' }; depoModalGoster.value = true; };
const depoKaydet = async () => { await withLoading(async () => { const { id, ...d } = seciliDepo.value; id ? await supabase.from('depolar').update(d).eq('id', id) : await supabase.from('depolar').insert([d]); await getDepolar(); depoModalGoster.value = false; }); };
const depoSil = async (d) => { if(confirm('Sil?')) { await supabase.from('depolar').delete().eq('id', d.id); await getDepolar(); } };

const satisciModaliniAc = (s) => { seciliSatisci.value = s ? { ...s } : { ad_soyad: '', aktif_mi: true }; satisciModalGoster.value = true; };
const satisciKaydet = async () => { await withLoading(async () => { const { id, created_at, ...d } = seciliSatisci.value; id ? await supabase.from('satiscilar').update(d).eq('id', id) : await supabase.from('satiscilar').insert([d]); await getSatiscilar(); satisciModalGoster.value = false; }); };
const satisciDurumDegistir = async (s, durum) => { if(confirm('Durum değişsin mi?')) { await supabase.from('satiscilar').update({ aktif_mi: durum }).eq('id', s.id); await getSatiscilar(); } };

const tablolariGetir = async () => {
  const tablolar = ['musteriler', 'tedarikciler', 'satiscilar', 'depolar', 'urunler', 'anlasmalar', 'is_emirleri', 'is_emri_kalemleri', 'is_emri_maliyetleri', 'proformalar', 'proforma_kalemleri', 'stok_hareketleri', 'stok_seviyeleri', 'alacaklar', 'odemeler', 'alacak_odemeleri'];
  const veri = {};
  for (const tablo of tablolar) {
    const { data } = await supabase.from(tablo).select('*');
    veri[tablo] = data || [];
  }
  return veri;
};

const dosyaIndir = (icerik, dosyaAdi, tip) => {
  const blob = new Blob([icerik], { type: tip });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = dosyaAdi;
  a.click();
  URL.revokeObjectURL(url);
};

// --- YEDEKLEME (JSON) ---
const yedekleJSON = async () => {
  yedekleniyor.value = true;
  try {
    const veri = await tablolariGetir();
    const jsonStr = JSON.stringify(veri, null, 2);
    dosyaIndir(jsonStr, `stok_takip_yedek_${new Date().toISOString().slice(0,10)}.json`, 'application/json');
    alert('JSON yedek indirildi.');
  } catch (err) { alert('Hata: ' + err.message); } finally { yedekleniyor.value = false; }
};

// --- YEDEKLEME (SQL) ---
const yedekleSQL = async () => {
  yedekleniyor.value = true;
  try {
    const veri = await tablolariGetir();
    let sqlContent = `-- Tavlaşoğlu Stok Takip SQL Yedeği\n-- Tarih: ${new Date().toLocaleString()}\n\n`;

    for (const [tablo, satirlar] of Object.entries(veri)) {
      if (!satirlar || satirlar.length === 0) continue;
      
      sqlContent += `-- Tablo: ${tablo}\n`;
      
      satirlar.forEach(satir => {
        const columns = Object.keys(satir).join(', ');
        const values = Object.values(satir).map(val => {
          if (val === null) return 'NULL';
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`; 
          if (typeof val === 'object') return `'${JSON.stringify(val)}'`; 
          return val;
        }).join(', ');
        
        sqlContent += `INSERT INTO public.${tablo} (${columns}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`;
      });
      sqlContent += '\n';
    }

    dosyaIndir(sqlContent, `stok_takip_yedek_${new Date().toISOString().slice(0,10)}.sql`, 'text/sql');
    alert('SQL yedek indirildi.');
  } catch (err) {
    alert('SQL oluşturma hatası: ' + err.message);
  } finally {
    yedekleniyor.value = false;
  }
};

// --- GERİ YÜKLEME (IMPORT - SADECE JSON) ---
const geriYukle = async () => {
  const file = dosyaInput.value.files[0];
  if (!file) { alert('Lütfen bir JSON dosyası seçin.'); return; }
  if (!confirm('DİKKAT: Veri üzerine yazılacak. Devam?')) return;

  yukleniyor.value = true;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const veri = JSON.parse(e.target.result);
      const sira = ['tedarikciler', 'depolar', 'satiscilar', 'musteriler', 'urunler', 'anlasmalar', 'is_emirleri', 'proformalar', 'stok_hareketleri', 'alacaklar'];
      
      for (const tablo of sira) {
        if (veri[tablo]?.length) await supabase.from(tablo).upsert(veri[tablo]);
      }
      for (const tablo of Object.keys(veri)) {
        if (!sira.includes(tablo) && veri[tablo]?.length) await supabase.from(tablo).upsert(veri[tablo]);
      }
      alert('Yükleme tamamlandı.'); window.location.reload();
    } catch (err) { alert('Hata: ' + err.message); } finally { yukleniyor.value = false; }
  };
  reader.readAsText(file);
};
</script>
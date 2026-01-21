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
            <div v-if="secilenMusteri" class="mt-2 p-3 bg-blue-50 text-blue-800 rounded text-sm border border-blue-100">
              <div class="font-bold">{{ secilenMusteri.unvan }}</div>
              <div class="text-xs mt-1 text-blue-600">
                {{ secilenMusteri.il }} / {{ secilenMusteri.ilce }} - {{ secilenMusteri.vergi_no }}
              </div>
            </div>
            
            <!-- KATEGORİ SEÇİMİ -->
            <div class="mt-6">
              <h3 class="text-sm font-semibold text-gray-700 mb-2">Sınıflandırma / Etiketler</h3>
              <div class="grid grid-cols-2 gap-2">
                <label v-for="kat in kategoriListesi" :key="kat" class="flex items-center space-x-2 cursor-pointer bg-gray-50 p-2 rounded border hover:bg-gray-100 transition">
                  <input type="checkbox" :value="kat" v-model="form.kategoriler" @change="guncelleSartlarMetni" class="h-4 w-4 text-indigo-600 rounded">
                  <span class="text-sm text-gray-700">{{ kat }}</span>
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <h2 class="text-xl font-semibold mb-4 text-gray-700">Proforma Detayları</h2>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label-style">Proforma No (Otomatik)</label>
                <div v-if="loadingNo" class="text-xs text-gray-500 mt-2">Numara oluşturuluyor...</div>
                <input v-else v-model="form.proforma_no" type="text" class="form-input bg-gray-100 font-mono font-bold text-indigo-700" readonly>
              </div>
              
              <!-- PARA BİRİMİ SEÇİMİ -->
              <div>
                <label class="label-style">Para Birimi</label>
                <select v-model="form.para_birimi" class="form-input font-bold text-gray-700">
                  <option value="TRY">₺ Türk Lirası (TRY)</option>
                  <option value="USD">$ Amerikan Doları (USD)</option>
                  <option value="EUR">€ Euro (EUR)</option>
                  <option value="GBP">£ İngiliz Sterlini (GBP)</option>
                </select>
              </div>

              <!-- KDV DAHİL CHECKBOX -->
              <div class="flex items-center pt-6">
                <label class="flex items-center cursor-pointer">
                  <input type="checkbox" v-model="form.kdv_dahil" class="h-5 w-5 text-indigo-600 rounded border-gray-300">
                  <span class="ml-3 text-sm font-medium text-gray-700">KDV Dahil Fiyat</span>
                </label>
              </div>

              <div>
                <label class="label-style">Geçerlilik Tarihi (*)</label>
                <input v-model="form.gecerlilik_tarihi" type="date" required class="form-input">
              </div>
              <div class="col-span-2">
                <label class="label-style">Notlar</label>
                <textarea 
                  v-model="form.notlar" 
                  rows="2" 
                  class="form-input" 
                  placeholder="Kısa notlar..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- ŞARTLAR DÜZENLEME ALANI (GÜNCELLENDİ) -->
        <div class="bg-gray-50 p-4 rounded border border-gray-200 relative group transition-all">
            <div class="flex justify-between items-center mb-2">
                <div>
                    <h3 class="text-sm font-bold text-gray-700">Şartlar ve Koşullar</h3>
                    <!-- Durum Bilgileri -->
                    <p v-if="!manuelDuzenlemeAktif && !manuelDuzenlemeYapildi" class="text-xs text-green-600 italic">Otomatik güncelleniyor (Salt Okunur)</p>
                    <p v-else-if="manuelDuzenlemeAktif && !manuelDuzenlemeYapildi" class="text-xs text-blue-600 italic font-bold">Düzenleme modu aktif...</p>
                    <p v-else-if="manuelDuzenlemeYapildi" class="text-xs text-orange-600 italic font-bold">Manuel düzenleme yapıldı (Otomatik güncelleme duraklatıldı)</p>
                </div>
                
                <div class="flex space-x-2">
                    <!-- Düzenle Butonu -->
                    <button 
                        v-if="!manuelDuzenlemeAktif" 
                        type="button" 
                        @click="manuelDuzenlemeyiAc" 
                        class="text-xs bg-white border border-gray-300 px-3 py-1 rounded hover:bg-indigo-50 text-indigo-600 font-semibold shadow-sm"
                    >
                        Düzenle ✎
                    </button>

                    <!-- Sıfırla Butonu -->
                    <button 
                        v-if="manuelDuzenlemeYapildi" 
                        type="button" 
                        @click="otomatikModaDon" 
                        class="text-xs bg-white border border-gray-300 px-3 py-1 rounded hover:bg-red-50 text-red-600 shadow-sm"
                    >
                        Sıfırla ⟳
                    </button>
                </div>
            </div>
            
            <textarea 
                v-model="form.sartlar" 
                @input="manuelDuzenlemeBasladi"
                :readonly="!manuelDuzenlemeAktif"
                rows="8" 
                class="w-full text-xs text-gray-700 border rounded p-2 focus:outline-none font-mono leading-relaxed transition-colors"
                :class="{
                    'bg-gray-100 cursor-not-allowed': !manuelDuzenlemeAktif,
                    'bg-white border-indigo-300 ring-2 ring-indigo-100': manuelDuzenlemeAktif
                }"
                placeholder="Şartlar ve koşullar..."
            ></textarea>
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
             :proforma-modu="true"
             :para-birimi="form.para_birimi"
             :kdv-dahil="form.kdv_dahil"
             @kalemler-guncellendi="handleKalemler" 
          />
        </div>

        <!-- FOOTER / BUTONLAR -->
        <div class="flex justify-between items-center pt-6 border-t">
          <div class="text-lg font-bold text-gray-700">
            Toplam Tutar: <span class="text-blue-600">{{ formatPara(hesaplananToplamTutar, form.para_birimi) }}</span>
          </div>
          
          <div class="flex space-x-3">
            <button 
              type="button" 
              @click="taslakYazdir"
              :disabled="kalemler.length === 0"
              class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg disabled:opacity-50 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Taslak Yazdır
            </button>

            <button 
              type="submit" 
              :disabled="loading || !form.musteri_id || kalemler.length === 0"
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-8 rounded-lg disabled:bg-gray-400"
            >
              {{ loading ? 'Oluşturuluyor...' : 'Proformayı Oluştur' }}
            </button>
          </div>
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

// --- SABİT METİNLER ---
const GENEL_SARTLAR = `GENEL ŞARTLAR
• FİYATLARIMIZA KDV DAHİLDİR. Fiyatlarımıza, KDV (%20) dahil değildir. Yasa gereği ödenmesi gereken her türlü ötv, harç,fon, vergi mevzuatlarındaki değişikliklerin getireceği munzam yükler alıcıya ait olacaktır.
• Stoklarımız günlük olarak değiştiği için lütfen sipariş esnasında stokları kontrol ettiriniz.
• Ödeme nakit veya Kredi Kartı ile siparişe istinaden ödenecektir.
• Opsiyon 7 gün
• Cihazlarımız malzeme ve işçilik hatalarına karşı fatura tarihinden itibaren bireysel klimalar 3 yıl geri kalan ürünlerimiz 2 yıl firmamız garantisi altındadır. Elektrik arızaları, voltaj farklılıkları ile kullanım ve bakım hatalarından dolayı kaynaklanan arızalar garanti kapsamı dışındadır.`;

const KATEGORI_SARTLARI = {
  'KLİMA': `\nKLİMA
• Nakliye ve montaj dahildir.
• Elektrik tesisatı, drenaj, karot ve inşai işler hariçtir.
• İç ve dış ünitelerde duvarın mukavemeti olmadığı durumlarda konsol tarafımıza ait değildir.
• Borulama 4 mt. kadar olup 4 mt.’den sonra 1200.00 TL+KDV metrajda ücret alınır`,

  'HAVA PERDESİ': `\nHAVAPERDESİ
• Nakliye ve montaj dahildir.
• Elektrik tesisatı, inşai işler hariçtir.
• Konsol hariçtir.`,

  'VRF': `\nVRF
• Nakliye ve montaj dahildir. Şantiye teslim olup vinç ve hammaliye hariçtir.
• Elektrik tesisatı, drenaj, karot ve inşai işler hariçtir.
• İç ve dış ünitelerde konsol ihtiyacı doğması halinde tarafımıza ait değildir.
• Projeye istinaden fiyat verilmiş olup değişikliklerin tarafımıza bildirilmesi gerekmektedir.`,

  'SOĞUK ODA': `\nSOĞUK ODA
• Nakliye ve montaj dahildir. Şantiye teslim olup vinç ve hammaliye hariçtir.
• Elektrik tesisatı, drenaj, karot ve inşai işler hariçtir.
• İç ve dış ünitelerde konsol ihtiyacı doğması halinde tarafımıza ait değildir.
• Projeye istinaden fiyat verilmiş olup değişikliklerin tarafımıza bildirilmesi gerekmektedir.`,

  'DX': `\nDX
• Nakliye ve montaj dahildir. Şantiye teslim olup vinç ve hammaliye hariçtir.
• Elektrik tesisatı, drenaj, karot ve inşai işler hariçtir.
• İç ve dış ünitelerde konsol ihtiyacı doğması halinde tarafımıza ait değildir.
• Projeye istinaden fiyat verilmiş olup değişikliklerin tarafımıza bildirilmesi gerekmektedir.`,

  'ISI POMPASI': `\nISI POMPASI
• Nakliye ve devreye alım dahildir.
• Elektrik tesisatı, inşai işler ve montaj hariçtir.`,

  'YEDEK PARÇA': `\nYEDEKPARÇA
• Nakliye dahildir.`,

  'İŞÇİLİK': `\nİŞÇİLİK
• Nakliye ve montaj dahildir.`
};

const router = useRouter();
const loading = ref(false);
const loadingNo = ref(true);
const loadingResources = ref(true);
const secilenMusteri = ref(null);
const kalemler = ref([]);
const manuelDuzenlemeAktif = ref(false); // Düzenle butonuna basıldı mı?
const manuelDuzenlemeYapildi = ref(false); // Elle veri girişi oldu mu?

const depolar = ref([]);
const tedarikciler = ref([]);
const anlasmalar = ref([]);

const kategoriListesi = Object.keys(KATEGORI_SARTLARI);

const form = ref({
  musteri_id: null,
  proforma_no: '',
  gecerlilik_tarihi: '', 
  notlar: '',
  para_birimi: 'TRY',
  kdv_dahil: true, 
  kategoriler: [],
  sartlar: GENEL_SARTLAR
});

// YENİ: Düzenle butonuna basınca readonly kalkar
const manuelDuzenlemeyiAc = () => {
    manuelDuzenlemeAktif.value = true;
};

// Input gelirse uyarı çıkar
const manuelDuzenlemeBasladi = () => {
    manuelDuzenlemeYapildi.value = true;
};

// Sıfırla ve otomatik moda dön
const otomatikModaDon = () => {
    manuelDuzenlemeAktif.value = false;
    manuelDuzenlemeYapildi.value = false;
    guncelleSartlarMetni();
};

const guncelleSartlarMetni = () => {
  // Eğer manuel düzenleme yapıldıysa otomatik güncellemeyi engelle
  if (manuelDuzenlemeYapildi.value) return;

  let metin = GENEL_SARTLAR;
  form.value.kategoriler.forEach(kat => {
    if (KATEGORI_SARTLARI[kat]) metin += KATEGORI_SARTLARI[kat];
  });
  form.value.sartlar = metin;
};

const yeniNumaraOlustur = async () => {
  loadingNo.value = true;
  try {
    const yil = new Date().getFullYear();
    const prefix = `PRF${yil}`;
    const { data } = await supabase.from('proformalar').select('proforma_no').ilike('proforma_no', `${prefix}%`).order('proforma_no', { ascending: false }).limit(1).maybeSingle();
    let siraNo = 1;
    if (data && data.proforma_no) {
      const mevcutSira = parseInt(data.proforma_no.replace(prefix, ''), 10);
      if (!isNaN(mevcutSira)) siraNo = mevcutSira + 1;
    }
    form.value.proforma_no = `${prefix}${String(siraNo).padStart(4, '0')}`;
  } catch (err) {
    console.error(err);
  } finally {
    loadingNo.value = false;
  }
};

onMounted(async () => {
  await yeniNumaraOlustur();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  form.value.gecerlilik_tarihi = nextWeek.toISOString().split('T')[0];

  const [d, t, a] = await Promise.all([
    supabase.from('depolar').select('*'),
    supabase.from('tedarikciler').select('*'),
    supabase.from('anlasmalar').select('*, anlasma_kalemleri(urun_id, taahhut_edilen_miktar)').eq('aktif_mi', true)
  ]);
  depolar.value = d.data || [];
  tedarikciler.value = t.data || [];
  anlasmalar.value = a.data || [];
  loadingResources.value = false;
  guncelleSartlarMetni();
});

const handleMusteriSecildi = (m) => { secilenMusteri.value = m; form.value.musteri_id = m.id; };
const handleKalemler = (l) => { kalemler.value = l; };

const hesaplananToplamTutar = computed(() => {
  return kalemler.value.reduce((total, kalem) => {
    const hamTutar = kalem.miktar * kalem.birim_fiyat;
    if (form.value.kdv_dahil) {
      return total + hamTutar;
    } else {
      return total + (hamTutar * 1.2);
    }
  }, 0);
});

const kaydet = async () => {
  try {
    loading.value = true;
    const { data: proforma, error } = await supabase.from('proformalar').insert([{
      musteri_id: form.value.musteri_id,
      proforma_no: form.value.proforma_no,
      gecerlilik_tarihi: form.value.gecerlilik_tarihi,
      notlar: form.value.notlar,
      sartlar: form.value.sartlar,
      toplam_tutar: hesaplananToplamTutar.value,
      para_birimi: form.value.para_birimi,
      durum: 'Taslak',
      kdv_dahil: form.value.kdv_dahil,
      kategoriler: form.value.kategoriler 
    }]).select().single();

    if (error) {
      if (error.code === '23505') { await yeniNumaraOlustur(); return kaydet(); }
      throw error;
    }

    const kalemlerToInsert = kalemler.value.map(k => ({
      proforma_id: proforma.id,
      urun_id: k.urun_id || null, aciklama: k.aciklama, miktar: k.miktar, birim_fiyat: k.birim_fiyat,
      kaynak_depo_id: null, kaynak_tedarikci_id: null, anlasma_id: null
    }));
    await supabase.from('proforma_kalemleri').insert(kalemlerToInsert);

    alert('Proforma başarıyla oluşturuldu!');
    router.push('/app/proformalar');
  } catch (err) {
    alert('Hata: ' + err.message);
  } finally {
    loading.value = false;
  }
};

const formatPara = (val, currency = 'TRY') => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency || 'TRY' }).format(val || 0);

const taslakYazdir = () => {
  if (kalemler.value.length === 0) { alert("Yazdırmak için en az bir ürün eklemelisiniz."); return; }
  const logoUrl = window.location.origin + '/logo11.png';
  const tarih = new Date().toLocaleDateString('tr-TR');
  const musteri = secilenMusteri.value || { unvan: 'Sayın Yetkili', ilgili_kisi: '', vergi_dairesi: '', vergi_no: '', adres: '' };
  const pb = form.value.para_birimi;
  const kdvDahil = form.value.kdv_dahil;
  
  const kalemlerHTML = kalemler.value.map((kalem, index) => {
    let satirTutar = kalem.miktar * kalem.birim_fiyat;
    if (!kdvDahil) satirTutar = satirTutar * 1.2;
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${index + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${kalem.aciklama}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${kalem.miktar}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(kalem.birim_fiyat, pb)}<br><span style="font-size:9px;color:#666">(${kdvDahil ? 'Dahil' : 'Hariç'})</span></td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(satirTutar, pb)}</td>
      </tr>
    `;
  }).join('');

  const genelToplam = hesaplananToplamTutar.value;
  const araToplam = genelToplam / 1.2;
  const toplamKDV = genelToplam - araToplam;

  const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>Proforma Fatura - ${form.value.proforma_no}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          @page { margin: 1cm; size: A4; }
          body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.5; margin: 0; padding: 0; font-size: 12px; min-height: 100vh; position: relative; }
          .container { max-width: 210mm; margin: 0 auto; background: white; padding-bottom: 50px; }
          .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
          .logo-area img { height: 100px; object-fit: contain; }
          .company-details { text-align: right; font-size: 11px; color: #555; }
          .company-name { font-size: 16px; font-weight: bold; color: #111; margin-bottom: 1px; }
          .doc-title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 1px; color: #4f46e5; }
          .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-box { width: 48%; }
          .box-title { font-size: 13px; font-weight: bold; border-bottom: 1px solid #ddd; margin-bottom: 10px; padding-bottom: 5px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #f9fafb; padding: 10px; border-bottom: 2px solid #ddd; text-align: left; font-size: 11px; }
          .totals { display: flex; justify-content: flex-end; }
          .total-wrapper { width: 250px; }
          .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
          .total-row.final { font-weight: bold; font-size: 14px; border-top: 2px solid #333; margin-top: 5px; padding-top: 10px; }
          .notes { background: #f9fafb; padding: 15px; border-left: 4px solid #ddd; margin-top: 30px; }
          
          /* Footer Notu Sabitleme */
          .footer-note {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            text-align: center;
            font-size: 10px;
            color: #666;
            padding: 10px;
            background: white;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-area"><img src="${logoUrl}" alt="Logo"></div>
            <div class="company-details">
                <div class="company-name">Tavlaşoğlu Isıtma Soğutma</div>
                <div class="company-name">Doğalgaz Sis. Tic. San. ve Ltd. Şti.</div>
                <div>Lalapaşa Mah. Samih Kobal Cad. İnanoğlu Apt. No:16/2</div>
                <div>Yakutiye / Erzurum</div>
                <div>Tel: 0(442) 238 83 83</div>
            </div>
          </div>

          <div class="doc-title">PROFORMA FATURA (TASLAK)</div>

          <div class="info-grid">
            <div class="info-box">
              <div class="box-title">SAYIN / MÜŞTERİ</div>
              <div class="row"><strong>${musteri.unvan || '-'}</strong></div>
              <div class="row"><span>İlgili:</span> <span>${musteri.ilgili_kisi || '-'}</span></div>
              <div class="row"><span>V.D:</span> <span>${musteri.vergi_dairesi || '-'}</span></div>
              <div class="row"><span>V.No:</span> <span>${musteri.vergi_no || '-'}</span></div>
              <div class="row"><span>Adres:</span> <span>${musteri.adres || '-'}</span></div>
            </div>
            <div class="info-box">
              <div class="box-title">BELGE DETAYLARI</div>
              <div class="row"><span>Proforma No:</span> <strong>${form.value.proforma_no}</strong></div>
              <div class="row"><span>Tarih:</span> <span>${tarih}</span></div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: center;">#</th>
                <th>Açıklama</th>
                <th style="text-align: center;">Miktar</th>
                <th style="text-align: right;">Birim Fiyat</th>
                <th style="text-align: right;">Tutar</th>
              </tr>
            </thead>
            <tbody>
              ${kalemlerHTML}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-wrapper">
                <div class="total-row"><span>Ara Toplam (KDV'siz):</span><span>${formatPara(araToplam, pb)}</span></div>
                <div class="total-row"><span>Toplam KDV (%20):</span><span>${formatPara(toplamKDV, pb)}</span></div>
                <div class="total-row final"><span>GENEL TOPLAM:</span><span>${formatPara(genelToplam, pb)}</span></div>
            </div>
          </div>
          
          <div style="margin-top: 30px; border-top: 2px solid #eee; padding-top: 10px;">
            <h4 style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase;">Şartlar ve Koşullar</h4>
            <div style="white-space: pre-wrap; font-size: 10px; color: #444; line-height: 1.4;">${form.value.sartlar || 'Şart belirtilmemiş.'}</div>
          </div>

          ${form.value.notlar ? `<div class="notes"><strong>NOTLAR:</strong><br>${form.value.notlar.replace(/\n/g, '<br>')}</div>` : ''}
          
          <div class="footer-note">
            Bu belge bilgilendirme amaçlıdır, mali değeri yoktur. Fatura yerine geçmez.
          </div>
        </div>
      </body>
      </html>
    `;
  
  const w = window.open(); w.document.write(htmlContent); w.document.close(); w.focus(); setTimeout(()=>w.print(), 500);
};
</script>
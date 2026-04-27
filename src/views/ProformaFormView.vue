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
          
          <!-- SOL KOLON: MÜŞTERİ -->
          <div>
            <h2 class="text-xl font-semibold mb-4 text-gray-700">Müşteri Seçimi</h2>
            <MusteriAramaInput @musteri-secildi="handleMusteriSecildi" />
            
            <div v-if="secilenMusteri" class="mt-4 p-4 bg-blue-50 text-blue-900 rounded-lg border border-blue-100 shadow-sm space-y-2">
              <div class="font-bold text-lg border-b border-blue-200 pb-1">{{ secilenMusteri.unvan }}</div>
              <div class="grid grid-cols-2 gap-2 text-sm">
                 <div><span class="font-semibold">İl/İlçe:</span> {{ secilenMusteri.il }} / {{ secilenMusteri.ilce }}</div>
                 <div><span class="font-semibold">VKN:</span> {{ secilenMusteri.vergi_no }}</div>
                 <div class="col-span-2"><span class="font-semibold">Adres:</span> {{ secilenMusteri.adres }}</div>
              </div>
            </div>

            <div class="mt-4">
               <label class="label-style">İlgili Kişi (Bu Proforma İçin)</label>
               <input 
                 v-model="form.ilgili_kisi" 
                 type="text" 
                 class="form-input" 
                 placeholder="Müşteride kayıtlı kişi otomatik gelir, değiştirebilirsiniz."
               >
               <p class="text-xs text-gray-500 mt-1">Burada yapılan değişiklik müşteri kartını etkilemez, sadece bu proformada görünür.</p>
            </div>
            
            <!-- KATEGORİ SEÇİMİ -->
            <div class="mt-6">
              <h3 class="text-sm font-semibold text-gray-700 mb-2">Sınıflandırma / Etiketler</h3>
              <div v-if="loadingAyarlar" class="text-xs text-indigo-600 animate-pulse">Kategoriler yükleniyor...</div>
              <div v-else class="grid grid-cols-2 gap-2">
                <label v-for="kat in kategoriListesi" :key="kat" class="flex items-center space-x-2 cursor-pointer bg-gray-50 p-2 rounded border hover:bg-gray-100 transition">
                  <input type="checkbox" :value="kat" v-model="form.kategoriler" @change="guncelleSartlarMetni" class="h-4 w-4 text-indigo-600 rounded">
                  <span class="text-sm text-gray-700">{{ kat }}</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- SAĞ KOLON: DETAYLAR -->
          <div>
            <h2 class="text-xl font-semibold mb-4 text-gray-700">Proforma Detayları</h2>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label-style">Proforma No (Otomatik)</label>
                <div v-if="loadingNo" class="text-xs text-gray-500 mt-2">Numara oluşturuluyor...</div>
                <input v-else v-model="form.proforma_no" type="text" class="form-input bg-gray-100 font-mono font-bold text-indigo-700" readonly>
              </div>
              
              <div>
                <label class="label-style">Para Birimi</label>
                <select v-model="form.para_birimi" class="form-input font-bold text-gray-700">
                  <option value="TRY">₺ Türk Lirası (TRY)</option>
                  <option value="USD">$ Amerikan Doları (USD)</option>
                  <option value="EUR">€ Euro (EUR)</option>
                  <option value="GBP">£ İngiliz Sterlini (GBP)</option>
                </select>
              </div>

              <div class="col-span-2">
                <label class="label-style">Proje Adı</label>
                <input 
                  v-model="form.proje_adi" 
                  type="text" 
                  class="form-input" 
                  placeholder="Örn: Erzurum Şehir Hastanesi İklimlendirme Projesi"
                >
              </div>

              <div class="col-span-2">
                <label class="label-style">Geçerlilik Tarihi (*)</label>
                <input v-model="form.gecerlilik_tarihi" type="date" required class="form-input">
              </div>

              <div class="col-span-2">
                <label class="label-style">Notlar</label>
                <textarea 
                  v-model="form.notlar" 
                  rows="3" 
                  class="form-input" 
                  placeholder="Kısa notlar..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- ŞARTLAR DÜZENLEME ALANI -->
        <div class="bg-gray-50 p-4 rounded border border-gray-200 relative group transition-all">
            <div class="flex justify-between items-center mb-2">
                <div>
                    <h3 class="text-sm font-bold text-gray-700">Şartlar ve Koşullar</h3>
                    <p v-if="!manuelDuzenlemeAktif && !manuelDuzenlemeYapildi" class="text-xs text-green-600 italic">Otomatik güncelleniyor (Salt Okunur)</p>
                    <p v-else-if="manuelDuzenlemeAktif && !manuelDuzenlemeYapildi" class="text-xs text-blue-600 italic font-bold">Düzenleme modu aktif...</p>
                    <p v-else-if="manuelDuzenlemeYapildi" class="text-xs text-orange-600 italic font-bold">Manuel düzenleme yapıldı (Otomatik güncelleme duraklatıldı)</p>
                </div>
                
                <div class="flex space-x-2">
                    <button 
                        v-if="!manuelDuzenlemeAktif" 
                        type="button" 
                        @click="manuelDuzenlemeyiAc" 
                        class="text-xs bg-white border border-gray-300 px-3 py-1 rounded hover:bg-indigo-50 text-indigo-600 font-semibold shadow-sm"
                    >
                        Düzenle ✎
                    </button>
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
                rows="6" 
                class="w-full text-xs text-gray-700 border rounded p-2 focus:outline-none font-mono leading-relaxed transition-colors"
                :class="{
                    'bg-gray-100 cursor-not-allowed': !manuelDuzenlemeAktif,
                    'bg-white border-indigo-300 ring-2 ring-indigo-100': manuelDuzenlemeAktif
                }"
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
             @kalemler-guncellendi="handleKalemler" 
          />
        </div>

        <!-- FOOTER / TOPLAMLAR -->
        <div class="flex justify-end pt-6 border-t">
          <div class="w-full max-w-md space-y-3">
             <div class="flex justify-between text-gray-600">
                <span>Ara Toplam:</span>
                <span class="font-semibold">{{ formatPara(toplamlar.araToplam, form.para_birimi) }}</span>
             </div>
             <div class="flex justify-between text-gray-600">
                <span>KDV (%20):</span>
                <span class="font-semibold">{{ formatPara(toplamlar.kdv, form.para_birimi) }}</span>
             </div>
             <div class="flex justify-between text-xl font-bold text-gray-800 border-t pt-2">
                <span>GENEL TOPLAM:</span>
                <span class="text-indigo-600">{{ formatPara(toplamlar.genelToplam, form.para_birimi) }}</span>
             </div>

             <div class="flex space-x-3 mt-6 pt-4">
                <button 
                  type="button" 
                  @click="taslakYazdir"
                  :disabled="kalemler.length === 0"
                  class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Taslak Yazdır
                </button>

                <button 
                  type="submit" 
                  :disabled="loading || !form.musteri_id || kalemler.length === 0"
                  class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400 shadow-lg hover:shadow-xl transition"
                >
                  {{ loading ? 'Oluşturuluyor...' : 'Proformayı Oluştur' }}
                </button>
             </div>
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

const router = useRouter();
const loading = ref(false);
const loadingNo = ref(true);
const loadingResources = ref(true);
const loadingAyarlar = ref(true); // YENİ: Ayarlar yüklenirken

const secilenMusteri = ref(null);
const kalemler = ref([]);

// Düzenleme Modu State
const manuelDuzenlemeAktif = ref(false);
const manuelDuzenlemeYapildi = ref(false);

const depolar = ref([]);
const tedarikciler = ref([]);
const anlasmalar = ref([]);

// YENİ: DB'den gelecek değişkenler
const genelSartlarDB = ref('');
const kategoriSartlariDB = ref({});
const kategoriListesi = ref([]);

const form = ref({
  musteri_id: null,
  proforma_no: '',
  ilgili_kisi: '', 
  proje_adi: '', 
  gecerlilik_tarihi: '', 
  notlar: '',
  para_birimi: 'TRY',
  kdv_dahil: false, 
  kategoriler: [],
  sartlar: '' // Artık boş başlıyor, DB'den gelince dolacak
});

const manuelDuzenlemeyiAc = () => { manuelDuzenlemeAktif.value = true; };
const manuelDuzenlemeBasladi = () => { manuelDuzenlemeYapildi.value = true; };
const otomatikModaDon = () => {
    manuelDuzenlemeAktif.value = false;
    manuelDuzenlemeYapildi.value = false;
    guncelleSartlarMetni();
};

const guncelleSartlarMetni = () => {
  if (manuelDuzenlemeYapildi.value) return;
  let metin = genelSartlarDB.value;
  form.value.kategoriler.forEach(kat => {
    if (kategoriSartlariDB.value[kat]) metin += "\n" + kategoriSartlariDB.value[kat];
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

const fetchAyarlar = async () => {
  loadingAyarlar.value = true;
  try {
    const { data, error } = await supabase.from('proforma_ayarlari').select('*');
    if (error) throw error;
    
    data.forEach(ayar => {
      if (ayar.kategori_adi === 'GENEL') {
        genelSartlarDB.value = ayar.sart_metni;
        form.value.sartlar = ayar.sart_metni; // İlk yüklemede geneli bas
      } else {
        kategoriSartlariDB.value[ayar.kategori_adi] = ayar.sart_metni;
        kategoriListesi.value.push(ayar.kategori_adi);
      }
    });
  } catch (err) {
    console.error("Ayarlar çekilemedi:", err.message);
  } finally {
    loadingAyarlar.value = false;
  }
};

onMounted(async () => {
  await fetchAyarlar(); // Önce ayarları (metinleri) çek
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

const handleMusteriSecildi = (m) => { 
    secilenMusteri.value = m; 
    form.value.musteri_id = m.id;
    form.value.ilgili_kisi = m.ilgili_kisi || '';
};

const handleKalemler = (l) => { kalemler.value = l; };

const toplamlar = computed(() => {
    const araToplam = kalemler.value.reduce((acc, k) => acc + (k.miktar * k.birim_fiyat), 0);
    const kdv = araToplam * 0.20;
    const genelToplam = araToplam + kdv;
    return { araToplam, kdv, genelToplam };
});

const kaydet = async () => {
  try {
    loading.value = true;
    const { data: proforma, error } = await supabase.from('proformalar').insert([{
      musteri_id: form.value.musteri_id,
      proforma_no: form.value.proforma_no,
      gecerlilik_tarihi: form.value.gecerlilik_tarihi,
      ilgili_kisi: form.value.ilgili_kisi, 
      proje_adi: form.value.proje_adi, 
      notlar: form.value.notlar,
      sartlar: form.value.sartlar,
      toplam_tutar: toplamlar.value.genelToplam,
      para_birimi: form.value.para_birimi,
      durum: 'Taslak',
      kdv_dahil: false, 
      kategoriler: form.value.kategoriler 
    }]).select().single();

    if (error) {
      if (error.code === '23505') { await yeniNumaraOlustur(); return kaydet(); }
      throw error;
    }

    const kalemlerToInsert = kalemler.value.map(k => ({
      proforma_id: proforma.id,
      urun_id: k.urun_id || null, 
      aciklama: k.aciklama, 
      miktar: k.miktar, 
      birim: k.birim, 
      birim_fiyat: k.birim_fiyat,
      kaynak_depo_id: null, 
      kaynak_tedarikci_id: null, 
      anlasma_id: null
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
  const musteri = secilenMusteri.value || {};
  const ilgiliKisi = form.value.ilgili_kisi || musteri.ilgili_kisi || '-';
  const pb = form.value.para_birimi;
  
  const kalemlerHTML = kalemler.value.map((kalem, index) => {
    const satirTutar = kalem.miktar * kalem.birim_fiyat;
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${index + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 500;">${kalem.aciklama}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${kalem.miktar}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${kalem.birim || 'Adet'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(kalem.birim_fiyat, pb)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: 700;">${formatPara(satirTutar, pb)}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>Proforma - ${form.value.proforma_no}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          @page { margin: 1cm; size: A4; }
          body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.4; margin: 0; padding: 0; font-size: 11px; }
          .container { max-width: 210mm; margin: 0 auto; background: white; padding-bottom: 20px; }
          
          /* HEADER */
          .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; border-bottom: 2px solid #005BBB; padding-bottom: 15px; }
          .logo-area img { height: 75px; object-fit: contain; }
          .doc-title { text-align: right; }
          .doc-title h2 { margin: 0; font-size: 22px; color: #005BBB; font-weight: 800; letter-spacing: 0.5px; }
          .doc-title .sub { font-size: 11px; color: #666; margin-top: 5px; font-weight: 500; }
          
          /* INFO GRID */
          .info-grid { display: flex; justify-content: space-between; margin-bottom: 25px; gap: 20px; }
          .info-box { flex: 1; border: 1px solid #e5e7eb; background: #f9fafb; padding: 12px; border-radius: 6px; }
          .box-title { font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
          .info-text { font-size: 11.5px; color: #111827; margin-bottom: 3px; }
          .info-text strong { color: #000; }
          
          /* TABLE */
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #005BBB; color: white; padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          th:first-child { border-radius: 4px 0 0 0; }
          th:last-child { border-radius: 0 4px 0 0; }
          
          /* TOTALS */
          .totals { display: flex; justify-content: flex-end; margin-top: 15px; }
          .total-wrapper { width: 250px; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
          .total-row { display: flex; justify-content: space-between; padding: 6px 12px; font-size: 11px; border-bottom: 1px solid #f3f4f6; }
          .total-row.final { background: #005BBB; color: white; font-weight: bold; font-size: 13px; border-bottom: none; }
          
          /* FOOTER */
          .footer-note { position: fixed; bottom: 0; left: 0; width: 100%; text-align: center; font-size: 9px; color: #999; padding: 5px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-area"><img src="${logoUrl}" alt="Tavlaşoğlu"></div>
            <div class="doc-title">
                <h2>PROFORMA FATURA</h2>
                <div class="sub">Tarih: ${tarih} &nbsp;|&nbsp; No: ${form.value.proforma_no}</div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-box">
              <div class="box-title">MÜŞTERİ BİLGİLERİ</div>
              <div class="info-text"><strong>${musteri.unvan || '-'}</strong></div>
              <div class="info-text">İlgili: ${ilgiliKisi}</div>
              <div class="info-text">${musteri.adres || '-'}</div>
              <div class="info-text">${musteri.vergi_dairesi ? 'V.D: ' + musteri.vergi_dairesi : ''} ${musteri.vergi_no ? 'V.No: ' + musteri.vergi_no : ''}</div>
            </div>
            
            <div class="info-box" style="text-align: right;">
              <div class="box-title">TEKLİF VEREN</div>
              <div class="info-text"><strong>Tavlaşoğlu Isıtma Soğutma</strong></div>
              <div class="info-text">Doğalgaz Sis. Tic. San. ve Ltd. Şti.</div>
              <div class="info-text">Lalapaşa Mah. Samih Kobal Cad.</div>
              <div class="info-text">Tel: 0(442) 238 83 83</div>
              ${form.value.proje_adi ? `<div style="margin-top:8px; padding-top:8px; border-top: 1px solid #e5e7eb; color:#005BBB; font-weight:700; font-size:12px;">PROJE: ${form.value.proje_adi}</div>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: center; width: 30px;">#</th>
                <th>Açıklama</th>
                <th style="text-align: center; width: 60px;">Miktar</th>
                <th style="text-align: center; width: 60px;">Birim</th>
                <th style="text-align: right; width: 100px;">Birim Fiyat</th>
                <th style="text-align: right; width: 100px;">Tutar</th>
              </tr>
            </thead>
            <tbody>
              ${kalemlerHTML}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-wrapper">
                <div class="total-row"><span>Ara Toplam:</span><span>${formatPara(toplamlar.value.araToplam, pb)}</span></div>
                <div class="total-row"><span>KDV (%20):</span><span>${formatPara(toplamlar.value.kdv, pb)}</span></div>
                <div class="total-row final"><span>GENEL TOPLAM:</span><span>${formatPara(toplamlar.value.genelToplam, pb)}</span></div>
            </div>
          </div>
          
          <div style="margin-top: 25px;">
            <div style="font-size: 11px; font-weight: bold; color: #005BBB; text-transform: uppercase; margin-bottom: 5px;">Şartlar ve Koşullar</div>
            <div style="white-space: pre-wrap; font-size: 10px; color: #444; line-height: 1.4; background: #fafafa; padding: 10px; border-left: 3px solid #005BBB;">${form.value.sartlar || 'Şart belirtilmemiş.'}</div>
          </div>

          ${form.value.notlar ? `<div style="margin-top:15px;"><div style="font-size: 10px; font-weight: bold; color: #333;">NOTLAR:</div><div style="font-size: 10px; color: #555;">${form.value.notlar}</div></div>` : ''}
          
          <div class="footer-note">
            Bu belge bilgilendirme amaçlıdır. (Taslak)
          </div>
        </div>
      </body>
      </html>
    `;
  
  const w = window.open(); w.document.write(htmlContent); w.document.close(); w.focus(); setTimeout(()=>w.print(), 500);
};
</script>
<template>
  <div>
    <!-- HEADER -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">
          Proforma Detayı <span v-if="isEditing" class="text-yellow-500 text-xl">(Düzenleme Modu)</span>
        </h1>
        <p v-if="proforma" class="text-sm text-gray-500 mt-1">
          No: <span class="font-mono font-semibold text-indigo-600">{{ proforma.proforma_no }}</span>
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <!-- BUTONLAR -->
        <button v-if="!isEditing" @click="yazdir" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg flex items-center shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Yazdır
        </button>

        <div v-if="proforma && proforma.durum !== 'Dönüştürüldü'">
          <button v-if="!isEditing" @click="baslaDuzenle" class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
            Düzenle
          </button>
          <div v-else class="flex space-x-2">
            <button @click="iptalEt" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">İptal</button>
            <button @click="kaydet" :disabled="loading" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              {{ loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
            </button>
          </div>
        </div>
        
        <RouterLink to="/app/proformalar" class="text-gray-600 hover:text-gray-800">&larr; Geri Dön</RouterLink>
      </div>
    </div>

    <div v-if="fetchLoading" class="text-center p-6">Yükleniyor...</div>
    
    <div v-else-if="proforma" class="space-y-6">
      
      <!-- GENEL BİLGİLER -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Belge Bilgileri</h2>
        
        <div v-if="!isEditing" class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div><p class="label-style">Müşteri</p><p class="font-semibold text-lg">{{ proforma.musteriler?.unvan }}</p></div>
          <div><p class="label-style">Oluşturma Tarihi</p><p class="font-semibold">{{ formatTarih(proforma.olusturma_tarihi) }}</p></div>
          <div>
            <p class="label-style">Geçerlilik Tarihi</p>
            <p class="font-semibold" :class="{'text-red-600': suresiGectiMi(proforma)}">
              {{ formatTarih(proforma.gecerlilik_tarihi) }}
              <span v-if="suresiGectiMi(proforma)" class="text-xs ml-1">(Süresi Doldu)</span>
            </p>
          </div>
          <div><p class="label-style">Durum</p><span :class="getDurumBadge(proforma.durum)">{{ proforma.durum }}</span></div>
        </div>

        <!-- Düzenleme Modu -->
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p class="label-style">Müşteri</p>
            <p class="font-semibold p-2 bg-gray-100 rounded border">{{ proforma.musteriler?.unvan }}</p>
            <p class="text-xs text-gray-400 mt-1">* Müşteri değişimi için yeni proforma oluşturunuz.</p>
          </div>
          <div>
            <label class="label-style">Geçerlilik Tarihi</label>
            <input v-model="form.gecerlilik_tarihi" type="date" class="form-input">
          </div>
          <div>
            <label class="label-style">Notlar</label>
            <!-- GÜNCELLEME: Input yerine Textarea kullanıldı -->
            <textarea v-model="form.notlar" rows="3" class="form-input" placeholder="Notları buraya giriniz..."></textarea>
          </div>
        </div>
      </div>

      <!-- KALEMLER -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4"><h2 class="text-xl font-semibold text-gray-700">Ürün ve Hizmetler</h2></div>
        
        <!-- Düzenleme Modunda Kalem Ekleme Bileşeni -->
        <IsEmriKalemEkle 
           v-if="isEditing" 
           :depolar="depolar" 
           :tedarikciler="tedarikciler" 
           :anlasmalar="anlasmalar" 
           :initialKalemler="guncelKalemler" 
           :kaydedilmis-is-emri="true" 
           @kalemler-guncellendi="handleKalemlerGuncellendi"
        />

        <!-- Görüntüleme Modu Tablosu -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full leading-normal">
            <thead>
              <tr>
                <th class="th-style text-center">#</th>
                <th class="th-style">Açıklama</th>
                <th class="th-style">Kaynak (Depo/Ted)</th>
                <th class="th-style">Anlaşma</th>
                <th class="th-style text-center">Miktar</th>
                <th class="th-style text-right">Birim Fiyat</th>
                <th class="th-style text-right">Tutar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(kalem, index) in proforma.proforma_kalemleri" :key="kalem.id">
                <td class="td-style text-center">{{ index + 1 }}</td>
                <td class="td-style font-medium">{{ kalem.aciklama }}</td>
                <td class="td-style text-xs text-gray-600">
                  {{ kalem.depolar?.ad || kalem.tedarikciler?.ad || 'Hizmet/Stok Dışı' }}
                </td>
                <td class="td-style text-xs text-indigo-600">{{ kalem.anlasmalar?.ad || '-' }}</td>
                <td class="td-style text-center font-bold">{{ kalem.miktar }}</td>
                <td class="td-style text-right">{{ formatPara(kalem.birim_fiyat) }}</td>
                <td class="td-style text-right font-bold text-gray-800">{{ formatPara(kalem.miktar * kalem.birim_fiyat) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="px-5 py-3 text-right font-bold text-gray-700 border-t">GENEL TOPLAM:</td>
                <td class="px-5 py-3 text-right font-bold text-xl text-blue-600 border-t">{{ formatPara(proforma.toplam_tutar) }}</td>
              </tr>
            </tfoot>
          </table>
          
          <div v-if="proforma.notlar" class="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p class="text-sm font-bold text-yellow-800 mb-1">NOTLAR:</p>
            <!-- GÜNCELLEME: whitespace-pre-wrap eklendi -->
            <p class="text-sm text-yellow-900 whitespace-pre-wrap">{{ proforma.notlar }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.label-style { @apply block text-sm font-medium text-gray-500 mb-1; }
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
.th-style { @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider; }
.td-style { @apply px-5 py-5 border-b border-gray-200 bg-white text-sm; }
</style>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../supabase.js';
import IsEmriKalemEkle from '../components/IsEmriKalemEkle.vue';

const route = useRoute();
const router = useRouter();
const id = route.params.id;

const fetchLoading = ref(true);
const loading = ref(false);
const isEditing = ref(false);
const proforma = ref(null);

// Form ve Kaynaklar
const form = ref({});
const guncelKalemler = ref([]);
const depolar = ref([]);
const tedarikciler = ref([]);
const anlasmalar = ref([]);

// --- VERİ ÇEKME ---
const getDetay = async () => {
  fetchLoading.value = true;
  try {
    // 1. Proforma ve ilişkili tüm verileri çek
    const { data, error } = await supabase
      .from('proformalar')
      .select(`
        *,
        musteriler(*),
        proforma_kalemleri(
          *,
          depolar(ad),
          tedarikciler(ad),
          anlasmalar(ad)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    proforma.value = data;

    // 2. Kaynakları çek (Düzenleme modu için gerekli)
    const [depolarRes, tedarikcilerRes, anlasmalarRes] = await Promise.all([
      supabase.from('depolar').select('*'),
      supabase.from('tedarikciler').select('*'),
      supabase.from('anlasmalar').select('*, anlasma_kalemleri(urun_id, taahhut_edilen_miktar)').eq('aktif_mi', true)
    ]);
    depolar.value = depolarRes.data || [];
    tedarikciler.value = tedarikcilerRes.data || [];
    anlasmalar.value = anlasmalarRes.data || [];

  } catch (err) {
    alert('Veri çekme hatası: ' + err.message);
    router.push('/app/proformalar');
  } finally {
    fetchLoading.value = false;
  }
};

// --- DÜZENLEME MODU ---
const baslaDuzenle = () => {
  form.value = {
    gecerlilik_tarihi: proforma.value.gecerlilik_tarihi,
    notlar: proforma.value.notlar
  };
  // Kalemleri IsEmriKalemEkle formatına uygun hale getiriyoruz
  guncelKalemler.value = proforma.value.proforma_kalemleri.map(k => ({
    id: k.id, // Varsa ID
    urun_id: k.urun_id,
    aciklama: k.aciklama,
    miktar: k.miktar,
    birim_fiyat: k.birim_fiyat,
    kaynak_depo_id: k.kaynak_depo_id,
    kaynak_tedarikci_id: k.kaynak_tedarikci_id,
    anlasma_id: k.anlasma_id
  }));
  isEditing.value = true;
};

const iptalEt = () => {
  isEditing.value = false;
  getDetay(); // Değişiklikleri geri al
};

const handleKalemlerGuncellendi = (liste) => {
  guncelKalemler.value = liste;
};

// --- KAYDETME İŞLEMİ ---
const kaydet = async () => {
  if (guncelKalemler.value.length === 0) { alert('En az bir kalem olmalıdır.'); return; }
  
  loading.value = true;
  try {
    const toplamTutar = guncelKalemler.value.reduce((sum, k) => sum + (k.miktar * k.birim_fiyat), 0);

    // 1. Ana tabloyu güncelle
    const { error: mainError } = await supabase
      .from('proformalar')
      .update({
        gecerlilik_tarihi: form.value.gecerlilik_tarihi,
        notlar: form.value.notlar,
        toplam_tutar: toplamTutar
      })
      .eq('id', id);
    
    if (mainError) throw mainError;

    // 2. Kalemleri Sil ve Yeniden Ekle (En temiz yöntem)
    await supabase.from('proforma_kalemleri').delete().eq('proforma_id', id);

    const kalemlerToInsert = guncelKalemler.value.map(k => ({
      proforma_id: id,
      urun_id: k.urun_id || null,
      aciklama: k.aciklama,
      miktar: k.miktar,
      birim_fiyat: k.birim_fiyat,
      kaynak_depo_id: k.kaynak_depo_id || null,
      kaynak_tedarikci_id: k.kaynak_tedarikci_id || null,
      anlasma_id: k.anlasma_id || null
    }));

    const { error: insertError } = await supabase.from('proforma_kalemleri').insert(kalemlerToInsert);
    if (insertError) throw insertError;

    alert('Değişiklikler kaydedildi!');
    isEditing.value = false;
    getDetay();

  } catch (err) {
    alert('Kaydetme hatası: ' + err.message);
  } finally {
    loading.value = false;
  }
};

// --- YAZDIRMA FONKSİYONU ---
const yazdir = () => {
  if (!proforma.value) return;

  const p = proforma.value;
  const logoUrl = window.location.origin + '/logo11.png';
  const tarih = formatTarih(p.olusturma_tarihi);
  const gecerlilik = formatTarih(p.gecerlilik_tarihi);
  const musteri = p.musteriler || {};
  const kalemler = p.proforma_kalemleri || [];

  const kalemlerHTML = kalemler.map((kalem, index) => {
      // Kaynak Adı Bulma (Depo > Tedarikçi > Hizmet)
      let kaynakAdi = 'Hizmet/Diğer';
      if (kalem.depolar) kaynakAdi = kalem.depolar.ad;
      else if (kalem.tedarikciler) kaynakAdi = kalem.tedarikciler.ad;
      
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${index + 1}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${kalem.aciklama}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${kaynakAdi}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${kalem.miktar}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(kalem.birim_fiyat)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(kalem.miktar * kalem.birim_fiyat)}</td>
        </tr>
      `;
  }).join('');

  const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>Proforma Fatura - ${p.proforma_no}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          @page { margin: 1cm; size: A4; }
          body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.5; margin: 0; padding: 0; font-size: 12px; }
          .container { max-width: 210mm; margin: 0 auto; background: white; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
          .logo-area img { height: 80px; }
          .company-details { text-align: right; font-size: 11px; color: #555; }
          .doc-title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 1px; color: #4f46e5; }
          .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-box { width: 48%; }
          .box-title { font-size: 13px; font-weight: bold; border-bottom: 1px solid #ddd; margin-bottom: 10px; padding-bottom: 5px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #f9fafb; padding: 10px; border-bottom: 2px solid #ddd; text-align: left; font-size: 11px; }
          .totals { display: flex; justify-content: flex-end; }
          .total-row { display: flex; justify-content: space-between; width: 250px; padding: 5px 0; font-weight: bold; font-size: 14px; border-top: 2px solid #333; }
          .notes { background: #f9fafb; padding: 15px; border-left: 4px solid #ddd; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-area"><img src="${logoUrl}" alt="Logo"></div>
            <div class="company-details">
              <strong>ŞİRKET ÜNVANI A.Ş.</strong><br>
              Adres Bilgisi Mah. Cad. No:1<br>
              Erzurum / Türkiye<br>
              Tel: 0442 000 00 00
            </div>
          </div>

          <div class="doc-title">PROFORMA FATURA</div>

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
              <div class="row"><span>Proforma No:</span> <strong>${p.proforma_no}</strong></div>
              <div class="row"><span>Tarih:</span> <span>${tarih}</span></div>
              <div class="row"><span>Geçerlilik Tarihi:</span> <span style="color:red">${gecerlilik}</span></div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: center;">#</th>
                <th>Açıklama</th>
                <th>Kaynak</th>
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
            <div class="total-row">
              <span>GENEL TOPLAM</span>
              <span>${formatPara(p.toplam_tutar)}</span>
            </div>
          </div>

          ${p.notlar ? `<div class="notes"><strong>NOTLAR:</strong><br>${p.notlar.replace(/\n/g, '<br>')}</div>` : ''}
          
          <div style="margin-top: 50px; font-size: 10px; color: #666; text-align: center;">
            Bu belge bilgilendirme amaçlıdır, mali değeri yoktur. Fatura yerine geçmez.
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
};

const suresiGectiMi = (p) => {
  if (p.durum === 'Dönüştürüldü') return false;
  const bugun = new Date().toISOString().split('T')[0];
  return p.gecerlilik_tarihi < bugun;
};

const getDurumBadge = (durum) => {
  if (durum === 'Taslak') return 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-600';
  if (durum === 'Gönderildi') return 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-600';
  if (durum === 'Dönüştürüldü') return 'px-2 py-1 text-xs rounded bg-purple-100 text-purple-600 font-bold';
  return 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-800';
};

const formatTarih = (t) => t ? new Date(t).toLocaleDateString('tr-TR') : '-';
const formatPara = (t) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(t || 0);

onMounted(getDetay);
</script>
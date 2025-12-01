<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Proforma Faturalar</h1>
      <RouterLink to="/app/proformalar/yeni" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-150">
        + Yeni Proforma
      </RouterLink>
    </div>

    <!-- FİLTRE & ARAMA -->
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input v-model="aramaMetni" type="text" placeholder="Proforma No veya Müşteri Ara..." class="form-input">
        <select v-model="durumFiltresi" class="form-input">
          <option value="Tümü">Tüm Durumlar</option>
          <option value="Taslak">Taslak</option>
          <option value="Gönderildi">Gönderildi</option>
          <option value="Dönüştürüldü">İş Emrine Dönüştü</option>
        </select>
      </div>
    </div>

    <!-- LİSTE -->
    <div class="bg-white shadow rounded-lg overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="th-style">No</th>
            <th class="th-style">Müşteri</th>
            <th class="th-style">Oluşturma Tarihi</th>
            <th class="th-style">Geçerlilik</th>
            <th class="th-style text-right">Toplam Tutar</th>
            <th class="th-style text-center">Durum</th>
            <th class="th-style text-right" style="width: 180px;">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center py-4">Yükleniyor...</td>
          </tr>
          <tr v-else-if="filtrelenmisProformalar.length === 0">
            <td colspan="7" class="text-center py-4 text-gray-500">Kayıt bulunamadı.</td>
          </tr>
          <tr v-else v-for="proforma in filtrelenmisProformalar" :key="proforma.id" class="hover:bg-gray-50 transition">
            <td class="td-style font-mono font-semibold text-indigo-600">{{ proforma.proforma_no }}</td>
            <td class="td-style font-medium">{{ proforma.musteriler?.unvan || '-' }}</td>
            <td class="td-style">{{ formatTarih(proforma.olusturma_tarihi) }}</td>
            <td class="td-style">
              <div class="flex items-center">
                <span>{{ formatTarih(proforma.gecerlilik_tarihi) }}</span>
                <span v-if="suresiGectiMi(proforma)" class="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full font-bold">Süresi Doldu</span>
              </div>
            </td>
            <td class="td-style text-right font-bold text-gray-800">{{ formatPara(proforma.toplam_tutar) }}</td>
            <td class="td-style text-center">
              <span :class="getDurumBadge(proforma.durum)">{{ proforma.durum }}</span>
            </td>
            <td class="td-style text-right">
              <div class="flex justify-end items-center space-x-2">
                
                <!-- DETAY / DÜZENLE BUTONU -->
                <button @click="router.push(`/app/proformalar/${proforma.id}`)" class="text-indigo-600 hover:text-indigo-900 p-1" title="Detay & Düzenle">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>

                <!-- YAZDIR BUTONU -->
                <button @click="yazdirProforma(proforma)" class="text-gray-500 hover:text-gray-700 p-1" title="Yazdır">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </button>

                <!-- DÖNÜŞTÜR BUTONU -->
                <button 
                  v-if="proforma.durum !== 'Dönüştürüldü'"
                  @click="isEmrineDonustur(proforma)" 
                  class="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded border border-green-300 transition whitespace-nowrap"
                  title="İş Emrine Dönüştür"
                >
                  İş Emri Yap
                </button>
                <span v-else class="text-xs text-purple-600 font-bold border border-purple-200 bg-purple-50 px-2 py-1 rounded whitespace-nowrap select-none">
                  Dönüştü
                </span>
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
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
</style>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const proformalar = ref([]);
const aramaMetni = ref('');
const durumFiltresi = ref('Tümü');

const verileriGetir = async () => {
  loading.value = true;
  const { data, error } = await supabase
    .from('proformalar')
    .select(`*, musteriler(unvan, vergi_dairesi, vergi_no, adres, telefon, ilgili_kisi)`)
    .order('created_at', { ascending: false });
    
  if (!error) proformalar.value = data;
  loading.value = false;
};

const filtrelenmisProformalar = computed(() => {
  return proformalar.value.filter(p => {
    const aramaUyumu = (
      p.proforma_no?.toLowerCase().includes(aramaMetni.value.toLowerCase()) ||
      p.musteriler?.unvan?.toLowerCase().includes(aramaMetni.value.toLowerCase())
    );
    const durumUyumu = durumFiltresi.value === 'Tümü' || p.durum === durumFiltresi.value;
    return aramaUyumu && durumUyumu;
  });
});

// --- YAZDIRMA FONKSİYONU ---
const yazdirProforma = async (proforma) => {
  try {
    const { data: kalemler, error } = await supabase
      .from('proforma_kalemleri')
      .select(`
        *, 
        depolar(ad), 
        tedarikciler(ad),
        anlasmalar(ad)
      `)
      .eq('proforma_id', proforma.id);

    if (error) throw error;

    const logoUrl = window.location.origin + '/logo11.png';
    const tarih = formatTarih(proforma.olusturma_tarihi);
    const gecerlilik = formatTarih(proforma.gecerlilik_tarihi);
    const musteri = proforma.musteriler || {};

    const kalemlerHTML = kalemler.map((kalem, index) => {
      // Kaynak Adı Bulma (Depo > Tedarikçi > Hizmet)
      let kaynakAdi = 'Hizmet/Diğer';
      if (kalem.depolar) kaynakAdi = kalem.depolar.ad;
      else if (kalem.tedarikciler) kaynakAdi = kalem.tedarikciler.ad;
      
      const anlasmaAdi = kalem.anlasmalar ? kalem.anlasmalar.ad : '-';

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
        <title>Proforma Fatura - ${proforma.proforma_no}</title>
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
                <div>Lalapaşa Mahallesi</div>
                <div>Samih Kobal Caddesi No:19</div>
                <div> Yakutiye / Erzurum</div>
                <div>Tel: 0442 238 83 83</div>
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
              <div class="row"><span>Proforma No:</span> <strong>${proforma.proforma_no}</strong></div>
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
              <span>${formatPara(proforma.toplam_tutar)}</span>
            </div>
          </div>

          ${proforma.notlar ? `<div class="notes"><strong>NOTLAR:</strong><br>${proforma.notlar}</div>` : ''}
          
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

  } catch (err) {
    alert('Yazdırma verisi alınırken hata: ' + err.message);
  }
};

const suresiGectiMi = (proforma) => {
  if (proforma.durum === 'Dönüştürüldü') return false;
  const bugun = new Date().toISOString().split('T')[0];
  return proforma.gecerlilik_tarihi < bugun;
};

const getDurumBadge = (durum) => {
  if (durum === 'Taslak') return 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-600';
  if (durum === 'Gönderildi') return 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-600';
  if (durum === 'Dönüştürüldü') return 'px-2 py-1 text-xs rounded bg-purple-100 text-purple-600 font-bold';
  return 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-800';
};

const isEmrineDonustur = async (proforma) => {
  if (!confirm(`${proforma.proforma_no} numaralı proformayı iş emrine dönüştürmek istiyor musunuz?`)) return;

  try {
    loading.value = true;
    
    // Proforma kalemlerini (yeni kolonlarla beraber) çek
    const { data: kalemler } = await supabase.from('proforma_kalemleri').select('*').eq('proforma_id', proforma.id);

    // İş Emri oluştur
    const { data: yeniIsEmri, error: isEmriError } = await supabase.from('is_emirleri').insert([{
      musteri_id: proforma.musteri_id,
      siparis_tarihi: new Date().toISOString().split('T')[0],
      is_emri_tipi: 'SİPARİŞ',
      durum: 'Açık',
      toplam_tutar: proforma.toplam_tutar,
      notlar: `Proformadan dönüştürüldü (Ref: ${proforma.proforma_no})\n\n${proforma.notlar || ''}`,
      maliyet: 0,
      is_tamamlandi: false
    }]).select().single();

    if (isEmriError) throw isEmriError;

    // Kalemleri aktar (Depo, Tedarikçi, Anlaşma bilgileriyle)
    if (kalemler && kalemler.length > 0) {
      const yeniKalemler = kalemler.map(k => ({
        is_emri_id: yeniIsEmri.id,
        urun_id: k.urun_id,
        aciklama: k.aciklama,
        miktar: k.miktar,
        birim_fiyat: k.birim_fiyat,
        kaynak_depo_id: k.kaynak_depo_id,
        kaynak_tedarikci_id: k.kaynak_tedarikci_id,
        anlasma_id: k.anlasma_id
      }));
      await supabase.from('is_emri_kalemleri').insert(yeniKalemler);
    }

    await supabase.from('proformalar').update({ 
      durum: 'Dönüştürüldü',
      donusturulen_is_emri_id: yeniIsEmri.id 
    }).eq('id', proforma.id);

    alert('Başarıyla iş emrine dönüştürüldü!');
    router.push(`/app/is-emirleri/${yeniIsEmri.id}`); 

  } catch (error) {
    console.error(error);
    alert('Dönüştürme hatası: ' + error.message);
  } finally {
    loading.value = false;
  }
};

const formatTarih = (t) => t ? new Date(t).toLocaleDateString('tr-TR') : '-';
const formatPara = (t) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(t || 0);

onMounted(verileriGetir);
</script>
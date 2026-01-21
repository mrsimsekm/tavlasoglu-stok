<template>
  <div>
    <!-- HEADER -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Proforma Faturalar</h1>
      <RouterLink to="/app/proformalar/yeni" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-150">
        + Yeni Proforma
      </RouterLink>
    </div>

    <!-- FİLTRE & ARAMA PANELİ -->
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Sol Taraf: Metin ve Durum Arama (6 birim) -->
        <div class="lg:col-span-6 grid grid-cols-2 gap-4">
          <div class="col-span-2 md:col-span-1">
            <label class="block text-xs font-bold text-gray-500 mb-1">Arama</label>
            <input v-model="aramaMetni" type="text" placeholder="No veya Müşteri..." class="form-input">
          </div>
          <div class="col-span-2 md:col-span-1">
            <label class="block text-xs font-bold text-gray-500 mb-1">Durum</label>
            <select v-model="durumFiltresi" class="form-input">
              <option value="Tümü">Tüm Durumlar</option>
              <option value="Taslak">Taslak</option>
              <option value="Gönderildi">Gönderildi</option>
              <option value="Dönüştürüldü">İş Emrine Dönüştü</option>
            </select>
          </div>
        </div>

        <!-- Sağ Taraf: Kategori Filtreleme (6 birim) -->
        <div class="lg:col-span-6 border-t lg:border-t-0 lg:border-l border-gray-200 lg:pl-6 pt-4 lg:pt-0">
          <label class="block text-xs font-bold text-gray-500 mb-2 uppercase">Kategoriye Göre Filtrele</label>
          <div class="flex flex-wrap gap-2">
            <label 
              v-for="kat in kategoriListesi" 
              :key="kat" 
              class="flex items-center space-x-2 cursor-pointer bg-gray-50 px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-100 transition select-none"
              :class="{'bg-indigo-50 border-indigo-200': secilenKategoriler.includes(kat)}"
            >
              <input type="checkbox" :value="kat" v-model="secilenKategoriler" class="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500">
              <span class="text-xs font-medium text-gray-700">{{ kat }}</span>
            </label>
          </div>
        </div>

      </div>
    </div>

    <!-- LİSTE TABLOSU -->
    <div class="bg-white shadow rounded-lg overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="th-style">No</th>
            <th class="th-style">Müşteri</th>
            <th class="th-style">Oluşturma Tarihi</th>
            <th class="th-style">Kategoriler</th> <!-- YENİ KOLON -->
            <th class="th-style">Geçerlilik</th>
            <th class="th-style text-right">Toplam Tutar</th>
            <th class="th-style text-center">Durum</th>
            <th class="th-style text-right" style="width: 180px;">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="text-center py-8 text-gray-500">
              <div class="flex justify-center items-center">
                <svg class="animate-spin h-5 w-5 mr-3 text-indigo-500" viewBox="0 0 24 24"><!-- SVG Spinner --></svg>
                Yükleniyor...
              </div>
            </td>
          </tr>
          <tr v-else-if="filtrelenmisProformalar.length === 0">
            <td colspan="8" class="text-center py-8 text-gray-500">Kriterlere uygun kayıt bulunamadı.</td>
          </tr>
          <tr v-else v-for="proforma in filtrelenmisProformalar" :key="proforma.id" class="hover:bg-gray-50 transition group">
            
            <!-- No -->
            <td class="td-style font-mono font-bold text-indigo-600">
              {{ proforma.proforma_no }}
            </td>
            
            <!-- Müşteri -->
            <td class="td-style font-medium text-gray-900">
              {{ proforma.musteriler?.unvan || '-' }}
            </td>
            
            <!-- Tarih -->
            <td class="td-style text-gray-600">
              {{ formatTarih(proforma.olusturma_tarihi) }}
            </td>

            <!-- Kategoriler (YENİ) -->
            <td class="td-style">
              <div class="flex flex-wrap gap-1 max-w-[200px]">
                <span v-for="k in (proforma.kategoriler || [])" :key="k" class="text-[10px] leading-tight px-2 py-1 bg-gray-100 text-gray-600 border rounded-md">
                  {{ k }}
                </span>
                <span v-if="!proforma.kategoriler || proforma.kategoriler.length === 0" class="text-xs text-gray-300 italic">-</span>
              </div>
            </td>

            <!-- Geçerlilik -->
            <td class="td-style">
              <div class="flex flex-col">
                <span class="text-gray-600">{{ formatTarih(proforma.gecerlilik_tarihi) }}</span>
                <span v-if="suresiGectiMi(proforma)" class="mt-1 text-[10px] text-red-600 font-bold bg-red-50 px-1 rounded w-fit">Süresi Doldu</span>
              </div>
            </td>

            <!-- Tutar -->
            <td class="td-style text-right font-bold text-gray-800">
              {{ formatPara(proforma.toplam_tutar, proforma.para_birimi) }}
            </td>

            <!-- Durum -->
            <td class="td-style text-center">
              <span :class="getDurumBadge(proforma.durum)">{{ proforma.durum }}</span>
            </td>

            <!-- İşlemler -->
            <td class="td-style text-right">
              <div class="flex justify-end items-center space-x-2 opacity-100 md:opacity-80 md:group-hover:opacity-100 transition-opacity">
                
                <!-- Detay -->
                <button @click="router.push(`/app/proformalar/${proforma.id}`)" class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition" title="Detay & Düzenle">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>

                <!-- Yazdır -->
                <button @click="yazdirProforma(proforma)" class="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition" title="Hızlı Yazdır">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </button>

                <!-- Dönüştür -->
                <button 
                  v-if="proforma.durum !== 'Dönüştürüldü'"
                  @click="detayaGitVeDonustur(proforma)" 
                  class="ml-2 text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-md font-medium transition flex items-center"
                  title="İş Emrine Dönüştür"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  İş Emri
                </button>
                
                <span v-else class="ml-2 text-[10px] uppercase font-bold tracking-wider text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100 select-none">
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
.td-style { @apply px-5 py-4 border-b border-gray-200 bg-white text-sm align-middle; }
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm; }
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
const secilenKategoriler = ref([]);

const kategoriListesi = ['KLİMA', 'VRF', 'HAVA PERDESİ', 'SOĞUK ODA', 'DX', 'ISI POMPASI', 'İŞÇİLİK', 'YEDEK PARÇA'];

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
    // 1. Arama Metni Filtresi
    const aramaUyumu = (
      p.proforma_no?.toLowerCase().includes(aramaMetni.value.toLowerCase()) ||
      p.musteriler?.unvan?.toLowerCase().includes(aramaMetni.value.toLowerCase())
    );
    
    // 2. Durum Filtresi
    const durumUyumu = durumFiltresi.value === 'Tümü' || p.durum === durumFiltresi.value;
    
    // 3. Kategori Filtresi (OR Mantığı: Seçilenlerden en az biri varsa göster)
    let kategoriUyumu = true;
    if (secilenKategoriler.value.length > 0) {
        // Eğer proformanın hiç kategorisi yoksa ve filtre seçiliyse, o proformayı gösterme
        if (!p.kategoriler || p.kategoriler.length === 0) {
            kategoriUyumu = false;
        } else {
            // Seçilen kategorilerden herhangi biri proformanın kategorileri içinde var mı?
            kategoriUyumu = secilenKategoriler.value.some(secilen => p.kategoriler.includes(secilen));
        }
    }

    return aramaUyumu && durumUyumu && kategoriUyumu;
  });
});

const detayaGitVeDonustur = (proforma) => {
  // Kullanıcıyı detay sayfasına, URL'de "?otomatikDonustur=true" parametresiyle gönderiyoruz
  router.push({
    path: `/app/proformalar/${proforma.id}`,
    query: { otomatikDonustur: 'true' }
  });
};

// --- YAZDIRMA FONKSİYONU ---
const yazdirProforma = async (proforma) => {
  try {
    const { data: kalemler, error } = await supabase.from('proforma_kalemleri').select(`*, depolar(ad), tedarikciler(ad), anlasmalar(ad)`).eq('proforma_id', proforma.id);
    if (error) throw error;

    const logoUrl = window.location.origin + '/logo11.png';
    const tarih = formatTarih(proforma.olusturma_tarihi);
    const gecerlilik = formatTarih(proforma.gecerlilik_tarihi);
    const musteri = proforma.musteriler || {};
    const pb = proforma.para_birimi || 'TRY';
    const kdvDahil = proforma.kdv_dahil;

    const kalemlerHTML = kalemler.map((kalem, index) => {
      let tutar = kalem.miktar * kalem.birim_fiyat;
      if (!kdvDahil) tutar = tutar * 1.2;
      
      // Kaynak Adı (Listede ihtiyaç olmasa da veri çekildiği için opsiyonel kullanılabilir)
      let kaynakAdi = 'Hizmet/Diğer';
      if (kalem.depolar) kaynakAdi = kalem.depolar.ad;
      else if (kalem.tedarikciler) kaynakAdi = kalem.tedarikciler.ad;

      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${index + 1}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${kalem.aciklama}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${kalem.miktar}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(kalem.birim_fiyat, pb)}<br><span style="font-size:9px;color:#666">(${kdvDahil ? 'Dahil' : 'Hariç'})</span></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(tutar, pb)}</td>
        </tr>
      `;
    }).join('');

    const genelToplam = proforma.toplam_tutar;
    const araToplam = genelToplam / 1.2;
    const toplamKDV = genelToplam - araToplam;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>Proforma Fatura - ${proforma.proforma_no}</title>
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
          .footer-note { position: fixed; bottom: 0; left: 0; width: 100%; text-align: center; font-size: 10px; color: #666; padding: 10px; background: white; }
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

          ${proforma.notlar ? `<div class="notes"><strong>NOTLAR:</strong><br>${proforma.notlar.replace(/\n/g, '<br>')}</div>` : ''}
          
          <div class="footer-note">
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
    setTimeout(() => { printWindow.print(); }, 500);
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

const formatTarih = (t) => t ? new Date(t).toLocaleDateString('tr-TR') : '-';
const formatPara = (val, currency = 'TRY') => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency || 'TRY' }).format(val || 0);

onMounted(verileriGetir);
</script>
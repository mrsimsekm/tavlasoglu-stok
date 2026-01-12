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

              <div>
                <label class="label-style">Geçerlilik Tarihi (*)</label>
                <input v-model="form.gecerlilik_tarihi" type="date" required class="form-input">
              </div>
              <div class="col-span-2">
                <label class="label-style">Notlar</label>
                <textarea 
                  v-model="form.notlar" 
                  rows="3" 
                  class="form-input" 
                  placeholder="Örn: Fiyatlar 7 gün geçerlidir. Ödeme peşindir vb."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- KALEMLER -->
        <div>
          <h2 class="text-xl font-semibold mb-4 text-gray-700">Ürün ve Hizmetler</h2>
          
          <div v-if="loadingResources" class="text-center py-4 text-gray-500">Kaynaklar yükleniyor...</div>
          
          <!-- GÜNCELLEME: :para-birimi PROPU EKLENDİ -->
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

        <!-- FOOTER / BUTONLAR -->
        <div class="flex justify-between items-center pt-6 border-t">
          <div class="text-lg font-bold text-gray-700">
            Toplam Tutar: <span class="text-blue-600">{{ formatPara(toplamTutar, form.para_birimi) }}</span>
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

const router = useRouter();
const loading = ref(false);
const loadingNo = ref(true);
const loadingResources = ref(true);
const secilenMusteri = ref(null);
const kalemler = ref([]);

const depolar = ref([]);
const tedarikciler = ref([]);
const anlasmalar = ref([]);

const form = ref({
  musteri_id: null,
  proforma_no: '',
  gecerlilik_tarihi: '', 
  notlar: '',
  para_birimi: 'TRY' // Varsayılan
});

const yeniNumaraOlustur = async () => {
  loadingNo.value = true;
  try {
    const yil = new Date().getFullYear();
    const prefix = `KHV${yil}`;
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
});

const handleMusteriSecildi = (m) => { secilenMusteri.value = m; form.value.musteri_id = m.id; };
const handleKalemler = (l) => { kalemler.value = l; };
const toplamTutar = computed(() => kalemler.value.reduce((s, i) => s + (i.miktar * i.birim_fiyat), 0));

const kaydet = async () => {
  try {
    loading.value = true;
    const { data: proforma, error } = await supabase.from('proformalar').insert([{
      musteri_id: form.value.musteri_id,
      proforma_no: form.value.proforma_no,
      gecerlilik_tarihi: form.value.gecerlilik_tarihi,
      notlar: form.value.notlar,
      toplam_tutar: toplamTutar.value,
      para_birimi: form.value.para_birimi,
      durum: 'Taslak'
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

const taslakYazdir = () => {
  if (kalemler.value.length === 0) { alert("Yazdırmak için en az bir ürün eklemelisiniz."); return; }
  const logoUrl = window.location.origin + '/logo11.png';
  const tarih = new Date().toLocaleDateString('tr-TR');
  const gecerlilik = form.value.gecerlilik_tarihi ? new Date(form.value.gecerlilik_tarihi).toLocaleDateString('tr-TR') : '-';
  const musteri = secilenMusteri.value || { unvan: 'Sayın Yetkili', ilgili_kisi: '', vergi_dairesi: '', vergi_no: '', adres: '' };
  const pb = form.value.para_birimi;
  
  const kalemlerHTML = kalemler.value.map((kalem, index) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${index + 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${kalem.aciklama}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${kalem.miktar}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(kalem.birim_fiyat, pb)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(kalem.miktar * kalem.birim_fiyat, pb)}</td>
    </tr>
  `).join('');

  const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8"><title>Proforma Taslak</title>
        <style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'); @page{margin:1cm;size:A4;} body{font-family:'Inter',sans-serif;color:#333;line-height:1.5;margin:0;padding:0;font-size:12px;} .container{max-width:210mm;margin:0 auto;background:white;} .header{display:flex;justify-content:space-between;margin-bottom:40px;border-bottom:2px solid #eee;padding-bottom:20px;} .logo-area img{height:80px;} .company-details{text-align:right;font-size:11px;color:#555;} .doc-title{text-align:center;font-size:20px;font-weight:bold;margin-bottom:30px;text-transform:uppercase;letter-spacing:1px;color:#4f46e5;} .info-grid{display:flex;justify-content:space-between;margin-bottom:30px;} .info-box{width:48%;} .box-title{font-size:13px;font-weight:bold;border-bottom:1px solid #ddd;margin-bottom:10px;padding-bottom:5px;} .row{display:flex;justify-content:space-between;margin-bottom:5px;} table{width:100%;border-collapse:collapse;margin-bottom:30px;} th{background:#f9fafb;padding:10px;border-bottom:2px solid #ddd;text-align:left;font-size:11px;} .totals{display:flex;justify-content:flex-end;} .total-row{display:flex;justify-content:space-between;width:250px;padding:5px 0;font-weight:bold;font-size:14px;border-top:2px solid #333;} .notes{background:#f9fafb;padding:15px;border-left:4px solid #ddd;margin-top:30px;}</style>
      </head>
      <body>
        <div class="container">
          <div class="header"><div class="logo-area"><img src="${logoUrl}" alt="Logo"></div><div class="company-details"><strong>ŞİRKET ÜNVANI A.Ş.</strong><br>Adres...</div></div>
          <div class="doc-title">PROFORMA FATURA (TASLAK)</div>
          <div class="info-grid">
            <div class="info-box"><div class="box-title">SAYIN / MÜŞTERİ</div><div class="row"><strong>${musteri.unvan}</strong></div><div class="row"><span>İlgili:</span> <span>${musteri.ilgili_kisi}</span></div></div>
            <div class="info-box"><div class="box-title">BELGE DETAYLARI</div><div class="row"><span>No:</span> <strong>${form.value.proforma_no}</strong></div><div class="row"><span>Tarih:</span> <span>${tarih}</span></div></div>
          </div>
          <table><thead><tr><th style="text-align:center;">#</th><th>Açıklama</th><th style="text-align:center;">Miktar</th><th style="text-align:right;">Birim Fiyat</th><th style="text-align:right;">Tutar</th></tr></thead><tbody>${kalemlerHTML}</tbody></table>
          <div class="totals"><div class="total-row"><span>GENEL TOPLAM</span><span>${formatPara(toplamTutar.value, pb)}</span></div></div>
          ${form.value.notlar ? `<div class="notes"><strong>NOTLAR:</strong><br>${form.value.notlar.replace(/\n/g, '<br>')}</div>` : ''}
        </div>
      </body>
      </html>`;
  
  const w = window.open(); w.document.write(htmlContent); w.document.close(); w.focus(); setTimeout(()=>w.print(), 500);
};

const formatPara = (val, currency = 'TRY') => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency || 'TRY' }).format(val || 0);
</script>
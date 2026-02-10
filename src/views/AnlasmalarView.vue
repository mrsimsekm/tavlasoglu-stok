<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-4">Anlaşmalar (Bağlantılar)</h1>
    
    <!-- Üst Bar: Arama ve Yeni Ekle -->
    <div class="flex justify-between items-center mb-6">
      <div class="relative w-1/3">
        <input 
          type="text" 
          placeholder="Anlaşma adı veya tedarikçi ara..." 
          v-model="aramaMetni" 
          class="w-full p-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
      <button @click="formModaliniAc()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm flex items-center transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Yeni Anlaşma
      </button>
    </div>

    <!-- Tablo -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <div class="overflow-x-auto">
        <table class="min-w-full leading-normal">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th @click="siralamayiDegistir('ad')" class="th-sortable group w-1/3">
                <div class="flex items-center">Anlaşma Adı <SiralamaIcon kolon="ad" :aktifKolon="sortBy" :yon="sortDirection" /></div>
              </th>
              <th @click="siralamayiDegistir('tedarikci_ad')" class="th-sortable group">
                <div class="flex items-center">Tedarikçi <SiralamaIcon kolon="tedarikci_ad" :aktifKolon="sortBy" :yon="sortDirection" /></div>
              </th>
              <th class="th-style">Tip</th>
              <th class="th-style">Kullanım Durumu</th>
              <th class="th-style">İskonto</th>
              <th class="th-style">Durum</th>
              <th class="th-style text-center">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-10 text-gray-500">
                <div class="flex flex-col items-center justify-center">
                  <svg class="animate-spin h-8 w-8 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Yükleniyor...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="anlasmalar.length === 0">
              <td colspan="7" class="text-center py-10 text-gray-500 italic">Gösterilecek anlaşma bulunamadı.</td>
            </tr>
            <tr v-else v-for="anlasma in anlasmalar" :key="anlasma.id" class="hover:bg-gray-50 transition-colors">
              <td class="td-style font-semibold text-gray-800">{{ anlasma.ad }}</td>
              <td class="td-style text-gray-600">{{ anlasma.tedarikci_ad || '-' }}</td>
              <td class="td-style"><span class="px-2 py-1 text-xs rounded-full font-medium" :class="anlasma.tip === 'Tutar Bazlı' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'">{{ anlasma.tip }}</span></td>
              <td class="td-style">
                <div v-if="anlasma.tip === 'Tutar Bazlı'">
                  <div v-if="anlasma.taahhut_tutari > 0">
                    <div class="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                      <div class="bg-blue-600 h-4 rounded-full text-white text-xs flex items-center justify-center transition-all duration-500" :style="{ width: kullanimOrani(anlasma.kullanilan_tutar, anlasma.taahhut_tutari) + '%' }">
                        <span v-if="kullanimOrani(anlasma.kullanilan_tutar, anlasma.taahhut_tutari) > 15" class="absolute left-0 right-0 text-center">{{ kullanimOrani(anlasma.kullanilan_tutar, anlasma.taahhut_tutari).toFixed(0) }}%</span>
                      </div>
                    </div>
                    <p class="text-xs text-gray-600 mt-1 font-mono">{{ formatPara(anlasma.kullanilan_tutar) }} / {{ formatPara(anlasma.taahhut_tutari) }}</p>
                  </div>
                  <div v-else><p class="text-xs text-gray-500 italic">Taahhütsüz</p></div>
                </div>
                <div v-else-if="anlasma.tip === 'Ürün Bazlı'">
                  <p class="font-semibold text-gray-700 text-xs">{{ anlasma.toplam_kullanilan_adet }} / {{ anlasma.toplam_taahhut_adet }} adet</p>
                  <div class="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden"><div class="bg-purple-600 h-2 rounded-full transition-all duration-500" :style="{ width: kullanimOrani(anlasma.toplam_kullanilan_adet, anlasma.toplam_taahhut_adet) + '%' }"></div></div>
                </div>
                <div v-else><p class="text-xs text-gray-600">-</p></div>
              </td>
              <td class="td-style">{{ anlasma.iskonto_orani || '-' }}</td>
              <td class="td-style">
                <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="anlasma.aktif_mi ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ anlasma.aktif_mi ? 'Aktif' : 'Pasif' }}
                </span>
              </td>
              <td class="td-style text-center">
                <div class="flex item-center justify-center space-x-3">
                  <button @click="detayModaliniAc(anlasma)" class="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded" title="Detay"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg></button>
                  <button @click="formModaliniAc(anlasma)" class="text-yellow-500 hover:text-yellow-700 bg-yellow-50 p-1.5 rounded" title="Düzenle"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg></button>
                  <button @click="anlasmaSil(anlasma)" class="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded" title="Sil"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Sayfalama -->
      <div class="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div>
          <p class="text-sm text-gray-700">
            Toplam <span class="font-medium">{{ totalCount }}</span> kayıttan 
            <span class="font-medium">{{ (mevcutSayfa - 1) * limit + 1 }}</span> - 
            <span class="font-medium">{{ Math.min(mevcutSayfa * limit, totalCount) }}</span> arası gösteriliyor.
          </p>
        </div>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button @click="sayfaDegistir(mevcutSayfa - 1)" :disabled="mevcutSayfa === 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Önceki</button>
          <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">Sayfa {{ mevcutSayfa }}</span>
          <button @click="sayfaDegistir(mevcutSayfa + 1)" :disabled="mevcutSayfa * limit >= totalCount" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Sonraki</button>
        </nav>
      </div>
    </div>
    
    <!-- YENİ / DÜZENLEME MODALI -->
    <BaseModal :show="formModalGoster" @close="formModalGoster = false" max-width="max-w-4xl">
      <template #header>{{ duzenlemeModu ? 'Anlaşma Düzenle' : 'Yeni Anlaşma Ekle' }}</template>
      <template #body>
        <form @submit.prevent="formuKaydet" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="col-span-2"><label class="label-style">Anlaşma Adı (*)</label><input v-model="aktifAnlasma.ad" type="text" required class="form-input"></div>
            <div><label class="label-style">Tedarikçi (*)</label><select v-model="aktifAnlasma.tedarikci_id" required class="form-input"><option :value="null" disabled>Tedarikçi Seçin</option><option v-for="tedarikci in tedarikciler" :key="tedarikci.id" :value="tedarikci.id">{{ tedarikci.ad }}</option></select></div>
            <div><label class="label-style">Anlaşma Tipi</label><select v-model="aktifAnlasma.tip" class="form-input" :disabled="duzenlemeModu"><option>Tutar Bazlı</option><option>Ürün Bazlı</option></select></div>
            <div class="col-span-2">
              <label class="label-style">Durum</label>
              <div class="flex items-center mt-2">
                <label class="inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="aktifAnlasma.aktif_mi" class="sr-only peer">
                  <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  <span class="ms-3 text-sm font-medium" :class="aktifAnlasma.aktif_mi ? 'text-green-700' : 'text-gray-500'">{{ aktifAnlasma.aktif_mi ? 'Aktif' : 'Pasif' }}</span>
                </label>
              </div>
            </div>
          </div>
          <div v-if="aktifAnlasma.tip === 'Tutar Bazlı'" class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
            <div><label class="label-style">Taahhüt Tutarı</label><input v-model.number="aktifAnlasma.taahhut_tutari" type="number" step="0.01" class="form-input"></div>
            <div><label class="label-style">İskonto Oranı (%)</label><input v-model="aktifAnlasma.iskonto_orani" type="text" class="form-input"></div>
          </div>
          <div v-if="aktifAnlasma.tip === 'Ürün Bazlı'" class="border-t border-gray-200 pt-4">
            <h3 class="font-semibold mb-2 text-gray-700">Anlaşma Kalemleri</h3>
            <div class="grid grid-cols-12 gap-2 items-center mb-4">
               <div class="col-span-6 relative">
                 <input type="text" v-model="urunAramaMetni" @input="urunAra" placeholder="Ürün Ara (Kod veya Açıklama)..." class="form-input" />
                 <div v-if="urunAramaSonuclari.length > 0" class="absolute bg-white border w-full shadow-lg z-10 rounded-md max-h-48 overflow-y-auto"><ul><li v-for="urun in urunAramaSonuclari" :key="urun.id" @click="urunSec(urun)" class="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-0">{{ urun.urun_kodu }} - {{ urun.aciklama }}</li></ul></div>
               </div>
               <div class="col-span-2"><input type="number" v-model="seciliUrunMiktar" placeholder="Miktar" class="form-input" /></div>
               <div class="col-span-2"><input type="number" v-model="seciliUrunBirimFiyat" placeholder="Birim Fiyat" class="form-input" step="0.01" /></div>
               <div class="col-span-2"><button @click="anlasmaKalemiEkle" type="button" class="btn-secondary w-full">Ekle</button></div>
            </div>
            
            <div class="mt-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              <table class="min-w-full">
                <thead class="bg-gray-50 sticky top-0">
                  <tr>
                    <th class="th-style">Ürün</th><th class="th-style text-right">Taahhüt Miktarı</th><th class="th-style text-right">Birim Fiyat</th><th class="th-style text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody class="bg-white">
                  <tr v-if="!aktifAnlasma.anlasma_kalemleri || aktifAnlasma.anlasma_kalemleri.length === 0"><td colspan="4" class="text-center py-4 text-gray-500">Henüz anlaşma kalemi eklenmedi.</td></tr>
                  <tr v-for="(kalem, index) in aktifAnlasma.anlasma_kalemleri" :key="index">
                      <td class="td-style font-medium text-gray-800">{{ kalem.urunler?.aciklama || 'Ürün bilgisi yükleniyor...' }}</td>
                      <td class="td-style text-right">{{ kalem.taahhut_edilen_miktar }} adet</td>
                      <td class="td-style text-right">{{ formatPara(kalem.birim_fiyat) }}</td>
                      <td class="td-style text-center">
                        <button @click="anlasmaKalemiSil(index)" type="button" class="text-red-500 hover:text-red-700"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
                      </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </form>
      </template>
      <template #footer>
        <button @click="formModalGoster = false" class="btn-secondary mr-2">İptal</button>
        <button @click="formuKaydet" :disabled="anlasmaKayitYapiliyor" class="btn-primary">
          {{ anlasmaKayitYapiliyor ? 'Kaydediliyor...' : (duzenlemeModu ? 'Güncelle' : 'Kaydet') }}
        </button>
      </template>
    </BaseModal>

    <!-- DETAY MODAL -->
    <BaseModal :show="detayModalGoster" @close="detayModalGoster = false" max-width="max-w-4xl">
      <template #header>{{ secilenAnlasmaDetay?.ad || 'Anlaşma Detayı' }}</template>
      <template #body>
        <div class="max-h-[70vh] overflow-y-auto px-1">
          <div v-if="detayYukleniyor" class="text-center py-4 text-gray-500">Yükleniyor...</div>
          <div v-else-if="secilenAnlasmaDetay" class="space-y-4">
            <!-- ANLAŞMA BİLGİLERİ -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 class="font-semibold mb-2 text-gray-800">Anlaşma Bilgileri</h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div><span class="font-medium text-gray-600">Tedarikçi:</span> {{ secilenAnlasmaDetay.tedarikciler?.ad || '-' }}</div>
                <div><span class="font-medium text-gray-600">Tip:</span> {{ secilenAnlasmaDetay.tip }}</div>
                <div v-if="secilenAnlasmaDetay.tip === 'Tutar Bazlı'"><span class="font-medium text-gray-600">Taahhüt:</span> {{ formatPara(secilenAnlasmaDetay.taahhut_tutari) }}</div>
                <div v-if="secilenAnlasmaDetay.tip === 'Tutar Bazlı'"><span class="font-medium text-gray-600">Kullanılan:</span> {{ formatPara(secilenAnlasmaDetay.kullanilan_tutar) }}</div>
                <div v-if="secilenAnlasmaDetay.tip === 'Ürün Bazlı'"><span class="font-medium text-gray-600">Taahhüt (Top.):</span> {{ secilenAnlasmaDetay.toplam_taahhut_adet || 0 }} adet</div>
                <div v-if="secilenAnlasmaDetay.tip === 'Ürün Bazlı'"><span class="font-medium text-gray-600">Kullanılan (Top.):</span> {{ secilenAnlasmaDetay.toplam_kullanilan_adet || 0 }} adet</div>
              </div>
            </div>

            <!-- KULLANIM DETAYLARI -->
            <div>
              <h3 class="font-semibold mb-3 mt-4 text-gray-800">Kullanım Hareketleri</h3>
              <!-- TUTAR BAZLI -->
              <div v-if="secilenAnlasmaDetay.tip === 'Tutar Bazlı'">
                <div v-if="karisikHareketler.length === 0" class="text-center py-4 text-gray-500 bg-gray-50 rounded border border-dashed">Bu anlaşma henüz kullanılmamış.</div>
                <div v-else class="overflow-x-auto border border-gray-200 rounded-lg">
                  <table class="min-w-full leading-normal">
                    <thead class="bg-gray-50"><tr><th class="th-style">Tarih</th><th class="th-style">Tür</th><th class="th-style">Detay</th><th class="th-style text-right">Tutar</th></tr></thead>
                    <tbody>
                      <tr v-for="hareket in karisikHareketler" :key="hareket.uniqueId" class="border-b last:border-0 hover:bg-gray-50">
                        <td class="td-style">{{ new Date(hareket.tarih).toLocaleDateString('tr-TR') }}</td>
                        <td class="td-style"><span class="px-2 py-1 text-xs rounded-full" :class="hareket.tip === 'is_emri' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">{{ hareket.tip === 'is_emri' ? 'İş Emri' : 'Stok Girişi' }}</span></td>
                        <td class="td-style">
                          <span v-if="hareket.tip === 'is_emri'"><RouterLink :to="`/app/is-emirleri/${hareket.detayId}`" class="text-blue-600 hover:underline">#{{ hareket.detayNo }} - {{ hareket.musteri }}</RouterLink></span>
                          <span v-else>{{ hareket.depo }} ({{ hareket.aciklama || 'Giriş' }})</span>
                        </td>
                        <td class="td-style text-right font-mono">{{ formatPara(hareket.tutar) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <!-- ÜRÜN BAZLI -->
              <div v-else-if="secilenAnlasmaDetay.tip === 'Ürün Bazlı'">
                <div v-if="urunBazliDetaylar.length === 0" class="text-center py-4 text-gray-500">Ürün kalemi bulunmuyor.</div>
                <div v-else class="space-y-3">
                  <div v-for="urunDetay in urunBazliDetaylar" :key="urunDetay.urun_id" class="border rounded-lg bg-white shadow-sm overflow-hidden">
                    <div @click="toggleUrunDetay(urunDetay.urun_id)" class="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center transition-colors">
                      <div><h4 class="font-semibold text-gray-800">{{ urunDetay.urun_kodu }} - {{ urunDetay.urun_aciklama }}</h4><div class="text-sm text-gray-600 mt-1">Kullanılan: <span class="font-bold text-indigo-700">{{ urunDetay.toplam_kullanilan }}</span> / {{ urunDetay.taahhut_edilen_miktar }} adet</div></div>
                      <svg class="h-5 w-5 text-gray-500 transition-transform duration-200" :class="expandedUrunler[urunDetay.urun_id] ? 'rotate-180' : ''" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </div>
                    <div v-show="expandedUrunler[urunDetay.urun_id]" class="p-3 border-t bg-white">
                      <div v-if="urunDetay.hareketler.length === 0" class="text-center py-2 text-sm text-gray-500">Hareket yok.</div>
                      <table v-else class="min-w-full text-sm">
                        <thead><tr class="text-left text-gray-500 border-b"><th class="pb-2">Tarih</th><th>Tür</th><th>Detay</th><th class="text-right pb-2">Miktar</th></tr></thead>
                        <tbody>
                          <tr v-for="h in urunDetay.hareketler" :key="h.uniqueId" class="border-b last:border-0"><td class="py-2">{{ new Date(h.tarih).toLocaleDateString('tr-TR') }}</td><td class="py-2">{{ h.tip === 'is_emri' ? 'İş Emri' : 'Stok Girişi' }}</td><td class="py-2"><span v-if="h.tip === 'is_emri'">#{{ h.detayNo }}</span><span v-else>{{ h.depo }}</span></td><td class="py-2 text-right font-bold">{{ h.miktar }}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer><button @click="detayModalGoster = false" class="btn-secondary">Kapat</button></template>
    </BaseModal>
  </div>
</template>

<style scoped>
.th-style { @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky top-0; }
.th-sortable { @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors select-none sticky top-0; }
.td-style { @apply px-5 py-5 border-b border-gray-200 bg-white text-sm align-middle; }
.label-style { @apply block text-sm font-medium text-gray-700 mb-1; }
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors; }
.btn-primary { @apply bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition disabled:bg-gray-400 disabled:cursor-not-allowed; }
.btn-secondary { @apply bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 rounded-lg shadow-sm transition; }
</style>

<script setup>
import { ref, onMounted, onActivated, watch, defineAsyncComponent } from 'vue';
import { supabase } from '../supabase.js';
import BaseModal from '../components/BaseModal.vue';
import { useLoading } from '../composables/useLoading.js';
import { RouterLink } from 'vue-router';

const { isLoading: anlasmaKayitYapiliyor, withLoading } = useLoading();

// --- COMPONENTS ---
const SiralamaIcon = defineAsyncComponent(() => 
  Promise.resolve({
    props: ['kolon', 'aktifKolon', 'yon'],
    template: `
      <div class="inline-block w-4 h-4 ml-1 text-gray-400 group-hover:text-gray-600">
        <svg v-if="aktifKolon === kolon && yon === 'asc'" class="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
        <svg v-else-if="aktifKolon === kolon && yon === 'desc'" class="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        <svg v-else class="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
      </div>`
  })
);

// --- STATE ---
const anlasmalar = ref([]);
const tedarikciler = ref([]);
const loading = ref(true);
const aramaMetni = ref('');
let aramaDebounce;

// Sayfalama & Sıralama
const mevcutSayfa = ref(1);
const limit = 10;
const totalCount = ref(0);
// Varsayılan sıralama: Oluşturulma tarihi (Yeniden eskiye)
const sortBy = ref('olusturulma_tarihi');
const sortDirection = ref('desc');

// Form Modalı
const formModalGoster = ref(false);
const duzenlemeModu = ref(false);
const aktifAnlasma = ref({ anlasma_kalemleri: [] });
const urunAramaMetni = ref('');
const urunAramaSonuclari = ref([]);
const seciliUrun = ref(null);
const seciliUrunMiktar = ref(1);
const seciliUrunBirimFiyat = ref(null);

// Detay Modalı
const detayModalGoster = ref(false);
const secilenAnlasmaDetay = ref(null);
const detayYukleniyor = ref(false);
const karisikHareketler = ref([]);
const urunBazliDetaylar = ref([]);
const expandedUrunler = ref({});

// --- DATA FETCHING (RPC) ---
const getAnlasmalar = async () => {
  loading.value = true;
  try {
    const offset = (mevcutSayfa.value - 1) * limit;

    const { data, error } = await supabase.rpc('get_anlasmalar_paginated', {
      p_limit: limit,
      p_offset: offset,
      p_arama_metni: aramaMetni.value || null,
      p_sort_by: sortBy.value,
      p_sort_direction: sortDirection.value
    });

    if (error) throw error;
    
    anlasmalar.value = data || [];
    totalCount.value = data && data.length > 0 ? data[0].total_count : 0;

  } catch (err) {
    console.error("Anlaşmalar çekilirken hata:", err);
    alert("Hata: " + err.message);
  } finally {
    loading.value = false;
  }
};

const getTedarikciler = async () => {
  const { data } = await supabase.from('tedarikciler').select('id, ad').order('ad');
  tedarikciler.value = data || [];
};

// --- LIFECYCLE & WATCHERS ---
onMounted(() => {
  getTedarikciler();
  getAnlasmalar(); // Keep-alive yoksa burada çağırılır
});
onActivated(() => { // Keep-alive varsa
  getAnlasmalar();
});
watch(aramaMetni, () => {
  clearTimeout(aramaDebounce);
  aramaDebounce = setTimeout(() => {
    mevcutSayfa.value = 1;
    getAnlasmalar();
  }, 500);
});

// --- UI ACTIONS ---
const sayfaDegistir = (yeniSayfa) => {
  if (yeniSayfa < 1 || (yeniSayfa - 1) * limit >= totalCount.value) return;
  mevcutSayfa.value = yeniSayfa;
  getAnlasmalar();
};

const siralamayiDegistir = (kolonKey) => {
  if (sortBy.value === kolonKey) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = kolonKey;
    sortDirection.value = 'asc';
  }
  mevcutSayfa.value = 1;
  getAnlasmalar();
};

// --- FORM İŞLEMLERİ ---
const formModaliniAc = (anlasma = null) => {
  urunAramaMetni.value = ''; urunAramaSonuclari.value = []; seciliUrun.value = null; seciliUrunMiktar.value = 1; seciliUrunBirimFiyat.value = null;
  if (anlasma) { duzenlemeModu.value = true; aktifAnlasma.value = JSON.parse(JSON.stringify(anlasma)); } 
  else { duzenlemeModu.value = false; aktifAnlasma.value = { ad: '', tedarikci_id: null, aktif_mi: true, tip: 'Tutar Bazlı', anlasma_kalemleri: [] }; }
  formModalGoster.value = true;
};

const formuKaydet = async () => {
  if (!aktifAnlasma.value.ad || !aktifAnlasma.value.tedarikci_id) { alert('Anlaşma Adı ve Tedarikçi zorunludur.'); return; }
  await withLoading(async () => {
    // Sadece gerekli alanları gönder (RPC'den gelen ekstra kolonları filtrele)
    const { id, ad, tedarikci_id, tip, iskonto_orani, taahhut_tutari, aktif_mi, anlasma_kalemleri } = aktifAnlasma.value;
    const dbData = { ad, tedarikci_id, tip, iskonto_orani, taahhut_tutari, aktif_mi };
    let anlasmaId;

    if (duzenlemeModu.value) {
      const { data, error } = await supabase.from('anlasmalar').update(dbData).match({ id }).select('id').single();
      if (error) throw error;
      anlasmaId = data.id;
      // Kalemleri güncelle (silip yeniden ekle - en basiti)
      await supabase.from('anlasma_kalemleri').delete().match({ anlasma_id: anlasmaId });
    } else {
      const { data, error } = await supabase.from('anlasmalar').insert([dbData]).select('id').single();
      if (error) throw error;
      anlasmaId = data.id;
    }

    if (aktifAnlasma.value.tip === 'Ürün Bazlı' && anlasma_kalemleri?.length > 0) {
      const kalemlerToInsert = anlasma_kalemleri.map(k => ({ 
        anlasma_id: anlasmaId, 
        urun_id: k.urun_id, 
        taahhut_edilen_miktar: k.taahhut_edilen_miktar, 
        birim_fiyat: k.birim_fiyat 
      }));
      const { error: kalemError } = await supabase.from('anlasma_kalemleri').insert(kalemlerToInsert);
      if (kalemError) throw kalemError;
    }
    
    await getAnlasmalar();
    formModalGoster.value = false;
  });
};

const anlasmaSil = async (anlasma) => {
  if (confirm(`'${anlasma.ad}' silinecek. Emin misiniz?`)) {
    const { error } = await supabase.from('anlasmalar').delete().match({ id: anlasma.id });
    if (error) alert('Silme hatası: ' + error.message);
    else await getAnlasmalar();
  }
};

// --- ÜRÜN ARAMA & EKLEME (Form Modal) ---
let debounceTimer_urun;
const urunAra = () => {
  clearTimeout(debounceTimer_urun);
  debounceTimer_urun = setTimeout(async () => {
    if (urunAramaMetni.value.length < 2) { urunAramaSonuclari.value = []; return; }
    // Ürün arama sorgusu: kod veya açıklama (Sayısal kod için cast gerekli olabilir ama view'da string)
    const { data } = await supabase.from('urunler').select('id, urun_kodu, aciklama').or(`urun_kodu.ilike.%${urunAramaMetni.value}%,aciklama.ilike.%${urunAramaMetni.value}%`).limit(5);
    urunAramaSonuclari.value = data || [];
  }, 300);
};
const urunSec = (urun) => { seciliUrun.value = urun; urunAramaMetni.value = `${urun.urun_kodu} - ${urun.aciklama}`; urunAramaSonuclari.value = []; };
const anlasmaKalemiEkle = () => {
  if (!seciliUrun.value || !seciliUrunMiktar.value) return;
  if (!aktifAnlasma.value.anlasma_kalemleri) aktifAnlasma.value.anlasma_kalemleri = [];
  aktifAnlasma.value.anlasma_kalemleri.push({ 
    urun_id: seciliUrun.value.id, 
    urunler: { aciklama: `${seciliUrun.value.urun_kodu} - ${seciliUrun.value.aciklama}` }, 
    taahhut_edilen_miktar: seciliUrunMiktar.value, 
    birim_fiyat: seciliUrunBirimFiyat.value 
  });
  urunAramaMetni.value = ''; seciliUrun.value = null; seciliUrunMiktar.value = 1; seciliUrunBirimFiyat.value = null;
};
const anlasmaKalemiSil = (index) => { aktifAnlasma.value.anlasma_kalemleri.splice(index, 1); };

// --- DETAY MODALI ---
const detayModaliniAc = async (anlasma) => {
  secilenAnlasmaDetay.value = anlasma;
  detayModalGoster.value = true;
  detayYukleniyor.value = true;
  expandedUrunler.value = {}; karisikHareketler.value = []; urunBazliDetaylar.value = [];
  
  try {
    // 1. İş Emirleri
    const { data: isEmriData } = await supabase
      .from('is_emri_kalemleri')
      .select(`is_emri_id, miktar, birim_fiyat, urun_id, is_emirleri!inner(id, siparis_tarihi, durum, numara, musteriler(unvan)), urunler(urun_kodu, aciklama)`)
      .eq('anlasma_id', anlasma.id)
      .not('is_emirleri.durum', 'eq', 'İptal Edildi');

    // 2. Stok Girişleri
    const { data: stokData } = await supabase
      .from('stok_hareketleri')
      .select(`*, urunler(urun_kodu, aciklama), depolar(ad)`)
      .eq('anlasma_id', anlasma.id)
      .eq('hareket_tipi', 'giris');

    // Verileri İşle
    if (anlasma.tip === 'Tutar Bazlı') {
      const list = [];
      isEmriData?.forEach(i => list.push({ uniqueId: 'ie'+i.is_emri_id+Math.random(), tip: 'is_emri', tarih: i.is_emirleri.siparis_tarihi, detayId: i.is_emri_id, detayNo: i.is_emirleri.numara, musteri: i.is_emirleri.musteriler?.unvan, tutar: i.miktar * i.birim_fiyat }));
      stokData?.forEach(s => list.push({ uniqueId: 'stok'+s.id, tip: 'stok_giris', tarih: s.olusturulma_tarihi, depo: s.depolar?.ad, aciklama: s.aciklama, tutar: s.tutar || 0 }));
      karisikHareketler.value = list.sort((a,b) => new Date(b.tarih) - new Date(a.tarih));
    } else {
      // Ürün Bazlı: Önce ürün listesini al (Anlasma Kalemleri'nden veya hareketlerden)
      const { data: kalemler } = await supabase.from('anlasma_kalemleri').select('*, urunler(urun_kodu, aciklama)').eq('anlasma_id', anlasma.id);
      
      const tempDetails = [];
      for(const k of kalemler || []) {
        const urunIE = isEmriData?.filter(i => i.urun_id === k.urun_id).map(i => ({ uniqueId: 'ie'+i.is_emri_id+Math.random(), tip: 'is_emri', tarih: i.is_emirleri.siparis_tarihi, detayId: i.is_emri_id, detayNo: i.is_emirleri.numara, musteri: i.is_emirleri.musteriler?.unvan, miktar: i.miktar }));
        const urunStok = stokData?.filter(s => s.urun_id === k.urun_id).map(s => ({ uniqueId: 'stok'+s.id, tip: 'stok_giris', tarih: s.olusturulma_tarihi, depo: s.depolar?.ad, miktar: s.miktar }));
        const combined = [...(urunIE||[]), ...(urunStok||[])].sort((a,b) => new Date(b.tarih) - new Date(a.tarih));
        
        tempDetails.push({
          urun_id: k.urun_id,
          urun_kodu: k.urunler?.urun_kodu,
          urun_aciklama: k.urunler?.aciklama,
          taahhut_edilen_miktar: k.taahhut_edilen_miktar,
          toplam_kullanilan: combined.reduce((sum, h) => sum + h.miktar, 0),
          hareketler: combined
        });
      }
      urunBazliDetaylar.value = tempDetails;
    }
  } catch (err) { console.error(err); } finally { detayYukleniyor.value = false; }
};

const toggleUrunDetay = (id) => { expandedUrunler.value[id] = !expandedUrunler.value[id]; };

// --- HELPERS ---
const formatPara = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0);
const kullanimOrani = (k, t) => t > 0 ? (k / t) * 100 : 0;
</script>
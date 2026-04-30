<template>
  <div class="relative min-h-screen">
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
      <div class="flex items-center space-x-3">
        
        <!-- STANDART YAZDIR BUTONU -->
        <button v-if="!isEditing" type="button" @click="yazdir" class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 rounded-lg flex items-center shadow-sm transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Proforma Yazdır
        </button>

        <!-- YENİ TEKLİF YAZDIR BUTONU -->
        <button v-if="!isEditing" type="button" @click="showTeklifModal = true" class="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-sm transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Teklif Hazırla
        </button>

        <!-- AKSİYON BUTONLARI -->
        <div v-if="proforma && proforma.durum !== 'Dönüştürüldü'">
          <div v-if="!isEditing" class="flex space-x-2">
            
            <!-- İŞ EMRİNE DÖNÜŞTÜR BUTONU -->
            <button 
              type="button"
              @click="openConvertModal" 
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-sm transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              İş Emrine Dönüştür
            </button>

            <button type="button" @click="baslaDuzenle" class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-sm transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              Düzenle
            </button>
          </div>
          
          <div v-else class="flex space-x-2">
            <button type="button" @click="iptalEt" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">İptal</button>
            <button type="button" @click="kaydet" :disabled="loading" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
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
          <!-- MÜŞTERİ -->
          <div><p class="label-style">Müşteri</p><p class="font-semibold text-lg">{{ proforma.musteriler?.unvan }}</p></div>
          
          <!-- PROJE ADI GÖRÜNTÜLEME -->
          <div class="md:col-span-2">
            <p class="label-style">Proje Adı</p>
            <p class="font-semibold text-gray-800">{{ proforma.proje_adi || '-' }}</p>
          </div>

          <div><p class="label-style">İlgili Kişi</p><p class="font-semibold">{{ proforma.ilgili_kisi || proforma.musteriler?.ilgili_kisi || '-' }}</p></div>
          
          <div><p class="label-style">Oluşturma Tarihi</p><p class="font-semibold">{{ formatTarih(proforma.olusturma_tarihi) }}</p></div>
          <div><p class="label-style">Para Birimi</p><p class="font-bold text-indigo-600">{{ proforma.para_birimi || 'TRY' }}</p></div>
          <div>
            <p class="label-style">Durum</p>
            <span :class="getDurumBadge(proforma.durum)">{{ proforma.durum }}</span>
            <div v-if="proforma.donusturulen_is_emri_id" class="mt-1 text-xs text-indigo-600 hover:underline cursor-pointer" @click="router.push(`/app/is-emirleri/${proforma.donusturulen_is_emri_id}`)">
              İş Emrine Git &rarr;
            </div>
          </div>
          <div>
             <p class="label-style">Geçerlilik Tarihi</p>
             <p class="font-semibold" :class="{'text-red-600': suresiGectiMi(proforma)}">
               {{ formatTarih(proforma.gecerlilik_tarihi) }}
               <span v-if="suresiGectiMi(proforma)" class="text-xs ml-1">(Süresi Doldu)</span>
             </p>
          </div>
          <div class="col-span-2">
            <p class="label-style">Kategoriler</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="kat in (proforma.kategoriler || [])" :key="kat" class="px-2 py-1 bg-gray-100 border rounded text-xs text-gray-600">
                {{ kat }}
              </span>
              <span v-if="!proforma.kategoriler || proforma.kategoriler.length === 0" class="text-gray-400 text-sm italic">Etiket yok</span>
            </div>
          </div>
        </div>

        <!-- Düzenleme Modu -->
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Müşteri Değiştirme Alanı -->
          <div class="relative">
             <label class="label-style">Müşteri</label>
             <input 
                type="text" 
                v-model="musteriAramaMetni" 
                @input="musteriAra"
                class="form-input bg-yellow-50" 
                placeholder="Müşteri Değiştir..."
             >
             <div v-if="musteriAramaSonuclari.length > 0" class="absolute z-50 w-full bg-white border rounded shadow-lg max-h-40 overflow-y-auto mt-1">
                 <div v-for="m in musteriAramaSonuclari" :key="m.id" @click="musteriSec(m)" class="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b">
                     {{ m.unvan }}
                 </div>
             </div>
             <p class="text-xs text-green-600 font-bold mt-1" v-if="secilenMusteriAdi">Seçili: {{ secilenMusteriAdi }}</p>
          </div>

          <!-- PROJE ADI DÜZENLEME -->
          <div class="md:col-span-2">
             <label class="label-style">Proje Adı</label>
             <input v-model="form.proje_adi" type="text" class="form-input" placeholder="Örn: Erzurum Hastane Projesi">
          </div>

          <div>
             <label class="label-style">İlgili Kişi</label>
             <input v-model="form.ilgili_kisi" type="text" class="form-input">
          </div>
          <div>
            <label class="label-style">Geçerlilik Tarihi</label>
            <input v-model="form.gecerlilik_tarihi" type="date" class="form-input">
          </div>
          <div>
             <label class="label-style">Para Birimi</label>
             <select v-model="form.para_birimi" class="form-input font-bold">
               <option value="TRY">TRY</option>
               <option value="USD">USD</option>
               <option value="EUR">EUR</option>
               <option value="GBP">GBP</option>
             </select>
          </div>
          <div class="col-span-3">
             <label class="label-style">Kategoriler</label>
             <div class="grid grid-cols-4 gap-2 border p-3 rounded bg-gray-50">
                <label v-for="kat in kategoriListesi" :key="kat" class="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" :value="kat" v-model="form.kategoriler" class="h-4 w-4 text-indigo-600 rounded">
                  <span class="text-xs">{{ kat }}</span>
                </label>
             </div>
          </div>
          <div class="col-span-3">
            <label class="label-style">Notlar</label>
            <textarea v-model="form.notlar" rows="3" class="form-input" placeholder="Notları buraya giriniz..."></textarea>
          </div>
        </div>
      </div>

      <!-- KALEMLER -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4"><h2 class="text-xl font-semibold text-gray-700">Ürün ve Hizmetler</h2></div>
        
        <IsEmriKalemEkle 
           v-if="isEditing" 
           :depolar="depolar" 
           :tedarikciler="tedarikciler" 
           :anlasmalar="anlasmalar" 
           :initialKalemler="guncelKalemler" 
           :proforma-modu="true"
           :para-birimi="form.para_birimi"
           @kalemler-guncellendi="handleKalemlerGuncellendi"
        />

        <!-- Düzenleme Modunda Toplamları Göster -->
        <div v-if="isEditing" class="mt-4 flex justify-end bg-yellow-50 p-4 rounded border border-yellow-200">
             <div class="w-full max-w-sm space-y-2">
               <div class="flex justify-between text-gray-600">
                  <span>Ara Toplam:</span>
                  <span class="font-semibold">{{ formatPara(toplamlarDuzenleme.araToplam, form.para_birimi) }}</span>
               </div>
               <div class="flex justify-between text-gray-600">
                  <span>KDV (%20):</span>
                  <span class="font-semibold">{{ formatPara(toplamlarDuzenleme.kdv, form.para_birimi) }}</span>
               </div>
               <div class="flex justify-between text-xl font-bold text-gray-800 border-t pt-2 border-yellow-300">
                  <span>GENEL TOPLAM:</span>
                  <span class="text-indigo-600">{{ formatPara(toplamlarDuzenleme.genelToplam, form.para_birimi) }}</span>
               </div>
            </div>
        </div>

        <!-- Detay Tablosu (GÖRÜNTÜLEME MODU) -->
        <div v-if="!isEditing" class="space-y-6">
          <div v-for="(grup, gIndex) in gruplanmisKalemlerGoruntuleme" :key="gIndex" class="border rounded-lg overflow-hidden">
             <!-- Grup Başlığı -->
             <div class="bg-gray-50 px-4 py-2 border-b font-bold text-gray-700 text-sm uppercase tracking-wider flex justify-between">
                <span>{{ grup.ad }}</span>
                <span class="text-xs text-gray-500 font-normal">Ara Toplam: {{ formatPara(grup.araToplam, proforma.para_birimi) }}</span>
             </div>
             
             <div class="overflow-x-auto">
                <table class="min-w-full leading-normal">
                    <thead>
                    <tr>
                        <th class="th-style text-center w-12">#</th>
                        <th class="th-style">Açıklama</th>
                        <th class="th-style text-center">Miktar</th>
                        <th class="th-style text-center">Birim</th>
                        <th class="th-style text-right">Birim Fiyat</th>
                        <th class="th-style text-right">Tutar</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(kalem, index) in grup.kalemler" :key="kalem.id">
                        <td class="td-style text-center">{{ index + 1 }}</td>
                        <td class="td-style font-medium">{{ kalem.aciklama }}</td>
                        <td class="td-style text-center font-bold">{{ kalem.miktar }}</td>
                        <td class="td-style text-center text-xs">{{ kalem.birim }}</td>
                        <td class="td-style text-right font-mono">{{ formatPara(kalem.birim_fiyat, proforma.para_birimi) }}</td>
                        <td class="td-style text-right font-bold text-gray-800 font-mono">{{ formatPara(kalem.miktar * kalem.birim_fiyat, proforma.para_birimi) }}</td>
                    </tr>
                    </tbody>
                </table>
             </div>
          </div>

          <!-- Toplamlar Bölümü -->
          <div class="flex justify-end mt-4">
            <div class="w-full max-w-sm space-y-2">
               <div class="flex justify-between text-gray-600">
                  <span>Ara Toplam:</span>
                  <span class="font-semibold">{{ formatPara(toplamlar.araToplam, proforma.para_birimi) }}</span>
               </div>
               <div class="flex justify-between text-gray-600">
                  <span>KDV (%20):</span>
                  <span class="font-semibold">{{ formatPara(toplamlar.kdv, proforma.para_birimi) }}</span>
               </div>
               <div class="flex justify-between text-xl font-bold text-gray-800 border-t pt-2">
                  <span>GENEL TOPLAM:</span>
                  <span class="text-indigo-600">{{ formatPara(toplamlar.genelToplam, proforma.para_birimi) }}</span>
               </div>
            </div>
          </div>
          
          <div v-if="proforma.notlar" class="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p class="text-sm font-bold text-yellow-800 mb-1">NOTLAR:</p>
            <p class="text-sm text-yellow-900 whitespace-pre-wrap">{{ proforma.notlar }}</p>
          </div>
        </div>
      </div>

      <!-- ŞARTLAR VE KOŞULLAR -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4 border-b pb-2">
            <h2 class="text-xl font-semibold text-gray-700">Şartlar ve Koşullar</h2>
            <button v-if="!isEditing" @click="showSartlarModal = true" class="text-xs text-blue-600 hover:text-blue-800 font-bold border border-blue-200 bg-blue-50 px-3 py-1 rounded flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Düzenle
            </button>
        </div>
        <div class="bg-gray-50 p-4 rounded border text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto font-mono">
            {{ proforma.sartlar || 'Şart belirtilmemiş.' }}
        </div>
      </div>

    </div>

    <!-- MARKAYA GÖRE TEKLİF YAZDIRMA MODALI -->
    <div v-if="showTeklifModal" class="fixed inset-0 z-[10000] overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100">
            <div class="px-6 py-4 border-b bg-gray-50 rounded-t-xl flex justify-between items-center">
                <h3 class="text-lg font-bold text-gray-800">Teklif İçin Marka Seçiniz</h3>
                <button @click="showTeklifModal = false" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <div class="p-6">
                <p class="text-sm text-gray-500 mb-4">Lütfen teklif formunda kullanılacak markayı seçiniz. Seçime göre form tasarımı düzenlenecektir.</p>
                
                <div class="space-y-3">
                    <label 
                        v-for="marka in markaListesi" 
                        :key="marka"
                        class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all group"
                        :class="{'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500': secilenMarka === marka}"
                    >
                        <div class="flex items-center justify-center h-5 w-5 mr-3">
                            <input 
                                type="radio" 
                                name="markaSecimi"
                                :value="marka" 
                                v-model="secilenMarka"
                                class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            >
                        </div>
                        <span class="font-medium text-gray-700 group-hover:text-indigo-700">{{ marka }}</span>
                    </label>
                </div>
            </div>

            <div class="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3 rounded-b-xl">
                <button @click="showTeklifModal = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition">Vazgeç</button>
                <button @click="teklifYazdir" class="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-md flex items-center transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Teklifi Oluştur
                </button>
            </div>
        </div>
    </div>

    <!-- ŞARTLARI DÜZENLEME MODALI -->
    <div v-if="showSartlarModal" class="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
            <div class="px-6 py-4 border-b bg-gray-50 rounded-t-lg"><h3 class="text-lg font-bold text-gray-800">Şartlar ve Koşulları Düzenle</h3></div>
            <div class="p-6 flex-grow overflow-y-auto">
                <textarea v-model="tempSartlar" rows="15" class="w-full border p-3 rounded text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
            </div>
            <div class="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3 rounded-b-lg">
                <button @click="showSartlarModal = false" class="px-4 py-2 bg-gray-300 text-gray-800 rounded font-bold">İptal</button>
                <button @click="sartlariKaydet" class="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Kaydet</button>
            </div>
        </div>
    </div>

    <!-- İŞ EMRİNE DÖNÜŞTÜRME MODALI -->
    <div v-if="showConvertModal" class="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-5xl md:max-h-[90vh] flex flex-col">
        <div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h3 class="text-xl font-bold text-gray-800">İş Emri Oluştur - Kaynak Seçimi</h3>
          <button type="button" @click="showConvertModal = false" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div class="p-6 overflow-y-auto flex-grow">
          <div class="mb-4 bg-blue-50 p-4 rounded text-sm text-blue-800 border border-blue-100 flex justify-between items-center">
             <div>
               Lütfen her kalem için <strong>Kaynak (Hangi depodan çıkacak?)</strong> ve varsa <strong>Anlaşma</strong> seçiniz.
             </div>
             <div class="font-bold text-indigo-700">Para Birimi: {{ proforma.para_birimi || 'TRY' }}</div>
          </div>
          <table class="min-w-full divide-y divide-gray-200 border">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün / Açıklama</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Miktar / Birim</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kaynak Tipi</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kaynak Seçimi <span class="text-red-500">*</span></th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anlaşma</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok Durumu</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(item, idx) in convertItems" :key="idx">
                <td class="px-4 py-4 text-sm font-medium text-gray-900">{{ item.aciklama }}</td>
                <td class="px-4 py-4 text-sm text-center font-bold">{{ item.miktar }} <span class="text-xs text-gray-500">{{ item.birim }}</span></td>
                <td class="px-4 py-4 text-sm">
                  <select v-model="item.sourceType" @change="handleSourceTypeChange(item)" class="border rounded p-1 w-full text-sm">
                    <option value="depo">Depo</option>
                    <option value="tedarikci">Tedarikçi</option>
                    <option value="hizmet">Hizmet/Stoksuz</option>
                  </select>
                </td>
                <td class="px-4 py-4 text-sm">
                  <select v-model="item.selectedSourceId" @change="checkStock(item)" class="border rounded p-1 w-full text-sm" :disabled="item.sourceType === 'hizmet'" :class="{'bg-gray-100': item.sourceType === 'hizmet', 'border-red-500': item.sourceType !== 'hizmet' && !item.selectedSourceId}">
                    <option :value="null">Seçiniz...</option>
                    <template v-if="item.sourceType === 'depo'"><option v-for="d in depolar" :key="d.id" :value="d.id">{{ d.ad }}</option></template>
                    <template v-if="item.sourceType === 'tedarikci'"><option v-for="t in tedarikciler" :key="t.id" :value="t.id">{{ t.ad }}</option></template>
                  </select>
                </td>
                <td class="px-4 py-4 text-sm">
                  <select v-model="item.selectedAgreementId" class="border rounded p-1 w-full text-sm" :disabled="item.sourceType === 'depo' || item.sourceType === 'hizmet'" :class="{'bg-gray-100': item.sourceType === 'depo' || item.sourceType === 'hizmet'}">
                    <option :value="null">Anlaşma Yok</option>
                    <option v-for="a in anlasmalar" :key="a.id" :value="a.id">{{ a.ad }}</option>
                  </select>
                </td>
                <td class="px-4 py-4 text-sm">
                  <div v-if="item.sourceType === 'depo' && item.selectedSourceId">
                    <span v-if="item.checkingStock">Kontrol...</span>
                    <span v-else-if="item.stockError" class="text-red-600 font-bold flex items-center"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>Yetersiz ({{ item.currentStock }})</span>
                    <span v-else class="text-green-600 font-bold flex items-center"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Uygun ({{ item.currentStock }})</span>
                  </div>
                  <span v-else-if="item.sourceType === 'hizmet'" class="text-gray-400 italic">Stoksuz</span>
                  <span v-else class="text-orange-500 text-xs">Seçim Bekleniyor</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="mt-6"><label class="block text-sm font-medium text-gray-700">İş Emri Notu</label><textarea v-model="workOrderNote" rows="2" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="İş emri için özel bir notunuz varsa buraya ekleyin..."></textarea></div>
        </div>
        <div class="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3 rounded-b-lg">
          <button type="button" @click="showConvertModal = false" class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 font-bold">İptal</button>
          <button type="button" @click="convertToWorkOrder" :disabled="converting || hasStockErrors" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed">
            <span v-if="converting" class="mr-2 animate-spin">⟳</span>
            {{ converting ? 'Oluşturuluyor...' : 'Onayla ve İş Emri Oluştur' }}
          </button>
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
import { ref, onMounted, computed, watch } from 'vue';
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

const showConvertModal = ref(false);
const showSartlarModal = ref(false);
const tempSartlar = ref('');
const converting = ref(false);
const convertItems = ref([]);
const workOrderNote = ref('');

// --- TEKLİF YAZDIRMA STATE ---
const showTeklifModal = ref(false);
const secilenMarka = ref('HAIER');
const markaListesi = ['HAIER', 'MITSUBISHI HEAVY', 'MITSUBISHI ELECTRIC', 'NIVA', 'OLEFINI', 'ENDÜSTRİYEL MUTFAK'];

const form = ref({});
const guncelKalemler = ref([]);
const depolar = ref([]);
const tedarikciler = ref([]);
const anlasmalar = ref([]);

// MÜŞTERİ DEĞİŞTİRME STATE
const musteriAramaMetni = ref('');
const musteriAramaSonuclari = ref([]);
const secilenMusteriAdi = ref('');

const kategoriListesi = ['KLİMA', 'VRF', 'HAVA PERDESİ', 'SOĞUK ODA', 'ISI POMPASI', 'DX', 'ENDÜSTRİYEL MUTFAK', 'İŞÇİLİK', 'YEDEK PARÇA'];

// --- VERİ ÇEKME ---
const getDetay = async () => {
  fetchLoading.value = true;
  try {
    const { data, error } = await supabase
      .from('proformalar')
      .select(`*, musteriler(*), proforma_kalemleri(*)`) 
      .eq('id', id)
      .single();

    if (error) throw error;
    proforma.value = data;
    tempSartlar.value = data.sartlar || '';
    secilenMusteriAdi.value = data.musteriler?.unvan || '';

    const [depolarRes, tedarikcilerRes, anlasmalarRes] = await Promise.all([
      supabase.from('depolar').select('*'),
      supabase.from('tedarikciler').select('*'),
      supabase.from('anlasmalar').select('*, anlasma_kalemleri(urun_id)').eq('aktif_mi', true)
    ]);
    depolar.value = depolarRes.data || [];
    tedarikciler.value = tedarikcilerRes.data || [];
    anlasmalar.value = anlasmalarRes.data || [];

    if (route.query.otomatikDonustur === 'true' && proforma.value.durum !== 'Dönüştürüldü') {
      setTimeout(() => { openConvertModal(); }, 500);
    }
  } catch (err) {
    alert('Veri çekme hatası: ' + err.message);
    router.push('/app/proformalar');
  } finally {
    fetchLoading.value = false;
  }
};

// --- YENİ HESAPLAMA MANTIĞI ---
const toplamlar = computed(() => {
    if (!proforma.value || !proforma.value.proforma_kalemleri) return { araToplam: 0, kdv: 0, genelToplam: 0 };
    const araToplam = proforma.value.proforma_kalemleri.reduce((acc, k) => acc + (k.miktar * k.birim_fiyat), 0);
    const kdv = araToplam * 0.20;
    const genelToplam = araToplam + kdv;
    return { araToplam, kdv, genelToplam };
});

const toplamlarDuzenleme = computed(() => {
    const araToplam = guncelKalemler.value.reduce((acc, k) => acc + (k.miktar * k.birim_fiyat), 0);
    const kdv = araToplam * 0.20;
    const genelToplam = araToplam + kdv;
    return { araToplam, kdv, genelToplam };
});

const gruplanmisKalemlerGoruntuleme = computed(() => {
    if (!proforma.value || !proforma.value.proforma_kalemleri) return [];
    
    const gruplar = {};
    proforma.value.proforma_kalemleri.forEach(kalem => {
        const grupAdi = kalem.grup_adi || 'Genel';
        if (!gruplar[grupAdi]) gruplar[grupAdi] = [];
        gruplar[grupAdi].push(kalem);
    });

    return Object.keys(gruplar).sort().map(key => {
        const kalemler = gruplar[key];
        const araToplam = kalemler.reduce((acc, k) => acc + (k.miktar * k.birim_fiyat), 0);
        return { ad: key, kalemler, araToplam };
    });
});

// --- DÜZENLEME MODU ---
const baslaDuzenle = () => {
  form.value = {
    musteri_id: proforma.value.musteri_id,
    gecerlilik_tarihi: proforma.value.gecerlilik_tarihi,
    ilgili_kisi: proforma.value.ilgili_kisi || proforma.value.musteriler?.ilgili_kisi || '',
    proje_adi: proforma.value.proje_adi, 
    notlar: proforma.value.notlar,
    para_birimi: proforma.value.para_birimi || 'TRY',
    kategoriler: proforma.value.kategoriler || [] 
  };
  guncelKalemler.value = (proforma.value.proforma_kalemleri || []).map(k => ({ ...k }));
  musteriAramaMetni.value = proforma.value.musteriler?.unvan || '';
  isEditing.value = true;
};

const iptalEt = () => { isEditing.value = false; getDetay(); };
const handleKalemlerGuncellendi = (liste) => { guncelKalemler.value = liste; };

// MÜŞTERİ DEĞİŞTİRME MANTIĞI
let musteriDebounce;
const musteriAra = () => {
    clearTimeout(musteriDebounce);
    if(musteriAramaMetni.value.length < 2) { musteriAramaSonuclari.value = []; return; }
    
    musteriDebounce = setTimeout(async () => {
        const { data, error } = await supabase.from('musteriler').select('id, unvan').ilike('unvan', `%${musteriAramaMetni.value}%`).limit(10);
        if(!error) musteriAramaSonuclari.value = data;
    }, 300);
};

const musteriSec = (m) => {
    form.value.musteri_id = m.id;
    secilenMusteriAdi.value = m.unvan;
    musteriAramaMetni.value = m.unvan;
    musteriAramaSonuclari.value = [];
};

const sartlariKaydet = async () => {
    try {
        const { error } = await supabase.from('proformalar').update({ sartlar: tempSartlar.value }).eq('id', id);
        if(error) throw error;
        proforma.value.sartlar = tempSartlar.value;
        showSartlarModal.value = false;
        alert("Şartlar güncellendi.");
    } catch(err) {
        alert("Hata: " + err.message);
    }
};

const kaydet = async () => {
  if (guncelKalemler.value.length === 0) { alert('En az bir kalem olmalıdır.'); return; }
  loading.value = true;
  try {
    const { error: mainError } = await supabase.from('proformalar').update({
        musteri_id: form.value.musteri_id,
        gecerlilik_tarihi: form.value.gecerlilik_tarihi,
        ilgili_kisi: form.value.ilgili_kisi,
        proje_adi: form.value.proje_adi, 
        notlar: form.value.notlar,
        toplam_tutar: toplamlarDuzenleme.value.genelToplam,
        para_birimi: form.value.para_birimi,
        kategoriler: form.value.kategoriler
      }).eq('id', id);
    if (mainError) throw mainError;

    await supabase.from('proforma_kalemleri').delete().eq('proforma_id', id);

    const kalemlerToInsert = guncelKalemler.value.map(k => ({
      proforma_id: id,
      urun_id: k.urun_id || null,
      aciklama: k.aciklama,
      miktar: k.miktar,
      birim: k.birim, 
      birim_fiyat: k.birim_fiyat,
      grup_adi: k.grup_adi || 'Genel' 
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

// --- DÖNÜŞTÜRME MODALI ---
const openConvertModal = () => {
  if (!proforma.value) return;
  convertItems.value = (proforma.value.proforma_kalemleri || []).map(k => ({
    ...k,
    sourceType: k.urun_id ? 'depo' : 'hizmet',
    selectedSourceId: null,
    selectedAgreementId: null,
    checkingStock: false,
    stockError: false,
    currentStock: 0
  }));
  workOrderNote.value = proforma.value.notlar || '';
  showConvertModal.value = true;
};

const handleSourceTypeChange = (item) => {
  item.selectedSourceId = null;
  item.selectedAgreementId = null;
  item.stockError = false;
  item.currentStock = 0;
};

const checkStock = async (item) => {
  if (item.sourceType !== 'depo' || !item.selectedSourceId || !item.urun_id) { item.stockError = false; return; }
  item.checkingStock = true;
  try {
    const { data, error } = await supabase.from('stok_seviyeleri').select('miktar, rezerve_miktar').eq('urun_id', item.urun_id).eq('depo_id', item.selectedSourceId).single();
    if (error && error.code !== 'PGRST116') throw error; 
    const eldekiMiktar = data ? (data.miktar - data.rezerve_miktar) : 0;
    item.currentStock = eldekiMiktar;
    item.stockError = eldekiMiktar < item.miktar;
  } catch (err) {
    item.stockError = true; 
  } finally {
    item.checkingStock = false;
  }
};

const hasStockErrors = computed(() => {
  const missingSelection = convertItems.value.some(item => (item.sourceType !== 'hizmet' && !item.selectedSourceId));
  if (missingSelection) return true;
  return convertItems.value.some(item => item.stockError);
});

const convertToWorkOrder = async () => {
  if (hasStockErrors.value) return;
  converting.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: yeniNo } = await supabase.rpc('is_emri_numara_olustur');
    
    const { data: isEmri, error: isEmriError } = await supabase.from('is_emirleri').insert([{
      musteri_id: proforma.value.musteri_id,
      siparis_tarihi: new Date(),
      durum: 'Açık',
      toplam_tutar: proforma.value.toplam_tutar,
      notlar: workOrderNote.value,
      olusturan_kullanici_id: user?.id,
      satisci_id: null,
      numara: yeniNo || 'IE-HATA',
      is_tamamlandi: false,
      is_emri_tipi: 'SİPARİŞ',
      sevk_adresi: proforma.value.musteriler?.adres,
      para_birimi: proforma.value.para_birimi || 'TRY',
      kdv_dahil: false
    }]).select().single();
    if (isEmriError) throw isEmriError;

    const kalemlerInsert = convertItems.value.map(item => ({
      is_emri_id: isEmri.id,
      urun_id: item.urun_id,
      miktar: item.miktar,
      birim: item.birim,
      birim_fiyat: item.birim_fiyat,
      aciklama: item.aciklama,
      kaynak_depo_id: item.sourceType === 'depo' ? item.selectedSourceId : null,
      kaynak_tedarikci_id: item.sourceType === 'tedarikci' ? item.selectedSourceId : null,
      anlasma_id: item.selectedAgreementId
    }));
    await supabase.from('is_emri_kalemleri').insert(kalemlerInsert);
    await supabase.from('proformalar').update({ durum: 'Dönüştürüldü', donusturulen_is_emri_id: isEmri.id }).eq('id', proforma.value.id);

    alert('İş Emri başarıyla oluşturuldu!');
    showConvertModal.value = false;
    router.push(`/app/is-emirleri/${isEmri.id}`);
  } catch (err) {
    alert('Dönüştürme hatası: ' + err.message);
  } finally {
    converting.value = false;
  }
};

// --- YARDIMCI FONKSİYONLAR ---
const suresiGectiMi = (p) => {
  if (p.durum === 'Dönüştürüldü') return false;
  return p.gecerlilik_tarihi < new Date().toISOString().split('T')[0];
};

const getDurumBadge = (durum) => {
  const durumMap = { 'Taslak': 'bg-gray-100 text-gray-600', 'Gönderildi': 'bg-blue-100 text-blue-600', 'Dönüştürüldü': 'bg-purple-100 text-purple-600 font-bold' };
  return `px-2 py-1 text-xs rounded ${durumMap[durum] || 'bg-gray-100 text-gray-800'}`;
};

const formatTarih = (t) => t ? new Date(t).toLocaleDateString('tr-TR') : '-';
const formatPara = (val, currency = 'TRY') => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency || 'TRY' }).format(val || 0);

const getGruplanmisKalemler = (kalemler) => {
    const gruplar = {};
    kalemler.forEach(k => {
        const g = k.grup_adi || 'Genel';
        if(!gruplar[g]) gruplar[g] = [];
        gruplar[g].push(k);
    });
    return gruplar;
};

// --- STANDART PROFORMA YAZDIRMA (YENİ KURUMSAL TASARIM + GRUPLU) ---
const yazdir = () => {
  if (!proforma.value) return;
  const p = proforma.value;
  const logoUrl = window.location.origin + '/logo11.png';
  const tarih = formatTarih(p.olusturma_tarihi);
  const musteri = p.musteriler || {};
  const ilgiliKisi = p.ilgili_kisi || musteri.ilgili_kisi || '-';
  const pb = p.para_birimi || 'TRY';

  const gruplar = getGruplanmisKalemler(p.proforma_kalemleri);
  const grupKeys = Object.keys(gruplar).sort();

  let kalemlerHTML = '';
  let counter = 1;

  grupKeys.forEach(grupAdi => {
     // Grup Başlığı Satırı
     if(grupKeys.length > 1 || grupAdi !== 'Genel') {
         kalemlerHTML += `
            <tr style="background-color: #f3f4f6;">
                <td colspan="6" style="padding: 6px 10px; font-weight: bold; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #ddd; color: #005BBB;">
                    ${grupAdi}
                </td>
            </tr>
         `;
     }

     gruplar[grupAdi].forEach(kalem => {
        let tutar = kalem.miktar * kalem.birim_fiyat;
        kalemlerHTML += `
            <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${counter++}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: 500;">${kalem.aciklama}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${kalem.miktar}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${kalem.birim || 'Adet'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(kalem.birim_fiyat, pb)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: 700;">${formatPara(tutar, pb)}</td>
            </tr>
        `;
     });
  });

  const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>Proforma Fatura - ${p.proforma_no}</title>
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
                <div class="sub">Tarih: ${tarih} &nbsp;|&nbsp; No: ${p.proforma_no}</div>
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
              ${p.proje_adi ? `<div style="margin-top:8px; padding-top:8px; border-top: 1px solid #e5e7eb; color:#005BBB; font-weight:700; font-size:12px;">PROJE: ${p.proje_adi}</div>` : ''}
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
            <div style="white-space: pre-wrap; font-size: 10px; color: #444; line-height: 1.4; background: #fafafa; padding: 10px; border-left: 3px solid #005BBB;">${p.sartlar || 'Şart belirtilmemiş.'}</div>
          </div>

          ${p.notlar ? `<div style="margin-top:15px;"><div style="font-size: 10px; font-weight: bold; color: #333;">NOTLAR:</div><div style="font-size: 10px; color: #555;">${p.notlar}</div></div>` : ''}
          
          <div class="footer-note">
            Bu belge bilgilendirme amaçlıdır.
          </div>
        </div>
      </body>
      </html>
    `;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 600);
};

// --- MARKALI TEKLİF YAZDIRMA (GRUPLU) ---
const teklifYazdir = () => {
    if (!proforma.value || !secilenMarka.value) return;
    showTeklifModal.value = false;

    const p = proforma.value;
    const marka = secilenMarka.value;
    const tarih = formatTarih(p.olusturma_tarihi);
    const musteri = p.musteriler || {};
    const ilgiliKisi = p.ilgili_kisi || musteri.ilgili_kisi || '-';
    const pb = p.para_birimi || 'TRY';

    // URL Tablosu (Base64'ler yerine)
    const haierImgSrc = window.location.origin + '/haier_logo.png';
    const tavlasImgSrc = window.location.origin + '/tavlasoglu_logo.png';

    switch(marka) {
        case 'HAIER': {
            // Gruplu ürün tabloları
            const gruplar2 = getGruplanmisKalemler(p.proforma_kalemleri);
            const grupKeys2 = Object.keys(gruplar2).sort();
            let grupTabloHTML = '';
            grupKeys2.forEach(grupAdi => {
                let satirlar = '';
                let counter = 1;
                gruplar2[grupAdi].forEach(kalem => {
                    const tutar = kalem.miktar * kalem.birim_fiyat;
                    satirlar += `
                        <tr>
                            <td style="text-align:center;width:36px;padding:6px 8px;border-bottom:1px solid #e8eef8;">${counter++}</td>
                            <td style="text-align:left;padding:6px 8px;border-bottom:1px solid #e8eef8;font-weight:500;">${kalem.aciklama}</td>
                            <td style="text-align:center;width:56px;padding:6px 8px;border-bottom:1px solid #e8eef8;">${kalem.miktar}</td>
                            <td style="text-align:center;width:56px;padding:6px 8px;border-bottom:1px solid #e8eef8;">${kalem.birim || 'Adet'}</td>
                            <td style="text-align:right;width:110px;padding:6px 8px;border-bottom:1px solid #e8eef8;">${formatPara(kalem.birim_fiyat, pb)}</td>
                            <td style="text-align:right;width:110px;padding:6px 8px;border-bottom:1px solid #e8eef8;font-weight:700;color:#003d8f;">${formatPara(tutar, pb)}</td>
                        </tr>`;
                });
                grupTabloHTML += `
                    <div style="margin-bottom:18px;">
                        <div style="background:#005BBB;color:white;font-weight:700;font-size:9pt;text-transform:uppercase;letter-spacing:.5px;padding:6px 12px;border-radius:3px 3px 0 0;">${grupAdi}</div>
                        <table style="width:100%;border-collapse:collapse;font-size:9.5pt;">
                            <thead>
                                <tr style="background:#e8effa;">
                                    <th style="text-align:center;padding:6px 8px;border-bottom:2px solid #005BBB;font-size:8pt;text-transform:uppercase;color:#003d8f;">Sıra</th>
                                    <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #005BBB;font-size:8pt;text-transform:uppercase;color:#003d8f;">Ürün Açıklaması</th>
                                    <th style="text-align:center;padding:6px 8px;border-bottom:2px solid #005BBB;font-size:8pt;text-transform:uppercase;color:#003d8f;">Miktar</th>
                                    <th style="text-align:center;padding:6px 8px;border-bottom:2px solid #005BBB;font-size:8pt;text-transform:uppercase;color:#003d8f;">Birim</th>
                                    <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #005BBB;font-size:8pt;text-transform:uppercase;color:#003d8f;">Birim Fiyat</th>
                                    <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #005BBB;font-size:8pt;text-transform:uppercase;color:#003d8f;">Net Tutar</th>
                                </tr>
                            </thead>
                            <tbody>${satirlar}</tbody>
                        </table>
                    </div>`;
            });

            // Şartlar satırları
            const sartSatirlar = (p.sartlar || '')
                .split('\n')
                .filter(s => s.trim())
                .map(s => `<li style="margin-bottom:3px;">${s.replace(/^[-–•\t]+\s*/, '')}</li>`)
                .join('');

            const htmlContent = `<!DOCTYPE html>
        <html lang="tr">
        <head>
        <meta charset="UTF-8">
        <title>Haier Teklif - ${p.proforma_no}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            @page { size: A4 portrait; margin: 0; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', Arial, sans-serif; background: white; color: #222; }
            .sayfa {
                width: 210mm;
                min-height: 297mm;
                page-break-after: always;
                display: flex;
                flex-direction: column;
                position: relative;
            }
            .sayfa:last-child { page-break-after: avoid; }
        </style>
        </head>
        <body>

        <!-- ===== SAYFA 1 - KAPAK ===== -->
        <div class="sayfa">

            <!-- ÜST BAŞLIK BANDI -->
            <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:40px 56px 28px 56px;border-bottom:1px solid #ddd;">
                <div>
                    <img src="${tavlasImgSrc}" alt="Tavlaşoğlu" style="height:80px;object-fit:contain;">
                </div>
                <div style="text-align:right;">
                    <img src="${haierImgSrc}" alt="Haier" style="height:44px;object-fit:contain;display:block;margin-left:auto;margin-bottom:8px;">
                    <div style="font-size:9pt;color:#333;line-height:1.7;">
                        <span style="display:inline-block;width:56px;color:#555;">TARİH</span>
                        <span style="font-weight:600;">: ${tarih}</span><br>
                        <span style="display:inline-block;width:56px;color:#555;">TEKLİF</span>
                        <span style="font-weight:600;">: ${p.proforma_no}</span>
                    </div>
                </div>
            </div>

            <!-- GÖVDE -->
            <div style="flex:1;padding:80px 56px 40px 56px;display:flex;flex-direction:column;">

                <div style="border-left:3px solid #005BBB;padding-left:14px;margin-bottom:32px;margin-top:10px;">
                    <div style="font-size:13pt;font-weight:800;color:#111;line-height:1.4;">${musteri.unvan || 'FİRMA ÜNVANI'}</div>
                    <div style="font-size:10.5pt;color:#444;margin-top:3px;">${musteri.adres || ''}</div>
                    <div style="font-size:10.5pt;color:#222;margin-top:5px;">Sn. <strong>${ilgiliKisi}</strong> dikkatine;</div>
                </div>

                <div style="font-size:10.5pt;line-height:1.8;color:#222;margin-bottom:16px;">
                    <strong style="font-size:12pt;color:#111;">${p.proje_adi || 'Projeniz'}</strong> projesi kapsamında ihtiyaç duyulan iklimlendirme çözümlerine dair hazırladığımız <strong style="color:#005BBB;">HAIER</strong> teklifimiz ekte bilgilerinize sunulmuştur.
                </div>

                <div style="font-size:10.5pt;line-height:1.8;color:#333;margin-bottom:14px;">
                    Bu önemli projenin bir parçası olmayı ve çözüm ortağınız olarak birlikte çalışmayı <strong>büyük bir istekle arzu ediyoruz.</strong> Teklif detayları, teknik spesifikasyonlar veya süreçle ilgili her türlü sorunuz için <strong>bizimle dilediğiniz an iletişime geçmekten lütfen çekinmeyiniz.</strong> Sorularınızı yanıtlamaktan ve projeyi detaylandırmaktan memnuniyet duyacağız.
                </div>

                <div style="font-size:10.5pt;line-height:1.8;color:#333;margin-bottom:8px;">
                    Olumlu dönüşlerinizi bekler, iyi çalışmalar dileriz.
                </div>
                <div style="font-size:10.5pt;line-height:1.8;color:#333;margin-bottom:40px;">
                    Saygılarımızla,
                </div>

                <div style="margin-bottom:auto;">
                    <div style="font-size:11pt;font-weight:700;color:#111;margin-bottom:2px;">YUSUF TAVLAŞOĞLU</div>
                </div>

                <div style="margin-top:60px;padding-top:14px;border-top:1px solid #eee;">
                    <div style="font-size:9pt;font-weight:700;color:#333;margin-bottom:4px;">Teklifi Hazırlayan:</div>
                    <div style="font-size:9pt;color:#333;line-height:1.7;">
                        YUSUF TAVLAŞOĞLU<br>
                        GSM: 0530 066 8025<br>
                        TEL: 0442 238 83 83
                    </div>
                </div>
            </div>

            <!-- ALT FOOTER -->
            <div style="border-top:1px solid #ccc;padding:10px 28px;background:#f9f9f9;text-align:center;">
                <div style="font-size:7.5pt;color:#555;line-height:1.6;">
                    <strong>TAVLAŞOĞLU ISI. SÖĞ. DGAZ SİS. İNŞ. TAH. END. DAY. TÜK. MAL.LTD.ŞTİ.</strong><br>
                    HİLAL MAH. TURAN GÜNEŞ BULVARI HİLAL APT. DIŞ KAPI NO:17 KAT:3/7 ÇANKAYA/ANKARA<br>
                    E-mail: info@tavlasoglu.com.tr &nbsp;|&nbsp; Tel: 530 066 80 25
                </div>
            </div>

        </div>

        <!-- ===== SAYFA 2 - TEKLİF TABLOLARI ===== -->
        <div class="sayfa">

            <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:40px 56px 28px 56px;border-bottom:1px solid #ddd;">
                <div>
                    <img src="${tavlasImgSrc}" alt="Tavlaşoğlu" style="height:80px;object-fit:contain;">
                </div>
                <div style="text-align:right;">
                    <img src="${haierImgSrc}" alt="Haier" style="height:44px;object-fit:contain;display:block;margin-left:auto;margin-bottom:8px;">
                    <div style="font-size:9pt;color:#333;line-height:1.7;">
                        <span style="display:inline-block;width:56px;color:#555;">TARİH</span>
                        <span style="font-weight:600;">: ${tarih}</span><br>
                        <span style="display:inline-block;width:56px;color:#555;">TEKLİF</span>
                        <span style="font-weight:600;">: ${p.proforma_no}</span>
                    </div>
                </div>
            </div>

            <div style="flex:1;padding:18px 20px 16px 20px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                    <div style="font-size:11pt;font-weight:700;color:#005BBB;">${p.proje_adi || ''}</div>
                    <div style="font-size:9.5pt;color:#555;">${musteri.unvan || ''}</div>
                </div>

                ${grupTabloHTML}

                <div style="display:flex;justify-content:flex-end;margin-top:12px;margin-bottom:18px;">
                    <div style="width:260px;border:1px solid #d0e0ff;border-radius:6px;overflow:hidden;font-size:10pt;">
                        <div style="display:flex;justify-content:space-between;padding:7px 14px;border-bottom:1px solid #e8effa;background:#f5f8ff;">
                            <span style="color:#444;">Ara Toplam</span>
                            <span style="font-weight:600;">${formatPara(toplamlar.value.araToplam, pb)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:7px 14px;border-bottom:1px solid #e8effa;background:#f5f8ff;">
                            <span style="color:#444;">KDV (%20)</span>
                            <span style="font-weight:600;">${formatPara(toplamlar.value.kdv, pb)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:9px 14px;background:#005BBB;color:white;font-weight:800;font-size:11pt;">
                            <span>GENEL TOPLAM</span>
                            <span>${formatPara(toplamlar.value.genelToplam, pb)}</span>
                        </div>
                    </div>
                </div>

                <div style="border-top:2px solid #005BBB;padding-top:12px;">
                    <div style="font-size:10pt;font-weight:800;color:#005BBB;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">TEKLİF ŞARTLARI</div>
                    <ul style="padding-left:16px;font-size:8.5pt;color:#444;line-height:1.6;">
                        ${sartSatirlar || '<li>Özel şart belirtilmemiştir.</li>'}
                    </ul>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;font-size:8.5pt;">
                        <div>
                            <div style="font-weight:700;color:#003d8f;margin-bottom:2px;">ÖDEME</div>
                            <div style="color:#444;">Karşılıklı görüşme ile belirlenecektir.</div>
                        </div>
                        <div>
                            <div style="font-weight:700;color:#003d8f;margin-bottom:2px;">TESLİM ŞEKLİ</div>
                            <div style="color:#444;">VRF sistemlerinde yurt içi siparişlerde cihazlarımız şantiyenizde araç üzerinde teslim edilmektedir.</div>
                        </div>
                        <div>
                            <div style="font-weight:700;color:#003d8f;margin-bottom:2px;">GARANTİ</div>
                            <div style="color:#444;">Cihazlarımız teslim tarihinden itibaren 2 yıl garantilidir.</div>
                        </div>
                        <div>
                            <div style="font-weight:700;color:#003d8f;margin-bottom:2px;">GEÇERLİLİK</div>
                            <div style="color:#444;">Bu teklif ${formatTarih(p.gecerlilik_tarihi)} tarihine kadar geçerlidir.</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style="border-top:1px solid #ccc;padding:10px 28px;background:#f9f9f9;text-align:center;">
                <div style="font-size:7.5pt;color:#555;line-height:1.6;">
                    <strong>TAVLAŞOĞLU ISI. SÖĞ. DGAZ SİS. İNŞ. TAH. END. DAY. TÜK. MAL.LTD.ŞTİ.</strong><br>
                    HİLAL MAH. TURAN GÜNEŞ BULVARI HİLAL APT. DIŞ KAPI NO:17 KAT:3/7 ÇANKAYA/ANKARA<br>
                    E-mail: info@tavlasoglu.com.tr &nbsp;|&nbsp; Tel: 530 066 80 25
                </div>
            </div>

        </div>

        </body>
        </html>`;

            const printWindow = window.open('', '_blank', 'width=900,height=700');
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { printWindow.print(); }, 750); // URL yüklenmesi için 750ms daha güvenli
            break;
        }

        default: {
            let brandColor = '#333';
            let brandHeaderHtml = `<h1>${marka}</h1>`;
            
            if(marka === 'MITSUBISHI HEAVY') {
                brandColor = '#002E6D';
                brandHeaderHtml = `<h1 style="color:${brandColor}; margin:0; font-size:24px; font-weight:800;">MITSUBISHI HEAVY INDUSTRIES</h1><div style="font-size:10px; color:#555;">AIR CONDITIONING</div>`;
            } else if(marka === 'MITSUBISHI ELECTRIC') {
                brandColor = '#E60012';
                brandHeaderHtml = `<h1 style="color:${brandColor}; margin:0; font-size:24px; font-weight:800;">MITSUBISHI ELECTRIC</h1><div style="font-size:10px; color:#555;">Changes for the Better</div>`;
            } else if(marka === 'NIVA') {
                brandColor = '#FF6600';
                brandHeaderHtml = `<h1 style="color:${brandColor}; margin:0; font-size:26px; font-weight:800;">NIVA</h1>`;
            } else if(marka === 'OLEFINI') {
                brandColor = '#009933';
                brandHeaderHtml = `<h1 style="color:${brandColor}; margin:0; font-size:26px; font-weight:800;">OLEFINI</h1><div style="font-size:10px; color:#555;">AIR CURTAINS</div>`;
            } else if(marka === 'ENDÜSTRİYEL MUTFAK') {
                brandColor = '#4B5563';
                brandHeaderHtml = `<h1 style="color:${brandColor}; margin:0; font-size:22px; font-weight:800;">ENDÜSTRİYEL MUTFAK</h1><div style="font-size:10px; color:#555;">PROFESYONEL ÇÖZÜMLER</div>`;
            }

            const gruplar = getGruplanmisKalemler(p.proforma_kalemleri);
            const grupKeys = Object.keys(gruplar).sort();

            let tablesHtml = '';
            grupKeys.forEach(grupAdi => {
                let grupRows = '';
                let counter = 1;
                gruplar[grupAdi].forEach(kalem => {
                    let tutar = kalem.miktar * kalem.birim_fiyat;
                    grupRows += `
                        <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${counter++}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">
                            <div style="font-weight:bold; color:${brandColor}">${kalem.aciklama}</div>
                        </td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${kalem.miktar}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${kalem.birim || 'Adet'}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(kalem.birim_fiyat, pb)}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(tutar, pb)}</td>
                        </tr>
                    `;
                });

                tablesHtml += `
                    <div style="margin-bottom: 25px;">
                        <div style="background-color: #f3f4f6; padding: 8px 10px; border-left: 4px solid ${brandColor}; font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; color: #374151;">
                            ${grupAdi === 'Genel' ? 'Ürün ve Hizmetler' : grupAdi}
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 40px; text-align: center; border-radius: 4px 0 0 0; background: ${brandColor}; color: white; padding: 10px 8px; font-size: 11px;">#</th>
                                    <th style="background: ${brandColor}; color: white; padding: 10px 8px; font-size: 11px; text-align:left;">Açıklama</th>
                                    <th style="width: 60px; text-align: center; background: ${brandColor}; color: white; padding: 10px 8px; font-size: 11px;">Miktar</th>
                                    <th style="width: 60px; text-align: center; background: ${brandColor}; color: white; padding: 10px 8px; font-size: 11px;">Birim</th>
                                    <th style="width: 100px; text-align: right; background: ${brandColor}; color: white; padding: 10px 8px; font-size: 11px;">Birim Fiyat</th>
                                    <th style="width: 100px; text-align: right; border-radius: 0 4px 0 0; background: ${brandColor}; color: white; padding: 10px 8px; font-size: 11px;">Tutar</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${grupRows}
                            </tbody>
                        </table>
                    </div>
                `;
            });

            const htmlContent = `
              <!DOCTYPE html>
              <html lang="tr">
              <head>
                <meta charset="UTF-8">
                <title>Teklif - ${p.proforma_no}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                    @page { margin: 1cm; size: A4; }
                    body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.5; margin: 0; padding: 0; font-size: 11px; }
                    .container { max-width: 210mm; margin: 0 auto; background: white; }
                    .brand-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; border-bottom: 3px solid ${brandColor}; margin-bottom: 20px; }
                    .brand-logo-area { width: 50%; }
                    .doc-title { text-align: right; width: 50%; }
                    .doc-title h2 { margin: 0; font-size: 20px; color: #333; text-transform: uppercase; }
                    .doc-title .sub { font-size: 12px; color: #666; margin-top: 4px; }
                    .info-grid { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 25px; }
                    .info-card { flex: 1; background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
                    .info-label { font-size: 10px; color: #6b7280; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
                    .info-val { font-size: 12px; font-weight: 600; color: #111827; }
                    .info-val-sm { font-size: 11px; color: #374151; display: block; margin-top: 2px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
                    td { font-size: 11px; color: #333; }
                    .totals-area { display: flex; justify-content: flex-end; margin-top: 10px; }
                    .totals-box { width: 250px; background: #fff; border: 1px solid #eee; padding: 10px; border-radius: 4px; }
                    .t-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 11px; }
                    .t-row.last { font-weight: bold; font-size: 14px; color: ${brandColor}; border-top: 2px solid #eee; padding-top: 5px; margin-top: 5px; }
                    .footer-info { margin-top: 40px; border-top: 1px solid #eee; padding-top: 10px; font-size: 10px; color: #666; display: flex; justify-content: space-between; }
                    .provider { font-weight: bold; color: #000; }
                </style>
              </head>
              <body>
                <div class="container">
                    <div class="brand-header">
                        <div class="brand-logo-area">${brandHeaderHtml}</div>
                        <div class="doc-title"><h2>SATIŞ TEKLİFİ</h2><div class="sub">Tarih: ${tarih} &nbsp;|&nbsp; No: ${p.proforma_no}</div></div>
                    </div>
                    <div class="info-grid">
                        <div class="info-card">
                            <div class="info-label">SAYIN</div>
                            <div class="info-val">${musteri.unvan || 'BELİRSİZ'}</div>
                            <span class="info-val-sm">İlgili: ${ilgiliKisi}</span>
                            <span class="info-val-sm">${musteri.adres || ''}</span>
                            <span class="info-val-sm">${musteri.vergi_no ? 'V.No: ' + musteri.vergi_no : ''}</span>
                        </div>
                        <div class="info-card" style="text-align:right;">
                            <div class="info-label">TEKLİF VEREN</div>
                            <div class="info-val">Tavlaşoğlu Isıtma Soğutma</div>
                            <span class="info-val-sm">Doğalgaz Sis. Tic. San. ve Ltd. Şti.</span>
                            <span class="info-val-sm">Lalapaşa Mah. Samih Kobal Cad.</span>
                            <span class="info-val-sm">Tel: 0(442) 238 83 83</span>
                            ${p.proje_adi ? `<div style="margin-top:5px; color:${brandColor}; font-weight:bold;">PROJE: ${p.proje_adi}</div>` : ''}
                        </div>
                    </div>

                    ${tablesHtml}

                    <div class="totals-area">
                        <div class="totals-box">
                            <div class="t-row"><span>Ara Toplam:</span> <span>${formatPara(toplamlar.value.araToplam, pb)}</span></div>
                            <div class="t-row"><span>KDV (%20):</span> <span>${formatPara(toplamlar.value.kdv, pb)}</span></div>
                            <div class="t-row last"><span>GENEL TOPLAM:</span> <span>${formatPara(toplamlar.value.genelToplam, pb)}</span></div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px;">
                        <div style="font-size: 11px; font-weight: bold; color: ${brandColor}; text-transform: uppercase; margin-bottom: 5px;">Teklif Şartları</div>
                        <div style="font-size: 10px; color: #444; white-space: pre-wrap; line-height: 1.4; background: #fafafa; padding: 10px; border-left: 3px solid ${brandColor};">${p.sartlar || 'Özel şart belirtilmemiştir.'}</div>
                    </div>
                    
                    ${p.notlar ? `<div style="margin-top: 15px;"><div style="font-size: 10px; font-weight: bold; color: #333;">NOTLAR:</div><div style="font-size: 10px; color: #555;">${p.notlar}</div></div>` : ''}

                    <div class="footer-info">
                        <div>Bu teklif ${formatTarih(p.gecerlilik_tarihi)} tarihine kadar geçerlidir.</div>
                        <div class="provider">Tavlaşoğlu Isıtma Soğutma - Mühendislik Çözümleri</div>
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
            break;
        }
    }
};

onMounted(getDetay);
</script>
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
          
          <!-- YENİ: PROJE ADI GÖRÜNTÜLEME -->
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

          <!-- YENİ: PROJE ADI DÜZENLEME -->
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

const kategoriListesi = ['KLİMA', 'VRF', 'HAVA PERDESİ', 'SOĞUK ODA', 'ISI POMPASI', 'DX', 'İŞÇİLİK', 'YEDEK PARÇA'];

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
    proje_adi: proforma.value.proje_adi, // YENİ: PROJE ADI
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
        proje_adi: form.value.proje_adi, // YENİ: KAYDETME
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

// --- STANDART PROFORMA YAZDIRMA (GRUPLU) ---
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
                <td colspan="6" style="padding: 6px 10px; font-weight: bold; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #ddd;">
                    ${grupAdi}
                </td>
            </tr>
         `;
     }

     gruplar[grupAdi].forEach(kalem => {
        let tutar = kalem.miktar * kalem.birim_fiyat;
        kalemlerHTML += `
            <tr>
            <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: center;">${counter++}</td>
            <td style="padding: 6px; border-bottom: 1px solid #eee;">${kalem.aciklama}</td>
            <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: center;">${kalem.miktar}</td>
            <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: center;">${kalem.birim || 'Adet'}</td>
            <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(kalem.birim_fiyat, pb)}</td>
            <td style="padding: 6px; border-bottom: 1px solid #eee; text-align: right;">${formatPara(tutar, pb)}</td>
            </tr>
        `;
     });
  });

  const htmlContent = `
      <!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Proforma - ${p.proforma_no}</title>
        <style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'); @page { margin: 1cm; size: A4; } body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.4; margin: 0; padding: 0; font-size: 11px; } .container { max-width: 210mm; margin: 0 auto; background: white; padding-bottom: 20px; } .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; } .logo-area img { height: 80px; object-fit: contain; } .company-details { text-align: right; font-size: 10px; color: #555; } .company-name { font-size: 14px; font-weight: bold; color: #111; } .doc-no { font-weight: bold; font-size: 12px; color: #333; } .info-grid { display: flex; justify-content: space-between; margin-bottom: 20px; margin-top: 10px; } .info-box { width: 48%; border: 1px solid #eee; padding: 10px; border-radius: 4px; } .box-title { font-size: 11px; font-weight: bold; border-bottom: 1px solid #ddd; margin-bottom: 5px; padding-bottom: 2px; color: #4f46e5; } .row { display: flex; justify-content: space-between; margin-bottom: 3px; } table { width: 100%; border-collapse: collapse; margin-bottom: 20px; } th { background: #f9fafb; padding: 6px; border-bottom: 2px solid #ddd; text-align: left; font-size: 10px; font-weight: bold; } .totals { display: flex; justify-content: flex-end; } .total-wrapper { width: 200px; } .total-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 10px; } .total-row.final { font-weight: bold; font-size: 12px; border-top: 2px solid #333; margin-top: 3px; padding-top: 5px; } .footer-note { position: fixed; bottom: 0; left: 0; width: 100%; text-align: center; font-size: 9px; color: #999; padding: 5px; }
        </style></head><body><div class="container"><div class="header"><div class="logo-area"><img src="${logoUrl}" alt="Logo"></div><div class="company-details"><div class="company-name">Tavlaşoğlu Isıtma Soğutma</div><div class="company-name">Doğalgaz Sis. Tic. San. ve Ltd. Şti.</div><div>Lalapaşa Mah. Samih Kobal Cad. İnanoğlu Apt. No:16/2 Yakutiye / Erzurum</div><div>Tel: 0(442) 238 83 83 | V.D: Aziziye | V.No: 8300346377</div></div></div><div class="info-grid"><div class="info-box"><div class="box-title">SAYIN / MÜŞTERİ</div><div class="row"><strong>${musteri.unvan || '-'}</strong></div><div class="row"><span>İlgili:</span> <span>${ilgiliKisi}</span></div><div class="row"><span>Adres:</span> <span>${musteri.adres || '-'}</span></div><div class="row"><span>V.No:</span> <span>${musteri.vergi_no || '-'}</span></div></div><div class="info-box"><div class="box-title">BELGE BİLGİLERİ</div><div class="row"><span>Tarih:</span> <span>${tarih}</span></div><div class="row"><span>Proforma No:</span> <span class="doc-no">${p.proforma_no}</span></div></div></div><table><thead><tr><th style="text-align: center; width: 30px;">#</th><th>Açıklama</th><th style="text-align: center; width: 60px;">Miktar</th><th style="text-align: center; width: 60px;">Birim</th><th style="text-align: right; width: 100px;">Birim Fiyat</th><th style="text-align: right; width: 100px;">Tutar</th></tr></thead><tbody>${kalemlerHTML}</tbody></table><div class="totals"><div class="total-wrapper"><div class="total-row"><span>Ara Toplam:</span><span>${formatPara(toplamlar.value.araToplam, pb)}</span></div><div class="total-row"><span>KDV (%20):</span><span>${formatPara(toplamlar.value.kdv, pb)}</span></div><div class="total-row final"><span>GENEL TOPLAM:</span><span>${formatPara(toplamlar.value.genelToplam, pb)}</span></div></div></div><div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;"><h4 style="margin: 0 0 5px 0; font-size: 10px; text-transform: uppercase;">Şartlar ve Koşullar</h4><div style="white-space: pre-wrap; font-size: 9px; color: #444; line-height: 1.3;">${p.sartlar || 'Şart belirtilmemiş.'}</div></div>${p.notlar ? `<div style="margin-top:10px; padding:10px; background:#f9fafb; font-size:9px;"><strong>NOTLAR:</strong><br>${p.notlar}</div>` : ''}<div class="footer-note">Bu belge bilgilendirme amaçlıdır. Proforma Fatura.</div></div></body></html>`;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 500);
};

// --- MARKALI TEKLİF YAZDIRMA (GRUPLU) ---
// ============================================================
// HAIER TEKLİF YAZDIR - Güncellenmiş teklifYazdir() Fonksiyonu
// ============================================================
// Bu kodu mevcut teklifYazdir() fonksiyonuyla tamamen değiştirin.
// Logolar için public klasörüne aşağıdaki dosyaları ekleyin:
//   /public/haier_logo.png     → Haier markası logosu
//   /public/tavlasoglu_logo.png    → Tavlaşoğlu firma logosu
// ============================================================

const teklifYazdir = () => {
    if (!proforma.value || !secilenMarka.value) return;

    showTeklifModal.value = false;

    const p = proforma.value;
    const marka = secilenMarka.value;
    const tarih = formatTarih(p.olusturma_tarihi);
    const musteri = p.musteriler || {};
    const ilgiliKisi = p.ilgili_kisi || musteri.ilgili_kisi || '-';
    const pb = p.para_birimi || 'TRY';



    switch(marka) {
                
        // ============================================================
        // HAIER TEKLİF YAZDIR - teklifYazdir() içindeki HAIER case'i
        // ============================================================
        // Mevcut switch(marka) bloğundaki case 'HAIER': kısmını
        // aşağıdaki kodla tamamen değiştirin.
        // Logolar doğrudan base64 olarak gömülüdür, public klasörüne
        // gerek yoktur.
        // ============================================================

        // switch(marka) bloğu içinde:
        case 'HAIER': {
            const haierB64 = "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";
            const tavlasB64 = "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";
            const haierImgSrc = `data:image/png;base64,${haierB64}`;
            const tavlasImgSrc = `data:image/png;base64,${tavlasB64}`;

            // Gruplu ürün tabloları (Sayfa 2)
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
                <!-- Sol: Tavlaşoğlu logosu -->
                <div>
                    <img src="${tavlasImgSrc}" alt="Tavlaşoğlu" style="height:80px;object-fit:contain;">
                </div>
                <!-- Sağ: Haier logosu + Tarih + Teklif No -->
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

                <!-- Sol çizgili müşteri bloğu -->
                <div style="border-left:3px solid #005BBB;padding-left:14px;margin-bottom:32px;margin-top:10px;">
                    <div style="font-size:13pt;font-weight:800;color:#111;line-height:1.4;">${musteri.unvan || 'FİRMA ÜNVANI'}</div>
                    <div style="font-size:10.5pt;color:#444;margin-top:3px;">${musteri.adres || ''}</div>
                    <div style="font-size:10.5pt;color:#222;margin-top:5px;">Sn. <strong>${ilgiliKisi}</strong> dikkatine;</div>
                </div>

                <!-- Konu paragrafı -->
                <div style="font-size:10.5pt;line-height:1.8;color:#222;margin-bottom:16px;">
                    <strong style="font-size:12pt;color:#111;">${p.proje_adi || 'Projeniz'}</strong> projesi kapsamında ihtiyaç duyulan iklimlendirme çözümlerine dair hazırladığımız <strong style="color:#005BBB;">HAIER</strong> teklifimiz ekte bilgilerinize sunulmuştur.
                </div>

                <!-- Açıklama paragrafı -->
                <div style="font-size:10.5pt;line-height:1.8;color:#333;margin-bottom:14px;">
                    Bu önemli projenin bir parçası olmayı ve çözüm ortağınız olarak birlikte çalışmayı <strong>büyük bir istekle arzu ediyoruz.</strong> Teklif detayları, teknik spesifikasyonlar veya süreçle ilgili her türlü sorunuz için <strong>bizimle dilediğiniz an iletişime geçmekten lütfen çekinmeyiniz.</strong> Sorularınızı yanıtlamaktan ve projeyi detaylandırmaktan memnuniyet duyacağız.
                </div>

                <div style="font-size:10.5pt;line-height:1.8;color:#333;margin-bottom:8px;">
                    Olumlu dönüşlerinizi bekler, iyi çalışmalar dileriz.
                </div>
                <div style="font-size:10.5pt;line-height:1.8;color:#333;margin-bottom:40px;">
                    Saygılarımızla,
                </div>

                <!-- İmza -->
                <div style="margin-bottom:auto;">
                    <div style="font-size:11pt;font-weight:700;color:#111;margin-bottom:2px;">YUSUF TAVLAŞOĞLU</div>
                </div>

                <!-- Alt sol bilgi kutusu -->
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

        </div><!-- /sayfa1 -->


        <!-- ===== SAYFA 2 - TEKLİF TABLOLARI ===== -->
        <div class="sayfa">

            <!-- ÜST BAŞLIK BANDI -->
            <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:40px 56px 28px 56px;border-bottom:1px solid #ddd;">
                <!-- Sol: Tavlaşoğlu logosu -->
                <div>
                    <img src="${tavlasImgSrc}" alt="Tavlaşoğlu" style="height:80px;object-fit:contain;">
                </div>
                <!-- Sağ: Haier logosu + Tarih + Teklif No -->
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

            <!-- TABLO GÖVDE -->
            <div style="flex:1;padding:18px 20px 16px 20px;">

                <!-- Proje + Müşteri başlık satırı -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                    <div style="font-size:11pt;font-weight:700;color:#005BBB;">${p.proje_adi || ''}</div>
                    <div style="font-size:9.5pt;color:#555;">${musteri.unvan || ''}</div>
                </div>

                <!-- Gruplu tablolar -->
                ${grupTabloHTML}

                <!-- Toplamlar -->
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

                <!-- Teklif Şartları -->
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

            <!-- ALT FOOTER -->
            <div style="border-top:1px solid #ccc;padding:10px 28px;background:#f9f9f9;text-align:center;">
                <div style="font-size:7.5pt;color:#555;line-height:1.6;">
                    <strong>TAVLAŞOĞLU ISI. SÖĞ. DGAZ SİS. İNŞ. TAH. END. DAY. TÜK. MAL.LTD.ŞTİ.</strong><br>
                    HİLAL MAH. TURAN GÜNEŞ BULVARI HİLAL APT. DIŞ KAPI NO:17 KAT:3/7 ÇANKAYA/ANKARA<br>
                    E-mail: info@tavlasoglu.com.tr &nbsp;|&nbsp; Tel: 530 066 80 25
                </div>
            </div>

        </div><!-- /sayfa2 -->

        </body>
        </html>`;

            const printWindow = window.open('', '_blank', 'width=900,height=700');
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { printWindow.print(); }, 600);
            break;
        }

        case 'MITSUBISHI HEAVY':
            brandColor = '#002E6D';
            brandHeaderHtml = `<h1 style="color:${brandColor}; margin:0; font-size:24px; font-weight:800;">MITSUBISHI HEAVY INDUSTRIES</h1><div style="font-size:10px; color:#555;">AIR CONDITIONING</div>`;
            break;
        case 'MITSUBISHI ELECTRIC':
            brandColor = '#E60012';
            brandHeaderHtml = `<h1 style="color:${brandColor}; margin:0; font-size:24px; font-weight:800;">MITSUBISHI ELECTRIC</h1><div style="font-size:10px; color:#555;">Changes for the Better</div>`;
            break;
        case 'NIVA':
            brandColor = '#FF6600';
            brandHeaderHtml = `<h1 style="color:${brandColor}; margin:0; font-size:26px; font-weight:800;">NIVA</h1>`;
            break;
        case 'OLEFINI':
            brandColor = '#009933';
            brandHeaderHtml = `<h1 style="color:${brandColor}; margin:0; font-size:26px; font-weight:800;">OLEFINI</h1><div style="font-size:10px; color:#555;">AIR CURTAINS</div>`;
            break;
        case 'ENDÜSTRİYEL MUTFAK':
            brandColor = '#4B5563';
            brandHeaderHtml = `<h1 style="color:${brandColor}; margin:0; font-size:22px; font-weight:800;">ENDÜSTRİYEL MUTFAK</h1><div style="font-size:10px; color:#555;">PROFESYONEL ÇÖZÜMLER</div>`;
            break;
        default:
            brandColor = '#333';
            brandHeaderHtml = `<h1>${marka}</h1>`;
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

        // Her grup için ayrı tablo bloğu
        tablesHtml += `
            <div style="margin-bottom: 25px;">
                <div style="background-color: #f3f4f6; padding: 8px 10px; border-left: 4px solid ${brandColor}; font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; color: #374151;">
                    ${grupAdi === 'Genel' ? 'Ürün ve Hizmetler' : grupAdi}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center; border-radius: 4px 0 0 0;">#</th>
                            <th>Açıklama</th>
                            <th style="width: 60px; text-align: center;">Miktar</th>
                            <th style="width: 60px; text-align: center;">Birim</th>
                            <th style="width: 100px; text-align: right;">Birim Fiyat</th>
                            <th style="width: 100px; text-align: right; border-radius: 0 4px 0 0;">Tutar</th>
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
            th { background: ${brandColor}; color: white; padding: 10px 8px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
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
                </div>
            </div>

            <!-- DİNAMİK GRUPLU TABLOLAR -->
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
};

onMounted(getDetay);
</script>
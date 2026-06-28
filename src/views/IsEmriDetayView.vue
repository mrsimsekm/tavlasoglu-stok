<template>
  <div>
    <!-- HEADER -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">
          İş Emri Detayı <span v-if="isEditing" class="text-yellow-500 text-xl">(Düzenleme Modu)</span>
        </h1>
        <p v-if="isEmri" class="text-sm text-gray-500 mt-1">
          İş Emri No: <span class="font-mono font-semibold text-indigo-600">{{ isEmri.numara || 'N/A' }}</span>
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <!-- YAZDIR BUTONU -->
        <button v-if="isEmri && !isEditing" @click="yazdirModaliniAc" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-sm transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clip-rule="evenodd" /></svg>Yazdır
        </button>
        
        <!-- AKSİYON BUTONLARI -->
        <div v-if="isEmri && isEmri.durum === 'Açık'" class="flex items-center space-x-2">
          
          <template v-if="!isEditing">
            <button @click="baslaDuzenle" class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-sm transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              Düzenle
            </button>
            <button @click="isEmriIptalEt" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-sm transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
              İptal Et
            </button>
            <button @click="kapanisModaliniAc" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-sm transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>Kapat
            </button>
          </template>

          <template v-else>
            <button @click="iptalEt" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded shadow-sm">Vazgeç</button>
            <button @click="guncelle" :disabled="guncellemeYapiliyor" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow-sm disabled:opacity-50 flex items-center">
              <svg v-if="guncellemeYapiliyor" class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ guncellemeYapiliyor ? 'Kaydediliyor...' : 'Kaydet' }}
            </button>
          </template>
        </div>

        <RouterLink to="/app/is-emirleri" class="text-gray-600 hover:text-gray-800 font-medium border border-gray-300 px-3 py-2 rounded-lg bg-white">&larr; Geri</RouterLink>
      </div>
    </div>

    <!-- LOADING & ERROR -->
    <div v-if="loading" class="text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-700">Hata: {{ error }}</div>
    
    <!-- İÇERİK -->
    <div v-else-if="isEmri" class="space-y-6">
      
      <!-- 1. GENEL BİLGİLER -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Genel Bilgiler</h2>
        <div v-if="!isEditing" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><p class="label-style">Müşteri</p><p class="font-semibold">{{ isEmri.musteriler.unvan }}</p></div>
          <div><p class="label-style">İş Emri Tipi</p><p class="font-semibold px-2 py-1 inline-block rounded text-xs uppercase" :class="getTipRenk(isEmri.is_emri_tipi)">{{ isEmri.is_emri_tipi }}</p></div>
          <div><p class="label-style">Sipariş Tarihi</p><p class="font-semibold">{{ new Date(isEmri.siparis_tarihi).toLocaleDateString('tr-TR') }}</p></div>
          <div><p class="label-style">Durum</p><p class="font-semibold px-2 py-1 inline-block rounded" :class="getDurumRenk(isEmri.durum)">{{ isEmri.durum }}</p></div>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><p class="label-style">Müşteri</p><p class="font-semibold p-2 border rounded-md bg-gray-100">{{ isEmri.musteriler.unvan }}</p></div>
          <div><label class="label-style">İş Emri Tipi (*)</label><select v-model="duzenlemeFormu.is_emri_tipi" class="form-input"><option value="SİPARİŞ">Sipariş</option><option value="ARIZA">Arıza / Servis</option></select></div>
        </div>
      </div>

      <!-- 2. İŞ EMRİ DETAYLARI VE MALİYET -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- SOL: Detaylar -->
        <div class="bg-white p-6 rounded-lg shadow-md h-full">
          <h2 class="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">İş Emri Detayları</h2>
          <div v-if="!isEditing" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div><p class="label-style">Satışçı</p><p class="font-semibold">{{ isEmri.satiscilar?.ad_soyad || '-' }}</p></div>
              <div><p class="label-style">Fatura No</p><p class="font-semibold">{{ isEmri.fatura_no || '-' }}</p></div>
              <div><p class="label-style">Para Birimi</p><p class="font-bold text-indigo-600">{{ isEmri.para_birimi || 'TRY' }}</p></div>
              <div><p class="label-style">KDV Durumu</p><p class="font-semibold text-gray-800">Hariç</p></div>
              <div><p class="label-style">İş Durumu</p><p class="font-semibold" :class="isEmri.is_tamamlandi ? 'text-green-600' : 'text-gray-400'">{{ isEmri.is_tamamlandi ? '✓ Tamamlandı' : '○ Devam Ediyor' }}</p></div>
              <div>
                <p class="label-style">Stok / Sevk Durumu</p>
                <p class="font-semibold" :class="isEmri.rezerve_edildi ? 'text-orange-500' : 'text-indigo-600'">
                   {{ isEmri.rezerve_edildi ? '🔒 Stokta Rezerve' : '🚚 Sevk Edildi (Düştü)' }}
                </p>
              </div>
            </div>
            <div class="border-t border-gray-100 pt-3"><p class="label-style mb-1">Sevk Adresi</p><p v-if="isEmri.sevk_adresi" class="text-gray-800 whitespace-pre-wrap font-medium">{{ isEmri.sevk_adresi }}</p><p v-else class="text-gray-400 italic text-sm">Sevk adresi belirtilmemiş.</p></div>
          </div>
          <div v-else class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div><label class="label-style">Satışçı</label><select v-model="duzenlemeFormu.satisci_id" class="form-input"><option :value="null">Satışçı Seçin</option><option v-for="satisci in satiscilar" :key="satisci.id" :value="satisci.id">{{ satisci.ad_soyad }}</option></select></div>
              <div><label class="label-style">Fatura No</label><input v-model="duzenlemeFormu.fatura_no" type="text" class="form-input" placeholder="Fatura numarası"></div>
              <div><label class="label-style">Para Birimi</label><select v-model="duzenlemeFormu.para_birimi" class="form-input font-bold"><option value="TRY">TRY</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option></select></div>
              
              <div class="flex flex-col justify-center space-y-3 pt-4 border border-gray-200 rounded-md p-2 bg-gray-50">
                <label class="flex items-center cursor-pointer" title="Seçilirse ürünler stoktan düşmez, rezerve olarak ayrılır.">
                  <input type="checkbox" v-model="duzenlemeFormu.rezerve_edildi" class="h-5 w-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500">
                  <span class="ml-3 text-sm font-bold text-orange-700">Rezerve Et (Stoktan Düşme)</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input type="checkbox" v-model="duzenlemeFormu.is_tamamlandi" class="h-5 w-5 text-green-600 rounded border-gray-300 focus:ring-green-500">
                  <span class="ml-3 text-sm font-medium text-gray-700">İş Tamamlandı</span>
                </label>
              </div>
            </div>
            <div><label class="label-style">Sevk Adresi</label><textarea v-model="duzenlemeFormu.sevk_adresi" rows="2" class="form-input" placeholder="Teslimat adresi..."></textarea></div>
          </div>
        </div>

        <!-- SAĞ: MALİYET KALEMLERİ -->
        <div class="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
          <div class="flex justify-between items-center mb-4 border-b pb-2">
            <h2 class="text-xl font-semibold text-gray-700">Maliyet Kalemleri</h2>
            <div class="text-sm">Toplam: <span class="font-bold text-orange-600 text-lg">{{ formatParaBirimi(hesaplananMaliyet, isEditing ? duzenlemeFormu.para_birimi : isEmri.para_birimi) }}</span></div>
          </div>
          <div v-if="!isEditing" class="flex-grow overflow-y-auto max-h-[300px]">
            <div v-if="maliyetListesi.length === 0" class="text-center text-gray-400 py-8 italic">Maliyet kalemi girilmemiş.</div>
            <table v-else class="min-w-full">
              <thead class="bg-gray-50 text-xs text-gray-500 uppercase"><tr><th class="px-2 py-1 text-left">Açıklama</th><th class="px-2 py-1 text-right">Tutar</th></tr></thead>
              <tbody class="text-sm divide-y divide-gray-100"><tr v-for="(item, idx) in maliyetListesi" :key="idx"><td class="px-2 py-2">{{ item.aciklama }}</td><td class="px-2 py-2 text-right font-mono">{{ formatParaBirimi(item.tutar, isEmri.para_birimi) }}</td></tr></tbody>
            </table>
          </div>
          <div v-else class="flex-grow flex flex-col">
            <div class="flex-grow overflow-y-auto max-h-[250px] mb-4">
              <div v-for="(item, idx) in duzenlemeMaliyetListesi" :key="idx" class="flex gap-2 mb-2 items-center">
                <input v-model="item.aciklama" type="text" class="form-input flex-grow" placeholder="Örn: Yakıt, Yemek">
                <input v-model="item.tutar" type="text" class="form-input w-24 text-right" placeholder="0.00">
                <button @click="maliyetSil(idx)" class="text-red-500 hover:text-red-700 p-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg></button>
              </div>
            </div>
            <button @click="maliyetEkle" type="button" class="w-full border-2 border-dashed border-gray-300 text-gray-500 py-2 rounded-lg hover:border-blue-500 hover:text-blue-500 transition font-semibold text-sm">+ Maliyet Kalemi Ekle</button>
          </div>
        </div>
      </div>
      
      <!-- 3. KALEMLER -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4"><h2 class="text-xl font-semibold text-gray-700">Ürün ve Hizmetler</h2></div>
        
        <IsEmriKalemEkle 
          v-if="isEditing" 
          :depolar="depolar" 
          :tedarikciler="tedarikciler" 
          :anlasmalar="anlasmalar" 
          :initialKalemler="guncelKalemler" 
          :kaydedilmis-is-emri="true" 
          :para-birimi="duzenlemeFormu.para_birimi" 
          @kalemler-guncellendi="handleKalemlerGuncellendi"
        />
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full leading-normal">
            <thead>
              <tr>
                <th class="th-style">Açıklama</th>
                <th class="th-style">Kaynak</th>
                <th class="th-style">Anlaşma</th>
                <th class="th-style text-center">Miktar</th>
                <th class="th-style text-center">Birim</th>
                <th class="th-style text-right">
                  Birim Fiyat<br><span class="text-[10px] text-gray-500 font-normal">(KDV Hariç)</span>
                </th>
                <th class="th-style text-right">Toplam (KDV Hariç)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!isEmri.is_emri_kalemleri || isEmri.is_emri_kalemleri.length === 0"><td colspan="7" class="text-center py-4">Bu iş emrine ait kalem bulunamadı.</td></tr>
              <tr v-for="kalem in isEmri.is_emri_kalemleri" :key="kalem.id" class="hover:bg-gray-50 transition-colors">
                <td class="td-style font-medium">
                    {{ kalem.aciklama }}
                    <span v-if="kalem.emanet_id" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 uppercase tracking-wider">
                       Emanet
                    </span>
                </td>
                <td class="td-style">
                    <div v-if="kalem.emanet_id">
                      <span class="text-orange-600 font-bold block">Emanet</span>
                      <span class="text-gray-400 italic text-xs">{{ kalem.emanetler?.tedarikci_adi_notu }}</span>
                    </div>
                    <div v-else>
                      {{ kalem.depolar ? kalem.depolar.ad : (kalem.tedarikciler ? kalem.tedarikciler.ad : 'Hizmet') }}
                    </div>
                </td>
                <td class="td-style">{{ kalem.anlasmalar ? kalem.anlasmalar.ad : 'Anlaşma Dışı' }}</td>
                <td class="td-style text-center font-bold text-gray-800">{{ kalem.miktar }}</td>
                <td class="td-style text-center text-xs text-gray-500">{{ kalem.birim || 'Adet' }}</td>
                <td class="td-style text-right font-mono">{{ formatParaBirimi(kalem.birim_fiyat, isEmri.para_birimi) }}</td>
                <td class="td-style text-right font-semibold font-mono">{{ formatParaBirimi(kalem.miktar * kalem.birim_fiyat, isEmri.para_birimi) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. NOTLAR -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4"><h2 class="text-xl font-semibold text-gray-700">Notlar</h2><button v-if="!notDuzenleniyor" @click="notDuzenlemeyeBasla" class="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">{{ isEmri.notlar ? 'Düzenle ✎' : '+ Not Ekle' }}</button></div>
        <div v-if="!notDuzenleniyor" class="min-h-[60px]"><p v-if="isEmri.notlar" class="text-gray-700 whitespace-pre-wrap">{{ isEmri.notlar }}</p><p v-else class="text-gray-400 italic">Henüz not eklenmemiş.</p></div>
        <div v-else>
          <textarea v-model="notIcerigi" rows="6" class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="İş emri ile ilgili notlarınızı buraya yazabilirsiniz..."></textarea>
          <div class="flex justify-end mt-3 space-x-2">
            <button @click="notDuzenlemeIptal" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition">İptal</button>
            <button @click="notuKaydet" :disabled="notKayitYapiliyor" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50">
                {{ notKayitYapiliyor ? 'Kaydediliyor...' : 'Kaydet' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 5. TOPLAMLAR ve KÂRLILIK -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex flex-col items-end space-y-2">
           <div class="flex justify-between w-64 text-gray-600">
              <span>Ara Toplam:</span>
              <span class="font-semibold">{{ formatParaBirimi(toplamlar.araToplam, isEmri.para_birimi) }}</span>
           </div>
           <div class="flex justify-between w-64 text-gray-600">
              <span>KDV (%20):</span>
              <span class="font-semibold">{{ formatParaBirimi(toplamlar.kdv, isEmri.para_birimi) }}</span>
           </div>
           <div class="flex justify-between w-64 text-xl font-bold text-gray-800 border-t pt-2 border-gray-200">
              <span>Genel Toplam:</span>
              <span class="text-indigo-600">{{ formatParaBirimi(toplamlar.genelToplam, isEmri.para_birimi) }}</span>
           </div>
           
           <div v-if="userStore.isYonetici || userStore.isMuhasebeci" class="w-64 mt-4 p-3 rounded-md border" 
                :class="finansalAnaliz.netKar >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
             <h3 class="text-xs font-bold uppercase tracking-wider mb-2 text-center" 
                 :class="finansalAnaliz.netKar >= 0 ? 'text-green-800' : 'text-red-800'">Operasyonel Kârlılık</h3>
             
             <div class="flex justify-between text-xs mb-1 text-gray-600">
               <span>Ciro (KDV dahil):</span>
               <span>{{ formatParaBirimi(toplamlar.genelToplam, isEmri.para_birimi) }}</span>
             </div>
             <div class="flex justify-between text-xs mb-2 text-red-600">
               <span>Toplam Maliyet:</span>
               <span>- {{ formatParaBirimi(hesaplananMaliyet, isEmri.para_birimi) }}</span>
             </div>
             
             <div class="flex justify-between text-sm font-bold border-t pt-2 border-dashed border-gray-300"
                  :class="finansalAnaliz.netKar >= 0 ? 'text-green-700' : 'text-red-700'">
               <span>Net Kâr:</span>
               <span>{{ formatParaBirimi(finansalAnaliz.netKar, isEmri.para_birimi) }}</span>
             </div>
             <div class="text-[10px] text-right mt-1 opacity-70">
               Marj: %{{ finansalAnaliz.oran.toFixed(2) }}
             </div>
           </div>

           <div class="w-64 border-t my-4 border-gray-200"></div>

           <div class="flex justify-between w-64 text-sm">
             <span>Ödenen:</span>
             <span class="text-green-600 font-bold">{{ formatParaBirimi(isEmri.odenen_tutar, isEmri.para_birimi) }}</span>
           </div>
           <div class="flex justify-between w-64 text-sm">
             <span>Kalan Bakiye:</span>
             <span class="text-red-600 font-bold">{{ formatParaBirimi(kalanBakiye, isEmri.para_birimi) }}</span>
           </div>
           
           <div class="mt-2">
              <button v-if="isEmri.durum === 'Açık' && kalanBakiye > 0 && (userStore.isMuhasebeci || userStore.isYonetici)" @click="tahsilatEkleModaliniAc" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-sm transition">+ Tahsilat Ekle</button>
           </div>
        </div>
      </div>
    </div>

    <!-- MODALLAR -->
    <IsEmriKapanisModal :show="kapanisModalGoster" :is-emri="isEmri" @close="kapanisModalGoster = false" @success="kapanisBasarili"/>
    
    <BaseModal :show="yazdirModalGoster" @close="yazdirModalGoster = false">
      <template #header>İş Emri Yazdır</template>
      <template #body>
        <div class="space-y-4">
          <p class="text-gray-700">İş emri yazdırma seçenekleri:</p>
          <div class="border rounded-lg p-4 bg-gray-50 space-y-3">
            <label class="flex items-center cursor-pointer">
              <input type="checkbox" v-model="yazdirFiyatGoster" class="h-5 w-5 text-indigo-600 rounded border-gray-300">
              <span class="ml-3 text-sm font-medium text-gray-700">Fiyat bilgilerini dahil et</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input type="checkbox" v-model="yazdirMaliyetGoster" class="h-5 w-5 text-indigo-600 rounded border-gray-300">
              <span class="ml-3 text-sm font-medium text-gray-700">Maliyetleri dahil et</span>
            </label>
          </div>
          <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p class="text-sm text-blue-800"><strong>İş Emri No:</strong> {{ isEmri?.numara || 'N/A' }}</p>
            <p class="text-sm text-blue-800"><strong>Müşteri:</strong> {{ isEmri?.musteriler?.unvan || '-' }}</p>
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="yazdirModalGoster = false" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition">İptal</button>
        <button @click="isEmriYazdir" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded ml-2 transition">Yazdır</button>
      </template>
    </BaseModal> 
    
    <BaseModal :show="tahsilatEkleModalGoster" @close="tahsilatEkleModalGoster = false">
      <template #header>Tahsilat Ekle</template>
      <template #body>
        <div class="space-y-4">
          <div><label class="label-style">Tutar</label><input v-model.number="tahsilatEkleForm.tutar" type="number" step="0.01" class="form-input"></div>
          <div><label class="label-style">Yöntem</label>
            <select v-model="tahsilatEkleForm.yontem" class="form-input">
              <option value="Nakit">Nakit</option>
              <option value="Kredi Kartı">Kredi Kartı</option>
              <option value="Havale/EFT">Havale/EFT</option>
            </select>
          </div>
          <div><label class="label-style">Not</label><textarea v-model="tahsilatEkleForm.notlar" class="form-input"></textarea></div>
        </div>
      </template>
      <template #footer>
        <button @click="tahsilatEkleModalGoster = false" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">İptal</button>
        <button @click="tahsilatEkle" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2">Ekle</button>
      </template>
    </BaseModal> 
  </div>
</template>

<style scoped>
.label-style { @apply text-xs font-bold uppercase text-gray-500 mb-1 tracking-wider; }
.form-input { @apply mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm; }
.th-style { @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-bold text-gray-600 uppercase tracking-wider; }
.td-style { @apply px-5 py-4 border-b border-gray-100 bg-white text-sm text-gray-800; }
</style>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, RouterLink, useRouter } from 'vue-router';
import { supabase } from '../supabase.js';
import IsEmriKalemEkle from '../components/IsEmriKalemEkle.vue';
import IsEmriKapanisModal from '../components/IsEmriKapanisModal.vue';
import BaseModal from '../components/BaseModal.vue';
import { useLoading } from '../composables/useLoading.js';
import { useUserStore } from '../stores/userStore.js';

const { isLoading: guncellemeYapiliyor, withLoading: guncelleWithLoading } = useLoading();
const { isLoading: notKayitYapiliyor, withLoading: notKaydetWithLoading } = useLoading();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const isEmriId = route.params.id;
const isEmri = ref(null);
const loading = ref(true);
const error = ref(null);
const isEditing = ref(false);
const depolar = ref([]);
const tedarikciler = ref([]);
const anlasmalar = ref([]);
const satiscilar = ref([]);
const guncelKalemler = ref([]);
const kapanisModalGoster = ref(false);
const notDuzenleniyor = ref(false);
const notIcerigi = ref('');
const yazdirModalGoster = ref(false);
const yazdirFiyatGoster = ref(true);
const yazdirMaliyetGoster = ref(true);
const tahsilatEkleModalGoster = ref(false);
const tahsilatEkleForm = ref({ tutar: 0, yontem: '', notlar: '' });

const maliyetListesi = ref([]);
const duzenlemeMaliyetListesi = ref([]);

const duzenlemeFormu = ref({ 
    satisci_id: null, 
    fatura_no: '', 
    is_tamamlandi: false, 
    rezerve_edildi: false, 
    is_emri_tipi: 'SİPARİŞ', 
    sevk_adresi: '', 
    para_birimi: 'TRY',
    kdv_dahil: false 
});

const parseSayi = (deger) => {
    if (deger === null || deger === undefined || deger === '') return 0;
    if (typeof deger === 'number') return deger;
    if (typeof deger === 'string') {
        const temiz = deger.replace(',', '.');
        const sayi = parseFloat(temiz);
        return isNaN(sayi) ? 0 : sayi;
    }
    return 0;
};

const getTipRenk = (tip) => { const renkler = { 'SİPARİŞ': 'bg-blue-100 text-blue-800', 'ARIZA': 'bg-yellow-100 text-yellow-800' }; return renkler[tip] || 'bg-gray-200 text-gray-700'; };
const getDurumRenk = (durum) => { const renkler = { 'Açık': 'bg-green-100 text-green-800', 'Kapalı': 'bg-gray-200 text-gray-700', 'İptal': 'bg-red-100 text-red-800' }; return renkler[durum] || 'bg-gray-200 text-gray-700'; };
const formatParaBirimi = (tutar, currency = 'TRY') => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency || 'TRY' }).format(tutar || 0);

const toplamlar = computed(() => {
  const kalemListesi = isEditing.value ? guncelKalemler.value : (isEmri.value?.is_emri_kalemleri || []);
  const araToplam = kalemListesi.reduce((acc, k) => {
      const miktar = parseFloat(k.miktar) || 0;
      const fiyat = parseSayi(k.birim_fiyat);
      return acc + (miktar * fiyat);
  }, 0);
  const kdv = araToplam * 0.20;
  const genelToplam = araToplam + kdv;
  return { araToplam, kdv, genelToplam };
});

const kalanBakiye = computed(() => {
  if (!isEmri.value) return 0;
  return (toplamlar.value.genelToplam - parseSayi(isEmri.value.odenen_tutar));
});

const hesaplananMaliyet = computed(() => {
  const liste = isEditing.value ? duzenlemeMaliyetListesi.value : maliyetListesi.value;
  return liste.reduce((sum, item) => sum + parseSayi(item.tutar), 0);
});

const finansalAnaliz = computed(() => {
  const gelir = toplamlar.value.genelToplam; 
  const gider = hesaplananMaliyet.value; 
  const netKar = gelir - gider;
  const oran = gelir > 0 ? (netKar / gelir) * 100 : 0;
  return { netKar, oran };
});

const tahsilatEkleModaliniAc = () => { 
  tahsilatEkleForm.value = { tutar: kalanBakiye.value > 0 ? kalanBakiye.value : 0, yontem: '', notlar: '' }; 
  tahsilatEkleModalGoster.value = true; 
};

const tahsilatEkle = async () => {
  if (!tahsilatEkleForm.value.tutar || tahsilatEkleForm.value.tutar <= 0) { alert('Geçerli tutar giriniz.'); return; }
  if (!tahsilatEkleForm.value.yontem) { alert('Yöntem seçiniz.'); return; }
  try {
    const { error: odemeError } = await supabase.from('odemeler').insert([{ 
      is_emri_id: isEmriId, 
      tutar: tahsilatEkleForm.value.tutar, 
      yontem: tahsilatEkleForm.value.yontem, 
      notlar: tahsilatEkleForm.value.notlar || null, 
      islem_yapan_kullanici_id: userStore.user?.id || null,
      odeme_tarihi: new Date()
    }]);
    if (odemeError) throw odemeError;

    const yeniOdenenTutar = parseSayi(isEmri.value.odenen_tutar) + parseSayi(tahsilatEkleForm.value.tutar);
    await supabase.from('is_emirleri').update({ odenen_tutar: yeniOdenenTutar }).eq('id', isEmriId);

    alert('Tahsilat başarıyla eklendi!');
    tahsilatEkleModalGoster.value = false;
    await getGerekliVeriler(); 
  } catch (err) { alert('Hata: ' + err.message); }
};

const yazdirModaliniAc = () => { yazdirFiyatGoster.value = true; yazdirMaliyetGoster.value = true; yazdirModalGoster.value = true; };

const isEmriYazdir = () => {
  const logoUrl = window.location.origin + '/logo11.png';
  const tarih = new Date(isEmri.value.siparis_tarihi).toLocaleDateString('tr-TR');
  const pb = isEmri.value.para_birimi || 'TRY';

  const kalemlerHTML = isEmri.value.is_emri_kalemleri.map((k, i) => {
    const birimFiyat = parseSayi(k.birim_fiyat);
    const miktar = parseFloat(k.miktar) || 0;
    const satirToplam = birimFiyat * miktar;
    
    return `
    <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${i+1}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${k.aciklama}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${k.depolar?.ad||k.tedarikciler?.ad||'Hizmet'}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${miktar}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${k.birim || 'Adet'}</td>
        ${yazdirFiyatGoster.value ? `
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatParaBirimi(birimFiyat, pb)}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatParaBirimi(satirToplam, pb)}</td>
        ` : ''}
    </tr>`;
  }).join('');

  const araToplam = toplamlar.value.araToplam;
  const toplamKDV = toplamlar.value.kdv;
  const genelToplam = toplamlar.value.genelToplam;
  
  let maliyetHTML = '';
  if (yazdirMaliyetGoster.value && maliyetListesi.value.length > 0) {
    const satirlar = maliyetListesi.value.map(m => `<tr><td style="padding:5px;border-bottom:1px solid #eee;">${m.aciklama}</td><td style="padding:5px;border-bottom:1px solid #eee;text-align:right;">${formatParaBirimi(parseSayi(m.tutar), pb)}</td></tr>`).join('');
    maliyetHTML = `
      <div style="margin-top: 30px; border: 1px solid #ddd; padding: 10px; break-inside: avoid;">
        <h4 style="margin: 0 0 10px 0; border-bottom: 1px solid #eee; padding-bottom: 5px;">Maliyet Detayları</h4>
        <table style="width: 100%; font-size: 11px;">
          <thead><tr><th style="text-align:left; background:#f3f3f3; padding:5px;">Açıklama</th><th style="text-align:right; background:#f3f3f3; padding:5px;">Tutar</th></tr></thead>
          <tbody>${satirlar}</tbody>
          <tfoot><tr><td style="padding:5px; font-weight:bold; text-align:right;">TOPLAM MALİYET</td><td style="padding:5px; font-weight:bold; text-align:right;">${formatParaBirimi(hesaplananMaliyet.value, pb)}</td></tr></tfoot>
        </table>
      </div>
    `;
  }

  const yazdirIcerik = `
    <!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>İş Emri</title><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');@page{margin:1cm;size:A4;}body{font-family:'Inter',sans-serif;color:#333;font-size:12px;}.header{display:flex;justify-content:space-between;margin-bottom:30px;border-bottom:2px solid #eee;padding-bottom:20px;}.logo-area img{height:80px;}.info-grid{display:flex;justify-content:space-between;margin-bottom:20px;}.info-box{width:48%;}.box-title{font-weight:bold;color:#4f46e5;border-bottom:1px solid #ddd;margin-bottom:10px;}.label{font-weight:600;color:#666;}table{width:100%;border-collapse:collapse;margin-bottom:30px;}th{background:#f9fafb;padding:10px;text-align:left;border-bottom:2px solid #ddd;}.totals-section{display:flex;justify-content:flex-end;}.total-wrapper{width:250px;}.total-row{display:flex;justify-content:space-between;padding:5px 0;}.total-row.final{font-weight:bold;font-size:14px;border-top:2px solid #333;padding-top:10px;margin-top:5px;}</style></head>
    <body>
      <div class="container">
        <div class="header"><div class="logo-area"><img src="${logoUrl}"></div>            <div class="company-details">
                <div style=" font-size: 16px; font-weight: bold; color: #111; margin-bottom: 1px;">Tavlaşoğlu Isıtma Soğutma</div>
                <div style=" font-size: 16px; font-weight: bold; color: #111; margin-bottom: 1px;">Doğalgaz Sis. Tic. San. ve Ltd. Şti.</div>
                <div>Lalapaşa Mah. Samih Kobal Cad. İnanoğlu Apt. No:16/2</div>
                <div>Yakutiye / Erzurum</div>
                <div>Tel: 0(442) 238 83 83</div>
            </div></div>
        
        <div class="info-grid">
            <div class="info-box">
                <div class="box-title">Müşteri</div>
                <div style="margin-bottom:5px;"><span class="label">Unvan:</span> ${isEmri.value.musteriler?.unvan}</div>
            </div>
            <div class="info-box">
                <div class="box-title">Detay</div>
                <div><span class="label">No:</span> ${isEmri.value.numara}</div>
                <div><span class="label">Sipariş Tarihi:</span> ${tarih}</div>
            </div>
        </div>

        <div style="margin-bottom: 30px; border: 1px solid #ddd; padding: 10px; border-radius: 5px; background-color: #fafafa;">
            <div style="font-weight: bold; margin-bottom: 5px; font-size: 11px; color: #666; text-transform: uppercase;">Sevk Adresi</div>
            <div style="white-space: pre-wrap;">${isEmri.value.sevk_adresi ? isEmri.value.sevk_adresi : 'Belirtilmemiş'}</div>
        </div>

        <table><thead><tr><th style="text-align:center">#</th><th>Açıklama</th><th>Kaynak</th><th style="text-align:center">Miktar</th><th style="text-align:center">Birim</th>${yazdirFiyatGoster.value?`<th style="text-align:right">Birim Fiyat</th><th style="text-align:right">Toplam</th>`:''}</tr></thead><tbody>${kalemlerHTML}</tbody></table>
        
        ${yazdirFiyatGoster.value ? `
        <div class="totals-section">
            <div class="total-wrapper">
                <div class="total-row"><span>Ara Toplam:</span><span>${formatParaBirimi(araToplam, pb)}</span></div>
                <div class="total-row"><span>KDV (%20):</span><span>${formatParaBirimi(toplamKDV, pb)}</span></div>
                <div class="total-row final"><span>GENEL TOPLAM:</span><span>${formatParaBirimi(genelToplam, pb)}</span></div>
            </div>
        </div>
        ` : ''}
        
        ${maliyetHTML}

        ${isEmri.value.notlar ? `<div style="margin-top: 30px; background: #f9fafb; padding: 15px; border-left: 4px solid #ddd;"><div style="font-weight: bold; margin-bottom: 5px; font-size: 11px;">NOTLAR:</div><div>${isEmri.value.notlar.replace(/\n/g, '<br>')}</div></div>` : ''}
      </div>
    </body></html>
  `;

  const w = window.open('', '_blank', 'width=900,height=700');
  w.document.write(yazdirIcerik); w.document.close(); w.focus();
  setTimeout(() => { w.print(); yazdirModalGoster.value = false; }, 500); 
};

const handleKalemlerGuncellendi = (yeniListe) => { guncelKalemler.value = yeniListe; };

const getGerekliVeriler = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const [isEmriRes, depolarRes, tedarikcilerRes, anlasmalarRes, satiscilarRes, maliyetRes] = await Promise.all([
      supabase.from('is_emirleri').select(`*, musteriler(*), anlasmalar(*), satiscilar(*), is_emri_kalemleri ( *, anlasmalar(*), depolar:kaynak_depo_id ( ad ), tedarikciler:kaynak_tedarikci_id ( ad ), emanetler(tedarikci_adi_notu) )`).eq('id', isEmriId).single(),
      supabase.from('depolar').select('*'),
      supabase.from('tedarikciler').select('*'),
      supabase.from('anlasmalar').select('*, anlasma_kalemleri(urun_id, taahhut_edilen_miktar)').eq('aktif_mi', true),
      supabase.from('satiscilar').select('id, ad_soyad').eq('aktif_mi', true).order('ad_soyad'),
      supabase.from('is_emri_maliyetleri').select('*').eq('is_emri_id', isEmriId)
    ]);

    if (isEmriRes.error) throw isEmriRes.error;

    isEmri.value = isEmriRes.data;
    
    const dbKalemler = isEmriRes.data.is_emri_kalemleri || [];
    guncelKalemler.value = dbKalemler.map(k => ({
        ...k,
        is_emanet: !!k.emanet_id,
        emanet_tedarikci_notu: k.emanetler ? k.emanetler.tedarikci_adi_notu : ''
    }));
    
    maliyetListesi.value = maliyetRes.data || [];
    depolar.value = depolarRes.data || [];
    tedarikciler.value = tedarikcilerRes.data || [];
    anlasmalar.value = anlasmalarRes.data || [];
    satiscilar.value = satiscilarRes.data || [];

    duzenlemeFormu.value = {
      satisci_id: isEmri.value.satisci_id || null,
      fatura_no: isEmri.value.fatura_no || '',
      is_tamamlandi: isEmri.value.is_tamamlandi || false,
      rezerve_edildi: isEmri.value.rezerve_edildi || false,
      is_emri_tipi: isEmri.value.is_emri_tipi || 'SİPARİŞ',
      sevk_adresi: isEmri.value.sevk_adresi || '',
      para_birimi: isEmri.value.para_birimi || 'TRY',
      kdv_dahil: false 
    };
  } catch (err) { error.value = err.message; } finally { loading.value = false; }
};

const baslaDuzenle = () => { 
  duzenlemeMaliyetListesi.value = maliyetListesi.value.map(m => ({ ...m })); 
  isEditing.value = true; 
};
const maliyetEkle = () => { duzenlemeMaliyetListesi.value.push({ aciklama: '', tutar: 0 }); };
const maliyetSil = (idx) => { duzenlemeMaliyetListesi.value.splice(idx, 1); };

const isEmriIptalEt = async () => {
    if (!confirm('Bu iş emrini iptal etmek istediğinize emin misiniz? İş emri silinmeyecek, durumu "İptal" olarak güncellenecektir.')) return;
    try {
      loading.value = true;
      const { error } = await supabase.from('is_emirleri').update({ durum: 'İptal' }).eq('id', isEmriId);
      if (error) throw error;
      alert('İş emri başarıyla iptal edildi.');
      await getGerekliVeriler();
    } catch (err) {
      alert('İptal işlemi sırasında hata oluştu: ' + err.message);
      loading.value = false;
    }
};

const guncelle = async () => {
  if (!isEmri.value) return;
  await guncelleWithLoading(async () => {
    try {
        // Kalem verilerini atomic RPC için hazırla
        const kalemVerileri = guncelKalemler.value.map(k => ({
            id: k.id || null,
            urun_id: k.urun_id || null,
            aciklama: k.aciklama,
            miktar: parseFloat(k.miktar) || 0,
            birim: k.birim || 'Adet',
            birim_fiyat: parseSayi(k.birim_fiyat),
            kaynak_depo_id: k.is_emanet ? null : (k.kaynak_depo_id || null),
            kaynak_tedarikci_id: k.is_emanet ? null : (k.kaynak_tedarikci_id || null),
            anlasma_id: k.anlasma_id || null,
            is_emanet: !!k.is_emanet,
            emanet_id: k.emanet_id || null,
            emanet_tedarikci_notu: k.emanet_tedarikci_notu || 'Belirtilmedi'
        }));

        // Tek atomic RPC çağrısı - tüm kalem işlemleri (insert/update/delete/emanet) veritabanı transaction'ı içinde
        const { data, error } = await supabase.rpc('is_emri_kalemleri_guncelle_atomic', {
            p_is_emri_id: isEmriId,
            p_kalemler: JSON.stringify(kalemVerileri)
        });

        if (error) throw error;
        if (data && !data.success) throw new Error(data.message);

        // İş emri başlık bilgilerini güncelle
        const yeniToplamMaliyet = duzenlemeMaliyetListesi.value.reduce((s, i) => s + parseSayi(i.tutar), 0);
        const guncellenecekIsEmri = { 
            toplam_tutar: toplamlar.value.genelToplam, 
            satisci_id: duzenlemeFormu.value.satisci_id, 
            fatura_no: duzenlemeFormu.value.fatura_no, 
            maliyet: yeniToplamMaliyet, 
            is_tamamlandi: duzenlemeFormu.value.is_tamamlandi, 
            rezerve_edildi: duzenlemeFormu.value.rezerve_edildi, 
            is_emri_tipi: duzenlemeFormu.value.is_emri_tipi, 
            sevk_adresi: duzenlemeFormu.value.sevk_adresi, 
            para_birimi: duzenlemeFormu.value.para_birimi,
            kdv_dahil: false 
        };
        
        const { error: isEmriError } = await supabase.from('is_emirleri').update(guncellenecekIsEmri).eq('id', isEmriId);
        if (isEmriError) throw new Error("İş emri başlığı güncellenirken hata: " + isEmriError.message);

        // Maliyet kalemlerini güncelle
        await supabase.from('is_emri_maliyetleri').delete().eq('is_emri_id', isEmriId);
        if (duzenlemeMaliyetListesi.value.length > 0) {
            const maliyetlerToInsert = duzenlemeMaliyetListesi.value.filter(m => m.aciklama && parseSayi(m.tutar) > 0).map(m => ({ 
                is_emri_id: isEmriId, 
                aciklama: m.aciklama, 
                tutar: parseSayi(m.tutar) 
            }));
            if (maliyetlerToInsert.length > 0) await supabase.from('is_emri_maliyetleri').insert(maliyetlerToInsert);
        }

        alert('İş emri başarıyla güncellendi!');
        isEditing.value = false;
        await getGerekliVeriler();

    } catch (err) {
        console.error("Kritik Güncelleme Hatası:", err);
        alert("İşlem durduruldu! Hata: " + err.message);
    }
  });
};

const iptalEt = async () => { isEditing.value = false; await getGerekliVeriler(); };

const kapanisModaliniAc = () => { 
  if (!isEmri.value) return; 
  if (isEmri.value.durum !== 'Açık') { 
    alert('Sadece "Açık" durumundaki iş emirleri kapatılabilir.'); 
    return; 
  } 
  if (isEmri.value.rezerve_edildi) { 
    alert('DİKKAT: Bu iş emri stokta REZERVE durumundadır!\n\nİş emrini kapatmak için lütfen "Düzenle" butonuna tıklayarak "Rezerve Et" işaretini KALDIRIN (ürünlerin sevkini gerçekleştirin).'); 
    return; 
  }
  if (!isEmri.value.is_tamamlandi) { 
    alert('İş emrini kapatabilmek için öncelikle "İş Tamamlandı" olarak işaretlenmesi gerekmektedir.'); 
    return; 
  } 
  kapanisModalGoster.value = true; 
};

const kapanisBasarili = async () => { await getGerekliVeriler(); kapanisModalGoster.value = false; };
const notDuzenlemeyeBasla = () => { notIcerigi.value = isEmri.value.notlar || ''; notDuzenleniyor.value = true; };
const notDuzenlemeIptal = () => { notDuzenleniyor.value = false; notIcerigi.value = ''; };
const notuKaydet = async () => { if (!isEmri.value) return; await notKaydetWithLoading(async () => { const { error } = await supabase.from('is_emirleri').update({ notlar: notIcerigi.value || null }).eq('id', isEmriId); if (error) throw error; alert('Not başarıyla kaydedildi!'); notDuzenleniyor.value = false; await getGerekliVeriler(); }); };

onMounted(() => { getGerekliVeriler(); });
</script>
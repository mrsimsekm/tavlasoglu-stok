<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Stok Girişleri</h1>
      <button 
        @click="formModaliniAc()" 
        class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-150 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Yeni Stok Girişi
      </button>
    </div>

    <!-- FİLTRELEME ALANI -->
    <div class="bg-white shadow-md rounded-lg p-4 mb-6 border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ürün Ara</label>
          <div class="relative">
             <input 
              v-model="filtreler.urunArama" 
              type="text" 
              placeholder="Ürün kodu, açıklama..." 
              class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
            <div v-if="loading" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg class="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Depo</label>
          <select v-model="filtreler.depoId" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option :value="null">Tümü</option>
            <option v-for="depo in depolar" :key="depo.id" :value="depo.id">{{ depo.ad }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
          <input v-model="filtreler.baslangicTarihi" type="date" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
          <input v-model="filtreler.bitisTarihi" type="date" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        </div>
      </div>
      <div class="mt-4 flex justify-end space-x-2">
        <button @click="filtreleriTemizle" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded text-sm transition-colors">
          Temizle
        </button>
        <button @click="filtrele" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors">
          Filtrele
        </button>
      </div>
    </div>
    
    <!-- STOK GİRİŞ FİŞLERİ LİSTESİ -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <div class="overflow-x-auto">
        <table class="min-w-full leading-normal table-fixed">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th class="px-4 py-3 w-10 text-center"></th>
              <th class="px-6 py-3 w-48 text-left">Tarih</th>
              <th class="px-6 py-3 w-40 text-left">İşlem ID (Grup)</th>
              <th class="px-6 py-3 text-left">Depo / Anlaşma</th>
              <th class="px-6 py-3 w-24 text-center">Kalem</th>
              <th class="px-6 py-3 w-32 text-right">Top. Miktar</th>
              <th class="px-6 py-3 w-32 text-right">Top. Tutar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <!-- Loading -->
            <tr v-if="loading && gruplar.length === 0">
              <td colspan="7" class="px-6 py-10 text-center text-gray-500">
                <div class="flex flex-col items-center justify-center">
                  <svg class="animate-spin h-8 w-8 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Veriler yükleniyor...</span>
                </div>
              </td>
            </tr>

            <!-- Veri Yok -->
            <tr v-else-if="!loading && gruplar.length === 0">
              <td colspan="7" class="px-6 py-10 text-center text-gray-500 italic">
                Arama kriterlerinize uygun stok girişi bulunamadı.
              </td>
            </tr>

            <!-- Veri Listesi -->
            <template v-else v-for="grup in gruplar" :key="grup.id">
              <tr 
                class="hover:bg-gray-50 transition-colors cursor-pointer group"
                :class="{'bg-indigo-50': acikGruplar.has(grup.id)}"
                @click="toggleGrup(grup.id)"
              >
                <td class="px-4 py-4 text-center">
                  <svg 
                    class="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-transform duration-200" 
                    :class="{'rotate-90 text-indigo-600': acikGruplar.has(grup.id)}" 
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ formatTarih(grup.tarih) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span class="font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200 text-xs">
                    #{{ grup.id ? grup.id.slice(0, 8).toUpperCase() : '-' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                  <div class="flex flex-col">
                    <span class="font-semibold">{{ grup.depo_ad || '-' }}</span>
                    <span v-if="grup.anlasma_ad" class="text-xs text-indigo-600 font-medium mt-0.5">
                      {{ grup.anlasma_ad }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ grup.detaylar ? grup.detaylar.length : '...' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                  {{ grup.toplam_miktar }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-gray-700">
                  {{ formatPara(grup.toplam_tutar) }}
                </td>
              </tr>
              
              <!-- Detay Satırı (Accordion) -->
              <tr v-if="acikGruplar.has(grup.id)" class="bg-gray-50 border-b border-gray-200">
                <td colspan="7" class="p-0">
                  <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 shadow-inner">
                    <table class="min-w-full divide-y divide-gray-200 bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <thead class="bg-gray-100">
                        <tr>
                          <th scope="col" class="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Ürün Kodu</th>
                          <th scope="col" class="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Açıklama</th>
                          <th scope="col" class="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Miktar</th>
                          <th scope="col" class="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Birim Fiyat</th>
                          <th scope="col" class="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-200 bg-white">
                        <tr v-if="!grup.detaylar || grup.detaylar.length === 0">
                           <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">Detaylar yükleniyor...</td>
                        </tr>
                        <tr v-else v-for="detay in grup.detaylar" :key="detay.id" class="hover:bg-gray-50 transition-colors">
                          <td class="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {{ detay.urunler?.urun_kodu }}
                          </td>
                          <td class="px-6 py-2 text-sm text-gray-500">
                            <div>{{ detay.urunler?.aciklama }}</div>
                            <div v-if="detay.aciklama" class="text-xs text-gray-400 italic mt-0.5">{{ detay.aciklama }}</div>
                          </td>
                          <td class="px-6 py-2 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                            {{ detay.miktar }} <span class="text-xs font-normal text-gray-500">{{ detay.urunler?.ana_birim }}</span>
                          </td>
                          <td class="px-6 py-2 whitespace-nowrap text-right text-sm text-gray-500 font-mono">
                            {{ detay.tutar && detay.miktar ? formatPara(detay.tutar / detay.miktar) : '-' }}
                          </td>
                          <td class="px-6 py-2 whitespace-nowrap text-right text-sm font-medium text-gray-900 font-mono">
                            {{ formatPara(detay.tutar) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      
      <!-- Sayfalama (Pagination) -->
      <div class="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              <span class="font-medium">{{ (mevcutSayfa - 1) * sayfaBasinaGrup + 1 }}</span> ile 
              <span class="font-medium">{{ Math.min(mevcutSayfa * sayfaBasinaGrup, toplamGrupSayisi) }}</span> arası gösteriliyor.
              (Toplam <span class="font-medium">{{ toplamGrupSayisi }}</span> işlem)
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button 
                @click="sayfaDegistir(mevcutSayfa - 1)" 
                :disabled="mevcutSayfa === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Önceki</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                Sayfa {{ mevcutSayfa }}
              </span>

              <button 
                @click="sayfaDegistir(mevcutSayfa + 1)"
                :disabled="gruplar.length < sayfaBasinaGrup" 
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Sonraki</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- YENİ STOK GİRİŞİ MODAL'I -->
    <BaseModal :show="formModalGoster" @close="formModalGoster = false" max-width="max-w-5xl">
      <template #header>Yeni Stok Girişi (Toplu)</template>
      <template #body>
         <div class="space-y-4">
            
            <!-- 1. GENEL BİLGİLER -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hangi Depoya Giriş Yapılacak? (*)</label>
                <select v-model="genelBilgiler.depo_id" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white">
                  <option :value="null" disabled>Depo Seçin</option>
                  <option v-for="depo in depolar" :key="depo.id" :value="depo.id">{{ depo.ad }}</option>
                </select>
              </div>
              
              <div>
                <div class="flex items-center mb-1">
                  <input id="anlasmaCheck" type="checkbox" v-model="anlasmaDahilinde" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                  <label for="anlasmaCheck" class="ml-2 block text-sm font-medium text-gray-700">Anlaşma Dahilinde mi?</label>
                </div>
                <select v-model="genelBilgiler.anlasma_id" :disabled="!anlasmaDahilinde" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400 transition-colors">
                  <option :value="null">Anlaşma Seçin</option>
                  <option v-for="anlasma in aktifAnlasmalar" :key="anlasma.id" :value="anlasma.id">
                    {{ anlasma.ad }} ({{ anlasma.tedarikciler?.ad }})
                  </option>
                </select>
              </div>
            </div>

            <!-- 2. KALEM EKLEME / DÜZENLEME ALANI -->
            <div class="border-t border-gray-200 pt-4">
              <div class="flex justify-between items-center mb-2">
                <h3 class="text-sm font-bold text-gray-700">
                  {{ duzenlemeModu ? 'Satırı Düzenle' : 'Listeye Ürün Ekle' }}
                </h3>
                <button v-if="duzenlemeModu" @click="temizleAktifSatir" class="text-xs text-red-600 hover:text-red-800 underline font-medium">
                  Düzenlemeyi İptal Et
                </button>
              </div>

              <div class="flex flex-col md:flex-row gap-3 items-end bg-blue-50 p-4 rounded-lg border border-blue-100 transition-colors duration-300" :class="{'bg-orange-50 border-orange-200': duzenlemeModu}">
                <!-- Ürün Arama -->
                <div class="w-full md:w-4/12 relative">
                  <label class="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">Ürün (*)</label>
                  <input 
                    type="text" 
                    v-model="modalUrunAramaMetni" 
                    @input="urunAraModal" 
                    :placeholder="urunAramaPlaceholder" 
                    class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    :disabled="anlasmaDahilinde && !genelBilgiler.anlasma_id && secilenAnlasmaTipi === 'Ürün Bazlı'"
                    autocomplete="off"
                  />
                  <!-- Arama Sonuçları Dropdown -->
                  <div v-if="modalUrunAramaSonuclari.length > 0" class="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                    <ul class="py-1">
                      <li 
                        v-for="urun in modalUrunAramaSonuclari" 
                        :key="urun.id" 
                        @click="urunSec(urun)" 
                        class="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm border-b last:border-0 border-gray-100 transition-colors"
                      >
                        <span class="font-bold text-gray-800">{{ urun.urun_kodu }}</span> - <span class="text-gray-600">{{ urun.aciklama }}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Miktar -->
                <div class="w-full md:w-2/12">
                  <label class="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">Miktar (*)</label>
                  <input v-model.number="aktifSatir.miktar" type="number" min="1" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right" placeholder="0">
                </div>

                <!-- Tutar -->
                <div class="w-full md:w-2/12">
                  <label class="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">Top. Tutar (TL)</label>
                  <input v-model.number="aktifSatir.tutar" type="number" min="0" step="0.01" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right" placeholder="0.00">
                </div>

                <!-- Açıklama -->
                <div class="w-full md:w-3/12">
                  <label class="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">Açıklama</label>
                  <input v-model="aktifSatir.aciklama" type="text" class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Not...">
                </div>

                <!-- Ekle / Güncelle Butonu -->
                <div class="w-full md:w-1/12">
                  <button 
                    @click="satirIslemi" 
                    class="w-full font-bold py-2 rounded-md shadow-sm h-[38px] flex items-center justify-center transition-all transform active:scale-95"
                    :class="duzenlemeModu ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'"
                  >
                     <span v-if="duzenlemeModu" class="text-sm">OK</span>
                     <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                     </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 3. EKLENEN LİSTE -->
            <div class="border border-gray-200 rounded-lg overflow-hidden flex flex-col mt-4">
               <!-- Başlık -->
               <div class="bg-gray-100 border-b border-gray-200 px-4 py-2 grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div class="col-span-4">Ürün</div>
                  <div class="col-span-2 text-right">Miktar</div>
                  <div class="col-span-2 text-right">Tutar</div>
                  <div class="col-span-3">Açıklama</div>
                  <div class="col-span-1 text-center">İşlem</div>
               </div>
               
               <!-- Scroll Edilebilir İçerik -->
               <div class="overflow-y-auto max-h-[300px] bg-white">
                  <div v-if="girisListesi.length === 0" class="text-center py-10 text-gray-400 text-sm italic">
                    Henüz ürün eklenmedi. Yukarıdan ürün seçip ekleyebilirsiniz.
                  </div>
                  <div 
                    v-else 
                    v-for="(item, index) in girisListesi" 
                    :key="index"
                    class="border-b last:border-0 border-gray-100 hover:bg-gray-50 px-4 py-3 grid grid-cols-12 gap-2 text-sm items-center transition duration-150"
                    :class="{'bg-orange-50': duzenlenenIndex === index}"
                  >
                      <div class="col-span-4 font-medium text-gray-900 truncate" :title="item.urun_adi">{{ item.urun_adi }}</div>
                      <div class="col-span-2 text-right font-bold text-gray-800">{{ item.miktar }}</div>
                      <div class="col-span-2 text-right text-gray-600 font-mono">{{ formatPara(item.tutar) }}</div>
                      <div class="col-span-3 text-gray-500 truncate text-xs" :title="item.aciklama">{{ item.aciklama || '-' }}</div>
                      
                      <!-- İşlemler -->
                      <div class="col-span-1 flex justify-center space-x-2">
                         <button @click="satirDuzenle(index)" class="text-orange-500 hover:text-orange-700 p-1 rounded hover:bg-orange-100 transition-colors" title="Düzenle">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                         </button>
                         <button @click="satirSil(index)" class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100 transition-colors" title="Sil">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                         </button>
                      </div>
                  </div>
               </div>

               <!-- Toplam Footer -->
               <div class="bg-gray-50 border-t border-gray-200 px-4 py-3 grid grid-cols-12 gap-2 text-sm font-bold text-gray-800 shadow-inner">
                  <div class="col-span-4">TOPLAM</div>
                  <div class="col-span-2 text-right">{{ toplamMiktar }}</div>
                  <div class="col-span-2 text-right font-mono">{{ formatPara(toplamTutar) }}</div>
                  <div class="col-span-4"></div>
               </div>
            </div>

         </div>
      </template>
       <template #footer>
        <button 
          @click="formModalGoster = false" 
          class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          İptal
        </button>
        <button 
          @click="topluKaydet" 
          :disabled="kayitYapiliyor || girisListesi.length === 0" 
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {{ kayitYapiliyor ? 'Kaydediliyor...' : 'Tümünü Kaydet' }}
        </button>
      </template>
    </BaseModal>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '../supabase.js';
import { useUserStore } from '../stores/userStore.js';
import BaseModal from '../components/BaseModal.vue';

// --- STATE ---
const userStore = useUserStore();
const loading = ref(false);
const gruplar = ref([]);
const acikGruplar = ref(new Set());

// Sayfalama
const mevcutSayfa = ref(1);
const sayfaBasinaGrup = 10;
const toplamGrupSayisi = ref(0);

// Filtreler
const depolar = ref([]);
const filtreler = ref({ urunArama: '', depoId: null, baslangicTarihi: '', bitisTarihi: '' });
let filtreDebounceTimer;

// Modal & Form
const formModalGoster = ref(false);
const kayitYapiliyor = ref(false);
const aktifAnlasmalar = ref([]);
const anlasmaDahilinde = ref(false);

const genelBilgiler = ref({ depo_id: null, anlasma_id: null });
const aktifSatir = ref({ urun_id: null, urun_adi: '', miktar: '', tutar: '', aciklama: '' });
const girisListesi = ref([]);
const duzenlenenIndex = ref(null);

const modalUrunAramaMetni = ref('');
const modalUrunAramaSonuclari = ref([]);
let modalAramaDebounce;

// --- COMPUTED ---
const duzenlemeModu = computed(() => duzenlenenIndex.value !== null);
const toplamMiktar = computed(() => girisListesi.value.reduce((sum, item) => sum + Number(item.miktar || 0), 0));
const toplamTutar = computed(() => girisListesi.value.reduce((sum, item) => sum + (item.tutar || 0), 0));
const secilenAnlasmaTipi = computed(() => {
  if (!genelBilgiler.value.anlasma_id) return null;
  const anlasma = aktifAnlasmalar.value.find(a => a.id === genelBilgiler.value.anlasma_id);
  return anlasma ? anlasma.tip : null;
});
const urunAramaPlaceholder = computed(() => {
  if (anlasmaDahilinde.value && secilenAnlasmaTipi.value === 'Ürün Bazlı' && !genelBilgiler.value.anlasma_id) {
    return 'Önce anlaşma seçiniz...';
  }
  return 'Ürün kodu veya açıklama...';
});

// --- LIFECYCLE ---
onMounted(async () => {
  const { data: depolarData } = await supabase.from('depolar').select('*');
  depolar.value = depolarData || [];
  await verileriGetir();
});

// --- ARAMA & FİLTRELEME ---
watch(() => filtreler.value.urunArama, () => {
  clearTimeout(filtreDebounceTimer);
  filtreDebounceTimer = setTimeout(() => {
    mevcutSayfa.value = 1;
    verileriGetir();
  }, 500);
});

const filtrele = () => { mevcutSayfa.value = 1; verileriGetir(); };
const filtreleriTemizle = () => { filtreler.value = { urunArama: '', depoId: null, baslangicTarihi: '', bitisTarihi: '' }; mevcutSayfa.value = 1; verileriGetir(); };
const sayfaDegistir = (sayfa) => { if (sayfa < 1) return; mevcutSayfa.value = sayfa; verileriGetir(); };

// --- DATA FETCHING ---
const verileriGetir = async () => {
  loading.value = true;
  acikGruplar.value.clear();
  gruplar.value = [];
  try {
    const offset = (mevcutSayfa.value - 1) * sayfaBasinaGrup;
    const { data: grupData, error: rpcError } = await supabase.rpc('get_stok_giris_gruplari_v2', {
      p_limit: sayfaBasinaGrup, p_offset: offset, p_arama_metni: filtreler.value.urunArama || null,
      p_depo_id: filtreler.value.depoId || null, p_baslangic_tarihi: filtreler.value.baslangicTarihi || null,
      p_bitis_tarihi: filtreler.value.bitisTarihi || null
    });
    if (rpcError) throw rpcError;
    if (!grupData || grupData.length === 0) { gruplar.value = []; return; }
    toplamGrupSayisi.value = grupData.length < sayfaBasinaGrup ? (mevcutSayfa.value - 1) * sayfaBasinaGrup + grupData.length : (mevcutSayfa.value * sayfaBasinaGrup) + 1;
    const grupIdleri = grupData.map(g => g.grup_id);
    const { data: detaylar, error: detayError } = await supabase.from('stok_hareketleri').select(`*, urunler (urun_kodu, aciklama, ana_birim), depolar (ad), anlasmalar (ad, tedarikciler(ad))`).in('grup_id', grupIdleri).eq('hareket_tipi', 'giris');
    if (detayError) throw detayError;
    const gruplanmis = grupData.map(g => {
      const buGrubunDetaylari = detaylar.filter(d => d.grup_id === g.grup_id);
      const toplamMiktar = buGrubunDetaylari.reduce((acc, curr) => acc + curr.miktar, 0);
      const toplamTutar = buGrubunDetaylari.reduce((acc, curr) => acc + (curr.tutar || 0), 0);
      const ilkDetay = buGrubunDetaylari[0] || {};
      return { id: g.grup_id, tarih: g.islem_tarihi, depo_ad: ilkDetay.depolar?.ad || '-', anlasma_ad: ilkDetay.anlasmalar?.ad || null, toplam_miktar: toplamMiktar, toplam_tutar: toplamTutar, detaylar: buGrubunDetaylari };
    });
    gruplar.value = gruplanmis;
  } catch (error) { console.error('Veri çekme hatası:', error); alert('Veriler yüklenirken hata oluştu: ' + error.message);
  } finally { loading.value = false; }
};

// --- MODAL İŞLEMLERİ ---
const formModaliniAc = async () => {
  genelBilgiler.value = { depo_id: null, anlasma_id: null };
  girisListesi.value = [];
  temizleAktifSatir();
  anlasmaDahilinde.value = false;
  const { data } = await supabase.from('anlasmalar').select('*, tedarikciler(ad), anlasma_kalemleri(urun_id)').eq('aktif_mi', true);
  aktifAnlasmalar.value = data || [];
  formModalGoster.value = true;
};

const temizleAktifSatir = () => {
  aktifSatir.value = { urun_id: null, urun_adi: '', miktar: '', tutar: '', aciklama: '' };
  modalUrunAramaMetni.value = '';
  modalUrunAramaSonuclari.value = [];
  duzenlenenIndex.value = null;
};

// !!! DÜZELTİLMİŞ FONKSİYON !!!
const urunAraModal = () => {
  aktifSatir.value.urun_id = null;
  clearTimeout(modalAramaDebounce);
  
  modalAramaDebounce = setTimeout(async () => {
    const aramaMetni = modalUrunAramaMetni.value.trim();
    if (aramaMetni.length < 2) {
      modalUrunAramaSonuclari.value = [];
      return;
    }
    
    let filterIds = null;
    if (anlasmaDahilinde.value && genelBilgiler.value.anlasma_id) {
      const secilenAnlasma = aktifAnlasmalar.value.find(a => a.id === genelBilgiler.value.anlasma_id);
      if (secilenAnlasma && secilenAnlasma.tip === 'Ürün Bazlı' && secilenAnlasma.anlasma_kalemleri) {
        filterIds = secilenAnlasma.anlasma_kalemleri.map(k => k.urun_id);
        if (filterIds.length === 0) {
          modalUrunAramaSonuclari.value = [];
          return;
        }
      }
    }
    
    try {
      const { data, error } = await supabase.rpc('urun_ara', {
        arama_metni: aramaMetni,
        filtre_ids: filterIds,
        limit_val: 15
      });
      if (error) throw error;
      modalUrunAramaSonuclari.value = data || [];
    } catch (err) {
      console.error("Modal ürün arama hatası:", err);
      modalUrunAramaSonuclari.value = [];
    }
  }, 300);
};

const urunSec = (urun) => {
  aktifSatir.value.urun_id = urun.id;
  aktifSatir.value.urun_adi = `${urun.urun_kodu} - ${urun.aciklama}`;
  modalUrunAramaMetni.value = aktifSatir.value.urun_adi;
  modalUrunAramaSonuclari.value = [];
};

const satirIslemi = () => {
  if (!aktifSatir.value.urun_id) { alert("Lütfen bir ürün seçin."); return; }
  if (!aktifSatir.value.miktar || aktifSatir.value.miktar <= 0) { alert("Geçerli bir miktar girin."); return; }
  if (duzenlemeModu.value) { girisListesi.value[duzenlenenIndex.value] = { ...aktifSatir.value }; } 
  else { girisListesi.value.unshift({ ...aktifSatir.value }); }
  temizleAktifSatir();
};

const satirDuzenle = (index) => { const item = girisListesi.value[index]; aktifSatir.value = { ...item }; modalUrunAramaMetni.value = item.urun_adi; duzenlenenIndex.value = index; };
const satirSil = (index) => { if (duzenlenenIndex.value === index) temizleAktifSatir(); girisListesi.value.splice(index, 1); };

const topluKaydet = async () => {
  if (!genelBilgiler.value.depo_id) { alert('Lütfen bir depo seçin.'); return; }
  if (anlasmaDahilinde.value && !genelBilgiler.value.anlasma_id) { alert('Lütfen bir anlaşma seçin.'); return; }
  if (girisListesi.value.length === 0) { alert('Listeye en az bir ürün eklemelisiniz.'); return; }
  try {
    kayitYapiliyor.value = true;
    const grupId = self.crypto.randomUUID(); 
    const islemZamani = new Date().toISOString(); 
    for (const satir of girisListesi.value) {
      const { error: hareketError } = await supabase.from('stok_hareketleri').insert([{
          urun_id: satir.urun_id, depo_id: genelBilgiler.value.depo_id, hareket_tipi: 'giris', miktar: satir.miktar,
          aciklama: satir.aciklama || null, kullanici_id: userStore.user?.id || null, anlasma_id: anlasmaDahilinde.value ? genelBilgiler.value.anlasma_id : null,
          tutar: satir.tutar || 0, olusturulma_tarihi: islemZamani, grup_id: grupId 
      }]);
      if (hareketError) throw hareketError;
      const { data: mevcutStok } = await supabase.from('stok_seviyeleri').select('*').eq('urun_id', satir.urun_id).eq('depo_id', genelBilgiler.value.depo_id).single();
      if (mevcutStok) { await supabase.from('stok_seviyeleri').update({ miktar: mevcutStok.miktar + satir.miktar }).eq('id', mevcutStok.id); } 
      else { await supabase.from('stok_seviyeleri').insert([{ urun_id: satir.urun_id, depo_id: genelBilgiler.value.depo_id, miktar: satir.miktar }]); }
      const { data: urun } = await supabase.from('urunler').select('fiili_stok').eq('id', satir.urun_id).single();
      if (urun) { await supabase.from('urunler').update({ fiili_stok: (urun.fiili_stok || 0) + satir.miktar }).eq('id', satir.urun_id); }
    }
    alert('Stok girişi başarıyla kaydedildi!');
    formModalGoster.value = false;
    mevcutSayfa.value = 1;
    await verileriGetir(); 
  } catch (err) { console.error("Stok girişi hatası:", err); alert('Hata: ' + err.message);
  } finally { kayitYapiliyor.value = false; }
};

const toggleGrup = (grupId) => { if (acikGruplar.value.has(grupId)) { acikGruplar.value.delete(grupId); } else { acikGruplar.value.add(grupId); } };
const formatTarih = (tarih) => { if (!tarih) return '-'; return new Date(tarih).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
const formatPara = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0);

watch(anlasmaDahilinde, (val) => { if (!val) genelBilgiler.value.anlasma_id = null; temizleAktifSatir(); });
watch(() => genelBilgiler.value.anlasma_id, () => { temizleAktifSatir(); });
</script>
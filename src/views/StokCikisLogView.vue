<template>
  <div class="container mx-auto px-4 py-6">
    <!-- BAŞLIK -->
    <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Stok Çıkış Günlüğü</h1>
        <p class="text-gray-500 text-sm mt-1">Depolardan çıkan (veya rezerve dışı sevk edilen) ürünlerin detaylı geçmişi.</p>
      </div>
      
      <!-- FİLTRELER -->
      <div class="flex flex-wrap gap-2 items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <!-- Tarih Filtresi -->
        <input type="date" v-model="baslangicTarihi" class="form-input text-xs w-32 font-medium text-gray-700">
        <span class="text-gray-400 font-bold">-</span>
        <input type="date" v-model="bitisTarihi" class="form-input text-xs w-32 font-medium text-gray-700">
        
        <!-- Hareket Tipi -->
        <select v-model="filtreTip" class="form-select text-xs w-48 font-medium text-gray-700">
           <option value="hepsi">Tüm Çıkışlar</option>
           <option value="cikis">İş Emri / Normal Çıkış</option>
           <option value="emanet_iade">Emanet İade</option>
           <option value="transfer">Transfer Çıkış</option>
           <option value="duzeltme">Manuel Düzeltme (Eksi)</option>
        </select>

        <button @click="veriYukle" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-bold shadow-sm transition flex items-center">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
           Filtrele
        </button>
      </div>
    </div>

    <!-- TABLO -->
    <div v-if="yukleniyor" class="py-12 flex justify-center">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
          <span class="text-gray-500 font-medium">Hareketler yükleniyor...</span>
        </div>
    </div>

    <div v-else class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
       <div class="overflow-x-auto">
         <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
               <tr>
                  <th class="th-style">Tarih</th>
                  <th class="th-style">Ürün Kodu & Açıklama</th>
                  <th class="th-style">Çıkış Deposu</th>
                  <th class="th-style">Tip / İlgili İşlem</th>
                  <th class="th-style text-center">Çıkan Miktar</th>
                  <th class="th-style">Açıklama / Not</th>
               </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
               <tr v-if="hareketler.length === 0">
                  <td colspan="6" class="px-6 py-12 text-center text-gray-500 italic">
                     Bu tarih aralığında ve filtrede stok çıkış kaydı bulunamadı.
                  </td>
               </tr>
               <tr v-for="h in hareketler" :key="h.id" class="hover:bg-gray-50 transition-colors text-sm group">
                  
                  <!-- 1. Tarih -->
                  <td class="px-4 py-3 whitespace-nowrap">
                     <div class="font-semibold text-gray-800">{{ formatDate(h.olusturulma_tarihi) }}</div>
                     <div class="text-xs text-gray-500">{{ formatTime(h.olusturulma_tarihi) }}</div>
                  </td>

                  <!-- 2. Ürün -->
                  <td class="px-4 py-3">
                     <div class="font-bold text-indigo-700">{{ h.urunler?.urun_kodu || 'Bilinmeyen Kod' }}</div>
                     <div class="text-xs text-gray-600 truncate max-w-[250px]" :title="h.urunler?.aciklama">{{ h.urunler?.aciklama || '-' }}</div>
                  </td>

                  <!-- 3. Depo -->
                  <td class="px-4 py-3 whitespace-nowrap text-gray-700 font-bold">
                     {{ h.depolar?.ad || 'Depo Silinmiş/Tanımsız' }}
                  </td>

                  <!-- 4. Tip / İş Emri -->
                  <td class="px-4 py-3 whitespace-nowrap">
                     <span 
                       class="px-2 py-0.5 inline-flex text-[10px] leading-5 font-bold uppercase tracking-wider rounded border mb-1"
                       :class="badgeRenk(h.hareket_tipi)"
                     >
                        {{ tipEtiketi(h.hareket_tipi) }}
                     </span>
                     
                     <!-- Eğer iş emri bağı varsa -->
                     <div v-if="h.is_emirleri" class="mt-1 flex flex-col">
                        <router-link :to="`/app/is-emirleri/${h.is_emri_id}`" class="text-indigo-600 hover:text-indigo-800 hover:underline text-xs font-bold flex items-center transition-colors">
                           #{{ h.is_emirleri.numara }}
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </router-link>
                        <span class="text-[10px] text-gray-500 font-medium truncate max-w-[150px] mt-0.5" :title="h.is_emirleri.musteriler?.unvan">
                           Müş: {{ h.is_emirleri.musteriler?.unvan || 'Kayıtsız' }}
                        </span>
                     </div>
                     <div v-else class="text-xs text-gray-400 italic mt-1">Bağımsız İşlem</div>
                  </td>

                  <!-- 5. Miktar -->
                  <td class="px-4 py-3 whitespace-nowrap text-center">
                     <span class="text-red-600 font-bold font-mono text-base px-2 py-1 bg-red-50 rounded">
                        -{{ h.miktar }}
                     </span>
                     <span class="text-[10px] font-bold text-gray-500 ml-1 uppercase">{{ h.urunler?.ana_birim || 'ADET' }}</span>
                  </td>

                  <!-- 6. Açıklama / Kullanıcı -->
                  <td class="px-4 py-3 text-gray-600 text-xs">
                     <div class="max-w-[200px] break-words whitespace-pre-wrap font-medium" :title="h.aciklama">
                       {{ h.aciklama || 'Açıklama girilmemiş.' }}
                     </div>
                  </td>
               </tr>
            </tbody>
         </table>
       </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase';

const hareketler = ref([]);
const yukleniyor = ref(true);

// Tarih Hesaplama (Bu ayın başı ve sonu)
const bugun = new Date();
const ayBasi = new Date(bugun.getFullYear(), bugun.getMonth(), 1);
const aySonu = new Date(bugun.getFullYear(), bugun.getMonth() + 1, 0);

const baslangicTarihi = ref(ayBasi.toISOString().slice(0, 10));
const bitisTarihi = ref(aySonu.toISOString().slice(0, 10));
const filtreTip = ref('hepsi');

const veriYukle = async () => {
   yukleniyor.value = true;
   try {
      // YENİ VE GÜVENLİ SORGULAMA: inner join risklerini kaldırdık.
      let query = supabase
         .from('stok_hareketleri')
         .select(`
            id, urun_id, depo_id, hareket_tipi, miktar, is_emri_id, aciklama, olusturulma_tarihi,
            urunler (urun_kodu, aciklama, ana_birim),
            depolar (ad),
            is_emirleri (numara, musteriler(unvan))
         `)
         .gte('olusturulma_tarihi', baslangicTarihi.value + 'T00:00:00')
         .lte('olusturulma_tarihi', bitisTarihi.value + 'T23:59:59')
         .order('olusturulma_tarihi', { ascending: false });

      // Filtreleme Mantığı
      if (filtreTip.value === 'hepsi') {
         // Çıkış temsil eden tüm hareket tipleri
         query = query.in('hareket_tipi', ['cikis', 'transfer', 'emanet_iade', 'duzeltme']); 
      } else {
         query = query.eq('hareket_tipi', filtreTip.value);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Sadece çıkışları/eksileri mantıklı göstermek adına miktar kontrolü yapılabilir, 
      // ancak çıkış/sevk tabloda pozitif yazılır ama 'cikis' etiketlidir. 
      hareketler.value = data || [];

   } catch (err) {
      console.error('Veri çekme hatası:', err);
      alert('Stok çıkışları yüklenirken hata oluştu!');
   } finally {
      yukleniyor.value = false;
   }
};

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('tr-TR');
const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

const badgeRenk = (tip) => {
   switch (tip) {
      case 'cikis': return 'bg-red-50 text-red-700 border-red-200';
      case 'emanet_iade': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'transfer': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'duzeltme': return 'bg-gray-50 text-gray-700 border-gray-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
   }
};

const tipEtiketi = (tip) => {
   switch (tip) {
      case 'cikis': return 'Sevk / Çıkış';
      case 'emanet_iade': return 'Emanet İade';
      case 'transfer': return 'Transfer';
      case 'duzeltme': return 'Düzeltme';
      default: return tip;
   }
};

onMounted(() => {
   veriYukle();
});
</script>

<style scoped>
.form-input { @apply border border-gray-300 rounded shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
.form-select { @apply border border-gray-300 rounded shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
.th-style { @apply px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200; }
</style>
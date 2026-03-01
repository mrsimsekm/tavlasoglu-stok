<template>
  <div>
    <!-- BAŞLIK -->
    <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Stok Çıkış Günlüğü</h1>
        <p class="text-gray-500 text-sm mt-1">Depolardan çıkan ürünlerin detaylı geçmişi.</p>
      </div>
      
      <!-- FİLTRELER -->
      <div class="flex flex-wrap gap-2 items-center">
        <!-- Tarih Filtresi -->
        <input type="date" v-model="baslangicTarihi" class="form-input text-xs w-32">
        <span class="text-gray-400">-</span>
        <input type="date" v-model="bitisTarihi" class="form-input text-xs w-32">
        
        <!-- Hareket Tipi -->
        <select v-model="filtreTip" class="form-select text-xs w-40">
           <option value="hepsi">Tüm Çıkışlar</option>
           <option value="cikis">İş Emri / Normal Çıkış</option>
           <option value="emanet_iade">Emanet İade</option>
           <option value="transfer">Transfer Çıkış</option>
           <option value="duzeltme">Manuel Düzeltme (Eksi)</option>
        </select>

        <button @click="veriYukle" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-bold transition">
           Filtrele
        </button>
      </div>
    </div>

    <!-- TABLO -->
    <div v-if="yukleniyor" class="py-12 flex justify-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
       <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
             <tr>
                <th class="th-style">Tarih</th>
                <th class="th-style">Ürün</th>
                <th class="th-style">Depo</th>
                <th class="th-style">Tip / İş Emri</th>
                <th class="th-style text-center">Miktar</th>
                <th class="th-style">Açıklama / Kullanıcı</th>
             </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
             <tr v-if="hareketler.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-400 italic">
                   Bu tarih aralığında stok çıkış kaydı bulunamadı.
                </td>
             </tr>
             <tr v-for="h in hareketler" :key="h.id" class="hover:bg-gray-50 transition-colors text-sm">
                
                <!-- 1. Tarih -->
                <td class="px-4 py-3 whitespace-nowrap text-gray-600">
                   <div>{{ formatDate(h.olusturulma_tarihi) }}</div>
                   <div class="text-xs text-gray-400">{{ formatTime(h.olusturulma_tarihi) }}</div>
                </td>

                <!-- 2. Ürün -->
                <td class="px-4 py-3">
                   <div class="font-bold text-gray-900">{{ h.urunler?.urun_kodu }}</div>
                   <div class="text-xs text-gray-500 truncate max-w-xs">{{ h.urunler?.aciklama }}</div>
                </td>

                <!-- 3. Depo -->
                <td class="px-4 py-3 whitespace-nowrap text-gray-700 font-medium">
                   {{ h.depolar?.ad }}
                </td>

                <!-- 4. Tip / İş Emri -->
                <td class="px-4 py-3 whitespace-nowrap">
                   <span 
                     class="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full mb-1"
                     :class="badgeRenk(h.hareket_tipi)"
                   >
                      {{ tipEtiketi(h.hareket_tipi) }}
                   </span>
                   
                   <div v-if="h.is_emirleri" class="mt-1">
                      <router-link :to="`/app/is-emirleri/${h.is_emri_id}`" class="text-indigo-600 hover:underline text-xs font-bold">
                         #{{ h.is_emirleri.numara }}
                      </router-link>
                      <span class="text-[10px] text-gray-400 ml-1">({{ h.is_emirleri.musteriler?.unvan || 'Müşteri Yok' }})</span>
                   </div>
                </td>

                <!-- 5. Miktar -->
                <td class="px-4 py-3 whitespace-nowrap text-center">
                   <span class="text-red-600 font-bold font-mono text-base">
                      -{{ h.miktar }}
                   </span>
                   <span class="text-xs text-gray-500 ml-1">{{ h.urunler?.ana_birim || 'Adet' }}</span>
                </td>

                <!-- 6. Açıklama / Kullanıcı -->
                <td class="px-4 py-3 text-gray-600 text-xs">
                   <div class="max-w-xs break-words" :title="h.aciklama">{{ h.aciklama || '-' }}</div>
                   <!-- Eğer kullanıcı tablosu (profiller) bağlıysa buraya eklenir, şimdilik ID veya boş -->
                   <!-- <div class="mt-1 text-gray-400 italic">İşlem: {{ h.kullanici_id }}</div> -->
                </td>
             </tr>
          </tbody>
       </table>
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
      let query = supabase
         .from('stok_hareketleri')
         .select(`
            *,
            urunler (urun_kodu, aciklama, ana_birim),
            depolar (ad),
            is_emirleri (numara, musteriler(unvan))
         `)
         .gte('olusturulma_tarihi', baslangicTarihi.value + 'T00:00:00')
         .lte('olusturulma_tarihi', bitisTarihi.value + 'T23:59:59')
         .order('olusturulma_tarihi', { ascending: false });

      // Filtreleme Mantığı
      if (filtreTip.value === 'hepsi') {
         // Sadece çıkış tiplerini al (girişleri ele)
         query = query.in('hareket_tipi', ['cikis', 'transfer', 'emanet_iade', 'duzeltme']); 
         // Not: Düzeltme hem + hem - olabilir, miktar kontrolü gerekebilir ama genelde çıkış logunda eksiye bakılır
      } else {
         query = query.eq('hareket_tipi', filtreTip.value);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Sadece MİKTAR > 0 olanları al (Negatif girilmişse pozitife çevirip gösteriyoruz ama çıkış tablosunda pozitif saklanır genelde)
      // Eğer düzeltme işlemiyle eksi girildiyse burada süzebiliriz.
      // Bizim yapıda çıkışlar pozitif saklanıp tipi 'cikis' oluyor.
      hareketler.value = data || [];

   } catch (err) {
      console.error('Veri çekme hatası:', err);
   } finally {
      yukleniyor.value = false;
   }
};

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('tr-TR');
const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

const badgeRenk = (tip) => {
   switch (tip) {
      case 'cikis': return 'bg-red-100 text-red-800';
      case 'emanet_iade': return 'bg-orange-100 text-orange-800';
      case 'transfer': return 'bg-blue-100 text-blue-800';
      case 'duzeltme': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
   }
};

const tipEtiketi = (tip) => {
   switch (tip) {
      case 'cikis': return 'Normal Çıkış';
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
.form-input { @apply border border-gray-300 rounded shadow-sm py-1.5 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
.form-select { @apply border border-gray-300 rounded shadow-sm py-1.5 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500; }
.th-style { @apply px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200; }
</style>
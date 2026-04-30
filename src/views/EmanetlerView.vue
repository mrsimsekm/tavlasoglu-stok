<template>
  <div>
    <!-- BAŞLIK VE ÖZET -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Emanet Yönetimi (Stok Borçları)</h1>
        <p class="text-gray-500 text-sm mt-1">Dış kaynaklardan ödünç alınan ürünlerin takibi ve iade işlemleri.</p>
      </div>
      
      <!-- Özet Kartları -->
      <div class="flex gap-4 w-full md:w-auto">
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-3 flex-1 md:w-40 text-center">
            <div class="text-xs text-orange-600 font-bold uppercase">Açık Kayıt</div>
            <div class="text-2xl font-bold text-orange-800">{{ acikKayitSayisi }}</div>
        </div>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 flex-1 md:w-40 text-center">
            <div class="text-xs text-blue-600 font-bold uppercase">Toplam Borç Miktar</div>
            <div class="text-2xl font-bold text-blue-800">{{ toplamBorcMiktar }}</div>
        </div>
      </div>
    </div>

    <!-- FİLTRELEME VE ARAMA -->
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
       <div class="flex-grow w-full md:w-auto relative">
         <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" /></svg>
         </span>
         <input v-model="aramaMetni" type="text" placeholder="Kişi/Firma adı veya ürün ara..." class="pl-10 form-input w-full" />
       </div>
       
       <div class="flex items-center space-x-2 w-full md:w-auto">
          <label class="text-sm font-medium text-gray-700 whitespace-nowrap">Durum:</label>
          <select v-model="filtreDurum" class="form-select text-sm border-gray-300 rounded-md">
             <option value="Tümü">Tümü</option>
             <option value="Açık">Açık / Kısmi</option>
             <option value="Kapandı">Kapandı (Ödendi)</option>
          </select>
       </div>
    </div>

    <!-- YÜKLENİYOR DURUMU -->
    <div v-if="yukleniyor" class="py-12 flex justify-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
    </div>

    <!-- LİSTE -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
       <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
             <tr>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kişi / Firma (Not)</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ürün</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">İş Emri</th>
                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Alınan</th>
                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Kalan Borç</th>
                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Durum</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">İşlem</th>
             </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
             <tr v-if="filtrelenmisEmanetler.length === 0">
                <td colspan="7" class="px-6 py-8 text-center text-gray-400 italic">Kayıt bulunamadı.</td>
             </tr>
             <tr v-for="emanet in filtrelenmisEmanetler" :key="emanet.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                   <div class="text-sm font-bold text-gray-900">{{ emanet.tedarikci_adi_notu }}</div>
                   <div class="text-xs text-gray-500">{{ formatDate(emanet.olusturulma_tarihi) }}</div>
                </td>
                <td class="px-6 py-4">
                   <div class="text-sm text-gray-900 font-medium">{{ emanet.urunler?.urun_kodu }}</div>
                   <div class="text-xs text-gray-500 truncate max-w-xs" :title="emanet.urunler?.aciklama">{{ emanet.urunler?.aciklama }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                   <router-link v-if="emanet.is_emirleri" :to="`/app/is-emirleri/${emanet.is_emri_id}`" class="text-indigo-600 hover:text-indigo-900 font-medium underline">
                      #{{ emanet.is_emirleri.numara }}
                   </router-link>
                   <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-mono font-bold text-gray-700">
                   {{ emanet.miktar }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                   <span class="text-sm font-bold font-mono px-2 py-1 rounded" :class="emanet.kalan_miktar > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'">
                      {{ emanet.kalan_miktar }}
                   </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                   <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                     :class="{
                        'bg-red-100 text-red-800': emanet.durum === 'Bekliyor',
                        'bg-yellow-100 text-yellow-800': emanet.durum === 'Kısmi İade',
                        'bg-green-100 text-green-800': emanet.durum === 'Kapandı'
                     }">
                      {{ emanet.durum }}
                   </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                   <button 
                     v-if="emanet.kalan_miktar > 0"
                     @click="iadeModaliniAc(emanet)"
                     class="text-orange-600 hover:text-orange-900 font-bold border border-orange-200 hover:bg-orange-50 px-3 py-1 rounded transition-colors"
                   >
                     İade Et
                   </button>
                   <span v-else class="text-green-600 font-bold text-xs flex items-center justify-end">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                      Ödendi
                   </span>
                </td>
             </tr>
          </tbody>
       </table>
    </div>

    <!-- İADE MODALI (INLINE - SAYFA İÇİ) -->
    <div v-if="iadeModalAcik && secilenEmanet" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
       <div class="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
          
          <!-- Modal Header -->
          <div class="flex justify-between items-center pb-3 border-b mb-4">
             <h3 class="text-lg leading-6 font-medium text-gray-900">Emanet İade Et (Stok Çıkışı)</h3>
             <button @click="iadeModaliniKapat" class="text-gray-400 hover:text-gray-500">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>
          </div>

          <!-- Modal Body -->
          <div class="space-y-4">
             <div class="bg-orange-50 p-3 rounded text-sm text-orange-800 mb-4">
                <strong>{{ secilenEmanet.tedarikci_adi_notu }}</strong> kişisine/firmasına ait 
                <strong>{{ secilenEmanet.urunler?.urun_kodu }}</strong> ürününden 
                <strong class="text-red-600">{{ secilenEmanet.kalan_miktar }} Adet</strong> borcunuz bulunmaktadır.
             </div>

             <!-- Depo Seçimi -->
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hangi Depodan İade Edilecek?</label>
                <select v-model="iadeForm.depo_id" @change="stokKontrolEt" class="form-input w-full">
                   <option :value="null">Depo Seçiniz</option>
                   <option v-for="depo in depolar" :key="depo.id" :value="depo.id">{{ depo.ad }}</option>
                </select>
                <div v-if="iadeForm.depo_id" class="mt-1 text-xs">
                   Mevcut Stok: 
                   <span class="font-bold" :class="mevcutStok >= iadeForm.miktar ? 'text-green-600' : 'text-red-600'">
                      {{ mevcutStok }}
                   </span>
                </div>
             </div>

             <!-- Miktar -->
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">İade Edilecek Miktar</label>
                <input 
                  v-model.number="iadeForm.miktar" 
                  type="number" 
                  min="1" 
                  :max="secilenEmanet.kalan_miktar"
                  class="form-input w-full font-bold text-lg" 
                />
                <p class="text-xs text-gray-500 mt-1">En fazla {{ secilenEmanet.kalan_miktar }} adet iade edebilirsiniz.</p>
             </div>

             <!-- Açıklama -->
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Açıklama / Not</label>
                <textarea v-model="iadeForm.aciklama" rows="2" class="form-input w-full" placeholder="İade notu (Opsiyonel)"></textarea>
             </div>

             <!-- Butonlar -->
             <div class="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button @click="iadeModaliniKapat" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 text-sm font-medium">İptal</button>
                <button 
                  @click="iadeyiOnayla" 
                  :disabled="iadeLoading || !iadeForm.depo_id || iadeForm.miktar <= 0 || iadeForm.miktar > secilenEmanet.kalan_miktar || iadeForm.miktar > mevcutStok"
                  class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                   <span v-if="iadeLoading" class="mr-2 animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                   {{ iadeLoading ? 'İşleniyor...' : 'İade Et ve Stoktan Düş' }}
                </button>
             </div>
          </div>
       </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase';

const emanetler = ref([]);
const depolar = ref([]);
const yukleniyor = ref(true);
const aramaMetni = ref('');
const filtreDurum = ref('Açık'); // Varsayılan sadece açıklar

// Modal State
const iadeModalAcik = ref(false);
const secilenEmanet = ref(null);
const iadeLoading = ref(false);
const mevcutStok = ref(0);
const iadeForm = ref({
   depo_id: null,
   miktar: 0,
   aciklama: ''
});

// İstatistikler
const acikKayitSayisi = computed(() => emanetler.value.filter(e => e.kalan_miktar > 0).length);
const toplamBorcMiktar = computed(() => emanetler.value.reduce((acc, e) => acc + (parseFloat(e.kalan_miktar) || 0), 0));

// Filtreleme
const filtrelenmisEmanetler = computed(() => {
   return emanetler.value.filter(e => {
      // 1. Durum Filtresi
      let durumUygun = true;
      if (filtreDurum.value === 'Açık') durumUygun = e.kalan_miktar > 0;
      else if (filtreDurum.value === 'Kapandı') durumUygun = e.kalan_miktar <= 0;
      
      // 2. Arama Filtresi
      const metin = aramaMetni.value.toLowerCase();
      const aramaUygun = 
         e.tedarikci_adi_notu?.toLowerCase().includes(metin) ||
         e.urunler?.urun_kodu?.toLowerCase().includes(metin) ||
         e.urunler?.aciklama?.toLowerCase().includes(metin);

      return durumUygun && aramaUygun;
   });
});

const veriYukle = async () => {
   yukleniyor.value = true;
   try {
      const { data, error } = await supabase
         .from('emanetler')
         .select(`
            *,
            urunler (id, urun_kodu, aciklama),
            is_emirleri (id, numara)
         `)
         .order('olusturulma_tarihi', { ascending: false });
      
      if (error) throw error;
      emanetler.value = data || [];

      // Depoları da çek (Modal için)
      const { data: depoData } = await supabase.from('depolar').select('id, ad');
      depolar.value = depoData || [];

   } catch (err) {
      console.error('Veri çekme hatası:', err);
   } finally {
      yukleniyor.value = false;
   }
};

onMounted(() => {
   veriYukle();
});

const formatDate = (dateStr) => {
   if (!dateStr) return '-';
   return new Date(dateStr).toLocaleDateString('tr-TR');
};

// --- İADE SÜRECİ ---

const iadeModaliniAc = (emanet) => {
   secilenEmanet.value = emanet;
   iadeForm.value = {
      depo_id: null,
      miktar: emanet.kalan_miktar, // Varsayılan hepsi
      aciklama: ''
   };
   mevcutStok.value = 0;
   iadeModalAcik.value = true;
};

const iadeModaliniKapat = () => {
   iadeModalAcik.value = false;
   secilenEmanet.value = null;
};

const stokKontrolEt = async () => {
   if (!iadeForm.value.depo_id || !secilenEmanet.value) return;
   
   const { data, error } = await supabase
      .from('stok_seviyeleri')
      .select('miktar, rezerve_miktar')
      .eq('urun_id', secilenEmanet.value.urun_id)
      .eq('depo_id', iadeForm.value.depo_id)
      .single();
   
   if (data) {
      mevcutStok.value = (data.miktar || 0) - (data.rezerve_miktar || 0);
   } else {
      mevcutStok.value = 0;
   }
};

const iadeyiOnayla = async () => {
   if (!secilenEmanet.value) return;
   iadeLoading.value = true;

   try {
      const iadeMiktari = parseFloat(iadeForm.value.miktar);
      const yeniKalan = parseFloat(secilenEmanet.value.kalan_miktar) - iadeMiktari;
      const yeniDurum = yeniKalan <= 0 ? 'Kapandı' : 'Kısmi İade';

      // 1. Stok Hareketi Oluştur (Çıkış)
      const { error: stokHata } = await supabase.from('stok_hareketleri').insert({
         urun_id: secilenEmanet.value.urun_id,
         depo_id: iadeForm.value.depo_id,
         hareket_tipi: 'cikis', // ENUM güncellemesi yaptıysan 'emanet_iade' yapabilirsin
         miktar: iadeMiktari,
         aciklama: `Emanet İadesi: ${secilenEmanet.value.tedarikci_adi_notu} - ${iadeForm.value.aciklama}`,
         onceki_miktar: 0, // Trigger halledecek
         sonraki_miktar: 0 // Trigger halledecek
      });

      if (stokHata) throw stokHata;

      // 2. Emanet Kaydını Güncelle
      const { error: emanetHata } = await supabase
         .from('emanetler')
         .update({
            kalan_miktar: yeniKalan,
            durum: yeniDurum
         })
         .eq('id', secilenEmanet.value.id);

      if (emanetHata) throw emanetHata;

      // Başarılı
      alert('İade işlemi başarıyla gerçekleştirildi.');
      iadeModaliniKapat();
      veriYukle(); // Listeyi yenile

   } catch (err) {
      console.error('İade hatası:', err);
      alert('İşlem sırasında bir hata oluştu: ' + err.message);
   } finally {
      iadeLoading.value = false;
   }
};
</script>

<style scoped>
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm; }
.form-select { @apply block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md; }
</style>
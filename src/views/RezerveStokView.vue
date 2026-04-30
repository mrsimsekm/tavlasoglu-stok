<template>
  <div class="container mx-auto px-4 py-6 min-h-screen">
    <!-- BAŞLIK -->
    <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Rezerve Stok Detayı</h1>
        <p class="text-gray-500 text-sm mt-1">İş emirleri üzerinden depoda rezerve edilmiş (henüz sevk edilmemiş) stok kalemleri.</p>
      </div>
    </div>

    <!-- ARAMA -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div class="relative">
        <input 
          v-model="aramaMetni" 
          type="text" 
          placeholder="Ürün kodu veya adı ile ara..." 
          class="w-full form-input pl-10 bg-gray-50 font-medium text-gray-700" 
        />
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>

    <!-- YÜKLENİYOR -->
    <div v-if="yukleniyor" class="py-12 flex justify-center">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
          <span class="text-gray-500 font-medium">Rezerve stoklar hesaplanıyor...</span>
        </div>
    </div>

    <!-- LİSTE (ACCORDION) -->
    <div v-else class="space-y-4 pb-12">
       <div v-if="filtrelenmisGruplar.length === 0" class="text-center py-12 text-gray-400 italic bg-white rounded-lg border border-dashed border-gray-300">
          Rezerve edilmiş stok bulunamadı veya aramanıza uygun sonuç yok.
       </div>

       <div v-for="grup in filtrelenmisGruplar" :key="grup.urun_id" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          
          <!-- BAŞLIK (HEADER) -->
          <div @click="grup.acik = !grup.acik" class="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors select-none">
             <div class="flex items-center gap-3">
                <div class="bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded text-xs border border-indigo-200">
                   {{ grup.urun_kodu }}
                </div>
                <div class="font-bold text-gray-800 text-sm max-w-md md:max-w-lg truncate" :title="grup.aciklama">
                   {{ grup.aciklama }}
                </div>
             </div>
             
             <div class="flex items-center gap-6">
                <div class="text-right">
                   <div class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Toplam Rezerve</div>
                   <div class="text-lg font-bold text-orange-600 font-mono bg-orange-50 px-2 rounded">{{ grup.toplam_rezerve }} <span class="text-[11px] font-bold text-gray-500 uppercase">{{ grup.birim }}</span></div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 transform transition-transform duration-200" :class="{'rotate-180 text-indigo-600': grup.acik}" viewBox="0 0 20 20" fill="currentColor">
                   <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
             </div>
          </div>

          <!-- DETAY (BODY) -->
          <div v-if="grup.acik" class="border-t border-gray-200 bg-white">
             <div class="overflow-x-auto">
               <table class="min-w-full divide-y divide-gray-100">
                  <thead class="bg-white">
                     <tr>
                        <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">İş Emri No</th>
                        <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Müşteri</th>
                        <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Depo</th>
                        <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tarih</th>
                        <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Miktar</th>
                     </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                     <tr v-for="detay in grup.detaylar" :key="detay.id" class="hover:bg-indigo-50 transition-colors group">
                        <td class="px-4 py-3 text-sm">
                           <router-link :to="`/app/is-emirleri/${detay.is_emri_id}`" class="text-indigo-600 hover:text-indigo-800 font-bold flex items-center">
                              #{{ detay.is_emri_numara }}
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                           </router-link>
                        </td>
                        <td class="px-4 py-3 text-sm font-medium text-gray-700 truncate max-w-[200px]" :title="detay.musteri_unvan">{{ detay.musteri_unvan }}</td>
                        <td class="px-4 py-3 text-xs text-gray-500 font-semibold">{{ detay.depo_ad || 'Bilinmeyen Depo' }}</td>
                        <td class="px-4 py-3 text-xs text-gray-500">{{ formatDate(detay.tarih) }}</td>
                        <td class="px-4 py-3 text-right text-sm font-bold font-mono text-orange-600">
                           {{ detay.miktar }}
                        </td>
                     </tr>
                  </tbody>
               </table>
             </div>
          </div>

       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase';

const gruplar = ref([]);
const yukleniyor = ref(true);
const aramaMetni = ref('');

const veriYukle = async () => {
  yukleniyor.value = true;
  try {
    // YENİ MİMARİ: 'sevk_edildi' KULLANILMIYOR. Sadece 'rezerve_edildi' kullanılıyor.
    const { data, error } = await supabase
      .from('is_emri_kalemleri')
      .select(`
        id,
        miktar,
        birim,
        urun_id,
        kaynak_depo_id,
        depolar (ad),
        urunler (urun_kodu, aciklama),
        is_emri_id,
        is_emirleri (
           id, 
           numara, 
           durum, 
           siparis_tarihi,
           is_tamamlandi, 
           rezerve_edildi,
           musteriler (unvan)
        )
      `)
      .not('kaynak_depo_id', 'is', null); // Sadece depodan çıkacaklar (veya rezerve edilecekler)

    if (error) throw error;

    // FİLTRELEME (YENİ MANTIK):
    // İş emri rezerve_edildi === true olmalı
    // Durum 'İptal' olmamalı
    const rezerveKalemler = data.filter(k => 
       k.is_emirleri && 
       k.is_emirleri.rezerve_edildi === true &&
       k.is_emirleri.durum !== 'İptal'
    );

    // Gruplama (Ürüne Göre)
    const grupMap = {};

    rezerveKalemler.forEach(k => {
       if (!k.urun_id) return;
       
       if (!grupMap[k.urun_id]) {
          grupMap[k.urun_id] = {
             urun_id: k.urun_id,
             urun_kodu: k.urunler?.urun_kodu || 'KOD YOK',
             aciklama: k.urunler?.aciklama || 'Bilinmeyen Ürün',
             birim: k.birim || 'Adet',
             toplam_rezerve: 0,
             detaylar: [],
             acik: false
          };
       }

       grupMap[k.urun_id].toplam_rezerve += k.miktar;
       grupMap[k.urun_id].detaylar.push({
          id: k.id,
          is_emri_id: k.is_emri_id,
          is_emri_numara: k.is_emirleri.numara,
          musteri_unvan: k.is_emirleri.musteriler?.unvan || 'Belirsiz Müşteri',
          depo_ad: k.depolar?.ad,
          tarih: k.is_emirleri.siparis_tarihi,
          durum: k.is_emirleri.durum,
          miktar: k.miktar
       });
    });

    gruplar.value = Object.values(grupMap).sort((a,b) => b.toplam_rezerve - a.toplam_rezerve);

  } catch (err) {
    console.error('Rezerve veri hatası:', err);
    alert('Veriler yüklenirken bir hata oluştu.');
  } finally {
    yukleniyor.value = false;
  }
};

const filtrelenmisGruplar = computed(() => {
   if (!aramaMetni.value) return gruplar.value;
   const metin = aramaMetni.value.toLocaleLowerCase('tr-TR');
   return gruplar.value.filter(g => 
      (g.urun_kodu && g.urun_kodu.toLocaleLowerCase('tr-TR').includes(metin)) || 
      (g.aciklama && g.aciklama.toLocaleLowerCase('tr-TR').includes(metin))
   );
});

const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR');

onMounted(() => {
  veriYukle();
});
</script>

<style scoped>
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-shadow; }
</style>
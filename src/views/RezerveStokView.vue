<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Rezerve Stok Detayı</h1>
      <p class="text-gray-500 text-sm mt-1">Henüz sevk edilmemiş veya tamamlanmamış iş emirlerine bağlı stoklar.</p>
    </div>

    <!-- ARAMA -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <input v-model="aramaMetni" type="text" placeholder="Ürün kodu veya adı ile ara..." class="w-full form-input" />
    </div>

    <!-- YÜKLENİYOR -->
    <div v-if="yukleniyor" class="py-12 flex justify-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>

    <!-- LİSTE (ACCORDION) -->
    <div v-else class="space-y-4">
       <div v-if="filtrelenmisGruplar.length === 0" class="text-center py-8 text-gray-400 italic bg-white rounded-lg border border-dashed">
          Rezerve edilmiş stok bulunamadı.
       </div>

       <div v-for="grup in filtrelenmisGruplar" :key="grup.urun_id" class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          
          <!-- BAŞLIK (HEADER) -->
          <div @click="grup.acik = !grup.acik" class="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors select-none">
             <div class="flex items-center gap-3">
                <div class="bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded text-xs">
                   {{ grup.urun_kodu }}
                </div>
                <div class="font-medium text-gray-700 text-sm">
                   {{ grup.aciklama }}
                </div>
             </div>
             
             <div class="flex items-center gap-4">
                <div class="text-right">
                   <div class="text-[10px] text-gray-500 uppercase">Toplam Rezerve</div>
                   <div class="text-lg font-bold text-gray-900">{{ grup.toplam_rezerve }} <span class="text-xs font-normal text-gray-500">{{ grup.birim }}</span></div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 transform transition-transform" :class="{'rotate-180': grup.acik}" viewBox="0 0 20 20" fill="currentColor">
                   <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
             </div>
          </div>

          <!-- DETAY (BODY) -->
          <div v-if="grup.acik" class="border-t border-gray-200">
             <table class="min-w-full divide-y divide-gray-100">
                <thead class="bg-gray-50">
                   <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">İş Emri No</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Müşteri</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Tarih</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Durum</th>
                      <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Miktar</th>
                   </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                   <tr v-for="detay in grup.detaylar" :key="detay.id" class="hover:bg-gray-50">
                      <td class="px-4 py-2 text-sm">
                         <router-link :to="`/app/is-emirleri/${detay.is_emri_id}`" class="text-blue-600 hover:underline font-bold">
                            #{{ detay.is_emri_numara }}
                         </router-link>
                      </td>
                      <td class="px-4 py-2 text-sm text-gray-600">{{ detay.musteri_unvan }}</td>
                      <td class="px-4 py-2 text-xs text-gray-500">{{ formatDate(detay.tarih) }}</td>
                      <td class="px-4 py-2 text-xs">
                         <span class="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-[10px]">
                            {{ detay.durum }}
                         </span>
                      </td>
                      <td class="px-4 py-2 text-right text-sm font-bold text-gray-800">
                         {{ detay.miktar }}
                      </td>
                   </tr>
                </tbody>
             </table>
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
    // 1. Aktif iş emirlerine ait kalemleri çek (Depodan rezerve edilenler)
    // Durumu 'Kapandı' veya 'Tamamlandı' olmayanlar
    // Ve kaynak_depo_id DOLU olanlar (Tedarikçiden direkt geleni rezerve saymıyoruz genelde, ama ihtiyaca göre değişir. Burada depo rezervine bakıyoruz)
    const { data, error } = await supabase
      .from('is_emri_kalemleri')
      .select(`
        id,
        miktar,
        birim,
        urun_id,
        urunler (urun_kodu, aciklama),
        is_emri_id,
        is_emirleri (
           id, 
           numara, 
           durum, 
           siparis_tarihi,
           is_tamamlandi, 
           sevk_edildi,
           musteriler (unvan)
        )
      `)
      .not('kaynak_depo_id', 'is', null); // Sadece depodan çıkacaklar rezerve sayılır

    if (error) throw error;

    // 2. Filtreleme (Client Side): Sadece açık iş emirlerini al
    // İş emri tamamlanmamış VE sevk edilmemiş olmalı
    const aktifKalemler = data.filter(k => 
       k.is_emirleri && 
       !k.is_emirleri.is_tamamlandi && 
       // Sevk edildi alanı veritabanında varsa kontrol et, yoksa sadece is_tamamlandi'ya bak
       (k.is_emirleri.sevk_edildi === false || k.is_emirleri.sevk_edildi === null) 
    );

    // 3. Gruplama
    const grupMap = {};

    aktifKalemler.forEach(k => {
       if (!k.urun_id) return;
       
       if (!grupMap[k.urun_id]) {
          grupMap[k.urun_id] = {
             urun_id: k.urun_id,
             urun_kodu: k.urunler?.urun_kodu,
             aciklama: k.urunler?.aciklama,
             birim: k.birim,
             toplam_rezerve: 0,
             detaylar: [],
             acik: false // Accordion durumu
          };
       }

       grupMap[k.urun_id].toplam_rezerve += k.miktar;
       grupMap[k.urun_id].detaylar.push({
          id: k.id,
          is_emri_id: k.is_emri_id,
          is_emri_numara: k.is_emirleri.numara,
          musteri_unvan: k.is_emirleri.musteriler?.unvan || 'Belirsiz',
          tarih: k.is_emirleri.siparis_tarihi,
          durum: k.is_emirleri.durum,
          miktar: k.miktar
       });
    });

    gruplar.value = Object.values(grupMap).sort((a,b) => b.toplam_rezerve - a.toplam_rezerve);

  } catch (err) {
    console.error('Rezerve veri hatası:', err);
  } finally {
    yukleniyor.value = false;
  }
};

const filtrelenmisGruplar = computed(() => {
   if (!aramaMetni.value) return gruplar.value;
   const metin = aramaMetni.value.toLowerCase();
   return gruplar.value.filter(g => 
      g.urun_kodu?.toLowerCase().includes(metin) || 
      g.aciklama?.toLowerCase().includes(metin)
   );
});

const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR');

onMounted(() => {
  veriYukle();
});
</script>

<style scoped>
.form-input { @apply block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500; }
</style>
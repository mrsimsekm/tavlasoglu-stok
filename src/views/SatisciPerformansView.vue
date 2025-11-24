<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Satışçı Performans Raporu</h1>
    </div>

    <!-- FİLTRE ALANI -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
      <div class="flex flex-col md:flex-row items-center gap-4">
        <div class="w-full md:w-1/4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Dönem Seçimi</label>
          <select v-model="secilenDonem" @change="tarihleriAyarla" class="w-full p-2 border rounded-md bg-gray-50 focus:ring-indigo-500">
            <option value="bu_ay">Bu Ay</option>
            <option value="son_30_gun">Son 30 Gün</option>
            <option value="bu_yil">Bu Yıl</option>
            <option value="son_12_ay">Son 12 Ay</option>
            <option value="ozel">Özel Tarih Aralığı</option>
          </select>
        </div>

        <!-- Özel Tarih Seçimi -->
        <div v-if="secilenDonem === 'ozel'" class="flex gap-2 w-full md:w-2/4">
          <div class="w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Başlangıç</label>
            <input type="date" v-model="baslangicTarihi" class="w-full p-2 border rounded-md">
          </div>
          <div class="w-1/2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Bitiş</label>
            <input type="date" v-model="bitisTarihi" class="w-full p-2 border rounded-md">
          </div>
        </div>

        <div class="w-full md:w-auto mt-auto">
          <button @click="raporuGetir" class="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
            Raporla
          </button>
        </div>
      </div>
      <p class="text-xs text-gray-500 mt-2 ml-1 italic">* Sadece "Kapandı" durumundaki ve "Tamamlandı" işaretli iş emirleri hesaplanır.</p>
    </div>

    <!-- GENEL ÖZET KARTLARI -->
    <div v-if="!yukleniyor && raporVerisi.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
        <p class="text-green-600 font-medium text-sm uppercase tracking-wide">Toplam Ciro</p>
        <p class="text-3xl font-bold text-green-800 mt-1">{{ formatPara(genelToplamCiro) }}</p>
      </div>
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
        <p class="text-blue-600 font-medium text-sm uppercase tracking-wide">Toplam Kar</p>
        <p class="text-3xl font-bold text-blue-800 mt-1">{{ formatPara(genelToplamKar) }}</p>
      </div>
    </div>

    <!-- RAPOR TABLOSU -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div v-if="yukleniyor" class="p-12 text-center text-gray-500">
        <svg class="animate-spin h-8 w-8 mx-auto mb-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Veriler hesaplanıyor...
      </div>
      
      <div v-else-if="raporVerisi.length === 0" class="p-12 text-center text-gray-500 bg-gray-50">
        Bu tarih aralığında tamamlanmış iş emri bulunamadı.
      </div>

      <!-- Ana Tablo -->
      <div v-else>
        <div v-for="(veri, index) in raporVerisi" :key="veri.id" class="border-b border-gray-200 last:border-b-0">
          
          <!-- Satışçı Satırı (Özet) -->
          <div 
            @click="toggleDetay(veri.id)"
            class="flex items-center justify-between p-4 cursor-pointer hover:bg-indigo-50 transition-colors"
            :class="{'bg-indigo-50': expandedRows[veri.id]}"
          >
            <div class="flex items-center space-x-4 flex-1">
              <div class="text-gray-400 font-mono text-sm">#{{ index + 1 }}</div>
              <div class="font-bold text-gray-800">{{ veri.ad_soyad }}</div>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                {{ veri.is_adedi }} İş
              </span>
            </div>
            
            <div class="flex items-center space-x-8 text-sm">
              <div class="text-right hidden md:block">
                <p class="text-xs text-gray-500">Ciro</p>
                <p class="font-semibold text-gray-900">{{ formatPara(veri.toplam_satis) }}</p>
              </div>
              <div class="text-right hidden md:block">
                <p class="text-xs text-gray-500">Maliyet</p>
                <p class="font-semibold text-red-600">{{ formatPara(veri.toplam_maliyet) }}</p>
              </div>
              <div class="text-right w-24">
                <p class="text-xs text-gray-500">Net Kar</p>
                <p class="font-bold text-green-600">{{ formatPara(veri.net_kar) }}</p>
              </div>
              <div class="text-right w-16">
                <span 
                  class="px-2 py-1 rounded text-xs font-bold"
                  :class="veri.kar_marji > 20 ? 'bg-green-100 text-green-800' : (veri.kar_marji > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')"
                >
                  %{{ veri.kar_marji.toFixed(1) }}
                </span>
              </div>
              <div>
                <svg v-if="expandedRows[veri.id]" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
              </div>
            </div>
          </div>

          <!-- Detay Tablosu (Akordiyon İçeriği) -->
          <div v-show="expandedRows[veri.id]" class="bg-gray-50 p-4 border-t border-gray-200 animate-fadeIn">
            <div v-if="veri.detaylar.length === 0" class="text-center text-gray-500 py-2">Detay bulunamadı.</div>
            <div v-else class="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table class="min-w-full divide-y divide-gray-200 text-sm">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-4 py-2 text-left font-medium text-gray-600">Tarih</th>
                    <th class="px-4 py-2 text-left font-medium text-gray-600">İş Emri No</th>
                    <th class="px-4 py-2 text-left font-medium text-gray-600">Müşteri</th>
                    <th class="px-4 py-2 text-right font-medium text-gray-600">Tutar</th>
                    <th class="px-4 py-2 text-right font-medium text-gray-600">Maliyet</th>
                    <th class="px-4 py-2 text-right font-medium text-gray-600">Kar</th>
                    <th class="px-4 py-2 text-center font-medium text-gray-600">Link</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="isEmri in veri.detaylar" :key="isEmri.id" class="hover:bg-gray-50">
                    <td class="px-4 py-2 text-gray-500">{{ new Date(isEmri.siparis_tarihi).toLocaleDateString('tr-TR') }}</td>
                    <td class="px-4 py-2 font-mono text-indigo-600 font-semibold">{{ isEmri.numara || 'N/A' }}</td>
                    <td class="px-4 py-2 text-gray-700">{{ isEmri.musteriler?.unvan || '-' }}</td>
                    <td class="px-4 py-2 text-right font-medium">{{ formatPara(isEmri.toplam_tutar) }}</td>
                    <td class="px-4 py-2 text-right text-red-500">{{ formatPara(isEmri.maliyet) }}</td>
                    <td class="px-4 py-2 text-right font-bold text-green-600">{{ formatPara((isEmri.toplam_tutar || 0) - (isEmri.maliyet || 0)) }}</td>
                    <td class="px-4 py-2 text-center">
                      <RouterLink :to="`/app/is-emirleri/${isEmri.id}`" class="text-blue-500 hover:text-blue-700 hover:underline text-xs">
                        Git
                      </RouterLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router'; // EKLENDİ
import { supabase } from '../supabase.js';

const secilenDonem = ref('bu_ay');
const baslangicTarihi = ref('');
const bitisTarihi = ref('');
const yukleniyor = ref(false);
const raporVerisi = ref([]);
const expandedRows = ref({}); // Akordiyon durumu

// Genel Toplamlar
const genelToplamCiro = computed(() => raporVerisi.value.reduce((acc, cur) => acc + cur.toplam_satis, 0));
const genelToplamKar = computed(() => raporVerisi.value.reduce((acc, cur) => acc + cur.net_kar, 0));
const enBasariliSatisci = computed(() => raporVerisi.value.length > 0 ? raporVerisi.value[0].ad_soyad : null);

const toggleDetay = (id) => {
  if (expandedRows.value[id]) {
    delete expandedRows.value[id];
  } else {
    expandedRows.value[id] = true;
  }
};

const formatPara = (deger) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(deger || 0);
};

const tarihleriAyarla = () => {
  const bugun = new Date();
  const yil = bugun.getFullYear();
  const ay = bugun.getMonth();
  const gun = bugun.getDate();

  const formatDate = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().split('T')[0];
  };

  if (secilenDonem.value === 'bu_ay') {
    baslangicTarihi.value = formatDate(new Date(yil, ay, 1));
    bitisTarihi.value = formatDate(new Date(yil, ay + 1, 0));
  } else if (secilenDonem.value === 'son_30_gun') {
    const gecmis = new Date(bugun);
    gecmis.setDate(gun - 30);
    baslangicTarihi.value = formatDate(gecmis);
    bitisTarihi.value = formatDate(bugun);
  } else if (secilenDonem.value === 'bu_yil') {
    baslangicTarihi.value = formatDate(new Date(yil, 0, 1));
    bitisTarihi.value = formatDate(new Date(yil, 11, 31));
  } else if (secilenDonem.value === 'son_12_ay') {
    const gecmis = new Date(bugun);
    gecmis.setFullYear(yil - 1);
    baslangicTarihi.value = formatDate(gecmis);
    bitisTarihi.value = formatDate(bugun);
  }
};

const raporuGetir = async () => {
  if (!baslangicTarihi.value || !bitisTarihi.value) {
    alert("Lütfen tarih aralığı seçiniz.");
    return;
  }

  yukleniyor.value = true;
  raporVerisi.value = [];
  expandedRows.value = {}; // Reset

  try {
    // 1. Satışçıları Çek
    const { data: satiscilar, error: sError } = await supabase
      .from('satiscilar')
      .select('id, ad_soyad')
      .eq('aktif_mi', true);
    
    if (sError) throw sError;

    // 2. İş Emirlerini Çek (Detaylı - Müşteri Adı Dahil)
    const { data: isEmirleri, error: ieError } = await supabase
      .from('is_emirleri')
      .select('id, satisci_id, numara, siparis_tarihi, toplam_tutar, maliyet, musteriler(unvan)')
      .eq('durum', 'Kapandı')
      .eq('is_tamamlandi', true)
      .gte('siparis_tarihi', baslangicTarihi.value)
      .lte('siparis_tarihi', bitisTarihi.value);

    if (ieError) throw ieError;

    // 3. Grupla ve Hesapla
    const performansListesi = satiscilar.map(satisci => {
      // Bu satışçının işleri
      const satisciniIsleri = isEmirleri.filter(ie => ie.satisci_id === satisci.id);
      
      // Tarihe göre sırala (Yeni -> Eski)
      satisciniIsleri.sort((a, b) => new Date(b.siparis_tarihi) - new Date(a.siparis_tarihi));

      const toplamSatis = satisciniIsleri.reduce((sum, is) => sum + (Number(is.toplam_tutar) || 0), 0);
      const toplamMaliyet = satisciniIsleri.reduce((sum, is) => sum + (Number(is.maliyet) || 0), 0);
      const netKar = toplamSatis - toplamMaliyet;
      const karMarji = toplamSatis > 0 ? (netKar / toplamSatis) * 100 : 0;

      return {
        id: satisci.id,
        ad_soyad: satisci.ad_soyad,
        is_adedi: satisciniIsleri.length,
        toplam_satis: toplamSatis,
        toplam_maliyet: toplamMaliyet,
        net_kar: netKar,
        kar_marji: karMarji,
        detaylar: satisciniIsleri // DETAY LİSTESİ EKLENDİ
      };
    });

    raporVerisi.value = performansListesi.sort((a, b) => b.net_kar - a.net_kar);

  } catch (error) {
    console.error("Rapor hatası:", error);
    alert("Hata: " + error.message);
  } finally {
    yukleniyor.value = false;
  }
};

onMounted(() => {
  tarihleriAyarla();
  raporuGetir();
});
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
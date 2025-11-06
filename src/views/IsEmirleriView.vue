<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">İş Emirleri</h1>
      <div class="flex items-center space-x-4">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" v-model="sadeceAcikOlanlariGoster" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
          <span class="text-sm font-medium text-gray-700">Sadece Açık Olanları Göster</span>
        </label>
        <RouterLink to="/app/is-emirleri/yeni" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
          + Yeni İş Emri Oluştur
        </RouterLink>
      </div>
    </div>
    <div class="bg-white shadow-md rounded-lg overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="th-style">İş Emri No</th>
            <th @click="siralamayiDegistir('siparis_tarihi')" class="th-style cursor-pointer hover:bg-gray-200">
              <div class="flex items-center">
                <span>Sipariş Tarihi</span>
                <span v-if="sortBy === 'siparis_tarihi'" class="ml-2">
                  <svg v-if="sortDirection === 'asc'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </div>
            </th>
            <th class="th-style">Müşteri Unvanı</th>
            <th class="th-style">Toplam Tutar</th>
            <th class="th-style">Ödenen Tutar</th>
            <th class="th-style">Durum</th>
            <th class="th-style text-center">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="7" class="text-center py-4">Yükleniyor...</td></tr>
          <tr v-else-if="!filtrelenmisIsEmirleri || filtrelenmisIsEmirleri.length === 0"><td colspan="7" class="text-center py-4">Gösterilecek iş emri bulunamadı.</td></tr>
          <tr v-else v-for="isEmri in filtrelenmisIsEmirleri" :key="isEmri.id">
            <td class="td-style">
              <span class="font-mono font-semibold text-indigo-600">
                {{ isEmri.numara || 'N/A' }}
              </span>
            </td>
            <td class="td-style">{{ new Date(isEmri.siparis_tarihi).toLocaleDateString('tr-TR') }}</td>
            <td class="td-style">{{ isEmri.musteriler ? isEmri.musteriler.unvan : 'Müşteri Bulunamadı' }}</td>
            <td class="td-style">{{ isEmri.toplam_tutar }} TL</td>
            <td class="td-style">{{ isEmri.odenen_tutar }} TL</td>
            <td class="td-style">
              <span class="px-2 py-1 font-semibold leading-tight rounded-full" 
                    :class="isEmri.durum === 'Açık' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'">
                {{ isEmri.durum }}
              </span>
            </td>
            <td class="td-style text-center">
              <div class="flex item-center justify-center space-x-2">
                <RouterLink :to="`/app/is-emirleri/${isEmri.id}`" class="text-blue-500 hover:text-blue-700 font-semibold">Görüntüle</RouterLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.th-style { @apply px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider; }
.td-style { @apply px-5 py-5 border-b border-gray-200 bg-white text-sm; }
</style>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { supabase } from '../supabase.js';

const tumIsEmirleri = ref([]);
const loading = ref(true);
const sadeceAcikOlanlariGoster = ref(true);
const sortBy = ref('siparis_tarihi');
const sortDirection = ref('desc');

const filtrelenmisIsEmirleri = computed(() => {
  if (sadeceAcikOlanlariGoster.value) {
    return tumIsEmirleri.value.filter(ie => ie.durum === 'Açık');
  }
  return tumIsEmirleri.value;
});

const siralamayiDegistir = (kolonKey) => {
  if (sortBy.value === kolonKey) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = kolonKey;
    sortDirection.value = 'asc';
  }
  getIsEmirleri();
};

const getIsEmirleri = async () => {
  try {
    loading.value = true;
    const { data, error } = await supabase
      .from('is_emirleri')
      .select(`*, musteriler ( unvan )`)
      .order(sortBy.value, { ascending: sortDirection.value === 'asc' });

    if (error) throw error;
    tumIsEmirleri.value = data;
  } catch (error) {
    console.error('İş emirleri çekilirken hata oluştu:', error.message);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getIsEmirleri();
});
</script>
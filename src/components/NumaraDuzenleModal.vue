<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity" @click.self="kapat">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4 transform transition-all">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-gray-800">{{ baslik }}</h3>
        <button @click="kapat" class="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <div v-if="hataMesaji" class="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm border border-red-200">
        {{ hataMesaji }}
      </div>

      <form @submit.prevent="kaydet">
        <div class="space-y-2">
          <label :for="alanAdi" class="block text-sm font-medium text-gray-700">Yeni Numara:</label>
          <input
            :id="alanAdi"
            type="number"
            v-model.number="yeniNumara"
            required
            class="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-mono font-bold"
            ref="inputRef"
          >
          <p class="text-xs text-gray-500">Mevcut Numara: <span class="font-semibold">{{ mevcutNumara }}</span></p>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button type="button" @click="kapat" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">
            İptal
          </button>
          <button 
            type="submit" 
            :disabled="loading || !yeniNumara"
            class="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ loading ? 'Kaydediliyor...' : 'Kaydet' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { supabase } from '../supabase.js';

const props = defineProps({
  modelValue: { type: Boolean, default: false }, // v-model için
  kayitId: { type: [String, Number], required: true },
  tabloAdi: { type: String, required: true },
  alanAdi: { type: String, required: true },
  mevcutNumara: { type: [String, Number], required: true },
  baslik: { type: String, default: 'Numara Düzenle' }
});

const emit = defineEmits(['update:modelValue', 'guncellendi', 'hata']);

const yeniNumara = ref(null);
const loading = ref(false);
const hataMesaji = ref('');
const inputRef = ref(null);

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    yeniNumara.value = props.mevcutNumara;
    hataMesaji.value = '';
    // Input'a otomatik odaklan
    nextTick(() => {
      inputRef.value?.focus();
      inputRef.value?.select();
    });
  }
});

const kapat = () => {
  if (loading.value) return;
  emit('update:modelValue', false);
};

const kaydet = async () => {
  if (loading.value || !yeniNumara.value) return;
  
  if (yeniNumara.value === props.mevcutNumara) {
    kapat(); // Değişiklik yoksa direkt kapat
    return;
  }

  loading.value = true;
  hataMesaji.value = '';

  try {
    const { error } = await supabase
      .from(props.tabloAdi)
      .update({ [props.alanAdi]: yeniNumara.value })
      .eq('id', props.kayitId);

    if (error) {
      // UNIQUE constraint hatasını yakala (kod: 23505)
      if (error.code === '23505') {
        hataMesaji.value = `Bu numara (${yeniNumara.value}) zaten başka bir kayıtta kullanılıyor. Lütfen farklı bir numara girin.`;
      } else {
        throw error;
      }
    } else {
      emit('guncellendi'); // Başarılı olursa parent'a haber ver
      kapat();
    }
  } catch (err) {
    hataMesaji.value = 'Bir hata oluştu: ' + err.message;
    emit('hata', err);
  } finally {
    loading.value = false;
  }
};
</script>
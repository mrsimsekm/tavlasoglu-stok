<template>
  <div class="relative">
    <input type="text" v-model="aramaMetni" @input="musteriAra" placeholder="Müşteri, Vergi No, Tel..." class="w-full p-2 border rounded-lg"/>
    <div v-if="aramaSonuclari.length > 0" class="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
      <ul>
        <li v-for="musteri in aramaSonuclari" :key="musteri.id" @click="musteriSec(musteri)" class="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0">
          <div class="font-bold text-gray-800">{{ musteri.unvan }}</div>
          <div class="text-xs text-gray-500">
             {{ musteri.il ? musteri.il + '/' : '' }}{{ musteri.ilce }} 
             {{ musteri.vergi_no ? ' - VKN: ' + musteri.vergi_no : '' }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { supabase } from '../supabase.js';
const aramaMetni = ref('');
const aramaSonuclari = ref([]);
const emit = defineEmits(['musteri-secildi']);
let debounceTimer;

const musteriAra = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (aramaMetni.value.length < 2) { aramaSonuclari.value = []; return; }
    
    const arama = aramaMetni.value;
    
    // GÜNCELLEME: Unvan, Vergi No, Telefon, İl ve İlçe alanlarında arama
    const { data } = await supabase.from('musteriler')
      .select('id, unvan, vergi_no, telefon, il, ilce')
      .or(`unvan.ilike.%${arama}%,vergi_no.ilike.%${arama}%,telefon.ilike.%${arama}%,il.ilike.%${arama}%,ilce.ilike.%${arama}%`)
      .limit(10);
      
    aramaSonuclari.value = data || [];
  }, 300);
};

const musteriSec = (musteri) => {
  aramaMetni.value = musteri.unvan;
  aramaSonuclari.value = [];
  emit('musteri-secildi', musteri);
};
</script>
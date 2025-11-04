<template>
  <div class="relative">
    <input type="text" v-model="aramaMetni" @input="musteriAra" placeholder="Müşteri kodu veya unvanı..." class="w-full p-2 border rounded-lg"/>
    <div v-if="aramaSonuclari.length > 0" class="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
      <ul>
        <li v-for="musteri in aramaSonuclari" :key="musteri.id" @click="musteriSec(musteri)" class="p-2 hover:bg-gray-100 cursor-pointer">
          {{ musteri.musteri_kodu }} - {{ musteri.unvan }}
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
    const { data } = await supabase.from('musteriler').select('id, musteri_kodu, unvan').or(`musteri_kodu.ilike.%${aramaMetni.value}%,unvan.ilike.%${aramaMetni.value}%`).limit(10);
    aramaSonuclari.value = data || [];
  }, 300);
};
const musteriSec = (musteri) => {
  aramaMetni.value = `${musteri.musteri_kodu} - ${musteri.unvan}`;
  aramaSonuclari.value = [];
  emit('musteri-secildi', musteri);
};
</script>
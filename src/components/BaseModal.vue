<template>
  <div v-if="show" @click.self="$emit('close')" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
    <div :class="['bg-white rounded-lg shadow-xl w-full mx-4 transform transition-all', maxWidth]">
      <!-- Başlık Bölümü -->
      <div class="flex justify-between items-center p-4 border-b">
        <h3 class="text-lg font-semibold">
          <slot name="header">Modal Başlığı</slot>
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Ana İçerik Bölümü -->
      <div class="p-6">
        <slot name="body">Modal içeriği buraya gelecek.</slot>
      </div>

      <!-- Alt Bölüm (Butonlar vb.) -->
      <div v-if="$slots.footer" class="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg space-x-2">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  maxWidth: {
    type: String,
    default: 'max-w-lg',
  },
});

defineEmits(['close']);
</script>
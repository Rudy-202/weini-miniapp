<template>
  <div v-if="show"
       class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
       @click.self="closeModal">
    <div class="bg-white p-2 rounded-lg shadow-xl max-w-3xl max-h-[90vh] overflow-auto">
      <img :src="imageUrl" alt="Image Preview" class="max-w-full max-h-[85vh] block mx-auto">
      <button @click="closeModal"
              class="absolute top-4 right-4 bg-white text-black rounded-full p-2 text-xl leading-none hover:bg-gray-200">
        &times;
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
/* Style for the close button or any other specific styles */
</style>

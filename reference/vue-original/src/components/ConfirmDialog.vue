<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
      <p class="text-gray-600 mb-6">{{ message }}</p>
      <div class="flex justify-end space-x-4">
        <button 
          @click="$emit('update:modelValue', false)"
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          取消
        </button>
        <button 
          @click="confirm"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          确认
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: '确认'
  },
  message: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const confirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}
</script> 
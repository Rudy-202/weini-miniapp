<template>
  <div class="invite-code-verification">
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        邀请码
      </label>
      <div class="flex space-x-2">
        <input type="text"
               v-model="inviteCode"
               class="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               placeholder="请输入邀请码"
               :class="{ 'border-red-500': error }"
               @input="validateCode">
        <button @click="verifyCode"
                class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                :disabled="!inviteCode || verifying">
          {{ verifying ? '验证中...' : '验证' }}
        </button>
      </div>
      <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
      <p v-if="success" class="mt-1 text-sm text-green-600">{{ success }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import apiClient from '@/utils/api.js'

const props = defineProps({
  onVerified: {
    type: Function,
    required: true
  }
})

const inviteCode = ref('')
const error = ref('')
const success = ref('')
const verifying = ref(false)

const validateCode = () => {
  error.value = ''
  success.value = ''
}

const verifyCode = async () => {
  if (!inviteCode.value) {
    error.value = '请输入邀请码'
    return
  }

  verifying.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await apiClient.post('/api/verify-invite-code', {
      code: inviteCode.value
    })
    success.value = '邀请码验证成功'
    props.onVerified(response.data)
  } catch (err) {
    error.value = err.message || err.response?.data?.error || '邀请码验证失败'
  } finally {
    verifying.value = false
  }
}
</script>

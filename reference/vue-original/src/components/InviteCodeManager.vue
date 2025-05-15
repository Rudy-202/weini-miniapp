<template>
  <div class="invite-code-manager">
    <div class="mb-6 bg-white rounded-lg shadow-md p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">邀请码管理</h2>
        <button @click="generateInviteCode"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
          生成邀请码
        </button>
      </div>

      <!-- 生成邀请码表单 -->
      <div v-if="showGenerateForm" class="mb-6 p-4 border rounded-lg">
        <h3 class="text-lg font-semibold mb-4">生成新邀请码</h3>
        <form @submit.prevent="submitGenerateForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">有效期（天）</label>
            <input type="number"
                   v-model.number="generateForm.validDays"
                   min="1"
                   max="365"
                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                   required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">使用次数限制</label>
            <input type="number"
                   v-model.number="generateForm.maxUses"
                   min="1"
                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                   required>
          </div>
          <div class="flex justify-end space-x-2">
            <button type="button"
                    @click="showGenerateForm = false"
                    class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors">
              取消
            </button>
            <button type="submit"
                    class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              生成
            </button>
          </div>
        </form>
      </div>

      <!-- 邀请码列表 -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                邀请码
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                有效期至
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                已使用/限制
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="code in inviteCodes" :key="code.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span class="font-mono">{{ code.code }}</span>
                  <button @click="copyToClipboard(code.code)"
                          class="ml-2 text-gray-400 hover:text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ formatDate(code.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ formatDate(code.expires_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ code.used_count }}/{{ code.max_uses }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(code)">
                  {{ getStatusText(code) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button @click="revokeCode(code)"
                        class="text-red-600 hover:text-red-900"
                        :disabled="!isCodeActive(code)">
                  撤销
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '@/utils/api.js'

const inviteCodes = ref([])
const showGenerateForm = ref(false)
const generateForm = ref({
  validDays: 7,
  maxUses: 1
})

const fetchInviteCodes = async () => {
  try {
    const response = await apiClient.get('/api/admin/invite-codes')
    inviteCodes.value = response.data
  } catch (err) {
    console.error('获取邀请码列表失败:', err.message || err)
  }
}

const generateInviteCode = () => {
  showGenerateForm.value = true
}

const submitGenerateForm = async () => {
  try {
    const response = await apiClient.post('/api/admin/invite-codes', generateForm.value)
    inviteCodes.value.unshift(response.data)
    showGenerateForm.value = false
    generateForm.value = {
      validDays: 7,
      maxUses: 1
    }
  } catch (err) {
    console.error('生成邀请码失败:', err.message || err)
  }
}

const revokeCode = async (code) => {
  if (!confirm('确定要撤销这个邀请码吗？')) return

  try {
    await apiClient.delete(`/api/admin/invite-codes/${code.id}`)
    const index = inviteCodes.value.findIndex(c => c.id === code.id)
    if (index !== -1) {
      inviteCodes.value.splice(index, 1)
    }
  } catch (err) {
    console.error('撤销邀请码失败:', err.message || err)
  }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('邀请码已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusText = (code) => {
  if (!isCodeActive(code)) return '已失效'
  if (code.used_count >= code.max_uses) return '已用完'
  return '有效'
}

const getStatusClass = (code) => {
  if (!isCodeActive(code)) return 'text-gray-500'
  if (code.used_count >= code.max_uses) return 'text-red-500'
  return 'text-green-500'
}

const isCodeActive = (code) => {
  const now = new Date()
  const expiresAt = new Date(code.expires_at)
  return now < expiresAt && code.used_count < code.max_uses
}

onMounted(() => {
  fetchInviteCodes()
})
</script>

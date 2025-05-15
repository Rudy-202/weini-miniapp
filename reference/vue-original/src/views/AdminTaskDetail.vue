<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">任务详情</h1>
      <button @click="goBackToAdminList"
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors">
        返回
      </button>
    </div>

    <div v-if="loading" class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>

    <div v-else-if="error" class="text-red-500 text-center">
      {{ error }}
    </div>

    <div v-else>
      <!-- 任务基本信息 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">{{ task.title }}</h2>
        <p class="text-gray-600 mb-4">{{ task.description }}</p>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-gray-600">基础积分</p>
            <p class="font-medium">{{ task.points }} 分</p>
          </div>
          <div>
            <p class="text-gray-600">创建时间</p>
            <p class="font-medium">{{ formatDate(task.created_at) }}</p>
          </div>
        </div>

        <div class="flex items-center space-x-4 mb-4">
          <div class="flex items-center">
            <input type="checkbox"
                   :checked="task.flame_mode_enabled"
                   disabled
                   class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
            <label class="ml-2 text-sm text-gray-900">浴火模式</label>
          </div>
          <div class="flex items-center">
            <input type="checkbox"
                   :checked="task.time_limit_mode"
                   disabled
                   class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
            <label class="ml-2 text-sm text-gray-900">限时模式</label>
          </div>
        </div>
      </div>

      <!-- 参与人列表 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4">参与人列表</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  昵称
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  参与次数
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  获得积分
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  首次参与时间
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="participant in task.participants" :key="participant.name">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ participant.name }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ participant.submission_count }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ participant.points_earned }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ formatDate(participant.joined_at) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button @click="viewSubmissions(participant)"
                          class="text-blue-600 hover:text-blue-900">
                    查看提交
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '@/utils/api.js'

const router = useRouter()
const route = useRoute()
const task = ref({})
const loading = ref(true)
const error = ref('')

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

const fetchTask = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await apiClient.get(`/api/admin/tasks/${route.params.id}`)
    task.value = response.data
  } catch (err) {
    console.error('获取任务详情失败:', err)
    error.value = err.message || '获取任务详情失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const viewSubmissions = (participant) => {
  router.push({
    name: 'AdminParticipantSubmissions',
    params: {
      taskId: route.params.id,
      participantName: participant.name
    }
  })
}

const goBackToAdminList = () => {
  router.push({ name: 'AdminTaskList' });
};

onMounted(() => {
  fetchTask()
})
</script>

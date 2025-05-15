<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-300">任务管理</h1>
      <div class="flex gap-4">
        <router-link to="/admin/history"
                    class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
          历史任务
        </router-link>
        <router-link to="/admin/tasks/new"
                    class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
          <span class="flex items-center">
            <span class="mr-2">+</span>
            发布新任务
          </span>
        </router-link>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      <p class="mt-4 text-gray-600">加载任务列表中...</p>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md">
      <div class="flex items-center">
        <svg class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ error }}
      </div>
    </div>

    <!-- 任务列表 -->
    <div v-else class="grid gap-6">
      <div v-for="task in tasks" :key="task.id"
           class="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
           :class="{'opacity-75': task.isProcessing}"
           @click="goToTaskDetail(task.id)">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h2 class="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-300">
              {{ task.title }}
            </h2>
            <p class="text-gray-600 mt-2 line-clamp-2">{{ task.description }}</p>
            <div class="mt-4 flex items-center gap-4">
              <span class="inline-flex items-center text-blue-600">
                <svg class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                积分: {{ task.points }}
              </span>
              <span class="inline-flex items-center text-green-600">
                <svg class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                参与人数: {{ task.participants ? task.participants.length : 0 }}
              </span>
            </div>
          </div>
          <div class="flex gap-3 ml-4">
            <button @click.stop="completeTask(task.id)"
                    :disabled="task.isProcessing"
                    class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transform hover:scale-105 transition-all duration-300 shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
              结算任务
            </button>
            <button @click.stop="deleteTask(task.id)"
                    :disabled="task.isProcessing"
                    class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transform hover:scale-105 transition-all duration-300 shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
              删除
            </button>
          </div>
        </div>

        <!-- 参与者列表 -->
        <div v-if="task.participants && task.participants.length > 0" class="mt-4">
          <h3 class="text-sm font-medium text-gray-700 mb-2">参与者列表</h3>
          <div class="grid gap-2">
            <div v-for="participant in task.participants" :key="participant.name"
                 class="bg-gray-50 p-3 rounded-lg">
              <div class="flex justify-between items-center">
                <div>
                  <span class="font-medium">{{ participant.name }}</span>
                  <span class="text-sm text-gray-500 ml-2">
                    提交次数: {{ participant.submission_count }}
                  </span>
                </div>
                <span class="text-green-600 font-medium">
                  获得积分: {{ participant.points_earned || 0 }}
                </span>
              </div>
              <!-- 提交的截图 -->
              <div v-if="participant.submissions && participant.submissions.length > 0"
                   class="mt-2 grid grid-cols-2 gap-2">
                <div v-for="(submission, index) in participant.submissions"
                     :key="index"
                     class="relative group">
                  <img :src="submission.image_url"
                       :alt="'提交截图 ' + (index + 1)"
                       class="w-full h-24 object-cover rounded-lg cursor-pointer"
                       @click="viewImage(submission.image_url)" />
                  <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && !error && tasks.length === 0" class="text-center py-12">
      <p class="text-gray-500 text-lg">暂无任务</p>
    </div>

    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">邀请码管理</h2>
        <button @click="generateInviteCode"
                class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
          生成新邀请码
        </button>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div v-if="inviteCodes.length === 0" class="text-center text-gray-500 py-4">
          暂无邀请码
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="code in inviteCodes" :key="code.code"
               class="bg-gray-50 p-4 rounded-lg">
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium">{{ code.code }}</span>
              <button @click="copyInviteCode(code.code)"
                      class="text-blue-500 hover:text-blue-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>
            <div class="text-sm text-gray-600">
              <div>创建时间: {{ new Date(code.created_at).toLocaleString() }}</div>
              <div>使用次数: {{ code.usage_count || 0 }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/utils/api.js'

const router = useRouter()
const tasks = ref([])
const loading = ref(true)
const error = ref(null)
const inviteCodes = ref([])

const goToTaskDetail = (taskId) => {
  router.push(`/admin/task/${taskId}`)
}

const fetchTasks = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await apiClient.get('/api/admin/tasks')
    tasks.value = response.data.map(task => ({
      ...task,
      isProcessing: false
    }))
  } catch (err) {
    error.value = '获取任务列表失败，请稍后重试'
    console.error('获取任务列表失败:', err)
  } finally {
    loading.value = false
  }
}

const deleteTask = async (taskId) => {
  if (!confirm('确定要删除这个任务吗？这个操作无法撤销。')) return

  const task = tasks.value.find(t => t.id === taskId)
  if (!task || task.isProcessing) return

  task.isProcessing = true

  try {
    await apiClient.delete(`/api/admin/tasks/${taskId}`)
    tasks.value = tasks.value.filter(task => task.id !== taskId)
  } catch (err) {
    task.isProcessing = false
    alert(err.message || '删除任务失败，请重试')
    console.error('删除任务失败:', err)
  }
}

const completeTask = async (taskId) => {
  if (!confirm('确定要结算这个任务吗？结算后任务将被归档。')) return

  const task = tasks.value.find(t => t.id === taskId)
  if (!task || task.isProcessing) return

  task.isProcessing = true

  try {
    await apiClient.put(`/api/admin/tasks/${taskId}/complete`)
    tasks.value = tasks.value.filter(task => task.id !== taskId)
    alert('任务结算成功！')
  } catch (err) {
    task.isProcessing = false
    alert(err.message || '结算任务失败，请重试')
    console.error('结算任务失败:', err)
  }
}

const viewImage = (imageUrl) => {
  window.open(imageUrl, '_blank')
}

// 获取邀请码列表
const fetchInviteCodes = async () => {
  try {
    const response = await apiClient.get('/api/admin/invite-codes')
    inviteCodes.value = response.data
  } catch (err) {
    console.error('获取邀请码失败:', err.message || err)
  }
}

// 生成新邀请码
const generateInviteCode = async () => {
  try {
    console.log('请求生成邀请码')
    const response = await apiClient.post('/api/admin/invite-codes', {})
    console.log('邀请码生成响应:', response.data)

    if (response.data && response.data.code) {
      inviteCodes.value.unshift(response.data)
      alert('邀请码生成成功')
    } else {
      throw new Error('生成邀请码失败')
    }
  } catch (err) {
    console.error('生成邀请码失败:', err)
    if (err.response) {
      alert(err.response.data.error || '生成邀请码失败，请稍后重试')
    } else {
      alert('无法连接到服务器，请确保后端服务已启动')
    }
  }
}

// 复制邀请码
const copyInviteCode = (code) => {
  navigator.clipboard.writeText(code)
    .then(() => {
      alert('邀请码已复制到剪贴板')
    })
    .catch(err => {
      console.error('复制失败:', err)
    })
}

onMounted(() => {
  fetchTasks()
  fetchInviteCodes()
})
</script>

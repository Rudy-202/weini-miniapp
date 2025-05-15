<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">历史任务</h1>
      <button @click="goBack" 
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
      <!-- 任务列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="task in completedTasks" 
             :key="task.id" 
             class="bg-white rounded-lg shadow-md p-6 cursor-pointer transform transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
             @click="viewTaskParticipants(task)">
          <h3 class="text-xl font-semibold mb-2">{{ task.title }}</h3>
          <p class="text-gray-600 mb-4">{{ task.description }}</p>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-gray-600">积分</p>
              <p class="font-medium">{{ task.points }} 分</p>
            </div>
            <div>
              <p class="text-gray-600">参与人数</p>
              <p class="font-medium">{{ task.participants?.length || 0 }} 人</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 参与者列表对话框 -->
    <div v-if="showParticipantsDialog" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">{{ selectedTask?.title }} - 参与者列表</h2>
          <button @click="closeParticipantsDialog" 
                  class="text-gray-500 hover:text-gray-700">
            <span class="text-2xl">&times;</span>
          </button>
        </div>
        
        <div class="space-y-4">
          <div v-for="participant in selectedTask?.participants" 
               :key="participant.name"
               class="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100"
               @click="viewParticipantImages(participant)">
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium">{{ participant.name }}</p>
                <p class="text-sm text-gray-600">
                  提交次数: {{ participant.submission_count }}
                  总积分: {{ participant.points_earned }}
                </p>
              </div>
              <span class="text-gray-400">点击查看图片</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 参与者图片对话框 -->
    <div v-if="showImagesDialog" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">{{ selectedParticipant?.name }} - 提交图片</h2>
          <button @click="closeImagesDialog" 
                  class="text-gray-500 hover:text-gray-700">
            <span class="text-2xl">&times;</span>
          </button>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div v-for="(submission, index) in selectedParticipant?.submissions" 
               :key="index"
               class="relative">
            <img :src="submission.image_url" 
                 :alt="`提交图片 ${index + 1}`"
                 class="w-full h-48 object-cover rounded-lg">
            <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
              {{ formatDate(submission.submitted_at) }}
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
import axios from 'axios'

const router = useRouter()
const completedTasks = ref([])
const loading = ref(true)
const error = ref('')
const showParticipantsDialog = ref(false)
const showImagesDialog = ref(false)
const selectedTask = ref(null)
const selectedParticipant = ref(null)

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 5000,
  withCredentials: true
})

// 添加请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 添加响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      router.push('/admin/login')
    }
    return Promise.reject(error)
  }
)

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

const fetchCompletedTasks = async () => {
  try {
    const response = await api.get('/api/admin/tasks')
    // 只过滤已完成的任务
    completedTasks.value = response.data.filter(task => task.status === 'completed')
    loading.value = false
  } catch (err) {
    console.error('获取历史任务失败:', err)
    error.value = '获取历史任务失败，请稍后重试'
    loading.value = false
  }
}

const viewTaskParticipants = (task) => {
  selectedTask.value = task
  showParticipantsDialog.value = true
}

const closeParticipantsDialog = () => {
  showParticipantsDialog.value = false
  selectedTask.value = null
}

const viewParticipantImages = (participant) => {
  selectedParticipant.value = participant
  showImagesDialog.value = true
}

const closeImagesDialog = () => {
  showImagesDialog.value = false
  selectedParticipant.value = null
}

const goBack = () => {
  router.push('/admin')
}

onMounted(() => {
  fetchCompletedTasks()
})
</script> 
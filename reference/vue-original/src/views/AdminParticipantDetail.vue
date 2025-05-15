<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-4">
      <router-link :to="`/admin/task/${route.params.taskId}`" class="text-blue-500 hover:text-blue-600">
        ← 返回任务详情
      </router-link>
    </div>
    <div v-if="loading" class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
    </div>
    <div v-else-if="error" class="text-red-500 text-center">
      {{ error }}
    </div>
    <div v-else class="max-w-4xl mx-auto">
      <div class="bg-white p-6 rounded-lg shadow mb-6">
        <div class="mb-6">
          <h1 class="text-2xl font-bold mb-4">{{ participant.name }} 的提交记录</h1>
          <div class="flex items-center gap-4 text-sm">
            <span class="text-blue-600">提交次数: {{ participant.submission_count }}</span>
            <span class="text-green-600">参与时间: {{ formatDate(participant.joined_at) }}</span>
          </div>
        </div>
      </div>

      <!-- 提交记录列表 -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">提交截图</h2>
        <div v-if="submissions && submissions.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="submission in sortedSubmissions" :key="submission.id" 
               class="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div class="relative group">
              <img :src="`http://localhost:5000/uploads/${submission.image_filename}`" 
                   :alt="`${participant.name}的提交截图`"
                   class="w-full h-48 object-cover rounded-lg mb-2 cursor-pointer"
                   @click="showImagePreview(submission)">
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                <span class="text-white opacity-0 group-hover:opacity-100 transition-opacity">点击查看大图</span>
              </div>
            </div>
            <p class="text-gray-500 text-sm">提交时间: {{ formatDate(submission.submitted_at) }}</p>
          </div>
        </div>
        <div v-else class="text-gray-500 text-center py-4">
          暂无提交记录
        </div>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <div v-if="previewImage" 
         class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
         @click="closeImagePreview">
      <div class="relative max-w-4xl max-h-[90vh] p-4">
        <img :src="previewImage" 
             :alt="`${participant.name}的提交截图`"
             class="max-w-full max-h-[80vh] object-contain">
        <button @click="closeImagePreview"
                class="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const participant = ref(null)
const submissions = ref([])
const loading = ref(true)
const error = ref(null)
const previewImage = ref(null)

const sortedSubmissions = computed(() => {
  return [...submissions.value].sort((a, b) => 
    new Date(b.submitted_at) - new Date(a.submitted_at)
  )
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showImagePreview = (submission) => {
  previewImage.value = `http://localhost:5000/uploads/${submission.image_filename}`
}

const closeImagePreview = () => {
  previewImage.value = null
}

const fetchParticipantData = async () => {
  try {
    const taskId = route.params.taskId
    const participantName = route.params.participantName
    
    // 获取任务详情
    const taskResponse = await axios.get(`http://localhost:5000/api/tasks/${taskId}`)
    const task = taskResponse.data
    
    // 获取参与者信息
    participant.value = task.participants.find(p => p.name === participantName)
    
    // 获取提交记录
    const submissionsResponse = await axios.get(`http://localhost:5000/api/tasks/${taskId}/participant/${participantName}/submissions`)
    submissions.value = submissionsResponse.data
  } catch (err) {
    error.value = '获取数据失败，请稍后重试'
    console.error('获取数据失败:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchParticipantData)
</script> 
<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold">历史任务</h1>
    </div>

    <div v-if="loading" class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
    </div>
    <div v-else-if="error" class="text-red-500 text-center">
      {{ error }}
    </div>
    <div v-else>
      <div v-if="tasks.length === 0" class="text-center text-gray-500 py-8">
        暂无历史任务
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="task in tasks" :key="task.id"
             class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
             @click="viewTaskDetail(task)">
          <h2 class="text-xl font-semibold mb-3">{{ task.title }}</h2>
          <div class="text-sm text-gray-600 space-y-2">
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>积分: {{ task.points }}</span>
            </div>
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>参与人数: {{ task.participants.length }}</span>
            </div>
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>完成时间: {{ new Date(task.completed_at).toLocaleString() }}</span>
            </div>
          </div>
          <div class="mt-4 text-blue-500 text-sm flex items-center">
            点击查看详情
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务详情模态框 -->
    <div v-if="selectedTask"
         class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
         @click="closeTaskDetail">
      <div class="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
           @click.stop>
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">{{ selectedTask.title }}</h2>
            <button @click="closeTaskDetail"
                    class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="mb-6">
            <h3 class="text-lg font-medium mb-3">参与记录</h3>
            <div v-if="selectedTask.participants && selectedTask.participants.length > 0"
                 class="grid grid-cols-1 gap-4">
              <div v-for="participant in selectedTask.participants"
                   :key="participant.name"
                   class="bg-gray-50 p-4 rounded-lg">
                <div class="mb-3">
                  <h4 class="font-medium">{{ participant.name }}</h4>
                  <div class="text-sm text-gray-600">
                    <span class="mr-4">提交次数: {{ participant.submission_count }}</span>
                    <span>获得积分: {{ participant.points_earned || 0 }}</span>
                  </div>
                </div>

                <div v-if="participant.submissions && participant.submissions.length > 0"
                     class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div v-for="(submission, index) in participant.submissions"
                       :key="index"
                       class="relative group">
                    <template v-if="submission.image_urls && submission.image_urls.length">
                      <img v-for="(img, idx) in submission.image_urls"
                           :key="idx"
                           :src="img"
                           :alt="'提交截图 ' + (idx + 1)"
                           class="w-full h-48 object-cover rounded-lg cursor-pointer mb-2"
                           @click="showImagePreview(img)" />
                    </template>
                    <template v-else>
                      <img v-if="submission.image_url"
                           :src="submission.image_url"
                           :alt="'提交截图 ' + (index + 1)"
                           class="w-full h-48 object-cover rounded-lg cursor-pointer"
                           @click="showImagePreview(submission.image_url)" />
                    </template>
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg"></div>
                    <div class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      第 {{ index + 1 }} 次提交
                    </div>
                  </div>
                </div>
                <div v-else class="text-gray-500 text-center py-2">
                  暂无提交记录
                </div>
              </div>
            </div>
            <div v-else class="text-gray-500 text-center py-4">
              暂无参与记录
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <div v-if="previewImage"
         class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
         @click="closeImagePreview">
      <div class="relative max-w-4xl max-h-[90vh] p-4">
        <img :src="previewImage"
             class="max-w-full max-h-[80vh] object-contain"
             @click.stop />
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/utils/api.js'

const router = useRouter()
const tasks = ref([])
const loading = ref(true)
const error = ref(null)
const previewImage = ref(null)
const selectedTask = ref(null)

const fetchTasks = async () => {
  loading.value = true
  error.value = null
  try {
    console.log('开始获取历史任务 (管理员)...')
    const response = await apiClient.get('/api/admin/tasks/completed')
    console.log('获取到的历史任务数据:', response.data)
    tasks.value = response.data
  } catch (err) {
    console.error('获取历史任务失败:', err)
    error.value = err.response?.data?.error || '获取历史任务失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const viewTaskDetail = (task) => {
  selectedTask.value = task
}

const closeTaskDetail = () => {
  selectedTask.value = null
}

const showImagePreview = (url) => {
  previewImage.value = url
}

const closeImagePreview = () => {
  previewImage.value = null
}

onMounted(fetchTasks)
</script>

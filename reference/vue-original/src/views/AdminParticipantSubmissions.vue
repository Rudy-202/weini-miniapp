<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ participantName }} - 提交详情</h1>
      <button @click="goBack" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors">
        返回
      </button>
    </div>

    <div v-if="loading" class="text-center">
      <Spinner />
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>
    <div v-else-if="error" class="text-red-500 bg-red-100 p-4 rounded-lg">
      {{ error }}
    </div>
    <div v-else-if="submissions.length === 0" class="text-center text-gray-500">
      该用户还没有提交任何内容。
    </div>
    <div v-else>
      <div class="mb-6 p-4 bg-gray-50 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-2">任务: {{ taskTitle }}</h2>
        <p class="text-gray-700">参与者: {{ participantName }}</p>
        <p class="text-gray-700">总提交次数: {{ submissions.length }}</p>
      </div>

      <div class="space-y-6">
        <div v-for="(submission, index) in submissions" :key="submission.id || index"
             class="bg-white rounded-lg shadow-md p-6 relative"
             :class="{ 'border-2 border-red-500': submission.is_abnormal }">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-sm text-gray-500">提交时间: {{ formatDate(submission.submitted_at) }}</p>
              <p class="text-sm text-gray-500">获得积分: {{ submission.points_earned }}</p>
              <p v-if="submission.comment" class="text-sm text-gray-600 mt-1">
                备注: {{ submission.comment }}
              </p>
            </div>
            <div>
              <span v-if="submission.is_abnormal" class="text-red-500 font-bold text-sm py-1 px-2 rounded-full bg-red-100">已标记异常</span>
              <button v-else
                      @click="markAsAbnormal(submission)"
                      class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-xs transition-colors">
                标记异常
              </button>
            </div>
          </div>

          <!-- 图片缩略图展示 -->
          <div v-if="submission.image_urls && submission.image_urls.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div v-for="(imageUrl, imgIndex) in submission.image_urls" :key="imgIndex" class="relative aspect-square">
              <img :src="imageUrl"
                   alt="提交的图片"
                   class="w-full h-full object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                   @click="showImagePreview(imageUrl)">
            </div>
          </div>
          <div v-else class="text-sm text-gray-400">
            没有图片。
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <ImagePreviewModal :show="isPreviewVisible" :image-url="previewImageUrl" @close="closeImagePreview" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/utils/api.js'
import Spinner from '@/components/Spinner.vue'
import ImagePreviewModal from '@/components/ImagePreviewModal.vue'

const route = useRoute()
const router = useRouter()

const submissions = ref([])
const taskTitle = ref('')
const participantName = ref(route.params.participantName)
const loading = ref(true)
const error = ref('')

const isPreviewVisible = ref(false)
const previewImageUrl = ref('')

const formatDate = (dateString) => {
  if (!dateString) return '未知时间'
  return new Date(dateString).toLocaleString('zh-CN')
}

const fetchSubmissions = async () => {
  loading.value = true
  error.value = ''
  try {
    const taskId = route.params.taskId
    const response = await apiClient.get(`/api/admin/tasks/${taskId}/participant/${participantName.value}/submissions`)
    submissions.value = response.data

    try {
      const taskResponse = await apiClient.get(`/api/admin/tasks/${taskId}`)
      taskTitle.value = taskResponse.data.title
    } catch (taskErr) {
      console.warn('获取任务标题失败:', taskErr)
      taskTitle.value = '未知任务'
    }

  } catch (err) {
    console.error('获取提交记录失败:', err)
    error.value = err.message || err.response?.data?.error || '获取提交记录失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

const markAsAbnormal = async (submission) => {
  if (!submission || !submission.id) {
    alert('提交记录ID不存在，无法标记。')
    return
  }
  if (confirm('确定要将此提交标记为异常吗？相关积分将会被扣除。')) {
    try {
      const taskId = route.params.taskId
      await apiClient.post(`/api/admin/tasks/${taskId}/submissions/${submission.id}/abnormal`)
      alert('标记成功！')
      await fetchSubmissions()
    } catch (err) {
      console.error('标记异常失败:', err)
      alert(err.message || err.response?.data?.error || '标记异常失败，请稍后重试。')
    }
  }
}

const showImagePreview = (url) => {
  previewImageUrl.value = url
  isPreviewVisible.value = true
}

const closeImagePreview = () => {
  isPreviewVisible.value = false
  previewImageUrl.value = ''
}

const goBack = () => {
  if (route.meta.from === 'AdminTaskDetail') {
      router.push(`/admin/task/${route.params.taskId}`)
  } else {
      router.push('/admin')
  }
}

onMounted(() => {
  fetchSubmissions()
})
</script>

<style scoped>
/* 根据需要添加样式 */
.aspect-square {
  aspect-ratio: 1 / 1;
}
</style>

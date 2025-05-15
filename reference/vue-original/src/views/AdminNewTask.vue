<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">发布新任务</h1>

      <div class="bg-white p-6 rounded-lg shadow">
        <form @submit.prevent="submitTask" class="space-y-4">
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" for="title">
              任务标题
            </label>
            <input
              id="title"
              v-model="task.title"
              type="text"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="请输入任务标题"
              required
            >
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" for="description">
              任务描述
            </label>
            <textarea
              id="description"
              v-model="task.description"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="4"
              placeholder="请输入任务描述"
              required
            ></textarea>
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" for="points">
              积分奖励
            </label>
            <input
              id="points"
              v-model.number="task.points"
              type="number"
              min="1"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="请输入积分奖励"
              required
            >
          </div>

          <!-- Comment out this entire div to hide the leaderboard image functionality -->
          <!--
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" for="leaderboard_image_file">
              排行榜背景图片 (可选)
            </label>
            <input
              id="leaderboard_image_file"
              type="file"
              @change="handleFileChange"
              accept="image/png, image/jpeg, image/gif"
              class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            >
            <p v-if="uploadingImage" class="text-sm text-blue-500 mt-1">图片上传中...</p>
            <p v-if="uploadError" class="text-sm text-red-500 mt-1">{{ uploadError }}</p>
            <div v-if="task.leaderboard_image_url" class="mt-2">
              <p class="text-sm text-green-600">当前背景图:</p>
              <img :src="getImageFullUrl(task.leaderboard_image_url)" alt="排行榜背景" class="max-h-40 rounded mt-1 border">
              <div class="flex items-center justify-between mt-1">
                <p class="text-xs text-gray-500 break-all">{{ task.leaderboard_image_url }}</p>
                <button
                  type="button"
                  @click="clearLeaderboardImage"
                  class="ml-2 text-xs text-red-500 hover:text-red-700 focus:outline-none"
                >
                  移除图片
                </button>
              </div>
            </div>
          </div>
          -->

          <div class="flex justify-end space-x-4">
            <router-link
              to="/admin"
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              取消
            </router-link>
            <button
              type="submit"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              :disabled="submitting"
            >
              {{ submitting ? '发布中...' : '发布任务' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/utils/api.js'

const router = useRouter()
const submitting = ref(false)
const uploadingImage = ref(false)
const uploadError = ref(null)

const task = ref({
  title: '',
  description: '',
  points: 1,
  leaderboard_image_url: ''
})

const getImageFullUrl = (relativeUrl) => {
  if (!relativeUrl) return '';
  const base = apiClient.defaults.baseURL.replace(/\/+$/, '');
  const path = relativeUrl.replace(/^\/+/, '');
  return `${base}/${path}`;
}

const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) {
    uploadError.value = null;
    return
  }

  await uploadLeaderboardImage(file)
}

const uploadLeaderboardImage = async (file) => {
  if (!file) return

  uploadingImage.value = true
  uploadError.value = null
  const formData = new FormData()
  formData.append('leaderboard_image', file)

  try {
    const response = await apiClient.post('/api/admin/upload_leaderboard_image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    task.value.leaderboard_image_url = response.data.image_url
    console.log('图片上传成功:', response.data.image_url)
  } catch (err) {
    console.error('图片上传失败:', err)
    uploadError.value = err.response?.data?.error || err.message || '图片上传失败'
    task.value.leaderboard_image_url = ''
  } finally {
    uploadingImage.value = false
  }
}

const clearLeaderboardImage = () => {
  task.value.leaderboard_image_url = ''
  uploadError.value = null
  uploadingImage.value = false
  const fileInput = document.getElementById('leaderboard_image_file');
  if (fileInput) {
    fileInput.value = "";
  }
  console.log('排行榜背景图片已清除');
}

const submitTask = async () => {
  if (submitting.value) return

  submitting.value = true
  try {
    console.log('提交任务数据:', task.value)
    const response = await apiClient.post('/api/admin/tasks', task.value)
    console.log('任务创建响应:', response.data)
    alert('任务发布成功！')
    router.push('/admin')
  } catch (err) {
    console.error('发布任务失败:', err)
    alert(err.message || err.response?.data?.error || '发布任务失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

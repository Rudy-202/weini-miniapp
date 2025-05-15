<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center space-x-4">
        <h1 class="text-2xl font-bold">任务详情</h1>
        <div v-if="task" class="flex items-center space-x-2">
          <span v-if="task.flame_mode_enabled" class="text-orange-500 text-2xl">🔥</span>
          <span v-if="task.flame_mode_enabled" class="text-orange-500 font-medium">浴火模式</span>
          <span v-if="task.time_limit_mode" class="text-blue-500 text-2xl">⏰</span>
          <span v-if="task.time_limit_mode" class="text-blue-500 font-medium">限时模式</span>
        </div>
      </div>
      <button @click="router.push('/fan/entry')"
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

    <div v-else-if="task">
      <!-- 任务信息 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6"
           :class="{
             'flame-mode': task.flame_mode_enabled,
             'time-limit-mode': task.time_limit_mode
           }">
        <h2 class="text-xl font-semibold mb-4">
          {{ task.title }}
          <span v-if="task.display_focus_icon" class="ml-2 text-yellow-500" title="焦点任务">{{ task.display_focus_icon }}</span>
        </h2>
        <p class="text-gray-600 mb-4">{{ task.description }}</p>

        <!-- 新增：限时任务的详细信息展示 -->
        <div v-if="task.time_limit_mode" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p class="font-semibold text-blue-700">类型: 限时任务</p>
          <p><span class="font-medium">截止时间:</span> {{ formatDate(task.due_date) }}</p>
          <p v-if="task.status === 'active' && !getCountdown(task.due_date).expired">
            <span class="font-medium">剩余时间:</span> <span class="text-blue-600 font-semibold">{{ getCountdown(task.due_date).text }}</span>
          </p>
          <p v-else-if="getCountdown(task.due_date).expired">
            <span class="font-medium text-red-600">状态: 已截止</span>
          </p>
          <p v-if="task.bonus_points > 0"><span class="font-medium">按时奖励:</span> +{{ task.bonus_points }} 积分</p>
          <p class="mt-1 text-xs text-gray-600">请注意：这是一个限时任务，请在规定时间内完成以获得额外奖励。</p>
        </div>

        <!-- NEW: Phased Task Display -->
        <!-- REMOVE: Phase display section
        <div v-if=\"task.task_type === 'phased' && task.phases && task.phases.length > 0\" class=\"mt-6 mb-6\">\n          <h3 class=\"text-lg font-semibold mb-3 border-b pb-2\">任务阶段</h3>\n          <div class=\"space-y-3\">\n            <div v-for=\"(phase, index) in task.phases\"\n                 :key=\"phase.phase_id\"\n                 class=\"p-4 rounded-lg border transition-all duration-300 ease-in-out\"\n                 :class=\"{...}\"> \n              <div class=\"flex justify-between items-center mb-1\">\n                <h4 class=\"font-semibold text-md\">{{ phase.name || `阶段 ${index + 1}` }}</h4>\n                <span class=\"text-sm font-medium px-2 py-0.5 rounded-full\" :class=\"{...}\">\n                  {{ phase.fan_status === 'completed' ? '已完成' : ... }}\n                </span>\n              </div>\n              <p class=\"text-xs text-gray-500 mb-2\">ID: {{ phase.phase_id }} | Order: {{ phase.order }}</p> \n              <p class=\"text-sm text-gray-700 mb-2\">{{ phase.description }}</p>\n              <p class=\"text-sm font-semibold text-indigo-600\">完成此阶段可获得: {{ phase.points }} 积分</p>\n              <img v-if=\"phase.image_url\" :src=\"phase.image_url\" alt=\"Phase image\" class=\"mt-2 rounded max-h-40\">\n            </div>\n          </div>\n           <div class=\"mt-4 text-sm text-gray-700\">\n             <p>您已完成 <span class=\"font-bold\">{{ task.fan_completed_phase_ids?.length || 0 }} / {{ task.phases?.length || 0 }}</span> 个阶段。</p>\n             <p>当前阶段任务总积分: <span class=\"font-bold text-lg text-green-600\">{{ task.fan_total_points_for_task || 0 }}</span> 积分。</p>\n           </div>\n        </div>
        -->
        <!-- END: Phased Task Display -->

        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-gray-600">任务积分</p>
            <p class="font-medium">
              <template v-if="task.is_focus_task">
                <span>
                  ({{ task.points }}
                  <span v-if="task.bonus_points > 0">+{{ task.bonus_points }}</span>)
                  ×2 = <span class="text-pink-500">{{ (Number(task.points) + Number(task.bonus_points || 0)) * 2 }}</span> 分
                  <span class="text-xs text-pink-500 ml-1">（焦点任务双倍积分）</span>
                </span>
              </template>
              <template v-else>
                <span>
                  {{ task.points }}
                  <span v-if="task.bonus_points > 0">+{{ task.bonus_points }}</span>
                  = <span class="text-blue-500">{{ Number(task.points) + Number(task.bonus_points || 0) }}</span> 分
                  <span v-if="task.bonus_points > 0" class="text-xs text-blue-500 ml-1">（含限时奖励）</span>
                </span>
              </template>
            </p>
          </div>
          <div>
            <p class="text-gray-600">创建时间</p>
            <p class="font-medium">{{ formatDate(task.created_at) }}</p>
          </div>
        </div>
      </div>

      <!-- 提交表单 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4">提交任务</h3>
        <div v-if="task.flame_mode_enabled" class="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p class="text-orange-700">🔥 浴火模式已开启：您可以多次提交此任务</p>
        </div>
        <form @submit.prevent="submitTask" class="space-y-4">
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" for="nickname">
              您的昵称
            </label>
            <input type="text"
                   id="nickname"
                   v-model="submission.nickname"
                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                   required
                   placeholder="请输入您的昵称">
          </div>
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" for="imageUI">
              上传截图 <span class="text-xs font-normal text-gray-500">(最多5张图片)</span>
            </label>
            <!-- Hidden actual file input -->
            <input type="file"
                   id="image"
                   ref="fileInput"
                   accept="image/*"
                   @change="handleImageUpload"
                   class="hidden">

            <button type="button" @click="triggerFileInput"
                    class="mb-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :disabled="submission.images.length >= 5 || submitting">
              {{ submission.images.length >= 5 ? '已达数量上限' : '添加图片' }} ({{ submission.images.length }}/5)
            </button>

            <!-- Image previews -->
            <div v-if="submission.images.length > 0" class="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              <div v-for="(imageObject, index) in submission.images" :key="index" class="relative group">
                <img :src="getImagePreviewUrl(imageObject)" :alt="'预览 ' + (index + 1)" class="w-full h-24 object-cover rounded-lg border">
                <button @click="removeImage(index)"
                        type="button"
                        class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 text-xs w-5 h-5 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-opacity"
                        :disabled="submitting">
                  &times;
                </button>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" for="comment">
              备注说明
            </label>
            <textarea id="comment"
                      v-model="submission.comment"
                      class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="请输入备注说明（选填）"></textarea>
          </div>
          <div class="flex justify-end">
            <button type="submit"
                    class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors text-base font-medium"
                    :disabled="submitting ||
                               submission.images.length === 0 ||
                               (task.time_limit_mode && getCountdown(task.due_date).expired)">
              {{ submitting ? '提交中...' :
                 (task.time_limit_mode && getCountdown(task.due_date).expired) ? '已截止' : '提交任务'
              }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 提示对话框 -->
    <div v-if="showDialog"
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
        <div class="text-xl font-semibold mb-4 dark:text-gray-100">提示</div>
        <div class="text-gray-600 dark:text-gray-300 mb-6">{{ dialogMessage }}</div>
        <div class="flex justify-end">
          <button @click="closeDialog"
                  class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            确定
          </button>
        </div>
      </div>
    </div>

    <!-- 鼓励弹窗 -->
    <div v-if="showEncouragementModal"
         class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md text-center">
        <img
          v-if="globalEncouragement.image_url"
          :src="getEncouragementImageUrl(globalEncouragement.image_url)"
          alt="鼓励图片"
          class="max-h-60 w-auto object-contain mx-auto mb-4 rounded-md"
        />
        <p class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{{ globalEncouragement.message || '任务完成！' }}</p>
        <button @click="closeEncouragementAndNavigate"
                class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-lg">
          太棒了！查看排行
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '@/utils/api'
import FlameAnimation from '../components/FlameAnimation.vue'

const router = useRouter()
const route = useRoute()
const taskId = route.params.id

const task = ref(null)
const loading = ref(true)
const error = ref(null)
const submitting = ref(false)

const submission = ref({
  nickname: localStorage.getItem('fanNickname') || '',
  images: [],
  comment: ''
})

const showDialog = ref(false)
const dialogMessage = ref('')
const fileInput = ref(null)

const showEncouragementModal = ref(false)
const globalEncouragement = ref({
  image_url: null,
  message: ''
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const options = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }
  try {
    return new Date(dateString).toLocaleString('zh-CN', options)
  } catch (e) {
    console.warn('Error formatting date in TaskDetail:', e, dateString)
    return dateString // Fallback
  }
}

const getCountdown = (dueDateString) => {
  if (!task.value || !dueDateString) return { text: 'N/A', expired: true, timestamp: 0 }

  const now = new Date().getTime()
  const dueDate = new Date(dueDateString).getTime()
  const diff = dueDate - now

  if (diff <= 0) {
    return { text: '已截止', expired: true, timestamp: diff }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  let text = ''
  if (days > 0) text += `${days}天 `
  if (hours > 0 || days > 0) text += `${hours}小时 `
  if (minutes > 0 || hours > 0 || days > 0) text += `${minutes}分 `
  text += `${seconds}秒`

  return { text: text.trim(), expired: false, timestamp: diff }
}

const showErrorDialog = (message) => {
  dialogMessage.value = message
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  dialogMessage.value = ''
}

const fetchTaskDetails = async () => {
  loading.value = true
  error.value = null

  // 从localStorage获取粉丝信息
  const fanInfo = localStorage.getItem('fanInfo')
  if (!fanInfo) {
    error.value = '无法获取用户信息，请确保已正确登录。'
    loading.value = false
    return
  }

  const { invite_code: fanInviteCode, nickname: fanNickname } = JSON.parse(fanInfo)
  // 预填表单
  submission.value.nickname = fanNickname || ''

  if (!fanInviteCode) {
    error.value = '无法获取邀请码，请确保已正确登录。'
    loading.value = false
    return
  }

  try {
    const response = await apiClient.get(`/api/fan/task-status/${taskId}`, {
      params: {
        nickname: fanNickname || '',
        invite_code: fanInviteCode
      }
    })
    task.value = response.data

  } catch (err) {
    console.error('获取任务详情失败:', err)
    error.value = err.response?.data?.error || '获取任务详情失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const triggerFileInput = () => {
  if (submission.value.images.length >= 5) {
    showErrorDialog('最多只能选择5张图片。')
    return
  }
  fileInput.value.click()
}

const handleImageUpload = async (event) => {
  const files = Array.from(event.target.files)
  event.target.value = null

  if (files.length === 0) return

  const totalAfterAdd = submission.value.images.length + files.length
  if (totalAfterAdd > 5) {
    showErrorDialog(`您最多还能选择 ${5 - submission.value.images.length} 张图片。本次选择 ${files.length} 张已超出限制。`)
    return
  }

  for (const file of files) {
    submission.value.images.push({
      file: file,
      previewUrl: URL.createObjectURL(file)
    })
  }
}

const removeImage = (index) => {
  if (submission.value.images[index]) {
    URL.revokeObjectURL(submission.value.images[index].previewUrl)
    submission.value.images.splice(index, 1)
  }
}

const getImagePreviewUrl = (imageObject) => {
  return imageObject.previewUrl
}

const submitTask = async () => {
  submitting.value = true
  error.value = null
  showDialog.value = false

  // 从localStorage获取粉丝信息
  const fanInfo = localStorage.getItem('fanInfo')
  if (!fanInfo) {
    dialogMessage.value = '用户信息丢失，无法提交任务。请重新登录。'
    showDialog.value = true
    submitting.value = false
    return
  }

  const { invite_code: fanInviteCode, nickname: savedNickname } = JSON.parse(fanInfo)

  // 使用保存的昵称或表单中的昵称
  if (!submission.value.nickname) {
    submission.value.nickname = savedNickname || ''
  }

  if (!submission.value.nickname) {
    dialogMessage.value = '请输入您的昵称。'
    showDialog.value = true
    submitting.value = false
    return
  }
  if (submission.value.images.length === 0) {
    dialogMessage.value = '请至少上传一张图片。'
    showDialog.value = true
    submitting.value = false
    return
  }

  const formData = new FormData()
  formData.append('nickname', submission.value.nickname)
  formData.append('comment', submission.value.comment)
  formData.append('invite_code', fanInviteCode)

  submission.value.images.forEach(imageObject => {
    formData.append('images', imageObject.file)
  })

  try {
    const response = await apiClient.post(`/api/tasks/${taskId}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // 更新粉丝信息到localStorage
    const updatedFanInfo = {
      nickname: submission.value.nickname,
      invite_code: fanInviteCode
    }
    localStorage.setItem('fanInfo', JSON.stringify(updatedFanInfo))

    // 获取任务积分
    const taskPoints = task.value.points || 0

    // 使用查询参数重定向到粉丝主页，并触发鼓励弹窗
    router.push({
      path: '/fan/home',
      query: {
        taskCompleted: 'true',
        taskId: taskId,
        points: taskPoints
      }
    })
  } catch (err) {
    console.error('提交任务失败:', err)
    if (err.response?.status === 413) {
      showErrorDialog('图片文件太大，请压缩后重试')
    } else if (err.response?.status === 415) {
      showErrorDialog('只支持 JPG、PNG 和 GIF 格式的图片')
    } else {
      showErrorDialog(err.response?.data?.error || '提交失败，请稍后重试')
    }
  } finally {
    submitting.value = false
  }
}

const fetchAndShowEncouragement = async () => {
  try {
    const response = await apiClient.get('/api/global-encouragement-settings')
    if (response.data) {
      globalEncouragement.value.image_url = response.data.default_encouragement_image_url || null
      globalEncouragement.value.message = response.data.default_encouragement_message || '任务成功完成！太棒了！'
    }
  } catch (err) {
    console.error('获取全局鼓励设置失败:', err)
    globalEncouragement.value.message = '任务成功完成！太棒了！'
    globalEncouragement.value.image_url = null
  } finally {
    showEncouragementModal.value = true
    submitting.value = false
  }
}

const getEncouragementImageUrl = (relativePath) => {
  if (!relativePath) return ''
  if (relativePath.startsWith('http')) {
    return relativePath
  }
  const base = apiClient.defaults.baseURL || ''
  return `${base}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`
}

const closeEncouragementAndNavigate = () => {
  showEncouragementModal.value = false
  router.push({ name: 'TaskLeaderboard', params: { taskId: route.params.id }, query: { invite_code: localStorage.getItem('fanInviteCode'), fan_nickname: submission.value.nickname } })
}

onMounted(() => {
  fetchTaskDetails()
})
</script>

<style scoped>
.flame-mode {
  @apply border-2 border-orange-500;
  background: linear-gradient(to bottom right, #fff, #fff5f0);
}

.time-limit-mode {
  @apply border-2 border-blue-500;
  background: linear-gradient(to bottom right, #fff, #f0f5ff);
}
</style>

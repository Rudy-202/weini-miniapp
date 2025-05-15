<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">粉丝入口</h1>
        <p class="text-gray-500 mt-2">输入信息开始应援之旅</p>
      </div>

      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">昵称</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input v-model="nickname"
                   type="text"
                   class="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                   placeholder="请输入您的昵称" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">邀请码</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <input v-model="inviteCode"
                   type="text"
                   class="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                   placeholder="请输入站子提供的邀请码" />
          </div>
        </div>

        <button @click="continueToFanHome"
                class="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2.5 rounded-lg hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 shadow-md hover:shadow-lg">
          开始应援之旅
        </button>

        <div class="mt-4 text-center">
          <a @click="goBack" class="text-sm text-gray-500 hover:text-pink-500 cursor-pointer transition-colors">
            <span class="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回主页
            </span>
          </a>
        </div>
      </div>

      <div v-if="error" class="mt-6 p-3 bg-red-50 border border-red-200 text-red-500 text-sm rounded-lg">
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {{ error }}
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
const nickname = ref('')
const inviteCode = ref('')
const error = ref('')

onMounted(() => {
  // 检查是否已有保存的信息
  const fanInfo = localStorage.getItem('fanInfo')
  if (fanInfo) {
    const { nickname: savedNickname, invite_code: savedInviteCode } = JSON.parse(fanInfo)
    nickname.value = savedNickname || ''
    inviteCode.value = savedInviteCode || ''
  }
})

const continueToFanHome = async () => {
  if (!nickname.value || !inviteCode.value) {
    error.value = '请填写完整信息'
    return
  }

  error.value = ''
  try {
    // 验证邀请码
    const response = await apiClient.post('/api/fans/validate-invite-code', {
      nickname: nickname.value,
      invite_code: inviteCode.value
    })

    // 保存粉丝信息到本地存储
    localStorage.setItem('fanInfo', JSON.stringify({
      nickname: nickname.value,
      invite_code: inviteCode.value
    }))

    // 重定向到粉丝主页
    router.push('/fan/home')
  } catch (err) {
    console.error('验证失败:', err)
    error.value = err.response?.data?.message || '邀请码验证失败，请检查后重试'
  }
}

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
/* 添加过渡效果 */
.min-h-screen {
  transition: background 0.5s ease;
}

input, button {
  transition: all 0.3s ease;
}

/* 设置按钮点击效果 */
button {
  position: relative;
  overflow: hidden;
}

button::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 10%, transparent 10.01%);
  background-repeat: no-repeat;
  background-position: 50%;
  transform: scale(10, 10);
  opacity: 0;
  transition: transform 0.5s, opacity 0.5s;
}

button:active::after {
  transform: scale(0, 0);
  opacity: 0.3;
  transition: 0s;
}
</style>

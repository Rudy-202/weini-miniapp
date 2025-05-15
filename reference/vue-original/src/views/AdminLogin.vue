<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h1 class="text-2xl font-bold mb-6 text-center">站子登录</h1>
      <form v-if="!showRegister" @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">邮箱</label>
          <input type="email"
                 v-model="email"
                 required
                 class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500">
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">密码</label>
          <input type="password"
                 v-model="password"
                 required
                 class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500">
        </div>
        <button type="submit"
                class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
                :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <div v-if="error" class="mt-4 text-red-500 text-center">
          {{ error }}
        </div>
        <div class="mt-4 text-center">
          <button type="button" class="text-blue-500 hover:underline" @click="showRegister = true">没有账号？去注册</button>
        </div>
      </form>
      <form v-else @submit.prevent="handleRegister">
        <h2 class="text-xl font-bold mb-4 text-center">站子注册</h2>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">邮箱</label>
          <input type="email"
                 v-model="registerEmail"
                 required
                 class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500">
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">密码</label>
          <input type="password"
                 v-model="registerPassword"
                 required
                 class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500">
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">确认密码</label>
          <input type="password"
                 v-model="registerPasswordConfirm"
                 required
                 class="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500">
        </div>
        <button type="submit"
                class="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors"
                :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
        <div v-if="registerError" class="mt-4 text-red-500 text-center">
          {{ registerError }}
        </div>
        <div class="mt-4 text-center">
          <button type="button" class="text-blue-500 hover:underline" @click="showRegister = false">已有账号？去登录</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/utils/api.js'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const showRegister = ref(false)
const registerEmail = ref('')
const registerPassword = ref('')
const registerPasswordConfirm = ref('')
const registerError = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    if (!email.value || !email.value.trim()) {
      error.value = '请输入邮箱'
      return
    }
    if (!password.value || !password.value.trim()) {
      error.value = '请输入密码'
      return
    }
    localStorage.removeItem('admin_token')
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('token_expires_at')
    const response = await apiClient.post('/api/admin/login', {
      email: email.value.trim(),
      password: password.value.trim()
    })
    if (!response.data.token) {
      error.value = '登录失败：服务器未返回有效的认证信息'
      return
    }
    const expiresAt = Date.now() + (response.data.expires_in * 1000)
    localStorage.setItem('admin_token', response.data.token)
    localStorage.setItem('isAdmin', 'true')
    localStorage.setItem('token_expires_at', expiresAt.toString())
    const redirect = router.currentRoute.value.query.redirect || '/admin/task-list'
    await router.replace(redirect)
  } catch (err) {
    error.value = err.response?.data?.error || '登录失败，请检查邮箱和密码'
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  loading.value = true
  registerError.value = ''
  try {
    if (!registerEmail.value || !registerEmail.value.trim()) {
      registerError.value = '请输入邮箱'
      return
    }
    if (!registerPassword.value || !registerPasswordConfirm.value) {
      registerError.value = '请输入密码并确认'
      return
    }
    if (registerPassword.value !== registerPasswordConfirm.value) {
      registerError.value = '两次输入的密码不一致'
      return
    }
    // 调用后端注册接口
    await apiClient.post('/api/admin/register', {
      email: registerEmail.value.trim(),
      password: registerPassword.value
    })
    // 注册成功后自动跳转到登录页
    showRegister.value = false
    email.value = registerEmail.value
    password.value = ''
    registerPassword.value = ''
    registerPasswordConfirm.value = ''
    registerError.value = ''
  } catch (err) {
    registerError.value = err.response?.data?.error || '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

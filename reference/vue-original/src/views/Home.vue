<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ currentInviteCode ? `任务列表 (邀请码: ${currentInviteCode})` : '请输入邀请码查看任务' }}</h1>
      <!-- 可以保留排行榜按钮，或者根据需要调整 -->
      <button v-if="currentInviteCode" @click="router.push('/leaderboard')"
              class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition-colors">
        总排行榜
      </button>
    </div>

    <!-- 错误提示区 -->
    <div v-if="error && !isLoadingInviteCode && !isLoadingTasks" class="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
      <p>{{ error }}</p>
    </div>

    <!-- 邀请码管理区 -->
    <div class="mb-8 p-6 bg-white shadow-lg rounded-lg">
      <div v-if="!currentInviteCode || showInviteForm">
        <h2 class="text-xl font-semibold mb-4">输入邀请码</h2>
        <form @submit.prevent="verifyAndSetInviteCode" class="flex flex-col sm:flex-row gap-4 items-center">
          <input type="text"
                 v-model="inviteCodeInput"
                 placeholder="请输入邀请码"
                 required
                 class="flex-grow w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 :disabled="isLoadingInviteCode">
          <button type="submit"
                  class="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center"
                  :disabled="isLoadingInviteCode || !inviteCodeInput.trim()">
            <svg v-if="isLoadingInviteCode" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoadingInviteCode ? '验证中...' : '提交验证' }}
          </button>
        </form>
      </div>

      <div v-if="currentInviteCode && !showInviteForm" class="mt-4 flex flex-col sm:flex-row justify-between items-center p-4 bg-green-50 rounded-md">
        <p class="text-green-700 font-medium mb-2 sm:mb-0">
          当前生效邀请码: <span class="font-bold text-lg">{{ currentInviteCode }}</span>
        </p>
        <button @click="clearInviteCode"
                class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md shadow-sm transition-colors">
          更换邀请码
        </button>
      </div>
    </div>

    <!-- 任务列表展示区 -->
    <div v-if="currentInviteCode && !error">
      <div v-if="isLoadingTasks" class="text-center py-10">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">任务加载中...</p>
      </div>
      <div v-else>
        <div v-if="tasks.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TaskCard v-for="task in tasks" :key="task.id" :task="task" @view-detail="viewTaskDetail" />
        </div>
        <div v-else-if="!isLoadingTasks && !error" class="text-center py-10">
          <p class="text-gray-500 text-xl">此邀请码下暂无任务，或所有任务已完成。</p>
          <p class="text-gray-400 mt-2">您可以尝试更换邀请码或等待新的任务发布。</p>
        </div>
      </div>
    </div>
    <div v-else-if="!currentInviteCode && !error && !isLoadingInviteCode" class="text-center py-10">
        <p class="text-gray-500 text-xl">请输入有效的邀请码以开始。</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/utils/api.js'
import TaskCard from '../components/TaskCard.vue'

const router = useRouter()
const tasks = ref([])
const inviteCodeInput = ref('')
const currentInviteCode = ref('')
const isLoadingTasks = ref(false)
const isLoadingInviteCode = ref(false)
const error = ref('')
const showInviteForm = ref(true)

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

const fetchTasks = async (inviteCodeToUse) => {
  if (!inviteCodeToUse) {
    tasks.value = [];
    isLoadingTasks.value = false;
    return;
  }
  isLoadingTasks.value = true;
  error.value = null;
  try {
    const response = await apiClient.get(`/api/tasks?invite_code=${inviteCodeToUse}`);
    tasks.value = response.data.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB - dateA;
    });
    console.log('Home.vue - Final tasks for rendering:', JSON.parse(JSON.stringify(tasks.value)));
    if (tasks.value.length === 0) {
    }
  } catch (err) {
    console.error('获取任务列表失败:', err);
    tasks.value = [];
    error.value = err.response?.data?.error || err.message || '获取任务列表失败，请检查邀请码或稍后重试';
  } finally {
    isLoadingTasks.value = false;
  }
};

const verifyAndSetInviteCode = async () => {
  if (!inviteCodeInput.value.trim()) {
    error.value = '请输入邀请码。';
    return;
  }
  isLoadingInviteCode.value = true;
  error.value = '';
  tasks.value = [];
  try {
    const response = await apiClient.post('/api/fans/verify-invite-code', {
      invite_code: inviteCodeInput.value.trim()
    });
    if (response.data && response.data.valid) {
      const verifiedCode = response.data.invite_code;
      localStorage.setItem('fanInviteCode', verifiedCode);
      currentInviteCode.value = verifiedCode;
      showInviteForm.value = false;
      inviteCodeInput.value = '';
      await fetchTasks(verifiedCode);
    } else {
      localStorage.removeItem('fanInviteCode');
      currentInviteCode.value = '';
      error.value = response.data?.message || '邀请码无效或已过期。';
      showInviteForm.value = true;
    }
  } catch (err) {
    localStorage.removeItem('fanInviteCode');
    currentInviteCode.value = '';
    error.value = err.response?.data?.error || err.message || '邀请码验证失败，请重试。';
    showInviteForm.value = true;
    console.error('验证邀请码失败:', err);
  } finally {
    isLoadingInviteCode.value = false;
  }
};

const clearInviteCode = () => {
  localStorage.removeItem('fanInviteCode');
  currentInviteCode.value = '';
  inviteCodeInput.value = '';
  tasks.value = [];
  showInviteForm.value = true;
  error.value = '';
};

const viewTaskDetail = (task) => {
  router.push(`/task/${task.id}`)
}

onMounted(() => {
  const savedInviteCode = localStorage.getItem('fanInviteCode');
  if (savedInviteCode) {
    currentInviteCode.value = savedInviteCode;
    showInviteForm.value = false;
    fetchTasks(savedInviteCode);
  } else {
    showInviteForm.value = true;
    tasks.value = [];
  }
});
</script>


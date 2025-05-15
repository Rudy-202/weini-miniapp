<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 pb-12">
    <!-- 顶部导航栏 -->
    <div class="bg-white bg-opacity-90 backdrop-blur-sm shadow-md">
      <div class="container mx-auto px-4 py-3">
        <div class="flex justify-between items-center">
          <!-- 左侧Logo/标题 -->
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 class="ml-2 text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              应援星球
            </h1>
          </div>

          <!-- 右侧用户信息 -->
          <div class="flex items-center">
            <span class="text-gray-600 mr-4">
              Hello, {{ nickname }}
            </span>
            <button @click="logout" class="text-sm text-gray-500 hover:text-pink-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              退出
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="container mx-auto px-4 py-6">
      <!-- 标签页切换 -->
      <div class="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-md mb-6">
        <div class="flex">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="activeTab = tab.value"
            class="flex-1 py-3 text-center relative"
            :class="[
              activeTab === tab.value
                ? 'text-pink-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            {{ tab.label }}
            <div
              v-if="activeTab === tab.value"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-400 to-purple-500"
            ></div>
          </button>
        </div>
      </div>

      <!-- 任务列表Tab -->
      <div v-if="activeTab === 'tasks'" class="space-y-6">
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>

        <div v-else-if="error" class="bg-red-50 p-4 rounded-lg text-red-500 text-center">
          <p class="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {{ error }}
          </p>
        </div>

        <div v-else-if="!tasks.length" class="text-center py-12">
          <div class="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="mt-4 text-gray-500">暂时没有任务哦~</p>
        </div>

        <div v-else>
          <!-- 焦点任务区域 -->
          <div v-if="focusTasks.length" class="mb-8">
            <h2 class="text-lg font-bold mb-4 flex items-center text-purple-700">
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                焦点任务
              </span>
            </h2>
            <div class="grid gap-4">
              <div v-for="task in focusTasks" :key="task.id"
                   class="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-yellow-400">
                <div class="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div class="mb-4 md:mb-0 md:mr-6">
                    <div class="flex items-center">
                      <h3 class="text-xl font-bold text-purple-700">{{ task.title }}</h3>
                      <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        焦点
                      </span>
                    </div>
                    <p class="mt-2 text-gray-600">{{ task.description }}</p>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        积分: {{ task.points }}
                      </span>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        参与: {{ task.participants ? task.participants.length : 0 }}
                      </span>
                    </div>
                  </div>
                  <router-link :to="`/task/${task.id}`"
                     class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    立即参与
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- 常规任务列表 -->
          <h2 class="text-lg font-bold mb-4 flex items-center text-purple-700">
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              全部任务
            </span>
          </h2>
          <div class="grid gap-4">
            <div v-for="task in regularTasks" :key="task.id"
                 class="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div class="flex flex-col md:flex-row md:justify-between md:items-center">
                <div class="mb-4 md:mb-0 md:mr-6">
                  <h3 class="text-xl font-bold text-gray-800">{{ task.title }}</h3>
                  <p class="mt-2 text-gray-600">{{ task.description }}</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                      积分: {{ task.points }}
                    </span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      参与: {{ task.participants ? task.participants.length : 0 }}
                    </span>
                  </div>
                </div>
                <router-link :to="`/task/${task.id}`"
                   class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  立即参与
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 排行榜Tab -->
      <div v-else-if="activeTab === 'leaderboard'">
        <LeaderboardTabs />
      </div>
    </div>

    <!-- 鼓励弹窗 -->
    <EncouragementPopup
      v-model="showEncouragement"
      :title="encouragementData.title"
      :message="encouragementData.message"
      :image-url="encouragementData.imageUrl"
      :task-id="encouragementData.taskId"
      :points="encouragementData.points"
      :rank="encouragementData.rank"
      @view-leaderboard="activeTab = 'leaderboard'"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/utils/api.js'
import LeaderboardTabs from '@/components/LeaderboardTabs.vue'
import EncouragementPopup from '@/components/EncouragementPopup.vue'

const router = useRouter();
const tasks = ref([]);
const loading = ref(true);
const error = ref(null);
const nickname = ref('');

// 标签页状态
const tabs = [
  { label: '任务', value: 'tasks' },
  { label: '排行榜', value: 'leaderboard' }
];
const activeTab = ref('tasks');

// 鼓励弹窗状态
const showEncouragement = ref(false);
const encouragementData = ref({
  title: '恭喜你！',
  message: '',
  imageUrl: '',
  taskId: null,
  points: 0,
  rank: '-'
});

// 根据是否为焦点任务分类
const focusTasks = computed(() => {
  return tasks.value.filter(task => task.is_focus_task);
});

const regularTasks = computed(() => {
  return tasks.value.filter(task => !task.is_focus_task);
});

const fetchTasks = async () => {
  loading.value = true;
  error.value = null;

  // 从本地存储获取粉丝信息和邀请码
  const fanInfo = localStorage.getItem('fanInfo');
  if (!fanInfo) {
    error.value = '未找到有效的用户信息，请返回首页重新登录';
    loading.value = false;
    tasks.value = [];
    return;
  }

  const { invite_code: inviteCode, nickname: userNickname } = JSON.parse(fanInfo);
  nickname.value = userNickname || '粉丝';

  if (!inviteCode) {
    error.value = '未找到有效的邀请码信息，无法加载任务列表';
    loading.value = false;
    tasks.value = [];
    return;
  }

  try {
    const response = await apiClient.get('/api/tasks', {
      params: {
        invite_code: inviteCode
      }
    });

    // 对任务按创建时间排序，最新的在前面
    tasks.value = response.data.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB - dateA;
    });

    // 检查URL查询参数，如果有任务完成标记，则显示鼓励弹窗
    const urlParams = new URLSearchParams(window.location.search);
    const taskCompleted = urlParams.get('taskCompleted');
    const taskId = urlParams.get('taskId');
    const points = urlParams.get('points');

    if (taskCompleted === 'true' && taskId) {
      // 获取鼓励内容
      await fetchEncouragementContent(taskId, points);
    }

    // 清除URL参数，以免刷新页面再次显示弹窗
    if (taskCompleted) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  } catch (err) {
    console.error('获取任务列表失败:', err);
    error.value = err.response?.data?.message || '获取任务列表失败，请稍后重试';
    tasks.value = [];
  } finally {
    loading.value = false;
  }
};

// 获取鼓励内容
const fetchEncouragementContent = async (taskId, points) => {
  try {
    // 从本地存储获取邀请码
    const fanInfo = localStorage.getItem('fanInfo');
    if (!fanInfo) return;

    const { invite_code: inviteCode } = JSON.parse(fanInfo);
    if (!inviteCode) return;

    // 获取鼓励内容
    const response = await apiClient.get('/api/encouragement', {
      params: {
        task_id: taskId,
        invite_code: inviteCode
      }
    });

    // 获取用户在任务中的排名
    const rankResponse = await apiClient.get(`/api/leaderboard`, {
      params: {
        type: 'task',
        task_id: taskId,
        invite_code: inviteCode
      }
    });

    // 查找当前用户的排名
    let rank = '-';
    if (rankResponse.data && rankResponse.data.length) {
      const userIndex = rankResponse.data.findIndex(item => item.nickname === nickname.value);
      if (userIndex !== -1) {
        rank = userIndex + 1;
      }
    }

    // 更新鼓励数据
    encouragementData.value = {
      title: response.data.title || '恭喜你！',
      message: response.data.message || '你已成功完成任务！感谢你的付出和努力~',
      imageUrl: response.data.image_url || '',
      taskId: taskId,
      points: points || 0,
      rank: rank
    };

    // 显示鼓励弹窗
    showEncouragement.value = true;
  } catch (err) {
    console.error('获取鼓励内容失败:', err);
  }
};

// 退出登录
const logout = () => {
  localStorage.removeItem('fanInfo');
  router.push('/');
};

onMounted(fetchTasks);
</script>

<style scoped>
/* 添加过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

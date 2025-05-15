<template>
  <div class="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-lg p-5">
    <!-- 标题区域 -->
    <div class="flex flex-wrap items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-purple-700">
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ title || '应援排行榜' }}
        </span>
      </h2>

      <!-- 排行榜切换标签 -->
      <div class="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          v-for="tab in availableTabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="[
            'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
            activeTab === tab.value
              ? 'bg-white text-pink-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 排行榜内容 -->
    <div class="space-y-4">
      <!-- 加载中状态 -->
      <div v-if="loading" class="py-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        <p class="text-gray-500 mt-2">加载排行榜数据中...</p>
      </div>

      <!-- 错误信息 -->
      <div v-else-if="error" class="p-4 bg-red-50 text-red-500 rounded-lg">
        <p class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {{ error }}
        </p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!leaderboardData.length" class="py-10 text-center">
        <div class="bg-gray-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-gray-500 mt-3">暂无排行榜数据</p>
        <p class="text-gray-400 text-sm mt-1">快来完成任务，领先一步吧~</p>
      </div>

      <!-- 排行榜数据 -->
      <div v-else>
        <!-- 排行榜表头 -->
        <div class="grid grid-cols-12 gap-4 px-4 py-2 font-medium text-sm text-gray-500 border-b">
          <div class="col-span-1">排名</div>
          <div class="col-span-3">昵称</div>
          <div class="col-span-4">成就</div>
          <div class="col-span-2 text-right">完成任务</div>
          <div class="col-span-2 text-right">累计积分</div>
        </div>

        <!-- 排行榜数据行 -->
        <div
          v-for="(item, index) in leaderboardData"
          :key="index"
          class="grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors hover:bg-pink-50 border-b border-gray-100"
          :class="{'bg-gradient-to-r from-pink-50 to-purple-50': index < 3}"
        >
          <!-- 排名 -->
          <div class="col-span-1">
            <div v-if="index < 3"
                 class="flex items-center justify-center w-8 h-8 rounded-full"
                 :class="[
                   index === 0 ? 'bg-yellow-100 text-yellow-700' : '',
                   index === 1 ? 'bg-gray-100 text-gray-700' : '',
                   index === 2 ? 'bg-orange-100 text-orange-700' : ''
                 ]">
              <span class="font-bold">{{ index + 1 }}</span>
            </div>
            <span v-else class="text-gray-500">{{ index + 1 }}</span>
          </div>

          <!-- 粉丝昵称 -->
          <div class="col-span-3 font-medium truncate">
            {{ item.nickname }}
            <span v-if="isCurrentUser(item.nickname)" class="ml-1 text-xs bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full">
              我
            </span>
          </div>

          <!-- 成就徽章 -->
          <div class="col-span-4 flex items-center space-x-1">
            <span v-if="index === 0" class="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
              ✨ 领头粉
            </span>
            <span v-if="item.points >= 1000" class="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
              🔥 超能
            </span>
            <span v-if="item.completed_tasks >= 10" class="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              🏆 勤奋
            </span>
            <span v-if="item.has_focus_task_completed" class="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
              🌟 焦点
            </span>
          </div>

          <!-- 完成任务数 -->
          <div class="col-span-2 text-right">
            {{ item.completed_tasks || 0 }}
          </div>

          <!-- 积分 -->
          <div class="col-span-2 text-right font-semibold" :class="{'text-pink-600': index < 3}">
            {{ item.points || 0 }}
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="mt-4 text-center text-sm text-gray-500">
        <p>排行榜数据每 10 分钟更新一次</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import apiClient from '@/utils/api.js';

const props = defineProps({
  title: String,
  type: {
    type: String,
    default: 'overall', // overall, daily, focus, task
    validator: (value) => ['overall', 'daily', 'focus', 'task'].includes(value)
  },
  taskId: {
    type: [String, Number],
    default: null
  },
  inviteCode: {
    type: String,
    default: null
  }
});

const availableTabs = computed(() => {
  // 根据配置返回可用的标签
  const tabs = [
    { label: '总榜', value: 'overall' },
    { label: '当日榜', value: 'daily' },
    { label: '焦点榜', value: 'focus' }
  ];

  // 如果提供了任务ID，添加单任务榜标签
  if (props.taskId) {
    tabs.push({ label: '任务榜', value: 'task' });
  }

  return tabs;
});

const activeTab = ref(props.type);
const leaderboardData = ref([]);
const loading = ref(false);
const error = ref('');
const currentUserNickname = ref('');

onMounted(() => {
  // 获取当前用户昵称
  const fanInfo = localStorage.getItem('fanInfo');
  if (fanInfo) {
    const { nickname } = JSON.parse(fanInfo);
    currentUserNickname.value = nickname;
  }

  // 加载初始数据
  fetchLeaderboardData();
});

// 监听标签变化，重新获取数据
watch(activeTab, () => {
  fetchLeaderboardData();
});

// 监听props变化，重新获取数据
watch([() => props.taskId, () => props.inviteCode], () => {
  fetchLeaderboardData();
});

const fetchLeaderboardData = async () => {
  loading.value = true;
  error.value = '';

  // 获取邀请码
  let inviteCode = props.inviteCode;
  if (!inviteCode) {
    const fanInfo = localStorage.getItem('fanInfo');
    if (fanInfo) {
      const { invite_code } = JSON.parse(fanInfo);
      inviteCode = invite_code;
    }
  }

  if (!inviteCode) {
    error.value = '未找到有效的邀请码';
    loading.value = false;
    return;
  }

  try {
    let endpoint = '/api/leaderboard';
    const params = { invite_code: inviteCode };

    // 根据不同的标签类型设置不同的参数
    switch (activeTab.value) {
      case 'daily':
        params.type = 'daily';
        break;
      case 'focus':
        params.type = 'focus';
        break;
      case 'task':
        if (!props.taskId) {
          throw new Error('需要任务ID才能查看任务排行榜');
        }
        params.type = 'task';
        params.task_id = props.taskId;
        break;
      default: // overall
        params.type = 'overall';
    }

    const response = await apiClient.get(endpoint, { params });
    leaderboardData.value = response.data || [];
  } catch (err) {
    console.error('获取排行榜数据失败:', err);
    error.value = err.message || '获取排行榜数据失败，请稍后重试';
    leaderboardData.value = [];
  } finally {
    loading.value = false;
  }
};

// 检查是否当前用户
const isCurrentUser = (nickname) => {
  return nickname === currentUserNickname.value;
};
</script>

<style scoped>
/* 为顶部位置添加闪光效果 */
.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 排行榜悬停效果 */
.hover\:bg-pink-50:hover {
  transition: background-color 0.2s ease;
}
</style>

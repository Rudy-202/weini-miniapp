<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-center mb-4">排行榜中心</h1>
      <div class="flex justify-center space-x-2 mb-6 border-b pb-2">
        <button
          @click="switchLeaderboardType('total')"
          :class="['px-4 py-2 rounded-md text-sm font-medium', currentLeaderboardType === 'total' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300']">
          总排行榜
        </button>
        <button
          @click="switchLeaderboardType('daily')"
          :class="['px-4 py-2 rounded-md text-sm font-medium', currentLeaderboardType === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300']">
          当日排行
        </button>
        <button
          @click="switchLeaderboardType('focus')"
          :class="['px-4 py-2 rounded-md text-sm font-medium', currentLeaderboardType === 'focus' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300']">
          💎 焦点任务榜
        </button>
      </div>
       <div class="flex justify-between items-center mb-2">
        <h2 class="text-xl font-semibold">{{ currentLeaderboardTitle }}</h2>
        <button @click="refreshLeaderboard"
                class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                :disabled="loading">
          {{ loading ? '刷新中...' : '刷新' }}
        </button>
      </div>
      <p v-if="currentLeaderboardType === 'focus'" class="text-sm text-center text-blue-600 mb-4">焦点任务所有积分获取均翻倍！</p>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">加载 {{ currentLeaderboardTitle }} 数据中...</p>
    </div>
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
      {{ error }}
    </div>
    <div v-else class="max-w-2xl mx-auto">
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名次</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">昵称</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">积分</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提交数</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in leaderboardData.top_list"
                :key="item.fan_nickname + currentLeaderboardType"
                :class="{'bg-yellow-50': item.fan_nickname === currentFanNickname}">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.rank }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" :class="{'font-bold': item.fan_nickname === currentFanNickname}">{{ item.fan_nickname }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.points }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.submission_count }}</td>
            </tr>
            <tr v-if="leaderboardData.top_list && leaderboardData.top_list.length === 0">
              <td colspan="4" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                当前条件下暂无排行榜数据。
                 <span v-if="(currentLeaderboardType === 'my-active' || currentLeaderboardType === 'focus') && specificMessage"> {{ specificMessage }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="leaderboardData.self_info && leaderboardData.self_info.fan_nickname" class="mt-6 bg-gray-50 p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-2">我在 {{ currentLeaderboardTitle }} 的排名</h3>
        <p><strong>名次:</strong> {{ leaderboardData.self_info.rank }}</p>
        <p><strong>昵称:</strong> {{ leaderboardData.self_info.fan_nickname }}</p>
        <p><strong>积分:</strong> {{ leaderboardData.self_info.points }}</p>
        <p><strong>提交数:</strong> {{ leaderboardData.self_info.submission_count }}</p>
      </div>
      <div v-else-if="!loading && !error && currentFanNickname && currentLeaderboardType !== 'my-active' && currentLeaderboardType !== 'focus'" class="mt-6 text-center text-gray-600">
          你可能尚未在此条件下计入排名，或未提交过任务。
      </div>
       <div v-else-if="!loading && !error && currentFanNickname && (currentLeaderboardType === 'my-active' || currentLeaderboardType === 'focus') && !leaderboardData.self_info && !specificMessage" class="mt-6 text-center text-gray-600">
          你可能尚未参与任何此类任务，或参与的任务暂无其他参与者数据。
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import apiClient from '@/utils/api.js'

const leaderboardData = ref({
  top_list: [],
  self_info: null
})
const loading = ref(true)
const error = ref(null)
const specificMessage = ref(null) // For specific messages like "You haven't participated..."
const currentFanNickname = ref(localStorage.getItem('fanNickname'))
const currentLeaderboardType = ref('total') // 'total', 'daily', 'focus'

let refreshInterval = null
let refreshTimeout = null

const leaderboardTitles = {
  total: '总排行榜',
  daily: '当日排行榜',
  focus: '焦点任务排行榜'
};

const currentLeaderboardTitle = computed(() => leaderboardTitles[currentLeaderboardType.value]);

const fetchLeaderboard = async () => {
  const fanInviteCode = localStorage.getItem('fanInviteCode')
  const localFanNickname = localStorage.getItem('fanNickname')

  if (!fanInviteCode) {
    error.value = '未找到邀请码，无法加载排行榜。请确保已通过邀请码进入。'
    loading.value = false
    leaderboardData.value = { top_list: [], self_info: null }
    specificMessage.value = null;
    return
  }

  loading.value = true
  error.value = null
  specificMessage.value = null;
  console.log(`开始获取 ${currentLeaderboardType.value} 排行榜数据, 邀请码:`, fanInviteCode, '昵称:', localFanNickname)

  let apiUrl = '';
  const params = { invite_code: fanInviteCode };

  switch (currentLeaderboardType.value) {
    case 'daily':
      apiUrl = '/api/leaderboard/daily';
      if (localFanNickname) params.fan_nickname = localFanNickname;
      break;
    case 'focus':
      apiUrl = '/api/leaderboard/focus';
      if (localFanNickname) params.fan_nickname = localFanNickname;
      break;
    case 'total':
    default:
      apiUrl = '/api/leaderboard/total';
      if (localFanNickname) params.fan_nickname = localFanNickname;
      break;
  }

  try {
    const response = await apiClient.get(apiUrl, { params })
    console.log(`${currentLeaderboardType.value} 排行榜数据响应:`, response.data)

    if (response.data.message && (currentLeaderboardType.value === 'my-active' || currentLeaderboardType.value === 'focus')) {
      specificMessage.value = response.data.message;
    }

    if (response.data && typeof response.data.top_list !== 'undefined') {
      leaderboardData.value = {
        top_list: response.data.top_list.map(item => ({
          ...item,
          points: parseInt(item.points) || 0,
          submission_count: parseInt(item.submission_count) || 0,
          rank: parseInt(item.rank) || 0
        })),
        self_info: response.data.self_info ? {
          ...response.data.self_info,
          points: parseInt(response.data.self_info.points) || 0,
          submission_count: parseInt(response.data.self_info.submission_count) || 0,
          rank: parseInt(response.data.self_info.rank) || 0
        } : null
      }
    } else {
      throw new Error(`获取到的 ${currentLeaderboardType.value} 排行榜数据格式不正确`)
    }
  } catch (err) {
    console.error(`获取 ${currentLeaderboardType.value} 排行榜数据失败:`, err)
    let errorMessage = `获取 ${currentLeaderboardTitle.value} 数据失败，请稍后重试。`
    if (err.response) {
      if (err.response.status === 400 || err.response.status === 403) {
        errorMessage = err.response.data.error || `请求错误 (${err.response.status})`
      } else if (err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error;
      }
    } else if (err.message) {
      errorMessage = err.message;
    }
    error.value = errorMessage;
    leaderboardData.value = { top_list: [], self_info: null }
  } finally {
    loading.value = false
  }
}

const switchLeaderboardType = (type) => {
  if (currentLeaderboardType.value === type) return;
  currentLeaderboardType.value = type;
  // Reset data and error before fetching new type
  leaderboardData.value = { top_list: [], self_info: null };
  error.value = null;
  specificMessage.value = null;
  fetchLeaderboard(); // Fetch data for the new type
};

const refreshLeaderboard = () => {
  if (loading.value) return;
  if (refreshTimeout) clearTimeout(refreshTimeout);
  refreshTimeout = setTimeout(() => {
    console.log(`手动刷新 ${currentLeaderboardType.value} 排行榜`);
    fetchLeaderboard();
  }, 300);
};

onMounted(() => {
  console.log('排行榜中心组件已挂载');
  currentFanNickname.value = localStorage.getItem('fanNickname');
  fetchLeaderboard(); // Fetch initial (total) leaderboard
  refreshInterval = setInterval(() => {
    console.log(`自动刷新 ${currentLeaderboardType.value} 排行榜`);
    fetchLeaderboard();
  }, 20000);
});

onUnmounted(() => {
  console.log('排行榜中心组件已卸载');
  if (refreshInterval) clearInterval(refreshInterval);
  if (refreshTimeout) clearTimeout(refreshTimeout);
});
</script>

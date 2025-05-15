<template>
  <div class="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 py-6">
    <div class="container mx-auto px-4">
      <div class="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-xl max-w-4xl mx-auto p-6 overflow-hidden">
        <!-- 顶部导航 -->
        <div class="flex items-center justify-between mb-6">
          <button @click="goBackToTaskList"
                  class="flex items-center text-gray-600 hover:text-pink-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回
          </button>
          <h1 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            {{ taskDetails?.title || '任务' }} 排行榜
          </h1>
          <button @click="refreshLeaderboard"
                  class="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
                  :disabled="loading">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ loading ? '刷新中' : '刷新' }}
          </button>
        </div>

        <!-- 使用LeaderboardTabs组件 -->
        <LeaderboardTabs
          v-if="taskId"
          title="任务排行榜"
          type="task"
          :taskId="taskId"
          :inviteCode="inviteCode"
        />

        <!-- 旧版本排行榜内容 - 当LeaderboardTabs不可用时显示 -->
        <div v-else>
          <!-- 加载状态 -->
          <div v-if="loading" class="flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            <p class="mt-4 text-gray-500">努力加载排行榜中...</p>
          </div>

          <!-- 提示参与任务 -->
          <div v-else-if="showSubmitPrompt" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg text-yellow-800">
            <div class="flex">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>你尚未参与当前任务，完成任务后即可查看你的排名哦~</p>
            </div>
          </div>

          <!-- 错误信息 -->
          <div v-else-if="error && !showSubmitPrompt" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-red-700">
            <div class="flex">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p class="font-medium">发生错误:</p>
                <p class="mt-1 text-sm">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- 排行榜数据 -->
          <div v-else-if="!loading && leaderboardData.top_list && leaderboardData.top_list.length > 0">
            <!-- 前三名展示 -->
            <div class="grid grid-cols-3 gap-4 mb-6">
              <!-- 第二名 -->
              <div v-if="leaderboardData.top_list.length > 1" class="col-span-1 text-center">
                <div class="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-2 border-2 border-gray-300">
                  <span class="text-xl font-bold text-gray-700">2</span>
                </div>
                <p class="font-medium truncate">{{ leaderboardData.top_list[1].fan_nickname }}</p>
                <p class="text-sm text-gray-500">{{ leaderboardData.top_list[1].points }} 分</p>
              </div>

              <!-- 第一名 -->
              <div v-if="leaderboardData.top_list.length > 0" class="col-span-1 text-center">
                <div class="w-20 h-20 mx-auto rounded-full bg-yellow-100 flex items-center justify-center mb-2 border-2 border-yellow-400 transform -translate-y-2">
                  <span class="text-2xl font-bold text-yellow-700">1</span>
                </div>
                <p class="font-bold truncate">{{ leaderboardData.top_list[0].fan_nickname }}</p>
                <p class="text-yellow-600">{{ leaderboardData.top_list[0].points }} 分</p>
              </div>

              <!-- 第三名 -->
              <div v-if="leaderboardData.top_list.length > 2" class="col-span-1 text-center">
                <div class="w-14 h-14 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-2 border-2 border-orange-300">
                  <span class="text-lg font-bold text-orange-700">3</span>
                </div>
                <p class="font-medium truncate">{{ leaderboardData.top_list[2].fan_nickname }}</p>
                <p class="text-sm text-gray-500">{{ leaderboardData.top_list[2].points }} 分</p>
              </div>
            </div>

            <!-- 排行榜列表 -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
              <div class="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 text-sm font-medium text-gray-500">
                <div class="col-span-2">排名</div>
                <div class="col-span-7">昵称</div>
                <div class="col-span-3 text-right">积分</div>
              </div>

              <div class="divide-y divide-gray-100">
                <div v-for="(item, index) in displayRankList" :key="index"
                     class="grid grid-cols-12 gap-2 px-4 py-3 items-center text-gray-800"
                     :class="{'bg-pink-50': item.fan_nickname === currentFanNickname}">
                  <div class="col-span-2 font-medium">{{ item.rank }}</div>
                  <div class="col-span-7 truncate">
                    {{ item.fan_nickname }}
                    <span v-if="item.fan_nickname === currentFanNickname"
                          class="ml-1 text-xs bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full">
                      我
                    </span>
                  </div>
                  <div class="col-span-3 text-right font-medium">{{ item.points }}</div>
                </div>
              </div>
            </div>

            <!-- 当前用户信息 -->
            <div v-if="!showSubmitPrompt && leaderboardData.self_info && leaderboardData.self_info.fan_nickname"
                 class="mt-6 bg-purple-50 rounded-lg p-4">
              <p class="text-center text-purple-800">
                <span class="font-medium">你当前排名：{{ leaderboardData.self_info.rank }}</span>
                <span class="mx-2">|</span>
                <span>积分：{{ leaderboardData.self_info.points }}</span>
              </p>
            </div>
          </div>

          <!-- 空数据状态 -->
          <div v-else-if="!loading && !showSubmitPrompt && !error && (!leaderboardData.top_list || leaderboardData.top_list.length === 0)"
               class="text-center py-12">
            <div class="bg-gray-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="mt-4 text-gray-500">目前还没有人参与这个任务</p>
            <p class="text-gray-400 text-sm mt-1">成为第一个参与者，获得头名殊荣吧！</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/utils/api.js'
import LeaderboardTabs from '@/components/LeaderboardTabs.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref(null)
const showSubmitPrompt = ref(false)
const taskDetails = ref(null)
const taskId = ref(route.params.id)
const inviteCode = ref('')

const leaderboardData = ref({
  top_list: [],
  self_info: {
    rank: 0,
    fan_nickname: '',
    points: 0,
    submission_count: 0
  }
})

// 当前用户昵称和邀请码
const currentFanNickname = ref('')
let refreshInterval = null

// 计算属性：只显示排名3以后的数据（因为前三名已经单独显示）
const displayRankList = computed(() => {
  if (!leaderboardData.value.top_list || leaderboardData.value.top_list.length <= 3) {
    return [];
  }
  return leaderboardData.value.top_list.slice(3);
});

const goBackToTaskList = () => {
  router.push('/fan/home');
};

const refreshLeaderboard = () => {
  fetchLeaderboard(taskId.value, inviteCode.value, currentFanNickname.value);
};

const fetchTaskDetails = async (taskId, inviteCode) => {
  if (!taskId || !inviteCode) {
    console.warn('任务ID或邀请码缺失，无法获取任务详情');
    return;
  }

  try {
    const response = await apiClient.get(`/api/tasks/${taskId}`, {
      params: { invite_code: inviteCode }
    });
    taskDetails.value = response.data;
  } catch (err) {
    console.error('获取任务详情失败:', err);
    error.value = `获取任务详情失败: ${err.response?.data?.message || err.message || '请稍后重试'}`;
  }
};

const fetchLeaderboard = async (taskId, fanInviteCode, fanNickname) => {
  loading.value = true;
  error.value = null;

  if (!fanInviteCode) {
    error.value = '未找到邀请码，无法加载排行榜。';
    loading.value = false;
    return;
  }

  try {
    const response = await apiClient.get(`/api/leaderboard/${taskId}`, {
      params: {
        fan_nickname: fanNickname || '',
        invite_code: fanInviteCode
      }
    });

    leaderboardData.value = response.data;

    // 如果没有当前用户数据，显示提示
    if (!fanNickname || (response.data.self_info && !response.data.self_info.fan_nickname)) {
      showSubmitPrompt.value = true;
    } else {
      showSubmitPrompt.value = false;
    }
  } catch (err) {
    console.error('获取排行榜失败:', err);
    error.value = err.response?.data?.message || '获取排行榜数据失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // 获取URL查询参数或localStorage中的邀请码和昵称
  const urlInviteCode = route.query.invite_code;
  const urlNickname = route.query.fan_nickname;

  // 从localStorage获取粉丝信息
  let storedNickname = '';
  let storedInviteCode = '';
  const fanInfo = localStorage.getItem('fanInfo');

  if (fanInfo) {
    const parsedInfo = JSON.parse(fanInfo);
    storedNickname = parsedInfo.nickname || '';
    storedInviteCode = parsedInfo.invite_code || '';
  }

  // 优先使用URL参数，其次使用localStorage中的值
  currentFanNickname.value = urlNickname || storedNickname;
  inviteCode.value = urlInviteCode || storedInviteCode;

  // 获取任务详情和排行榜数据
  fetchTaskDetails(taskId.value, inviteCode.value);
  fetchLeaderboard(taskId.value, inviteCode.value, currentFanNickname.value);

  // 设置定时刷新（每60秒）
  refreshInterval = setInterval(() => {
    fetchLeaderboard(taskId.value, inviteCode.value, currentFanNickname.value);
  }, 60000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

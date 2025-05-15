<template>
  <div class="p-4">
    <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">日报管理</h1>
    <p class="mt-2 text-gray-600 dark:text-gray-300">这里将包含提取排行榜和生成日报的功能。</p>

    <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-6">排行榜提取</h2>

      <div class="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800 mb-6">
        <label for="inviteCodeSelect" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">选择邀请码:</label>
        <select
          id="inviteCodeSelect"
          v-model="selectedInviteCode"
          class="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
          :disabled="inviteCodes.length === 0 || isLoadingInviteCodes"
        >
          <option value="" disabled>{{ isLoadingInviteCodes ? '加载中...' : (inviteCodes.length === 0 ? '无可用邀请码' : '请选择一个邀请码') }}</option>
          <option v-for="code in inviteCodes" :key="code.id" :value="code.code">
            {{ code.description ? `${code.code} (${code.description})` : code.code }}
          </option>
        </select>
        <p v-if="inviteCodeError" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ inviteCodeError }}</p>
      </div>

      <div v-if="selectedInviteCode" class="space-y-6 mb-6">
        <div class="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">按日期范围提取</h3>
          <div class="space-y-4 md:space-y-0 md:flex md:flex-wrap md:gap-4 md:items-end">
            <button
              @click="fetchTodaysLeaderboard"
              class="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="isLoading"
            >
              提取今日排行榜
            </button>

            <div class="flex items-end space-x-3 md:border-l md:pl-4 md:pt-0 border-t pt-4 md:border-t-0">
                <div>
                    <label for="startDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">开始日期:</label>
                    <input type="date" id="startDate" v-model="selectedStartDate" class="block w-full md:w-auto pl-3 pr-2 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm" :disabled="isLoading">
                </div>
                <div>
                    <label for="endDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">结束日期:</label>
                    <input type="date" id="endDate" v-model="selectedEndDate" class="block w-full md:w-auto pl-3 pr-2 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm" :disabled="isLoading">
                </div>
                <button
                  @click="fetchCustomRangeLeaderboard"
                  class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-60 disabled:cursor-not-allowed"
                  :disabled="isLoading || !selectedStartDate || !selectedEndDate"
                >
                  查询选定范围
                </button>
            </div>
          </div>
        </div>

        <div class="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">按单活动提取</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">进行中活动</h4>
              <div class="flex items-end space-x-3">
                <div class="flex-grow">
                  <label for="activeTaskSelect" class="sr-only">选择进行中活动</label>
                  <select
                    id="activeTaskSelect"
                    v-model="selectedActiveTaskId"
                    class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                    :disabled="isLoading || isLoadingTasks || activeTasks.length === 0"
                  >
                    <option value="" disabled>{{ isLoadingTasks ? '加载中...' : (activeTasks.length === 0 ? '无进行中活动' : '选择一个活动') }}</option>
                    <option v-for="task in activeTasks" :key="task.id" :value="task.id">
                      {{ task.title }}
                    </option>
                  </select>
                </div>
                <button
                  @click="fetchActiveTaskRanking"
                  class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 disabled:opacity-60 disabled:cursor-not-allowed"
                  :disabled="isLoading || !selectedActiveTaskId"
                >
                  提取排行
                </button>
              </div>
              <p v-if="tasksError" class="mt-1 text-xs text-red-600 dark:text-red-400">加载活动列表失败: {{ tasksError }}</p>
            </div>

            <div>
              <h4 class="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">已结算活动</h4>
              <div class="flex items-end space-x-3">
                <div class="flex-grow">
                  <label for="completedTaskSelect" class="sr-only">选择已结算活动</label>
                  <select
                    id="completedTaskSelect"
                    v-model="selectedCompletedTaskId"
                    class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                    :disabled="isLoading || isLoadingTasks || completedTasks.length === 0"
                  >
                    <option value="" disabled>{{ isLoadingTasks ? '加载中...' : (completedTasks.length === 0 ? '无已结算活动' : '选择一个活动') }}</option>
                    <option v-for="task in completedTasks" :key="task.id" :value="task.id">
                      {{ task.title }}
                    </option>
                  </select>
                </div>
                <button
                  @click="fetchCompletedTaskRanking"
                  class="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 disabled:opacity-60 disabled:cursor-not-allowed"
                  :disabled="isLoading || !selectedCompletedTaskId"
                >
                  提取排行
                </button>
              </div>
               <p v-if="tasksError" class="mt-1 text-xs text-red-600 dark:text-red-400">加载活动列表失败: {{ tasksError }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="mt-6 mb-6 p-4 bg-blue-50 dark:bg-gray-700 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-200 rounded-md shadow-sm">
        <p>请先选择一个邀请码以查看排行榜提取选项。</p>
      </div>

      <div v-if="isLoading" class="mt-4 text-center">
        <p class="text-gray-600 dark:text-gray-300">正在加载排行榜数据，请稍候...</p>
        <!-- 您可以在这里集成一个 Spinner 组件 -->
        <!-- <Spinner /> -->
      </div>

      <div v-if="error" class="mt-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md shadow-sm">
        <p><strong class="font-semibold">发生错误:</strong> {{ error }}</p>
      </div>

      <div v-if="!isLoading && !error && leaderboardData.length > 0" class="mt-6">
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
          {{ leaderboardTitle }}
        </h3>
        <div class="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">排名</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">昵称</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">积分</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="(item, index) in leaderboardData" :key="item.id || index" class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{{ item.rank }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ item.nickname }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ item.score }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!isLoading && leaderboardData.length > 0" class="mt-4 text-right">
          <button
            @click="generateWordReport"
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="isLoadingReport"
          >
            {{ isLoadingReport ? '生成中...' : '生成日报 (Word)' }}
          </button>
        </div>
      </div>

      <div v-if="!isLoading && !error && leaderboardData.length === 0 && attemptedFetch" class="mt-4 p-4 bg-yellow-50 dark:bg-gray-700 border border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-200 rounded-md shadow-sm">
        <p>今日暂无排行榜数据。</p>
      </div>
    </div>

    <!-- 后续将在这里添加具体功能： -->
    <!-- 2. 提取单活动排行榜 -->
    <!-- 3. 提取自定义时间段排行榜 -->
    <!-- 4. 日报生成功能 -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const leaderboardData = ref([]);
const isLoading = ref(false);
const error = ref(null);
const attemptedFetch = ref(false);
const leaderboardTitle = ref('排行榜结果');

const inviteCodes = ref([]);
const selectedInviteCode = ref('');
const isLoadingInviteCodes = ref(false);
const inviteCodeError = ref(null);

const lastQueryContext = ref(null); // Added for Word report context
const isLoadingReport = ref(false); // Added for Word report loading state

const todayDateString = new Date().toISOString().split('T')[0];
const selectedStartDate = ref(todayDateString);
const selectedEndDate = ref(todayDateString);

const activeTasks = ref([]);
const completedTasks = ref([]);
const selectedActiveTaskId = ref('');
const selectedCompletedTaskId = ref('');
const isLoadingTasks = ref(false);
const tasksError = ref(null);

// Helper to get date in YYYY-MM-DD format
const getFormattedDate = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fetchInviteCodes = async () => {
  isLoadingInviteCodes.value = true;
  inviteCodeError.value = null;
  const token = localStorage.getItem('admin_token');
  if (!token) {
    inviteCodeError.value = '管理员未登录，无法加载邀请码。';
    isLoadingInviteCodes.value = false;
    return;
  }

  try {
    const response = await fetch('/api/admin/invite-codes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP Error: ${response.status}`}));
      throw new Error(errorData.message || `加载邀请码失败 (${response.status})`);
    }
    const data = await response.json();
    inviteCodes.value = data;
    if (data.length > 0) {
      // 可选：默认选中第一个邀请码
      // selectedInviteCode.value = data[0].code;
    } else {
      inviteCodeError.value = '系统中暂无可用邀请码。';
    }
  } catch (err) {
    console.error('加载邀请码失败:', err);
    inviteCodeError.value = err.message || '加载邀请码时发生未知错误。';
    inviteCodes.value = [];
  } finally {
    isLoadingInviteCodes.value = false;
  }
};

const fetchAdminTasksAndCompletedTasks = async () => {
  isLoadingTasks.value = true;
  tasksError.value = null;
  const token = localStorage.getItem('admin_token');
  if (!token) {
    tasksError.value = '管理员未登录，无法加载活动列表。';
    isLoadingTasks.value = false;
    return;
  }
  try {
    // Fetch active tasks
    const activeResponse = await fetch('/api/admin/tasks', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!activeResponse.ok) throw new Error(`加载进行中活动失败 (${activeResponse.status})`);
    activeTasks.value = await activeResponse.json();

    // Fetch completed tasks
    const completedResponse = await fetch('/api/admin/tasks/completed', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!completedResponse.ok) throw new Error(`加载已结算活动失败 (${completedResponse.status})`);
    completedTasks.value = await completedResponse.json();

  } catch (err) {
    console.error('加载活动列表失败:', err);
    tasksError.value = err.message || '加载活动列表时发生未知错误。';
    activeTasks.value = [];
    completedTasks.value = [];
  } finally {
    isLoadingTasks.value = false;
  }
};

// --- Core Leaderboard Fetching Logic ---
const executeFetchLeaderboard = async (startDate, endDate, inviteCode) => {
  if (!inviteCode) {
    error.value = '请先选择一个邀请码。';
    leaderboardData.value = [];
    attemptedFetch.value = true;
    return;
  }
  if (!startDate || !endDate) {
    error.value = '请选择开始和结束日期。';
    leaderboardData.value = [];
    attemptedFetch.value = true;
    return;
  }

  isLoading.value = true;
  error.value = null;
  attemptedFetch.value = true;
  leaderboardData.value = []; // Clear previous results
  leaderboardTitle.value = '排行榜结果'; // 重置标题

  const token = localStorage.getItem('admin_token');
  if (!token) {
    error.value = '管理员未登录或登录已过期，请重新登录。';
    isLoading.value = false;
    return;
  }

  try {
    const apiUrl = `/api/admin/rankings?type=custom_range&startDate=${startDate}&endDate=${endDate}&invite_code=${inviteCode}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      let errorData = { message: `HTTP 错误: ${response.status} ${response.statusText}` };
      try {
        errorData = await response.json();
      } catch (e) {
        console.error('无法解析错误响应体:', e);
      }
      throw new Error(errorData.message || `获取排行榜数据失败 (${response.status})`);
    }

    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      leaderboardData.value = result.data;
      error.value = null;
      // 设置动态标题
      if (startDate === endDate) {
        leaderboardTitle.value = `${startDate} 排行榜`;
      } else {
        leaderboardTitle.value = `${startDate} 至 ${endDate} 排行榜`;
      }
      // SET lastQueryContext for date range based leaderboards
      if (startDate === getFormattedDate(new Date()) && endDate === getFormattedDate(new Date())) {
        lastQueryContext.value = {
            type: 'daily',
            details: { date: startDate }
        };
      } else {
          lastQueryContext.value = {
              type: 'custom_range',
              details: { startDate: startDate, endDate: endDate }
          };
      }
    } else {
      error.value = result.message || '获取到的排行榜数据格式不正确或操作未成功。';
      leaderboardTitle.value = '排行榜结果'; // 出错时重置或保持默认
    }
  } catch (err) {
    console.error('API调用失败:', err);
    error.value = err.message || '请求排行榜数据时发生未知网络错误。';
    leaderboardTitle.value = '排行榜结果'; // 出错时重置或保持默认
  } finally {
    isLoading.value = false;
  }
};

const fetchTodaysLeaderboard = async () => {
  const today = getFormattedDate(new Date());
  executeFetchLeaderboard(today, today, selectedInviteCode.value);
};

const fetchCustomRangeLeaderboard = async () => {
  // Basic validation for date range
  if (selectedStartDate.value && selectedEndDate.value && selectedStartDate.value > selectedEndDate.value) {
    error.value = '开始日期不能晚于结束日期。';
    leaderboardData.value = [];
    attemptedFetch.value = true;
    return;
  }
  executeFetchLeaderboard(selectedStartDate.value, selectedEndDate.value, selectedInviteCode.value);
};

const executeFetchTaskRanking = async (taskId) => {
  if (!taskId) {
    error.value = '请先选择一个活动。';
    leaderboardData.value = [];
    attemptedFetch.value = true;
    return;
  }

  isLoading.value = true;
  error.value = null;
  attemptedFetch.value = true;
  leaderboardData.value = [];
  // leaderboardTitle.value = '活动排行榜结果'; // Title will come from backend

  const token = localStorage.getItem('admin_token');
  if (!token) {
    error.value = '管理员未登录或登录已过期。';
    isLoading.value = false;
    return;
  }

  try {
    const apiUrl = `/api/admin/tasks/${taskId}/ranking`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP Error: ${response.status}`}));
      throw new Error(errorData.message || `获取活动排行榜失败 (${response.status})`);
    }

    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      leaderboardData.value = result.data;
      leaderboardTitle.value = result.leaderboard_title || '活动排行榜';
      error.value = null;

      // SET lastQueryContext for single task based leaderboards
      let taskName = '未知活动';
      let taskTypeContext = 'single_task'; // generic, will be refined

      const activeTask = activeTasks.value.find(t => t.id === taskId);
      if (activeTask) {
          taskName = activeTask.title;
          taskTypeContext = 'single_task_active';
      } else {
          const completedTask = completedTasks.value.find(t => t.id === taskId);
          if (completedTask) {
              taskName = completedTask.title;
              taskTypeContext = 'single_task_completed';
          }
      }
      lastQueryContext.value = {
          type: taskTypeContext,
          details: { taskId: taskId, taskName: taskName }
      };
    } else {
      error.value = result.message || '获取到的活动排行榜数据格式不正确。';
      leaderboardTitle.value = '活动排行榜结果';
    }
  } catch (err) {
    console.error('单活动排行API调用失败:', err);
    error.value = err.message || '请求活动排行榜时发生未知错误。';
    leaderboardTitle.value = '活动排行榜结果';
  } finally {
    isLoading.value = false;
  }
};

const fetchActiveTaskRanking = async () => {
  executeFetchTaskRanking(selectedActiveTaskId.value);
};

const fetchCompletedTaskRanking = async () => {
  executeFetchTaskRanking(selectedCompletedTaskId.value);
};

const generateWordReport = async () => {
  if (!leaderboardData.value.length || !lastQueryContext.value) {
    error.value = '没有可生成的排行榜数据或上下文。';
    return;
  }
  if (!selectedInviteCode.value) {
    error.value = '生成日报前必须选择邀请码。';
    return;
  }

  isLoadingReport.value = true;
  error.value = null; // Clear previous errors for general display

  const token = localStorage.getItem('admin_token');
  if (!token) {
    error.value = '管理员未登录或登录已过期。';
    isLoadingReport.value = false;
    return;
  }

  const payload = {
    leaderboardTitle: leaderboardTitle.value,
    leaderboardData: leaderboardData.value,
    inviteCode: selectedInviteCode.value,
    queryContext: lastQueryContext.value
  };

  try {
    const response = await fetch('/api/admin/daily-report/generate-word', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/vnd.openxmlformats-officedocument.wordprocessingml.document') !== -1) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        const disposition = response.headers.get('content-disposition');
        let filename = 'daily_report.docx'; // Default filename
        if (disposition && disposition.indexOf('attachment') !== -1) {
          const filenameRegex = /filename[^;=\\n]*=((['"]).*?\\2|[^;\\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        const errorData = await response.json().catch(() => ({ message: '服务器返回了OK状态，但响应不是预期的Word文件。'}));
        throw new Error(errorData.message || '生成成功但无法下载文件，响应类型不正确。');
      }
    } else {
      const errorData = await response.json().catch(() => ({ message: `HTTP Error: ${response.status} ${response.statusText}`}));
      throw new Error(errorData.details || errorData.error || errorData.message || `生成日报失败 (${response.status})`);
    }
  } catch (err) {
    console.error('生成Word日报失败:', err);
    error.value = err.message || '生成Word日报时发生未知客户端错误。';
  } finally {
    isLoadingReport.value = false;
  }
};

onMounted(() => {
  fetchInviteCodes();
  fetchAdminTasksAndCompletedTasks(); // Fetch tasks on mount
  // selectedStartDate.value = getFormattedDate(new Date()); // Already initialized
  // selectedEndDate.value = getFormattedDate(new Date());   // Already initialized
});
</script>

<style scoped>
/* 可以在这里添加特定于此页面的样式 */
.disabled\\:opacity-60 {
  opacity: 0.6;
}
.disabled\\:cursor-not-allowed {
  cursor: not-allowed;
}
</style>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">里程碑任务管理</h1>

    <!-- 里程碑任务介绍 -->
    <div class="mb-6 p-4 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg">
      <h3 class="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">关于里程碑任务</h3>
      <p class="text-sm text-gray-700 dark:text-gray-300 mb-1">
        里程碑任务是一种特殊类型的长期集体目标，旨在通过多个子任务的完成来共同推进。
      </p>
      <ul class="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <li>里程碑任务的持续时间至少需要 <strong>7 天</strong>。</li>
        <li>对于同一个邀请码，在任何时候都只能存在 <strong>一个</strong> 未完成（即状态不为"已完成"或"已取消"）的里程碑任务。</li>
        <li>创建新的里程碑任务前，请确保当前没有其他正在进行的里程碑任务与所选邀请码关联。</li>
        <li>里程碑任务意义非凡，需要站子手动开启新的征程。</li>
      </ul>
    </div>

    <!-- 创建里程碑任务的表单 -->
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-6 text-gray-700 dark:text-gray-200">创建新的里程碑任务</h2>

      <form @submit.prevent="confirmAndCreateMilestoneTask">
        <!-- 成功消息 -->
        <div v-if="successMessage" class="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">
          {{ successMessage }}
        </div>
        <!-- 错误消息 -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
          {{ errorMessage }}
        </div>

        <!-- 任务标题 -->
        <div class="mb-4">
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">任务标题</label>
          <input type="text" id="title" v-model="title" required
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>

        <!-- 任务描述 -->
        <div class="mb-4">
          <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">任务描述</label>
          <textarea id="description" v-model="description" rows="3" required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
        </div>

        <!-- 邀请码 -->
        <div class="mb-4">
          <label for="inviteCode" class="block text-sm font-medium text-gray-700 dark:text-gray-300">关联邀请码</label>
          <select id="inviteCode" v-model="selectedInviteCode" required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option disabled value="">请选择一个邀请码</option>
            <option v-for="code in inviteCodesList" :key="code.id" :value="code.code">
              {{ code.code }} ({{ code.description || '无描述' }})
            </option>
          </select>
        </div>

        <!-- 目标数值 -->
        <div class="mb-4">
          <label for="targetValue" class="block text-sm font-medium text-gray-700 dark:text-gray-300">目标数值</label>
          <input type="number" id="targetValue" v-model.number="targetValue" min="1" required
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>

        <!-- 计量单位 -->
        <div class="mb-4">
          <label for="unitOfMeasure" class="block text-sm font-medium text-gray-700 dark:text-gray-300">计量单位</label>
          <input type="text" id="unitOfMeasure" v-model="unitOfMeasure" required placeholder="例如：积分, 贡献值, 次数"
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>

        <!-- 开始日期 -->
        <div class="mb-4">
          <label for="startDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">预计开始时间</label>
          <input type="datetime-local" id="startDate" v-model="startDate" required
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>

        <!-- 截止日期 -->
        <div class="mb-6">
          <label for="dueDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">截止日期</label>
          <input type="datetime-local" id="dueDate" v-model="dueDate" required
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        </div>

        <!-- 提交按钮 -->
        <div>
          <button type="submit" :disabled="isLoading"
                  class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
            <span v-if="isLoading" class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
            {{ isLoading ? '正在创建...' : '创建里程碑任务' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 已创建的里程碑任务列表 -->
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">已创建的里程碑任务</h2>

      <div v-if="isLoadingTasks" class="text-center py-4">
        <p class="text-gray-600 dark:text-gray-400">正在加载任务列表...</p>
        <!-- 可以加入一个加载动画 -->
      </div>

      <div v-if="fetchTasksError" class="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
        获取任务列表失败：{{ fetchTasksError }}
      </div>

      <div v-if="!isLoadingTasks && !fetchTasksError && milestoneTasksList.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">标题</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">状态</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">邀请码</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">目标 / 当前</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">预计开始时间</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">截止日期</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">创建日期</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="task in milestoneTasksList" :key="task.milestone_id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ task.title }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ getStatusText(task.status) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ task.invite_code }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ task.target_value }} {{ task.unit_of_measure }} / {{ task.current_value }} {{ task.unit_of_measure }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ formatDisplayDate(task.start_date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ formatDisplayDate(task.due_date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ formatDisplayDate(task.creation_date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="goToTaskDetail(task.milestone_id)"
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-xs"
                >
                  详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!isLoadingTasks && !fetchTasksError && milestoneTasksList.length === 0" class="text-center py-4">
        <p class="text-gray-600 dark:text-gray-400">暂无已创建的里程碑任务。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 表单数据模型
const title = ref('');
const description = ref('');
const selectedInviteCode = ref(''); // 初始化为空字符串以匹配 <option disabled value="">
const inviteCodesList = ref([]);
const targetValue = ref(null);
const unitOfMeasure = ref('');
const startDate = ref('');
const dueDate = ref('');

const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// 列表数据模型
const milestoneTasksList = ref([]);
const isLoadingTasks = ref(false);
const fetchTasksError = ref('');

// 获取邀请码列表
const fetchInviteCodes = async () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    errorMessage.value = '管理员未登录或登录已过期。';
    // router.push({ name: 'AdminLogin' }); // 避免在加载邀请码时强制跳转，让用户先看到页面
    return;
  }
  try {
    const response = await fetch('/api/admin/invite-codes', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '获取邀请码列表失败');
    }
    inviteCodesList.value = await response.json();
  } catch (error) {
    console.error('获取邀请码列表失败:', error);
    // errorMessage.value = error.message || '获取邀请码列表时发生网络错误。'; // 表单的错误提示，这里是列表加载的一部分，可以考虑不同错误变量
  }
};

// 获取里程碑任务列表
const fetchMilestoneTasks = async () => {
  isLoadingTasks.value = true;
  fetchTasksError.value = '';
  const token = localStorage.getItem('admin_token');
  if (!token) {
    fetchTasksError.value = '管理员未登录或登录已过期，无法加载任务列表。';
    isLoadingTasks.value = false;
    // router.push({ name: 'AdminLogin' }); // 同样，避免在加载时强制跳转
    return;
  }

  try {
    const response = await fetch('/api/admin/milestone-tasks', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '获取里程碑任务列表失败');
    }
    milestoneTasksList.value = await response.json();
  } catch (error) {
    console.error('获取里程碑任务列表失败:', error);
    fetchTasksError.value = error.message || '获取里程碑任务列表时发生网络错误。';
  } finally {
    isLoadingTasks.value = false;
  }
};

// 创建前的确认函数
const confirmAndCreateMilestoneTask = () => {
  const confirmation = confirm(
    '您确定要创建新的里程碑任务吗？\n\n请注意：对于同一个邀请码，在任何时候都只能存在一个未完成的里程碑任务。'
  );
  if (confirmation) {
    handleCreateMilestoneTask();
  }
};

// 处理表单提交
const handleCreateMilestoneTask = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  // 客户端基本校验
  if (!title.value || !description.value || !selectedInviteCode.value || !targetValue.value || targetValue.value <= 0 || !unitOfMeasure.value || !startDate.value || !dueDate.value) {
    errorMessage.value = '所有字段均为必填项，且目标数值必须大于0。';
    isLoading.value = false;
    return;
  }

  const localStartDate = new Date(startDate.value);
  const localDueDate = new Date(dueDate.value);

  if (localStartDate >= localDueDate) {
    errorMessage.value = '截止日期必须晚于开始日期。';
    isLoading.value = false;
    return;
  }
  // 后端会校验至少7天，这里仅作基本前后校验

  const token = localStorage.getItem('admin_token');
  if (!token) {
    errorMessage.value = '管理员未登录或登录已过期。';
    isLoading.value = false;
    return;
  }

  const payload = {
    title: title.value,
    description: description.value,
    invite_code: selectedInviteCode.value,
    target_value: parseFloat(targetValue.value),
    unit_of_measure: unitOfMeasure.value,
    start_date: localStartDate.toISOString(),
    due_date: localDueDate.toISOString(),
    // sub_tasks: [] // MVP 阶段，暂时不发送子任务
  };

  try {
    const response = await fetch('/api/admin/milestone-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || `创建里程碑任务失败 (状态码: ${response.status})`);
    }

    successMessage.value = `里程碑任务 "${responseData.title}" 创建成功！`;
    // 清空表单
    title.value = '';
    description.value = '';
    selectedInviteCode.value = '';
    targetValue.value = null;
    unitOfMeasure.value = '';
    startDate.value = '';
    dueDate.value = '';

    await fetchMilestoneTasks(); // 创建成功后刷新列表

  } catch (error) {
    console.error('创建里程碑任务失败:', error);
    errorMessage.value = error.message || '创建里程碑任务时发生网络错误。';
    alert(`创建里程碑任务失败：\n${errorMessage.value}`);
  } finally {
    isLoading.value = false;
  }
};

// 辅助函数：格式化日期显示
const formatDisplayDate = (isoDateString) => {
  if (!isoDateString) return 'N/A';
  try {
    const date = new Date(isoDateString);
    // 返回 YYYY-MM-DD HH:MM 格式，如果需要更复杂的，可以使用库如 date-fns
    return date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\//g, '-');
  } catch (e) {
    return isoDateString; // 返回原始字符串如果解析失败
  }
};

// 辅助函数：获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    PLANNED: '计划中',
    ACTIVE: '进行中',
    TARGET_MET: '目标已达成',
    TARGET_MET_ACTIVE: '目标达成(可继续)',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
  };
  return statusMap[status] || status;
};

// 查看任务详情 (占位)
const viewTaskDetails = (taskId) => {
  alert(`查看任务详情: ${taskId} (功能待实现)`);
  // router.push({ name: 'AdminMilestoneTaskDetail', params: { id: taskId } }); // 未来路由
};

const goToTaskDetail = (milestoneId) => {
  if (milestoneId) {
    router.push({ name: 'AdminMilestoneTaskDetail', params: { milestoneId: String(milestoneId) } });
  } else {
    console.error('Milestone ID is undefined, cannot navigate to task detail.');
    alert('无法跳转到详情页面：任务ID未定义。');
  }
};

onMounted(() => {
  console.log('MilestoneTaskManager component mounted');
  fetchInviteCodes();
  fetchMilestoneTasks(); // 组件挂载时获取任务列表
});
</script>

<style scoped>
/* 可选: 添加特定于此页面的样式 */
.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

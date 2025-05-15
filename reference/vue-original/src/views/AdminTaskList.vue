<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">任务管理</h1>
      <div class="space-x-4">
        <button @click="openCreateForm"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
          发布任务
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>

    <div v-else-if="error" class="text-red-500 text-center">
      {{ error }}
    </div>

    <div v-else>
      <TaskHierarchy :tasks="tasks"
                     :is-set-focus-disabled-fn="isSetFocusDisabled"
                     @edit="editTask"
                     @view="viewTaskDetail"
                     @settle="settleTask"
                     @set-focus="setFocusTaskAdmin"
                     @unset-focus="unsetFocusTaskAdmin"
                     @delete="deleteTask" />
    </div>

    <!-- 创建/编辑任务表单 -->
    <div v-if="showCreateForm || editingTask"
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-6 sticky top-0 bg-white pb-4 border-b">
          {{ editingTask ? '编辑任务' : '发布任务' }}
        </h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" for="title">
              任务标题
            </label>
            <input
              id="title"
              v-model="taskForm.title"
              type="text"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
          </div>
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" for="description">
              任务描述
            </label>
            <textarea
              id="description"
              v-model="taskForm.description"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="4"
              required
            ></textarea>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="points">
              基础积分
            </label>
            <input type="number"
                   id="points"
                   v-model="taskForm.points"
                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                   required
                   min="1">
          </div>

          <!-- Comment out this entire div to hide the leaderboard image functionality in the modal -->
          <!--
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" for="taskForm_leaderboard_image_file">
              排行榜背景图片 (可选)
            </label>
            <input
              id="taskForm_leaderboard_image_file"
              type="file"
              @change="handleModalFileChange"
              accept="image/png, image/jpeg, image/gif"
              class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            >
            <p v-if="uploadingModalImage" class="text-sm text-blue-500 mt-1">图片上传中...</p>
            <p v-if="modalUploadError" class="text-sm text-red-500 mt-1">{{ modalUploadError }}</p>
            <div v-if="taskForm.leaderboard_image_url" class="mt-2">
              <p class="text-sm text-green-600">当前背景图:</p>
              <img :src="getModalImageFullUrl(taskForm.leaderboard_image_url)" alt="排行榜背景" class="max-h-40 rounded mt-1 border">
              <div class="flex items-center justify-between mt-1">
                <p class="text-xs text-gray-500 break-all">{{ taskForm.leaderboard_image_url }}</p>
                <button
                  type="button"
                  @click="clearModalLeaderboardImage"
                  class="ml-2 text-xs text-red-500 hover:text-red-700 focus:outline-none"
                >
                  移除图片
                </button>
              </div>
            </div>
          </div>
          -->

          <div class="flex items-center">
            <input
              id="flame_mode"
              v-model="taskForm.flame_mode_enabled"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            >
            <label for="flame_mode" class="ml-2 block text-sm text-gray-900">
              启用浴火模式（允许重复提交）
            </label>
          </div>
          <div class="flex items-center">
            <input
              id="time_limit_mode"
              v-model="taskForm.time_limit_mode"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            >
            <label for="time_limit_mode" class="ml-2 block text-sm text-gray-900">
              启用限时模式
            </label>
          </div>
          <div v-if="taskForm.time_limit_mode" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                截止时间点
              </label>
              <input type="datetime-local"
                     v-model="taskForm.due_date"
                     class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                按时完成奖励积分
              </label>
              <input type="number"
                     v-model="taskForm.bonus_points"
                     min="0"
                     class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     required>
            </div>
          </div>

          <!-- 邀请码选择区域 -->
          <div v-if="!taskForm.time_limit_mode" class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="task_due_date">
              截止日期 (普通任务)
            </label>
            <input
              id="task_due_date"
              v-model="taskForm.due_date"
              type="date"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="invite_code">
              关联邀请码
            </label>
            <div v-if="inviteCodeError" class="text-red-500 text-sm mb-2">
              {{ inviteCodeError }}
              <button v-if="activeInviteCodes.length === 0"
                      type="button"
                      @click="router.push('/admin/invite-codes')"
                      class="ml-2 text-blue-500 hover:text-blue-700 underline">
                去创建
              </button>
            </div>
            <div v-if="activeInviteCodes.length > 0">
              <select id="invite_code"
                      v-model="selectedInviteCodeId"
                      :disabled="activeInviteCodes.length === 0"
                      class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option v-if="activeInviteCodes.length === 0" :value="null" disabled>
                  没有可用的邀请码
                </option>
                <option v-for="code in activeInviteCodes" :key="code.id" :value="code.id">
                  {{ code.description || code.code }} ({{ code.code }})
                </option>
              </select>
              <p v-if="activeInviteCodes.length === 1 && selectedInviteCodeId" class="text-sm text-gray-600 mt-1">
                将自动关联到邀请码: {{ activeInviteCodes[0].description || activeInviteCodes[0].code }}
              </p>
            </div>
            <p v-else-if="!inviteCodeError && activeInviteCodes.length === 0 && (showCreateForm || editingTask)" class="text-sm text-gray-500">
              正在加载邀请码... 或没有有效的邀请码。
            </p>
          </div>

          <div class="flex justify-end space-x-2 sticky bottom-0 bg-white pt-4 border-t">
            <button type="button"
                    @click="cancelForm"
                    class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors">
              取消
            </button>
            <button type="submit"
                    :disabled="activeInviteCodes.length === 0 && !inviteCodeError"
                    class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    :class="{ 'opacity-50 cursor-not-allowed': activeInviteCodes.length === 0 && !inviteCodeError }">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 通用确认对话框 -->
    <div v-if="showConfirmDialog"
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
        <h3 class="text-lg font-bold mb-4">{{ confirmDialogTitle }}</h3>
        <p class="mb-6">{{ confirmDialogMessage }}</p>
        <div class="flex justify-end space-x-3">
          <button @click="cancelConfirm"
                  class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors">
            取消
          </button>
          <button @click="handleConfirm"
                  :class="customConfirmButtonText === '知道了' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'"
                  class="px-4 py-2 text-white rounded transition-colors">
            {{ customConfirmButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/utils/api.js'
import TaskHierarchy from '../components/TaskHierarchy.vue'

const router = useRouter()
const tasks = ref([])
const loading = ref(true)
const error = ref('')
const showCreateForm = ref(false)
const editingTask = ref(null)
const activeInviteCodes = ref([])
const selectedInviteCodeId = ref(null)
const inviteCodeError = ref('')

// Refs for modal image upload
const uploadingModalImage = ref(false)
const modalUploadError = ref(null)

// Refs for Confirmation Dialog
const showConfirmDialog = ref(false)
const confirmDialogTitle = ref('')
const confirmDialogMessage = ref('')
const confirmAction = ref(null) // Stores a function to be called on confirm
const confirmActionArgs = ref([]) // Stores arguments for the confirmAction function
const customConfirmButtonText = ref('确认')

// Initialize taskForm with properties from user's recovered code
const taskForm = ref({
  id: null,
  title: '',
  description: '',
  points: 1,
  due_date: '', // 将用于存储 datetime-local string 或 date string
  flame_mode_enabled: true,
  time_limit_mode: false,
  bonus_points: 0, // 保留 bonus_points，用于按时完成的奖励
  invite_code_id: null, // Tracks the ID from the select dropdown
  leaderboard_image_url: '' // 新增字段
})

// Helper to get full image URL for display
const getImageFullUrl = (relativeUrl) => {
  if (!relativeUrl) return '';
  const base = apiClient.defaults.baseURL.replace(/\/+$/, '');
  const path = relativeUrl.replace(/^\/+/, '');
  return `${base}/${path}`;
}

const getModalImageFullUrl = (relativeUrl) => {
  if (!relativeUrl) return '';
  // 假设 apiClient 已经配置好 baseURL
  const base = apiClient.defaults.baseURL.replace(/\/+$/, '');
  const path = relativeUrl.replace(/^\/+/, '');
  return `${base}/${path}`;
};

const handleModalFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) {
    modalUploadError.value = null;
    // taskForm.value.leaderboard_image_url = ''; // Optionally clear if selection is cancelled
    return
  }
  await uploadModalLeaderboardImage(file)
}

const uploadModalLeaderboardImage = async (file) => {
  if (!file) return

  uploadingModalImage.value = true
  modalUploadError.value = null
  const formData = new FormData()
  formData.append('leaderboard_image', file)

  try {
    const response = await apiClient.post('/api/admin/upload_leaderboard_image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    taskForm.value.leaderboard_image_url = response.data.image_url
    console.log('模态框图片上传成功:', response.data.image_url)
  } catch (err) {
    console.error('模态框图片上传失败:', err)
    modalUploadError.value = err.response?.data?.error || err.message || '图片上传失败'
    taskForm.value.leaderboard_image_url = '' // Clear URL on error
  } finally {
    uploadingModalImage.value = false
  }
}

// formatDate utility function
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // More robust formatting, adjust options as needed
  try {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      // second: '2-digit', // Optional: if you need seconds
      hour12: false
    });
  } catch (e) {
    console.warn('Error formatting date:', e, dateString);
    return dateString; // Fallback to original string if an error occurs
  }
};

// activeTasks computed property
const activeTasks = computed(() => {
  if (!Array.isArray(tasks.value)) return [];
  const filteredTasks = tasks.value.filter(task => task.status === 'active' || !task.status);
  // Sort by created_at descending, most recent first
  return filteredTasks.sort((a, b) => {
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return dateB.getTime() - dateA.getTime();
  });
});

// Confirmation Dialog Functions
const openConfirmDialog = (title, message, action, args = [], confirmButtonText = '确认') => {
  confirmDialogTitle.value = title;
  confirmDialogMessage.value = message;
  confirmAction.value = action; // This should be the actual function to call
  confirmActionArgs.value = args;
  customConfirmButtonText.value = confirmButtonText; // 保存自定义按钮文字
  showConfirmDialog.value = true;
};

const handleConfirm = async () => {
  if (typeof confirmAction.value === 'function') {
    try {
      await confirmAction.value(...confirmActionArgs.value);
    } catch (err) {
      console.error('Error executing confirm action:', err);
      // Optionally show a generic error to the user if the action itself doesn't handle it
      alert('执行确认操作时发生错误。');
    }
  }
  showConfirmDialog.value = false;
  confirmAction.value = null;
  confirmActionArgs.value = [];
};

const cancelConfirm = () => {
  showConfirmDialog.value = false;
  confirmAction.value = null;
  confirmActionArgs.value = [];
};

const fetchActiveInviteCodes = async () => {
  inviteCodeError.value = ''
  try {
    const response = await apiClient.get('/api/admin/invite-codes')
    activeInviteCodes.value = response.data.filter(code => code.status === 'active')

    if (activeInviteCodes.value.length === 0) {
      inviteCodeError.value = '没有可用的有效邀请码，请先前往邀请码管理页面创建。'
      selectedInviteCodeId.value = null
    } else if (activeInviteCodes.value.length === 1 && !editingTask.value) { // Only auto-select for new tasks if one code
      selectedInviteCodeId.value = activeInviteCodes.value[0].id
    } else if (editingTask.value && editingTask.value.invite_code_id && activeInviteCodes.value.some(code => code.id === editingTask.value.invite_code_id)) {
      // If editing and task has a valid invite_code_id, preselect it
      selectedInviteCodeId.value = editingTask.value.invite_code_id
    } else if (activeInviteCodes.value.length > 0 && !editingTask.value) { // Default to first for new task if multiple codes
      selectedInviteCodeId.value = activeInviteCodes.value[0].id
    } else if (!editingTask.value) { // No specific selection logic matched for new task, ensure it's null or first
      selectedInviteCodeId.value = activeInviteCodes.value.length > 0 ? activeInviteCodes.value[0].id : null
    }
    // If editing and no specific invite code was matched, selectedInviteCodeId might remain null or its previous value
    // This ensures taskForm.invite_code_id is also updated if it's a new task or selection changes
    if (taskForm.value && (!editingTask.value || !taskForm.value.invite_code_id)) {
      taskForm.value.invite_code_id = selectedInviteCodeId.value
    }

  } catch (err) {
    console.error('获取邀请码列表失败:', err)
    inviteCodeError.value = '获取邀请码列表失败，请稍后重试。'
    activeInviteCodes.value = []
    selectedInviteCodeId.value = null
  }
}

const openCreateForm = async () => {
  resetForm() // Resets taskForm, editingTask, showCreateForm
  editingTask.value = null // Ensure it's a new task
  await fetchActiveInviteCodes() // Fetch codes
  // selectedInviteCodeId might be set by fetchActiveInviteCodes, sync to taskForm
  if (taskForm.value) {
    taskForm.value.invite_code_id = selectedInviteCodeId.value
  }
  showCreateForm.value = true
}

const fetchTasks = async () => {
  loading.value = true
  error.value = ''
  console.log('[AdminTaskList] fetchTasks: 开始获取 /api/admin/tasks')
  try {
    const response = await apiClient.get('/api/admin/tasks')
    console.log('[AdminTaskList] fetchTasks: 收到响应:', response.data)
    if (Array.isArray(response.data)) {
      tasks.value = response.data
    } else {
      console.warn('[AdminTaskList] fetchTasks: API返回的不是一个数组!', response.data)
      tasks.value = []
      error.value = '获取到的任务数据格式不正确。'
    }
  } catch (err) {
    console.error('[AdminTaskList] fetchTasks: 获取任务列表失败:', err)
    error.value = err.response?.data?.error || err.message || '获取任务列表失败。'
    if (err.response?.status === 401) {
      router.push('/admin/login')
    }
  } finally {
    loading.value = false
  }
}

const editTask = async (task) => {
  resetForm() // Clear form and reset states first
  editingTask.value = { ...task }; // Store a shallow copy for checks, form will use deep copy

  // Populate taskForm with the task's data (Deep copy for target_phases)
  taskForm.value = {
    title: task.title,
    description: task.description,
    points: task.points,
    due_date: task.due_date
                ? (task.time_limit_mode && task.due_date.includes('T') // 假设限时任务的 due_date 是完整 ISO
                    ? task.due_date.substring(0, 16) // "YYYY-MM-DDTHH:MM" for datetime-local
                    : task.due_date.split('T')[0]) // "YYYY-MM-DD" for date
                : '',
    flame_mode_enabled: task.flame_mode_enabled,
    time_limit_mode: task.time_limit_mode || false,
    bonus_points: task.bonus_points || 0,
    invite_code_id: task.invite_code_id || null,
    leaderboard_image_url: task.leaderboard_image_url || '' // Populate with existing URL
  }

  // Clear any previous modal upload errors when opening for edit
  modalUploadError.value = null;
  uploadingModalImage.value = false; // Ensure upload status is reset

  await fetchActiveInviteCodes()

  if (task.invite_code_id && activeInviteCodes.value.some(code => code.id === task.invite_code_id)) {
    selectedInviteCodeId.value = task.invite_code_id
  } else if (activeInviteCodes.value.length > 0) {
    selectedInviteCodeId.value = activeInviteCodes.value[0].id
  } else {
    selectedInviteCodeId.value = null
  }
  taskForm.value.invite_code_id = selectedInviteCodeId.value

  showCreateForm.value = true
}

const viewTaskDetail = (task) => {
  router.push(`/admin/task/${task.id}`)
}

const settleTask = async (task) => {
  console.log('尝试结算任务:', task);
  if (!task || !task.id) {
    console.error('结算任务失败：任务ID无效', task);
    alert('结算任务失败：任务ID无效。');
    return;
  }
  try {
    // 调用API将任务状态更新为 'completed'
    // 后端 /settle 接口通常是 POST，并且可能不需要请求体，或者只需要一个简单的状态
    // 我们需要根据后端 settle 接口的实际定义来调整这里的请求方法和请求体
    // 暂时假设它是 POST 且不需要复杂请求体
    await apiClient.post(`/api/admin/tasks/${task.id}/settle`);
    alert('任务结算成功');
    fetchTasks(); // 重新获取任务列表
  } catch (err) {
    console.error('结算任务失败:', err);
    alert(err.response?.data?.error || err.message || '结算任务失败，请重试');
  }
}

const deleteTask = async (taskToDelete) => {
  openConfirmDialog(
    '确认删除任务',
    `确定要删除任务 "${taskToDelete.title}" 吗？此操作不可恢复，且会移除所有相关的参与记录。`,
    async () => {
      try {
        await apiClient.delete(`/api/admin/tasks/${taskToDelete.id}`)
        alert('任务删除成功！')
        fetchTasks() // Refresh tasks list
      } catch (error) {
        console.error('删除任务失败:', error)
        alert(error.response?.data?.error || error.message || '删除任务失败，请重试')
      }
    }
  );
}

const cancelForm = () => {
  resetForm() // This will also set showCreateForm to false
}

const resetForm = () => {
  taskForm.value = {
    id: null,
    title: '',
    description: '',
    points: 1,
    due_date: '', // 新的默认：如果是 datetime-local，需要 YYYY-MM-DDTHH:MM 格式
    flame_mode_enabled: true,
    time_limit_mode: false,
    bonus_points: 0,
    invite_code_id: null,
    leaderboard_image_url: '' // Reset field
  }
  editingTask.value = null
  showCreateForm.value = false
  inviteCodeError.value = ''

  // Reset modal image upload states
  uploadingModalImage.value = false
  modalUploadError.value = null

  // Reset selected invite code, preferring the first if available (for new tasks)
  if (activeInviteCodes.value.length > 0) {
    selectedInviteCodeId.value = activeInviteCodes.value[0].id
    // Sync this default to taskForm for a new form
    if (taskForm.value) taskForm.value.invite_code_id = selectedInviteCodeId.value
  } else {
    selectedInviteCodeId.value = null
    if (taskForm.value) taskForm.value.invite_code_id = null
  }
}

const _performSaveTask = async (payload) => {
  let responseMessage = '';
  if (editingTask.value) {
    await apiClient.put(`/api/admin/tasks/${editingTask.value.id}`, payload);
    responseMessage = '任务更新成功！';
  } else {
    await apiClient.post('/api/admin/tasks', payload);
    responseMessage = '任务发布成功！';
  }
  resetForm();
  await fetchTasks();
  alert(responseMessage);
};

const handleSubmit = async () => {
  // event.preventDefault() is now handled by @submit.prevent in template

  if (!selectedInviteCodeId.value && activeInviteCodes.value.length > 0 && !editingTask.value) {
    console.log('[Debug] handleSubmit: Exiting - Invite code not selected but active codes exist for new task.');
    alert('请选择一个有效的邀请码。')
    return
  }
  if (activeInviteCodes.value.length === 0 && !editingTask.value) {
    console.log('[Debug] handleSubmit: Exiting - No active invite codes for new task.');
    alert('没有可用的邀请码，无法发布新任务。请先创建邀请码。')
    return
  }

  const selectedCodeObject = activeInviteCodes.value.find(code => code.id === selectedInviteCodeId.value)
  let inviteCodeString = null;
  if (selectedCodeObject) {
    inviteCodeString = selectedCodeObject.code;
  } else if (editingTask.value) { // Check editingTask.value itself, not editingTask.value.invite_code directly as it might not exist
     const originalTaskDetails = tasks.value.find(t => t.id === editingTask.value.id);
     if (originalTaskDetails && originalTaskDetails.invite_code) {
        inviteCodeString = originalTaskDetails.invite_code;
     } // If original task had no invite code, inviteCodeString remains null
  }

  if (!inviteCodeString && !editingTask.value) {
      console.log('[Debug] handleSubmit: Exiting - Could not determine inviteCodeString for new task.');
      alert('无法确定邀请码（新任务必须有关联邀请码）。请刷新或重新选择。');
      return;
  }
  // For an existing task, inviteCodeString might be null if it never had one and none is selected now.
  // Backend should decide if this is acceptable for an update.

  // 准备 payload.due_date
  let finalDueDate = '';
  if (taskForm.value.due_date) {
    if (taskForm.value.time_limit_mode) {
      // time_limit_mode is true, due_date is from datetime-local (e.g., "YYYY-MM-DDTHH:MM")
      // Convert to UTC ISO string
      finalDueDate = new Date(taskForm.value.due_date).toISOString();
    } else {
      // time_limit_mode is false, due_date is from date input (e.g., "YYYY-MM-DD")
      // Convert to end of that day in UTC ISO string
      const dateOnly = taskForm.value.due_date;
      finalDueDate = new Date(dateOnly + "T23:59:59.999Z").toISOString();
    }
  } else {
    alert('截止日期/时间不能为空。');
    return;
  }

  const payload = {
    ...taskForm.value,
    due_date: finalDueDate, // 使用处理后的 due_date
    invite_code: inviteCodeString,
  };

  // 由于 ...taskForm.value 包含了 invite_code_id，我们应该从 payload 中删除它
  if ('invite_code_id' in payload) {
    delete payload.invite_code_id;
  }
  // 移除旧的 time_limit 字段，如果它通过 ...taskForm.value 被包含
  if ('time_limit' in payload) {
    delete payload.time_limit;
  }

  // Ensure main points is a valid integer and >= 1 (based on form min="1")
  if (taskForm.value.points === null || taskForm.value.points === undefined || String(taskForm.value.points).trim() === '') {
    console.log('[Debug] handleSubmit: Exiting - Points field is empty.');
    alert('基础积分不能为空。');
    return;
  }
  const parsedPoints = parseInt(String(taskForm.value.points), 10);
  if (isNaN(parsedPoints) || parsedPoints < 1) {
    console.log('[Debug] handleSubmit: Exiting - Points field is not a valid positive integer.');
    alert('基础积分必须是一个大于或等于1的有效整数。');
    return;
  }
  payload.points = parsedPoints; // Assign parsed integer to payload

  console.log('Final payload being sent to backend:', JSON.parse(JSON.stringify(payload))); // 打印最终的 payload

  try {
    if (editingTask.value) {
      const originalTask = tasks.value.find(t => t.id === editingTask.value.id);
      if (!originalTask) {
          alert('错误：无法找到正在编辑的原始任务信息。请刷新列表后重试。');
          return;
      }

      const hasParticipants = originalTask.participants_count && originalTask.participants_count > 0;

      // Robustly compare points, ensuring both are numbers for comparison
      const originalTaskPointsNum = parseInt(String(originalTask.points), 10);
      let pointsHaveChanged = false;
      if (isNaN(originalTaskPointsNum)) { // If original points was not a number, consider it changed if new points is valid
        pointsHaveChanged = true;
      } else {
        pointsHaveChanged = originalTaskPointsNum !== payload.points;
      }

      if (hasParticipants && pointsHaveChanged) {
        openConfirmDialog(
          '确认修改积分',
          '该任务已有用户参与/完成。更改基础积分可能不会影响已参与用户的得分。确定要修改吗？',
          async () => { await _performSaveTask(payload); }
        );
        return; // Wait for user confirmation
      }
    }
    await _performSaveTask(payload);

  } catch (err) {
    console.error('任务保存失败:', err);
    let errorMsg = '任务保存失败，请重试。';
    if (err.response && err.response.data && err.response.data.error) {
      errorMsg = err.response.data.error;
    } else if (err.message) {
      errorMsg = err.message;
    }
    alert(errorMsg);
  }
}

const clearModalLeaderboardImage = () => {
  taskForm.value.leaderboard_image_url = '';
  modalUploadError.value = null;
  uploadingModalImage.value = false;
  const fileInput = document.getElementById('taskForm_leaderboard_image_file'); // ID 对应模态框中的文件输入
  if (fileInput) {
    fileInput.value = ""; // 清空文件选择
  }
  console.log('模态框中的排行榜背景图片已清除');
};

onMounted(async () => {
  console.log('[AdminTaskList] onMounted: 组件已挂载，将调用 fetchTasks。')
  await fetchTasks()
  // Optionally, fetch invite codes on mount if the form might be initially open
  // or if there's a general need for them.
  // await fetchActiveInviteCodes()
})

// Watcher for selectedInviteCodeId to update taskForm.invite_code_id
// This helps keep taskForm in sync if user changes dropdown for a NEW task form
// For editing, editTask() handles initial population.
watch(selectedInviteCodeId, (newVal) => {
  if (taskForm.value && !editingTask.value) { // Primarily for new task form
    taskForm.value.invite_code_id = newVal
  }
})

// Watcher for time_limit_mode to clear or pre-fill due_date
watch(() => taskForm.value.time_limit_mode, (isTimeLimited) => {
  if (isTimeLimited) {
    // 当切换到限时模式时，如果 due_date 是 YYYY-MM-DD 格式，尝试转换为 YYYY-MM-DDTHH:00
    // 或清空，让用户必须选择精确时间
    if (taskForm.value.due_date && taskForm.value.due_date.length === 10) { // 是 YYYY-MM-DD
      const today = new Date();
      const hours = String(today.getHours()).padStart(2, '0');
      const minutes = String(today.getMinutes()).padStart(2, '0');
      taskForm.value.due_date = `${taskForm.value.due_date}T${hours}:${minutes}`;
    } else if (!taskForm.value.due_date) {
      // 如果为空，可以设置一个默认的未来时间
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0); //中午12点
      taskForm.value.due_date = tomorrow.toISOString().substring(0, 16); // YYYY-MM-DDTHH:MM
    }
  } else {
    // 当切换到普通模式时，如果 due_date 是 YYYY-MM-DDTHH:MM 格式，取日期部分
    if (taskForm.value.due_date && taskForm.value.due_date.includes('T')) {
      taskForm.value.due_date = taskForm.value.due_date.split('T')[0];
    } else if (!taskForm.value.due_date) {
        // 如果为空，可以设置一个默认的未来日期
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        taskForm.value.due_date = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
    }
  }
});

// Watcher for showCreateForm - useful if we want to fetch codes only when form opens
// However, openCreateForm and editTask already call fetchActiveInviteCodes.
// This watch might be for specific edge cases or could be redundant.
watch(showCreateForm, async (newValue) => {
  if (newValue) { // When form opens
    // If not editing an existing task, or if it is but invite codes haven't been loaded for it
    if (!editingTask.value || (editingTask.value && activeInviteCodes.value.length === 0)) {
      // await fetchActiveInviteCodes() // fetchActiveInviteCodes is already called in openCreateForm and editTask
    }
    // The original comment was "// ... existing code ..."
    // This implies there might have been other logic here.
    // For now, let's ensure focus or other setup if needed.
  }
})

// Placeholder for focus-related functions if they are to be added back.
// They were not in the user's "recovered from timeline" paste.
const focusTasksCountByInviteCode = computed(() => {
  const counts = {};
  if (tasks.value && Array.isArray(tasks.value)) {
    tasks.value.forEach(task => {
      if (task.is_focus_task && task.invite_code && task.status === 'active') { // 确保 task.invite_code 存在
        counts[task.invite_code] = (counts[task.invite_code] || 0) + 1;
      }
    });
  }
  return counts;
});

const isSetFocusDisabled = (inviteCode) => {
  const MAX_FOCUS_TASKS_PER_INVITE_CODE = 2; // 或者从配置读取
  if (!inviteCode) return true; // 如果没有邀请码，则禁用
  return (focusTasksCountByInviteCode.value[inviteCode] || 0) >= MAX_FOCUS_TASKS_PER_INVITE_CODE;
};

const setFocusTaskAdmin = async (task) => {
  const confirmationMessage = "将此任务设为焦点吗？\\n\\n请注意：\\n• 24小时锁定：一旦设置，此邀请码下的焦点任务状态在24小时内将无法再次更改或取消。\\n• 积分双倍：设为焦点后，粉丝完成此任务将获得双倍积分。\\n\\n确定要立即设置吗？";
  if (!window.confirm(confirmationMessage)) {
    return; // 用户选择"稍后设置"或取消
  }

  try {
    loading.value = true;
    await apiClient.post(`/api/admin/tasks/${task.id}/set-focus`);
    await fetchTasks(); // Refresh tasks list to show updated focus status
    alert('焦点任务设置成功！');
  } catch (err) {
    console.error('设置焦点任务失败:', err);
    const errorMessage = err.response?.data?.error || err.response?.data?.message || '设置焦点任务失败，请稍后再试或检查后台日志。';
    alert(`设置焦点任务失败: ${errorMessage}`);
  } finally {
    loading.value = false;
  }
};

const unsetFocusTaskAdmin = async (task) => {
  try {
    loading.value = true;
    await apiClient.post(`/api/admin/tasks/${task.id}/unset-focus`);
    await fetchTasks(); // Refresh tasks list
    alert('焦点任务已取消。');
  } catch (err) {
    console.error('取消焦点任务失败:', err);
    if (err.response && err.response.status === 403 && err.response.data && err.response.data.error) {
        // 专门处理冷却期错误
        const coolingErrorMsg = err.response.data.error;
        // 尝试从错误信息中提取上次修改时间和冷却结束时间，如果后端返回了的话
        // 例如: "焦点任务状态在24小时内只能修改一次。上次修改时间：YYYY-MM-DD HH:MM:SS UTC。 请在北京时间 YYYY-MM-DD HH:MM 之后再试。"
        // 这里我们直接显示后端返回的完整冷却错误信息，因为它已经包含了用户需要的信息。
        openConfirmDialog(
          '操作限制',
          coolingErrorMsg, // 直接使用后端返回的详细错误信息
          () => {}, // 什么也不做，只是一个信息提示框
          [],
          '知道了' // 自定义确认按钮文字
        );
    } else {
        const errorMessage = err.response?.data?.error || err.response?.data?.message || '取消焦点任务失败，请稍后再试或检查后台日志。';
        alert(`取消焦点任务失败: ${errorMessage}`);
    }
  } finally {
    loading.value = false;
  }
};

</script>

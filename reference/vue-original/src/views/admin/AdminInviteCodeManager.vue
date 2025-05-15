<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">邀请码管理</h1>
    </div>

    <!-- 创建邀请码表单 -->
    <div class="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">创建新邀请码</h2>
      <form @submit.prevent="handleCreateInviteCode" class="space-y-4">
        <div>
          <label for="customCode" class="block text-sm font-medium text-gray-700">自定义邀请码 (可选)</label>
          <input type="text" id="customCode" v-model="newInviteCode.custom_code"
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                 placeholder="例如：VIP2024">
        </div>
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">描述 (可选)</label>
          <input type="text" id="description" v-model="newInviteCode.description"
                 class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                 placeholder="例如：用于XX活动">
        </div>
        <div class="flex justify-end">
          <button type="submit"
                  class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  :disabled="isCreating">
            {{ isCreating ? '创建中...' : '创建邀请码' }}
          </button>
        </div>
      </form>
      <p v-if="createError" class="text-red-500 mt-2 text-sm">{{ createError }}</p>
    </div>

    <!-- 邀请码列表 -->
    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">邀请码列表</h2>
      <div v-if="isLoading" class="text-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-2 text-gray-600">加载中...</p>
      </div>
      <div v-else-if="loadError" class="text-red-500 text-center py-4">
        {{ loadError }}
      </div>
      <div v-else-if="inviteCodes.length === 0" class="text-gray-500 text-center py-4">
        暂无邀请码。
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邀请码</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建日期</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="code in inviteCodes" :key="code.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ code.code }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ code.description || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="code.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ code.status === 'active' ? '有效' : '已作废' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(code.created_at) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button @click="toggleVoidInviteCode(code)"
                        :class="code.status === 'active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'"
                        class="disabled:opacity-50" :disabled="isTogglingStatus[code.id]">
                  {{ code.status === 'active' ? '作废' : '激活' }}
                  <span v-if="isTogglingStatus[code.id]">(...)</span>
                </button>
                <button @click="openEditModal(code)" class="text-blue-600 hover:text-blue-900">编辑</button>
                <button @click="confirmDeleteInviteCode(code.id)" class="text-red-600 hover:text-red-900 disabled:opacity-50" :disabled="isDeleting[code.id]">
                  删除 <span v-if="isDeleting[code.id]">(...)</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 编辑邀请码模态框 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeEditModal">
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 class="text-lg font-semibold mb-4">编辑邀请码</h3>
        <form @submit.prevent="handleUpdateInviteCode">
          <div>
            <label for="editDescription" class="block text-sm font-medium text-gray-700">描述</label>
            <input type="text" id="editDescription" v-model="editingInviteCode.description"
                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button type="button" @click="closeEditModal" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              取消
            </button>
            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    :disabled="isUpdating">
              {{ isUpdating ? '更新中...' : '保存更改' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../../utils/api'; // 确保路径正确

const router = useRouter();

const inviteCodes = ref([]);
const isLoading = ref(true);
const loadError = ref('');
const isCreating = ref(false);
const createError = ref('');
const newInviteCode = reactive({
  custom_code: '',
  description: ''
});

const showEditModal = ref(false);
const editingInviteCode = ref(null); // Store the full code object being edited
const isUpdating = ref(false);

const isTogglingStatus = reactive({}); // For individual loading state for void/activate
const isDeleting = reactive({}); // For individual loading state for delete

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('zh-CN', { dateStyle: 'short', timeStyle: 'short' });
};

const fetchInviteCodes = async () => {
  console.log('开始获取邀请码列表...');
  isLoading.value = true;
  loadError.value = '';
  let retryCount = 0;
  const maxRetries = 3;

  const tryFetch = async () => {
    try {
      console.log('发送获取邀请码请求...');
      const response = await apiClient.get('/api/admin/invite-codes');
      console.log('获取邀请码响应:', response.data);

      inviteCodes.value = response.data;
      loadError.value = '';
    } catch (err) {
      console.error("获取邀请码列表失败:", {
        error: err,
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      if (err.response?.status === 401) {
        loadError.value = '登录已过期，请重新登录';
        router.push('/admin/login');
      } else if (retryCount < maxRetries) {
        retryCount++;
        console.log(`重试获取邀请码列表 (${retryCount}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // 递增延迟
        await tryFetch();
      } else {
        loadError.value = err.response?.data?.error || '获取邀请码列表失败，请稍后重试。';
      }
    }
  };

  await tryFetch();
  isLoading.value = false;
};

const handleCreateInviteCode = async () => {
  isCreating.value = true;
  createError.value = '';
  try {
    const payload = {};
    if (newInviteCode.custom_code) {
      payload.custom_code = newInviteCode.custom_code;
    }
    if (newInviteCode.description) {
      payload.description = newInviteCode.description;
    }
    const response = await apiClient.post('/api/admin/invite-codes', payload);
    inviteCodes.value.push(response.data);
    newInviteCode.custom_code = '';
    newInviteCode.description = '';
  } catch (err) {
    console.error("创建邀请码失败:", err);
    if (err.response?.status === 401) {
      createError.value = '登录已过期，请重新登录';
      router.push('/admin/login');
    } else {
      createError.value = err.response?.data?.error || '创建邀请码失败，请检查输入或稍后再试。';
    }
  } finally {
    isCreating.value = false;
  }
};

const toggleVoidInviteCode = async (codeToToggle) => {
  isTogglingStatus[codeToToggle.id] = true;
  const originalStatus = codeToToggle.status;
  const newStatus = originalStatus === 'active' ? 'inactive' : 'active';

  try {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      alert('未找到管理员令牌，请重新登录');
      router.push('/admin/login');
      return;
    }

    if (originalStatus === 'active') {
      await apiClient.put(`/api/admin/invite-codes/${codeToToggle.id}/void`, {}, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      const index = inviteCodes.value.findIndex(ic => ic.id === codeToToggle.id);
      if (index !== -1) {
        inviteCodes.value[index].status = 'inactive';
      }
    } else {
      await apiClient.put(`/api/admin/invite-codes/${codeToToggle.id}`, { status: 'active' }, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      const index = inviteCodes.value.findIndex(ic => ic.id === codeToToggle.id);
      if (index !== -1) {
        inviteCodes.value[index].status = 'active';
      }
    }
  } catch (err) {
    console.error(`操作邀请码 ${codeToToggle.code} 失败:`, err);
    if (err.response?.status === 401) {
      alert('登录已过期，请重新登录');
      router.push('/admin/login');
    } else {
      alert(err.response?.data?.error || '操作失败');
    }
  } finally {
    isTogglingStatus[codeToToggle.id] = false;
  }
};

const openEditModal = (code) => {
  editingInviteCode.value = { ...code }; // Create a copy to edit
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingInviteCode.value = null;
};

const handleUpdateInviteCode = async () => {
  if (!editingInviteCode.value) return;
  isUpdating.value = true;
  try {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      alert('未找到管理员令牌，请重新登录');
      router.push('/admin/login');
      return;
    }

    const response = await apiClient.put(`/api/admin/invite-codes/${editingInviteCode.value.id}`, {
      description: editingInviteCode.value.description
    }, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    const index = inviteCodes.value.findIndex(ic => ic.id === editingInviteCode.value.id);
    if (index !== -1) {
      inviteCodes.value[index] = response.data;
    }
    closeEditModal();
  } catch (err) {
    console.error("更新邀请码失败:", err);
    if (err.response?.status === 401) {
      alert('登录已过期，请重新登录');
      router.push('/admin/login');
    } else {
      alert(err.response?.data?.error || '更新失败');
    }
  } finally {
    isUpdating.value = false;
  }
};

const confirmDeleteInviteCode = async (codeId) => {
  if (window.confirm('确定要删除这个邀请码吗？此操作不可恢复。')) {
    isDeleting[codeId] = true;
    try {
      const adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        alert('未找到管理员令牌，请重新登录');
        router.push('/admin/login');
        return;
      }

      await apiClient.delete(`/api/admin/invite-codes/${codeId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      inviteCodes.value = inviteCodes.value.filter(ic => ic.id !== codeId);
    } catch (err) {
      console.error("删除邀请码失败:", err);
      if (err.response?.status === 401) {
        alert('登录已过期，请重新登录');
        router.push('/admin/login');
      } else {
        alert(err.response?.data?.error || '删除失败');
      }
    } finally {
      isDeleting[codeId] = false;
    }
  }
};

onMounted(() => {
  console.log('AdminInviteCodeManager 组件已挂载');
  fetchInviteCodes();
});

</script>

<style scoped>
/* Add any specific styles if needed */
</style>

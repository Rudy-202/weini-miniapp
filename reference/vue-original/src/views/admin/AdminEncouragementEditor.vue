<template>
  <div class="p-6 bg-gray-100 min-h-screen dark:bg-gray-900">
    <h1 class="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">鼓励弹窗设置</h1>

    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6">

      <div>
        <h2 class="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">全局鼓励图片</h2>
        <div class="space-y-3">
          <div>
            <label for="globalEncouragementImage" class="block text-sm font-medium text-gray-700 dark:text-gray-300">上传新图片 (将替换现有图片):</label>
            <input
              type="file"
              id="globalEncouragementImage"
              @change="handleFileChange"
              accept="image/*"
              class="mt-1 block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            />
            <p v-if="uploadingImage" class="mt-1 text-sm text-blue-600 dark:text-blue-400">图片上传中...</p>
            <p v-if="uploadError" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ uploadError }}</p>
          </div>

          <div v-if="globalSettings.default_encouragement_image_url">
            <p class="block text-sm font-medium text-gray-700 dark:text-gray-300">当前图片预览:</p>
            <img
              :src="getImageFullUrl(globalSettings.default_encouragement_image_url)"
              alt="全局鼓励图片预览"
              class="mt-1 rounded-md max-h-60 w-auto object-contain border dark:border-gray-600"
            />
            <button
              @click="clearImage"
              class="mt-2 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 dark:bg-red-700 dark:text-red-100 dark:hover:bg-red-600"
            >
              移除图片
            </button>
          </div>
          <div v-else class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            当前未设置全局鼓励图片。
          </div>
        </div>
      </div>

      <hr class="dark:border-gray-600">

      <div>
        <h2 class="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">全局鼓励话语</h2>
        <div>
          <label for="globalEncouragementMessage" class="block text-sm font-medium text-gray-700 dark:text-gray-300">默认鼓励消息:</label>
          <textarea
            id="globalEncouragementMessage"
            v-model="globalSettings.default_encouragement_message"
            rows="4"
            class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="例如：恭喜你完成了任务！继续加油！"
          ></textarea>
        </div>
      </div>

      <hr class="dark:border-gray-600">

      <div class="flex justify-end items-center space-x-3">
        <p v-if="saveError" class="text-sm text-red-600 dark:text-red-400">{{ saveError }}</p>
        <button
          @click="saveGlobalSettings"
          :disabled="saveLoading"
          class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <span v-if="saveLoading">保存中...</span>
          <span v-else>保存全局设置</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import apiClient from '@/utils/api.js'; // Admin API calls use this (with auth)

const globalSettings = ref({
  default_encouragement_image_url: null,
  default_encouragement_message: ''
});

const uploadingImage = ref(false);
const uploadError = ref('');
const saveLoading = ref(false);
const saveError = ref('');

const fetchGlobalSettings = async () => {
  saveLoading.value = true; // Use saveLoading for initial fetch too
  saveError.value = '';
  try {
    // Use apiClient for GET as it doesn't require auth per backend setup,
    // and apiClient should still work fine even if it sends an auth header.
    const response = await apiClient.get('/api/global-encouragement-settings');
    if (response.data) {
      globalSettings.value.default_encouragement_image_url = response.data.default_encouragement_image_url || null;
      globalSettings.value.default_encouragement_message = response.data.default_encouragement_message || '';
    }
  } catch (err) {
    console.error('获取全局鼓励设置失败:', err);
    saveError.value = '获取全局鼓励设置失败: ' + (err.response?.data?.error || err.message);
  } finally {
    saveLoading.value = false;
  }
};

onMounted(fetchGlobalSettings);

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  uploadingImage.value = true;
  uploadError.value = '';

  const formData = new FormData();
  formData.append('file', file);

  try {
    // Image upload is an admin action, so use apiClient
    const response = await apiClient.post('/api/admin/upload_encouragement_image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    if (response.data && response.data.image_url) {
      globalSettings.value.default_encouragement_image_url = response.data.image_url;
    } else {
      uploadError.value = '图片上传成功，但未返回有效的图片URL。';
    }
  } catch (err) {
    console.error('图片上传失败:', err);
    uploadError.value = '图片上传失败: ' + (err.response?.data?.error || err.message);
    // Clear the file input if upload fails
    event.target.value = null;
  } finally {
    uploadingImage.value = false;
  }
};

const clearImage = () => {
  globalSettings.value.default_encouragement_image_url = null;
  // Clear the file input
  const fileInput = document.getElementById('globalEncouragementImage');
  if (fileInput) {
    fileInput.value = null;
  }
  uploadError.value = ''; // Clear any previous upload error
};

const saveGlobalSettings = async () => {
  saveLoading.value = true;
  saveError.value = '';
  try {
    // Saving settings is an admin action
    const payload = {
      default_encouragement_image_url: globalSettings.value.default_encouragement_image_url,
      default_encouragement_message: globalSettings.value.default_encouragement_message
    };
    const response = await apiClient.put('/api/admin/global-encouragement-settings', payload);
    // Optionally, update local state with response if backend modifies/confirms data
    if (response.data && response.data.settings) {
        globalSettings.value.default_encouragement_image_url = response.data.settings.default_encouragement_image_url || null;
        globalSettings.value.default_encouragement_message = response.data.settings.default_encouragement_message || '';
    }
    alert('全局鼓励设置已保存！'); // Simple feedback
  } catch (err) {
    console.error('保存全局鼓励设置失败:', err);
    saveError.value = '保存失败: ' + (err.response?.data?.error || err.message);
  } finally {
    saveLoading.value = false;
  }
};

// Helper to construct full URL for display
const getImageFullUrl = (relativePath) => {
  if (!relativePath) return '';
  // Assuming relativePath starts with /uploads/...
  // Modify this if your public API client or base URL setup is different
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath; // Already a full URL
  }
  return `${backendBaseUrl}${relativePath}`;
};

</script>

<style scoped>
/* Add any specific styles if needed, but Tailwind should cover most */
</style>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">任务管理</h1>
      <div class="flex gap-4">
        <router-link to="/admin/history"
                     class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
          历史任务
        </router-link>
        <router-link to="/admin/tasks/new"
                     class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
          发布新任务
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
    </div>
    <div v-else-if="error" class="text-red-500 text-center">
      {{ error }}
    </div>
    <div v-else class="grid gap-4">
      <div v-for="task in tasks" :key="task.id"
           class="bg-white p-4 rounded-lg shadow">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-xl font-semibold">{{ task.title }}</h2>
            <p class="text-gray-600 mt-2">{{ task.description }}</p>
            <div class="mt-2">
              <span class="text-blue-600">积分: {{ task.points }}</span>
              <span class="ml-4 text-green-600">
                参与人数: {{ task.participants ? task.participants.length : 0 }}
              </span>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="editTask(task)"
                    class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors">
              编辑
            </button>
            <button @click="completeTask(task.id)"
                    class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors">
              结算任务
            </button>
            <button @click="deleteTask(task.id)"
                    class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors">
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑任务对话框 -->
    <div v-if="showEditDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-4">
        <h2 class="text-xl font-bold mb-6">编辑任务</h2>
        <form @submit.prevent="saveTask">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="title">
              任务标题
            </label>
            <input
              id="title"
              v-model="editedTask.title"
              type="text"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="description">
              任务描述
            </label>
            <textarea
              id="description"
              v-model="editedTask.description"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="4"
              required
            ></textarea>
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="points">
              任务积分
            </label>
            <input
              id="points"
              v-model.number="editedTask.points"
              type="number"
              min="1"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
          </div>
          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="cancelEdit"
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              取消
            </button>
            <button
              type="submit"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/utils/api.js'

const router = useRouter()
const tasks = ref([])
const loading = ref(true)
const error = ref(null)
const showEditDialog = ref(false)
const editedTask = ref({})

const fetchTasks = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await apiClient.get('/api/admin/tasks')
    tasks.value = response.data
  } catch (err) {
    error.value = err.message || '获取任务列表失败，请稍后重试'
    console.error('获取任务列表失败:', err)
  } finally {
    loading.value = false
  }
}

const deleteTask = async (taskId) => {
  if (!confirm('确定要删除这个任务吗？')) return

  try {
    console.log('正在删除任务:', taskId)
    const response = await apiClient.delete(`/api/admin/tasks/${taskId}`)
    console.log('删除响应:', response.data)
    tasks.value = tasks.value.filter(t => t.id !== taskId)
    alert('任务删除成功！')
  } catch (err) {
    console.error('删除任务失败:', err)
    alert(err.message || err.response?.data?.error || '删除任务失败，请重试')
  }
}

const completeTask = async (taskId) => {
  if (!confirm('确定要结算这个任务吗？结算后任务将移至历史任务列表。')) return

  try {
    const response = await apiClient.put(`/api/admin/tasks/${taskId}/complete`)
    tasks.value = tasks.value.filter(t => t.id !== taskId)
    alert('任务结算成功！')
  } catch (err) {
    console.error('结算任务失败:', err)
    alert(err.message || err.response?.data?.error || '结算任务失败，请重试')
  }
}

const editTask = (task) => {
  editedTask.value = { ...task }
  showEditDialog.value = true
}

const cancelEdit = () => {
  showEditDialog.value = false
  editedTask.value = {}
}

const saveTask = async () => {
  try {
    const response = await apiClient.put(`/api/admin/tasks/${editedTask.value.id}`, editedTask.value)
    const updatedTask = response.data
    const index = tasks.value.findIndex(t => t.id === updatedTask.id)
    if (index !== -1) {
      tasks.value[index] = updatedTask
    }
    showEditDialog.value = false
    editedTask.value = {}
    alert('任务更新成功！')
  } catch (err) {
    console.error('更新任务失败:', err)
    error.value = err.message || '更新任务失败，请稍后重试'
  }
}

onMounted(fetchTasks)
</script>

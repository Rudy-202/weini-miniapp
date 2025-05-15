<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">任务列表</h1>
    <div v-if="loading" class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
    </div>
    <div v-else-if="error" class="text-red-500 text-center">
      {{ error }}
    </div>
    <div v-else class="grid gap-4">
      <div v-for="task in tasks" :key="task.id" 
           class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
        <h2 class="text-xl font-semibold">{{ task.title }}</h2>
        <p class="text-gray-600 mt-2">{{ task.description }}</p>
        <div class="mt-4 flex justify-between items-center">
          <span class="text-blue-600">积分: {{ task.points }}</span>
          <router-link :to="`/task/${task.id}`" 
                       class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            查看详情
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const tasks = ref([])
const loading = ref(true)
const error = ref(null)

const fetchTasks = async () => {
  try {
    const response = await axios.get('/api/tasks')
    tasks.value = response.data
  } catch (err) {
    error.value = '获取任务列表失败，请稍后重试'
    console.error('获取任务列表失败:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchTasks)
</script>

<style scoped>
.admin-container {
  max-width: 600px;
  margin: 40px auto;
  background: #ffffffcc;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
h1, h2 {
  color: #333;
}
.task-inputs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.task-inputs input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.task-inputs button {
  background-color: #4CAF50;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.task-list ul {
  list-style: none;
  padding: 0;
}
.task-list li {
  background: #f9f9f9;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
}
.message {
  margin-top: 20px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  text-align: center;
}
</style>

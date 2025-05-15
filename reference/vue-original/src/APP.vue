<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-sm">
      <div class="container mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex">
            <router-link to="/" class="flex items-center px-4 text-gray-900 hover:text-gray-600">
              首页
            </router-link>
            <router-link to="/leaderboard" class="flex items-center px-4 text-gray-900 hover:text-gray-600">
              排行榜
            </router-link>
          </div>
          <div class="flex items-center">
            <router-link to="/admin/login" class="text-sm text-gray-500 hover:text-teal-600 transition-colors">站子入口</router-link>
          </div>
        </div>
      </div>
    </nav>

    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import apiClient from '@/utils/api.js'; // 确保导入 apiClient

export default {
  name: 'App',
  data() {
    return {
      tasks: []
    };
  },
  mounted() {
    // 使用 apiClient 实例
    // apiClient.get('/api/tasks') // 确保使用 apiClient.get
    //   .then(response => {
    //     this.tasks = response.data;
    //     console.log('App.vue: Tasks loaded via apiClient', this.tasks);
    //   })
    //   .catch(error => {
    //     console.error('App.vue - API 请求失败 (获取tasks via apiClient):', error.message || error);
    //   });
  }
};
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 可以加全局样式，比如 */
body {
  font-family: Arial, sans-serif;
}
</style>

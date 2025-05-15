<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Sidebar -->
    <aside class="w-64 bg-white dark:bg-gray-800 shadow-md hidden sm:block">
      <div class="p-6">
        <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200">管理后台</h2>
      </div>
      <nav class="mt-6">
        <router-link
          to="/admin/task-list"
          class="block px-6 py-3 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
          active-class="bg-gray-200 dark:bg-gray-700 font-semibold"
        >
          任务列表
        </router-link>
        <router-link
          to="/admin/tasks/new"
          class="block px-6 py-3 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
          active-class="bg-gray-200 dark:bg-gray-700 font-semibold"
        >
          新建任务
        </router-link>
        <router-link
          to="/admin/invite-codes"
          class="block px-6 py-3 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
          active-class="bg-gray-200 dark:bg-gray-700 font-semibold"
        >
          邀请码管理
        </router-link>
        <router-link
          to="/admin/encouragements"
          class="block px-6 py-3 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
          active-class="bg-gray-200 dark:bg-gray-700 font-semibold"
        >
          鼓励内容管理
        </router-link>
        <!-- 可根据需要添加更多链接，例如历史任务 -->
         <router-link
          to="/admin/history"
          class="block px-6 py-3 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
          active-class="bg-gray-200 dark:bg-gray-700 font-semibold"
        >
          历史任务
        </router-link>

        <!-- 新增日报管理链接 -->
        <router-link
          to="/admin/daily-reports"
          class="block px-6 py-3 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
          active-class="bg-gray-200 dark:bg-gray-700 font-semibold"
        >
          日报管理
        </router-link>

        <!-- 新增里程碑任务管理链接 -->
        <router-link
          to="/admin/milestone-tasks"
          class="block px-6 py-3 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
          active-class="bg-gray-200 dark:bg-gray-700 font-semibold"
        >
          里程碑任务管理
        </router-link>

        <button
          @click="logoutAdmin"
          class="block w-full text-left px-6 py-3 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-700 mt-auto"
        >
          退出登录
        </button>
      </nav>
    </aside>

    <!-- Main content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Header (optional, can be part of specific views or here) -->
      <!-- <header class="bg-white dark:bg-gray-800 shadow-sm p-4">
        <h1 class="text-xl font-semibold">Page Title</h1>
      </header> -->

      <!-- Content area -->
      <div class="flex-1 p-4 sm:p-6 overflow-y-auto">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const logoutAdmin = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('token_expires_at');
  router.push({ name: 'AdminLogin' });
};
</script>

<style scoped>
/* Add any specific styles for the layout here */
/* Ensure active-class applies correctly */
.router-link-exact-active {
  /* Tailwind's active-class might handle this, but you can add more specific styles if needed */
  /* For example, a left border for active links */
  /* border-left: 3px solid #4F46E5; */
}
</style>

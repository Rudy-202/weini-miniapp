<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
        ✨ 应援星球 ✨
      </h1>
      <p class="text-gray-600 text-lg">与爱豆一起，让梦想闪耀</p>
    </div>

    <div class="bg-white bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
      <div class="w-20 h-20 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>

      <div class="space-y-6">
        <button
          @click="goToFanEntry"
          class="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium py-3 px-6 rounded-lg text-lg transition-all hover:shadow-lg hover:opacity-90 focus:outline-none"
        >
          <span class="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            我是粉丝
          </span>
        </button>

        <button
          @click="goToAdminLogin"
          class="w-full bg-white border-2 border-purple-300 text-purple-600 font-medium py-3 px-6 rounded-lg text-lg transition-all hover:shadow-md hover:border-purple-400 focus:outline-none"
        >
          <span class="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            我是站子
          </span>
        </button>
      </div>

      <div class="mt-8 pt-4 border-t border-gray-200 text-gray-500 text-sm">
        <p>携手前行，见证偶像的每一步成长</p>
      </div>
    </div>

    <div class="text-center mt-8 text-sm text-gray-500">
      <p>© 2023 应援星球 · 用爱发电</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToFanEntry = () => {
  router.push('/fan/entry');
};

const goToAdminLogin = () => {
  router.push('/admin/login');
};
</script>

<style scoped>
/* 新增:为按钮添加美丽的点击效果 */
button {
  position: relative;
  overflow: hidden;
}

button::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 10%, transparent 10.01%);
  background-repeat: no-repeat;
  background-position: 50%;
  transform: scale(10, 10);
  opacity: 0;
  transition: transform 0.5s, opacity 0.5s;
}

button:active::after {
  transform: scale(0, 0);
  opacity: 0.3;
  transition: 0s;
}
</style>

<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click.self="closeModal">
        <div class="encouragement-popup bg-white max-w-lg w-full mx-4 rounded-2xl shadow-2xl overflow-hidden transform transition-all"
             :class="{ 'scale-in': modelValue }">

          <!-- 关闭按钮 -->
          <button @click="closeModal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none z-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- 顶部渐变装饰 -->
          <div class="h-3 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500"></div>

          <!-- 内容区域 -->
          <div class="p-6 pt-8 text-center">
            <!-- 标题 -->
            <h3 class="text-2xl font-bold text-purple-700 mb-4">
              {{ title || '恭喜你！' }}
            </h3>

            <!-- 图片 (如果有) -->
            <div v-if="imageUrl" class="my-4 flex justify-center">
              <img :src="getImageFullUrl(imageUrl)"
                   :alt="title || '鼓励图片'"
                   class="max-h-60 mx-auto rounded-lg object-contain" />
            </div>

            <!-- 内容文字 -->
            <div class="my-4 text-gray-600 leading-relaxed">
              <p>{{ message || '你已成功完成任务！感谢你的付出和努力~' }}</p>
            </div>

            <!-- 分享按钮 -->
            <div class="mt-6">
              <button @click="shareResult"
                      class="flex items-center justify-center space-x-2 mx-auto px-6 py-2.5 bg-pink-100 text-pink-600 font-medium rounded-lg hover:bg-pink-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>分享成绩</span>
              </button>
            </div>

            <!-- 任务积分与排名信息 -->
            <div class="mt-8 bg-purple-50 p-4 rounded-lg">
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                  <p class="text-sm text-purple-600 font-medium">获得积分</p>
                  <p class="text-xl font-bold text-purple-700">{{ points || 0 }} <span class="text-xs">分</span></p>
                </div>
                <div class="text-center">
                  <p class="text-sm text-purple-600 font-medium">当前排名</p>
                  <p class="text-xl font-bold text-purple-700">{{ rank || '-' }}</p>
                </div>
              </div>
            </div>

            <!-- 查看排行榜按钮 -->
            <div class="mt-6">
              <button @click="viewLeaderboard"
                      class="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-all shadow-md hover:shadow-lg focus:outline-none">
                查看排行榜
              </button>
            </div>
          </div>

          <!-- 底部装饰 -->
          <div class="bg-gray-50 px-6 py-3 text-center">
            <p class="text-sm text-gray-500">携手前行，见证爱豆的每一步成长</p>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  modelValue: Boolean,
  title: String,
  message: String,
  imageUrl: String,
  taskId: [String, Number],
  points: [String, Number],
  rank: [String, Number]
});

const emit = defineEmits(['update:modelValue', 'view-leaderboard', 'share']);
const router = useRouter();

const closeModal = () => {
  emit('update:modelValue', false);
};

const viewLeaderboard = () => {
  closeModal();
  emit('view-leaderboard');

  // 如果有任务ID，跳转到任务排行榜
  if (props.taskId) {
    router.push(`/task/${props.taskId}/leaderboard`);
  }
};

const shareResult = () => {
  emit('share');
  // 这里可以实现分享功能，如生成分享图片等
  // 简单的实现可以是复制一段文字到剪贴板
  const shareText = `我刚刚在应援星球完成了任务，获得了 ${props.points} 积分，当前排名第 ${props.rank}，一起来为爱豆应援吧！`;
  navigator.clipboard.writeText(shareText)
    .then(() => {
      alert('分享内容已复制到剪贴板，快去粘贴分享吧！');
    })
    .catch(err => {
      console.error('复制失败:', err);
    });
};

// 处理图片URL
const getImageFullUrl = (relativePath) => {
  if (!relativePath) return '';

  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath; // 已经是完整的URL
  }
  return `${backendBaseUrl}${relativePath}`;
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-in {
  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes scaleIn {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 添加闪光效果 */
.encouragement-popup::before {
  content: '';
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(30deg);
  animation: shimmer 3s infinite;
  pointer-events: none;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) rotate(30deg);
  }
  100% {
    transform: translateX(100%) rotate(30deg);
  }
}
</style>

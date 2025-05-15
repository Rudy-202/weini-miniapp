<template>
  <div class="task-card"
       :class="{
         'flame-mode': task.flame_mode_enabled,
         'time-limit-mode': task.time_limit_mode,
         'focus-task-highlight': task.is_focus_task
       }">
    <div class="task-header">
      <h3 class="text-xl font-semibold">
        {{ task.title }}
        <span v-if="task.display_focus_icon" class="ml-2 text-yellow-500" title="焦点任务">{{ task.display_focus_icon }}</span>
        <span v-if="task.flame_mode_enabled" class="ml-2 text-orange-500">🔥</span>
        <span v-if="task.time_limit_mode" class="ml-2 text-blue-500">⏰</span>
      </h3>
      <button @click="navigateToTaskLeaderboard"
              class="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 transition-colors">
        当前排行
      </button>
    </div>
    <p class="text-gray-600 mb-4">{{ task.description }}</p>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <p class="text-gray-600">积分</p>
        <p class="font-medium">
          <template v-if="task.is_focus_task">
            <span>
              ({{ task.points }}<span v-if="task.bonus_points > 0">+{{ task.bonus_points }}</span>)×2 = <span class="text-pink-500">{{ (Number(task.points) + Number(task.bonus_points || 0)) * 2 }}</span> 分
              <span class="text-xs text-pink-500 ml-1">（焦点任务双倍积分）</span>
            </span>
          </template>
          <template v-else-if="task.bonus_points > 0">
            <span>
              {{ task.points }}+{{ task.bonus_points }} = <span class="text-blue-500">{{ Number(task.points) + Number(task.bonus_points || 0) }}</span> 分
              <span class="text-xs text-blue-500 ml-1">（含限时奖励）</span>
            </span>
          </template>
          <template v-else>
            <span>{{ task.points }} 分</span>
          </template>
        </p>
      </div>
      <div>
        <p class="text-gray-600">参与人数</p>
        <p class="font-medium">{{ task.participants?.length || 0 }} 人</p>
      </div>
    </div>
    <div v-if="task.time_limit_mode" class="mt-3 pt-3 border-t border-gray-200 text-sm">
      <p class="font-medium text-blue-700">截止: {{ formatDate(task.due_date) }}</p>
      <p v-if="task.status === 'active' && getCountdown(task.due_date).text !== '已截止'" class="text-blue-600">
        剩余: {{ getCountdown(task.due_date).text }}
      </p>
      <p v-else-if="(task.status === 'active' && getCountdown(task.due_date).expired) || (task.status !== 'active' && task.status !== 'completed' && getCountdown(task.due_date).expired)" class="text-red-600">
        已截止
      </p>
      <p v-if="task.bonus_points > 0" class="text-yellow-600 mt-1">提示: 这是限时任务，按时完成可获得额外奖励！</p>
    </div>
    <div class="mt-4 flex justify-end">
      <button @click="$emit('view-detail', task)"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
        查看详情
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const navigateToTaskLeaderboard = () => {
  if (props.task && props.task.id) {
    router.push(`/task/${props.task.id}/leaderboard`)
  } else {
    console.error('Task ID is missing, cannot navigate to task leaderboard.')
  }
}

// Helper function to format date (copied from TaskHierarchy or make it a util)
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  };
  try {
    return new Date(dateString).toLocaleString('zh-CN', options);
  } catch (e) {
    console.warn('Error formatting date in TaskCard:', e, dateString);
    return dateString; // Fallback
  }
};

// Helper function for countdown (copied from TaskHierarchy or make it a util)
const getCountdown = (dueDateString) => {
  if (!dueDateString) return { text: 'N/A', expired: true, timestamp: 0 };

  const now = new Date().getTime();
  const dueDate = new Date(dueDateString).getTime();
  const diff = dueDate - now;

  if (diff <= 0) {
    return { text: '已截止', expired: true, timestamp: diff };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  let text = '';
  if (days > 0) text += `${days}天 `;
  if (hours > 0 || days > 0) text += `${hours}小时 `;
  if (minutes > 0 || hours > 0 || days > 0) text += `${minutes}分 `;
  text += `${seconds}秒`;

  return { text: text.trim(), expired: false, timestamp: diff };
};

defineEmits(['view-detail'])
</script>

<style scoped>
.task-card {
  @apply bg-white rounded-lg shadow-md p-6 cursor-pointer transform transition-all duration-200 hover:shadow-lg hover:-translate-y-1;
}

.task-header {
  @apply flex justify-between items-center mb-4;
}

.flame-mode {
  @apply border-2 border-orange-500;
  background: linear-gradient(to bottom right, #fff, #fff5f0);
}

.time-limit-mode {
  @apply border-2 border-blue-500;
  background: linear-gradient(to bottom right, #fff, #f0f5ff);
}

@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 3px rgba(245, 158, 11, 0.3); /* 初始状态，较小的光晕 */
  }
  50% {
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.7), 0 0 15px rgba(245, 158, 11, 0.5); /* 中间状态，光晕扩大且更明显 */
  }
  100% {
    box-shadow: 0 0 3px rgba(245, 158, 11, 0.3); /* 回到初始状态 */
  }
}

.focus-task-highlight {
  border: 2px solid #F59E0B; /* 保留黄色边框作为基础 */
  /* background: linear-gradient(to bottom right, #ffffff, #fffbeb); */ /* 移除了之前的静态背景 */
  animation: pulse-glow 2.5s infinite ease-in-out; /* 应用动画 */
}
</style>

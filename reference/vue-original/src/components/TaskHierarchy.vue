<template>
  <div class="task-hierarchy">
    <!-- 筛选器 -->
    <div class="mb-6 bg-white rounded-lg shadow-md p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">任务状态</label>
          <select v-model="filters.status"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">全部</option>
            <option value="active">进行中</option>
            <option value="completed">已完成</option>
            <option value="pending">待审核</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">任务类型</label>
          <select v-model="filters.type"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">全部</option>
            <option value="normal">普通任务</option>
            <option value="flame">浴火模式</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
          <select v-model="filters.sort"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="newest">最新创建</option>
            <option value="oldest">最早创建</option>
            <option value="points">积分高低</option>
            <option value="participants">参与人数</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="space-y-4">
      <div v-for="task in filteredTasks"
           :key="task.id"
           class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-2">
              <h3 class="text-xl font-semibold">{{ task.title }}</h3>
              <span v-if="task.is_focus_task && task.display_focus_icon" :title="task.is_focus_task ? '焦点任务' : ''" class="text-xl">
                {{ task.display_focus_icon }}
              </span>
              <span v-if="task.flame_mode_enabled" class="text-orange-500" title="浴火模式">🔥</span>
              <span v-if="task.time_limit_mode" class="text-blue-500" title="限时任务">⏰ 限时</span>
            </div>
            <p class="text-gray-600 mb-4">{{ task.description }}</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <div>
                <p class="text-gray-600">积分</p>
                <p class="font-medium">{{ task.points }} 分</p>
              </div>
              <div>
                <p class="text-gray-600">参与人数</p>
                <p class="font-medium">{{ task.participants?.length || 0 }} 人</p>
              </div>
              <div>
                <p class="text-gray-600">创建时间</p>
                <p class="font-medium">{{ formatDate(task.created_at) }}</p>
              </div>
              <div>
                <p class="text-gray-600">状态</p>
                <p class="font-medium" :class="getStatusClass(task.status)">
                  {{ getStatusText(task.status) }}
                </p>
              </div>
            </div>

            <!-- 新增：限时任务信息 -->
            <div v-if="task.time_limit_mode" class="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
              <p class="font-medium text-blue-700">截止时间: {{ formatDate(task.due_date) }}</p>
              <p v-if="task.status === 'active'" class="text-blue-600">剩余时间: {{ getCountdown(task.due_date).text }}</p>
              <p v-else-if="getCountdown(task.due_date).expired && task.status !== 'completed'" class="text-red-600">已截止</p>
              <p v-if="task.bonus_points > 0" class="text-yellow-700">按时完成额外奖励: +{{ task.bonus_points }} 积分</p>
            </div>

            <!-- START: Added Focus Task Buttons -->
            <button
              v-if="task.status === 'active' && !task.is_focus_task"
              @click="emit('set-focus', task)"
              :disabled="props.isSetFocusDisabledFn(task.invite_code)"
              class="px-3 py-1 text-xs font-medium text-white bg-teal-500 rounded hover:bg-teal-600 disabled:bg-gray-400"
              title="将此任务设为焦点任务 (积分翻倍)">
              设为焦点
            </button>
            <button
              v-if="task.status === 'active' && task.is_focus_task"
              @click="emit('unset-focus', task)"
              class="px-3 py-1 text-xs font-medium text-white bg-yellow-500 rounded hover:bg-yellow-600"
              title="取消此任务的焦点状态">
              取消焦点
            </button>
            <!-- END: Added Focus Task Buttons -->
          </div>
          <div class="flex space-x-2">
            <button @click="$emit('edit', task)"
                    class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors">
              编辑
            </button>
            <button @click="$emit('view', task)"
                    class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors">
              查看
            </button>
            <button @click="$emit('settle', task)"
                    class="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition-colors">
              结算
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import FlameAnimation from './FlameAnimation.vue'

const props = defineProps({
  tasks: {
    type: Array,
    required: true
  },
  isSetFocusDisabledFn: {
    type: Function,
    required: true,
  }
})

const emit = defineEmits(['edit', 'view', 'settle', 'set-focus', 'unset-focus'])

const filters = ref({
  status: '',
  type: '',
  sort: 'newest'
})

const filteredTasks = computed(() => {
  let result = [...props.tasks]

  // 状态筛选
  if (filters.value.status) {
    result = result.filter(task => task.status === filters.value.status)
  }

  // 类型筛选
  if (filters.value.type) {
    result = result.filter(task => {
      if (filters.value.type === 'flame') {
        return task.flame_mode_enabled
      }
      return !task.flame_mode_enabled
    })
  }

  // 排序
  result.sort((a, b) => {
    switch (filters.value.sort) {
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at)
      case 'points':
        return b.points - a.points
      case 'participants':
        return (b.participants?.length || 0) - (a.participants?.length || 0)
      default: // newest
        return new Date(b.created_at) - new Date(a.created_at)
    }
  })

  return result
})

const getCountdown = (dueDateString) => {
  if (!dueDateString) return { text: '未设置截止时间', expired: false,_timestamp:0 };

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
  if (days > 0 || hours > 0) text += `${hours}小时 `;
  if (days > 0 || hours > 0 || minutes > 0) text += `${minutes}分 `;
  text += `${seconds}秒`;

  return { text: text.trim(), expired: false, timestamp: diff };
};

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusText = (status) => {
  const statusMap = {
    active: '进行中',
    completed: '已完成',
    pending: '待审核'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = {
    active: 'text-green-600',
    completed: 'text-blue-600',
    pending: 'text-yellow-600'
  }
  return classMap[status] || ''
}
</script>

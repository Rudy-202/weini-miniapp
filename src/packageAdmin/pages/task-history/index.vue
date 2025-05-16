<template>
  <view class="page-container">
    <uni-section title="历史任务" type="line" padding>
      <view class="content-area">
        <text>这里是历史任务的内容区域。</text>
        <text>将显示已结算的任务列表。</text>
        <!-- TODO: Implement historical task listing, filtering, and display logic -->
         <view v-if="historicalTasks.length === 0" class="empty-tasks">
          <text>暂无历史任务记录</text>
        </view>
        <uni-list v-else>
          <uni-list-item 
            v-for="task in historicalTasks" 
            :key="task.id" 
            :title="task.title"
            :note="`积分: ${task.points} | 结算时间: ${formatSettledTime(task.settledAt)}`"
            showArrow
            clickable
            @click="navigateToTaskDetail(task.id)"
          >
          </uni-list-item>
        </uni-list>
      </view>
    </uni-section>
  </view>
</template>

<script setup lang="ts">
// import AdminLayout from '@/packageAdmin/components/AdminLayout.vue'; // No longer needed
import { ref, onMounted } from 'vue';

// Mock data and functions - replace with actual API calls and utils
const historicalTasks = ref<any[]>([]);
const fetchHistoricalTasks = async () => {
  // Simulate API call
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 'hist1', title: '已结算任务一', points: 100, settledAt: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: 'hist2', title: '已结算任务二', points: 50, settledAt: new Date(Date.now() - 86400000 * 5).toISOString() },
      ]);
    }, 500);
  });
};
const formatSettledTime = (timeStr: string) => new Date(timeStr).toLocaleDateString();

const navigateToTaskDetail = (taskId: string) => {
  // Potentially navigate to a read-only detail view for historical tasks
  console.log('Navigate to historical task detail for:', taskId);
  uni.showToast({ title: `查看历史任务详情: ${taskId}`, icon: 'none' });
  // uni.navigateTo({ url: `/packageAdmin/pages/task-detail/index?id=${taskId}&isHistory=true` });
};

onMounted(async () => {
  const tasks: any = await fetchHistoricalTasks();
  historicalTasks.value = tasks;
});

</script>

<style lang="scss" scoped>
.page-container {
  padding: 20rpx;
  background-color: #f4f7fa;
  min-height: 100vh;
}
.content-area {
  padding: 15rpx;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}
.empty-tasks {
  text-align: center;
  padding: 40rpx;
  color: #999;
}
</style> 
<template>
  <view class="dashboard-container">
    <!-- 顶部统计卡片 -->
    <view class="stats-row">
      <view class="stat-card">
        <view class="stat-value">{{ stats.taskCount || 0 }}</view>
        <view class="stat-label">总任务数</view>
      </view>
      <view class="stat-card">
        <view class="stat-value">{{ stats.submissionCount || 0 }}</view>
        <view class="stat-label">待审核</view>
      </view>
      <view class="stat-card">
        <view class="stat-value">{{ stats.fanCount || 0 }}</view>
        <view class="stat-label">活跃粉丝</view>
      </view>
    </view>

    <!-- 快速入口 -->
    <view class="quick-access">
      <view class="section-title">核心功能</view>
      <view class="menu-grid">
        <view class="menu-item" @click="navigateToQuick('/packageAdmin/pages/task-manage/index')">
          <view class="menu-icon-quick task-icon">
            <uni-icons type="list" size="28" color="#FFFFFF"></uni-icons>
          </view>
          <view class="menu-label">任务管理</view>
        </view>
        <view class="menu-item" @click="navigateToQuick('/packageAdmin/pages/task-history/index')"> 
          <view class="menu-icon-quick history-icon">
            <uni-icons type="calendar" size="28" color="#FFFFFF"></uni-icons>
          </view>
          <view class="menu-label">历史任务</view>
        </view>
        <view class="menu-item" @click="navigateToQuick('/packageAdmin/pages/task/create')">
          <view class="menu-icon-quick add-icon">
            <uni-icons type="plus" size="28" color="#FFFFFF"></uni-icons>
          </view>
          <view class="menu-label">新建任务</view>
        </view>
         <!-- 审核提交和邀请码入口已移除 -->
      </view>
    </view>

    <!-- 待审核任务预览 (可以根据需要保留或移除) -->
    <view class="submissions-preview">
      <view class="section-title">
        待审核提交
        <text class="view-all" @click="navigateToQuick('/packageAdmin/pages/review/index')">查看全部</text>
      </view>
      <view v-if="pendingSubmissions.length > 0" class="submissions-list">
        <view 
          v-for="(submission) in pendingSubmissions" 
          :key="submission.id" 
          class="submission-item"
          @click="navigateToQuick(`/packageAdmin/pages/review/detail?id=${submission.id}`)"
        >
          <view class="submission-info">
            <text class="submission-title">{{ submission.taskTitle }}</text>
            <text class="submission-user">{{ submission.userName }}</text>
          </view>
          <text class="submission-time">{{ formatTime(submission.createdAt) }}</text>
        </view>
      </view>
      <view v-else class="empty-data">
        <text>暂无待审核提交</text>
      </view>
    </view>
     <!-- 退出登录按钮 -->
    <view class="logout-section">
        <button class="logout-button" @click="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
// import { useUserStore } from '@/store/user'; // No longer needed here if AdminLayout is gone and logout is simple
// import { getDashboardStats, getPendingSubmissions } from '@/api/admin'; // Assuming these exist
// import { formatTime } from '@/utils/date'; // Assuming this exists

// Mock API functions and utils for now if they are not yet implemented
const getDashboardStats = async () => Promise.resolve({ data: { taskCount: 120, submissionCount: 15, fanCount: 300 } });
const getPendingSubmissions = async () => Promise.resolve({ data: [
  { id: 1, taskTitle: '示例任务A', userName: '用户1', createdAt: new Date().toISOString() },
  { id: 2, taskTitle: '示例任务B', userName: '用户2', createdAt: new Date().toISOString() },
] });
const formatTime = (timeStr: string) => new Date(timeStr).toLocaleDateString();

// const userStore = useUserStore(); // Not needed if not using store for logout logic here

const stats = ref({
  taskCount: 0,
  submissionCount: 0,
  fanCount: 0
});

const pendingSubmissions = ref<any[]>([]);

const fetchStats = async () => {
  try {
    const res = await getDashboardStats();
    stats.value = res.data;
  } catch (error) {
    console.error('获取统计数据失败', error);
    uni.showToast({
      title: '获取数据失败',
      icon: 'none'
    });
  }
};

const fetchPendingSubmissions = async () => {
  try {
    const res = await getPendingSubmissions();
    pendingSubmissions.value = res.data;
  } catch (error) {
    console.error('获取待审核提交失败', error);
  }
};

const navigateToQuick = (url: string) => {
  // 确保移除URL末尾可能存在的斜杠或反斜杠
  console.log('[navigateToQuick] Original URL:', url);
  const cleanedUrl = url.replace(/[\/]$/, ''); 
  console.log('[navigateToQuick] Cleaned URL:', cleanedUrl);
  uni.navigateTo({ url: cleanedUrl });
};

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // userStore.logout(); // Call your actual logout function from the store if you have one
        console.log('User chose to logout');
        uni.removeStorageSync('token');
        uni.removeStorageSync('userInfo');
        uni.reLaunch({ 
          url: '/pages/login/index' // Main app login page
        });
      }
    }
  });
};

onMounted(() => {
  fetchStats();
  fetchPendingSubmissions();
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 30rpx;
  background-color: #f4f7fa; // Light background
  min-height: 100vh;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40rpx;
}

.stat-card {
  flex: 1;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  text-align: center;
  margin: 0 10rpx;
}
.stat-card:first-child { margin-left: 0; }
.stat-card:last-child { margin-right: 0; }

.stat-value {
  font-size: 44rpx; // Slightly smaller
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 24rpx;
  color: #666; // Darker gray
  margin-top: 8rpx;
}

.section-title {
  font-size: 34rpx; // Larger section title
  font-weight: bold;
  color: #333;
  margin: 50rpx 0 25rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-grid {
  display: flex;
  // flex-wrap: wrap; // Removed to keep items in a single row if possible
  justify-content: space-around; // Distribute items evenly
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx 10rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.menu-item {
  // width: 30%; // Adjust width to fit 3 items typically
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15rpx 10rpx;
  cursor: pointer;
  text-align: center;
}

.menu-icon-quick {
  width: 90rpx; // Larger icons
  height: 90rpx;
  border-radius: 20rpx; // Squarish with rounded corners
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12rpx;
  color: white;
  font-size: 48rpx; // Icon size inside the box
   box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.1);
}

.task-icon { background-color: #007aff; } // Blue
.history-icon { background-color: #ff9500; } // Orange for history
.add-icon { background-color: #4cd964; } // Green for add
// .review-icon { background-color: #4cd964; } // Green
// .invite-icon { background-color: #ff9500; } // Orange


.menu-label {
  font-size: 26rpx; // Slightly larger label
  color: #333;
  font-weight: 500;
}

.view-all {
  font-size: 26rpx;
  color: #007aff;
  font-weight: normal;
}

.submissions-preview {
  margin-top: 50rpx;
}

.submissions-list {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.submission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  cursor: pointer;
}

.submission-item:last-child {
  border-bottom: none;
}

.submission-info {
  display: flex;
  flex-direction: column;
}

.submission-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.submission-user {
  font-size: 24rpx;
  color: #777;
}

.submission-time {
  font-size: 24rpx;
  color: #777;
}

.empty-data {
  padding: 60rpx;
  text-align: center;
  background-color: #ffffff;
  border-radius: 16rpx;
  color: #999;
  font-size: 28rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.logout-section {
    margin-top: 60rpx;
    padding: 0 20rpx; // Add some horizontal padding if needed
}

.logout-button {
    background-color: #ff3b30; // A common color for destructive actions
    color: white;
    border-radius: 12rpx;
    font-size: 30rpx;
    font-weight: 500;
}

.logout-button:hover {
    background-color: #e03024;
}

</style> 
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
      <view class="section-title">快速入口</view>
      <view class="menu-grid">
        <view class="menu-item" @click="navigateTo('/packageAdmin/pages/task-manage/index')">
          <view class="menu-icon task-icon">📋</view>
          <view class="menu-label">任务管理</view>
        </view>
        <view class="menu-item" @click="navigateTo('/packageAdmin/pages/review/index')">
          <view class="menu-icon review-icon">✅</view>
          <view class="menu-label">审核提交</view>
        </view>
        <view class="menu-item" @click="navigateTo('/packageAdmin/pages/invites/index')">
          <view class="menu-icon invite-icon">🔑</view>
          <view class="menu-label">邀请码</view>
        </view>
        <view class="menu-item" @click="navigateTo('/packageAdmin/pages/task-create/index')">
          <view class="menu-icon add-icon">➕</view>
          <view class="menu-label">新建任务</view>
        </view>
      </view>
    </view>

    <!-- 待审核任务预览 -->
    <view class="submissions-preview">
      <view class="section-title">
        待审核提交
        <text class="view-all" @click="navigateTo('/packageAdmin/pages/review/index')">查看全部</text>
      </view>
      <view v-if="pendingSubmissions.length > 0" class="submissions-list">
        <view 
          v-for="(submission, index) in pendingSubmissions" 
          :key="submission.id" 
          class="submission-item"
          @click="navigateTo(`/packageAdmin/pages/review/detail?id=${submission.id}`)"
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
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDashboardStats, getPendingSubmissions } from '@/api/admin'
import { formatTime } from '@/utils/date'

const stats = ref({
  taskCount: 0,
  submissionCount: 0,
  fanCount: 0
})

const pendingSubmissions = ref([])

// 获取统计数据
const fetchStats = async () => {
  try {
    const res = await getDashboardStats()
    stats.value = res.data
  } catch (error) {
    console.error('获取统计数据失败', error)
    uni.showToast({
      title: '获取数据失败',
      icon: 'none'
    })
  }
}

// 获取待审核提交
const fetchPendingSubmissions = async () => {
  try {
    const res = await getPendingSubmissions({ limit: 5 })
    pendingSubmissions.value = res.data
  } catch (error) {
    console.error('获取待审核提交失败', error)
  }
}

// 页面跳转
const navigateTo = (url) => {
  uni.navigateTo({ url })
}

// 页面加载时获取数据
onMounted(() => {
  fetchStats()
  fetchPendingSubmissions()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 30rpx;
}

// 统计卡片样式
.stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40rpx;
}

.stat-card {
  width: 30%;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  text-align: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

// 快速入口菜单
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin: 40rpx 0 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-grid {
  display: flex;
  flex-wrap: wrap;
}

.menu-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
}

.menu-icon {
  width: 90rpx;
  height: 90rpx;
  border-radius: 45rpx;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40rpx;
}

.menu-label {
  font-size: 24rpx;
  margin-top: 10rpx;
}

// 待审核提交列表
.view-all {
  font-size: 24rpx;
  color: #3b7ff3;
  font-weight: normal;
}

.submissions-list {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.submission-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
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
  margin-bottom: 10rpx;
}

.submission-user {
  font-size: 24rpx;
  color: #999;
}

.submission-time {
  font-size: 24rpx;
  color: #999;
}

.empty-data {
  padding: 50rpx;
  text-align: center;
  background-color: #ffffff;
  border-radius: 16rpx;
  color: #999;
  font-size: 28rpx;
}
</style> 
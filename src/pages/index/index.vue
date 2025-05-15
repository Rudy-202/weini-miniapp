<template>
  <view class="container">
    <view class="logo">
      <image src="/static/images/logo.png" mode="aspectFit"></image>
    </view>
    
    <view class="title">未你任务管理</view>
    <view class="subtitle">饭圈粉丝任务管理平台</view>
    
    <view class="role-select">
      <view class="card role-card fade-in" style="animation-delay: 0.1s" @click="goToLogin('fan')">
        <view class="role-title">我是粉丝</view>
        <view class="role-desc">通过邀请码登录，完成任务获取积分</view>
      </view>
      
      <view class="card role-card fade-in" style="animation-delay: 0.3s" @click="goToLogin('admin')">
        <view class="role-title">我是管理员</view>
        <view class="role-desc">使用账号密码登录，管理任务和用户</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '../../store/user';
import { navigateWithParams, switchTab } from '../../utils/navigator';

const userStore = useUserStore();

// 检查是否已登录
const checkLoginStatus = () => {
  if (userStore.isLoggedIn) {
    // 已登录直接跳转至对应页面
    if (userStore.isAdmin) {
      switchTab({
        url: '/packageAdmin/pages/dashboard/index'
      });
    } else {
      switchTab({
        url: '/packageFan/pages/task-list/index'
      });
    }
  }
};

// 页面跳转到登录
const goToLogin = (role: 'fan' | 'admin') => {
  navigateWithParams('/pages/login/index', { role }, 'slide-in-right');
};

// 页面加载时检查登录状态
checkLoginStatus();
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
  height: 100vh;
  background: linear-gradient(to bottom, rgba(250, 250, 250, 0.8), rgba(240, 240, 250, 0.9));
}

.logo {
  width: 200rpx;
  height: 200rpx;
  margin: 100rpx 0 40rpx;
  animation: bounce-in 1s ease;
  image {
    width: 100%;
    height: 100%;
  }
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 20rpx;
  animation: fade-in 0.8s ease;
}

.subtitle {
  font-size: 32rpx;
  color: var(--text-color-light);
  margin-bottom: 100rpx;
  animation: fade-in 0.8s ease 0.2s backwards;
}

.role-select {
  width: 100%;
}

.role-card {
  width: 100%;
  margin-bottom: 40rpx;
  padding: 40rpx;
  border-radius: 20rpx;
  background-color: #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }
}

.role-title {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 10rpx;
}

.role-desc {
  font-size: 28rpx;
  color: var(--text-color-light);
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(20rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.fade-in {
  animation: fade-in 0.5s ease backwards;
}
</style> 
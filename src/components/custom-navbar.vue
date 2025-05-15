<!-- components/custom-navbar.vue -->
<template>
  <view class="navbar" :style="navbarStyle">
    <view class="navbar__content" :style="contentStyle">
      <view class="navbar__left" @tap="handleBack" v-if="showBack">
        <text class="navbar__back-icon">←</text>
      </view>
      <view class="navbar__title">
        <slot>{{ title }}</slot>
      </view>
      <view class="navbar__right">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: true
  },
  bgColor: {
    type: String,
    default: '#ffffff'
  },
  textColor: {
    type: String,
    default: '#000000'
  },
  fixed: {
    type: Boolean,
    default: true
  }
});

// 获取系统信息
const statusBarHeight = ref(20);
const navbarHeight = ref(44);

onMounted(() => {
  // 获取状态栏高度
  uni.getSystemInfo({
    success: (res) => {
      statusBarHeight.value = res.statusBarHeight;
      // 不同平台的导航栏高度不同
      navbarHeight.value = res.platform === 'android' ? 48 : 44;
    }
  });
});

// 导航栏样式
const navbarStyle = computed(() => {
  return {
    paddingTop: `${statusBarHeight.value}px`,
    backgroundColor: props.bgColor,
    position: props.fixed ? 'fixed' : 'relative',
    color: props.textColor
  };
});

// 内容样式
const contentStyle = computed(() => {
  return {
    height: `${navbarHeight.value}px`
  };
});

// 返回上一页
const handleBack = () => {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({
        url: '/pages/index/index'
      });
    }
  });
};
</script>

<style lang="scss" scoped>
.navbar {
  width: 100%;
  z-index: 999;
  left: 0;
  top: 0;
  right: 0;
  
  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 0 30rpx;
  }
  
  &__left {
    position: absolute;
    left: 30rpx;
    height: 100%;
    display: flex;
    align-items: center;
  }
  
  &__back-icon {
    font-size: 36rpx;
  }
  
  &__title {
    font-size: 32rpx;
    font-weight: 500;
    max-width: 60%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    text-align: center;
  }
  
  &__right {
    position: absolute;
    right: 30rpx;
    height: 100%;
    display: flex;
    align-items: center;
  }
}
</style> 
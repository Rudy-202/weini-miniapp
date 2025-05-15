<!-- components/load-more.vue -->
<template>
  <view class="load-more">
    <!-- 加载中状态 -->
    <view v-if="status === 'loading'" class="load-more__loading">
      <view class="load-more__spinner"></view>
      <text class="load-more__text">{{ loadingText }}</text>
    </view>
    
    <!-- 加载失败状态 -->
    <view v-else-if="status === 'fail'" class="load-more__fail">
      <text class="load-more__text">{{ failText }}</text>
      <text class="load-more__retry" @tap="onRetry">重试</text>
    </view>
    
    <!-- 没有更多数据状态 -->
    <view v-else-if="status === 'nomore'" class="load-more__nomore">
      <text class="load-more__text">{{ nomoreText }}</text>
    </view>
    
    <!-- 点击加载更多状态 -->
    <view v-else-if="status === 'more'" class="load-more__more">
      <text class="load-more__text" @tap="onLoadMore">{{ moreText }}</text>
    </view>
    
    <!-- 默认状态，什么都不显示 -->
    <view v-else></view>
  </view>
</template>

<script setup>
const props = defineProps({
  status: {
    type: String,
    default: 'more', // loading, nomore, fail, more
    validator: (value) => {
      return ['loading', 'nomore', 'fail', 'more', 'empty'].includes(value);
    }
  },
  loadingText: {
    type: String,
    default: '正在加载...'
  },
  nomoreText: {
    type: String,
    default: '没有更多数据了'
  },
  failText: {
    type: String,
    default: '加载失败'
  },
  moreText: {
    type: String,
    default: '点击加载更多'
  }
});

const emit = defineEmits(['loadmore', 'retry']);

// 加载更多
const onLoadMore = () => {
  emit('loadmore');
};

// 重试
const onRetry = () => {
  emit('retry');
};
</script>

<style lang="scss" scoped>
.load-more {
  width: 100%;
  height: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &__loading, &__fail, &__nomore, &__more {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
  }
  
  &__text {
    font-size: 28rpx;
    color: #999;
  }
  
  &__spinner {
    width: 40rpx;
    height: 40rpx;
    margin-right: 10rpx;
    border: 4rpx solid #f3f3f3;
    border-top: 4rpx solid #1890ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  &__retry {
    margin-left: 20rpx;
    color: #1890ff;
    font-size: 28rpx;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}
</style> 
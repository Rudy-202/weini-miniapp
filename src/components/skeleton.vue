<template>
  <view class="skeleton" :style="{ padding: padding + 'rpx' }">
    <view 
      v-if="showAvatar" 
      class="skeleton__avatar"
      :style="{ width: avatarSize + 'rpx', height: avatarSize + 'rpx' }"
    ></view>
    
    <view class="skeleton__content">
      <view 
        v-for="i in rowCount" 
        :key="i"
        class="skeleton__row"
        :style="{ 
          width: i === rowCount && lastRowWidth ? lastRowWidth + '%' : '100%',
          height: rowHeight + 'rpx'
        }"
      ></view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  rowCount: {
    type: Number,
    default: 3
  },
  rowHeight: {
    type: Number,
    default: 24
  },
  showAvatar: {
    type: Boolean,
    default: false
  },
  avatarSize: {
    type: Number,
    default: 80
  },
  padding: {
    type: Number,
    default: 20
  },
  lastRowWidth: {
    type: Number,
    default: 70 // 百分比
  }
});
</script>

<style lang="scss" scoped>
.skeleton {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  
  &__avatar {
    margin-right: 20rpx;
    background-color: #f2f2f2;
    border-radius: 8rpx;
    animation: skeleton-loading 1.5s infinite;
  }
  
  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  &__row {
    height: 24rpx;
    background-color: #f2f2f2;
    margin-bottom: 16rpx;
    border-radius: 4rpx;
    animation: skeleton-loading 1.5s infinite;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  @keyframes skeleton-loading {
    0% {
      background-color: #f2f2f2;
    }
    50% {
      background-color: #e6e6e6;
    }
    100% {
      background-color: #f2f2f2;
    }
  }
}
</style> 
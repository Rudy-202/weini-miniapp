<!-- components/rank-item.vue -->
<template>
  <view class="rank-item" :class="{ 'rank-item--highlight': isHighlight }">
    <view class="rank-item__rank" :class="rankClass">{{ rank }}</view>
    <view class="rank-item__avatar-container">
      <image class="rank-item__avatar" :src="user.avatar || defaultAvatar" mode="aspectFill"></image>
    </view>
    <view class="rank-item__info">
      <text class="rank-item__name">{{ user.name }}</text>
      <text class="rank-item__desc" v-if="user.description">{{ user.description }}</text>
    </view>
    <view class="rank-item__score">{{ user.score }}</view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  rank: {
    type: Number,
    required: true
  },
  isHighlight: {
    type: Boolean,
    default: false
  }
});

// 默认头像
const defaultAvatar = '/static/images/default-avatar.png';

// 排名样式类
const rankClass = computed(() => {
  if (props.rank === 1) return 'rank-item__rank--first';
  if (props.rank === 2) return 'rank-item__rank--second';
  if (props.rank === 3) return 'rank-item__rank--third';
  return '';
});
</script>

<style lang="scss" scoped>
.rank-item {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  
  &--highlight {
    background-color: rgba(24, 144, 255, 0.05);
  }
  
  &__rank {
    width: 60rpx;
    text-align: center;
    font-size: 32rpx;
    font-weight: bold;
    color: #666;
    
    &--first {
      color: #f5a623;
    }
    
    &--second {
      color: #b8b8b8;
    }
    
    &--third {
      color: #cd9b5e;
    }
  }
  
  &__avatar-container {
    width: 80rpx;
    height: 80rpx;
    margin: 0 20rpx;
  }
  
  &__avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
  
  &__info {
    flex: 1;
    overflow: hidden;
  }
  
  &__name {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
    line-height: 1.4;
    margin-bottom: 6rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  &__desc {
    font-size: 24rpx;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  &__score {
    font-size: 32rpx;
    font-weight: bold;
    color: #ff6b81;
    margin-left: 20rpx;
  }
}
</style> 
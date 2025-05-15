<!-- components/tag.vue -->
<template>
  <text class="tag" :class="[`tag--${type}`, `tag--${size}`]">
    <slot></slot>
  </text>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'default'
  },
  size: {
    type: String,
    default: 'medium'
  }
});
</script>

<style lang="scss" scoped>
.tag {
  display: inline-block;
  padding: 4rpx 16rpx;
  font-size: 24rpx;
  border-radius: 8rpx;
  
  // 尺寸变体
  &--small {
    padding: 2rpx 10rpx;
    font-size: 20rpx;
  }
  
  &--medium {
    padding: 4rpx 16rpx;
    font-size: 24rpx;
  }
  
  &--large {
    padding: 6rpx 20rpx;
    font-size: 28rpx;
  }
  
  // 类型变体
  &--default {
    background-color: #f5f5f5;
    color: #666;
  }
  
  &--primary {
    background-color: #e6f7ff;
    color: #1890ff;
  }
  
  &--success {
    background-color: #f6ffed;
    color: #52c41a;
  }
  
  &--warning {
    background-color: #fffbe6;
    color: #faad14;
  }
  
  &--error {
    background-color: #fff1f0;
    color: #f5222d;
  }
}
</style> 
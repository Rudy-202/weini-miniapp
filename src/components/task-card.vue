<!-- components/task-card.vue -->
<template>
  <view class="task-card" @click="handleClick">
    <view class="task-card__header">
      <text class="task-card__title">{{ task.title }}</text>
      <tag v-if="task.isFocus" type="error">焦点</tag>
    </view>
    <text class="task-card__desc">{{ task.description }}</text>
    <view class="task-card__footer">
      <text class="task-card__deadline">截止: {{ formatDate(task.deadline) }}</text>
      <text class="task-card__points">+{{ task.points }}积分</text>
    </view>
  </view>
</template>

<script setup>
import { formatDate } from '@/utils/date';
import Tag from '@/components/tag.vue';

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click', props.task.id);
};
</script>

<style lang="scss" scoped>
.task-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
  }
  
  &__title {
    font-size: 32rpx;
    font-weight: bold;
  }
  
  &__desc {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 16rpx;
    line-height: 1.5;
  }
  
  &__footer {
    display: flex;
    justify-content: space-between;
    font-size: 24rpx;
  }
  
  &__deadline {
    color: #999;
  }
  
  &__points {
    color: #ff6b81;
    font-weight: bold;
  }
}
</style> 
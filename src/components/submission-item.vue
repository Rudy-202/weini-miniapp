<!-- components/submission-item.vue -->
<template>
  <view class="submission-item" :class="{ 'submission-item--expanded': isExpanded }">
    <view class="submission-item__header" @tap="toggleExpand">
      <view class="submission-item__info">
        <view class="submission-item__user">{{ submission.userName }}</view>
        <view class="submission-item__time">{{ formatDate(submission.submitTime) }}</view>
      </view>
      <view class="submission-item__status">
        <tag :type="statusType">{{ statusText }}</tag>
        <text class="submission-item__toggle">{{ isExpanded ? '收起' : '展开' }}</text>
      </view>
    </view>
    
    <view class="submission-item__content" v-if="isExpanded">
      <view class="submission-item__task" v-if="showTask">
        <text class="submission-item__task-title">任务：{{ submission.taskTitle }}</text>
      </view>
      
      <view class="submission-item__desc">
        <text>{{ submission.content }}</text>
      </view>
      
      <view class="submission-item__images" v-if="submission.images && submission.images.length > 0">
        <image 
          v-for="(image, index) in submission.images" 
          :key="index"
          :src="image"
          class="submission-item__image"
          mode="aspectFill"
          @tap="previewImage(index)"
        ></image>
      </view>
      
      <view class="submission-item__actions" v-if="isAdmin && submission.status === 'pending'">
        <button 
          class="submission-item__btn submission-item__btn--approve" 
          @tap="handleApprove"
        >通过</button>
        <button 
          class="submission-item__btn submission-item__btn--reject" 
          @tap="handleReject"
        >拒绝</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { formatDate } from '@/utils/date';
import Tag from '@/components/tag.vue';

const props = defineProps({
  submission: {
    type: Object,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  showTask: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['approve', 'reject']);

const isExpanded = ref(false);

// 切换展开状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

// 状态类型
const statusType = computed(() => {
  const statusMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error'
  };
  return statusMap[props.submission.status] || 'default';
});

// 状态文本
const statusText = computed(() => {
  const textMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  };
  return textMap[props.submission.status] || '未知状态';
});

// 预览图片
const previewImage = (index) => {
  uni.previewImage({
    urls: props.submission.images,
    current: props.submission.images[index]
  });
};

// 审核通过
const handleApprove = () => {
  emit('approve', props.submission.id);
};

// 审核拒绝
const handleReject = () => {
  emit('reject', props.submission.id);
};
</script>

<style lang="scss" scoped>
.submission-item {
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1rpx solid #f5f5f5;
  }
  
  &__info {
    flex: 1;
  }
  
  &__user {
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 8rpx;
  }
  
  &__time {
    font-size: 24rpx;
    color: #999;
  }
  
  &__status {
    display: flex;
    align-items: center;
  }
  
  &__toggle {
    font-size: 24rpx;
    color: #666;
    margin-left: 16rpx;
  }
  
  &__content {
    padding: 24rpx;
  }
  
  &__task {
    margin-bottom: 16rpx;
  }
  
  &__task-title {
    font-size: 28rpx;
    color: #666;
  }
  
  &__desc {
    font-size: 28rpx;
    line-height: 1.5;
    margin-bottom: 20rpx;
  }
  
  &__images {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20rpx;
  }
  
  &__image {
    width: 180rpx;
    height: 180rpx;
    margin-right: 20rpx;
    margin-bottom: 20rpx;
    border-radius: 8rpx;
  }
  
  &__actions {
    display: flex;
    justify-content: flex-end;
  }
  
  &__btn {
    min-width: 140rpx;
    height: 64rpx;
    line-height: 64rpx;
    font-size: 28rpx;
    margin-left: 20rpx;
    border-radius: 32rpx;
    
    &--approve {
      background-color: #07c160;
      color: #fff;
    }
    
    &--reject {
      background-color: #fa5151;
      color: #fff;
    }
  }
}
</style> 
<template>
  <view class="task-submit-container">
    <custom-navbar title="提交任务" show-back />

    <scroll-view scroll-y class="form-content">
      <view class="form-section">
        <view class="section-title">任务标题</view>
        <view class="task-title-display">{{ taskTitle || '加载中...' }}</view>
      </view>

      <view class="form-section">
        <view class="section-title">
          <text class="required-mark">*</text>
          提交说明
        </view>
        <textarea
          class="submission-notes"
          v-model="submissionNotes"
          placeholder="请输入任务完成情况的说明..."
          :maxlength="500"
          auto-height
        />
        <view class="char-counter">{{ submissionNotes.length }}/500</view>
      </view>

      <view class="form-section">
        <view class="section-title">
          <text class="required-mark">*</text>
          上传凭证 (图片)
        </view>
        <ImageUploader v-model="uploadedImages" :max-count="5" />
        <view class="tip-text">请上传任务完成的截图或相关图片作为凭证，最多5张。</view>
      </view>
    </scroll-view>

    <view class="bottom-action">
      <button
        class="confirm-submit-btn"
        @tap="confirmSubmission"
        :disabled="isSubmitting || !canConfirmSubmit"
        :loading="isSubmitting"
      >
        {{ isSubmitting ? '提交中...' : '确认提交' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import ImageUploader from '../../../components/image-uploader.vue'; // 确保路径正确
import { getTaskDetail, TaskItem } from '../../../api/task'; // 用于获取任务标题等
// import { submitTask } from '../../../api/submission'; // 假设有提交任务的API

const taskId = ref('');
const taskTitle = ref('');
const submissionNotes = ref('');
const uploadedImages = ref<string[]>([]); // v-model for ImageUploader
const isSubmitting = ref(false);

// 获取任务简要信息，例如标题
const fetchTaskInfo = async () => {
  if (!taskId.value) return;
  try {
    // 这里可以优化为只获取任务标题，或者复用getTaskDetail并只取需要的信息
    const response: any = await getTaskDetail(taskId.value);
    if (response && response.data && response.data.title) {
      taskTitle.value = response.data.title;
    } else if (response && response.title) { // Direct TaskItem
        taskTitle.value = response.title;
    }
  } catch (error) {
    console.error('获取任务信息失败:', error);
    taskTitle.value = '无法加载任务标题';
  }
};

onLoad((options: any) => {
  if (options.taskId) {
    taskId.value = options.taskId;
    fetchTaskInfo();
  } else {
    uni.showToast({ title: '无效的任务ID', icon: 'none' });
    uni.navigateBack();
  }
});

const canConfirmSubmit = computed(() => {
  return submissionNotes.value.trim().length > 0 && uploadedImages.value.length > 0;
});

const confirmSubmission = async () => {
  if (!canConfirmSubmit.value || isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;
  console.log('提交任务:', {
    taskId: taskId.value,
    notes: submissionNotes.value,
    images: uploadedImages.value,
  });

  try {
    // 实际的提交逻辑
    // const result = await submitTask({
    //   taskId: taskId.value,
    //   content: submissionNotes.value,
    //   image_urls: uploadedImages.value,
    // });
    // console.log('任务提交成功:', result);

    // 模拟提交成功
    await new Promise(resolve => setTimeout(resolve, 1500));
    uni.showToast({ title: '任务提交成功!', icon: 'success' });
    
    // 触发事件或返回上一页，并通知列表刷新
    const eventChannel = uni.getOpenerEventChannel();
    if (eventChannel && eventChannel.emit) {
        eventChannel.emit('submissionSuccess', { taskId: taskId.value });
    }
    
    setTimeout(() => {
        uni.navigateBack();
    }, 1800);

  } catch (error) {
    console.error('任务提交失败:', error);
    uni.showToast({ title: '提交失败，请重试', icon: 'none' });
    isSubmitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.task-submit-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f8f8;
}

.form-content {
  flex: 1;
  padding: 20rpx;
  box-sizing: border-box;
}

.form-section {
  background-color: #fff;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
}

.task-title-display {
  font-size: 30rpx;
  color: #555;
  padding: 10rpx 0;
}

.required-mark {
  color: #ff4d4f;
  margin-right: 8rpx;
  font-weight: bold;
}

.submission-notes {
  width: 100%;
  min-height: 200rpx;
  padding: 16rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  font-size: 28rpx;
  line-height: 1.5;
  box-sizing: border-box;
  background-color: #fdfdfd;
}

.char-counter {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  margin-top: 10rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
}

.bottom-action {
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
}

.confirm-submit-btn {
  background-color: var(--primary-color, #007aff);
  color: white;
  border-radius: 40rpx;
  font-size: 32rpx;
  height: 88rpx;
  line-height: 88rpx;

  &[disabled] {
    background-color: #c0c0c0;
    color: #f0f0f0;
  }
}
</style> 
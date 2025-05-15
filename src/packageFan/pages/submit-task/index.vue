<template>
  <view class="task-submit-container">
    <custom-navbar :title="'提交任务: ' + taskTitle" show-back />
    
    <scroll-view scroll-y class="submit-content">
      <!-- 提交表单 -->
      <view class="form-section">
        <view class="form-item">
          <view class="form-label">提交内容</view>
          <textarea
            class="form-textarea"
            v-model="content"
            placeholder="请输入任务提交说明"
            maxlength="500"
            show-confirm-bar="false"
            auto-height
          />
          <view class="word-count">{{ content.length }}/500</view>
        </view>
        
        <view class="form-item">
          <view class="form-label">上传图片 <text class="required">*</text></view>
          <view class="form-tip">请上传任务完成相关截图，最多可上传9张</view>
          <image-uploader
            v-model="uploadImages"
            :max-count="9"
            @upload-success="onUploadSuccess"
            @upload-fail="onUploadFail"
          />
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作区 -->
    <view class="bottom-action">
      <button 
        class="submit-btn" 
        :disabled="!canSubmit || submitting"
        @tap="submitTask"
      >
        {{ submitting ? '提交中...' : '提交任务' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { submitTask } from '@/api/task';
import { onLoad } from '@dcloudio/uni-app';

const taskId = ref('');
const taskTitle = ref('');
const content = ref('');
const uploadImages = ref<string[]>([]);
const submitting = ref(false);

// 判断是否可以提交
const canSubmit = computed(() => {
  return uploadImages.value.length > 0;
});

// 图片上传成功回调
const onUploadSuccess = (tempFilePaths: string[]) => {
  console.log('上传成功', tempFilePaths);
};

// 图片上传失败回调
const onUploadFail = (error: any) => {
  console.error('上传失败', error);
  uni.showToast({
    title: '图片上传失败',
    icon: 'none'
  });
};

// 提交任务
const submitTask = async () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '请至少上传一张图片',
      icon: 'none'
    });
    return;
  }
  
  if (submitting.value) return;
  
  try {
    submitting.value = true;
    
    const submitData = {
      taskId: taskId.value,
      content: content.value,
      images: uploadImages.value
    };
    
    const res = await submitTask(submitData);
    
    // 提交成功
    uni.showToast({
      title: '提交成功',
      icon: 'success'
    });
    
    // 延迟跳转回详情页
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
    
  } catch (error) {
    console.error('提交任务失败', error);
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    });
  } finally {
    submitting.value = false;
  }
};

onLoad((options) => {
  if (options.id) {
    taskId.value = options.id;
  }
  
  if (options.title) {
    taskTitle.value = decodeURIComponent(options.title);
  }
});
</script>

<style lang="scss" scoped>
.task-submit-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.submit-content {
  flex: 1;
  padding-bottom: 80px;
}

.form-section {
  margin-top: 15px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px;
  margin: 15px;
}

.form-item {
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
  
  .required {
    color: #ff4d4f;
  }
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.form-textarea {
  width: 100%;
  min-height: 120px;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
}

.word-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.bottom-action {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 15px;
  background-color: #ffffff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  
  .submit-btn {
    width: 100%;
    height: 44px;
    background-color: #007aff;
    color: #ffffff;
    border-radius: 22px;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:disabled {
      background-color: #cccccc;
    }
  }
}
</style> 
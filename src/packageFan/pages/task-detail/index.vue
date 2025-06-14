<template>
  <view class="task-detail-container">
    <custom-navbar title="任务详情" show-back />
    
    <template v-if="task">
      <scroll-view scroll-y class="task-content">
        <!-- 任务基本信息 -->
        <view class="task-header">
          <view class="task-title">{{ task.title }}</view>
          <view class="task-meta">
            <text class="points">{{ task.points }} 积分</text>
            <text class="status" :class="getStatusClass">{{ getStatusText }}</text>
          </view>
          <view class="task-tags">
            <tag v-for="tagItem in task.tags" :key="tagItem" :text="tagItem" />
          </view>
          <view class="task-time">
            <text>开始时间：{{ formatTime(task.startTime) }}</text>
            <text>结束时间：{{ formatTime(task.endTime) }}</text>
          </view>
        </view>
        
        <!-- 任务描述 -->
        <view class="task-desc-title">任务描述</view>
        <view class="task-desc-content">{{ task.description }}</view>
        
        <!-- 任务图片 -->
        <view class="task-images" v-if="task.images && task.images.length > 0">
          <view class="task-desc-title">参考图片</view>
          <scroll-view scroll-x class="image-scroll" show-scrollbar="false">
            <view class="image-item" v-for="(img, index) in task.images" :key="index">
              <image 
                class="task-image" 
                :src="img" 
                mode="aspectFill"
                @tap="previewImage(img, task.images)"
              />
            </view>
          </scroll-view>
        </view>
      </scroll-view>
      
      <!-- 底部操作区 -->
      <view class="bottom-action">
        <button 
          class="submit-btn" 
          :disabled="!canSubmit"
          @tap="goToSubmit"
        >
          {{ getActionButtonText }}
        </button>
      </view>
    </template>
    
    <view v-else-if="!isLoading" class="loading-container">
      <text>任务不存在或已被删除</text>
    </view>
    
    <view v-else class="loading-container">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getTaskDetail, TaskItem } from '../../../api/task';
import { onLoad } from '@dcloudio/uni-app';

const task = ref<TaskItem | null>(null);
const isLoading = ref(true);
const taskId = ref('');

// 格式化时间
const formatTime = (timeStr?: string) => {
  if (!timeStr) return 'N/A';
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return '日期无效';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 获取任务状态对应的样式类
const getStatusClass = computed(() => {
  if (!task.value) return '';
  
  if (task.value.due_date) {
    const now = new Date().getTime();
    const dueDate = new Date(task.value.due_date).getTime();
    if (now > dueDate && task.value.status !== 'completed') return 'status-expired'; 
  }
  if (task.value.startTime) {
      const now = new Date().getTime();
      const startTime = new Date(task.value.startTime).getTime();
      if (now < startTime) return 'status-upcoming';
  }
  
  switch (task.value.status) {
    case 'active': return 'status-active';
    case 'completed': return 'status-completed';
    default: return '';
  }
});

// 获取任务状态文本
const getStatusText = computed(() => {
  if (!task.value) return '';

  if (task.value.due_date) {
    const now = new Date().getTime();
    const dueDate = new Date(task.value.due_date).getTime();
    if (now > dueDate && task.value.status !== 'completed') return '已过期';
  }
  if (task.value.startTime) {
      const now = new Date().getTime();
      const startTime = new Date(task.value.startTime).getTime();
      if (now < startTime) return '未开始';
  }
  
  switch (task.value.status) {
    case 'active': return '进行中';
    case 'completed': return '已完成';
    default: return '未知状态';
  }
});

// 判断是否可以提交任务
const canSubmit = computed(() => {
  if (!task.value || task.value.status !== 'active') return false;
  
  const now = new Date().getTime();
  
  if (task.value.startTime) {
    const startTime = new Date(task.value.startTime).getTime();
    if (isNaN(startTime) || now < startTime) return false;
  }
  
  if (task.value.due_date) {
    const dueDate = new Date(task.value.due_date).getTime();
    if (isNaN(dueDate) || now > dueDate) return false;
  }
  
  return true;
});

// 获取操作按钮文本
const getActionButtonText = computed(() => {
  if (!task.value) return '提交任务';

  if (task.value.status === 'completed') return '已完成';

  if (task.value.due_date) {
    const now = new Date().getTime();
    const dueDate = new Date(task.value.due_date).getTime();
    if (!isNaN(dueDate) && now > dueDate) return '已过期';
  }
  
  if (task.value.startTime) {
      const now = new Date().getTime();
      const startTime = new Date(task.value.startTime).getTime();
      if (!isNaN(startTime) && now < startTime) return '未开始';
  }

  if (task.value.status === 'active') return '提交任务';
  
  return '状态未知';
});

// 获取任务详情
const fetchTaskDetail = async () => {
  console.log('[task-detail] fetchTaskDetail called with taskId:', taskId.value);
  if (!taskId.value) {
    console.log('[task-detail] taskId is empty, aborting fetchTaskDetail.');
    isLoading.value = false;
    return;
  }
  
  isLoading.value = true;
  try {
    // getTaskDetail is typed to return Promise<TaskItem> via request<TaskItem>
    // However, the 'request' function itself might wrap this in a ResponseData structure.
    // Let's assume 'responseFromApi' is the direct result of the HTTP request, potentially with a wrapper.
    const responseFromApi: any = await getTaskDetail(taskId.value);
    console.log('[task-detail] Raw response from getTaskDetail:', JSON.stringify(responseFromApi));

    // Scenario 1: responseFromApi is { code: ..., data: TaskItem, ... }
    if (responseFromApi && typeof responseFromApi === 'object' && 'data' in responseFromApi && responseFromApi.data) {
      // Check if responseFromApi.data looks like a TaskItem (e.g., has an 'id')
      if (typeof responseFromApi.data === 'object' && 'id' in responseFromApi.data) {
        task.value = responseFromApi.data as TaskItem; 
        console.log('[task-detail] Assigned task.value from response.data');
      } else {
        console.warn('[task-detail] response.data exists but does not look like a TaskItem. Content:', JSON.stringify(responseFromApi.data));
        task.value = null;
      }
    // Scenario 2: responseFromApi is directly TaskItem 
    } else if (responseFromApi && typeof responseFromApi === 'object' && 'id' in responseFromApi) {
      console.log('[task-detail] Response seems to be a direct TaskItem.');
      task.value = responseFromApi as TaskItem;
    } else {
      console.error('[task-detail] Unexpected response structure or response is null/undefined.');
      task.value = null;
    }
    
    console.log('[task-detail] Final task.value set to:', JSON.stringify(task.value));
    // 新增日志，用于诊断 canSubmit 条件
    if (task.value) {
      console.log('[task-detail] Task details for canSubmit check:', 
                  'Status:', task.value.status, 
                  'StartTime:', task.value.startTime, 
                  'EndTime:', task.value.endTime, 
                  'Now:', new Date().toISOString());
    }

  } catch (error) {
    console.error('[task-detail] 获取任务详情失败:', error);
    task.value = null;
    uni.showToast({
      title: '加载任务失败',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
    console.log('[task-detail] fetchTaskDetail finished. isLoading:', isLoading.value);
  }
};

// 预览图片
const previewImage = (current: string, urls: string[]) => {
  uni.previewImage({
    current,
    urls
  });
};

// 跳转到提交页面
const goToSubmit = () => {
  console.log('[task-detail] goToSubmit function called.'); // 新增日志
  if (!canSubmit.value || !task.value?.id) { // 确保 task.value 和 task.value.id 存在
    console.log('[task-detail] goToSubmit: canSubmit is false or taskId is missing.');
    let reason = '任务当前不可提交';
    if (!task.value) {
      reason = '任务数据未加载';
    } else if (!task.value.id) {
      reason = '任务ID缺失';
    }
    else {
      const now = new Date().getTime();
      // 注意：TaskItem接口中定义的是 startTime 和 due_date，确保使用正确的字段
      const startTimeMs = task.value.startTime ? new Date(task.value.startTime).getTime() : 0;
      const endTimeMs = task.value.due_date ? new Date(task.value.due_date).getTime() : Infinity; // 使用 due_date

      if (task.value.status !== 'active') {
        reason = `任务状态为 [${getStatusText.value}], 不是可提交状态`;
      } else if (task.value.startTime && now < startTimeMs) {
        reason = '任务尚未开始';
      } else if (task.value.due_date && now > endTimeMs) {
        reason = '任务已截止';
      }
    }
    uni.showToast({
      title: reason,
      icon: 'none'
    });
    return;
  }
  
  // 导航到任务提交页面，并传递任务ID
  console.log(`[task-detail] Navigating to submit page with taskId: ${task.value.id}`);
  uni.navigateTo({
    url: `/packageFan/pages/task-submit/index?taskId=${task.value.id}`
  });
};

onLoad((options) => {
  console.log('[task-detail] onLoad options:', JSON.stringify(options));
  if (options && options.id) {
    taskId.value = options.id;
    console.log('[task-detail] taskId set to:', taskId.value);
    fetchTaskDetail();
  } else {
    console.log('[task-detail] No id found in onLoad options.');
    isLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.task-detail-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.task-content {
  flex: 1;
  padding-bottom: 80px;
}

.task-header {
  padding: 20px 15px;
  background-color: #ffffff;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .task-title {
    font-size: 20px;
    font-weight: bold;
    color: #333;
    line-height: 1.4;
    margin-bottom: 10px;
  }
  
  .task-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    
    .points {
      font-size: 16px;
      font-weight: bold;
      color: #ff6b00;
    }
    
    .status {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 10px;
      
      &.status-active {
        background-color: rgba(0, 200, 83, 0.1);
        color: #00c853;
      }
      
      &.status-completed {
        background-color: rgba(100, 100, 100, 0.1);
        color: #646464;
      }
      
      &.status-expired {
        background-color: rgba(213, 0, 0, 0.1);
        color: #d50000;
      }
      
      &.status-upcoming {
        background-color: rgba(0, 122, 255, 0.1);
        color: #007aff;
      }
    }
  }
  
  .task-tags {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 15px;
    
    .tag {
      margin-right: 8px;
      margin-bottom: 8px;
    }
  }
  
  .task-time {
    display: flex;
    flex-direction: column;
    font-size: 12px;
    color: #999;
    
    text {
      margin-bottom: 5px;
    }
  }
}

.task-desc-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 15px 15px 10px;
}

.task-desc-content {
  padding: 15px;
  background-color: #ffffff;
  border-radius: 8px;
  margin: 0 15px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.task-images {
  margin-bottom: 15px;
  
  .image-scroll {
    padding: 0 15px;
    white-space: nowrap;
    
    .image-item {
      display: inline-block;
      margin-right: 10px;
      
      .task-image {
        width: 120px;
        height: 120px;
        border-radius: 8px;
      }
    }
  }
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

.loading-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #999;
}
</style> 
<template>
  <view class="review-detail-container">
    <view v-if="loading" class="loading">
      <uni-load-more status="loading" />
    </view>
    
    <block v-else>
      <!-- 用户信息 -->
      <view class="user-section">
        <image class="user-avatar" :src="submission.userAvatar || '/static/images/default-avatar.png'" mode="aspectFill"></image>
        <view class="user-info">
          <text class="user-name">{{ submission.userName }}</text>
          <text class="submission-time">提交时间：{{ formatTime(submission.createdAt) }}</text>
        </view>
      </view>
      
      <!-- 任务信息 -->
      <view class="task-section">
        <text class="section-title">任务信息</text>
        <view class="task-info">
          <text class="task-title">{{ submission.taskTitle }}</text>
          <text class="task-desc">{{ submission.taskDescription }}</text>
        </view>
      </view>
      
      <!-- 提交内容 -->
      <view class="content-section">
        <text class="section-title">提交内容</text>
        <view class="content-info">
          <text class="content-text">{{ submission.content || '用户未填写提交内容' }}</text>
          
          <!-- 图片列表 -->
          <view v-if="submission.images && submission.images.length > 0" class="image-list">
            <view 
              v-for="(image, index) in submission.images" 
              :key="index"
              class="image-item"
              @click="previewImage(index)"
            >
              <image class="submission-image" :src="image" mode="aspectFill"></image>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 补充信息 -->
      <view v-if="submission.extraFields && submission.extraFields.length > 0" class="extra-section">
        <text class="section-title">补充信息</text>
        <view class="extra-list">
          <view 
            v-for="(field, index) in submission.extraFields" 
            :key="index"
            class="extra-item"
          >
            <text class="field-label">{{ field.label }}：</text>
            <text class="field-value">{{ field.value }}</text>
          </view>
        </view>
      </view>
      
      <!-- 审核意见 -->
      <view class="review-section">
        <text class="section-title">审核意见</text>
        <textarea
          class="review-textarea"
          placeholder="输入审核意见（可选）"
          v-model="reviewComment"
        />
      </view>
      
      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="action-btn reject-btn" @click="handleReview('reject')">拒绝</button>
        <button class="action-btn approve-btn" @click="handleReview('approve')">通过</button>
      </view>
    </block>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSubmissionDetail, reviewSubmission } from '@/api/admin'
import { formatTime } from '@/utils/date'

// 提交ID
const submissionId = ref('')
// 加载状态
const loading = ref(true)
// 提交详情
const submission = ref({})
// 审核意见
const reviewComment = ref('')

// 初始化数据
const initData = async () => {
  loading.value = true
  try {
    // 获取路由参数
    const pages = getCurrentPages()
    const page = pages[pages.length - 1]
    const options = page.$page?.options || {}
    
    if (options.id) {
      submissionId.value = options.id
      // 获取提交详情
      const res = await getSubmissionDetail(submissionId.value)
      submission.value = res.data
    }
  } catch (error) {
    console.error('获取提交详情失败', error)
    uni.showToast({
      title: '获取详情失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 预览图片
const previewImage = (index) => {
  if (!submission.value.images || submission.value.images.length === 0) return
  
  uni.previewImage({
    current: index,
    urls: submission.value.images
  })
}

// 处理审核操作
const handleReview = async (action) => {
  try {
    await reviewSubmission(submissionId.value, { 
      status: action,
      comment: reviewComment.value
    })
    
    uni.showToast({
      title: action === 'approve' ? '已通过' : '已拒绝',
      icon: 'success'
    })
    
    // 延迟返回列表页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('审核操作失败', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}

// 页面加载
onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>
.review-detail-container {
  padding: 30rpx;
}

.loading {
  padding: 200rpx 0;
  display: flex;
  justify-content: center;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.user-section {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  background-color: #f5f5f5;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.submission-time {
  font-size: 24rpx;
  color: #999;
}

.task-section, .content-section, .extra-section, .review-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.task-info {
  margin-bottom: 10rpx;
}

.task-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.task-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.content-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  display: block;
  margin-bottom: 20rpx;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
}

.image-item {
  width: 220rpx;
  height: 220rpx;
  margin-right: 15rpx;
  margin-bottom: 15rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #f5f5f5;
}

.image-item:nth-child(3n) {
  margin-right: 0;
}

.submission-image {
  width: 100%;
  height: 100%;
}

.extra-item {
  display: flex;
  margin-bottom: 16rpx;
}

.field-label {
  font-size: 28rpx;
  color: #666;
  width: 180rpx;
}

.field-value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.review-textarea {
  width: 100%;
  height: 200rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
  padding: 0 40rpx 60rpx;
}

.action-btn {
  width: 45%;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  font-size: 30rpx;
  text-align: center;
}

.reject-btn {
  background-color: #fff1f0;
  color: #f56c6c;
}

.approve-btn {
  background-color: #e6f7ff;
  color: #1890ff;
}
</style> 
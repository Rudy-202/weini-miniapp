<template>
  <view class="review-container">
    <view class="page-header">
      <view class="page-title">任务审核</view>
      <button 
        class="batch-btn" 
        :disabled="!hasSelected" 
        :class="{ 'disabled': !hasSelected }"
        @click="showBatchActions"
      >
        批量操作
      </button>
    </view>
    
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <picker
        class="task-picker"
        :value="taskIndex"
        :range="taskOptions"
        @change="handleTaskChange"
      >
        <view class="picker-value">{{ taskIndex === 0 ? '选择任务' : taskOptions[taskIndex] }}</view>
      </picker>
      
      <view class="search-box">
        <input
          class="search-input"
          type="text"
          placeholder="搜索昵称"
          v-model="filters.keyword"
          @input="handleSearch"
        />
        <text class="search-icon">🔍</text>
      </view>
    </view>
    
    <!-- 提交列表 -->
    <view v-if="loading" class="loading">
      <uni-load-more status="loading" />
    </view>
    <view v-else class="submission-list">
      <block v-if="submissions.length > 0">
        <view 
          v-for="submission in submissions" 
          :key="submission.id" 
          class="submission-item"
        >
          <view class="select-box" @click.stop="toggleSelect(submission.id)">
            <view class="checkbox" :class="{ 'checked': selectedIds.includes(submission.id) }"></view>
          </view>
          
          <view class="submission-content" @click="navigateToDetail(submission.id)">
            <view class="user-info">
              <image class="user-avatar" :src="submission.userAvatar || '/static/images/default-avatar.png'" mode="aspectFill"></image>
              <text class="user-name">{{ submission.userName }}</text>
            </view>
            
            <view class="task-info">
              <text class="task-title">{{ submission.taskTitle }}</text>
              <text class="submission-time">{{ formatTime(submission.createdAt) }}</text>
            </view>
            
            <view class="submission-preview">
              <image 
                v-if="submission.images && submission.images.length > 0" 
                class="preview-image" 
                :src="submission.images[0]" 
                mode="aspectFill"
              ></image>
              <text class="preview-text">{{ submission.content || '查看详情' }}</text>
            </view>
            
            <view class="submission-actions">
              <button class="action-btn approve-btn" @click.stop="handleReview(submission.id, 'approve')">通过</button>
              <button class="action-btn reject-btn" @click.stop="handleReview(submission.id, 'reject')">拒绝</button>
            </view>
          </view>
        </view>
      </block>
      <view v-else class="empty-data">
        <text>暂无待审核提交</text>
      </view>
    </view>
    
    <!-- 加载更多 -->
    <uni-load-more :status="loadMoreStatus" v-if="submissions.length > 0" />
    
    <!-- 批量操作弹窗 -->
    <uni-popup ref="batchPopup" type="bottom">
      <view class="popup-content">
        <view class="popup-title">批量操作</view>
        <view class="popup-options">
          <button class="popup-btn approve-btn" @click="batchReview('approve')">批量通过</button>
          <button class="popup-btn reject-btn" @click="batchReview('reject')">批量拒绝</button>
          <button class="popup-btn cancel-btn" @click="closeBatchPopup">取消</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getPendingSubmissions, reviewSubmission, batchReviewSubmissions } from '@/api/admin'
import { formatTime } from '@/utils/date'

// 任务选项
const taskOptions = ['全部任务']
const taskIds = ['all']
const taskIndex = ref(0)

// 提交列表数据
const submissions = ref([])
const loading = ref(false)
const loadMoreStatus = ref('more')
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)

// 筛选条件
const filters = reactive({
  taskId: 'all',
  keyword: '',
  page: 1,
  pageSize: 10
})

// 选择相关
const selectedIds = ref([])
const hasSelected = computed(() => selectedIds.value.length > 0)

// 初始化任务选项
const initTaskOptions = async () => {
  try {
    // 这里应该调用获取任务列表的接口
    // 由于是模拟，我们添加一些固定选项
    const dummyTasks = [
      { id: 'task1', title: '微博转发任务' },
      { id: 'task2', title: 'B站观看任务' },
      { id: 'task3', title: '五一活动任务' }
    ]
    
    dummyTasks.forEach(task => {
      taskOptions.push(task.title)
      taskIds.push(task.id)
    })
  } catch (error) {
    console.error('初始化任务选项失败', error)
  }
}

// 加载提交列表
const loadSubmissions = async (refresh = false) => {
  if (refresh) {
    page.value = 1
    submissions.value = []
    hasMore.value = true
  }
  
  if (!hasMore.value) return
  
  loading.value = true
  loadMoreStatus.value = 'loading'
  
  try {
    const params = {
      ...filters,
      page: page.value,
      pageSize: pageSize.value
    }
    
    const res = await getPendingSubmissions(params)
    
    if (refresh) {
      submissions.value = res.data
    } else {
      submissions.value = [...submissions.value, ...res.data]
    }
    
    // 检查是否还有更多数据
    if (res.data.length < pageSize.value) {
      hasMore.value = false
      loadMoreStatus.value = 'noMore'
    } else {
      loadMoreStatus.value = 'more'
      page.value++
    }
  } catch (error) {
    console.error('获取待审核提交失败', error)
    uni.showToast({
      title: '获取数据失败',
      icon: 'none'
    })
    loadMoreStatus.value = 'more'
  } finally {
    loading.value = false
  }
}

// 任务筛选
const handleTaskChange = (e) => {
  taskIndex.value = e.detail.value
  filters.taskId = taskIds[taskIndex.value]
  loadSubmissions(true)
}

// 搜索处理
const handleSearch = (e) => {
  filters.keyword = e.detail.value
  loadSubmissions(true)
}

// 切换选择状态
const toggleSelect = (id) => {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

// 批量操作弹窗
const batchPopup = ref(null)
const showBatchActions = () => {
  if (!hasSelected.value) return
  batchPopup.value.open()
}

// 关闭批量操作弹窗
const closeBatchPopup = () => {
  batchPopup.value.close()
}

// 审核操作
const handleReview = async (id, action) => {
  try {
    await reviewSubmission(id, { status: action })
    
    uni.showToast({
      title: action === 'approve' ? '已通过' : '已拒绝',
      icon: 'success'
    })
    
    // 从列表中移除已审核的提交
    const index = submissions.value.findIndex(item => item.id === id)
    if (index !== -1) {
      submissions.value.splice(index, 1)
      
      // 如果选中列表中有该项，也移除
      const selectedIndex = selectedIds.value.indexOf(id)
      if (selectedIndex !== -1) {
        selectedIds.value.splice(selectedIndex, 1)
      }
    }
    
    // 如果列表为空且还有更多数据，加载更多
    if (submissions.value.length === 0 && hasMore.value) {
      loadSubmissions()
    }
  } catch (error) {
    console.error('审核操作失败', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}

// 批量审核
const batchReview = async (action) => {
  if (!selectedIds.value.length) return
  
  try {
    await batchReviewSubmissions({
      ids: selectedIds.value,
      status: action
    })
    
    uni.showToast({
      title: `批量${action === 'approve' ? '通过' : '拒绝'}成功`,
      icon: 'success'
    })
    
    // 关闭弹窗
    closeBatchPopup()
    
    // 从列表中移除已审核的提交
    submissions.value = submissions.value.filter(item => !selectedIds.value.includes(item.id))
    
    // 清空选中列表
    selectedIds.value = []
    
    // 如果列表为空且还有更多数据，加载更多
    if (submissions.value.length === 0 && hasMore.value) {
      loadSubmissions()
    }
  } catch (error) {
    console.error('批量审核操作失败', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}

// 跳转到详情页
const navigateToDetail = (id) => {
  uni.navigateTo({
    url: `/packageAdmin/pages/review/detail?id=${id}`
  })
}

// 页面加载
onMounted(() => {
  initTaskOptions()
  loadSubmissions()
})

// 下拉刷新
onPullDownRefresh(() => {
  loadSubmissions(true)
})

// 触底加载更多
onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    loadSubmissions()
  }
})
</script>

<style lang="scss" scoped>
.review-container {
  padding: 30rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
}

.batch-btn {
  background-color: #3b7ff3;
  color: #fff;
  font-size: 28rpx;
  padding: 12rpx 30rpx;
  border-radius: 30rpx;
  line-height: 1.5;
}

.batch-btn.disabled {
  background-color: #b0b0b0;
  color: #fff;
}

.filter-bar {
  display: flex;
  margin-bottom: 30rpx;
}

.task-picker {
  width: 240rpx;
  height: 70rpx;
  border-radius: 35rpx;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-input {
  width: 100%;
  height: 70rpx;
  border-radius: 35rpx;
  background-color: #f5f5f5;
  padding: 0 70rpx 0 30rpx;
  font-size: 28rpx;
}

.search-icon {
  position: absolute;
  right: 30rpx;
  top: 18rpx;
  color: #999;
}

.picker-value {
  font-size: 28rpx;
  color: #333;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.submission-list {
  margin-top: 20rpx;
}

.submission-item {
  display: flex;
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.select-box {
  width: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30rpx 0;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
  box-sizing: border-box;
}

.checkbox.checked {
  background-color: #3b7ff3;
  border-color: #3b7ff3;
  position: relative;
}

.checkbox.checked::after {
  content: '';
  position: absolute;
  width: 16rpx;
  height: 8rpx;
  border-left: 4rpx solid #fff;
  border-bottom: 4rpx solid #fff;
  transform: rotate(-45deg);
  top: 12rpx;
  left: 10rpx;
}

.submission-content {
  flex: 1;
  padding: 30rpx 30rpx 30rpx 0;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.user-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  background-color: #f5f5f5;
}

.user-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.task-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.task-title {
  font-size: 26rpx;
  color: #666;
}

.submission-time {
  font-size: 24rpx;
  color: #999;
}

.submission-preview {
  display: flex;
  margin-bottom: 20rpx;
}

.preview-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  margin-right: 16rpx;
  background-color: #f5f5f5;
}

.preview-text {
  flex: 1;
  font-size: 26rpx;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.submission-actions {
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  margin-left: 20rpx;
  font-size: 24rpx;
  padding: 8rpx 24rpx;
  border-radius: 30rpx;
  line-height: 1.5;
}

.approve-btn {
  background-color: #e6f7ff;
  color: #1890ff;
}

.reject-btn {
  background-color: #fff1f0;
  color: #f56c6c;
}

.loading, .empty-data {
  padding: 100rpx 0;
  text-align: center;
  color: #999;
}

// 弹窗样式
.popup-content {
  padding: 40rpx;
  background-color: #fff;
  border-top-left-radius: 16rpx;
  border-top-right-radius: 16rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
}

.popup-options {
  display: flex;
  flex-direction: column;
}

.popup-btn {
  height: 90rpx;
  line-height: 90rpx;
  font-size: 30rpx;
  border-radius: 45rpx;
  margin-bottom: 20rpx;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}
</style> 
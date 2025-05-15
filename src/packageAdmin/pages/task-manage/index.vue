<template>
  <view class="task-manage-container">
    <!-- 顶部搜索筛选栏 -->
    <view class="filter-bar">
      <view class="search-box">
        <input
          class="search-input"
          type="text"
          placeholder="搜索任务"
          v-model="filters.keyword"
          @input="handleSearch"
        />
        <text class="search-icon">🔍</text>
      </view>
      <picker
        class="status-picker"
        :value="statusIndex"
        :range="statusOptions"
        @change="handleStatusChange"
      >
        <view class="picker-value">{{ statusOptions[statusIndex] }}</view>
      </picker>
    </view>

    <!-- 创建任务按钮 -->
    <view class="create-button" @click="navigateTo('/packageAdmin/pages/task-create/index')">
      <text class="create-icon">+</text>
      <text>创建任务</text>
    </view>

    <!-- 任务列表 -->
    <view v-if="loading" class="loading">
      <uni-load-more status="loading" />
    </view>
    <view v-else class="task-list">
      <block v-if="tasks.length > 0">
        <view 
          v-for="task in tasks" 
          :key="task.id" 
          class="task-item"
          @click="navigateTo(`/packageAdmin/pages/task-edit/index?id=${task.id}`)"
        >
          <view class="task-header">
            <text class="task-title">{{ task.title }}</text>
            <view class="task-status" :class="getStatusClass(task.status)">
              {{ getStatusText(task.status) }}
            </view>
          </view>
          <view class="task-info">
            <text class="task-desc">{{ task.description }}</text>
          </view>
          <view class="task-footer">
            <text class="task-date">截止日期: {{ formatDate(task.deadline) }}</text>
            <text class="task-points">+{{ task.points }}积分</text>
          </view>
          <view class="task-actions">
            <button class="action-btn edit-btn" @click.stop="navigateTo(`/packageAdmin/pages/task-edit/index?id=${task.id}`)">编辑</button>
            <button class="action-btn delete-btn" @click.stop="confirmDelete(task)">删除</button>
          </view>
        </view>
      </block>
      <view v-else class="empty-data">
        <text>暂无任务数据</text>
      </view>
    </view>

    <!-- 加载更多 -->
    <uni-load-more :status="loadMoreStatus" v-if="tasks.length > 0" />
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { getTasks, deleteTask } from '@/api/admin'
import { formatDate } from '@/utils/date'

// 状态选项
const statusOptions = ['全部', '进行中', '已结束', '未开始']
const statusValues = ['all', 'active', 'ended', 'pending']
const statusIndex = ref(0)

// 任务数据
const tasks = ref([])
const loading = ref(false)
const loadMoreStatus = ref('more')
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)

// 筛选条件
const filters = reactive({
  status: 'all',
  keyword: '',
  page: 1,
  pageSize: 10
})

// 获取任务状态显示文本
const getStatusText = (status) => {
  switch (status) {
    case 'active': return '进行中'
    case 'ended': return '已结束'
    case 'pending': return '未开始'
    default: return '未知'
  }
}

// 获取任务状态样式
const getStatusClass = (status) => {
  switch (status) {
    case 'active': return 'status-active'
    case 'ended': return 'status-ended'
    case 'pending': return 'status-pending'
    default: return ''
  }
}

// 加载任务列表
const loadTasks = async (refresh = false) => {
  if (refresh) {
    page.value = 1
    tasks.value = []
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
    
    const res = await getTasks(params)
    
    if (refresh) {
      tasks.value = res.data
    } else {
      tasks.value = [...tasks.value, ...res.data]
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
    console.error('获取任务列表失败', error)
    uni.showToast({
      title: '获取任务列表失败',
      icon: 'none'
    })
    loadMoreStatus.value = 'more'
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = (e) => {
  filters.keyword = e.detail.value
  loadTasks(true)
}

// 状态筛选
const handleStatusChange = (e) => {
  statusIndex.value = e.detail.value
  filters.status = statusValues[statusIndex.value]
  loadTasks(true)
}

// 确认删除任务
const confirmDelete = (task) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除任务"${task.title}"吗？此操作不可撤销。`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteTask(task.id)
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
          // 刷新列表
          loadTasks(true)
        } catch (error) {
          console.error('删除任务失败', error)
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 页面跳转
const navigateTo = (url) => {
  uni.navigateTo({ url })
}

// 页面加载
onMounted(() => {
  loadTasks()
})

// 下拉刷新
onPullDownRefresh(() => {
  loadTasks(true)
})

// 触底加载更多
onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    loadTasks()
  }
})
</script>

<style lang="scss" scoped>
.task-manage-container {
  padding: 30rpx;
}

.filter-bar {
  display: flex;
  margin-bottom: 30rpx;
}

.search-box {
  flex: 1;
  position: relative;
  margin-right: 20rpx;
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

.status-picker {
  width: 200rpx;
  height: 70rpx;
  border-radius: 35rpx;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.picker-value {
  font-size: 28rpx;
  color: #333;
}

.create-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  background-color: #3b7ff3;
  color: #fff;
  border-radius: 40rpx;
  margin-bottom: 30rpx;
  font-size: 28rpx;
}

.create-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.task-list {
  margin-top: 20rpx;
}

.task-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.task-title {
  font-size: 32rpx;
  font-weight: bold;
  flex: 1;
}

.task-status {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.status-active {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-ended {
  background-color: #f5f5f5;
  color: #999;
}

.status-pending {
  background-color: #fff7e6;
  color: #fa8c16;
}

.task-info {
  margin-bottom: 20rpx;
}

.task-desc {
  font-size: 28rpx;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  color: #999;
  font-size: 24rpx;
  margin-bottom: 20rpx;
}

.task-points {
  color: #f56c6c;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  margin-left: 20rpx;
  font-size: 24rpx;
  padding: 8rpx 24rpx;
  border-radius: 30rpx;
  background-color: #f5f5f5;
  color: #666;
  line-height: 1.5;
}

.edit-btn {
  background-color: #e6f7ff;
  color: #1890ff;
}

.delete-btn {
  background-color: #fff1f0;
  color: #f56c6c;
}

.loading, .empty-data {
  padding: 100rpx 0;
  text-align: center;
  color: #999;
}
</style> 
<template>
  <view class="invites-container">
    <view class="page-header">
      <view class="page-title">邀请码管理</view>
      <button class="create-btn" @click="showCreateModal">创建邀请码</button>
    </view>
    
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <picker
        class="status-picker"
        :value="statusIndex"
        :range="statusOptions"
        @change="handleStatusChange"
      >
        <view class="picker-value">{{ statusOptions[statusIndex] }}</view>
      </picker>
    </view>
    
    <!-- 邀请码列表 -->
    <view v-if="loading" class="loading">
      <uni-load-more status="loading" />
    </view>
    <view v-else class="invite-list">
      <block v-if="inviteCodes.length > 0">
        <view 
          v-for="code in inviteCodes" 
          :key="code.id" 
          class="invite-item"
        >
          <view class="invite-info">
            <text class="invite-code">{{ code.code }}</text>
            <view class="invite-status" :class="getStatusClass(code.status)">
              {{ getStatusText(code.status) }}
            </view>
          </view>
          <view class="invite-detail">
            <text class="invite-name">名称: {{ code.name || '未命名' }}</text>
            <text class="invite-uses">使用次数: {{ code.usedCount }}/{{ code.maxUses || '无限' }}</text>
          </view>
          <view class="invite-footer">
            <text class="invite-date">创建时间: {{ formatDate(code.createdAt) }}</text>
            <text v-if="code.expiresAt" class="invite-expire">过期时间: {{ formatDate(code.expiresAt) }}</text>
          </view>
          <view class="invite-actions">
            <button 
              v-if="code.status === 'active'" 
              class="action-btn disable-btn" 
              @click="confirmDisable(code)"
            >
              禁用
            </button>
            <button class="action-btn copy-btn" @click="copyInviteCode(code.code)">复制</button>
          </view>
        </view>
      </block>
      <view v-else class="empty-data">
        <text>暂无邀请码数据</text>
      </view>
    </view>
    
    <!-- 加载更多 -->
    <uni-load-more :status="loadMoreStatus" v-if="inviteCodes.length > 0" />
    
    <!-- 创建邀请码弹窗 -->
    <uni-popup ref="createPopup" type="center">
      <view class="popup-content">
        <view class="popup-title">创建邀请码</view>
        
        <view class="form-group">
          <text class="form-label">邀请码名称</text>
          <input
            class="form-input"
            type="text"
            placeholder="请输入名称（可选）"
            v-model="formData.name"
          />
        </view>
        
        <view class="form-group">
          <text class="form-label">使用次数</text>
          <input
            class="form-input"
            type="number"
            placeholder="留空表示无限制"
            v-model="formData.maxUses"
          />
        </view>
        
        <view class="form-group">
          <text class="form-label">过期时间</text>
          <picker
            class="form-picker"
            mode="date"
            :value="formData.expiresAt || ''"
            start="2023-01-01"
            end="2030-12-31"
            @change="handleExpiryChange"
          >
            <view class="picker-value">
              {{ formData.expiresAt || '选择过期日期（可选）' }}
            </view>
          </picker>
        </view>
        
        <view class="popup-actions">
          <button class="popup-btn cancel-btn" @click="closeCreateModal">取消</button>
          <button class="popup-btn confirm-btn" @click="handleCreateCode">创建</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getInviteCodes, createInviteCode, disableInviteCode } from '@/api/admin'
import { formatDate } from '@/utils/date'

// 状态选项
const statusOptions = ['全部', '有效', '已禁用', '已过期']
const statusValues = ['all', 'active', 'disabled', 'expired']
const statusIndex = ref(0)

// 邀请码列表数据
const inviteCodes = ref([])
const loading = ref(false)
const loadMoreStatus = ref('more')
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)

// 筛选条件
const filters = reactive({
  status: 'all',
  page: 1,
  pageSize: 10
})

// 创建邀请码表单数据
const formData = reactive({
  name: '',
  maxUses: '',
  expiresAt: ''
})

// 获取状态显示文本
const getStatusText = (status) => {
  switch (status) {
    case 'active': return '有效'
    case 'disabled': return '已禁用'
    case 'expired': return '已过期'
    default: return '未知'
  }
}

// 获取状态样式
const getStatusClass = (status) => {
  switch (status) {
    case 'active': return 'status-active'
    case 'disabled': return 'status-disabled'
    case 'expired': return 'status-expired'
    default: return ''
  }
}

// 加载邀请码列表
const loadInviteCodes = async (refresh = false) => {
  if (refresh) {
    page.value = 1
    inviteCodes.value = []
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
    
    const res = await getInviteCodes(params)
    
    if (refresh) {
      inviteCodes.value = res.data
    } else {
      inviteCodes.value = [...inviteCodes.value, ...res.data]
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
    console.error('获取邀请码列表失败', error)
    uni.showToast({
      title: '获取数据失败',
      icon: 'none'
    })
    loadMoreStatus.value = 'more'
  } finally {
    loading.value = false
  }
}

// 状态筛选
const handleStatusChange = (e) => {
  statusIndex.value = e.detail.value
  filters.status = statusValues[statusIndex.value]
  loadInviteCodes(true)
}

// 处理过期日期选择
const handleExpiryChange = (e) => {
  formData.expiresAt = e.detail.value
}

// 创建邀请码弹窗
const createPopup = ref(null)
const showCreateModal = () => {
  // 重置表单
  Object.keys(formData).forEach(key => {
    formData[key] = ''
  })
  
  // 显示弹窗
  createPopup.value.open()
}

// 关闭创建邀请码弹窗
const closeCreateModal = () => {
  createPopup.value.close()
}

// 创建邀请码
const handleCreateCode = async () => {
  try {
    const data = { ...formData }
    
    // 如果maxUses为空，则设为null表示无限制
    if (data.maxUses === '') {
      data.maxUses = null
    } else {
      data.maxUses = parseInt(data.maxUses)
    }
    
    await createInviteCode(data)
    
    uni.showToast({
      title: '创建成功',
      icon: 'success'
    })
    
    // 关闭弹窗并刷新列表
    closeCreateModal()
    loadInviteCodes(true)
  } catch (error) {
    console.error('创建邀请码失败', error)
    uni.showToast({
      title: '创建失败',
      icon: 'none'
    })
  }
}

// 确认禁用邀请码
const confirmDisable = (code) => {
  uni.showModal({
    title: '确认禁用',
    content: `确定要禁用邀请码"${code.code}"吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await disableInviteCode(code.id)
          uni.showToast({
            title: '禁用成功',
            icon: 'success'
          })
          // 刷新列表
          loadInviteCodes(true)
        } catch (error) {
          console.error('禁用邀请码失败', error)
          uni.showToast({
            title: '禁用失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 复制邀请码
const copyInviteCode = (code) => {
  uni.setClipboardData({
    data: code,
    success: () => {
      uni.showToast({
        title: '复制成功',
        icon: 'success'
      })
    }
  })
}

// 页面加载
onMounted(() => {
  loadInviteCodes()
})

// 下拉刷新
onPullDownRefresh(() => {
  loadInviteCodes(true)
})

// 触底加载更多
onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    loadInviteCodes()
  }
})
</script>

<style lang="scss" scoped>
.invites-container {
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

.create-btn {
  background-color: #3b7ff3;
  color: #fff;
  font-size: 28rpx;
  padding: 12rpx 30rpx;
  border-radius: 30rpx;
  line-height: 1.5;
}

.filter-bar {
  margin-bottom: 30rpx;
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

.invite-list {
  margin-top: 20rpx;
}

.invite-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.invite-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.invite-code {
  font-size: 32rpx;
  font-weight: bold;
  font-family: monospace;
}

.invite-status {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.status-active {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-disabled {
  background-color: #f5f5f5;
  color: #999;
}

.status-expired {
  background-color: #fff2e8;
  color: #fa541c;
}

.invite-detail {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.invite-name, .invite-uses {
  font-size: 28rpx;
  color: #666;
}

.invite-footer {
  display: flex;
  justify-content: space-between;
  color: #999;
  font-size: 24rpx;
  margin-bottom: 20rpx;
}

.invite-actions {
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
  line-height: 1.5;
}

.disable-btn {
  background-color: #fff1f0;
  color: #f56c6c;
}

.copy-btn {
  background-color: #e6f7ff;
  color: #1890ff;
}

.loading, .empty-data {
  padding: 100rpx 0;
  text-align: center;
  color: #999;
}

// 弹窗样式
.popup-content {
  width: 600rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
}

.form-group {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.form-input, .form-picker {
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.popup-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
}

.popup-btn {
  width: 45%;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  text-align: center;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background-color: #3b7ff3;
  color: #fff;
}
</style> 
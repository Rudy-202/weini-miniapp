<template>
  <view class="task-form-container">
    <view class="form-title">创建任务</view>
    
    <view class="form-group">
      <text class="form-label">任务标题 <text class="required">*</text></text>
      <input
        class="form-input"
        type="text"
        placeholder="请输入任务标题"
        v-model="taskForm.title"
      />
    </view>
    
    <view class="form-group">
      <text class="form-label">任务描述 <text class="required">*</text></text>
      <textarea
        class="form-textarea"
        placeholder="请输入任务描述"
        v-model="taskForm.description"
      />
    </view>
    
    <view class="form-group">
      <text class="form-label">任务类型 <text class="required">*</text></text>
      <picker
        class="form-picker"
        :value="typeIndex"
        :range="taskTypes"
        @change="handleTypeChange"
      >
        <view class="picker-value">
          {{ taskForm.type ? typeMap[taskForm.type] : '请选择任务类型' }}
        </view>
      </picker>
    </view>
    
    <view class="form-group">
      <text class="form-label">截止日期 <text class="required">*</text></text>
      <picker
        class="form-picker"
        mode="date"
        :value="taskForm.deadline || ''"
        start="2023-01-01"
        end="2030-12-31"
        @change="handleDateChange"
      >
        <view class="picker-value">
          {{ taskForm.deadline || '请选择截止日期' }}
        </view>
      </picker>
    </view>
    
    <view class="form-group">
      <text class="form-label">积分奖励 <text class="required">*</text></text>
      <input
        class="form-input"
        type="number"
        placeholder="请输入积分奖励"
        v-model="taskForm.points"
      />
    </view>
    
    <view class="form-group">
      <text class="form-label">是否为焦点任务</text>
      <switch
        :checked="taskForm.isFocus"
        @change="handleSwitchChange"
        color="#3b7ff3"
      />
    </view>
    
    <view class="form-group">
      <text class="form-label">任务要求</text>
      <view class="requirements-list">
        <view 
          v-for="(req, index) in taskForm.requirements" 
          :key="index"
          class="requirement-item"
        >
          <input
            class="requirement-input"
            type="text"
            placeholder="请输入要求内容"
            v-model="taskForm.requirements[index]"
          />
          <text class="remove-btn" @click="removeRequirement(index)">×</text>
        </view>
        <view class="add-requirement" @click="addRequirement">
          <text class="add-icon">+</text>
          <text>添加要求</text>
        </view>
      </view>
    </view>
    
    <view class="form-group">
      <text class="form-label">任务标签</text>
      <view class="tags-input">
        <view 
          v-for="(tag, index) in taskForm.tags" 
          :key="index"
          class="tag-item"
        >
          {{ tag }}
          <text class="remove-tag" @click="removeTag(index)">×</text>
        </view>
        <input
          class="tag-input"
          type="text"
          placeholder="输入标签按回车添加"
          v-model="newTag"
          @confirm="addTag"
        />
      </view>
    </view>
    
    <view class="form-actions">
      <button class="cancel-btn" @click="navigateBack">取消</button>
      <button class="submit-btn" @click="handleSubmit">创建任务</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { createTask } from '@/api/admin'

// 任务类型选项
const taskTypes = ['微博转发', 'B站观看', '淘宝购买', '其他']
const typeValues = ['weibo', 'bilibili', 'taobao', 'other']
const typeMap = {
  weibo: '微博转发',
  bilibili: 'B站观看',
  taobao: '淘宝购买',
  other: '其他'
}
const typeIndex = ref(0)

// 表单数据
const taskForm = reactive({
  title: '',
  description: '',
  type: 'weibo',
  deadline: '',
  points: '',
  isFocus: false,
  requirements: [],
  tags: []
})

// 新标签输入
const newTag = ref('')

// 处理任务类型选择
const handleTypeChange = (e) => {
  typeIndex.value = e.detail.value
  taskForm.type = typeValues[typeIndex.value]
}

// 处理截止日期选择
const handleDateChange = (e) => {
  taskForm.deadline = e.detail.value
}

// 处理焦点任务切换
const handleSwitchChange = (e) => {
  taskForm.isFocus = e.detail.value
}

// 添加任务要求
const addRequirement = () => {
  taskForm.requirements.push('')
}

// 移除任务要求
const removeRequirement = (index) => {
  taskForm.requirements.splice(index, 1)
}

// 添加标签
const addTag = () => {
  if (newTag.value.trim()) {
    taskForm.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

// 移除标签
const removeTag = (index) => {
  taskForm.tags.splice(index, 1)
}

// 表单验证
const validateForm = () => {
  if (!taskForm.title.trim()) {
    uni.showToast({
      title: '请输入任务标题',
      icon: 'none'
    })
    return false
  }
  
  if (!taskForm.description.trim()) {
    uni.showToast({
      title: '请输入任务描述',
      icon: 'none'
    })
    return false
  }
  
  if (!taskForm.type) {
    uni.showToast({
      title: '请选择任务类型',
      icon: 'none'
    })
    return false
  }
  
  if (!taskForm.deadline) {
    uni.showToast({
      title: '请选择截止日期',
      icon: 'none'
    })
    return false
  }
  
  if (!taskForm.points) {
    uni.showToast({
      title: '请输入积分奖励',
      icon: 'none'
    })
    return false
  }
  
  return true
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return
  
  try {
    await createTask(taskForm)
    uni.showToast({
      title: '创建成功',
      icon: 'success'
    })
    
    // 延迟返回列表页
    setTimeout(() => {
      navigateBack()
    }, 1500)
  } catch (error) {
    console.error('创建任务失败', error)
    uni.showToast({
      title: '创建失败，请重试',
      icon: 'none'
    })
  }
}

// 返回上一页
const navigateBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.task-form-container {
  padding: 30rpx;
}

.form-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
  text-align: center;
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.required {
  color: #f56c6c;
}

.form-input, .form-textarea, .form-picker {
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.form-textarea {
  height: 200rpx;
}

.picker-value {
  height: 70rpx;
  line-height: 70rpx;
  color: #333;
}

// 任务要求样式
.requirements-list {
  margin-top: 20rpx;
}

.requirement-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.requirement-input {
  flex: 1;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 26rpx;
}

.remove-btn {
  width: 60rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  color: #999;
  font-size: 40rpx;
}

.add-requirement {
  display: flex;
  align-items: center;
  color: #3b7ff3;
  font-size: 26rpx;
  margin-top: 16rpx;
}

.add-icon {
  margin-right: 10rpx;
}

// 标签输入样式
.tags-input {
  display: flex;
  flex-wrap: wrap;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx;
  min-height: 70rpx;
}

.tag-item {
  background-color: #e6f7ff;
  color: #1890ff;
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 30rpx;
  margin-right: 16rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
}

.remove-tag {
  margin-left: 10rpx;
  font-size: 28rpx;
}

.tag-input {
  flex: 1;
  min-width: 200rpx;
  height: 60rpx;
  font-size: 26rpx;
  background-color: transparent;
}

// 表单操作按钮
.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 60rpx;
}

.cancel-btn, .submit-btn {
  width: 48%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.submit-btn {
  background-color: #3b7ff3;
  color: #fff;
}
</style> 
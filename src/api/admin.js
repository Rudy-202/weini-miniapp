import { request } from './request'

// 获取管理员仪表盘统计数据
export const getDashboardStats = () => {
  return request({
    url: '/admin/dashboard/stats',
    method: 'GET'
  })
}

// 获取待审核的提交列表
export const getPendingSubmissions = (params) => {
  return request({
    url: '/admin/submissions/pending',
    method: 'GET',
    data: params
  })
}

// 获取所有任务列表
export const getTasks = (params) => {
  return request({
    url: '/admin/tasks',
    method: 'GET',
    data: params
  })
}

// 获取任务详情
export const getTaskDetail = (id) => {
  return request({
    url: `/admin/tasks/${id}`,
    method: 'GET'
  })
}

// 创建任务
export const createTask = (data) => {
  return request({
    url: '/admin/tasks',
    method: 'POST',
    data
  })
}

// 更新任务
export const updateTask = (id, data) => {
  return request({
    url: `/admin/tasks/${id}`,
    method: 'PUT',
    data
  })
}

// 删除任务
export const deleteTask = (id) => {
  return request({
    url: `/admin/tasks/${id}`,
    method: 'DELETE'
  })
}

// 获取邀请码列表
export const getInviteCodes = (params) => {
  return request({
    url: '/admin/invite-codes',
    method: 'GET',
    data: params
  })
}

// 创建邀请码
export const createInviteCode = (data) => {
  return request({
    url: '/admin/invite-codes',
    method: 'POST',
    data
  })
}

// 禁用邀请码
export const disableInviteCode = (id) => {
  return request({
    url: `/admin/invite-codes/${id}/disable`,
    method: 'PUT'
  })
}

// 审核提交
export const reviewSubmission = (id, data) => {
  return request({
    url: `/admin/submissions/${id}/review`,
    method: 'PUT',
    data
  })
}

// 批量审核提交
export const batchReviewSubmissions = (data) => {
  return request({
    url: '/admin/submissions/batch-review',
    method: 'PUT',
    data
  })
}

// 获取提交详情
export const getSubmissionDetail = (id) => {
  return request({
    url: `/admin/submissions/${id}`,
    method: 'GET'
  })
} 
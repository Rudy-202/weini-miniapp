import { request } from './request';

// 获取仪表盘数据
export const getDashboardData = () => {
  return request<any>({
    url: '/admin/dashboard',
    method: 'GET'
  });
};

// 创建任务
export const createTask = (data: { 
  title: string; 
  description: string; 
  points: number; 
  startTime: string; 
  endTime: string;
  images?: string[];
  tags?: string[];
}) => {
  return request<{id: string}>({
    url: '/admin/tasks',
    method: 'POST',
    data
  });
};

// 更新任务
export const updateTask = (id: string, data: {
  title?: string;
  description?: string;
  points?: number;
  startTime?: string;
  endTime?: string;
  status?: string;
  images?: string[];
  tags?: string[];
}) => {
  return request<{success: boolean}>({
    url: `/admin/tasks/${id}`,
    method: 'PUT',
    data
  });
};

// 删除任务
export const deleteTask = (id: string) => {
  return request<{success: boolean}>({
    url: `/admin/tasks/${id}`,
    method: 'DELETE'
  });
};

// 获取邀请码列表
export const getInviteCodes = (params: { page: number; pageSize: number; status?: string }) => {
  return request<{items: any[]; total: number}>({
    url: '/admin/invite-codes',
    method: 'GET',
    data: params
  });
};

// 创建邀请码
export const createInviteCode = (count: number) => {
  return request<{codes: string[]}>({
    url: '/admin/invite-codes',
    method: 'POST',
    data: { count }
  });
};

// 禁用邀请码
export const disableInviteCode = (code: string) => {
  return request<{success: boolean}>({
    url: `/admin/invite-codes/${code}/disable`,
    method: 'PUT'
  });
};

// 获取待审核任务列表
export const getPendingSubmissions = (params: { page: number; pageSize: number }) => {
  return request<{items: any[]; total: number}>({
    url: '/admin/task-submissions/pending',
    method: 'GET',
    data: params
  });
};

// 审核任务
export const reviewSubmission = (id: string, data: { status: 'approved' | 'rejected'; comment?: string }) => {
  return request<{success: boolean}>({
    url: `/admin/task-submissions/${id}/review`,
    method: 'PUT',
    data
  });
}; 
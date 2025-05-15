import { request } from './request';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  points: number;
  status: string;
  startTime: string;
  endTime: string;
  images: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskListResponse {
  items: TaskItem[];
  total: number;
  page: number;
  pageSize: number;
}

// 获取任务列表
export const getTasks = (params: { page: number; pageSize: number; status?: string; keyword?: string }) => {
  return request<TaskListResponse>({
    url: '/tasks',
    method: 'GET',
    data: params
  });
};

// 获取任务详情
export const getTaskDetail = (id: string) => {
  return request<TaskItem>({
    url: `/tasks/${id}`,
    method: 'GET'
  });
};

// 提交任务
export const submitTask = (data: { taskId: string; content: string; images: string[] }) => {
  return request<{ id: string; createdAt: string }>({
    url: '/task-submissions',
    method: 'POST',
    data
  });
};

// 获取排行榜
export const getRankings = (type: string = 'weekly') => {
  return request<{ rankings: any[] }>({
    url: '/rankings',
    method: 'GET',
    data: { type }
  });
}; 
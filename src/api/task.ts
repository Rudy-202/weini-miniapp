import { request } from './request';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  points: number;
  status: string;
  // startTime: string; // 暂时注释或改为可选，因为API响应中没有
  // endTime: string;   // 暂时注释或改为可选
  due_date?: string; // 根据API响应添加
  is_focus_task?: boolean; // 根据API响应添加 (虽然详情页目前没用，但保持一致性)
  // 以下字段是TaskItem原有，但API响应的data顶层未直接显示，可能在更深层或特定场景下才返回
  // 需要确认这些字段是否对详情页逻辑是必需的，如果不是，可以暂时作为可选或移除
  startTime?: string; // 保留为可选，以防其他地方用到或未来API会提供
  endTime?: string;   // 保留为可选
  images?: string[]; // API响应的data中没有直接显示，但TaskItem定义中有，且模板在用
  tags?: string[];   // API响应的data中没有直接显示，但TaskItem定义中有，且模板在用
  createdAt?: string; // API响应的data中没有直接显示
  updatedAt?: string; // API响应的data中没有直接显示
  // 根据API响应中有的字段，补充到TaskItem中，如果它们是TaskItem应该包含的
  invite_code_id?: string;
  station_id?: string;
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
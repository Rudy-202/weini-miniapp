import { defineStore } from 'pinia';
import { getTasks, getTaskDetail } from '../api/task';
import type { TaskItem } from '../api/task';

export interface Task extends TaskItem {}

export interface TaskState {
  taskList: Task[];
  currentTask: Task | null;
  totalCount: number;
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
}

export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    taskList: [],
    currentTask: null,
    totalCount: 0,
    isLoading: false,
    currentPage: 1,
    pageSize: 10
  }),

  actions: {
    async fetchTasks(params: { page?: number; pageSize?: number; status?: string; keyword?: string } = {}) {
      try {
        this.isLoading = true;
        const page = params.page || this.currentPage;
        const pageSize = params.pageSize || this.pageSize;
        
        const res = await getTasks({
          page,
          pageSize,
          status: params.status,
          keyword: params.keyword
        });
        
        this.taskList = res.data.items;
        this.totalCount = res.data.total;
        this.currentPage = page;
        this.pageSize = pageSize;
        
        return res.data;
      } catch (error) {
        uni.showToast({
          title: '获取任务列表失败',
          icon: 'none'
        });
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchTaskDetail(id: string) {
      try {
        this.isLoading = true;
        const res = await getTaskDetail(id);
        this.currentTask = res.data;
        return res.data;
      } catch (error) {
        uni.showToast({
          title: '获取任务详情失败',
          icon: 'none'
        });
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    clearCurrentTask() {
      this.currentTask = null;
    }
  }
}); 
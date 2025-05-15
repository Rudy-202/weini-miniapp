import { defineStore } from 'pinia';
import { getUserInfo } from '../api/user';

export interface UserInfo {
  id: string;
  nickname: string;
  avatar: string;
  role: 'admin' | 'user';
  points: number;
  createdAt: string;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: uni.getStorageSync('token') || '',
    userInfo: uni.getStorageSync('userInfo') ? JSON.parse(uni.getStorageSync('userInfo')) : null as UserInfo | null,
    isLoggedIn: !!uni.getStorageSync('token'),
    isCheckingAuth: false,
    lastAuthCheck: uni.getStorageSync('lastAuthCheck') ? parseInt(uni.getStorageSync('lastAuthCheck')) : 0
  }),
  
  getters: {
    isAdmin: (state) => state.userInfo?.role === 'admin',
    userId: (state) => state.userInfo?.id,
    // 检查登录状态是否需要刷新（超过3小时）
    needRefreshAuth(): boolean {
      const now = Date.now();
      const threeHoursInMs = 3 * 60 * 60 * 1000;
      return now - this.lastAuthCheck > threeHoursInMs;
    }
  },
  
  actions: {
    setToken(token: string) {
      this.token = token;
      this.isLoggedIn = true;
      uni.setStorageSync('token', token);
      this.updateLastAuthCheck();
    },
    
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo;
      uni.setStorageSync('userInfo', JSON.stringify(userInfo));
    },
    
    updateLastAuthCheck() {
      const now = Date.now();
      this.lastAuthCheck = now;
      uni.setStorageSync('lastAuthCheck', now.toString());
    },
    
    async fetchUserInfo() {
      try {
        this.isCheckingAuth = true;
        const res = await getUserInfo();
        this.userInfo = res.data;
        uni.setStorageSync('userInfo', JSON.stringify(res.data));
        this.updateLastAuthCheck();
        return res.data;
      } catch (error) {
        this.logout();
        throw error;
      } finally {
        this.isCheckingAuth = false;
      }
    },
    
    async checkAndUpdateAuth() {
      // 如果没有token，不必检查
      if (!this.token) return null;
      
      // 如果不需要刷新，直接返回当前用户信息
      if (!this.needRefreshAuth && this.userInfo) {
        return this.userInfo;
      }
      
      // 需要刷新，获取最新的用户信息
      try {
        return await this.fetchUserInfo();
      } catch (error) {
        console.error('Failed to refresh auth:', error);
        return null;
      }
    },
    
    logout() {
      this.token = '';
      this.userInfo = null;
      this.isLoggedIn = false;
      uni.removeStorageSync('token');
      uni.removeStorageSync('userInfo');
      uni.removeStorageSync('lastAuthCheck');
      uni.reLaunch({
        url: '/pages/index/index'
      });
    }
  }
}); 
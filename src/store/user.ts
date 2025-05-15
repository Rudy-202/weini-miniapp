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
    userInfo: null as UserInfo | null,
    isLoggedIn: !!uni.getStorageSync('token')
  }),
  
  getters: {
    isAdmin: (state) => state.userInfo?.role === 'admin',
    userId: (state) => state.userInfo?.id
  },
  
  actions: {
    setToken(token: string) {
      this.token = token;
      this.isLoggedIn = true;
      uni.setStorageSync('token', token);
    },
    
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo;
    },
    
    async fetchUserInfo() {
      try {
        const res = await getUserInfo();
        this.userInfo = res.data;
        return res.data;
      } catch (error) {
        this.logout();
        throw error;
      }
    },
    
    logout() {
      this.token = '';
      this.userInfo = null;
      this.isLoggedIn = false;
      uni.removeStorageSync('token');
      uni.reLaunch({
        url: '/pages/index/index'
      });
    }
  }
}); 
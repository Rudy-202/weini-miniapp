import { request } from './request';

// 管理员登录
export const adminLogin = (params: { email: string; password: string }) => {
  return request<{token: string; userInfo: any}>({
    url: '/auth/login',
    method: 'POST',
    data: params
  });
};

// 邀请码验证
export const verifyInviteCode = (params: { code: string; nickname: string }) => {
  return request<{token: string; userInfo: any}>({
    url: '/auth/invite-code',
    method: 'POST',
    data: params
  });
};

// 获取用户信息
export const getUserInfo = () => {
  return request<any>({
    url: '/users/me',
    method: 'GET'
  });
}; 
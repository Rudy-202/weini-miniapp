import { request } from './request';
import type { UserInfo } from '../store/user'; // Assuming UserInfo matches the structure of 'user' in the flat response

// Type for the ACTUAL FLAT JSON response from /api/admin/login
type AdminLoginFlatApiResponse = {
  token: string;
  user: UserInfo;
  expires_in: number;
  message: string;
  stations: any[];
};

// Type for the payload expected by the UI within its 'data' field
type AdminLoginUiPayload = {
  token: string;
  userInfo: UserInfo;
};

// Type for the wrapped response structure expected by the UI (and by V1 APIs)
type UiWrappedApiResponse<P> = {
  data: P;
  code: number;
  message: string;
};

// 管理员登录
export const adminLogin = async (params: { email: string; password: string }): Promise<UiWrappedApiResponse<AdminLoginUiPayload>> => {
  // request<T> returns a Promise<T>, where T is the actual direct body of the API response.
  // For /api/admin/login, this body is AdminLoginFlatApiResponse.
  const flatApiResponse = await request<AdminLoginFlatApiResponse>({
    url: 'http://localhost:5000/api/admin/login',
    method: 'POST',
    data: params
  });

  // Check if flatApiResponse has the expected token and user properties.
  if (flatApiResponse && typeof flatApiResponse.token === 'string' && flatApiResponse.user) {
    // Wrap it into the structure the UI expects.
    return {
      data: { // This is AdminLoginUiPayload
        token: flatApiResponse.token,
        userInfo: flatApiResponse.user // Map 'user' from flat response to 'userInfo'
      },
      code: 200, // Assuming success if we got a token
      message: flatApiResponse.message || '登录成功'
    };
  } else {
    console.error('Admin login API (/api/admin/login) response was not in the expected flat format {token, user, ...}:', flatApiResponse);
    throw new Error('管理员登录失败：服务器返回数据格式不正确或Token/用户信息缺失。');
  }
};

// 邀请码验证
export const verifyInviteCode = (params: { code: string; nickname: string }) => {
  type FanLoginUiPayload = { token: string; userInfo: UserInfo };
  return request<UiWrappedApiResponse<FanLoginUiPayload>>({
    url: '/auth/invite-code',
    method: 'POST',
    data: params
  });
};

// 获取用户信息
export const getUserInfo = () => {
  return request<UiWrappedApiResponse<UserInfo>>({
    url: '/users/me',
    method: 'GET'
  });
}; 
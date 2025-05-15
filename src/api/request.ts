interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
}

interface ResponseData<T = any> {
  data: T;
  code: number;
  message: string;
}

const ENV = {
  development: {
    baseURL: 'https://dev-api.weini-system.com/v1'
  },
  production: {
    baseURL: 'https://api.weini-system.com/v1'
  }
}

// 获取当前环境
const currentEnv = (process.env.NODE_ENV as 'development' | 'production') || 'development';
const baseURL = ENV[currentEnv].baseURL;

export const request = <T = any>(options: RequestOptions): Promise<ResponseData<T>> => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');
    uni.request({
      url: baseURL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res: any) => {
        if (res.statusCode === 401) {
          uni.removeStorageSync('token');
          uni.navigateTo({
            url: '/pages/login/index'
          });
          reject(new Error('未授权，请重新登录'));
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(res.data.message || '请求失败'));
          return;
        }
        resolve(res.data);
      },
      fail: (err: any) => {
        reject(err);
      }
    });
  });
}; 
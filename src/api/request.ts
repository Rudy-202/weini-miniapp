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
    baseURL: 'http://localhost:5000/v1'
  },
  production: {
    baseURL: 'http://localhost:5000/v1'
  }
}

// 获取当前环境
const currentEnv = (process.env.NODE_ENV as 'development' | 'production') || 'development';
const baseURL = ENV[currentEnv].baseURL;

export const request = <T = any>(options: RequestOptions): Promise<ResponseData<T>> => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');
    let requestUrl = options.url;
    // 如果 options.url 不是以 http:// 或 https:// 开头，则拼接 baseURL
    if (!(options.url.startsWith('http://') || options.url.startsWith('https://'))) {
      requestUrl = baseURL + options.url;
    }
    uni.request({
      url: requestUrl, // 使用处理过的 requestUrl
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
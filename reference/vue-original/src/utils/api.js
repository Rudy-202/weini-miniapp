import axios from 'axios';

// 从环境变量读取 API_BASE_URL，如果未设置，则默认为本地开发地址
// 确保在 .env 文件中定义 VITE_API_BASE_URL=http://192.168.1.167:5000 (开发时)
// 或 VITE_API_BASE_URL=https://your-production-api.com (生产时)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.167:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 增加超时时间到 15 秒
  withCredentials: true, // 允许跨域请求携带凭证
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 请求拦截器：统一添加 token
apiClient.interceptors.request.use(
  config => {
    console.log('发送请求:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      withCredentials: config.withCredentials,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization ? 'Bearer ****' : undefined
      }
    });

    // 登录和注册请求不需要添加 token
    if (config.url === '/api/admin/login' || config.url === '/api/admin/register') {
      return config;
    }

    // 尝试从 localStorage 获取 admin_token
    const adminToken = localStorage.getItem('admin_token');
    const isAdmin = localStorage.getItem('isAdmin');
    const expiresAt = localStorage.getItem('token_expires_at');

    console.log('请求认证状态:', {
      hasToken: !!adminToken,
      isAdmin,
      expiresAt: expiresAt ? new Date(parseInt(expiresAt)).toISOString() : null,
      url: config.url
    });

    // 检查 token 是否过期
    if (expiresAt && Date.now() > parseInt(expiresAt)) {
      console.warn('Token 已过期，清除认证信息');
      // 清除认证信息
      localStorage.removeItem('admin_token');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('token_expires_at');
      return Promise.reject({
        response: {
          status: 401,
          data: { error: 'Token 已过期，请重新登录' }
        }
      });
    }

    if (!adminToken && config.url.includes('/admin/')) {
      console.warn('未找到管理员令牌，请重新登录');
      return Promise.reject({
        response: {
          status: 401,
          data: { error: '未登录或会话已过期，请重新登录' }
        }
      });
    }

    if (adminToken) {
      // 确保 Authorization header 格式正确
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  error => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理错误
apiClient.interceptors.response.use(
  response => {
    console.log('收到响应:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      data: response.data ? '有数据' : '无数据'
    });

    return response;
  },
  error => {
    console.error('API 响应错误:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.error || error.message,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      // 清除认证信息
      localStorage.removeItem('admin_token');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('token_expires_at');

      // 如果不是登录请求，则返回登录页
      if (error.config.url !== '/api/admin/login') {
        window.location.href = '/admin/login';
      }
    }

    return Promise.reject(error);
  }
);

// 检查 token 是否过期
const checkTokenExpiration = () => {
  const expiresAt = localStorage.getItem('token_expires_at');
  if (expiresAt && Date.now() > parseInt(expiresAt)) {
    console.warn('Token 已过期，清除登录状态');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('token_expires_at');
    window.location.href = '/admin/login';
  }
};

// 定期检查 token 是否过期
setInterval(checkTokenExpiration, 60000); // 每分钟检查一次

export default apiClient;

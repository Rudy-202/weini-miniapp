import axios from 'axios';

// API基础URL
const BASE_URL = 'http://localhost:5000';

// 创建axios实例
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 如果有token，添加到请求头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理401错误（未授权）
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 登录API
export const login = async (email, password) => {
  try {
    const response = await api.post('/api/admin/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { error: '网络错误' };
  }
};

// 发送验证码
export const sendVerificationCode = async (email) => {
  try {
    const response = await api.post('/api/admin/send-verification-code', { email });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { error: '发送验证码失败' };
  }
};

// 验证验证码
export const verifyCode = async (email, code) => {
  try {
    const response = await api.post('/api/admin/verify-code', { email, code });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { error: '验证码验证失败' };
  }
};

// 注册API
export const register = async (email, password, username, code) => {
  try {
    const response = await api.post('/api/admin/register', { email, password, username, code });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { error: '网络错误' };
  }
};

// 获取当前用户信息
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/admin/me');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { error: '网络错误' };
  }
};

// 获取任务列表
export const getTasks = async (stationId, status = 'active') => {
  try {
    const params = { status };
    if (stationId) {
      params.station_id = stationId;
    }
    console.log('请求任务列表，参数:', params);
    console.log('请求任务列表，完整URL:', '/api/station/tasks', params);
    console.log('请求任务列表，Authorization头:', localStorage.getItem('token') ? '已设置' : '未设置');

    const response = await api.get('/api/station/tasks', { params });
    console.log('任务列表响应状态:', response.status);
    console.log('任务列表响应头:', response.headers);
    console.log('任务列表响应数据:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取任务列表失败:', error);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求已发送但未收到响应:', error.request);
    } else {
      console.error('请求配置错误:', error.message);
    }
    throw error.response ? error.response.data : { error: '获取任务列表失败' };
  }
};

// 获取任务详情
export const getTaskDetail = async (taskId) => {
  try {
    console.log(`开始获取任务详情，ID: ${taskId}`);
    const response = await api.get(`/api/station/tasks/${taskId}`);
    console.log('任务详情响应状态:', response.status);
    console.log('任务详情响应数据:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取任务详情失败:', error);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求已发送但未收到响应:', error.request);
    } else {
      console.error('请求配置错误:', error.message);
    }
    throw error.response ? error.response.data : { error: '获取任务详情失败' };
  }
};

// 创建任务
export const createTask = async (taskData) => {
  try {
    console.log('创建任务请求数据:', taskData);
    const response = await api.post('/api/station/tasks', taskData);
    console.log('创建任务响应:', response.data);
    return response.data;
  } catch (error) {
    console.error('创建任务失败:', error);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误响应数据:', error.response.data);
    }
    throw error.response ? error.response.data : { error: '创建任务失败' };
  }
};

// 更新任务
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await api.put(`/api/station/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { error: '更新任务失败' };
  }
};

// 获取邀请码列表
export const getInviteCodes = async (stationId) => {
  try {
    const params = {};
    if (stationId) {
      params.station_id = stationId;
    }

    console.log('请求邀请码列表，参数:', params);

    const response = await api.get('/api/station/invite-codes', { params });

    console.log('邀请码列表响应:', response.data);

    if (!response.data || !Array.isArray(response.data)) {
      console.error('邀请码列表格式不正确:', response.data);
      throw { error: '服务器返回数据格式不正确' };
    }

    return response.data;
  } catch (error) {
    console.error('获取邀请码列表失败:', error);

    if (error.response) {
      console.error('响应状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
      throw error.response.data;
    } else if (error.request) {
      console.error('未收到响应:', error.request);
      throw { error: '服务器未响应，请检查网络连接' };
    } else {
      console.error('请求错误:', error.message);
      throw { error: `请求错误: ${error.message}` };
    }
  }
};

// 获取邀请码详情
export const getInviteCodeDetail = async (inviteCodeId) => {
  try {
    const response = await api.get(`/api/station/invite-codes/${inviteCodeId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { error: '获取邀请码详情失败' };
  }
};

// 创建邀请码
export const createInviteCode = async (inviteCodeData) => {
  try {
    // 检查数据完整性
    if (!inviteCodeData.station_id) {
      console.error('缺少必要的站点ID');
      throw { error: '缺少必要的站点ID' };
    }

    console.log('发送创建邀请码请求:', {
      url: `${BASE_URL}/api/station/invite-codes`,
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      data: inviteCodeData
    });

    const response = await api.post('/api/station/invite-codes', inviteCodeData);
    console.log('创建邀请码响应:', response);
    return response.data;
  } catch (error) {
    console.error('创建邀请码API错误:', error);

    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误响应数据:', error.response.data);
      throw error.response.data;
    } else if (error.request) {
      console.error('请求发送但无响应:', error.request);
      throw { error: '服务器无响应' };
    } else {
      console.error('请求配置错误:', error.message);
      throw { error: `请求错误: ${error.message}` };
    }
  }
};

// 更新邀请码
export const updateInviteCode = async (inviteCodeId, inviteCodeData) => {
  try {
    const response = await api.put(`/api/station/invite-codes/${inviteCodeId}`, inviteCodeData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { error: '更新邀请码失败' };
  }
};

// 获取站点列表
export const getStations = async () => {
  try {
    const response = await api.get('/api/station/stations');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { error: '获取站点列表失败' };
  }
};

// 获取站点详情
export const getStationDetail = async (stationId) => {
  try {
    const response = await api.get(`/api/station/stations/${stationId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { error: '获取站点详情失败' };
  }
};

// 更新站点信息
export const updateStation = async (stationId, stationData) => {
  try {
    const response = await api.put(`/api/station/stations/${stationId}`, stationData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { error: '更新站点信息失败' };
  }
};

// 创建新站点
export const createStation = async (stationData) => {
  try {
    const response = await api.post('/api/station/stations', stationData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { error: '创建站点失败' };
  }
};

// 检查邀请码的焦点任务状态
export const checkInviteCodeFocusTaskStatus = async (inviteCode) => {
  try {
    console.log('检查邀请码焦点任务状态:', inviteCode);
    const response = await api.get(`/api/station/invite-codes/${inviteCode}/focus-status`);
    console.log('焦点任务状态响应:', response.data);
    return response.data;
  } catch (error) {
    console.error('检查焦点任务状态失败:', error);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误响应数据:', error.response.data);
    }
    throw error.response ? error.response.data : { error: '检查焦点任务状态失败' };
  }
};

// 获取已完成任务列表
export const getCompletedTasks = async (stationId) => {
  try {
    const params = {};
    if (stationId) {
      params.station_id = stationId;
    }

    console.log('请求已完成任务列表，参数:', params);
    const response = await api.get('/api/station/tasks', {
      params: { ...params, status: 'completed' }
    });

    console.log('已完成任务列表响应数据:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取已完成任务列表失败:', error);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误响应数据:', error.response.data);
    }
    throw error.response ? error.response.data : { error: '获取已完成任务列表失败' };
  }
};

// 获取任务提交记录
export const getTaskSubmissions = async (taskId) => {
  try {
    console.log(`开始获取任务提交记录，任务ID: ${taskId}`);
    const response = await api.get(`/api/station/tasks/${taskId}/submissions`);
    console.log('任务提交记录响应数据:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取任务提交记录失败:', error);
    throw error.response ? error.response.data : { error: '获取任务提交记录失败' };
  }
};

// 结算任务
export const settleTask = async (taskId) => {
  try {
    console.log(`开始结算任务，任务ID: ${taskId}`);
    const response = await api.post(`/api/station/tasks/${taskId}/settle`);
    console.log('结算任务响应数据:', response.data);
    return response.data;
  } catch (error) {
    console.error('结算任务失败:', error);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误响应数据:', error.response.data);
    }
    throw error.response ? error.response.data : { error: '结算任务失败' };
  }
};

// 导出API实例
export default api;

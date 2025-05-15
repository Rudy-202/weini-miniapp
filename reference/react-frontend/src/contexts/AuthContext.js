import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, getCurrentUser } from '../api/auth';

// 创建认证上下文
const AuthContext = createContext();

// 认证上下文提供者组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // 手动刷新用户数据
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();
      console.log('手动刷新：获取到的用户数据:', userData);
      setUser(userData.user);
      setStations(userData.stations || []);

      // 保存默认站点到localStorage，以便在其他页面使用
      if (userData.stations && userData.stations.length > 0) {
        const defaultStation = userData.stations[0];
        console.log('刷新用户数据时设置默认站点:', defaultStation.name);
        localStorage.setItem('selectedStationId', defaultStation.id);
        localStorage.setItem('selectedStationName', defaultStation.name);
      }

      return userData;
    } catch (err) {
      console.error('刷新用户信息失败', err);
      setError(err.error || '获取用户信息失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 初始化 - 检查是否有保存的token，如果有则获取用户信息
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await getCurrentUser();
          console.log('获取到的用户数据:', userData);
          setUser(userData.user);
          setStations(userData.stations || []);

          // 保存默认站点到localStorage，以便在其他页面使用
          if (userData.stations && userData.stations.length > 0) {
            const defaultStation = userData.stations[0];
            console.log('设置默认站点:', defaultStation.name);
            localStorage.setItem('selectedStationId', defaultStation.id);
            localStorage.setItem('selectedStationName', defaultStation.name);
          }
        } catch (err) {
          console.error('获取用户信息失败', err);
          localStorage.removeItem('token');
          setToken(null);
          setError(err.error || '获取用户信息失败');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // 登录
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiLogin(email, password);
      console.log('登录响应:', response);
      const newToken = response.token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(response.user);
      setStations(response.stations || []);

      // 登录成功后设置默认站点
      if (response.stations && response.stations.length > 0) {
        const defaultStation = response.stations[0];
        console.log('登录成功，设置默认站点:', defaultStation.name);
        localStorage.setItem('selectedStationId', defaultStation.id);
        localStorage.setItem('selectedStationName', defaultStation.name);
      }

      return response;
    } catch (err) {
      console.error('登录失败:', err);
      setError(err.error || '登录失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('selectedStationId');
    localStorage.removeItem('selectedStationName');
    setToken(null);
    setUser(null);
    setStations([]);
  };

  // 上下文值
  const value = {
    user,
    stations,
    loading,
    error,
    login,
    logout,
    fetchUserData,
    isAuthenticated: !!user,
    token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定义hook，用于在组件中访问认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};

export default AuthContext;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spin } from 'antd';

// 私有路由组件，用于保护需要身份验证的路由
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="正在加载..." />
      </div>
    );
  }

  // 如果未登录，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 已登录，显示内容
  return children;
};

export default PrivateRoute;

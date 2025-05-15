import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import {
  FileOutlined,
  KeyOutlined,
  HeartFilled,
  LogoutOutlined,
  HistoryOutlined,
  FolderOutlined,
  CommentOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Sider } = Layout;
const { Title } = Typography;

const SideMenu = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // 处理菜单点击事件
  const handleMenuClick = (e) => {
    if (e.key === 'logout') {
      logout();
      navigate('/login');
    } else {
      navigate(e.key);
    }
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      theme="light"
    >
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Title level={collapsed ? 5 : 4} style={{ margin: 0, padding: collapsed ? '0 8px' : '0 16px' }}>
          {collapsed ? '未你' : '未你平台'}
        </Title>
      </div>
      <Menu
        theme="light"
        mode="inline"
        defaultSelectedKeys={[location.pathname]}
        selectedKeys={[location.pathname]}
        style={{ height: '100%', borderRight: 0 }}
        onClick={handleMenuClick}
      >
        <Menu.Item key="/tasks" icon={<FileOutlined />}>
          任务管理
        </Menu.Item>
        <Menu.Item key="/task-history" icon={<HistoryOutlined />}>
          历史任务
        </Menu.Item>
        <Menu.Item key="/invite-codes" icon={<KeyOutlined />}>
          邀请码管理
        </Menu.Item>
        <Menu.Item key="/encouragement-settings" icon={<HeartFilled />}>
          鼓励内容设置
        </Menu.Item>
        <Menu.Item key="/admin/daily-reports" icon={<FolderOutlined />}>
          日报管理
        </Menu.Item>
        <Menu.Item key="/feedback" icon={<CommentOutlined />}>
          意见反馈
        </Menu.Item>
        <Menu.Item key="logout" icon={<LogoutOutlined />} style={{ marginTop: 20 }}>
          退出登录
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default SideMenu;

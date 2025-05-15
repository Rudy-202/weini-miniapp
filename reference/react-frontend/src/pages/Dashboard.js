import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Card, Row, Col, Statistic, Button, Spin, Empty } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  PlusOutlined,
  DownOutlined,
  LinkOutlined,
  HeartOutlined,
  FileOutlined,
  KeyOutlined,
  AppstoreOutlined,
  FolderOutlined,
  HeartFilled,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import SideMenu from '../components/SideMenu';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);

  // 如果未登录，重定向到登录页
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user && user.stations && user.stations.length > 0) {
      setStations(user.stations);
      setSelectedStation(user.stations[0]);
    }
  }, [isAuthenticated, navigate, user]);

  // 处理退出登录
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 用户菜单
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        个人设置
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  // 站点选择菜单
  const stationMenu = stations.length > 0 ? (
    <Menu>
      {stations.map(station => (
        <Menu.Item key={station.id} onClick={() => setSelectedStation(station)}>
          {station.name}
        </Menu.Item>
      ))}
      <Menu.Divider />
      <Menu.Item key="add" icon={<PlusOutlined />}>
        新增站点
      </Menu.Item>
    </Menu>
  ) : null;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SideMenu collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {stationMenu && (
            <Dropdown overlay={stationMenu} trigger={['click']}>
              <Button>
                <Space>
                  {selectedStation ? selectedStation.name : '选择站点'}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          )}
          <Dropdown overlay={userMenu} trigger={['click']}>
            <div style={{ cursor: 'pointer' }}>
              <Space>
                <Avatar icon={<UserOutlined />} />
                <span>{user ? user.username : '用户'}</span>
              </Space>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '16px' }}>
          <Spin spinning={loading}>
            <Card title="仪表盘概览" bordered={false}>
              <Row gutter={16}>
                <Col span={8}>
                  <Card>
                    <Statistic title="站点数量" value={stations.length} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic title="活跃任务" value={0} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic title="参与粉丝" value={0} />
                  </Card>
                </Col>
              </Row>
              <div style={{ marginTop: 24 }}>
                <Card title="当前站点信息" style={{ marginBottom: 16 }}>
                  {selectedStation ? (
                    <div>
                      <p><Text strong>站点名称:</Text> {selectedStation.name}</p>
                      <p><Text strong>创建时间:</Text> {new Date(selectedStation.created_at).toLocaleString()}</p>
                      <p><Text strong>站点状态:</Text> {selectedStation.status}</p>
                    </div>
                  ) : (
                    <Empty description="暂无站点信息" />
                  )}
                </Card>
              </div>
            </Card>
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;

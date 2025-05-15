import React, { useState, useEffect } from 'react';
import {
  Layout, Menu, Typography, Table, Card, Button, Space,
  Dropdown, Tag, Tooltip, Modal, message, Select, Divider
} from 'antd';
import {
  DashboardOutlined, TeamOutlined, SettingOutlined, PlusOutlined,
  EditOutlined, DeleteOutlined, FireOutlined, ClockCircleOutlined,
  RocketOutlined, DownOutlined, LinkOutlined, ReloadOutlined,
  EyeOutlined, FileTextOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTasks, settleTask } from '../api/auth';
import SideMenu from '../components/SideMenu';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const Tasks = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, fetchUserData } = useAuth();

  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedStation, setSelectedStation] = useState(() => {
    // 尝试从localStorage获取初始站点
    const savedStationId = localStorage.getItem('selectedStationId');
    const savedStationName = localStorage.getItem('selectedStationName');

    if (savedStationId && savedStationName) {
      console.log('组件初始化时从localStorage获取站点:', savedStationName);
      return { id: savedStationId, name: savedStationName };
    }
    return null;
  });
  const [collapsed, setCollapsed] = useState(false);

  // 手动刷新任务列表
  const refreshTasks = async () => {
    if (selectedStation) {
      await loadTasks(selectedStation.id);
      message.success('任务列表已刷新');
    } else if (user && user.stations && user.stations.length > 0) {
      // 如果没有选择站点但用户有站点，自动使用第一个站点
      const defaultStation = user.stations[0];
      setSelectedStation(defaultStation);
      await loadTasks(defaultStation.id);
      message.success('任务列表已刷新');
    } else {
      message.warning('请先选择站点');
    }
  };

  // 加载任务数据
  useEffect(() => {
    console.log('Tasks组件初始化 - localStorage检查:');
    console.log('localStorage中的selectedStationId:', localStorage.getItem('selectedStationId'));
    console.log('localStorage中的selectedStationName:', localStorage.getItem('selectedStationName'));

    if (user) {
      console.log('用户数据:', user);
      console.log('用户站点数据:', user.stations);
    } else {
      console.log('用户数据未加载');
    }

    if (user && user.stations && user.stations.length > 0) {
      // 检查是否有从TaskForm传递过来的刷新参数
      const shouldRefresh = location.state?.refresh;
      const stationIdFromState = location.state?.stationId;

      console.log('Tasks组件初始化 - 用户:', user.username);
      console.log('是否需要刷新:', shouldRefresh);
      console.log('来自state的站点ID:', stationIdFromState);

      let stationToLoad;

      // 如果有指定的站点ID，则使用它
      if (stationIdFromState) {
        stationToLoad = user.stations.find(s => s.id === stationIdFromState);
        if (stationToLoad) {
          console.log('使用指定站点:', stationToLoad.name);
          setSelectedStation(stationToLoad);
        }
      }

      // 如果没有从state获取到站点，尝试从localStorage获取
      if (!stationToLoad) {
        const savedStationId = localStorage.getItem('selectedStationId');
        if (savedStationId) {
          stationToLoad = user.stations.find(s => s.id === savedStationId);
          if (stationToLoad) {
            console.log('使用localStorage保存的站点:', stationToLoad.name);
            setSelectedStation(stationToLoad);
          } else {
            console.log('localStorage中的站点ID不匹配任何可用站点');
          }
        } else {
          console.log('localStorage中没有保存站点ID');
        }
      }

      // 如果没有找到指定站点，则使用默认站点
      if (!stationToLoad) {
        stationToLoad = user.stations[0];
        console.log('使用默认站点:', stationToLoad.name);
        setSelectedStation(stationToLoad);
      }

      // 更新localStorage中的站点
      localStorage.setItem('selectedStationId', stationToLoad.id);
      localStorage.setItem('selectedStationName', stationToLoad.name);
      console.log('已更新localStorage:', stationToLoad.id, stationToLoad.name);

      // 加载任务
      loadTasks(stationToLoad.id);

      // 清除location.state，避免重复刷新
      if (shouldRefresh) {
        window.history.replaceState({}, document.title);
      }
    } else {
      console.log('用户没有可用站点或用户数据未加载完成');
    }
  }, [user]);

  // 处理从TaskForm返回时的刷新
  useEffect(() => {
    // 检查是否有从TaskForm传递过来的刷新参数
    const shouldRefresh = location.state?.refresh;
    const stationIdFromState = location.state?.stationId;
    const timestamp = location.state?.timestamp;

    console.log('Tasks组件检测state变化:', {
      shouldRefresh,
      stationIdFromState,
      timestamp,
      currentTimestamp: new Date().getTime()
    });

    if (shouldRefresh && user && user.stations) {
      console.log('检测到需要刷新任务列表');

      // 如果有指定的站点ID，则使用它
      if (stationIdFromState) {
        const stationToLoad = user.stations.find(s => s.id === stationIdFromState);
        if (stationToLoad) {
          console.log('使用指定站点刷新:', stationToLoad.name);
          setSelectedStation(stationToLoad);

          // 更新localStorage
          localStorage.setItem('selectedStationId', stationToLoad.id);
          localStorage.setItem('selectedStationName', stationToLoad.name);

          // 立即加载任务列表
          loadTasks(stationToLoad.id);
          message.success('任务列表已刷新');
        }
      } else if (selectedStation) {
        // 使用当前选中的站点刷新
        console.log('使用当前选中站点刷新:', selectedStation.name);
        loadTasks(selectedStation.id);
        message.success('任务列表已刷新');
      }

      // 清除location.state，避免重复刷新
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.refresh, location.state?.timestamp, user]);

  // 初始加载任务
  useEffect(() => {
    if (selectedStation && selectedStation.id) {
      console.log('检测到初始站点，自动加载任务列表:', selectedStation.name);
      loadTasks(selectedStation.id);
    }
  }, []);

  // 加载任务列表
  const loadTasks = async (stationId) => {
    try {
      if (!stationId) {
        console.error('加载任务失败: 站点ID为空');
        message.error('无法加载任务：站点ID为空');
        return;
      }

      console.log('开始加载站点任务列表，站点ID:', stationId);
      console.log('当前selectedStation状态:', selectedStation);
      setLoading(true);
      const tasksData = await getTasks(stationId);
      console.log('获取到任务列表:', tasksData);
      setTasks(tasksData || []);
    } catch (error) {
      console.error('加载任务失败:', error);
      message.error(error.error || '加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换站点
  const handleStationChange = (stationId) => {
    const station = user.stations.find(s => s.id === stationId);
    if (station) {
      console.log('切换到站点:', station.name, '(ID:', station.id, ')');
      setSelectedStation(station);

      // 更新localStorage中的站点
      localStorage.setItem('selectedStationId', station.id);
      localStorage.setItem('selectedStationName', station.name);

      loadTasks(station.id);
    } else {
      console.error('找不到ID为', stationId, '的站点');
    }
  };

  // 创建新任务
  const handleCreateTask = () => {
    // 确保有站点ID可用
    const stationId = selectedStation?.id || (user?.stations?.length > 0 ? user.stations[0].id : null);
    if (stationId) {
      navigate('/tasks/create', { state: { stationId } });
    } else {
      message.warning('请先选择站点');
    }
  };

  // 编辑任务
  const handleEditTask = (taskId) => {
    console.log('点击编辑任务，跳转到编辑页面，任务ID:', taskId);
    // 确保使用正确的路径格式 /tasks/edit/:id
    navigate(`/tasks/edit/${taskId}`);
  };

  // 添加查看任务详情的处理函数
  const handleViewTaskDetail = (taskId) => {
    console.log('查看任务详情，任务ID:', taskId);
    // 这里实现查看任务详情的逻辑，可以打开Modal或导航到详情页面
    Modal.info({
      title: '任务详情',
      width: 700,
      content: (
        <div>
          <p>正在加载任务ID: {taskId} 的详细信息...</p>
          <p>这里将显示完整的任务信息和提交记录。</p>
          <div style={{ marginTop: 15 }}>
            <Button
              type="primary"
              onClick={() => {
                Modal.destroyAll();
                navigate(`/submissions/${taskId}`);
              }}
            >
              查看任务提交记录
            </Button>
          </div>
        </div>
      ),
      okText: '关闭',
    });
  };

  // 添加查看历史任务的函数
  const handleViewTaskHistory = () => {
    navigate('/task-history');
  };

  // 结算任务
  const handleSettleTask = async (taskId, taskTitle) => {
    Modal.confirm({
      title: '确认结算',
      content: `确定要结算任务"${taskTitle}"吗？结算后任务将移至历史任务列表，且无法再编辑。`,
      okText: '确认结算',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true);
          await settleTask(taskId);
          message.success('任务结算成功');
          // 刷新任务列表
          if (selectedStation?.id) {
            await loadTasks(selectedStation.id);
          }
        } catch (error) {
          console.error('结算任务失败:', error);
          message.error(error.error || '结算任务失败');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '任务名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          {record.is_focus_task && (
            <Tag color="gold" icon={<RocketOutlined />}>焦点</Tag>
          )}
          <a onClick={() => handleEditTask(record.id)}>{text}</a>
        </Space>
      ),
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      width: 80,
    },
    {
      title: '截止日期',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 180,
      render: (text) => text ? new Date(text).toLocaleString() : '无截止日期',
    },
    {
      title: '模式',
      key: 'modes',
      width: 120,
      render: (_, record) => (
        <Space>
          {record.time_limit_mode && (
            <Tooltip title="时间限制模式">
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          )}
          {record.flame_mode_enabled && (
            <Tooltip title="火焰模式">
              <FireOutlined style={{ color: '#ff4d4f' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '参与人数',
      dataIndex: 'participants',
      key: 'participants',
      width: 100,
      render: (participants, record) => record.participants_count || 0,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEditTask(record.id)} />
          <Button
            type="text"
            icon={<CheckCircleOutlined />}
            style={{ color: '#52c41a' }}
            onClick={() => handleSettleTask(record.id, record.title)}
            title="结算任务"
          />
          <Button
            type="text"
            icon={<FileTextOutlined />}
            style={{ color: '#1890ff' }}
            onClick={() => handleViewTaskDetail(record.id)}
            title="查看任务详情"
          />
        </Space>
      ),
    },
  ];

  // 站点菜单
  const stationMenu = {
    items: user?.stations?.map(station => ({
      key: station.id,
      label: station.name,
      onClick: () => handleStationChange(station.id)
    })) || []
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SideMenu collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Dropdown menu={stationMenu} trigger={['click']}>
              <Button style={{ marginRight: 8 }}>
                <Space>
                  {selectedStation ? selectedStation.name : (user?.stations?.length > 0 ? user.stations[0].name : '选择站点')}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
            <Button icon={<ReloadOutlined />} onClick={refreshTasks}>刷新列表</Button>
          </div>
          <div>
            <Button
              type="default"
              icon={<ClockCircleOutlined />}
              onClick={handleViewTaskHistory}
              style={{ marginRight: 8 }}
            >
              历史任务
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateTask}
            >
              创建任务
            </Button>
          </div>
        </Header>
        <Content style={{ margin: '16px' }}>
          <Card
            title="任务列表"
            bordered={false}
            extra={
              <Text type="secondary">
                站点: {selectedStation?.name || (user?.stations?.length > 0 ? user.stations[0].name : '未选择')} |
                任务数量: {tasks.length}
              </Text>
            }
          >
            <Table
              columns={columns}
              dataSource={tasks}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: '暂无任务，请创建新任务' }}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Tasks;

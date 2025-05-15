import React, { useState, useEffect } from 'react';
import {
  Layout, Menu, Typography, Table, Card, Button, Space,
  Dropdown, Tag, Modal, message, Form, Input, Select, Switch
} from 'antd';
import {
  DashboardOutlined, TeamOutlined, SettingOutlined, PlusOutlined,
  EditOutlined, CopyOutlined, LinkOutlined, DownOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getInviteCodes, createInviteCode, updateInviteCode } from '../api/auth';
import axios from 'axios';
import SideMenu from '../components/SideMenu';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const InviteCodes = () => {
  const navigate = useNavigate();
  const { user, stations } = useAuth();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [inviteCodes, setInviteCodes] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentInviteCode, setCurrentInviteCode] = useState(null);
  const [useCustomCode, setUseCustomCode] = useState(false);

  // 加载数据
  useEffect(() => {
    console.log('可用站点:', stations);
    if (stations && stations.length > 0) {
      const defaultStation = stations[0];
      console.log('选择默认站点:', defaultStation);
      setSelectedStation(defaultStation);
      loadInviteCodes(defaultStation.id);
    }
  }, [stations]);

  // 加载邀请码列表
  const loadInviteCodes = async (stationId) => {
    try {
      setLoading(true);
      const data = await getInviteCodes(stationId);
      setInviteCodes(data);
    } catch (error) {
      message.error(error.error || '加载邀请码失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换站点
  const handleStationChange = (stationId) => {
    const station = stations.find(s => s.id === stationId);
    if (station) {
      setSelectedStation(station);
      loadInviteCodes(station.id);
    }
  };

  // 打开创建邀请码对话框
  const handleOpenCreateModal = () => {
    if (!selectedStation) {
      message.error('请先选择一个站点');
      return;
    }

    console.log('打开创建对话框，站点ID:', selectedStation.id);

    form.resetFields();
    form.setFieldsValue({
      station_id: selectedStation.id,
      is_focus_enabled: true,
      usage_limit: 'unlimited',
      use_custom_code: false
    });
    setCreateModalVisible(true);
  };

  // 打开编辑邀请码对话框
  const handleOpenEditModal = (record) => {
    setCurrentInviteCode(record);
    form.resetFields();
    form.setFieldsValue({
      ...record,
    });
    setEditModalVisible(true);
  };

  // 创建邀请码 - 使用更简单直接的方法
  const handleCreateInviteCode = async (values) => {
    try {
      console.log('提交的表单数据:', values);

      // 从表单中获取station_id
      let stationId = values.station_id;

      // 如果表单中没有，尝试从selectedStation获取
      if (!stationId && selectedStation) {
        stationId = selectedStation.id;
      }

      // 如果仍然没有，尝试从stations中获取第一个
      if (!stationId && stations && stations.length > 0) {
        stationId = stations[0].id;
      }

      if (!stationId) {
        message.error('站点ID不能为空，请选择一个站点');
        console.error('无法获取站点ID，可用站点:', stations);
        return;
      }

      // 组装请求数据
      const requestData = {
        station_id: stationId,
        description: values.description || '新邀请码',
        usage_limit: values.usage_limit || 'unlimited',
        is_focus_enabled: typeof values.is_focus_enabled === 'boolean' ? values.is_focus_enabled : true
      };

      // 添加自定义邀请码（如果提供）
      if (values.use_custom_code && values.custom_code) {
        requestData.custom_code = values.custom_code;
      }

      // 直接使用axios发起请求
      const token = localStorage.getItem('token');

      console.log('准备发送请求，数据:', requestData);

      const response = await axios({
        method: 'post',
        url: 'http://localhost:5000/api/station/invite-codes',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: requestData
      });

      console.log('创建邀请码成功:', response.data);

      message.success('邀请码创建成功');
      setCreateModalVisible(false);

      // 重新加载邀请码列表
      if (selectedStation) {
        loadInviteCodes(selectedStation.id);
      } else if (stations && stations.length > 0) {
        loadInviteCodes(stations[0].id);
      }
    } catch (error) {
      console.error('创建邀请码错误:', error);
      if (error.response) {
        console.error('错误响应:', error.response.status, error.response.data);
        message.error(error.response.data?.error || `创建失败 (${error.response.status})`);
      } else if (error.request) {
        console.error('请求未收到响应:', error.request);
        message.error('服务器无响应，请检查网络连接');
      } else {
        console.error('请求配置错误:', error.message);
        message.error(`请求错误: ${error.message}`);
      }
    }
  };

  // 更新邀请码
  const handleUpdateInviteCode = async (values) => {
    try {
      await updateInviteCode(currentInviteCode.id, values);
      message.success('邀请码更新成功');
      setEditModalVisible(false);
      loadInviteCodes(selectedStation.id);
    } catch (error) {
      message.error(error.error || '更新邀请码失败');
    }
  };

  // 复制邀请码
  const handleCopyInviteCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        message.success('邀请码已复制到剪贴板');
      })
      .catch(() => {
        message.error('复制失败，请手动复制');
      });
  };

  // 表格列定义
  const columns = [
    {
      title: '邀请码',
      dataIndex: 'code',
      key: 'code',
      render: (text) => (
        <Space>
          <a onClick={() => handleCopyInviteCode(text)}>{text}</a>
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={() => handleCopyInviteCode(text)}
          />
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '激活' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '使用限制',
      dataIndex: 'usage_limit',
      key: 'usage_limit',
      render: (text) => text === 'unlimited' ? '无限制' : text,
    },
    {
      title: '焦点任务',
      dataIndex: 'is_focus_enabled',
      key: 'is_focus_enabled',
      render: (enabled) => (
        <Tag color={enabled ? 'blue' : 'gray'}>
          {enabled ? '允许' : '禁止'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => text ? new Date(text).toLocaleString() : '',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditModal(record)}
          />
          <Button
            type="text"
            icon={<LinkOutlined />}
            onClick={() => handleCopyInviteCode(record.code)}
          />
        </Space>
      ),
    },
  ];

  // 站点选择菜单项
  const stationMenuItems = stations?.map(station => ({
    key: station.id,
    label: station.name
  })) || [];

  // 站点选择菜单
  const stationMenu = {
    items: stationMenuItems,
    onClick: ({ key }) => handleStationChange(key)
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SideMenu collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Dropdown menu={stationMenu} trigger={['click']}>
            <Button>
              <Space>
                {selectedStation ? selectedStation.name : '选择站点'}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
            创建邀请码
          </Button>
        </Header>
        <Content style={{ margin: '16px' }}>
          <Card title="邀请码列表" bordered={false}>
            <Table
              columns={columns}
              dataSource={inviteCodes}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Content>
      </Layout>

      {/* 创建邀请码对话框 */}
      <Modal
        title="创建邀请码"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateInviteCode}
          initialValues={{
            station_id: selectedStation?.id,
            is_focus_enabled: true,
            usage_limit: 'unlimited',
            use_custom_code: false
          }}
        >
          <Form.Item
            label="所属站点"
          >
            <Input value={selectedStation?.name} disabled />
          </Form.Item>

          <Form.Item
            name="station_id"
            hidden
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={4} placeholder="输入邀请码描述" />
          </Form.Item>

          <Form.Item
            name="use_custom_code"
            label="使用自定义邀请码"
            valuePropName="checked"
          >
            <Switch onChange={setUseCustomCode} />
          </Form.Item>

          {useCustomCode && (
            <Form.Item
              name="custom_code"
              label="自定义邀请码"
              rules={[
                { required: true, message: '请输入自定义邀请码' },
                {
                  pattern: /^[A-Za-z0-9]{6,8}$/,
                  message: '邀请码必须是6-8位字母和数字的组合'
                }
              ]}
              extra="邀请码长度为6-8位，只能包含字母和数字"
            >
              <Input placeholder="输入6-8位邀请码" maxLength={8} />
            </Form.Item>
          )}

          <Form.Item
            name="usage_limit"
            label="使用限制"
            initialValue="unlimited"
          >
            <Select>
              <Option value="unlimited">无限制</Option>
              <Option value="single-use">一次性使用</Option>
              <Option value="limited">有限次数</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="is_focus_enabled"
            label="允许焦点任务"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑邀请码对话框 */}
      <Modal
        title="编辑邀请码"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateInviteCode}
        >
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={4} placeholder="输入邀请码描述" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
          >
            <Select>
              <Option value="active">激活</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="usage_limit"
            label="使用限制"
          >
            <Select>
              <Option value="unlimited">无限制</Option>
              <Option value="single-use">一次性使用</Option>
              <Option value="limited">有限次数</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="is_focus_enabled"
            label="允许焦点任务"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              更新
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default InviteCodes;

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout, Card, Typography, Table, Tag, Image, Button,
  Space, message, Modal, Input, Spin, Result
} from 'antd';
import {
  ArrowLeftOutlined, ExclamationCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const { Content, Header } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 处理图片URL的辅助函数
const formatImageUrl = (url) => {
  if (!url) return '';

  // 检查URL是否已经包含协议
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // 去掉开头的斜杠（如果有）
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url;

  // 检查是否已经包含uploads路径
  if (cleanUrl.includes('uploads/task_submissions/')) {
    // 确保cleanUrl不包含uploads前缀
    const pathParts = cleanUrl.split('uploads/');
    const actualPath = pathParts[pathParts.length - 1];
    return `http://localhost:5000/uploads/${actualPath}`;
  } else {
    return `http://localhost:5000/${cleanUrl}`;
  }
};

const TaskSubmissions = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const token = auth?.token || localStorage.getItem('token');

  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [markingSubmission, setMarkingSubmission] = useState(null);
  const [abnormalReason, setAbnormalReason] = useState('');
  const [markingLoading, setMarkingLoading] = useState(false);
  const [error, setError] = useState(null);

  // 定义fetchData函数作为组件的独立函数
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    console.log('准备获取数据, taskId:', taskId);
    console.log('认证token:', token ? '存在' : '不存在');

    if (!token) {
      setError('未获取到认证令牌，请确保已登录');
      setLoading(false);
      return;
    }

    try {
      // 配置请求头
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      console.log('开始发送请求...');
      // 并行请求任务详情和提交记录
      const [taskResponse, submissionsResponse] = await Promise.all([
        axios.get(`/api/station/tasks/${taskId}`, config),
        axios.get(`/api/station/tasks/${taskId}/submissions`, config)
      ]);

      console.log('请求成功, 任务数据:', taskResponse.data);
      console.log('提交记录数据:', submissionsResponse.data);
      console.log('图片URL示例:', submissionsResponse.data[0]?.image_preview);

      setTask(taskResponse.data);
      setSubmissions(submissionsResponse.data);
    } catch (err) {
      console.error('获取数据失败:', err);
      console.error('错误状态码:', err.response?.status);
      console.error('错误详情:', err.response?.data);

      if (err.response?.status === 401) {
        setError('认证令牌无效或已过期，请重新登录');
        // 可能需要注销并重定向到登录页
        // auth.logout();
        // navigate('/login');
      } else {
        setError('获取任务和提交记录失败：' + (err.response?.data?.error || err.message));
      }
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [taskId, token, navigate]);

  // 获取任务和提交记录数据
  useEffect(() => {
    if (taskId) {
      fetchData();
    } else {
      console.warn('缺少任务ID参数');
      setError('缺少任务ID参数');
      setLoading(false);
    }
  }, [taskId, fetchData]);

  // 处理图片预览
  const handlePreview = (imagePath) => {
    setPreviewImage(imagePath);
    setPreviewVisible(true);
  };

  // 处理标记异常
  const handleMarkAbnormal = (submission) => {
    setMarkingSubmission(submission);
    setAbnormalReason('');
  };

  // 提交异常标记
  const submitAbnormalMark = async () => {
    if (!abnormalReason.trim()) {
      message.warning('请输入标记原因');
      return;
    }

    setMarkingLoading(true);

    try {
      await axios.post(
        `/api/station/submissions/${markingSubmission.id}/mark-abnormal`,
        { reason: abnormalReason },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      message.success('已成功标记为异常提交');

      // 更新本地提交记录数据
      setSubmissions(prev => prev.map(item => {
        if (item.id === markingSubmission.id) {
          return {
            ...item,
            is_abnormal: true,
            abnormal_reason: abnormalReason
          };
        }
        return item;
      }));

      // 关闭弹窗
      setMarkingSubmission(null);
    } catch (err) {
      console.error('标记异常失败:', err);
      message.error('标记异常失败: ' + (err.response?.data?.error || err.message));
    } finally {
      setMarkingLoading(false);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '提交者',
      dataIndex: 'participant_name',
      key: 'participant_name',
    },
    {
      title: '提交时间',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: '图片',
      dataIndex: 'image_preview',
      key: 'image_preview',
      render: (imagePath, record) => (
        <div style={{ width: 80, height: 80, overflow: 'hidden' }}>
          <img
            src={formatImageUrl(imagePath)}
            alt="提交图片预览"
            style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
            onClick={() => handlePreview(imagePath)}
          />
          {record.submission_count > 1 && (
            <div style={{ position: 'absolute', right: 5, bottom: 5, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0 4px', borderRadius: 4 }}>
              +{record.submission_count - 1}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '获得积分',
      dataIndex: 'points_earned',
      key: 'points_earned',
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => (
        <Space>
          {record.is_abnormal ? (
            <Tag icon={<CloseCircleOutlined />} color="error">异常</Tag>
          ) : (
            <Tag icon={<CheckCircleOutlined />} color="success">正常</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => navigate(`/station/submissions/${record.id}`)}
          >
            详情
          </Button>
          {!record.is_abnormal && (
            <Button
              type="link"
              danger
              onClick={() => handleMarkAbnormal(record)}
            >
              标记异常
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 如果出错显示错误信息
  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ margin: '16px' }}>
          <Result
            status="error"
            title="获取数据失败"
            subTitle={error}
            extra={
              <Button type="primary" onClick={() => navigate(-1)}>
                返回任务列表
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginRight: 16 }}
        >
          返回
        </Button>
        <Title level={4} style={{ margin: 0 }}>
          任务提交记录
        </Title>
      </Header>

      <Content style={{ margin: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>加载任务数据中...</p>
          </div>
        ) : (
          <>
            {/* 任务信息卡片 */}
            <Card style={{ marginBottom: 16 }}>
              <Title level={4}>{task?.title}</Title>
              <Paragraph>{task?.description}</Paragraph>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                <Text>
                  <strong>积分:</strong> {task?.points}
                  {task?.bonus_points > 0 && ` (+${task?.bonus_points}额外奖励)`}
                </Text>
                <Text>
                  <strong>截止日期:</strong> {task?.due_date ? new Date(task.due_date).toLocaleString() : '无截止日期'}
                </Text>
                <Text>
                  <strong>提交数量:</strong> {submissions.length}
                </Text>
                <Text>
                  <strong>参与人数:</strong> {task?.participants_count || '0'}
                </Text>
              </div>
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Button
                  type="primary"
                  onClick={() => {
                    setLoading(true);
                    fetchData().finally(() => setLoading(false));
                  }}
                >
                  刷新数据
                </Button>
              </div>
            </Card>

            {/* 提交记录表格 */}
            <Card title="提交记录">
              <Table
                columns={columns}
                dataSource={submissions}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </>
        )}
      </Content>

      {/* 图片预览 */}
      <Modal
        open={previewVisible}
        title="图片预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="预览图片" style={{ width: '100%' }} src={formatImageUrl(previewImage)} />
      </Modal>

      {/* 标记异常 */}
      <Modal
        title="标记为异常提交"
        open={!!markingSubmission}
        onOk={submitAbnormalMark}
        onCancel={() => setMarkingSubmission(null)}
        confirmLoading={markingLoading}
        okText="确认标记"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <p><ExclamationCircleOutlined style={{ color: '#faad14' }} /> 将此提交标记为异常后：</p>
          <ul>
            <li>该记录将被标记为异常提交</li>
            <li>提交者已获得的积分将被扣除</li>
            <li><strong>此操作不可撤销</strong></li>
          </ul>
        </div>
        <TextArea
          rows={4}
          value={abnormalReason}
          onChange={e => setAbnormalReason(e.target.value)}
          placeholder="请输入标记为异常的原因..."
        />
      </Modal>
    </Layout>
  );
};

export default TaskSubmissions;

import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Divider, Button, Modal, Empty, Spin, Alert, Image, message } from 'antd';
import { ArrowLeftOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCompletedTasks, getTaskSubmissions } from '../api/auth';
import SideMenu from '../components/SideMenu';

const { Content } = Layout;
const { Title, Text } = Typography;

const TaskHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskParticipants, setTaskParticipants] = useState([]);
  const [participantModalVisible, setParticipantModalVisible] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState(() => {
    // 从localStorage获取站点
    const savedStationId = localStorage.getItem('selectedStationId');
    const savedStationName = localStorage.getItem('selectedStationName');
    return savedStationId && savedStationName ? { id: savedStationId, name: savedStationName } : null;
  });

  // 加载已完成任务列表
  useEffect(() => {
    fetchCompletedTasks();
  }, [selectedStation]);

  const fetchCompletedTasks = async () => {
    if (!selectedStation?.id) {
      setError('请先选择站点');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tasksData = await getCompletedTasks(selectedStation.id);
      setCompletedTasks(tasksData || []);
    } catch (err) {
      console.error('获取历史任务失败:', err);
      setError(err.error || '获取历史任务失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const viewTaskParticipants = async (task) => {
    try {
      setSelectedTask(task);
      setLoading(true);
      const submissions = await getTaskSubmissions(task.id);

      // 处理参与者数据
      const participantsMap = {};

      submissions.forEach(submission => {
        const participantId = submission.participant_id;

        if (!participantsMap[participantId]) {
          participantsMap[participantId] = {
            id: participantId,
            name: submission.participant_name,
            submissions: [],
            points_earned: 0,
            submission_count: 0
          };
        }

        // 累计积分和提交次数
        participantsMap[participantId].points_earned += submission.points_earned || 0;
        participantsMap[participantId].submission_count += 1;

        // 添加提交记录
        participantsMap[participantId].submissions.push({
          id: submission.id,
          submitted_at: submission.submitted_at,
          points_earned: submission.points_earned,
          image_url: submission.image_preview,
          is_abnormal: submission.is_abnormal,
          abnormal_reason: submission.abnormal_reason
        });
      });

      // 转换为数组
      const participantsArray = Object.values(participantsMap);
      setTaskParticipants(participantsArray);
      setParticipantModalVisible(true);
    } catch (err) {
      console.error('获取任务参与者失败:', err);
      message.error('获取任务参与者信息失败');
    } finally {
      setLoading(false);
    }
  };

  const viewParticipantImages = (participant) => {
    setSelectedParticipant(participant);
    setImageModalVisible(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SideMenu collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Title level={2}>历史任务</Title>
            <Button onClick={() => navigate('/tasks')} icon={<ArrowLeftOutlined />}>
              返回
            </Button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>加载中...</div>
            </div>
          ) : error ? (
            <Alert
              type="error"
              message="错误"
              description={error}
              showIcon
              style={{ marginBottom: 16 }}
            />
          ) : completedTasks.length === 0 ? (
            <Empty description="暂无已完成任务" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {completedTasks.map(task => (
                <Card
                  key={task.id}
                  hoverable
                  onClick={() => viewTaskParticipants(task)}
                  style={{ height: '100%' }}
                >
                  <Title level={4}>{task.title}</Title>
                  <Text type="secondary" ellipsis={{ rows: 2 }}>{task.description}</Text>
                  <Divider />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <Text strong>积分</Text>
                      <div>{task.points} 分</div>
                    </div>
                    <div>
                      <Text strong>参与人数</Text>
                      <div>{task.participant_count || '0'} 人</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* 参与者列表对话框 */}
          <Modal
            title={selectedTask ? `${selectedTask.title} - 参与者列表` : '参与者列表'}
            open={participantModalVisible}
            onCancel={() => setParticipantModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setParticipantModalVisible(false)}>
                关闭
              </Button>
            ]}
            width={700}
          >
            {taskParticipants.length === 0 ? (
              <Empty description="暂无参与者" />
            ) : (
              taskParticipants.map(participant => (
                <Card
                  key={participant.id}
                  style={{ marginBottom: 16, cursor: 'pointer' }}
                  onClick={() => viewParticipantImages(participant)}
                  hoverable
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>{participant.name}</Text>
                      <div>
                        <Text type="secondary">提交次数: {participant.submission_count}</Text>
                        <br />
                        <Text type="secondary">总积分: {participant.points_earned}</Text>
                      </div>
                    </div>
                    <Button icon={<EyeOutlined />}>查看图片</Button>
                  </div>
                </Card>
              ))
            )}
          </Modal>

          {/* 图片查看对话框 */}
          <Modal
            title={selectedParticipant ? `${selectedParticipant.name} - 提交图片` : '提交图片'}
            open={imageModalVisible}
            onCancel={() => setImageModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setImageModalVisible(false)}>
                关闭
              </Button>
            ]}
            width={800}
          >
            {selectedParticipant?.submissions.length === 0 ? (
              <Empty description="暂无提交图片" />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {selectedParticipant?.submissions.map((submission, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <Image
                      src={submission.image_url}
                      alt={`提交图片 ${index + 1}`}
                      style={{ width: '100%', height: 150, objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      padding: 8
                    }}>
                      {formatDate(submission.submitted_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TaskHistory;

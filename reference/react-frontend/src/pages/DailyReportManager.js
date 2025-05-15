import React, { useState, useEffect } from 'react';
import {
  Layout, Typography, Divider, Card, Button, Space,
  Select, Form, DatePicker, Table, Spin, Alert, message
} from 'antd';
import {
  DashboardOutlined, ArrowLeftOutlined, FileTextOutlined, CalendarOutlined,
  SearchOutlined, DownloadOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import SideMenu from '../components/SideMenu';
import moment from 'moment';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const DailyReportManager = () => {
  // 状态变量
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attemptedFetch, setAttemptedFetch] = useState(false);
  const [leaderboardTitle, setLeaderboardTitle] = useState('排行榜结果');

  const [inviteCodes, setInviteCodes] = useState([]);
  const [selectedInviteCode, setSelectedInviteCode] = useState('');
  const [isLoadingInviteCodes, setIsLoadingInviteCodes] = useState(false);
  const [inviteCodeError, setInviteCodeError] = useState(null);

  const [lastQueryContext, setLastQueryContext] = useState(null); // 用于Word报告上下文
  const [isLoadingReport, setIsLoadingReport] = useState(false); // 用于Word报告加载状态

  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedStartDate, setSelectedStartDate] = useState(today);
  const [selectedEndDate, setSelectedEndDate] = useState(today);

  const [activeTasks, setActiveTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [selectedActiveTaskId, setSelectedActiveTaskId] = useState('');
  const [selectedCompletedTaskId, setSelectedCompletedTaskId] = useState('');
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const { token } = useAuth();
  const navigate = useNavigate();

  // 辅助函数 - 获取格式化日期
  const getFormattedDate = (date) => {
    return format(date, 'yyyy-MM-dd');
  };

  // 返回上一页
  const handleGoBack = () => {
    navigate('/dashboard');
  };

  // 获取邀请码列表
  const fetchInviteCodes = async () => {
    setIsLoadingInviteCodes(true);
    setInviteCodeError(null);

    if (!token) {
      setInviteCodeError('管理员未登录，无法加载邀请码。');
      setIsLoadingInviteCodes(false);
      return;
    }

    try {
      const response = await fetch('/api/station/invite-codes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP错误: ${response.status}` }));
        throw new Error(errorData.message || `加载邀请码失败 (${response.status})`);
      }

      const data = await response.json();
      setInviteCodes(data);
      if (data.length === 0) {
        setInviteCodeError('系统中暂无可用邀请码。');
      }
    } catch (err) {
      console.error('加载邀请码失败:', err);
      setInviteCodeError(err.message || '加载邀请码时发生未知错误。');
      setInviteCodes([]);
    } finally {
      setIsLoadingInviteCodes(false);
    }
  };

  // 获取活跃和已完成任务
  const fetchAdminTasksAndCompletedTasks = async () => {
    setIsLoadingTasks(true);
    setTasksError(null);

    if (!token) {
      setTasksError('管理员未登录，无法加载活动列表。');
      setIsLoadingTasks(false);
      return;
    }

    try {
      // 获取活跃任务
      const activeResponse = await fetch('/api/station/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!activeResponse.ok) {
        throw new Error(`加载进行中活动失败 (${activeResponse.status})`);
      }

      const activeTasksData = await activeResponse.json();
      setActiveTasks(activeTasksData);

      // 获取已完成任务
      const completedResponse = await fetch('/api/station/tasks?status=completed', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!completedResponse.ok) {
        throw new Error(`加载已结算活动失败 (${completedResponse.status})`);
      }

      const completedTasksData = await completedResponse.json();
      setCompletedTasks(completedTasksData);

    } catch (err) {
      console.error('加载活动列表失败:', err);
      setTasksError(err.message || '加载活动列表时发生未知错误。');
      setActiveTasks([]);
      setCompletedTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // 核心排行榜获取逻辑
  const executeFetchLeaderboard = async (startDate, endDate, inviteCode) => {
    if (!inviteCode) {
      setError('请先选择一个邀请码。');
      setLeaderboardData([]);
      setAttemptedFetch(true);
      return;
    }

    if (!startDate || !endDate) {
      setError('请选择开始和结束日期。');
      setLeaderboardData([]);
      setAttemptedFetch(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAttemptedFetch(true);
    setLeaderboardData([]); // 清除之前的结果
    setLeaderboardTitle('排行榜结果'); // 重置标题

    if (!token) {
      setError('管理员未登录或登录已过期，请重新登录。');
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = `/api/station/rankings?type=custom_range&startDate=${startDate}&endDate=${endDate}&invite_code=${inviteCode}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        let errorData = { message: `HTTP 错误: ${response.status} ${response.statusText}` };
        try {
          errorData = await response.json();
        } catch (e) {
          console.error('无法解析错误响应体:', e);
        }
        throw new Error(errorData.message || `获取排行榜数据失败 (${response.status})`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setLeaderboardData(result.data);
        setError(null);

        // 设置动态标题
        if (startDate === endDate) {
          setLeaderboardTitle(`${startDate} 排行榜`);
        } else {
          setLeaderboardTitle(`${startDate} 至 ${endDate} 排行榜`);
        }

        // 设置上下文用于日期范围排行榜
        if (startDate === getFormattedDate(new Date()) && endDate === getFormattedDate(new Date())) {
          setLastQueryContext({
            type: 'daily',
            details: { date: startDate }
          });
        } else {
          setLastQueryContext({
            type: 'custom_range',
            details: { startDate: startDate, endDate: endDate }
          });
        }
      } else {
        setError(result.message || '获取到的排行榜数据格式不正确或操作未成功。');
        setLeaderboardTitle('排行榜结果'); // 出错时重置或保持默认
      }
    } catch (err) {
      console.error('API调用失败:', err);
      setError(err.message || '请求排行榜数据时发生未知网络错误。');
      setLeaderboardTitle('排行榜结果'); // 出错时重置或保持默认
    } finally {
      setIsLoading(false);
    }
  };

  // 获取今日排行榜
  const fetchTodaysLeaderboard = async () => {
    const today = getFormattedDate(new Date());
    executeFetchLeaderboard(today, today, selectedInviteCode);
  };

  // 获取自定义日期范围排行榜
  const fetchCustomRangeLeaderboard = async () => {
    // 日期范围基本验证
    if (selectedStartDate && selectedEndDate && selectedStartDate > selectedEndDate) {
      setError('开始日期不能晚于结束日期。');
      setLeaderboardData([]);
      setAttemptedFetch(true);
      return;
    }
    executeFetchLeaderboard(selectedStartDate, selectedEndDate, selectedInviteCode);
  };

  // 获取任务特定排行榜的通用函数
  const executeFetchTaskRanking = async (taskId) => {
    if (!taskId) {
      setError('请先选择一个活动。');
      setLeaderboardData([]);
      setAttemptedFetch(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAttemptedFetch(true);
    setLeaderboardData([]);

    if (!token) {
      setError('管理员未登录或登录已过期。');
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = `/api/station/tasks/${taskId}/ranking`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP错误: ${response.status}` }));
        throw new Error(errorData.message || `获取活动排行榜失败 (${response.status})`);
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setLeaderboardData(result.data);
        setLeaderboardTitle(result.leaderboard_title || '活动排行榜');
        setError(null);

        // 设置单个任务排行榜的上下文
        let taskName = '未知活动';
        let taskTypeContext = 'single_task'; // 通用，稍后会细化

        const activeTask = activeTasks.find(t => t.id === taskId);
        if (activeTask) {
          taskName = activeTask.title;
          taskTypeContext = 'single_task_active';
        } else {
          const completedTask = completedTasks.find(t => t.id === taskId);
          if (completedTask) {
            taskName = completedTask.title;
            taskTypeContext = 'single_task_completed';
          }
        }

        setLastQueryContext({
          type: taskTypeContext,
          details: { taskId: taskId, taskName: taskName }
        });
      } else {
        setError(result.message || '获取到的活动排行榜数据格式不正确。');
        setLeaderboardTitle('活动排行榜结果');
      }
    } catch (err) {
      console.error('单活动排行API调用失败:', err);
      setError(err.message || '请求活动排行榜时发生未知错误。');
      setLeaderboardTitle('活动排行榜结果');
    } finally {
      setIsLoading(false);
    }
  };

  // 获取活跃任务排行榜
  const fetchActiveTaskRanking = async () => {
    executeFetchTaskRanking(selectedActiveTaskId);
  };

  // 获取已完成任务排行榜
  const fetchCompletedTaskRanking = async () => {
    executeFetchTaskRanking(selectedCompletedTaskId);
  };

  // 生成Word报告
  const generateWordReport = async () => {
    if (!leaderboardData.length || !lastQueryContext) {
      setError('没有可生成的排行榜数据或上下文。');
      return;
    }

    if (!selectedInviteCode) {
      setError('生成日报前必须选择邀请码。');
      return;
    }

    setIsLoadingReport(true);
    setError(null); // 清除之前的显示错误

    if (!token) {
      setError('管理员未登录或登录已过期。');
      setIsLoadingReport(false);
      return;
    }

    const payload = {
      leaderboardTitle: leaderboardTitle,
      leaderboardData: leaderboardData,
      inviteCode: selectedInviteCode,
      queryContext: lastQueryContext
    };

    try {
      const response = await fetch('/api/station/daily-report/generate-word', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/vnd.openxmlformats-officedocument.wordprocessingml.document') !== -1) {
          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          const disposition = response.headers.get('content-disposition');
          let filename = 'daily_report.docx'; // 默认文件名
          if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
              filename = matches[1].replace(/['"]/g, '');
            }
          }
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(downloadUrl);
        } else {
          const errorData = await response.json().catch(() => ({ message: '服务器返回了OK状态，但响应不是预期的Word文件。' }));
          throw new Error(errorData.message || '生成成功但无法下载文件，响应类型不正确。');
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: `HTTP错误: ${response.status} ${response.statusText}` }));
        throw new Error(errorData.details || errorData.error || errorData.message || `生成日报失败 (${response.status})`);
      }
    } catch (err) {
      console.error('生成Word日报失败:', err);
      setError(err.message || '生成Word日报时发生未知客户端错误。');
    } finally {
      setIsLoadingReport(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchInviteCodes();
    fetchAdminTasksAndCompletedTasks();
  }, [token]);

  // 定义表格列
  const columns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '积分',
      dataIndex: 'score',
      key: 'score',
      width: 100,
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SideMenu collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <Content style={{ margin: '24px 16px', padding: 24, background: 'white', overflow: 'auto' }}>
          <div style={{ marginBottom: 16 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Button
                    type="primary"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleGoBack}
                  >
                    返回
                  </Button>
                  <Title level={2} style={{ margin: 0 }}>日报管理</Title>
                </Space>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    fetchInviteCodes();
                    fetchAdminTasksAndCompletedTasks();
                    message.success('数据已刷新');
                  }}
                >
                  刷新数据
                </Button>
              </div>

              <Text type="secondary">
                本页面用于提取排行榜数据和生成日报，请先选择邀请码和查询条件。
              </Text>
            </Space>

            <Divider />

            <Card title="选择邀请码" style={{ marginBottom: 16 }}>
              <Select
                placeholder={isLoadingInviteCodes ? "加载中..." : "请选择邀请码"}
                style={{ width: '100%' }}
                value={selectedInviteCode}
                onChange={(value) => setSelectedInviteCode(value)}
                loading={isLoadingInviteCodes}
                disabled={inviteCodes.length === 0 || isLoadingInviteCodes}
              >
                {inviteCodes.map(code => (
                  <Option key={code.id} value={code.code}>
                    {code.description ? `${code.code} (${code.description})` : code.code}
                  </Option>
                ))}
              </Select>
              {inviteCodeError && (
                <Alert
                  message={inviteCodeError}
                  type="error"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>

            {selectedInviteCode && (
              <>
                <Card title="按日期范围提取" style={{ marginBottom: 16 }}>
                  <Space wrap align="baseline">
                    <Button
                      type="primary"
                      icon={<CalendarOutlined />}
                      onClick={fetchTodaysLeaderboard}
                      disabled={isLoading}
                    >
                      提取今日排行榜
                    </Button>
                    <Divider type="vertical" />
                    <Form layout="inline">
                      <Form.Item label="开始日期">
                        <DatePicker
                          value={selectedStartDate ? moment(selectedStartDate) : null}
                          onChange={(date, dateString) => setSelectedStartDate(dateString)}
                          disabled={isLoading}
                        />
                      </Form.Item>
                      <Form.Item label="结束日期">
                        <DatePicker
                          value={selectedEndDate ? moment(selectedEndDate) : null}
                          onChange={(date, dateString) => setSelectedEndDate(dateString)}
                          disabled={isLoading}
                        />
                      </Form.Item>
                      <Form.Item>
                        <Button
                          type="primary"
                          icon={<SearchOutlined />}
                          onClick={fetchCustomRangeLeaderboard}
                          disabled={isLoading || !selectedStartDate || !selectedEndDate}
                        >
                          查询选定范围
                        </Button>
                      </Form.Item>
                    </Form>
                  </Space>
                </Card>

                <Card title="按单活动提取" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 300 }}>
                      <Title level={5}>进行中活动</Title>
                      <Space.Compact style={{ width: '100%' }}>
                        <Select
                          style={{ width: '80%' }}
                          placeholder={isLoadingTasks ? "加载中..." : "选择进行中活动"}
                          value={selectedActiveTaskId}
                          onChange={(value) => setSelectedActiveTaskId(value)}
                          disabled={isLoading || isLoadingTasks || activeTasks.length === 0}
                          loading={isLoadingTasks}
                        >
                          {activeTasks.map(task => (
                            <Option key={task.id} value={task.id}>{task.title}</Option>
                          ))}
                        </Select>
                        <Button
                          type="primary"
                          onClick={fetchActiveTaskRanking}
                          disabled={isLoading || !selectedActiveTaskId}
                          style={{ width: '20%' }}
                        >
                          提取
                        </Button>
                      </Space.Compact>
                    </div>

                    <div style={{ flex: 1, minWidth: 300 }}>
                      <Title level={5}>已结算活动</Title>
                      <Space.Compact style={{ width: '100%' }}>
                        <Select
                          style={{ width: '80%' }}
                          placeholder={isLoadingTasks ? "加载中..." : "选择已结算活动"}
                          value={selectedCompletedTaskId}
                          onChange={(value) => setSelectedCompletedTaskId(value)}
                          disabled={isLoading || isLoadingTasks || completedTasks.length === 0}
                          loading={isLoadingTasks}
                        >
                          {completedTasks.map(task => (
                            <Option key={task.id} value={task.id}>{task.title}</Option>
                          ))}
                        </Select>
                        <Button
                          type="primary"
                          onClick={fetchCompletedTaskRanking}
                          disabled={isLoading || !selectedCompletedTaskId}
                          style={{ width: '20%' }}
                        >
                          提取
                        </Button>
                      </Space.Compact>
                    </div>
                  </div>
                  {tasksError && (
                    <Alert
                      message={`加载活动列表失败: ${tasksError}`}
                      type="error"
                      showIcon
                      style={{ marginTop: 16 }}
                    />
                  )}
                </Card>
              </>
            )}

            {isLoading && (
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <Spin tip="正在加载排行榜数据，请稍候..." />
              </div>
            )}

            {error && (
              <Alert
                message="发生错误"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {!isLoading && !error && leaderboardData.length > 0 && (
              <Card
                title={leaderboardTitle}
                extra={
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={generateWordReport}
                    loading={isLoadingReport}
                  >
                    生成日报(Word)
                  </Button>
                }
              >
                <Table
                  dataSource={leaderboardData}
                  columns={columns}
                  rowKey={(record, index) => record.id || index}
                  pagination={false}
                  bordered
                />
                <div style={{ marginTop: 16 }}>
                  <Text>本次共有 {leaderboardData.length} 位粉丝上榜。</Text>
                </div>
              </Card>
            )}

            {!isLoading && !error && leaderboardData.length === 0 && attemptedFetch && (
              <Alert
                message="暂无数据"
                description="暂无排行榜数据。"
                type="info"
                showIcon
              />
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DailyReportManager;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Spin, Alert, Typography, Button, Avatar, Card, Tag, Row, Col } from 'antd';
import { UserOutlined, HeartOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';
import LeaderboardTabs from '../../components/LeaderboardTabs';
import EncouragementPopup from '../../components/EncouragementPopup';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const FanHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nickname, setNickname] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [activeTab, setActiveTab] = useState('tasks');

  // 鼓励弹窗状态
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementData, setEncouragementData] = useState({
    title: '恭喜你！',
    message: '',
    imageUrl: '',
    taskId: null,
    points: 0,
    rank: '-'
  });

  useEffect(() => {
    // 从localStorage获取粉丝信息
    const fanInfo = localStorage.getItem('fanInfo');
    if (fanInfo) {
      try {
        const { nickname: storedNickname, invite_code: storedInviteCode } = JSON.parse(fanInfo);
        setNickname(storedNickname || '粉丝');
        setInviteCode(storedInviteCode || '');
      } catch (e) {
        console.error('解析粉丝信息失败:', e);
      }
    } else {
      // 如果没有存储的信息，试图从location state中获取
      if (location.state && location.state.nickname && location.state.inviteCode) {
        setNickname(location.state.nickname);
        setInviteCode(location.state.inviteCode);

        // 保存到localStorage
        localStorage.setItem('fanInfo', JSON.stringify({
          nickname: location.state.nickname,
          invite_code: location.state.inviteCode
        }));
      } else {
        // 如果都没有，重定向到登录页
        navigate('/fan/login');
        return;
      }
    }

    fetchTasks();

    // 检查URL查询参数，如果有任务完成标记，则显示鼓励弹窗
    const searchParams = new URLSearchParams(location.search);
    const taskCompleted = searchParams.get('taskCompleted');
    const taskId = searchParams.get('taskId');
    const points = searchParams.get('points');
    const forceRefresh = searchParams.get('forceRefresh');
    const urlNickname = searchParams.get('nickname');

    if (taskCompleted === 'true' && taskId) {
      // 获取鼓励内容，优先使用URL中的昵称参数
      fetchEncouragementContent(taskId, points, urlNickname);

      // 如果有forceRefresh标记，切换到排行榜标签并强制刷新
      if (forceRefresh === 'true') {
        // 设置排行榜为当前激活的标签
        setActiveTab('leaderboard');
      }
    }

    // 清除URL参数，以免刷新页面再次显示弹窗
    if (taskCompleted) {
      navigate(location.pathname, { replace: true });
    }
  }, [location]);

  // 根据是否为焦点任务分类
  const focusTasks = tasks.filter(task => task.is_focus_task);
  const regularTasks = tasks.filter(task => !task.is_focus_task);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    // 从本地存储获取粉丝信息和邀请码
    const fanInfo = localStorage.getItem('fanInfo');
    if (!fanInfo) {
      setError('未找到有效的用户信息，请返回首页重新登录');
      setLoading(false);
      setTasks([]);
      return;
    }

    const { invite_code: storedInviteCode } = JSON.parse(fanInfo);

    if (!storedInviteCode && !inviteCode) {
      setError('未找到有效的邀请码信息，无法加载任务列表');
      setLoading(false);
      setTasks([]);
      return;
    }

    try {
      const response = await axios.get('/api/fan/tasks', {
        params: {
          invite_code: storedInviteCode || inviteCode
        }
      });

      // 对任务按创建时间排序，最新的在前面
      setTasks(response.data.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      }));
    } catch (err) {
      console.error('获取任务列表失败:', err);
      setError(err.response?.data?.message || '获取任务列表失败，请稍后重试');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取鼓励内容
  const fetchEncouragementContent = async (taskId, points, urlNickname = null) => {
    try {
      // 从本地存储获取邀请码
      const fanInfo = localStorage.getItem('fanInfo');
      if (!fanInfo) return;

      const { invite_code: storedInviteCode } = JSON.parse(fanInfo);
      const usedInviteCode = storedInviteCode || inviteCode;

      if (!usedInviteCode) return;

      // 使用URL中的昵称参数或当前状态中的昵称
      const usedNickname = urlNickname || nickname;

      // 获取鼓励内容
      const response = await axios.get('/api/fan/encouragement', {
        params: {
          task_id: taskId,
          invite_code: usedInviteCode
        }
      });

      // 获取用户在任务中的排名
      const rankResponse = await axios.get(`/api/fan/leaderboard/${taskId}`, {
        params: {
          invite_code: usedInviteCode,
          fan_nickname: usedNickname
        }
      });

      // 查找当前用户的排名
      let rank = '-';
      if (rankResponse.data && rankResponse.data.user_info) {
        // 使用API返回的用户信息
        rank = rankResponse.data.user_info.rank || '-';
      } else if (rankResponse.data && Array.isArray(rankResponse.data)) {
        // 兼容旧版返回格式
        const userIndex = rankResponse.data.findIndex(item => item.nickname === usedNickname);
        if (userIndex !== -1) {
          rank = rankResponse.data[userIndex].rank;
        }
      }

      // 更新鼓励数据
      setEncouragementData({
        title: response.data.title || '恭喜你！',
        message: response.data.message || '你已成功完成任务！感谢你的付出和努力~',
        imageUrl: response.data.image_url || '',
        taskId: taskId,
        points: points || 0,
        rank: rank
      });

      // 显示鼓励弹窗
      setShowEncouragement(true);
    } catch (err) {
      console.error('获取鼓励内容失败:', err);
    }
  };

  // 退出登录
  const logout = () => {
    localStorage.removeItem('fanInfo');
    navigate('/');
  };

  const tabItems = [
    {
      key: 'tasks',
      label: '任务'
    },
    {
      key: 'leaderboard',
      label: '排行榜'
    }
  ];

  // 添加一个渲染任务状态emoji的函数
  const renderTaskStatusEmoji = (task) => {
    const emojis = [];

    // 焦点任务
    if (task.is_focus_task) {
      emojis.push(<span key="focus" title="焦点任务" className="mr-1">⭐</span>);
    }

    // 浴火模式
    if (task.flame_mode_enabled) {
      emojis.push(<span key="flame" title="浴火模式" className="mr-1">🔥</span>);
    }

    // 限时任务
    if (task.due_date) {
      emojis.push(<span key="time" title="限时任务" className="mr-1">⏰</span>);
    }

    return (
      <div className="flex items-center text-lg ml-2">
        {emojis}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 pb-12">
      {/* 顶部导航栏 */}
      <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* 左侧Logo/标题 */}
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center">
                <HeartOutlined style={{ color: 'white', fontSize: 18 }} />
              </div>
              <h1 className="ml-2 text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                未你
              </h1>
            </div>

            {/* 右侧用户信息 */}
            <div className="flex items-center">
              <span className="text-gray-600 mr-4">
                你好, {nickname}
              </span>
              <Button
                type="text"
                onClick={() => navigate('/fan/feedback')}
                className="text-sm text-gray-500 hover:text-pink-500 flex items-center mr-2"
              >
                意见反馈
              </Button>
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={logout}
                className="text-sm text-gray-500 hover:text-pink-500 flex items-center"
              >
                退出
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="container mx-auto px-4 py-6">
        {/* 标签页切换 */}
        <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm rounded-xl shadow-md mb-6">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            className="custom-tabs"
            items={tabItems}
          />
        </div>

        {/* 任务列表Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {loading && (
              <div className="flex justify-center py-12">
                <Spin size="large" />
                <p className="mt-4 text-gray-500">加载中...</p>
              </div>
            )}

            {!loading && error && (
              <Alert
                message={error}
                type="error"
                showIcon
                className="bg-red-50 text-red-500 text-center"
              />
            )}

            {!loading && !error && tasks.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="mt-4 text-gray-500">暂时没有任务哦~</p>
              </div>
            )}

            {!loading && !error && tasks.length > 0 && (
              <>
                {/* 焦点任务区域 */}
                {focusTasks.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center text-purple-700">
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        焦点任务
                      </span>
                    </h2>
                    <div className="grid gap-4">
                      {focusTasks.map(task => (
                        <Card
                          key={task.id}
                          className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-yellow-400"
                        >
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                            <div className="mb-4 md:mb-0 md:mr-6">
                              <div className="flex items-center">
                                <h3 className="text-xl font-bold text-purple-700">{task.title}</h3>
                                <Tag color="yellow" className="ml-2">焦点</Tag>
                                {renderTaskStatusEmoji(task)}
                              </div>
                              <p className="mt-2 text-gray-600">{task.description}</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Tag color="pink">积分: {task.points}</Tag>
                                {task.bonus_points > 0 && <Tag color="orange">奖励: +{task.bonus_points}</Tag>}
                                {task.due_date && (
                                  <Tag color="blue">
                                    截止: {new Date(task.due_date).toLocaleDateString()}
                                  </Tag>
                                )}
                                <Tag color="purple">提交: {task.submission_count || 0}</Tag>
                              </div>
                            </div>
                            <div className="flex flex-row space-x-2">
                              <Button
                                type="primary"
                                onClick={() => navigate(`/task/${task.id}`)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                </svg>
                                立即参与
                              </Button>
                              <Button
                                onClick={() => navigate(`/leaderboard/${task.id}`)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                排行榜
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* 常规任务列表 */}
                <h2 className="text-lg font-bold mb-4 flex items-center text-purple-700">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    全部任务
                  </span>
                </h2>
                <div className="grid gap-4">
                  {regularTasks.map(task => (
                    <Card
                      key={task.id}
                      className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div className="mb-4 md:mb-0 md:mr-6">
                          <div className="flex items-center">
                            <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
                            {renderTaskStatusEmoji(task)}
                          </div>
                          <p className="mt-2 text-gray-600">{task.description}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Tag color="pink">积分: {task.points}</Tag>
                            {task.bonus_points > 0 && <Tag color="orange">奖励: +{task.bonus_points}</Tag>}
                            {task.due_date && (
                              <Tag color="blue">
                                截止: {new Date(task.due_date).toLocaleDateString()}
                              </Tag>
                            )}
                            <Tag color="purple">提交: {task.submission_count || 0}</Tag>
                          </div>
                        </div>
                        <div className="flex flex-row space-x-2">
                          <Button
                            type="primary"
                            onClick={() => navigate(`/task/${task.id}`)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 focus:outline-none"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                            立即参与
                          </Button>
                          <Button
                            onClick={() => navigate(`/leaderboard/${task.id}`)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            排行榜
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* 排行榜Tab */}
        {activeTab === 'leaderboard' && (
          <LeaderboardTabs inviteCode={inviteCode} />
        )}
      </div>

      {/* 鼓励弹窗 */}
      <EncouragementPopup
        visible={showEncouragement}
        onClose={() => setShowEncouragement(false)}
        title={encouragementData.title}
        message={encouragementData.message}
        imageUrl={encouragementData.imageUrl}
        taskId={encouragementData.taskId}
        points={encouragementData.points}
        rank={encouragementData.rank}
        onViewLeaderboard={() => setActiveTab('leaderboard')}
      />

      <style>{`
        .custom-tabs .ant-tabs-nav::before {
          border-bottom: none;
        }

        .custom-tabs .ant-tabs-tab {
          font-size: 16px;
          padding: 12px 20px;
        }

        .custom-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #ff85c0;
          font-weight: 500;
        }

        .custom-tabs .ant-tabs-ink-bar {
          background: linear-gradient(to right, #ff85c0, #a239ca);
          height: 3px;
        }
      `}</style>
    </div>
  );
};

export default FanHome;

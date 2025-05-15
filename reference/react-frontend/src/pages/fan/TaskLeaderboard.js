import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button, Spin, Alert } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import LeaderboardTabs from '../../components/LeaderboardTabs';

const TaskLeaderboard = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubmitPrompt, setShowSubmitPrompt] = useState(false);
  const [taskDetails, setTaskDetails] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [currentFanNickname, setCurrentFanNickname] = useState('');
  const [leaderboardData, setLeaderboardData] = useState({
    top_list: [],
    self_info: {
      rank: 0,
      fan_nickname: '',
      points: 0,
      submission_count: 0
    }
  });

  // 只显示排名3以后的数据（因为前三名已经单独显示）
  const displayRankList = leaderboardData.top_list && leaderboardData.top_list.length > 3
    ? leaderboardData.top_list.slice(3)
    : [];

  useEffect(() => {
    // 获取URL查询参数或localStorage中的邀请码和昵称
    const searchParams = new URLSearchParams(location.search);
    const urlInviteCode = searchParams.get('invite_code');
    const urlNickname = searchParams.get('fan_nickname');

    // 从localStorage获取粉丝信息
    let storedNickname = '';
    let storedInviteCode = '';
    const fanInfo = localStorage.getItem('fanInfo');

    if (fanInfo) {
      try {
        const parsedInfo = JSON.parse(fanInfo);
        storedNickname = parsedInfo.nickname || '';
        storedInviteCode = parsedInfo.invite_code || '';
      } catch (e) {
        console.error('解析粉丝信息失败:', e);
      }
    }

    // 优先使用URL参数，其次使用localStorage中的值
    setCurrentFanNickname(urlNickname || storedNickname);
    setInviteCode(urlInviteCode || storedInviteCode);

    // 获取任务详情和排行榜数据
    if (taskId) {
      fetchTaskDetails(taskId, urlInviteCode || storedInviteCode);
      fetchLeaderboard(taskId, urlInviteCode || storedInviteCode, urlNickname || storedNickname);
    }

    // 设置定时刷新（每60秒）
    const refreshInterval = setInterval(() => {
      if (taskId) {
        fetchLeaderboard(taskId, urlInviteCode || storedInviteCode, urlNickname || storedNickname);
      }
    }, 60000);

    // 组件卸载时清除定时器
    return () => {
      clearInterval(refreshInterval);
    };
  }, [taskId, location]);

  const goBackToTaskList = () => {
    navigate('/fan/home');
  };

  const refreshLeaderboard = () => {
    fetchLeaderboard(taskId, inviteCode, currentFanNickname);
  };

  const fetchTaskDetails = async (taskId, inviteCode) => {
    if (!taskId || !inviteCode) {
      console.warn('任务ID或邀请码缺失，无法获取任务详情');
      return;
    }

    try {
      const response = await axios.get(`/api/fan/tasks/${taskId}`, {
        params: { invite_code: inviteCode }
      });
      setTaskDetails(response.data);
    } catch (err) {
      console.error('获取任务详情失败:', err);
      setError(`获取任务详情失败: ${err.response?.data?.message || err.message || '请稍后重试'}`);
    }
  };

  const fetchLeaderboard = async (taskId, fanInviteCode, fanNickname) => {
    setLoading(true);
    setError(null);

    if (!fanInviteCode) {
      setError('未找到邀请码，无法加载排行榜。');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`/api/fan/leaderboard/${taskId}`, {
        params: {
          fan_nickname: fanNickname || '',
          invite_code: fanInviteCode
        }
      });

      setLeaderboardData(response.data);

      // 如果没有当前用户数据，显示提示
      if (!fanNickname || (response.data.self_info && !response.data.self_info.fan_nickname)) {
        setShowSubmitPrompt(true);
      } else {
        setShowSubmitPrompt(false);
      }
    } catch (err) {
      console.error('获取排行榜失败:', err);
      setError(err.response?.data?.message || '获取排行榜数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 py-6">
      <div className="container mx-auto px-4">
        <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-xl shadow-xl max-w-4xl mx-auto p-6 overflow-hidden">
          {/* 顶部导航 */}
          <div className="flex items-center justify-between mb-6">
            <Button
              type="text"
              onClick={goBackToTaskList}
              icon={<ArrowLeftOutlined />}
              className="text-gray-600 hover:text-pink-600"
            >
              返回
            </Button>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              {taskDetails?.title || '任务'} 排行榜
            </h1>
            <Button
              type="text"
              onClick={refreshLeaderboard}
              icon={<ReloadOutlined />}
              loading={loading}
              className="text-purple-600 hover:text-purple-700"
            >
              {loading ? '刷新中' : '刷新'}
            </Button>
          </div>

          {/* 使用LeaderboardTabs组件 */}
          <LeaderboardTabs
            title="任务排行榜"
            type="task"
            taskId={taskId}
            inviteCode={inviteCode}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskLeaderboard;

import React, { useState, useEffect } from 'react';
import { Typography, Spin, Alert } from 'antd';
import axios from 'axios'; // 假设API接口用axios调用

const { Title } = Typography;

const LeaderboardTabs = ({ title, type = 'overall', taskId = null, inviteCode = null }) => {
  const [activeTab, setActiveTab] = useState(type);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUserNickname, setCurrentUserNickname] = useState('');

  // 定义可用标签
  const availableTabs = () => {
    // 根据配置返回可用的标签
    const tabs = [
      { label: '总榜', value: 'overall' },
      { label: '当日榜', value: 'daily' },
      { label: '焦点榜', value: 'focus' }
    ];

    // 如果提供了任务ID，添加单任务榜标签
    if (taskId) {
      tabs.push({ label: '任务榜', value: 'task' });
    }

    return tabs;
  };

  useEffect(() => {
    // 获取当前用户昵称
    const fanInfo = localStorage.getItem('fanInfo');
    if (fanInfo) {
      const { nickname } = JSON.parse(fanInfo);
      setCurrentUserNickname(nickname);
    }

    // 加载初始数据
    fetchLeaderboardData();

    // 设置定时刷新（每60秒）
    const refreshInterval = setInterval(() => {
      fetchLeaderboardData();
    }, 60000);

    // 组件卸载时清除定时器
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  // 监听标签变化，重新获取数据
  useEffect(() => {
    fetchLeaderboardData();
  }, [activeTab, taskId, inviteCode]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    setError('');

    // 获取邀请码
    let usedInviteCode = inviteCode;
    if (!usedInviteCode) {
      const fanInfo = localStorage.getItem('fanInfo');
      if (fanInfo) {
        const { invite_code } = JSON.parse(fanInfo);
        usedInviteCode = invite_code;
      }
    }

    if (!usedInviteCode) {
      setError('未找到有效的邀请码');
      setLoading(false);
      return;
    }

    try {
      let endpoint = '/api/fan/leaderboard';
      const params = { invite_code: usedInviteCode };

      // 根据不同的标签类型设置不同的参数
      switch (activeTab) {
        case 'daily':
          params.type = 'daily';
          break;
        case 'focus':
          params.type = 'focus';
          break;
        case 'task':
          if (!taskId) {
            throw new Error('需要任务ID才能查看任务排行榜');
          }
          params.type = 'task';
          params.task_id = taskId;
          break;
        default: // overall
          params.type = 'overall';
      }

      const response = await axios.get(endpoint, { params });
      setLeaderboardData(response.data || []);
    } catch (err) {
      console.error('获取排行榜数据失败:', err);
      setError(err.message || '获取排行榜数据失败，请稍后重试');
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  // 检查是否当前用户
  const isCurrentUser = (nickname) => {
    return nickname === currentUserNickname;
  };

  return (
    <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-xl shadow-lg p-5">
      {/* 标题区域 */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-purple-700">
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {title || '应援排行榜'}
          </span>
        </h2>

        {/* 排行榜切换标签 */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {availableTabs().map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === tab.value
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 排行榜内容 */}
      <div className="space-y-4">
        {/* 加载中状态 */}
        {loading && (
          <div className="py-8 text-center">
            <Spin size="large" />
            <p className="text-gray-500 mt-2">加载排行榜数据中...</p>
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="p-4 bg-red-50 text-red-500 rounded-lg"
          />
        )}

        {/* 排行榜说明 */}
        {!loading && !error && activeTab === 'daily' && (
          <Alert
            message="日榜说明"
            description="日榜仅统计今日提交任务获得的积分。总榜则累计所有历史积分。"
            type="info"
            showIcon
            className="mb-4"
          />
        )}

        {/* 空状态 */}
        {!loading && !error && leaderboardData.length === 0 && (
          <div className="py-10 text-center">
            <div className="bg-gray-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 mt-3">暂无排行榜数据</p>
            <p className="text-gray-400 text-sm mt-1">快来完成任务，领先一步吧~</p>
          </div>
        )}

        {/* 排行榜数据 */}
        {!loading && !error && leaderboardData.length > 0 && (
          <>
            {/* 排行榜表头 */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 font-medium text-sm text-gray-500 border-b">
              <div className="col-span-1">排名</div>
              <div className="col-span-5">昵称</div>
              {/* 成就列已隐藏，等待后续开发 */}
              {/* <div className="col-span-4">成就</div> */}
              <div className="col-span-3 text-right">完成任务</div>
              <div className="col-span-3 text-right">累计积分</div>
            </div>

            {/* 排行榜数据行 */}
            {leaderboardData.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors hover:bg-pink-50 border-b border-gray-100 ${
                  index < 3 ? 'bg-gradient-to-r from-pink-50 to-purple-50' : ''
                }`}
              >
                {/* 排名 */}
                <div className="col-span-1">
                  {index < 3 ? (
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        'bg-orange-100 text-orange-700'
                      }`}
                    >
                      <span className="font-bold">{index + 1}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">{index + 1}</span>
                  )}
                </div>

                {/* 粉丝昵称 */}
                <div className="col-span-5 font-medium truncate">
                  {item.nickname}
                  {isCurrentUser(item.nickname) && (
                    <span className="ml-1 text-xs bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full">
                      我
                    </span>
                  )}
                </div>

                {/* 成就徽章 - 已暂时隐藏，等待后续开发
                <div className="col-span-4 flex items-center space-x-1">
                  {index === 0 && (
                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                      ✨ 领头粉
                    </span>
                  )}
                  {item.points >= 1000 && (
                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                      🔥 超能
                    </span>
                  )}
                  {item.completed_tasks >= 10 && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      🏆 勤奋
                    </span>
                  )}
                  {item.has_focus_task_completed && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                      🌟 焦点
                    </span>
                  )}
                </div>
                */}

                {/* 完成任务数 */}
                <div className="col-span-3 text-right">
                  {item.completed_tasks || 0}
                </div>

                {/* 积分 */}
                <div className={`col-span-3 text-right font-semibold ${index < 3 ? 'text-pink-600' : ''}`}>
                  {item.points || 0}
                </div>
              </div>
            ))}
          </>
        )}

        {/* 提示信息 */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>排行榜数据每 10 分钟更新一次</p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardTabs;

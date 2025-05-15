import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const EncouragementPopup = ({
  visible,
  onClose,
  title,
  message,
  imageUrl,
  taskId,
  points,
  rank,
  onViewLeaderboard
}) => {
  const navigate = useNavigate();

  // 处理图片URL
  const getImageFullUrl = (relativePath) => {
    if (!relativePath) return '';

    const backendBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath; // 已经是完整的URL
    }
    return `${backendBaseUrl}${relativePath}`;
  };

  const handleViewLeaderboard = () => {
    if (onClose) onClose();
    if (onViewLeaderboard) onViewLeaderboard();

    // 如果有任务ID，跳转到任务排行榜
    if (taskId) {
      navigate(`/task/${taskId}/leaderboard`);
    }
  };

  const handleShare = () => {
    // 这里可以实现分享功能，如生成分享图片等
    // 简单的实现可以是复制一段文字到剪贴板
    const shareText = `我刚刚在未你完成了任务，获得了 ${points} 积分，当前排名第 ${rank}，一起来为爱豆应援吧！`;
    navigator.clipboard.writeText(shareText)
      .then(() => {
        alert('分享内容已复制到剪贴板，快去粘贴分享吧！');
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  // 自定义样式的模态框
  return (
    <Modal
      open={visible}
      footer={null}
      closable={true}
      onCancel={onClose}
      width={520}
      centered
      className="encouragement-popup"
      bodyStyle={{ padding: 0 }}
    >
      {/* 顶部渐变装饰 */}
      <div className="h-3 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500"></div>

      {/* 内容区域 */}
      <div className="p-6 pt-8 text-center">
        {/* 标题 */}
        <h3 className="text-2xl font-bold text-purple-700 mb-4">
          {title || '恭喜你！'}
        </h3>

        {/* 图片 (如果有) */}
        {imageUrl && (
          <div className="my-4 flex justify-center">
            <img
              src={getImageFullUrl(imageUrl)}
              alt={title || '鼓励图片'}
              className="max-h-60 mx-auto rounded-lg object-contain"
            />
          </div>
        )}

        {/* 内容文字 */}
        <div className="my-4 text-gray-600 leading-relaxed">
          <p>{message || '你已成功完成任务！感谢你的付出和努力~'}</p>
        </div>

        {/* 分享按钮 */}
        <div className="mt-6">
          <Button
            onClick={handleShare}
            className="flex items-center justify-center space-x-2 mx-auto px-6 py-2.5 bg-pink-100 text-pink-600 font-medium rounded-lg hover:bg-pink-200 transition-colors"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>分享成绩</span>
          </Button>
        </div>

        {/* 任务积分与排名信息 */}
        <div className="mt-8 bg-purple-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-purple-600 font-medium">获得积分</p>
              <p className="text-xl font-bold text-purple-700">{points || 0} <span className="text-xs">分</span></p>
            </div>
            <div className="text-center">
              <p className="text-sm text-purple-600 font-medium">当前排名</p>
              <p className="text-xl font-bold text-purple-700">{rank || '-'}</p>
            </div>
          </div>
        </div>

        {/* 查看排行榜按钮 */}
        <div className="mt-6">
          <Button
            onClick={handleViewLeaderboard}
            type="primary"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-all shadow-md hover:shadow-lg focus:outline-none"
            style={{ height: 'auto', padding: '12px 0' }}
          >
            查看排行榜
          </Button>
        </div>
      </div>

      {/* 底部装饰 */}
      <div className="bg-gray-50 px-6 py-3 text-center">
        <p className="text-sm text-gray-500">携手前行，见证爱豆的每一步成长</p>
      </div>

      <style>{`
        .encouragement-popup {
          position: relative;
          overflow: hidden;
        }

        .encouragement-popup::before {
          content: '';
          position: absolute;
          top: -10%;
          left: -10%;
          width: 120%;
          height: 120%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(30deg);
          animation: shimmer 3s infinite;
          pointer-events: none;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) rotate(30deg);
          }
          100% {
            transform: translateX(100%) rotate(30deg);
          }
        }
      `}</style>
    </Modal>
  );
};

export default EncouragementPopup;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import './App.css';

// 导入上下文
import { AuthProvider } from './contexts/AuthContext';

// 导入组件
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Tasks from './pages/Tasks';
import TaskForm from './pages/TaskForm';
import InviteCodes from './pages/InviteCodes';
import HomePage from './pages/HomePage';
import TaskSubmit from './pages/fan/TaskSubmit';
import TaskSubmissions from './pages/TaskSubmissions';
import SubmissionDetail from './pages/SubmissionDetail';
import EncouragementEditor from './pages/EncouragementEditor';
import TaskHistory from './pages/TaskHistory';
import Feedback from './pages/Feedback';

// 导入新组件
import FanLogin from './pages/fan/FanLogin';
import FanHome from './pages/fan/FanHome';
import TaskDetail from './pages/fan/TaskDetail';
import TaskLeaderboard from './pages/fan/TaskLeaderboard';
import UploadTest from './pages/fan/UploadTest';
import SimpleUploadForm from './pages/fan/SimpleUploadForm';
import ImageUploadTest from './pages/fan/ImageUploadTest';
import DailyReportManager from './pages/DailyReportManager';
import FanFeedback from './pages/fan/FanFeedback';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#ff85c0', // 修改为粉色系主题色
        },
        components: {
          // 组件级别的主题配置
        },
        // 启用兼容模式，解决React版本兼容性警告
        compatible: true
      }}
    >
      <AntdApp>
        <AuthProvider>
          <Router>
            <Routes>
              {/* 公共路由 */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />

              {/* 粉丝路由 */}
              <Route path="/fan/login" element={<FanLogin />} />
              <Route path="/fan/home" element={<FanHome />} />
              <Route path="/task/:taskId" element={<TaskDetail />} />
              <Route path="/task/:taskId/leaderboard" element={<TaskLeaderboard />} />
              <Route path="/leaderboard/:taskId" element={<TaskLeaderboard />} />
              <Route path="/fan/task-submit" element={<TaskSubmit />} />
              <Route path="/upload-test" element={<UploadTest />} />
              <Route path="/fan/simple-upload-form" element={<SimpleUploadForm />} />
              <Route path="/fan/image-upload-test" element={<ImageUploadTest />} />
              <Route path="/fan/feedback" element={<FanFeedback />} />

              {/* 控制台路径重定向到任务管理 */}
              <Route path="/dashboard" element={<Navigate to="/tasks" replace />} />
              <Route path="/admin/dashboard" element={<Navigate to="/tasks" replace />} />

              {/* 受保护的路由 - 需要登录 */}
              <Route path="/" element={<PrivateRoute />}>
                <Route path="/" element={<Navigate to="/tasks" replace />} />
                <Route path="/dashboard" element={<Navigate to="/tasks" replace />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/tasks/create" element={<TaskForm />} />
                <Route path="/tasks/edit/:id" element={<TaskForm />} />
                <Route path="/invite-codes" element={<InviteCodes />} />
                <Route path="/submissions/:taskId" element={<TaskSubmissions />} />
                <Route path="/submission/:submissionId" element={<SubmissionDetail />} />
                <Route path="/encouragement-settings" element={<EncouragementEditor />} />
                <Route path="/task-history" element={<TaskHistory />} />
                <Route path="/feedback" element={<Feedback />} />
              </Route>
              <Route
                path="/admin/daily-reports"
                element={
                  <PrivateRoute>
                    <DailyReportManager />
                  </PrivateRoute>
                }
              />

              {/* 重定向 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;

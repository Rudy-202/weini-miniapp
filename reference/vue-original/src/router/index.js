import { createRouter, createWebHistory } from 'vue-router';
import FanHome from '../views/FanHome.vue';
import AdminLogin from '../views/AdminLogin.vue'
// import AdminTasks from '../views/AdminTasks.vue' // No longer top-level
import AdminNewTask from '../views/AdminNewTask.vue'
import AdminHistory from '../views/AdminHistory.vue'
import TaskDetail from '../views/TaskDetail.vue'
import Leaderboard from '../views/Leaderboard.vue'
// import AdminHome from '../views/AdminHome.vue' // Likely unused or to be a child
import AdminTaskDetail from '../views/AdminTaskDetail.vue'
import AdminParticipantSubmissions from '../views/AdminParticipantSubmissions.vue'
import AdminTaskList from '../views/AdminTaskList.vue'
import Home from '../views/Home.vue'
import TaskLeaderboard from '../views/TaskLeaderboard.vue'
import AdminInviteCodeManager from '../views/admin/AdminInviteCodeManager.vue'
import AdminEncouragementEditor from '../views/admin/AdminEncouragementEditor.vue'
import LandingPage from '../views/LandingPage.vue'
import AdminLayout from '../layouts/AdminLayout.vue'; // 新增导入
import DailyReportManager from '../views/admin/DailyReportManager.vue'; // 新增导入
import MilestoneTaskManager from '../views/admin/MilestoneTaskManager.vue'; // <--- 新增导入
import MilestoneTaskDetail from '../views/admin/MilestoneTaskDetail.vue'; // <--- 新增导入

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage
  },
  {
    path: '/fan/entry',
    name: 'FanEntry',
    component: Home
  },
  {
    path: '/fan/home',
    name: 'FanHome',
    component: FanHome
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  // 新增 Admin Layout 作为父路由
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '', // 默认子路由，例如重定向到任务列表或显示一个仪表盘
        name: 'AdminDashboard', // 或者 AdminRoot
        redirect: '/admin/task-list', // 重定向到任务列表
        // component: AdminHome, // 如果有一个 AdminHome/Dashboard 页面
      },
      {
        path: 'task-list', // 路径变为相对的
        name: 'AdminTaskList',
        component: AdminTaskList,
        // meta: { requiresAuth: true } // 父路由已包含，子路由可省略或保留
      },
      // {
      //   path: 'tasks', // 原 '/admin/tasks'，如果 AdminTasks.vue 仍在使用且不同于 AdminTaskList
      //   name: 'admin-tasks', // 保持原名或更改
      //   component: AdminTasks
      // },
      {
        path: 'tasks/new',
        name: 'AdminNewTask',
        component: AdminNewTask,
      },
      {
        path: 'history',
        name: 'AdminHistory',
        component: AdminHistory,
      },
      {
        path: 'task/:id',
        name: 'AdminTaskDetail',
        component: AdminTaskDetail,
      },
      {
        path: 'task/:taskId/participant/:participantName',
        name: 'AdminParticipantSubmissions',
        component: AdminParticipantSubmissions,
      },
      {
        path: 'invite-codes',
        name: 'AdminInviteCodeManager',
        component: AdminInviteCodeManager,
      },
      {
        path: 'encouragements',
        name: 'AdminEncouragementEditor',
        component: AdminEncouragementEditor,
      },
      { // 新增日报管理路由
        path: 'daily-reports',
        name: 'AdminDailyReportManager',
        component: DailyReportManager,
      },
      { // <--- 新增里程碑任务管理路由
        path: 'milestone-tasks',
        name: 'AdminMilestoneTaskManager',
        component: MilestoneTaskManager,
      },
      { // <--- 新增里程碑任务详情页路由
        path: 'milestone-tasks/:milestoneId',
        name: 'AdminMilestoneTaskDetail',
        component: MilestoneTaskDetail,
        props: true, // 允许将路由参数作为 props 传递给组件
      }
    ]
  },
  // 非管理员路由保持不变
  {
    path: '/task/:id',
    name: 'TaskDetail',
    component: TaskDetail
  },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: Leaderboard
  },
  {
    path: '/fan/history',
    name: 'FanHistory',
    component: AdminHistory // 注意：这个之前指向 AdminHistory，可能需要确认是否正确
  },
  {
    path: '/task/:id/leaderboard',
    name: 'TaskLeaderboard',
    component: TaskLeaderboard
  }
  // 原有的 /admin/... 路由已经被移到 AdminLayout 的 children 中，所以这里不需要它们了
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const expiresAt = localStorage.getItem('token_expires_at');
  const isTokenExpired = expiresAt ? Date.now() > parseInt(expiresAt) : true;

  // console.log('路由守卫触发:', {
  //   to: to.path,
  //   from: from.path,
  //   requiresAuth: to.matched.some(record => record.meta.requiresAuth),
  //   currentAuth: {
  //     hasToken: !!token,
  //     isAdmin,
  //     expiresAt: expiresAt ? new Date(parseInt(expiresAt)).toISOString() : null,
  //     isTokenExpired
  //   }
  // });

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (to.name === 'AdminLogin') {
    if (token && isAdmin && !isTokenExpired) {
      next({ name: 'AdminTaskList' }); // 登录后跳转到任务列表 (嵌套路由名)
    } else {
      next();
    }
  } else if (requiresAuth) {
    if (!token || !isAdmin || isTokenExpired) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('token_expires_at');
      next({
        name: 'AdminLogin',
        query: { redirect: to.fullPath }
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;

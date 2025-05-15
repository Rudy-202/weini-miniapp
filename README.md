# 未你任务管理系统 - 小程序版

基于uni-app的饭圈粉丝任务管理小程序，支持微信小程序平台。

## 项目结构

```
weini-miniapp/
├── src/                       # 源代码目录
│   ├── api/                   # API请求模块
│   │   ├── request.ts         # 请求工具
│   │   ├── user.ts            # 用户相关API
│   │   ├── task.ts            # 任务相关API
│   │   └── admin.ts           # 管理员相关API
│   ├── components/            # 公共组件
│   ├── pages/                 # 主包页面
│   │   ├── index/             # 首页
│   │   └── login/             # 登录页
│   ├── packageFan/            # 粉丝端分包
│   │   └── pages/             # 粉丝端页面
│   ├── packageAdmin/          # 管理员端分包
│   │   └── pages/             # 管理员端页面
│   ├── static/                # 静态资源
│   │   └── images/            # 图片资源
│   ├── store/                 # 状态管理
│   │   ├── index.ts           # Pinia入口
│   │   ├── user.ts            # 用户状态
│   │   └── task.ts            # 任务状态
│   ├── styles/                # 样式文件
│   │   └── index.scss         # 全局样式
│   ├── utils/                 # 工具函数
│   │   └── index.ts           # 工具函数集合
│   ├── App.vue                # 应用入口组件
│   └── main.ts                # 主入口文件
├── pages.json                 # 页面路由配置
├── manifest.json              # 小程序配置
├── package.json               # 项目依赖
└── tsconfig.json              # TypeScript配置
```

## 功能特性

- 粉丝端功能
  - 邀请码登录
  - 任务列表和详情查看
  - 任务提交
  - 排行榜

- 管理员端功能
  - 账号密码登录
  - 数据统计仪表盘
  - 任务管理
  - 邀请码管理
  - 任务审核

## 开发环境

- Node.js 16.x 或更高
- 微信开发者工具

## 开发命令

```bash
# 安装依赖
npm install

# 微信小程序开发
npm run dev:mp-weixin

# 微信小程序构建
npm run build:mp-weixin
```

## 项目进度

- [x] 第1阶段：项目初始化与基础设置
- [ ] 第2阶段：核心组件开发
- [ ] 第3阶段：主包和公共页面开发
- [ ] 第4阶段：粉丝端开发
- [ ] 第5阶段：管理员端开发
- [ ] 第6阶段：测试与优化
- [ ] 第7阶段：发布上线 
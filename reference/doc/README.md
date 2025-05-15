# 微博转赞评任务管理系统

## 系统介绍

这是一个多用户任务管理系统，主要用于饭圈粉丝提交微博转赞评、B站刷播放量等任务。该系统包含站子管理员和粉丝两种角色，提供了任务创建、任务提交、焦点任务管理和排行榜等功能。

## 主要功能

1. **用户角色**
   - 站子管理员：创建和管理任务、查看粉丝提交情况、自定义鼓励内容
   - 粉丝：提交任务完成证明、查看排行榜

2. **任务管理**
   - 任务创建和编辑
   - 焦点任务设置（24小时内同一邀请码下只能有一个焦点任务）
   - 任务提交和审核

3. **排行榜系统**
   - 总排行榜：显示所有粉丝的总积分排名
   - 当日排行榜：显示当天提交任务的粉丝排名
   - 焦点任务排行榜：显示焦点任务的粉丝排名
   - 单任务排行榜：显示特定任务的粉丝排名

4. **鼓励系统**
   - 粉丝提交任务后显示鼓励弹窗
   - 站子管理员可自定义鼓励内容（图片和文字）

## 最新更新内容

### 饭圈文化风格设计升级

1. **界面设计改进**
   - 全新的粉色系渐变背景设计
   - 更友好、更温馨的用户界面
   - 饭圈文化元素融入，如爱心图标、鼓励文案等
   - 精美的卡片设计和动画效果

2. **新版粉丝流程**
   - 粉丝入口更直观，需输入邀请码和昵称
   - 粉丝主页集成任务列表和排行榜
   - 任务提交后显示精美鼓励弹窗，并跳转到排行榜

3. **排行榜系统优化**
   - 新增四种排行榜类型（总榜、当日榜、焦点榜和单任务榜）
   - 排行榜展示更生动，前三名特殊显示
   - 显示个人成就和徽章系统

4. **鼓励系统完善**
   - 任务提交后的鼓励弹窗更加精美
   - 支持自定义的鼓励内容和图片
   - 引导用户查看排行榜和分享成绩

## 技术栈

- 前端：Vue 3 + Tailwind CSS
- 后端：Flask + SQLite
- API：RESTful API

## 文件结构

- `/src` - 前端源代码
  - `/components` - 组件
  - `/views` - 页面
  - `/router` - 路由配置
  - `/utils` - 工具函数
  - `/stores` - 状态管理
  - `/assets` - 静态资源
- `/backend` - 后端API
- `/public` - 静态文件
- `/uploads` - 上传文件存储

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

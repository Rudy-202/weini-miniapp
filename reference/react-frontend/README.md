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

## 组件结构

- `components/LeaderboardTabs.js` - 排行榜标签页组件，支持多种排行榜类型
- `components/EncouragementPopup.js` - 鼓励弹窗组件，任务完成后显示
- `pages/HomePage.js` - 主页，包含平台简介和入口
- `pages/fan/FanLogin.js` - 粉丝登录页面
- `pages/fan/FanHome.js` - 粉丝主页，包含任务列表和排行榜
- `pages/fan/TaskDetail.js` - 任务详情页，粉丝提交任务
- `pages/fan/TaskLeaderboard.js` - 任务排行榜页面

## 技术栈

- 前端：React + Ant Design + Tailwind CSS
- 后端：Express.js + MongoDB
- API：RESTful API

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 构建生产版本
npm run build
```

## 后续开发计划

1. 添加用户成就系统
2. 完善数据统计和图表展示
3. 增加移动端适配
4. 优化图片上传和处理

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

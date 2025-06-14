# 2D 第三人称自动瞄准射击游戏

一款基于HTML5 Canvas和JavaScript开发的2D射击游戏，具有自动瞄准功能和现代游戏体验。

## 🎮 游戏特性

### 核心玩法
- **自动瞄准系统**: 智能锁定最近的敌人
- **流畅的角色控制**: WASD键控制角色移动
- **动态敌人生成**: 敌人从地图边缘随机生成并追踪玩家
- **实时战斗**: 自动射击系统，专注于策略性移动

### 视觉效果
- **粒子系统**: 敌人被击败时的爆炸特效
- **瞄准指示**: 绿色瞄准线和目标标记
- **现代UI**: 深色主题，实时显示生命值、得分和敌人数量
- **网格背景**: 增强空间感的科技风格背景

### 游戏机制
- **生命系统**: 玩家有100点生命值
- **得分系统**: 击败敌人获得分数
- **难度递增**: 随时间推移敌人生成速度加快
- **碰撞检测**: 精确的物理碰撞系统

## 🚀 快速开始

### 运行游戏

1. **克隆仓库**
   ```bash
   git clone git@github.com:ObcTech/2d-shooting-game3.git
   cd 2d-shooting-game3
   ```

2. **启动本地服务器**
   ```bash
   # 使用Python
   python -m http.server 8000
   
   # 或使用Node.js
   npx http-server
   
   # 或使用PHP
   php -S localhost:8000
   ```

3. **打开浏览器**
   访问 `http://localhost:8000` 开始游戏

### 游戏操作

| 操作 | 说明 |
|------|------|
| `W` `A` `S` `D` | 角色移动 |
| 鼠标移动 | 查看瞄准方向（仅显示用） |
| 自动瞄准 | 系统自动锁定最近敌人 |
| 自动射击 | 系统自动向目标射击 |

## 📁 项目结构

```
2d-shooting-game3/
├── index.html              # 游戏主页面
├── game.js                 # 游戏核心逻辑
├── README.md               # 项目说明文档
├── 项目开发计划书.md        # 详细开发计划
└── .git/                   # Git版本控制
```

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **图形渲染**: Canvas 2D API
- **架构模式**: 面向对象编程 (OOP)
- **版本控制**: Git
- **部署**: 静态文件服务器

## 🎯 核心类说明

### Game 类
主游戏控制器，负责:
- 游戏循环管理
- 事件监听
- 对象生命周期管理
- 碰撞检测
- UI更新

### Player 类
玩家角色，包含:
- 移动控制
- 自动射击逻辑
- 生命值管理
- 渲染方法

### Enemy 类
敌人实体，具有:
- AI追踪算法
- 自动寻路
- 碰撞体积
- 视觉表现

### Bullet 类
子弹对象，实现:
- 物理运动
- 轨迹渲染
- 生命周期管理

### Particle 类
粒子效果，提供:
- 爆炸动画
- 渐变效果
- 物理模拟

## 🔧 开发指南

### 本地开发

1. **修改代码**: 直接编辑 `game.js` 或 `index.html`
2. **刷新浏览器**: 查看更改效果
3. **调试**: 使用浏览器开发者工具

### 添加新功能

参考 `项目开发计划书.md` 中的开发路线图，按阶段实现新功能。

### 代码规范

- 使用ES6+语法
- 遵循面向对象设计原则
- 保持代码注释清晰
- 变量和函数命名语义化

## 🎨 自定义配置

### 游戏平衡性调整

在 `game.js` 中可以调整以下参数:

```javascript
// 玩家属性
this.speed = 4;           // 移动速度
this.health = 100;        // 初始生命值
this.shootCooldown = 15;  // 射击间隔

// 敌人属性
this.speed = 1.5;         // 敌人移动速度
this.enemySpawnInterval = 120; // 生成间隔

// 子弹属性
this.speed = 8;           // 子弹速度
this.radius = 3;          // 子弹大小
```

### 视觉效果调整

```javascript
// 颜色配置
player: '#4ecdc4'         // 玩家颜色
enemy: '#ff6b6b'          // 敌人颜色
bullet: '#feca57'         // 子弹颜色
aimLine: '#00ff00'        // 瞄准线颜色
```

## 🚧 已知问题

- [ ] 大量敌人时可能出现性能下降
- [ ] 移动端触控支持待完善
- [ ] 音效系统尚未实现

## 🗺️ 开发路线图

查看 `项目开发计划书.md` 了解详细的开发计划，包括:

- ✅ **第一阶段**: 核心功能优化
- 🔄 **第二阶段**: 游戏机制扩展
- ⏳ **第三阶段**: 关卡和场景系统
- ⏳ **第四阶段**: 高级功能
- ⏳ **第五阶段**: 优化和完善

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🎮 在线体验

- **GitHub Pages**: [在线游戏地址](https://obctech.github.io/2d-shooting-game3/)
- **仓库地址**: [GitHub Repository](https://github.com/ObcTech/2d-shooting-game3)

## 📞 联系方式

如有问题或建议，请通过以下方式联系:

- 创建 [Issue](https://github.com/ObcTech/2d-shooting-game3/issues)
- 发送邮件至项目维护者

---

**享受游戏！** 🎯🔫💥
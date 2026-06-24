<div align="center">

# 🏰 塔防 Web（Tower Defense Web）

> 一款基于自研 Canvas 2D 引擎、React 18 与 TypeScript 构建的像素风塔防游戏 —— 内置 5 个手工关卡、3 种塔、5 种敌人、A\* 寻路与对象池化游戏循环，稳定运行于 60 FPS。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-21B357?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](./LICENSE)
[![GitHub Repo](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/NOSOLUTIONLOVE/Web_Game_06_Tower_Defense)

**[English](README.md)** · **[中文](README.zh-CN.md)**

<br />

[在线演示](#在线演示) · [核心特性](#核心特性) · [玩法说明](#玩法说明) · [快速开始](#快速开始) · [项目架构](#项目架构) · [技术栈](#技术栈) · [测试](#测试) · [后续规划](#后续规划) · [许可证](#许可证)

</div>

---

## 🌟 项目简介

**塔防 Web** 是一款浏览器策略游戏：玩家在网格地图上建造防御塔，阻止一波波敌人抵达基地。这是我个人 Web Game 系列的第 6 个项目，采用"v2.0 质量优先栈"工程化实现 —— 自研的框架无关游戏引擎与 React UI 层严格分离，全程 TypeScript 强类型，并由单元测试守护。

该项目展示了一条完整的游戏开发流水线：从自研 Canvas 2D 像素风渲染器、A\* 寻路，到波次 / 经济 / 战斗系统，再到 Vercel 部署。它被设计为一份作品集案例，在小而聚焦的代码库中体现生产级工程实践。

---

## 🎮 在线演示

本项目作为静态 SPA 部署在 Vercel，可在任意现代桌面浏览器中打开：

> **部署地址：** 首次部署后在此填入你的 Vercel 链接（例如 `https://web-game-06-tower-defense.vercel.app`）

**30 秒本地试玩：**

```bash
git clone git@github.com:NOSOLUTIONLOVE/Web_Game_06_Tower_Defense.git
cd Web_Game_06_Tower_Defense/tower-defense
npm install
npm run dev
# 打开 http://localhost:5173
```

---

## 🎯 核心特性

### 玩法系统

- **5 个手工关卡** —— 每关配备独特的 16×12 网格地图、自定义路径布局与调校过的波次序列。难度从教学关（直行 + 一个弯）逐步爬升到多弯迷宫 + Boss 波。
- **3 种塔 × 3 级升级 = 9 套配置**
  - **弓手塔 Archer**（单体 DPS，平衡型）—— 翠绿色
  - **减速塔 Frost**（施加减速 debuff，控场型）—— 天蓝色
  - **范围炮塔 Cannon**（溅射 AOE 伤害，慢速重击）—— 橙色
  - 每座塔可在场上升级两次，升级会提升伤害、射程、攻速与效果强度。
- **5 种敌人类型**，属性与行为各异
  - **普通 Normal** —— 血量 / 速度均衡（红色）
  - **快速 Fast** —— 低血量高速度，易突破薄弱防线（黄色）
  - **重甲 Heavy** —— 高血量慢速，需要集火（紫色）
  - **飞行 Flying** —— 绕过地面路径，需要防空塔（青色）
  - **Boss** —— 1000 血，仅在 Boss 波出现，击杀奖励 100 金币（深红）
- **波次系统** —— 每关固定波数，敌人组合可配置，出怪间隔与波间准备时间均可调。每清完一波获得金币奖励，Boss 波奖励更高。
- **经济系统** —— 击杀与波次奖励产出金币，用于建塔 / 升级。出售塔可返还累计投入的 70%。
- **胜负条件** —— 在至少 1 条生命下撑过所有波次即胜利。每个抵达基地的敌人扣 1 条生命，归零则失败。最终得分 = `剩余生命 × 100 + 剩余金币`。

### 引擎与技术

- **自研 Canvas 2D 像素风渲染器** —— 每格以 8×8 个 5 像素块绘制，呈现真正的像素质感。Sprite 预渲染到离屏 canvas，通过 `drawImage` 提速。DPR 自适应，Retina 屏下依然锐利。
- **A\* 寻路** —— 8 方向 A\*，禁止对角穿墙角，欧几里得启发式。16×12 网格求解耗时 < 1 ms。
- **对象池** —— 泛型 `Pool<T>` 复用敌人、子弹与粒子，避免重波次下的 GC 抖动。
- **固定步长主循环** —— 60 Hz 固定更新 + `requestAnimationFrame`，与渲染速率解耦。支持 1× 与 2× 时间倍率。
- **Web Audio API 音效** —— 9 种合成音效（建塔、升级、出售、射击 × 3、击中、击杀、波次开始、胜利、失败、点击），全部由正弦 / 三角 / 锯齿波合成，零外部音频资源。
- **粒子系统** —— 受击闪烁、击杀爆炸、建造 / 升级 / 出售烟雾、浮动伤害数字。
- **状态机** —— 显式阶段：`menu → levelSelect → playing ↔ betweenWaves → paused → win / over`。
- **进度持久化** —— 关卡解锁、通关状态、最佳分数保存到 `localStorage`（隐私模式 / 配额超限下安全降级）。
- **类型安全配置** —— 所有可调参数集中在单一 `config` 模块，运行时由 Zod schema 校验。

### 交互与界面

- **像素风视觉语言** —— 地图、塔、敌人、UI 风格统一。
- **响应式 HUD** —— 顶栏显示生命、金币、当前波次 / 总波次。底部动作栏用于塔选择、波次控制、暂停与倍速切换。
- **建造预览** —— 鼠标悬停可建造格时显示绿色预览与塔的射程圈；不可建造格显示红色。
- **塔选择面板** —— 点击空地打开塔选择器；点击已建塔可升级或出售。
- **键盘快捷键** —— `空格` 暂停 / 继续，`2` 切换 2× 倍速。
- **动画覆盖层** —— 主菜单、关卡选择、暂停、胜利、失败弹窗均由 Framer Motion 驱动。
- **设置面板** —— 一键开关音效。
- **暗色主题** —— 默认暗色 UI（`zinc-950` 背景），适合长时间游玩。

### 质量与工具链

- **7 套单元测试** —— Vitest + happy-dom，覆盖战斗、经济、波次、敌人、塔、地图网格与寻路。
- **TypeScript 严格模式** —— 端到端类型安全，引擎层无 `any`。
- **ESLint + Prettier** —— 强制代码风格与 React Hooks 规则。
- **Vercel 开箱即用** —— `vercel.json` 配置 SPA rewrites，刷新子路由不会 404。

---

## 🎹 玩法说明

### 如何游玩

1. **选择关卡** —— 在关卡选择界面挑选。初始仅解锁第 1 关，通关后解锁下一关。
2. **建造防御塔** —— 在草地（空格）上建塔。点击草地 → 从底部面板选塔 → 确认。建造预览会显示该塔的攻击范围。
3. **启动波次** —— 点击 `▶ Start Wave`。敌人从绿色 `S` 标记出生，沿路径走向红色 `E` 标记（你的基地）。
4. **升级或出售** —— 点击已建塔可升级或出售。升级会提升伤害 / 射程 / 效果；出售返还累计投入的 70%。
5. **撑过所有波次** —— 在不损失全部 20 条生命的前提下通关。每个抵达基地的敌人扣 1 条生命。
6. **刷新最高分** —— 得分 = `剩余生命 × 100 + 剩余金币`。最佳分数跨会话持久化。

### 策略建议

- **弓手塔** 在前期波次性价比最高；**减速塔** 对快速与飞行敌人效果显著；**炮塔** 在 Heavy / Boss 集群波中表现最佳。
- 把 **减速塔** 放在路径拐弯处（敌人会聚集），再用 **炮塔** 覆盖拐弯以最大化 AOE 价值。
- 前期不要过度投入 —— 留一些金币应对 Boss 波的紧急升级。
- 用 2× 倍速快速过简单波，Boss 波时切回 1× 以便微操升级。

### 计分规则

| 事件 | 奖励 |
|------|------|
| 击杀普通敌人 | +10 金币 |
| 击杀快速敌人 | +15 金币 |
| 击杀重甲敌人 | +25 金币 |
| 击杀飞行敌人 | +20 金币 |
| 击杀 Boss | +100 金币 |
| 清完一波 | +25 金币（普通波）/ +100 金币（Boss 波） |
| 最终得分 | `剩余生命 × 100 + 剩余金币` |

---

## 🚀 快速开始

### 前置依赖

- **Node.js ≥ 18**（已在 18 LTS 与 20 LTS 上测试）
- **npm ≥ 9**（或 pnpm / yarn，自行调整命令）

### 安装与运行

```bash
# 1. 克隆仓库
git clone git@github.com:NOSOLUTIONLOVE/Web_Game_06_Tower_Defense.git
cd Web_Game_06_Tower_Defense/tower-defense

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
# → http://localhost:5173

# 4.（可选）运行测试
npm test

# 5.（可选）生产构建
npm run build
npm run preview   # 本地预览生产构建
```

### 部署到 Vercel

仓库已包含 `vercel.json`（SPA rewrites）。两种部署方式：

- **CLI：** 在 `tower-defense/` 目录下执行 `npx vercel`。
- **Dashboard：** 在 [vercel.com](https://vercel.com) 导入仓库，将 Root Directory 设为 `tower-defense`，接受自动识别的 Vite 预设即可。

---

## 🏛️ 项目架构

代码库严格分离 **引擎层**（框架无关的游戏逻辑）与 **UI 层**（React 表现层）。引擎层零 React 引用，可被任意其他渲染器复用（例如 Phaser 移植或服务端权威多人分支）。

```
tower-defense/
├── src/
│   ├── config/              # 所有可调参数的单一数据源
│   │   ├── index.ts         #   GameConfig schema (Zod) + 类型定义
│   │   ├── towers.ts        #   3 塔 × 3 级 = 9 套配置
│   │   └── enemies.ts       #   5 种敌人配置
│   │
│   ├── engine/              # 框架无关游戏引擎（无 React）
│   │   ├── GameEngine.ts    #   编排器：主循环 + 状态机
│   │   ├── Renderer.ts      #   Canvas 2D 像素风渲染器
│   │   ├── MapGrid.ts       #   网格模型 + 格子查询
│   │   ├── PathFinder.ts    #   A*（8 方向，禁止穿墙角）
│   │   ├── Pool.ts          #   泛型对象池
│   │   ├── Input.ts         #   Canvas 输入处理
│   │   ├── RenderSnapshot.ts#   不可变帧快照，供 React UI 读取
│   │   ├── entities/        #   Enemy / Tower / Projectile / Particle
│   │   ├── systems/         #   Combat / Economy / Wave / Particle 系统
│   │   ├── levels/          #   5 个内置地图 + 波次 + 进度持久化
│   │   └── __tests__/       #   7 套 Vitest 测试
│   │
│   ├── components/          # React UI 层
│   │   ├── ui/              #   shadcn/ui 基础组件（button, dialog, ...）
│   │   ├── TowerDefenseGame.tsx  # 根游戏组件
│   │   ├── GameCanvas.tsx        # Canvas 宿主 + RAF 桥接
│   │   ├── HUD.tsx               # 顶部状态栏
│   │   ├── ActionBar.tsx         # 底部塔 / 波次控制
│   │   ├── TowerPanel.tsx        # 塔选择 / 升级 / 出售
│   │   ├── MainMenu.tsx          # 标题界面
│   │   ├── LevelSelect.tsx       # 关卡网格
│   │   ├── SettingsPanel.tsx     # 音效开关
│   │   └── ...                   # 胜利 / 失败 / 暂停覆盖层、Footer 等
│   │
│   ├── store/
│   │   └── useGameStore.ts  # Zustand store，桥接引擎 → UI
│   │
│   ├── lib/
│   │   ├── audio.ts         # Web Audio API 音效合成器（9 种效果）
│   │   ├── storage.ts       # 安全的 localStorage 封装
│   │   └── utils.ts         # 共享工具（cn 等）
│   │
│   ├── App.tsx              # React 根
│   ├── main.tsx             # 入口
│   └── index.css            # Tailwind + 全局样式
│
├── public/                  # 静态资源（favicon）
├── index.html               # HTML 外壳
├── vite.config.ts           # Vite 配置
├── vitest.config.ts         # 测试配置（happy-dom 环境）
├── tailwind.config.ts       # Tailwind 主题
├── tsconfig.json            # TS 严格配置
├── vercel.json              # Vercel SPA rewrites
└── package.json
```

### 引擎与 UI 的桥接

引擎每帧产出不可变的 `RenderSnapshot`；React 通过 Zustand store 读取快照，仅重渲染受影响的 UI 组件。Canvas 本身由引擎的 `Renderer` 直接绘制，绕过 React 的 reconciler，保证 60 FPS 的游戏热路径不被 React 拖慢。这样 React 专注于它擅长的部分（菜单、弹窗、HUD），而热路径留在原生 Canvas 中。

### 状态机

```
MENU ──start──▶ LEVEL_SELECT ──select──▶ PLAYING ──pause──▶ PAUSED
                     ▲                       │                  │
                     │                       │                  │ resume
                     │                       ▼                  ▼
                     │                  BETWEEN_WAVES ◀──────────┘
                     │                       │
                     │                  nextWave / clear
                     │                       ▼
                     └────────────────── WIN / OVER
```

---

## 🛠️ 技术栈

| 层 | 选型 | 理由 |
|----|------|------|
| **语言** | TypeScript 5.4（严格模式） | 端到端类型安全；引擎层无 `any` |
| **UI 框架** | React 18 | 组件模型适合菜单、HUD 与覆盖层 |
| **构建工具** | Vite 5 | 快速 HMR、原生 ESM、零配置 TS |
| **样式** | Tailwind CSS 3 + shadcn/ui（Radix） | 工具类优先 + 可访问的基础组件 |
| **状态** | Zustand 4 | 极简、无样板代码，适合引擎 → UI 桥接 |
| **游戏循环** | 自研 Canvas 2D + RAF | 完全掌控渲染管线，不绑定引擎 |
| **动画** | Framer Motion 11 | UI 过渡与弹窗动画 |
| **表单 / 校验** | react-hook-form + Zod | 类型安全的运行时配置校验 |
| **音频** | Web Audio API（合成） | 零资源体积，9 种音效全部由振荡器生成 |
| **存储** | localStorage（安全封装） | 进度持久化，配额 / 隐私模式降级 |
| **测试** | Vitest 1 + happy-dom | 引擎系统的快速单元测试 |
| **Lint / 格式化** | ESLint 8 + Prettier 3 | 强制风格与 React Hooks 规则 |
| **部署** | Vercel | 零配置静态 SPA 托管 + rewrites |

---

## 💡 架构决策说明

以下几处非显而易见的设计选择，值得向作品集评审者说明：

1. **不使用 Phaser / 不使用游戏框架。** PRD 给出了 Phaser 3 与原生 Canvas 2D 两个选项。我选择原生 Canvas，以完整展示对渲染管线、Sprite 缓存与游戏循环的理解 —— 这些技能可迁移到任何引擎。
2. **引擎 / UI 隔离。** `engine/` 目录零 React 引用。这让引擎可移植（可用于 Phaser 移植、服务端权威多人分支或 React Native 移植），并保证热路径免受 React reconciler 开销。
3. **配置单一数据源。** 所有可调数值（网格尺寸、经济、战斗常量、颜色）集中在 `src/config/index.ts`，并由 Zod schema 校验。数值平衡调整只需改一个文件。
4. **默认对象池化。** 敌人、子弹、粒子全部走对象池。对当前敌人规模而言是过度设计，但展示了正确的扩展模式 —— 可平滑支撑 100+ 同屏实体。
5. **合成音频。** 所有音效在运行时由振荡器生成 —— 无音频文件下载、无授权问题，整个音频模块约 200 行。

---

## 🧪 测试

引擎内置 7 套 Vitest 测试，覆盖核心系统：

| 测试文件 | 覆盖范围 |
|----------|----------|
| `CombatSystem.test.ts` | 目标选取、伤害结算、溅射、减速效果 |
| `EconomySystem.test.ts` | 金币收支、出售返还、波次奖励 |
| `WaveSystem.test.ts` | 出怪时机、敌人组合、波次完成 |
| `Enemy.test.ts` | 血量、伤害、减速 debuff、状态转换 |
| `Tower.test.ts` | 建造成本、升级路径、出售价值、冷却 |
| `MapGrid.test.ts` | 格子类型、可建造性、路径查询 |
| `PathFinder.test.ts` | A\* 正确性、穿墙角禁止、不可达场景 |

```bash
npm test           # 一次性运行所有测试
npm run test:watch # TDD 观察模式
```

---

## 🗺️ 后续规划

PRD 中的 MVP 与 V2 范围已完成。未来可能的方向：

- **关卡编辑器**（V3）—— 让玩家设计并分享自定义地图
- **英雄单位** —— 可操控单位，带主动技能
- **更多塔 / 敌人类型** —— 中毒 DOT、连锁闪电、治疗者
- **每日挑战** —— 种子随机关卡 + 排行榜
- **移动端操控** —— 触控友好的命中区域与双指缩放

---

## 🙏 致谢

- **设计参考：** [Bloons TD](https://ninjakiwi.com/) 与 [Kingdom Rush](https://www.ironhidegames.com/) 的波次节奏与塔角色原型。
- **A\* 算法：** 标准 8 方向实现 + 禁止穿墙角，参考 [Red Blob Games 寻路指南](https://www.redblobgames.com/pathfinding/a-star/introduction.html)。
- **shadcn/ui** 提供可访问的组件基础。
- **Tailwind CSS** 提供工具类优先的样式工作流。

---

## 📄 许可证

本项目基于 **MIT License** 开源 —— 详见 [LICENSE](./LICENSE)。

版权所有 © 2026 Carl Shen。在保留版权声明与许可声明的前提下，你可自由使用、复制、修改、合并、发布、分发、再授权及/或销售本软件的副本。

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐ Star！**

[GitHub](https://github.com/NOSOLUTIONLOVE/Web_Game_06_Tower_Defense) · [在线演示](https://web-game-06-tower-defense.vercel.app) · [Issue 反馈](https://github.com/NOSOLUTIONLOVE/Web_Game_06_Tower_Defense/issues)

</div>

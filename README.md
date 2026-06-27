# AI女友 / AI Girlfriend Companion Prototype

一个可离线运行的剧情陪伴型游戏原型。当前版本使用纯 HTML/CSS/JavaScript 实现，可在 macOS 浏览器和 Android 手机浏览器中运行，也可以作为 PWA 添加到主屏幕。

## 运行

```bash
cd /home/fwd/work/codex_projects/games/ai-gf
python3 -m http.server 4173
```

打开：

```text
http://localhost:4173
```

## 测试

```bash
node tests/static.test.mjs
```

## 当前功能

- 主房间场景和角色立绘
- Pexels 真人照片主视觉
- 章节剧情和选择推进
- 早安、晚安、压力、音乐、约定等陪伴行动
- 本地聊天输入和预设 AI 回复
- 记忆标签、关系阶段、情绪状态和亲密度
- 日记、约定、回忆、房间物品解锁
- `localStorage` 自动存档
- Service Worker 离线缓存

## 后续方向

- 接入大模型 API，保留本地规则作为边界和兜底
- 增加 Live2D/Spine 角色动画
- 用 Capacitor 打包 Android APK
- 用 Tauri 或 Electron 打包 macOS App

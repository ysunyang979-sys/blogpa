---
title: Gemini Skills
cover: "https://img.top/api/anime?rand=69671"
tag: AI
permalink: gemini.html
---

# 2025 终极指南：强制开启 Chrome Gemini Skills (Glic) 助手

Google 最近在 Chrome 实验版中上线了代号为 **"Glic"** 的项目——即 **Gemini Skills**。它不仅是侧边栏聊天机器人，更是能感知网页内容、跨标签页执行任务的“超级助手”。

如果你在正式版中还没看到此功能，别担心。按照本攻略操作，5 分钟即可提前解锁。

---

### 🚀 第一步：基础环境准备

在动手术之前，先确保你的浏览器已经处于“待命状态”。

1. **版本更新**：
   在地址栏输入 `chrome://settings/help`。确保版本在 **131.0+** 以上（推荐最新版）。更新后点击【完全重启】。
2. **切换美式英语（最关键）**：
   Gemini Skills 目前对语言环境有硬性要求。
   - 前往 `chrome://settings/languages`。
   - 将 **English (United States)** 设为置顶（Display Google Chrome in this language）。
3. **初步验证**：
   输入 `chrome://skills/browse` 尝试进入技能库。如果不显示或报错，请看下一步。

---

### 🛠 第二步：手动激活「实验性开关」

Chrome 的很多前沿功能都藏在 `Flags` 实验室里。

1. 地址栏输入 `chrome://flags`。
2. 搜索关键词 **「Glic」**。
3. 将以下选项全部改为 **【Enabled】**：
    `Glic`
    `Glic side panel`
    `Glic actor`
    `Enables Skills in Gemini`
4. 点击最下方的 **「Relaunch」** 重启浏览器。

---

### 🔥 第三步：终极绝招（非美区用户必看）

如果以上方法仍未生效，说明你的本地配置文件锁定了地区。我们需要强制修改 `Local State` 文件。

**⚠️ 注意：操作前请彻底退出 Chrome（确保后台进程已完全关闭）。**

#### 1. 找到配置文件路径：
- **Windows**: 按 `Win + R` 输入 `%LocalAppData%\Google\Chrome\User Data`
- **Mac**: 打开 Finder，按 `Cmd + Shift + G` 输入 `~/Library/Application Support/Google/Chrome/`

#### 2. 修改 Local State 文件：
用记事本（Windows）或文本编辑（Mac）打开目录下的 **`Local State`** 文件（没有后缀），搜索并修改以下参数：

``` json
"is_glic_eligible": true,
"variations_country": "us",
"variations_permanent_consistency_country": "us"
```
---
title: Antigravity方案
cover: "https://api.btstu.cn/sjbz/api.php?lx=dongman&format=images?rand=69616"
tag: 科学上网
permalink: SearchFile/tool/Antigravity解决方案.html
---

# 🚀 告别 TUN 模式：Antigravity IDE 代理终极解决方案

### 📅 背景：为何要拒绝 TUN 模式？
在开发 **Antigravity (Google Project IDX)** 等云端 AI IDE 时，官方通常建议开启 **TUN 模式**。但 TUN 模式作为“虚拟网卡”级别的全局接管，往往会带来以下痛点：
1. **国内软件异常** ：微信、钉钉频繁异地登录报警，甚至导致网银插件失效。
2. **流量与延迟** ：全系统流量强制经过代理，导致访问国内网站变慢，浪费机场流量。
3. **配置冲突** ：虚拟网卡可能与某些开发环境（如 Docker、虚拟网桥）产生兼容性问题。

本文将分享一套**“精准分流”**的终极方案：通过 **v2rayN + Proxifier**，实现 **IDE 强制翻墙、浏览器智能分流、系统进程直连**。

---

## 🛠️ 第一阶段：v2rayN 的“情报预设”

首先，我们需要在 v2rayN 中建立一套识别 IDE 流量的路由分流策略。

### 1. 建立自定义路由规则
1. 打开 **v2rayN** -> **设置** -> **路由设置** -> **用户自定义路由**。
2. 点击 **添加规则**，按下图参数配置：
   - **别名 (Alias)** ：`Antigravity`
   - **outboundTag (目标)** ：`proxy`
   - **Domain (左侧域名框)** ：填入以下核心域名（一行一个）
     ```text
     domain:com.google.antigravity
     domain:oauth2.googleapis.com
     domain:googleapis.com
     ```
   - **进程名 (右侧进程框)** ：
     ```text
     antigravity.exe
     language_server_windows_x64.exe
     ```
3. **应用路由** ：在 v2rayN 主界面右下角，将 **路由** 切换为刚刚创建的 `Antigravity` 或标准的 `绕过大陆 (Bypass CN)`。
4. **系统代理** ：设置为 **自动配置系统代理**（状态栏变绿）。

---

## 🏗️ 第二阶段：Proxifier 的“精准引流”

由于 Antigravity IDE 底层通信（gRPC 等）往往不读取系统代理设置，我们需要 Proxifier 在底层强行把流量“抓”给 v2rayN。

### 1. 配置代理服务器 (Proxy Server)
- 菜单：**Profile** -> **Proxy Servers...** -> **Add...**
- **Address**: `127.0.0.1` | **Port**: `10808` (对应 v2rayN 的 SOCKS5 端口)
- **Protocol**: `SOCKS Version 5`
- 点击 **Check** 确认显示绿色 `Proxy is ready`。

### 2. 构建分流规则 (Proxification Rules)
这是实现“不全局翻墙”的核心！请确保规则**由上至下**排列：

| 规则名称 | 应用程序 (Applications) | 动作 (Action) | 作用说明 |
| :--- | :--- | :--- | :--- |
| **Localhost** | `Any` | `Direct` | 保证本机回环流量不走代理 |
| **System** | `MsMpEng.exe; svchost.exe` | `Direct` | **彻底消除系统组件报错红字** |
| **Antigravity** | `antigravity.exe; language_server_windows_x64.exe` | **Proxy SOCKS5** | **强制 IDE 走加密隧道** |
| **Default** | `Any` | **`Direct`** | **重要：让浏览器等其他软件默认直连** |

### 3. DNS 设置
- 菜单：**Profile** -> **Name Resolution...**
- 勾选：`Detect DNS settings automatically`。
- *注：若遇到无法解析，可切换为 `Resolve hostnames through proxy`。*

---

## 🔍 第三阶段：深度验证与疑难排解

### 1. 为什么我的 IP 测出来“不一致”？（这才是成功的标志！）
配置完成后，你会发现一个奇妙的“内外分流”现象：
- **访问 [百度/cip.cc]** ：显示 **真实中国本地 IP**（说明国内流量直连，安全且满速）。
- **访问 [Google/YouTube]** ：**能正常打开**（说明浏览器通过 v2rayN 的路由成功翻墙）。
- **Proxifier 窗口** ：只有 IDE 进程变绿并跳动流量（说明 IDE 被强制接管，不受系统环境干扰）。

### 2. 彻底消除 Proxifier 报错红字
如果在日志中看到 `ecs.office.com` 或 `IPv6` 报错红字：
- **方案 A** ：将 `MsMpEng.exe` (Defender 杀毒) 加入 `System` 规则并设为 `Direct`。
- **方案 B** ：在 `Profile` -> `Advanced` -> `IPv6` 中取消勾选 “Handle IPv6...”。
- **方案 C** ：对于极度频繁的系统报错，可将规则 Action 改为 **Block**。

---

## 🏆 方案总结

这套方案通过 **双重过滤（Proxifier 进程接管 + v2rayN 智能路由）** 实现了开发者的“终极梦想”：

1. **安全合规** ：国内支付、银行、办公软件识别到的是你真实的本地 IP，极大降低账号异常风险。
2. **性能巅峰** ：下 Unity 插件、下 GitHub 资源不占用虚拟网卡中转，网速直达物理上限。
3. **精准打击** ：只给“必须翻墙”的软件开路，全系统保持清爽。

**从此告别霸道的 TUN 模式，做一个能精准控制流量的优雅开发者！**
*本文首发于 [ysun]，转载请注明出处。*

---
title: 软件 の TUN 模式
cover: "https://api.kdcc.cn/img/?rand=80659"
tag: 科学上网
permalink: SearchFile/v2raytun.html
---

# 翻墙技术解析：TUN 模式与 Proxifier 配置全攻略

## 一、 什么是 TUN 模式？

### 1. 基本定义
**TUN (Network TUNnel)** 是一种虚拟网络设备，工作在计算机网络的 **IP 层（第 3 层）**。

### 2. 工作原理
在代理软件中开启 TUN 模式时，系统会创建一张“虚拟网卡”。
*   **传统代理 (System Proxy)：** 仅对支持系统代理设置的应用（如浏览器）有效。
*   **TUN 模式：** 强制接管整张网卡的所有 IP 数据包。无论应用程序本身是否支持代理（如游戏、终端、特定行业软件），其流量都会被强制通过虚拟网卡转发给代理工具。

### 3. 为什么需要它？
*   **游戏加速：** 游戏通常使用 UDP 或非标准端口，不走系统代理，必须依靠 TUN 模式截获。
*   **终端/开发工具：** 如 Git、Python 库下载、SSH 等。
*   **彻底全局：** 解决某些软件“绕过代理”或“不听从系统设置”的问题。

---

## 二、 Proxifier 软件详细配置教程

**注：** Proxifier 虽然不叫 "TUN 模式"（它基于 WFP/LSP 驱动技术），但它能实现与 TUN 模式完全一致的效果：**强制接管任意软件流量。**

### 第一步：设置代理服务器 (Proxy Server)
1.  打开 Proxifier，点击菜单栏：`Profile` -> `Proxy Servers`。
2.  点击 `Add...`。
3.  填写你的代理信息（通常配合 Clash/v2rayN 使用）：
    *   **Address:** `127.0.0.1`
    *   **Port:** `7890` (根据你代理工具的本地端口填写)
    *   **Protocol:** `SOCKS Version 5`
4.  点击 `OK`。如果提示是否设为默认，选 `Yes`。

### 第二步：配置代理规则 (Proxification Rules)
1.  点击菜单栏：`Profile` -> `Proxification Rules`。
2.  **核心设置：**
    *   **Localhost:** 必须保持 `Direct`（直连），否则会导致系统内部通信死锁。
    *   **Default:** 如果你想让**所有软件**都翻墙，将 Action 改为你的 `Proxy`。
    *   **自定义软件：** 点击 `Add`，在 `Applications` 里通过 `Browse` 选中你想单独加速的游戏或软件的 `.exe`，Action 选 `Proxy`。

### 第三步：配置 DNS 解析 (防止 DNS 污染)
这是实现翻墙的关键，否则即便连上了也打不开网页。
1.  点击菜单栏：`Profile` -> `Name Resolution`。
2.  取消勾选：`Detect DNS settings automatically`。
3.  **勾选：`Resolve hostnames through proxy`**。
    *   *作用：让远端代理服务器去解析网址，避免本地运营商劫持。*

### 第四步：处理 Windows 应用 (UWP)
如果你需要刷 Windows 商店的应用（如 Instagram, Mail）：
1.  工具栏点击：`Tools` -> `Win8 App Container Loopback Exemptions`。
2.  点击右上角 `Exempt All`，然后点击 `Save Changes`。

---

## 三、 TUN 模式与 Proxifier 的区别建议

| 特性 | 软件自带 TUN 模式 (如 Clash/V2ray高版本) | Proxifier 强制代理 |
| :--- | :--- | :--- |
| **易用性** | 开关一键开启，操作简单 | 需要手动添加进程，配置略繁琐 |
| **性能** | 驱动层转发，延迟极低 | 性能也很强，但适合精细化管理 |
| **适用场景** | 懒人全系统翻墙 | **游戏玩家、指定软件分流、开发者** |

**建议：** 如果你只是想简单上网，直接开启 Clash/V2ray 的 TUN 模式即可；如果你需要**精确控制**哪一个软件走哪条线路，或者某款游戏死活连不上，请使用 **Proxifier**。

>比如你如果想要使用Antigravity，请查看这篇文章进行详细的设置Antigravity解决方案<a href="/SearchFile/tool/Antigravity解决方案.html" class="btn">Antigravity解决方案</a>

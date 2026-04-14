# 幸运炒股机（Lucky Stock Machine）

## 在线游玩

- [点击游玩（推荐）](https://raw.githack.com/WEIZHIHANG1120/-lucky-/main/index.html)
- [备用链接（jsDelivr）](https://cdn.jsdelivr.net/gh/WEIZHIHANG1120/-lucky-@main/index.html)

如果打开后看到的是源码，请不要使用 `github.com/.../blob/.../index.html` 这类文件页链接，改用上面两个“在线游玩”链接。

## 项目简介

一个轻策略卡牌式股票模拟网页原型，围绕「开盘 -> 增持 -> 交付 -> 强化」形成单局循环。

## 核心玩法

- 12 轮关卡目标推进，逐轮完成交易额要求
- 多资金池协同（普通池 / 助涨池 / 保险池）
- 回合内交易卡决策与回合后强化成长并行
- 开盘结果即时可视化反馈（上涨/下跌）

## 本地运行

直接在浏览器打开 `index.html` 即可体验。

## 目录结构

- `index.html`：主入口页面
- `scripts/`：核心逻辑与配置
- `styles/`：样式文件
- `assets/`：美术与音频资源
- `docs/`：策划文档与设计说明

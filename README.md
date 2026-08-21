# otc-usdt-p2p-quota-calculator

OTC USDT 报价计算器 — 根据已知成本和设置的利润率计算最终的 USDT 报价。

## 本地开发

1. 安装依赖：
   npm install

2. 启动开发环境：
   npm run dev
   （默认在 http://localhost:3000）

## 构建

构建生产包：
npm run build

构建输出会在 dist/ 目录。

## 部署

该仓库通过 .github/workflows/deploy.yml 配置为在推送到 main 分支时自动部署到 GitHub Pages，推送到 main 即可触发自动部署。

## 说明

- 已从 package.json 中移除不再使用的 `motion` 依赖；项目仍然使用 `framer-motion`。

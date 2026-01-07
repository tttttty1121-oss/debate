# 🚀 部署指南

本文档详细介绍如何将直播辩论小程序后端服务部署到各种云平台。

## 📋 前置要求

- [x] 项目代码已完成
- [x] 本地测试通过
- [x] GitHub仓库已创建
- [x] 代码已推送至GitHub

## 🎯 推荐部署平台

### 1. Railway (推荐) ⭐⭐⭐⭐⭐

**优点**:
- 免费额度充足（512MB RAM, 1GB存储）
- 自动检测Node.js项目
- 数据库集成简单
- 自定义域名支持

**部署步骤**:

1. **注册账户**: 访问 [Railway.app](https://railway.app) 注册账户

2. **连接GitHub**:
   ```
   Dashboard → New Project → Deploy from GitHub repo
   ```

3. **选择仓库**: 搜索并选择你的 `backend-live-debate` 仓库

4. **自动部署**: Railway会自动检测 `package.json` 并安装依赖

5. **环境变量** (可选):
   ```
   PORT=8000
   NODE_ENV=production
   ```

6. **获取域名**: 部署完成后获取自动分配的域名
   ```
   https://your-project-name.up.railway.app
   ```

### 2. Render (备选) ⭐⭐⭐⭐

**优点**:
- 每月750小时免费
- 支持Docker部署
- 自动SSL证书
- 简单易用

**部署步骤**:

1. **注册账户**: 访问 [Render.com](https://render.com) 注册

2. **创建服务**:
   ```
   Dashboard → New → Web Service
   ```

3. **连接仓库**: 选择GitHub仓库 `backend-live-debate`

4. **配置构建**:
   ```
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

5. **环境变量**:
   ```
   NODE_ENV=production
   ```

### 3. Vercel (备选) ⭐⭐⭐

**优点**:
- 全球CDN加速
- 每月100GB流量免费
- 集成GitHub简单

**部署步骤**:

1. **注册账户**: 访问 [Vercel.com](https://vercel.com) 注册

2. **导入项目**:
   ```
   Dashboard → Add New → Project → From GitHub
   ```

3. **配置项目**:
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: npm run build (如果需要)
   Output Directory: ./
   Install Command: npm install
   ```

4. **环境变量**:
   ```
   NODE_ENV=production
   ```

## 🔧 部署前检查清单

### 代码准备
- [x] `package.json` 配置正确
- [x] `server.js` 为入口文件
- [x] 端口使用 `process.env.PORT || 8000`
- [x] 错误处理完善
- [x] CORS配置正确

### 依赖检查
- [x] 生产依赖已列出
- [x] 无不必要的开发依赖
- [x] 版本号固定（避免 ^ 符号）

### 安全检查
- [x] 无敏感信息提交
- [x] 环境变量使用正确
- [x] 错误信息不泄露敏感数据

## 🐛 常见部署问题

### 1. 端口问题
**错误**: `Error: listen EADDRINUSE`
**解决**: 使用 `process.env.PORT`

```javascript
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2. 依赖安装失败
**错误**: `npm install` 失败
**解决**:
- 检查 `package.json` 语法
- 移除不必要的依赖
- 使用具体版本号

### 3. 内存不足
**错误**: 应用崩溃
**解决**:
- 优化内存使用
- 使用轻量级替代方案
- 升级服务计划

### 4. 启动超时
**错误**: 部署超时
**解决**:
- 简化启动脚本
- 移除不必要的初始化
- 检查网络请求

## 📊 性能优化

### 1. 内存优化
```javascript
// 使用流式处理大文件
// 避免在内存中存储大量数据
// 使用分页查询
```

### 2. 响应优化
```javascript
// 启用gzip压缩
const compression = require('compression');
app.use(compression());

// 使用缓存头
app.use(express.static('public', {
  maxAge: '1d'
}));
```

### 3. 监控和日志
```javascript
// 添加健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

## 🔒 安全配置

### 1. HTTPS强制
```javascript
// 在生产环境中强制HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 2. 速率限制
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
```

## 🌐 自定义域名

### Railway自定义域名
1. 购买域名
2. 在域名提供商添加CNAME记录
3. 在Railway控制台设置自定义域名

### 获取SSL证书
- Railway/Render自动提供
- Vercel自动提供Let's Encrypt证书

## 📈 监控和维护

### 1. 日志监控
```javascript
// 使用winston日志库
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 2. 性能监控
- 使用Railway内置监控
- 集成第三方服务 (DataDog, New Relic)
- 定期检查响应时间

### 3. 备份策略
- 代码备份：GitHub
- 数据备份：定期导出重要数据
- 配置备份：环境变量文档化

## 🚀 部署后验证

### 1. 功能测试
```bash
# 健康检查
curl https://your-domain.com/health

# API测试
curl https://your-domain.com/api/v1/debate-topic

# WebSocket测试
# 使用浏览器开发者工具或WebSocket客户端
```

### 2. 性能测试
```bash
# 压力测试
ab -n 1000 -c 10 https://your-domain.com/health

# 响应时间监控
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/health
```

### 3. 前端集成测试
1. 修改前端配置指向新域名
2. 重新构建前端项目
3. 测试完整功能流程

## 💰 成本估算

### 免费额度
- **Railway**: 512MB RAM, 1GB存储, $5/月额度
- **Render**: 750小时/月, 750GB流量
- **Vercel**: 100GB流量, 无服务器限制

### 付费升级
- **Railway**: $5-50/月 (根据资源需求)
- **Render**: $7-50/月
- **Vercel**: $0-50/月 (按使用量)

## 📞 获取帮助

如果部署过程中遇到问题：

1. **查看日志**: 在平台控制台查看详细错误信息
2. **检查配置**: 确认环境变量和构建命令
3. **测试本地**: 确保本地运行正常
4. **查阅文档**: 查看各平台的官方文档

---

## ✅ 部署成功标志

- [x] 应用成功启动
- [x] 健康检查返回200状态码
- [x] API接口响应正常
- [x] WebSocket连接建立
- [x] 前端可以正常访问后端
- [x] HTTPS证书有效
- [x] 域名解析正确

🎉 恭喜！你的直播辩论小程序后端服务已经成功部署！

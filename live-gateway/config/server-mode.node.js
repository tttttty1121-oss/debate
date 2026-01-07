/**
 * 直播辩论系统网关服务配置
 * 用于替代 Nginx 反向代理的 Node.js 中间层配置
 */

// ==================== 服务器配置 ====================

/**
 * 网关服务器配置
 */
const GATEWAY_CONFIG = {
  host: '0.0.0.0',  // 监听所有网络接口
  port: 8080,       // 网关监听端口（不再需要 Nginx）
  protocol: 'http'
};

/**
 * 后端API服务器配置
 * 如果需要连接真实的后端服务，请修改这些配置
 */
const BACKEND_CONFIG = {
  // 修改为你的后端服务器地址
  url: process.env.BACKEND_URL || 'http://192.168.31.189:8000',
  timeout: 30000,  // 30秒超时
  retries: 3       // 重试次数
};

/**
 * WebSocket 配置
 */
const WEBSOCKET_CONFIG = {
  path: '/ws',
  heartbeat: 30000,  // 心跳间隔（毫秒）
  maxConnections: 1000
};

/**
 * CORS 配置
 */
const CORS_CONFIG = {
  origin: true,  // 允许所有源（生产环境应限制）
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400  // 24小时预检缓存
};

/**
 * 安全配置
 */
const SECURITY_CONFIG = {
  helmet: {
    contentSecurityPolicy: false,  // 后台管理需要内联脚本
    crossOriginEmbedderPolicy: false
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,  // 15分钟
    max: 100,                  // 每个IP限制100次请求
    message: '请求过于频繁，请稍后再试'
  }
};

/**
 * 日志配置
 */
const LOG_CONFIG = {
  level: process.env.LOG_LEVEL || 'combined',
  format: 'combined',  // 'combined', 'common', 'dev', 'short', 'tiny'
  skip: (req, res) => res.statusCode < 400  // 只记录错误请求
};

/**
 * 静态文件配置
 */
const STATIC_CONFIG = {
  admin: {
    path: '/admin',
    directory: './admin',
    options: {
      index: 'index.html',
      maxAge: '1d'
    }
  },
  data: {
    path: '/api/data',
    directory: './data'
  }
};

/**
 * 缓存配置
 */
const CACHE_CONFIG = {
  static: {
    maxAge: '1d'  // 静态文件缓存1天
  },
  api: {
    maxAge: 0,    // API响应不缓存
    noCache: true
  }
};

// ==================== 环境检测 ====================

/**
 * 获取当前环境
 */
const getCurrentEnv = () => {
  return process.env.NODE_ENV || 'development';
};

/**
 * 获取当前配置
 */
const getCurrentConfig = () => {
  const env = getCurrentEnv();

  return {
    env,
    gateway: GATEWAY_CONFIG,
    backend: BACKEND_CONFIG,
    websocket: WEBSOCKET_CONFIG,
    cors: CORS_CONFIG,
    security: SECURITY_CONFIG,
    log: LOG_CONFIG,
    static: STATIC_CONFIG,
    cache: CACHE_CONFIG
  };
};

// ==================== 导出配置 ====================

module.exports = {
  GATEWAY_CONFIG,
  BACKEND_CONFIG,
  WEBSOCKET_CONFIG,
  CORS_CONFIG,
  SECURITY_CONFIG,
  LOG_CONFIG,
  STATIC_CONFIG,
  CACHE_CONFIG,
  getCurrentEnv,
  getCurrentConfig
};

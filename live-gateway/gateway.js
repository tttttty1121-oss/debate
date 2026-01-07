// -*- coding: utf-8 -*-
/**
 * 直播辩论系统 - 中间层网关服务
<<<<<<< HEAD
 * 替代 Nginx 反向代理，使用 Node.js + Express 实现
 *
 * 功能特性:
 * - API 路由处理 (/api/*)
 * - 后台管理页面服务 (/admin)
 * - WebSocket 实时通信 (/ws)
 * - CORS 跨域支持
 * - 请求压缩和安全头
=======
 * 替代 Nginx 的 Node.js 实现
>>>>>>> 1b57f6ffbef661d96662bdce0ade8baf32a8d41c
 */

const express = require('express');
const cors = require('cors');
<<<<<<< HEAD
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 8080;

// ==================== 中间件配置 ====================

// 安全头
app.use(helmet({
  contentSecurityPolicy: false, // 允许内联脚本（后台管理需要）
  crossOriginEmbedderPolicy: false
}));

// 压缩响应
app.use(compression());

// 日志记录
app.use(morgan('combined'));

// CORS 配置
app.use(cors({
  origin: true, // 允许所有源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== 静态文件服务 ====================

// 后台管理页面静态文件服务
const adminPath = path.join(__dirname, 'admin');
if (fs.existsSync(adminPath)) {
  console.log('📁 后台管理目录存在:', adminPath);
  app.use('/admin', express.static(adminPath, {
    index: 'index.html',
    maxAge: '1d'
  }));
} else {
  console.warn('⚠️  后台管理目录不存在:', adminPath);
  console.warn('请确保 admin/ 目录与网关服务在同一级目录');
}

// ==================== API 路由处理 ====================

/**
 * API 路由处理器
 * 处理所有 /api/* 请求
 */
app.use('/api', (req, res, next) => {
  console.log(`📡 API请求: ${req.method} ${req.originalUrl}`);

  // 设置响应头
  res.set({
    'X-Gateway-Version': '2.0.0',
    'X-Processed-By': 'live-debate-gateway',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });

  // 继续处理
  next();
});

// 健康检查
app.get('/api/health', (req, res) => {
=======
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = 8080;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
const adminPath = path.join(__dirname, 'admin');
try {
  app.use('/admin', express.static(adminPath));
  console.log('📁 后台管理目录:', adminPath);
} catch (e) {
  console.log('⚠️  后台管理目录不存在');
}

// API 路由
app.get('/health', (req, res) => {
>>>>>>> 1b57f6ffbef661d96662bdce0ade8baf32a8d41c
  res.json({
    status: 'OK',
    service: 'live-debate-gateway',
    version: '2.0.0',
<<<<<<< HEAD
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// ==================== 数据文件服务 ====================

/**
 * 数据文件读取中间件
 * 支持读取 data/ 目录下的 JSON 文件
 */
app.get('/api/data/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'data', `${filename}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: `数据文件不存在: ${filename}.json`
    });
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('读取数据文件失败:', error);
    res.status(500).json({
      success: false,
      message: '读取数据文件失败'
    });
  }
});

// ==================== 模拟后端 API ====================

/**
 * 模拟后端API - 投票系统
 */
app.get('/api/v1/votes', (req, res) => {
  const { stream_id } = req.query;

  // 模拟投票数据
  const mockVotes = {
    'stream-1': { leftVotes: 245, rightVotes: 198, totalVotes: 443 },
    'stream-2': { leftVotes: 189, rightVotes: 234, totalVotes: 423 },
    'stream-3': { leftVotes: 67, rightVotes: 89, totalVotes: 156 }
  };

  const voteData = mockVotes[stream_id] || mockVotes['stream-1'];

  res.json({
    success: true,
    data: {
      streamId: stream_id || 'stream-1',
      ...voteData,
=======
    timestamp: new Date().toISOString()
  });
});

// 模拟 API
app.get('/api/v1/votes', (req, res) => {
  res.json({
    success: true,
    data: {
      streamId: 'stream-1',
      leftVotes: 245,
      rightVotes: 198,
      totalVotes: 443,
>>>>>>> 1b57f6ffbef661d96662bdce0ade8baf32a8d41c
      lastUpdated: new Date().toISOString()
    }
  });
});

<<<<<<< HEAD
app.post('/api/v1/user-vote', (req, res) => {
  const { leftVotes, rightVotes, streamId } = req.body.request || req.body;

  // 模拟投票处理
  res.json({
    success: true,
    message: '投票成功',
    data: {
      streamId: streamId || 'stream-1',
      leftVotes,
      rightVotes,
      totalVotes: leftVotes + rightVotes,
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * 模拟后端API - 辩题管理
 */
app.get('/api/v1/debate-topic', (req, res) => {
  const mockDebate = {
    id: 'debate-1',
    title: '如果有一个能一键消除痛苦的按钮，你会按吗？',
    description: '这是一个关于痛苦、成长与人性选择的深度辩论。探讨人类面对痛苦时的选择，以及这种选择对个人和社会的影响。',
    leftSide: '会按',
    rightSide: '不会按',
    leftPosition: '会按',
    rightPosition: '不会按',
    streamId: 'stream-1'
  };

  res.json({
    success: true,
    data: mockDebate
  });
});

/**
 * 模拟后端API - AI内容
 */
app.get('/api/v1/ai-content', (req, res) => {
  const mockAiContent = [
    {
      id: 'ai-1',
      streamId: 'stream-1',
      type: 'speech',
      content: '辩论双方正在激烈交锋',
      confidence: 0.85,
      timestamp: new Date().toISOString(),
      speaker: '正方辩手',
      emotion: '激动'
    }
  ];

  res.json({
    success: true,
    data: mockAiContent,
    total: mockAiContent.length
  });
});

/**
 * 模拟后端API - 评论系统
 */
app.post('/api/comment', (req, res) => {
  const { contentId, text, user } = req.body;

  const newComment = {
    id: Date.now().toString(),
    contentId,
    text,
    user: user || '匿名用户',
    avatar: '👤',
    likes: 0,
    createdAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: '评论添加成功',
    data: newComment
  });
});

/**
 * 模拟后端API - 直播管理
 */
=======
app.get('/api/v1/debate-topic', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 'debate-1',
      title: '如果有一个能一键消除痛苦的按钮，你会按吗？',
      description: '这是一个关于痛苦、成长与人性选择的深度辩论',
      leftSide: '会按',
      rightSide: '不会按',
      streamId: 'stream-1'
    }
  });
});

>>>>>>> 1b57f6ffbef661d96662bdce0ade8baf32a8d41c
app.get('/api/admin/live/status', (req, res) => {
  res.json({
    success: true,
    data: {
      isLive: true,
      liveStreamUrl: 'rtmp://192.168.31.189:1935/live/stream-1',
<<<<<<< HEAD
      currentStreamId: 'stream-1',
=======
>>>>>>> 1b57f6ffbef661d96662bdce0ade8baf32a8d41c
      viewers: 1250,
      status: 'active'
    }
  });
});

<<<<<<< HEAD
app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      isLive: true,
      totalUsers: 25000,
      activeUsers: 1250,
      totalVotes: 15000,
      totalComments: 850,
      currentDebateTopic: '如果有一个能一键消除痛苦的按钮，你会按吗？'
    }
  });
});

app.get('/api/v1/admin/streams', (req, res) => {
  const mockStreams = [
    {
      id: 'stream-1',
      name: '辩论赛场A',
      description: '正方vs反方精彩辩论',
      status: 'active',
      viewers: 1250
    },
    {
      id: 'stream-2',
      name: '辩论赛场B',
      description: '青年辩论家对决',
      status: 'active',
      viewers: 890
    }
  ];

  res.json({
    success: true,
    data: {
      streams: mockStreams,
      total: mockStreams.length
    }
  });
});

// ==================== WebSocket 服务器 ====================

const WebSocket = require('ws');
let wss;

/**
 * 创建WebSocket服务器
 */
function createWebSocketServer(server) {
  wss = new WebSocket.Server({
    server,
    path: '/ws',
    perMessageDeflate: false
  });

  console.log('🚀 WebSocket服务器启动在路径: /ws');

  wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`📡 WebSocket客户端连接: ${clientIp}`);

    // 发送欢迎消息
    ws.send(JSON.stringify({
      type: 'connected',
      message: '欢迎连接直播辩论网关',
      timestamp: new Date().toISOString(),
      server: 'live-debate-gateway-v2.0.0'
    }));

    // 处理客户端消息
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('📨 WebSocket消息:', data);

        // 处理不同类型的消息
        switch (data.type) {
          case 'ping':
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString()
            }));
            break;

          case 'subscribe':
            // 订阅特定类型的消息
            console.log(`📡 客户端订阅: ${data.channel || 'all'}`);
            break;

          default:
            // 广播消息到其他客户端
            wss.clients.forEach(client => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'broadcast',
                  data: data,
                  timestamp: new Date().toISOString()
                }));
              }
            });
        }
      } catch (error) {
        console.error('WebSocket消息解析失败:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: '消息格式错误',
          timestamp: new Date().toISOString()
        }));
      }
    });

    ws.on('close', (code, reason) => {
      console.log(`📡 WebSocket客户端断开: ${clientIp}, 代码: ${code}`);
    });

    ws.on('error', (error) => {
      console.error('WebSocket错误:', error);
    });
  });

  // 定期广播模拟数据
  setInterval(() => {
    const mockUpdates = {
      type: 'liveStatus',
      data: {
        isLive: true,
        viewers: Math.floor(Math.random() * 2000) + 1000,
        timestamp: new Date().toISOString()
      }
    };

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(mockUpdates));
      }
    });
  }, 30000); // 每30秒发送一次状态更新
}

// ==================== 错误处理 ====================

// 404 处理
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API接口不存在: ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('网关错误:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// ==================== 启动服务器 ====================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('═══════════════════════════════════════');
  console.log('🚀 直播辩论系统中间层网关服务启动');
  console.log('═══════════════════════════════════════');
  console.log(`📡 监听地址: 0.0.0.0:${PORT}`);
  console.log(`🌐 本地访问: http://localhost:${PORT}`);
  console.log(`🌐 网络访问: http://192.168.31.189:${PORT}`);
  console.log('═══════════════════════════════════════');
  console.log('📋 支持的路由:');
  console.log('  /api/*     → API路由处理');
  console.log('  /admin     → 后台管理页面');
  console.log('  /ws        → WebSocket实时通信');
  console.log('  /health    → 服务健康检查');
  console.log('═══════════════════════════════════════');
  console.log('✅ 服务启动成功，等待连接...');
});

// 创建WebSocket服务器
createWebSocketServer(server);

// ==================== 优雅关闭 ====================

process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭网关服务...');

  if (wss) {
    wss.close(() => {
      console.log('✅ WebSocket服务器已关闭');
    });
  }

  server.close(() => {
    console.log('✅ HTTP服务器已关闭');
    process.exit(0);
  });
});

// 导出应用实例（用于测试）
module.exports = app;
=======
// WebSocket 服务器
let wss;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 网关服务启动在端口:', PORT);
});

wss = new WebSocket.Server({ server, path: '/ws' });
wss.on('connection', (ws) => {
  console.log('📡 WebSocket 连接');
  ws.send(JSON.stringify({ type: 'connected', message: '网关连接成功' }));
});

console.log('✅ 网关服务初始化完成');
>>>>>>> 1b57f6ffbef661d96662bdce0ade8baf32a8d41c

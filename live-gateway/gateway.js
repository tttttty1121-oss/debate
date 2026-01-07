// -*- coding: utf-8 -*-
/**
 * 直播辩论系统 - 中间层网关服务
 * 替代 Nginx 的 Node.js 实现
 */

const express = require('express');
const cors = require('cors');
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
  res.json({
    status: 'OK',
    service: 'live-debate-gateway',
    version: '2.0.0',
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
      lastUpdated: new Date().toISOString()
    }
  });
});

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

app.get('/api/admin/live/status', (req, res) => {
  res.json({
    success: true,
    data: {
      isLive: true,
      liveStreamUrl: 'rtmp://192.168.31.189:1935/live/stream-1',
      viewers: 1250,
      status: 'active'
    }
  });
});

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

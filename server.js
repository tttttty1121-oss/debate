// -*- coding: utf-8 -*-
/**
 * 直播辩论小程序后端服务器
 * 使用Mock数据模拟真实业务逻辑
 */

const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const mockData = require('./data/mock-data');

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || process.env.RAILWAY_STATIC_URL ? 8080 : 8000;

// 中间件配置
app.use(cors({
  origin: true, // 允许所有源
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 初始化Mock数据
let dataStore = mockData.initAllData();

// 模拟数据持久化（实际上是内存存储）
setInterval(() => {
  // 每5分钟更新一次模拟数据
  dataStore = mockData.initAllData();
  console.log('🔄 Mock数据已更新');
}, 5 * 60 * 1000);

// ==================== API路由 ====================

// 根路径 - API文档和欢迎页面
app.get('/', (req, res) => {
  res.json({
    message: '🎉 直播辩论小程序后端API服务',
    status: '运行正常',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /health - 健康检查',
      debateTopic: 'GET /api/v1/debate-topic - 获取辩论话题',
      votes: 'GET /api/v1/votes?stream_id={id} - 获取投票数据',
      userVote: 'POST /api/v1/user-vote - 用户投票',
      liveStatus: 'GET /api/admin/live/status - 直播状态',
      comments: 'GET /api/v1/comments?stream_id={id} - 获取评论',
      aiAnalysis: 'GET /api/v1/ai-analysis?stream_id={id} - AI分析数据'
    },
    websocket: {
      url: 'wss://' + req.headers.host,
      events: ['vote-update', 'comment-new', 'live-status']
    },
    docs: '服务已成功部署到Render云端 🚀'
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '直播辩论后端服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ==================== 投票系统接口 ====================

// 获取票数统计
app.get('/api/v1/votes', (req, res) => {
  try {
    const { stream_id } = req.query;

    if (!stream_id) {
      return res.status(400).json({
        success: false,
        message: '缺少stream_id参数'
      });
    }

    const voteData = dataStore.votes.get(stream_id);

    if (!voteData) {
      return res.status(404).json({
        success: false,
        message: '未找到对应直播流的投票数据'
      });
    }

    res.json({
      success: true,
      data: {
        streamId: voteData.streamId,
        leftVotes: voteData.leftVotes,
        rightVotes: voteData.rightVotes,
        totalVotes: voteData.totalVotes,
        lastUpdated: voteData.lastUpdated
      }
    });
  } catch (error) {
    console.error('获取投票数据失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 用户投票
app.post('/api/v1/user-vote', (req, res) => {
  try {
    const { leftVotes, rightVotes, streamId, stream_id, userId, user_id } = req.body.request || req.body;

    const streamId_final = streamId || stream_id;
    const userId_final = userId || user_id || 'guest';

    if (!streamId_final) {
      return res.status(400).json({
        success: false,
        message: '缺少streamId参数'
      });
    }

    if (typeof leftVotes !== 'number' || typeof rightVotes !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'leftVotes和rightVotes必须是数字'
      });
    }

    const totalVotes = leftVotes + rightVotes;
    if (totalVotes !== 100) {
      return res.status(400).json({
        success: false,
        message: 'leftVotes + rightVotes 必须等于100'
      });
    }

    // 更新投票数据
    const voteData = dataStore.votes.get(streamId_final);
    if (voteData) {
      voteData.leftVotes += leftVotes;
      voteData.rightVotes += rightVotes;
      voteData.totalVotes += totalVotes;
      voteData.lastUpdated = new Date().toISOString();

      // 添加到投票历史
      voteData.voteHistory.push({
        timestamp: new Date().toISOString(),
        leftVotes: voteData.leftVotes,
        rightVotes: voteData.rightVotes
      });
    }

    // 广播更新到WebSocket客户端
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'vote_update',
            data: {
              streamId: streamId_final,
              leftVotes: voteData.leftVotes,
              rightVotes: voteData.rightVotes,
              totalVotes: voteData.totalVotes
            }
          }));
        }
      });
    }

    res.json({
      success: true,
      message: '投票成功',
      data: {
        streamId: streamId_final,
        userId: userId_final,
        leftVotes,
        rightVotes,
        totalVotes,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('用户投票失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// ==================== 辩题管理接口 ====================

// 获取辩题信息
app.get('/api/v1/debate-topic', (req, res) => {
  try {
    const { stream_id } = req.query;

    let debateTopic;
    if (stream_id) {
      debateTopic = dataStore.debateTopics.find(topic => topic.streamId === stream_id);
    } else {
      // 如果没有指定stream_id，返回默认辩题
      debateTopic = dataStore.debateTopics[0];
    }

    if (!debateTopic) {
      return res.status(404).json({
        success: false,
        message: '未找到辩题信息'
      });
    }

    res.json({
      success: true,
      data: {
        id: debateTopic.id,
        title: debateTopic.title,
        description: debateTopic.description,
        leftSide: debateTopic.leftSide,
        rightSide: debateTopic.rightSide,
        leftPosition: debateTopic.leftPosition,
        rightPosition: debateTopic.rightPosition,
        streamId: debateTopic.streamId
      }
    });
  } catch (error) {
    console.error('获取辩题信息失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// ==================== AI内容接口 ====================

// 获取AI识别内容
app.get('/api/v1/ai-content', (req, res) => {
  try {
    const { stream_id } = req.query;

    let aiContents;
    if (stream_id) {
      aiContents = dataStore.aiContents.filter(content => content.streamId === stream_id);
    } else {
      aiContents = dataStore.aiContents;
    }

    res.json({
      success: true,
      data: aiContents.slice(-20), // 返回最近20条
      total: aiContents.length
    });
  } catch (error) {
    console.error('获取AI内容失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// ==================== 评论系统接口 ====================

// 添加评论
app.post('/api/comment', (req, res) => {
  try {
    const { contentId, text, user, avatar } = req.body;

    if (!contentId || !text) {
      return res.status(400).json({
        success: false,
        message: 'contentId和text为必填参数'
      });
    }

    const newComment = {
      id: uuidv4(),
      contentId,
      text: text.trim(),
      user: user || '匿名用户',
      avatar: avatar || '👤',
      likes: 0,
      createdAt: new Date().toISOString(),
      isLiked: false
    };

    dataStore.comments.push(newComment);

    // 广播新评论到WebSocket客户端
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new_comment',
            data: newComment
          }));
        }
      });
    }

    res.json({
      success: true,
      message: '评论添加成功',
      data: newComment
    });
  } catch (error) {
    console.error('添加评论失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 点赞功能
app.post('/api/like', (req, res) => {
  try {
    const { contentId, commentId } = req.body;

    if (!contentId) {
      return res.status(400).json({
        success: false,
        message: 'contentId为必填参数'
      });
    }

    if (commentId) {
      // 点赞评论
      const comment = dataStore.comments.find(c => c.id === commentId && c.contentId === contentId);
      if (comment) {
        comment.likes += 1;
        comment.isLiked = true;
      }
    } else {
      // 点赞内容（这里简化处理）
      // 可以扩展为内容点赞逻辑
    }

    res.json({
      success: true,
      message: '点赞成功'
    });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 删除评论
app.delete('/api/comment/:commentId', (req, res) => {
  try {
    const { commentId } = req.params;
    const { contentId } = req.body;

    const commentIndex = dataStore.comments.findIndex(
      c => c.id === commentId && c.contentId === contentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '未找到评论'
      });
    }

    dataStore.comments.splice(commentIndex, 1);

    res.json({
      success: true,
      message: '评论删除成功'
    });
  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// ==================== 直播控制接口 ====================

// 获取直播状态
app.get('/api/admin/live/status', (req, res) => {
  res.json({
    success: true,
    data: dataStore.liveStatus
  });
});

// 获取数据概览
app.get('/api/admin/dashboard', (req, res) => {
  try {
    const { stream_id } = req.query;

    const dashboard = { ...dataStore.dashboard };

    // 如果指定了stream_id，返回对应流的统计
    if (stream_id) {
      const voteData = dataStore.votes.get(stream_id);
      if (voteData) {
        dashboard.leftVotes = voteData.leftVotes;
        dashboard.rightVotes = voteData.rightVotes;
        dashboard.totalVotes = voteData.totalVotes;
      }
    }

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('获取数据概览失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 控制直播
app.post('/api/live/control', (req, res) => {
  try {
    const { action, streamId } = req.body;

    if (!['start', 'stop'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'action必须是start或stop'
      });
    }

    dataStore.liveStatus.isLive = action === 'start';
    dataStore.liveStatus.status = action === 'start' ? 'active' : 'stopped';

    if (action === 'start' && streamId) {
      dataStore.liveStatus.currentStreamId = streamId;
    }

    res.json({
      success: true,
      message: `直播${action === 'start' ? '开始' : '停止'}成功`,
      data: dataStore.liveStatus
    });
  } catch (error) {
    console.error('直播控制失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取直播流列表
app.get('/api/v1/admin/streams', (req, res) => {
  res.json({
    success: true,
    data: {
      streams: dataStore.streams,
      total: dataStore.streams.length
    }
  });
});

// 获取投票统计
app.get('/api/v1/admin/votes/statistics', (req, res) => {
  try {
    const { stream_id } = req.query;

    let statistics = {
      totalVotes: 0,
      leftVotes: 0,
      rightVotes: 0,
      voteTrend: [],
      streamStats: []
    };

    if (stream_id) {
      const voteData = dataStore.votes.get(stream_id);
      if (voteData) {
        statistics.leftVotes = voteData.leftVotes;
        statistics.rightVotes = voteData.rightVotes;
        statistics.totalVotes = voteData.totalVotes;
        statistics.voteTrend = voteData.voteHistory;
      }
    } else {
      // 汇总所有流的统计
      dataStore.votes.forEach(voteData => {
        statistics.leftVotes += voteData.leftVotes;
        statistics.rightVotes += voteData.rightVotes;
        statistics.totalVotes += voteData.totalVotes;

        statistics.streamStats.push({
          streamId: voteData.streamId,
          leftVotes: voteData.leftVotes,
          rightVotes: voteData.rightVotes,
          totalVotes: voteData.totalVotes
        });
      });
    }

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('获取投票统计失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// ==================== 用户投票记录接口 ====================

// 查询用户投票状态
app.get('/api/v1/user-votes', (req, res) => {
  try {
    const { stream_id, user_id } = req.query;

    if (!stream_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: 'stream_id和user_id为必填参数'
      });
    }

    // Mock用户投票记录（实际项目中应该从数据库查询）
    const userVotes = {
      userId: user_id,
      streamId: stream_id,
      hasVoted: Math.random() > 0.3, // 70%的用户已经投票
      lastVoteTime: new Date().toISOString(),
      voteHistory: []
    };

    if (userVotes.hasVoted) {
      userVotes.voteHistory = [{
        timestamp: new Date().toISOString(),
        side: Math.random() > 0.5 ? 'left' : 'right',
        votes: Math.floor(Math.random() * 50) + 10
      }];
    }

    res.json({
      success: true,
      data: userVotes
    });
  } catch (error) {
    console.error('查询用户投票状态失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// ==================== RTMP转HLS接口 ====================

// 获取RTMP转HLS播放地址
app.get('/api/admin/rtmp/urls', (req, res) => {
  try {
    const { room_name } = req.query;

    if (!room_name) {
      return res.status(400).json({
        success: false,
        message: 'room_name为必填参数'
      });
    }

    const urls = mockData.generateMockRtmpUrls(room_name);

    res.json({
      success: true,
      data: urls
    });
  } catch (error) {
    console.error('获取RTMP转HLS地址失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// ==================== WebSocket服务器 ====================

// 创建WebSocket服务器
let wss;
const createWebSocketServer = (server) => {
  wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log('📡 WebSocket客户端连接:', req.socket.remoteAddress);

    // 发送欢迎消息
    ws.send(JSON.stringify({
      type: 'welcome',
      message: '欢迎连接直播辩论WebSocket服务器',
      timestamp: new Date().toISOString()
    }));

    // 处理客户端消息
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('📨 收到WebSocket消息:', data);

        // 可以根据消息类型处理不同逻辑
        if (data.type === 'ping') {
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('WebSocket消息解析失败:', error);
      }
    });

    ws.on('close', () => {
      console.log('📡 WebSocket客户端断开连接');
    });

    ws.on('error', (error) => {
      console.error('WebSocket错误:', error);
    });
  });

  console.log('🚀 WebSocket服务器启动在路径: /ws');
};

// ==================== 启动服务器 ====================

const server = app.listen(PORT, () => {
  console.log('═══════════════════════════════════════');
  console.log('🚀 直播辩论小程序后端服务启动');
  console.log('═══════════════════════════════════════');
  console.log(`📡 HTTP服务器: http://localhost:${PORT}`);
  console.log(`📡 WebSocket服务器: ws://localhost:${PORT}/ws`);
  console.log(`📊 模拟数据已初始化，共${dataStore.streams.length}个直播流`);
  console.log(`📊 模拟辩题: ${dataStore.debateTopics.length}个`);
  console.log(`📊 模拟评论: ${dataStore.comments.length}条`);
  console.log(`📊 模拟AI内容: ${dataStore.aiContents.length}条`);
  console.log('═══════════════════════════════════════');
  console.log('📋 可用的API端点:');
  console.log('  GET  /health - 健康检查');
  console.log('  GET  /api/v1/votes?stream_id=xxx - 获取票数统计');
  console.log('  POST /api/v1/user-vote - 用户投票');
  console.log('  GET  /api/v1/debate-topic?stream_id=xxx - 获取辩题');
  console.log('  GET  /api/v1/ai-content?stream_id=xxx - 获取AI内容');
  console.log('  POST /api/comment - 添加评论');
  console.log('  POST /api/like - 点赞');
  console.log('  GET  /api/admin/live/status - 直播状态');
  console.log('  GET  /api/admin/dashboard - 数据概览');
  console.log('  GET  /api/v1/admin/streams - 直播流列表');
  console.log('═══════════════════════════════════════');
});

// 创建WebSocket服务器
createWebSocketServer(server);

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭服务器...');
  if (wss) {
    wss.close();
  }
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});

module.exports = app;

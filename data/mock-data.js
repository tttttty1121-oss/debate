// -*- coding: utf-8 -*-
/**
 * Mock数据生成器
 * 使用固定数据模拟业务逻辑
 */

// 直播流数据
const generateMockStreams = () => {
  const streams = [
    {
      id: 'stream-1',
      name: '辩论赛场A',
      description: '正方vs反方精彩辩论',
      status: 'active',
      viewers: 1250,
      startTime: new Date().toISOString(),
      streamUrl: 'rtmp://192.168.31.189:1935/live/stream-1',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'stream-2',
      name: '辩论赛场B',
      description: '青年辩论家对决',
      status: 'active',
      viewers: 890,
      startTime: new Date().toISOString(),
      streamUrl: 'rtmp://192.168.31.189:1935/live/stream-2',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'stream-3',
      name: '辩论赛场C',
      description: '模拟联合国辩论',
      status: 'inactive',
      viewers: 0,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      streamUrl: 'rtmp://192.168.31.189:1935/live/stream-3',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    }
  ];

  return streams;
};

// 辩题数据
const generateMockDebateTopics = () => {
  const topics = [];

  const topicTemplates = [
    {
      id: 'debate-1',
      title: '如果有一个能一键消除痛苦的按钮，你会按吗？',
      description: '这是一个关于痛苦、成长与人性选择的深度辩论。探讨人类面对痛苦时的选择，以及这种选择对个人和社会的影响。',
      leftSide: '会按',
      rightSide: '不会按',
      streamId: 'stream-1'
    },
    {
      id: 'debate-2',
      title: '人工智能应该拥有自主意识吗？',
      description: '随着AI技术的快速发展，我们需要思考机器是否应该拥有自主意识，以及这将如何影响人类社会。',
      leftSide: '应该',
      rightSide: '不应该',
      streamId: 'stream-2'
    },
    {
      id: 'debate-3',
      title: '社交媒体促进了还是阻碍了人际关系？',
      description: '社交媒体的普及改变了人们沟通的方式，我们需要探讨它对真实人际关系的影响。',
      leftSide: '促进了',
      rightSide: '阻碍了',
      streamId: 'stream-3'
    }
  ];

  topicTemplates.forEach(template => {
    topics.push({
      id: template.id,
      title: template.title,
      description: template.description,
      leftSide: template.leftSide,
      rightSide: template.rightSide,
      leftPosition: template.leftSide, // 兼容性字段
      rightPosition: template.rightSide, // 兼容性字段
      streamId: template.streamId,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  return topics;
};

// 投票数据
const generateMockVotes = () => {
  const votes = new Map();

  // 为每个直播流生成投票数据
  const streams = generateMockStreams();
  streams.forEach(stream => {
    const leftVotes = 245 + Math.floor(Math.random() * 100);
    const rightVotes = 198 + Math.floor(Math.random() * 100);
    const totalVotes = leftVotes + rightVotes;

    votes.set(stream.id, {
      streamId: stream.id,
      leftVotes,
      rightVotes,
      totalVotes,
      lastUpdated: new Date().toISOString(),
      // 模拟实时投票趋势
      voteHistory: Array.from({ length: 10 }, (_, i) => ({
        timestamp: new Date(Date.now() - (10 - i) * 60000).toISOString(),
        leftVotes: Math.max(0, leftVotes - Math.floor(Math.random() * 20)),
        rightVotes: Math.max(0, rightVotes - Math.floor(Math.random() * 20))
      }))
    });
  });

  return votes;
};

// 评论数据
const generateMockComments = () => {
  const comments = [
    {
      id: 'comment-1',
      contentId: 'content-1',
      text: '辩论得真精彩！',
      user: '张三',
      avatar: '👤',
      likes: 12,
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      isLiked: false
    },
    {
      id: 'comment-2',
      contentId: 'content-1',
      text: '正方辩手说得很有道理',
      user: '李四',
      avatar: '👤',
      likes: 8,
      createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      isLiked: false
    },
    {
      id: 'comment-3',
      contentId: 'content-2',
      text: '期待反方的反驳',
      user: '王五',
      avatar: '👤',
      likes: 5,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      isLiked: false
    }
  ];

  return comments;
};

// AI内容数据
const generateMockAiContent = () => {
  const aiContents = [
    {
      id: 'ai-1',
      streamId: 'stream-1',
      type: 'speech',
      content: '辩论双方正在激烈交锋',
      confidence: 0.85,
      timestamp: new Date().toISOString(),
      speaker: '正方辩手',
      emotion: '激动',
      keywords: ['辩论', '激烈', '交锋']
    },
    {
      id: 'ai-2',
      streamId: 'stream-1',
      type: 'emotion',
      content: '观众情绪高涨',
      confidence: 0.92,
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      speaker: '观众',
      emotion: '开心',
      keywords: ['观众', '情绪', '高涨']
    },
    {
      id: 'ai-3',
      streamId: 'stream-2',
      type: 'keyword',
      content: '检测到关键词：人工智能、自主意识',
      confidence: 0.78,
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      speaker: '反方辩手',
      emotion: '平静',
      keywords: ['人工智能', '自主意识']
    }
  ];

  return aiContents;
};

// 用户数据
const generateMockUsers = () => {
  const users = [
    { id: 'user-1', username: 'zhangsan', nickname: '张三', avatar: '👤', email: 'zhangsan@example.com' },
    { id: 'user-2', username: 'lisi', nickname: '李四', avatar: '👤', email: 'lisi@example.com' },
    { id: 'user-3', username: 'wangwu', nickname: '王五', avatar: '👤', email: 'wangwu@example.com' }
  ];
  return users;
};

// 直播状态数据
const generateMockLiveStatus = () => {
  return {
    isLive: true,
    liveStreamUrl: 'rtmp://192.168.31.189:1935/live/stream-1',
    currentStreamId: 'stream-1',
    startTime: new Date().toISOString(),
    viewers: 1250,
    status: 'active'
  };
};

// 数据概览
const generateMockDashboard = () => {
  return {
    isLive: true,
    liveStreamUrl: 'rtmp://192.168.31.189:1935/live/stream-1',
    totalUsers: 25000,
    activeUsers: 1250,
    totalVotes: 15000,
    totalComments: 850,
    totalStreams: 3,
    currentDebateTopic: '如果有一个能一键消除痛苦的按钮，你会按吗？',
    lastUpdated: new Date().toISOString()
  };
};

// RTMP转HLS地址生成
const generateMockRtmpUrls = (roomName) => {
  const baseUrl = 'http://192.168.31.189:8086'; // SRS服务器地址

  return {
    room_name: roomName,
    push_url: `rtmp://192.168.31.189:1935/live/${roomName}`,
    play_flv: `${baseUrl}/live/${roomName}.flv`,
    play_hls: `${baseUrl}/live/${roomName}.m3u8`
  };
};

// 导出所有数据生成函数
module.exports = {
  generateMockStreams,
  generateMockDebateTopics,
  generateMockVotes,
  generateMockComments,
  generateMockAiContent,
  generateMockUsers,
  generateMockLiveStatus,
  generateMockDashboard,
  generateMockRtmpUrls,

  // 初始化所有数据
  initAllData: () => ({
    streams: generateMockStreams(),
    debateTopics: generateMockDebateTopics(),
    votes: generateMockVotes(),
    comments: generateMockComments(),
    aiContents: generateMockAiContent(),
    users: generateMockUsers(),
    liveStatus: generateMockLiveStatus(),
    dashboard: generateMockDashboard()
  })
};

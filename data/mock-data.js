// -*- coding: utf-8 -*-
/**
 * Mock数据生成器
 * 使用faker.js生成各种模拟数据
 */

const { faker } = require('@faker-js/faker');
// 设置中文环境
faker.setLocale('zh_CN');

// 直播流数据
const generateMockStreams = () => {
  const streams = [];

  // 生成一些预设的直播流
  const streamTemplates = [
    { id: 'stream-1', name: '辩论赛场A', description: '正方vs反方精彩辩论', status: 'active' },
    { id: 'stream-2', name: '辩论赛场B', description: '青年辩论家对决', status: 'active' },
    { id: 'stream-3', name: '辩论赛场C', description: '模拟联合国辩论', status: 'inactive' },
  ];

  streamTemplates.forEach(template => {
    streams.push({
      id: template.id,
      name: template.name,
      description: template.description,
      status: template.status,
      viewers: faker.datatype.number({ min: 100, max: 10000 }),
      startTime: faker.date.recent().toISOString(),
      streamUrl: `rtmp://192.168.31.189:1935/live/${template.id}`,
      createdAt: faker.date.past().toISOString()
    });
  });

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
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString()
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
    const leftVotes = faker.datatype.number({ min: 100, max: 500 });
    const rightVotes = faker.datatype.number({ min: 100, max: 500 });
    const totalVotes = leftVotes + rightVotes;

    votes.set(stream.id, {
      streamId: stream.id,
      leftVotes,
      rightVotes,
      totalVotes,
      lastUpdated: faker.date.recent().toISOString(),
      // 模拟实时投票趋势
      voteHistory: Array.from({ length: 20 }, (_, i) => ({
        timestamp: new Date(Date.now() - (20 - i) * 60000).toISOString(),
        leftVotes: Math.max(0, leftVotes - faker.datatype.number({ min: 0, max: 50 })),
        rightVotes: Math.max(0, rightVotes - faker.datatype.number({ min: 0, max: 50 }))
      }))
    });
  });

  return votes;
};

// 评论数据
const generateMockComments = () => {
  const comments = [];

  // 生成一些评论
  const contentIds = ['content-1', 'content-2', 'content-3'];
  const users = ['张三', '李四', '王五', '赵六', '孙七', '周八'];

  contentIds.forEach(contentId => {
    // 每个内容生成5-15条评论
    const commentCount = faker.datatype.number({ min: 5, max: 15 });

    for (let i = 0; i < commentCount; i++) {
      comments.push({
        id: faker.datatype.uuid(),
        contentId,
        text: faker.lorem.sentences(faker.datatype.number({ min: 1, max: 3 })),
        user: faker.helpers.arrayElement(users),
        avatar: faker.image.avatar(),
        likes: faker.datatype.number({ min: 0, max: 100 }),
        createdAt: faker.date.recent().toISOString(),
        isLiked: faker.datatype.boolean()
      });
    }
  });

  return comments;
};

// AI内容数据
const generateMockAiContent = () => {
  const aiContents = [];

  const streams = generateMockStreams();

  streams.forEach(stream => {
    // 为每个直播流生成5-10条AI识别内容
    const contentCount = faker.datatype.number({ min: 5, max: 10 });

    for (let i = 0; i < contentCount; i++) {
      aiContents.push({
        id: faker.datatype.uuid(),
        streamId: stream.id,
        type: faker.helpers.arrayElement(['speech', 'emotion', 'gesture', 'keyword']),
        content: faker.lorem.sentences(2),
        confidence: faker.datatype.float({ min: 0.5, max: 0.95, precision: 0.01 }),
        timestamp: faker.date.recent().toISOString(),
        speaker: faker.helpers.arrayElement(['正方辩手', '反方辩手', '主持人', '观众']),
        emotion: faker.helpers.arrayElement(['开心', '愤怒', '平静', '激动', '困惑']),
        keywords: faker.lorem.words(3).split(' ')
      });
    }
  });

  return aiContents;
};

// 用户数据
const generateMockUsers = () => {
  const users = [];

  // 生成一些模拟用户
  for (let i = 0; i < 50; i++) {
    users.push({
      id: faker.datatype.uuid(),
      username: faker.internet.userName(),
      nickname: faker.name.fullName(),
      avatar: faker.image.avatar(),
      email: faker.internet.email(),
      createdAt: faker.date.past().toISOString(),
      lastLogin: faker.date.recent().toISOString()
    });
  }

  return users;
};

// 直播状态数据
const generateMockLiveStatus = () => {
  return {
    isLive: true,
    liveStreamUrl: 'rtmp://192.168.31.189:1935/live/stream-1',
    currentStreamId: 'stream-1',
    startTime: faker.date.recent().toISOString(),
    viewers: faker.datatype.number({ min: 1000, max: 5000 }),
    status: 'active'
  };
};

// 数据概览
const generateMockDashboard = () => {
  return {
    isLive: true,
    liveStreamUrl: 'rtmp://192.168.31.189:1935/live/stream-1',
    totalUsers: faker.datatype.number({ min: 10000, max: 50000 }),
    activeUsers: faker.datatype.number({ min: 1000, max: 5000 }),
    totalVotes: faker.datatype.number({ min: 10000, max: 50000 }),
    totalComments: faker.datatype.number({ min: 1000, max: 5000 }),
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

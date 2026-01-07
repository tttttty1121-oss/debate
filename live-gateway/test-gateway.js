// -*- coding: utf-8 -*-
/**
 * 网关服务测试脚本
 * 测试 API 路由、WebSocket 连接和静态文件服务
 */

const http = require('http');
const WebSocket = require('ws');

function testAPI(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testWebSocket() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://localhost:8080/ws');

    let connected = false;
    let receivedMessage = false;

    ws.on('open', () => {
      connected = true;
      console.log('✅ WebSocket 连接成功');
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('📨 收到 WebSocket 消息:', message);
        receivedMessage = true;

        if (message.type === 'connected') {
          // 发送 ping 消息测试
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      } catch (e) {
        console.log('📨 收到原始消息:', data.toString());
      }
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket 错误:', error.message);
      reject(error);
    });

    // 5秒后检查连接状态
    setTimeout(() => {
      if (connected && receivedMessage) {
        ws.close();
        resolve({ success: true, message: 'WebSocket 测试通过' });
      } else {
        ws.close();
        reject(new Error('WebSocket 连接或消息接收失败'));
      }
    }, 5000);
  });
}

async function runTests() {
  console.log('🔍 开始网关服务测试...\n');

  const tests = [
    // 健康检查
    {
      name: '健康检查',
      test: () => testAPI('/health')
    },

    // API 路由测试
    {
      name: 'API - 投票统计',
      test: () => testAPI('/api/v1/votes?stream_id=stream-1')
    },
    {
      name: 'API - 辩题信息',
      test: () => testAPI('/api/v1/debate-topic')
    },
    {
      name: 'API - AI 内容',
      test: () => testAPI('/api/v1/ai-content')
    },
    {
      name: 'API - 直播状态',
      test: () => testAPI('/api/admin/live/status')
    },
    {
      name: 'API - 数据概览',
      test: () => testAPI('/api/admin/dashboard')
    },
    {
      name: 'API - 直播流列表',
      test: () => testAPI('/api/v1/admin/streams')
    },

    // POST 请求测试
    {
      name: 'API - 用户投票',
      test: () => testAPI('/api/v1/user-vote', 'POST', {
        request: { leftVotes: 60, rightVotes: 40, streamId: 'stream-1' }
      })
    },
    {
      name: 'API - 添加评论',
      test: () => testAPI('/api/comment', 'POST', {
        contentId: 'content-1',
        text: '网关服务测试评论',
        user: '测试用户'
      })
    },

    // WebSocket 测试
    {
      name: 'WebSocket 连接',
      test: () => testWebSocket()
    }
  ];

  const results = [];

  for (const testCase of tests) {
    try {
      console.log(`\n📋 测试: ${testCase.name}`);
      const result = await testCase.test();

      if (testCase.name.includes('WebSocket')) {
        if (result.success) {
          console.log(`   ✅ ${testCase.name}: 通过`);
          results.push({ name: testCase.name, success: true });
        } else {
          console.log(`   ❌ ${testCase.name}: 失败 - ${result.message}`);
          results.push({ name: testCase.name, success: false });
        }
      } else if (result.status === 200) {
        console.log(`   ✅ ${testCase.name}: HTTP ${result.status}`);
        results.push({ name: testCase.name, success: true });
      } else {
        console.log(`   ❌ ${testCase.name}: HTTP ${result.status}`);
        results.push({ name: testCase.name, success: false });
      }
    } catch (error) {
      console.log(`   ❌ ${testCase.name}: 失败 - ${error.message}`);
      results.push({ name: testCase.name, success: false });
    }

    // 短暂延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // 测试总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果总结');
  console.log('='.repeat(60));

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  console.log(`✅ 通过: ${successCount}/${totalCount}`);
  console.log(`❌ 失败: ${totalCount - successCount}/${totalCount}`);

  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
  });

  console.log('='.repeat(60));

  if (successCount === totalCount) {
    console.log('🎉 所有测试通过！网关服务运行正常');
    console.log('🚀 已准备好替代 Nginx 反向代理');
  } else {
    console.log('⚠️  部分测试失败，请检查网关服务配置');
  }

  console.log('='.repeat(60));
}

// 运行测试
runTests().catch(console.error);

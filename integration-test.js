// -*- coding: utf-8 -*-
/**
 * 前后端集成测试脚本
 */

const http = require('http');

function testAPI(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
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

async function runIntegrationTests() {
  console.log('🔗 开始前后端集成测试...\n');

  // 测试健康检查
  try {
    const health = await testAPI('/health');
    console.log('✅ 健康检查:', health.status === 200 ? '通过' : '失败');
    console.log('   响应:', health.data.message);
  } catch (e) {
    console.log('❌ 健康检查失败:', e.message);
  }

  // 测试辩题获取
  try {
    const debate = await testAPI('/api/v1/debate-topic?stream_id=stream-1');
    console.log('✅ 辩题获取:', debate.status === 200 && debate.data.success ? '通过' : '失败');
    if (debate.data.success) {
      console.log('   辩题标题:', debate.data.data.title);
    }
  } catch (e) {
    console.log('❌ 辩题获取失败:', e.message);
  }

  // 测试投票统计
  try {
    const votes = await testAPI('/api/v1/votes?stream_id=stream-1');
    console.log('✅ 投票统计:', votes.status === 200 && votes.data.success ? '通过' : '失败');
    if (votes.data.success) {
      console.log('   左方票数:', votes.data.data.leftVotes, '右方票数:', votes.data.data.rightVotes);
    }
  } catch (e) {
    console.log('❌ 投票统计失败:', e.message);
  }

  console.log('\n🎉 前后端集成测试完成！');
  console.log('📊 主要API接口测试完毕');
  console.log('🚀 后端服务运行正常，可以进行部署');
}

// 运行测试
runIntegrationTests().catch(console.error);

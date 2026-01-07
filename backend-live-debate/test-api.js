// -*- coding: utf-8 -*-
/**
 * API测试脚本
 * 用于验证后端服务是否正常工作
 */

const http = require('http');

function testAPI(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            data: JSON.parse(body)
          };
          resolve(response);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🔍 开始API测试...\n');

  const baseUrl = 'http://localhost:8000';

  // 测试1: 健康检查
  try {
    console.log('📋 测试1: 健康检查');
    const health = await testAPI(`${baseUrl}/health`);
    console.log(`   ✅ 状态码: ${health.statusCode}`);
    console.log(`   📊 响应:`, health.data);
  } catch (error) {
    console.log(`   ❌ 健康检查失败:`, error.message);
  }

  // 测试2: 获取辩题
  try {
    console.log('\n📋 测试2: 获取辩题');
    const debate = await testAPI(`${baseUrl}/api/v1/debate-topic?stream_id=stream-1`);
    console.log(`   ✅ 状态码: ${debate.statusCode}`);
    console.log(`   📊 辩题:`, debate.data);
  } catch (error) {
    console.log(`   ❌ 获取辩题失败:`, error.message);
  }

  // 测试3: 获取投票统计
  try {
    console.log('\n📋 测试3: 获取投票统计');
    const votes = await testAPI(`${baseUrl}/api/v1/votes?stream_id=stream-1`);
    console.log(`   ✅ 状态码: ${votes.statusCode}`);
    console.log(`   📊 投票数据:`, votes.data);
  } catch (error) {
    console.log(`   ❌ 获取投票统计失败:`, error.message);
  }

  // 测试4: 获取直播流列表
  try {
    console.log('\n📋 测试4: 获取直播流列表');
    const streams = await testAPI(`${baseUrl}/api/v1/admin/streams`);
    console.log(`   ✅ 状态码: ${streams.statusCode}`);
    console.log(`   📊 直播流数量:`, streams.data?.data?.streams?.length || 0);
  } catch (error) {
    console.log(`   ❌ 获取直播流列表失败:`, error.message);
  }

  // 测试5: 用户投票
  try {
    console.log('\n📋 测试5: 用户投票');
    const voteData = {
      request: {
        leftVotes: 50,
        rightVotes: 50,
        streamId: 'stream-1',
        userId: 'test-user'
      }
    };
    const voteResult = await testAPI(`${baseUrl}/api/v1/user-vote`, 'POST', voteData);
    console.log(`   ✅ 状态码: ${voteResult.statusCode}`);
    console.log(`   📊 投票结果:`, voteResult.data);
  } catch (error) {
    console.log(`   ❌ 用户投票失败:`, error.message);
  }

  // 测试6: 添加评论
  try {
    console.log('\n📋 测试6: 添加评论');
    const commentData = {
      contentId: 'content-1',
      text: '测试评论内容',
      user: '测试用户',
      avatar: '👤'
    };
    const commentResult = await testAPI(`${baseUrl}/api/comment`, 'POST', commentData);
    console.log(`   ✅ 状态码: ${commentResult.statusCode}`);
    console.log(`   📊 评论结果:`, commentResult.data);
  } catch (error) {
    console.log(`   ❌ 添加评论失败:`, error.message);
  }

  console.log('\n✅ API测试完成！');
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAPI, runTests };

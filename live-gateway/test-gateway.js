// -*- coding: utf-8 -*-
/**
 * 网关服务测试脚本
 * 测试 API 路由、WebSocket 连接和静态文件服务
 */

const http = require('http');

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
      name: 'API - 直播状态',
      test: () => testAPI('/api/admin/live/status')
    }
  ];

  const results = [];

  for (const testCase of tests) {
    try {
      console.log(`📋 测试: ${testCase.name}`);
      const result = await testCase.test();

      if (result.status === 200) {
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

  if (successCount === totalCount) {
    console.log('🎉 网关服务测试通过！');
  } else {
    console.log('⚠️  部分测试失败');
  }

  console.log('='.repeat(60));
}

// 运行测试
runTests().catch(console.error);

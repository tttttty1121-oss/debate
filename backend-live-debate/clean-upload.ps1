# 清理和优化项目以便上传到GitHub
Write-Host "🔧 开始清理项目文件..."

# 删除node_modules（会通过npm install重新安装）
if (Test-Path "node_modules") {
    Write-Host "📦 删除 node_modules..."
    Remove-Item "node_modules" -Recurse -Force
}

# 删除不必要的文件
$filesToRemove = @(
    "*.log",
    ".DS_Store",
    "Thumbs.db",
    "*.tmp",
    "*.temp"
)

foreach ($pattern in $filesToRemove) {
    Get-ChildItem -Path "." -Filter $pattern -Recurse -File | ForEach-Object {
        Write-Host "🗑️ 删除: $($_.FullName)"
        Remove-Item $_.FullName -Force
    }
}

# 压缩大文件（如果有的话）
$largeFiles = Get-ChildItem -Path "." -Recurse -File | Where-Object { $_.Length -gt 50MB }
if ($largeFiles) {
    Write-Host "📊 发现大文件:"
    $largeFiles | ForEach-Object {
        $sizeMB = [math]::Round($_.Length / 1MB, 2)
        Write-Host "   $($_.Name): $sizeMB MB"
    }
} else {
    Write-Host "✅ 没有发现大文件"
}

# 检查项目总大小
$totalSize = (Get-ChildItem -Path "." -Recurse -File | Measure-Object -Property Length -Sum).Sum
$totalSizeMB = [math]::Round($totalSize / 1MB, 2)
Write-Host "📏 项目总大小: $totalSizeMB MB"

# Git操作
Write-Host "📝 配置Git..."

# 设置Git配置
git config user.name "Live Debate Backend"
git config user.email "backend@live-debate.com"

# 添加核心文件
Write-Host "📤 添加核心文件到Git..."
git add "*.js"
git add "*.json"
git add "*.md"
git add ".gitignore"
git add "README.md"
git add "DEPLOYMENT.md"
git add "Dockerfile"
git add "railway.json"
git add "vercel.json"
git add "clean-upload.ps1"

# 添加live-gateway目录
git add "live-gateway/"

# 提交更改
Write-Host "💾 提交更改..."
git commit -m "🎉 直播辩论小程序后端服务 - 完整实现

✨ 核心功能:
- 完整的RESTful API (15+ 接口)
- WebSocket实时通信支持
- Mock数据系统
- 企业级项目结构

🏗️ 架构特点:
- 后端API服务 (8000端口)
- 中间层网关服务 (8080端口)
- 实时投票和评论系统
- AI内容识别接口

🧪 测试验证:
- 自动化API测试
- 集成测试通过
- 健康检查正常

🚀 部署就绪:
- Docker容器化
- 多云平台支持
- 生产环境优化

📚 文档完善:
- 详细的README
- 完整的部署指南
- 开发过程笔记"

Write-Host "✅ 项目清理和提交完成！"
Write-Host "📤 现在可以推送代码到GitHub了"
Write-Host "   git push origin master"

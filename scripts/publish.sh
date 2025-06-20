#!/bin/bash

# NPM发布脚本
# 使用方法: ./scripts/publish.sh [patch|minor|major|beta|alpha]

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印彩色信息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查参数
VERSION_TYPE=${1:-patch}
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major|beta|alpha)$ ]]; then
    print_error "无效的版本类型: $VERSION_TYPE"
    echo "使用方法: $0 [patch|minor|major|beta|alpha]"
    exit 1
fi

print_info "开始发布流程，版本类型: $VERSION_TYPE"

# 检查是否在主分支
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$VERSION_TYPE" != "beta" ] && [ "$VERSION_TYPE" != "alpha" ]; then
    print_warning "当前不在main分支 ($CURRENT_BRANCH)，确定要继续吗? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_info "发布已取消"
        exit 0
    fi
fi

# 检查工作区是否干净
if ! git diff-index --quiet HEAD --; then
    print_error "工作区有未提交的更改，请先提交或暂存"
    exit 1
fi

# 检查是否已登录npm
if ! npm whoami &> /dev/null; then
    print_error "未登录npm，请先运行: npm login"
    exit 1
fi

# 清理并构建
print_info "清理旧的构建文件..."
npm run clean

print_info "构建项目..."
npm run build

# 检查构建是否成功
if [ ! -d "dist" ]; then
    print_error "构建失败，dist目录不存在"
    exit 1
fi

# 显示当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_info "当前版本: $CURRENT_VERSION"

# 更新版本并发布
case $VERSION_TYPE in
    "patch")
        print_info "发布补丁版本..."
        npm run publish:patch
        ;;
    "minor")
        print_info "发布次要版本..."
        npm run publish:minor
        ;;
    "major")
        print_info "发布主要版本..."
        npm run publish:major
        ;;
    "beta")
        print_info "发布beta版本..."
        npm run publish:beta
        ;;
    "alpha")
        print_info "发布alpha版本..."
        npm run publish:alpha
        ;;
esac

# 获取新版本
NEW_VERSION=$(node -p "require('./package.json').version")
print_success "✅ 发布成功！"
print_success "📦 包名: $(node -p "require('./package.json').name")"
print_success "🏷️  新版本: $NEW_VERSION"
print_success "🔗 NPM链接: https://www.npmjs.com/package/$(node -p "require('./package.json').name")"

# 推送git标签到远程仓库
if git remote | grep -q origin; then
    print_info "推送git标签到远程仓库..."
    git push origin --tags
    print_success "Git标签已推送"
else
    print_warning "未找到origin远程仓库，跳过推送标签"
fi

print_success "🎉 发布流程完成！" 
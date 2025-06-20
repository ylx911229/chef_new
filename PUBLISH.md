# NPM 发布指南

本项目已配置了完整的NPM发布流程，包含多种发布方式。

## 🚀 快速发布

### 使用npm脚本（推荐）

```bash
# 发布补丁版本 (1.0.0 -> 1.0.1)
npm run publish:patch

# 发布次要版本 (1.0.0 -> 1.1.0)
npm run publish:minor

# 发布主要版本 (1.0.0 -> 2.0.0)
npm run publish:major

# 发布beta版本 (1.0.0 -> 1.0.1-beta.0)
npm run publish:beta

# 发布alpha版本 (1.0.0 -> 1.0.1-alpha.0)
npm run publish:alpha

# 直接发布当前版本（不更新版本号）
npm run release
```

### 使用发布脚本（功能更完整）

```bash
# 发布补丁版本
./scripts/publish.sh patch

# 发布次要版本
./scripts/publish.sh minor

# 发布主要版本
./scripts/publish.sh major

# 发布beta版本
./scripts/publish.sh beta

# 发布alpha版本
./scripts/publish.sh alpha

# 默认发布补丁版本
./scripts/publish.sh
```

## 📋 发布前准备

### 1. 登录NPM
```bash
npm login
```

### 2. 检查登录状态
```bash
npm whoami
```

### 3. 更新包信息（首次发布）
在 `package.json` 中更新以下信息：
- `name`: 包名（确保在NPM上可用）
- `repository.url`: Git仓库URL
- `bugs.url`: 问题反馈URL
- `homepage`: 项目主页URL

## 🔍 发布流程说明

发布脚本会自动执行以下步骤：

1. **环境检查**
   - 检查是否登录NPM
   - 检查Git工作区是否干净
   - 检查是否在合适的分支

2. **构建项目**
   - 清理旧的构建文件
   - 编译TypeScript代码
   - 验证构建结果

3. **版本管理**
   - 自动更新版本号
   - 创建Git标签
   - 提交更改

4. **发布包**
   - 上传到NPM仓库
   - 推送Git标签到远程仓库

## 📦 发布的文件

根据 `package.json` 中的 `files` 字段，以下文件会被包含在NPM包中：
- `dist/**/*` - 编译后的JavaScript文件
- `README.md` - 项目说明
- `package.json` - 包配置
- `LICENSE` - 许可证文件

## 🏷️ 版本说明

- **patch**: 修复bug，向后兼容 (1.0.0 -> 1.0.1)
- **minor**: 新功能，向后兼容 (1.0.0 -> 1.1.0)
- **major**: 破坏性更改 (1.0.0 -> 2.0.0)
- **beta**: 测试版本 (1.0.0 -> 1.0.1-beta.0)
- **alpha**: 内部测试版本 (1.0.0 -> 1.0.1-alpha.0)

## ⚠️ 注意事项

1. **首次发布前**，确保包名在NPM上可用
2. **正式版本**建议在main分支发布
3. **测试版本**（beta/alpha）可以在任何分支发布
4. 发布前确保所有更改已提交到Git
5. 确保构建通过且功能正常

## 🔧 故障排除

### 包名已存在
```bash
npm ERR! 403 Forbidden - PUT https://registry.npmjs.org/package-name - You do not have permission to publish "package-name".
```
解决方案：更改 `package.json` 中的包名

### 未登录NPM
```bash
npm ERR! code ENEEDAUTH
```
解决方案：运行 `npm login` 登录

### 工作区不干净
```bash
工作区有未提交的更改，请先提交或暂存
```
解决方案：提交或暂存所有更改
```bash
git add .
git commit -m "发布前的更改"
```

## 📊 发布后验证

发布成功后，可以通过以下方式验证：

1. **检查NPM包页面**
   ```
   https://www.npmjs.com/package/your-package-name
   ```

2. **测试安装**
   ```bash
   npm install your-package-name
   ```

3. **检查版本**
   ```bash
   npm view your-package-name version
   ``` 
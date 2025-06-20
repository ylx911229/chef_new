#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { RecipeService } from './recipeService.js';
import { Recipe } from './types.js';

class ChefMCPServer {
  private server: Server;
  private recipeService: RecipeService;

  constructor() {
    this.server = new Server(
      {
        name: 'chef-recipe-server',
        version: '1.0.0',
      }
    );

    this.recipeService = new RecipeService();
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search_recipes',
          description: '根据菜名、食材或描述搜索菜谱',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: '搜索关键词，可以是菜名、食材名或菜谱描述',
              },
              limit: {
                type: 'number',
                description: '返回结果数量限制，默认为5',
                default: 5,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_recipe_detail',
          description: '根据菜谱ID获取详细信息',
          inputSchema: {
            type: 'object',
            properties: {
              recipe_id: {
                type: 'string',
                description: '菜谱的唯一标识符',
              },
            },
            required: ['recipe_id'],
          },
        },
        {
          name: 'get_recipes_by_category',
          description: '根据分类获取菜谱列表',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: '菜谱分类，如：水产、早餐、素菜、主食等',
              },
            },
            required: ['category'],
          },
        },
        {
          name: 'get_categories',
          description: '获取所有可用的菜谱分类',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_recipes':
            return await this.handleSearchRecipes(args);
          case 'get_recipe_detail':
            return await this.handleGetRecipeDetail(args);
          case 'get_recipes_by_category':
            return await this.handleGetRecipesByCategory(args);
          case 'get_categories':
            return await this.handleGetCategories();
          default:
            throw new Error(`未知的工具: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `错误: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleSearchRecipes(args: any) {
    const { query, limit = 5 } = args;

    if (!query?.trim()) {
      throw new Error('搜索关键词不能为空');
    }

    const results = this.recipeService.searchRecipes(query, limit);

    if (results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `没有找到与"${query}"相关的菜谱。请尝试使用其他关键词搜索。`,
          },
        ],
      };
    }

    const formattedResults = results.map((result, index) => {
      const recipe = result.recipe;
      return `${index + 1}. **${recipe.name}**
   - 分类: ${recipe.category}
   - 难度: ${'★'.repeat(recipe.difficulty)}
   - 描述: ${recipe.description.slice(0, 100)}...
   - 食材数量: ${recipe.ingredients.length}个
   - 步骤数量: ${recipe.steps.length}步
   - 匹配度: ${(1 - result.score).toFixed(2)}
   - ID: ${recipe.id}`;
    }).join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `找到 ${results.length} 个相关菜谱：\n\n${formattedResults}\n\n💡 使用 get_recipe_detail 工具获取完整的制作步骤和食材清单。`,
        },
      ],
    };
  }

  private async handleGetRecipeDetail(args: any) {
    const { recipe_id } = args;

    if (!recipe_id) {
      throw new Error('菜谱ID不能为空');
    }

    const recipe = this.recipeService.getRecipeById(recipe_id);

    if (!recipe) {
      throw new Error(`找不到ID为"${recipe_id}"的菜谱`);
    }

    const formattedRecipe = this.formatRecipeDetail(recipe);

    return {
      content: [
        {
          type: 'text',
          text: formattedRecipe,
        },
      ],
    };
  }

  private async handleGetRecipesByCategory(args: any) {
    const { category } = args;

    if (!category) {
      throw new Error('分类不能为空');
    }

    const recipes = this.recipeService.getRecipesByCategory(category);

    if (recipes.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `分类"${category}"下没有找到菜谱。请使用 get_categories 工具查看所有可用分类。`,
          },
        ],
      };
    }

    const formattedRecipes = recipes.map((recipe, index) => {
      return `${index + 1}. **${recipe.name}** (ID: ${recipe.id})
   - 难度: ${'★'.repeat(recipe.difficulty)}
   - 描述: ${recipe.description.slice(0, 80)}...`;
    }).join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `分类"${category}"下共有 ${recipes.length} 个菜谱：\n\n${formattedRecipes}`,
        },
      ],
    };
  }

  private async handleGetCategories() {
    const categories = this.recipeService.getCategories();

    return {
      content: [
        {
          type: 'text',
          text: `共有 ${categories.length} 个菜谱分类：\n\n${categories.map(cat => `• ${cat}`).join('\n')}`,
        },
      ],
    };
  }

  private formatRecipeDetail(recipe: Recipe): string {
    const ingredients = recipe.ingredients.map(ing => `• ${ing.text_quantity}`).join('\n');
    const steps = recipe.steps.map(step => `${step.step}. ${step.description}`).join('\n');
    const notes = recipe.additional_notes.length > 0 ? 
      `\n## 备注\n${recipe.additional_notes.map(note => `• ${note}`).join('\n')}` : '';

    return `# ${recipe.name}

## 基本信息
- **分类**: ${recipe.category}
- **难度**: ${'★'.repeat(recipe.difficulty)} (${recipe.difficulty}/5)
- **份数**: ${recipe.servings}人份
- **标签**: ${recipe.tags.join(', ')}

## 描述
${recipe.description}

## 食材清单
${ingredients}

## 制作步骤
${steps}${notes}

---
*菜谱ID: ${recipe.id}*`;
  }

  async run(): Promise<void> {
    // 启动时加载菜谱数据
    console.log('正在启动Chef MCP服务器...');
    
    try {
      await this.recipeService.loadRecipes();
      console.log('菜谱数据加载完成');
    } catch (error) {
      console.error('启动失败:', error);
      process.exit(1);
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('Chef MCP服务器已启动，等待连接...');
  }
}

// 启动服务器
const server = new ChefMCPServer();
server.run().catch((error) => {
  console.error('服务器运行失败:', error);
  process.exit(1);
}); 
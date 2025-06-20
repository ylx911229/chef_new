import fetch from 'node-fetch';
import Fuse from 'fuse.js';
import { Recipe, SearchResult } from './types.js';

export class RecipeService {
  private recipes: Recipe[] = [];
  private fuse: Fuse<Recipe> | null = null;
  private readonly dataUrl = 'https://weilei.site/all_recipes.json';

  constructor() {
    this.initializeFuse();
  }

  private initializeFuse() {
    // 配置Fuse.js进行模糊搜索
    const fuseOptions = {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.2 },
        { name: 'category', weight: 0.1 },
        { name: 'tags', weight: 0.1 },
        { name: 'ingredients.name', weight: 0.2 }
      ],
      threshold: 0.4, // 调整搜索精度，0为完全匹配，1为任意匹配
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 1
    };

    this.fuse = new Fuse([], fuseOptions);
  }

  /**
   * 从远程URL获取菜谱数据
   */
  async loadRecipes(): Promise<void> {
    try {
      console.log('正在从远程数据源获取菜谱数据...');
      const response = await fetch(this.dataUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.recipes = Array.isArray(data) ? data : [];
      
      // 更新Fuse搜索索引
      if (this.fuse) {
        this.fuse.setCollection(this.recipes);
      }

      console.log(`成功加载 ${this.recipes.length} 个菜谱`);
    } catch (error) {
      console.error('加载菜谱数据失败:', error);
      throw new Error('无法获取菜谱数据，请检查网络连接');
    }
  }

  /**
   * 搜索菜谱
   * @param query 搜索关键词
   * @param limit 返回结果数量限制
   * @returns 搜索结果
   */
  searchRecipes(query: string, limit: number = 5): SearchResult[] {
    if (!this.fuse || this.recipes.length === 0) {
      throw new Error('菜谱数据尚未加载，请先调用 loadRecipes()');
    }

    if (!query.trim()) {
      return [];
    }

    const fuseResults = this.fuse.search(query, { limit });
    
    return fuseResults.map(result => ({
      recipe: result.item,
      score: result.score || 0,
      matches: result.matches?.map(match => match.key || '') || []
    }));
  }

  /**
   * 根据ID获取特定菜谱
   * @param id 菜谱ID
   * @returns 菜谱详情
   */
  getRecipeById(id: string): Recipe | undefined {
    return this.recipes.find(recipe => recipe.id === id);
  }

  /**
   * 根据分类获取菜谱
   * @param category 菜谱分类
   * @returns 该分类下的所有菜谱
   */
  getRecipesByCategory(category: string): Recipe[] {
    return this.recipes.filter(recipe => 
      recipe.category === category || recipe.tags.includes(category)
    );
  }

  /**
   * 获取所有可用的分类
   * @returns 分类列表
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    this.recipes.forEach(recipe => {
      categories.add(recipe.category);
      recipe.tags.forEach(tag => categories.add(tag));
    });
    return Array.from(categories).sort();
  }

  /**
   * 获取菜谱总数
   * @returns 菜谱数量
   */
  getRecipeCount(): number {
    return this.recipes.length;
  }
} 
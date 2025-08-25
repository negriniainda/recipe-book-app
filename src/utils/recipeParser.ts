// Types are defined inline to avoid import issues

export interface ParsedRecipe {
  title: string;
  description?: string;
  ingredients: Array<{
    name: string;
    quantity?: number;
    unit?: string;
  }>;
  instructions: Array<{
    stepNumber: number;
    description: string;
    duration?: number;
  }>;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  categories?: string[];
  tags?: string[];
  images?: string[];
  sourceUrl?: string;
  originalAuthor?: string;
}

export class RecipeParser {
  /**
   * Parse recipe from plain text
   */
  static parseFromText(text: string): ParsedRecipe {
    const lines = text.split('\n').filter(line => line.trim());
    
    let title = '';
    let description = '';
    let ingredients: Array<{name: string; quantity?: number; unit?: string}> = [];
    let instructions: Array<{stepNumber: number; description: string; duration?: number}> = [];
    let currentSection = 'title';
    let stepNumber = 1;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) continue;
      
      // Detect title (first non-empty line)
      if (!title && trimmedLine) {
        title = trimmedLine;
        continue;
      }
      
      // Detect sections
      if (this.isIngredientsSection(trimmedLine)) {
        currentSection = 'ingredients';
        continue;
      }
      
      if (this.isInstructionsSection(trimmedLine)) {
        currentSection = 'instructions';
        stepNumber = 1;
        continue;
      }
      
      // Parse content based on current section
      if (currentSection === 'ingredients') {
        const ingredient = this.parseIngredient(trimmedLine);
        if (ingredient) {
          ingredients.push(ingredient);
        }
      } else if (currentSection === 'instructions') {
        const instruction = this.parseInstruction(trimmedLine, stepNumber);
        if (instruction) {
          instructions.push(instruction);
          stepNumber++;
        }
      } else if (currentSection === 'title' && !description) {
        // Second line might be description
        description = trimmedLine;
      }
    }
    
    return {
      title: title || 'Receita Importada',
      description,
      ingredients,
      instructions,
    };
  }

  /**
   * Parse recipe from structured JSON-LD (common in recipe websites)
   */
  static parseFromJsonLd(jsonLd: any): ParsedRecipe {
    const recipe = jsonLd['@type'] === 'Recipe' ? jsonLd : jsonLd.recipe;
    
    if (!recipe) {
      throw new Error('Invalid JSON-LD recipe format');
    }
    
    const ingredients = Array.isArray(recipe.recipeIngredient)
      ? recipe.recipeIngredient.map((ing: string) => this.parseIngredient(ing)).filter(Boolean)
      : [];
    
    const instructions = Array.isArray(recipe.recipeInstructions)
      ? recipe.recipeInstructions.map((inst: any, index: number) => {
          const text = typeof inst === 'string' ? inst : inst.text || inst.name;
          return this.parseInstruction(text, index + 1);
        }).filter(Boolean)
      : [];
    
    return {
      title: recipe.name || 'Receita Importada',
      description: recipe.description,
      ingredients,
      instructions,
      prepTime: this.parseDuration(recipe.prepTime),
      cookTime: this.parseDuration(recipe.cookTime),
      servings: this.parseServings(recipe.recipeYield),
      categories: this.parseCategories(recipe.recipeCategory),
      tags: this.parseTags(recipe.keywords),
      images: this.parseImages(recipe.image),
      originalAuthor: this.parseAuthor(recipe.author),
    };
  }

  /**
   * Parse recipe from microdata format
   */
  static parseFromMicrodata(data: any): ParsedRecipe {
    // Similar to JSON-LD but with different structure
    return this.parseFromJsonLd(data);
  }

  /**
   * Extract recipe from social media post
   */
  static parseFromSocialMedia(platform: string, data: any): ParsedRecipe {
    switch (platform) {
      case 'instagram':
        return this.parseFromInstagram(data);
      case 'tiktok':
        return this.parseFromTikTok(data);
      case 'youtube':
        return this.parseFromYouTube(data);
      default:
        throw new Error(`Unsupported social media platform: ${platform}`);
    }
  }

  // Private helper methods
  private static isIngredientsSection(line: string): boolean {
    const ingredientKeywords = [
      'ingrediente', 'ingredients', 'material', 'materiais',
      'você vai precisar', 'precisa de', 'lista de compras'
    ];
    
    return ingredientKeywords.some(keyword => 
      line.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private static isInstructionsSection(line: string): boolean {
    const instructionKeywords = [
      'preparo', 'modo de preparo', 'instruções', 'instructions',
      'como fazer', 'passo a passo', 'método', 'procedimento'
    ];
    
    return instructionKeywords.some(keyword => 
      line.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private static parseIngredient(line: string): {name: string; quantity?: number; unit?: string} | null {
    if (!line.trim()) return null;
    
    // Remove bullet points and numbers
    let cleanLine = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
    
    // Try to extract quantity and unit
    const quantityMatch = cleanLine.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-ZÀ-ÿ]+)?\s+(.+)/);
    
    if (quantityMatch) {
      const [, quantityStr, unit, name] = quantityMatch;
      const quantity = parseFloat(quantityStr.replace(',', '.'));
      
      return {
        name: name.trim(),
        quantity: isNaN(quantity) ? undefined : quantity,
        unit: unit?.trim(),
      };
    }
    
    // If no quantity found, treat entire line as ingredient name
    return {
      name: cleanLine,
    };
  }

  private static parseInstruction(line: string, stepNumber: number): {stepNumber: number; description: string; duration?: number} | null {
    if (!line.trim()) return null;
    
    // Remove step numbers if present
    let cleanLine = line.replace(/^\d+\.\s*/, '').trim();
    
    // Try to extract duration from instruction
    const durationMatch = cleanLine.match(/(\d+)\s*(minutos?|min|horas?|h)/i);
    let duration: number | undefined;
    
    if (durationMatch) {
      const [, timeStr, unit] = durationMatch;
      const time = parseInt(timeStr);
      duration = unit.toLowerCase().startsWith('h') ? time * 60 : time;
    }
    
    return {
      stepNumber,
      description: cleanLine,
      duration,
    };
  }

  private static parseDuration(duration: string | undefined): number | undefined {
    if (!duration) return undefined;
    
    // Parse ISO 8601 duration (PT15M = 15 minutes)
    const isoMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (isoMatch) {
      const [, hours, minutes] = isoMatch;
      return (parseInt(hours || '0') * 60) + parseInt(minutes || '0');
    }
    
    // Parse simple number
    const numberMatch = duration.match(/(\d+)/);
    if (numberMatch) {
      return parseInt(numberMatch[1]);
    }
    
    return undefined;
  }

  private static parseServings(recipeYield: any): number | undefined {
    if (typeof recipeYield === 'number') return recipeYield;
    if (typeof recipeYield === 'string') {
      const match = recipeYield.match(/(\d+)/);
      return match ? parseInt(match[1]) : undefined;
    }
    return undefined;
  }

  private static parseCategories(categories: any): string[] {
    if (Array.isArray(categories)) return categories;
    if (typeof categories === 'string') return [categories];
    return [];
  }

  private static parseTags(keywords: any): string[] {
    if (Array.isArray(keywords)) return keywords;
    if (typeof keywords === 'string') {
      return keywords.split(',').map(tag => tag.trim());
    }
    return [];
  }

  private static parseImages(images: any): string[] {
    if (Array.isArray(images)) {
      return images.map(img => typeof img === 'string' ? img : img.url).filter(Boolean);
    }
    if (typeof images === 'string') return [images];
    if (images?.url) return [images.url];
    return [];
  }

  private static parseAuthor(author: any): string | undefined {
    if (typeof author === 'string') return author;
    if (author?.name) return author.name;
    return undefined;
  }

  private static parseFromInstagram(data: any): ParsedRecipe {
    // Extract recipe from Instagram post caption
    const caption = data.caption || data.text || '';
    const parsed = this.parseFromText(caption);
    
    return {
      ...parsed,
      images: data.images || [],
      sourceUrl: data.url,
      originalAuthor: data.username,
      tags: [...(parsed.tags || []), ...(data.hashtags || [])],
    };
  }

  private static parseFromTikTok(data: any): ParsedRecipe {
    // Extract recipe from TikTok video description
    const description = data.description || data.text || '';
    const parsed = this.parseFromText(description);
    
    return {
      ...parsed,
      images: data.thumbnail ? [data.thumbnail] : [],
      sourceUrl: data.url,
      originalAuthor: data.username,
      tags: [...(parsed.tags || []), ...(data.hashtags || [])],
    };
  }

  private static parseFromYouTube(data: any): ParsedRecipe {
    // Extract recipe from YouTube video description
    const description = data.description || '';
    const parsed = this.parseFromText(description);
    
    return {
      ...parsed,
      title: data.title || parsed.title,
      description: data.description,
      images: data.thumbnail ? [data.thumbnail] : [],
      sourceUrl: data.url,
      originalAuthor: data.channelName,
      tags: [...(parsed.tags || []), ...(data.tags || [])],
    };
  }
}

export default RecipeParser;
import {useState, useCallback} from 'react';
import {Alert} from 'react-native';
import {
  useImportFromUrlMutation,
  useImportFromTextMutation,
  useImportFromSocialMutation,
  useValidateUrlQuery,
  useSaveImportedRecipeMutation,
} from '../services/recipeImportApi';
// Import types inline to avoid circular dependencies
interface ImportRecipeResponse {
  recipe: {
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
  };
  confidence: number;
  warnings?: string[];
}

interface CreateRecipeInput {
  title: string;
  description: string;
  ingredients: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    category: string;
    optional: boolean;
  }>;
  instructions: Array<{
    id: string;
    stepNumber: number;
    description: string;
    duration?: number;
  }>;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  categories: string[];
  tags: string[];
  images: string[];
  sourceUrl?: string;
  originalAuthor?: string;
  userId: string;
  isPublic: boolean;
  isFavorite: boolean;
  rating: number;
  notes: string;
  likes: number;
  comments: any[];
}

export interface ImportOptions {
  extractNutrition: boolean;
  autoCategories: boolean;
  extractImages: boolean;
  extractVideo: boolean;
  language: string;
}

export interface ImportState {
  isImporting: boolean;
  isSaving: boolean;
  importedData: ImportRecipeResponse | null;
  error: string | null;
}

export const useRecipeImport = () => {
  const [state, setState] = useState<ImportState>({
    isImporting: false,
    isSaving: false,
    importedData: null,
    error: null,
  });

  const [importFromUrl] = useImportFromUrlMutation();
  const [importFromText] = useImportFromTextMutation();
  const [importFromSocial] = useImportFromSocialMutation();
  const [saveImportedRecipe] = useSaveImportedRecipeMutation();

  const defaultOptions: ImportOptions = {
    extractNutrition: true,
    autoCategories: true,
    extractImages: true,
    extractVideo: false,
    language: 'pt-BR',
  };

  const detectSourceType = useCallback((input: string): 'url' | 'social' | 'text' => {
    // Check if it's a URL
    const urlRegex = /^https?:\/\/.+/i;
    if (urlRegex.test(input.trim())) {
      // Check if it's a social media URL
      const socialPlatforms = ['instagram.com', 'tiktok.com', 'youtube.com', 'youtu.be'];
      if (socialPlatforms.some(platform => input.includes(platform))) {
        return 'social';
      }
      return 'url';
    }
    
    return 'text';
  }, []);

  const getSocialPlatform = useCallback((url: string): 'instagram' | 'tiktok' | 'youtube' | null => {
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    return null;
  }, []);

  const importRecipe = useCallback(async (
    input: string,
    options: Partial<ImportOptions> = {}
  ): Promise<ImportRecipeResponse | null> => {
    if (!input.trim()) {
      setState(prev => ({...prev, error: 'Input não pode estar vazio'}));
      return null;
    }

    const finalOptions = {...defaultOptions, ...options};
    const sourceType = detectSourceType(input);

    setState(prev => ({
      ...prev,
      isImporting: true,
      error: null,
      importedData: null,
    }));

    try {
      let result: ImportRecipeResponse;

      switch (sourceType) {
        case 'url':
          result = await importFromUrl({
            url: input.trim(),
            options: finalOptions,
          }).unwrap();
          break;

        case 'social':
          const platform = getSocialPlatform(input);
          if (!platform) {
            throw new Error('Plataforma social não suportada');
          }
          result = await importFromSocial({
            platform,
            url: input.trim(),
            options: finalOptions,
          }).unwrap();
          break;

        case 'text':
          result = await importFromText({
            text: input.trim(),
            options: finalOptions,
          }).unwrap();
          break;

        default:
          throw new Error('Tipo de fonte não reconhecido');
      }

      setState(prev => ({
        ...prev,
        isImporting: false,
        importedData: result,
      }));

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao importar receita';
      setState(prev => ({
        ...prev,
        isImporting: false,
        error: errorMessage,
      }));

      Alert.alert(
        'Erro na Importação',
        errorMessage,
        [{text: 'OK'}]
      );

      return null;
    }
  }, [
    importFromUrl,
    importFromText,
    importFromSocial,
    detectSourceType,
    getSocialPlatform,
    defaultOptions,
  ]);

  const saveRecipe = useCallback(async (
    importedData: ImportRecipeResponse,
    userId: string,
    customData?: Partial<CreateRecipeInput>
  ): Promise<boolean> => {
    if (!importedData) {
      setState(prev => ({...prev, error: 'Nenhum dado para salvar'}));
      return false;
    }

    setState(prev => ({...prev, isSaving: true, error: null}));

    try {
      const recipe = importedData.recipe;
      
      const recipeData: CreateRecipeInput = {
        title: recipe.title,
        description: recipe.description || '',
        ingredients: recipe.ingredients.map((ing, index) => ({
          id: `imported-${index}`,
          name: ing.name,
          quantity: ing.quantity || 0,
          unit: ing.unit || '',
          category: 'other' as const,
          optional: false,
        })),
        instructions: recipe.instructions.map(inst => ({
          id: `step-${inst.stepNumber}`,
          stepNumber: inst.stepNumber,
          description: inst.description,
          duration: inst.duration,
        })),
        prepTime: recipe.prepTime || 0,
        cookTime: recipe.cookTime || 0,
        servings: recipe.servings || 4,
        difficulty: 'medium' as any,
        categories: recipe.categories || [],
        tags: recipe.tags || [],
        images: recipe.images || [],
        sourceUrl: recipe.sourceUrl,
        originalAuthor: recipe.originalAuthor,
        userId,
        isPublic: true,
        isFavorite: false,
        rating: 0,
        notes: `Importado automaticamente`,
        likes: 0,
        comments: [],
        ...customData,
      };

      await saveImportedRecipe(recipeData).unwrap();

      setState(prev => ({
        ...prev,
        isSaving: false,
        importedData: null,
      }));

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao salvar receita';
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: errorMessage,
      }));

      Alert.alert(
        'Erro ao Salvar',
        errorMessage,
        [{text: 'OK'}]
      );

      return false;
    }
  }, [saveImportedRecipe]);

  const clearState = useCallback(() => {
    setState({
      isImporting: false,
      isSaving: false,
      importedData: null,
      error: null,
    });
  }, []);

  const validateUrl = useCallback((url: string) => {
    const urlRegex = /^https?:\/\/.+\..+/i;
    return urlRegex.test(url.trim());
  }, []);

  const extractRecipeFromText = useCallback((text: string) => {
    // Simple text parsing for basic recipe structure
    const lines = text.split('\n').filter(line => line.trim());
    
    let title = '';
    let ingredients: string[] = [];
    let instructions: string[] = [];
    let currentSection = 'title';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!title && trimmedLine) {
        title = trimmedLine;
        continue;
      }
      
      if (trimmedLine.toLowerCase().includes('ingrediente')) {
        currentSection = 'ingredients';
        continue;
      }
      
      if (trimmedLine.toLowerCase().includes('preparo') || 
          trimmedLine.toLowerCase().includes('modo') ||
          trimmedLine.toLowerCase().includes('instrução')) {
        currentSection = 'instructions';
        continue;
      }
      
      if (currentSection === 'ingredients' && trimmedLine.startsWith('-')) {
        ingredients.push(trimmedLine.substring(1).trim());
      } else if (currentSection === 'instructions' && trimmedLine) {
        instructions.push(trimmedLine);
      }
    }
    
    return {
      title: title || 'Receita Importada',
      ingredients,
      instructions,
    };
  }, []);

  return {
    ...state,
    importRecipe,
    saveRecipe,
    clearState,
    validateUrl,
    extractRecipeFromText,
    detectSourceType,
    getSocialPlatform,
  };
};

export default useRecipeImport;
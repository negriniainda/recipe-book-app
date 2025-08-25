import {useState, useCallback} from 'react';
import {Alert} from 'react-native';
import {
  useExtractTextFromImageMutation,
  useProcessImageForOCRMutation,
  useStructureRecipeTextMutation,
  useValidateImageQualityQuery,
  OCRResponse,
} from '../services/ocrApi';
import {RecipeParser} from '../utils/recipeParser';

export interface OCRState {
  isProcessing: boolean;
  isExtracting: boolean;
  isStructuring: boolean;
  extractedText: string | null;
  structuredRecipe: any | null;
  confidence: number;
  error: string | null;
  imageQuality: any | null;
}

export interface OCROptions {
  language: string;
  enhanceImage: boolean;
  detectStructure: boolean;
  autoStructure: boolean;
}

export const useOCR = () => {
  const [state, setState] = useState<OCRState>({
    isProcessing: false,
    isExtracting: false,
    isStructuring: false,
    extractedText: null,
    structuredRecipe: null,
    confidence: 0,
    error: null,
    imageQuality: null,
  });

  const [extractText] = useExtractTextFromImageMutation();
  const [processImage] = useProcessImageForOCRMutation();
  const [structureText] = useStructureRecipeTextMutation();

  const defaultOptions: OCROptions = {
    language: 'pt',
    enhanceImage: true,
    detectStructure: true,
    autoStructure: true,
  };

  const processImageForOCR = useCallback(async (
    imageBase64: string,
    options: Partial<OCROptions> = {}
  ) => {
    const finalOptions = {...defaultOptions, ...options};
    
    setState(prev => ({
      ...prev,
      isProcessing: true,
      error: null,
    }));

    try {
      // Primeiro, processar a imagem para melhorar qualidade
      let processedImage = imageBase64;
      
      if (finalOptions.enhanceImage) {
        const processResult = await processImage({
          imageBase64,
          operations: [
            {type: 'enhance'},
            {type: 'contrast', params: {level: 1.2}},
            {type: 'brightness', params: {level: 1.1}},
          ],
        }).unwrap();
        
        processedImage = processResult.processedImageBase64;
      }

      // Extrair texto usando OCR
      setState(prev => ({...prev, isExtracting: true}));
      
      const ocrResult = await extractText({
        imageBase64: processedImage,
        language: finalOptions.language,
        options: {
          detectText: true,
          detectStructure: finalOptions.detectStructure,
          enhanceImage: false, // Já processamos
        },
      }).unwrap();

      setState(prev => ({
        ...prev,
        isExtracting: false,
        extractedText: ocrResult.extractedText,
        confidence: ocrResult.confidence,
      }));

      // Auto-estruturar se solicitado
      if (finalOptions.autoStructure && ocrResult.extractedText) {
        await structureRecipeFromText(ocrResult.extractedText, finalOptions.language);
      }

      setState(prev => ({
        ...prev,
        isProcessing: false,
      }));

      return ocrResult;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao processar imagem';
      setState(prev => ({
        ...prev,
        isProcessing: false,
        isExtracting: false,
        error: errorMessage,
      }));

      Alert.alert(
        'Erro no OCR',
        errorMessage,
        [{text: 'OK'}]
      );

      return null;
    }
  }, [extractText, processImage, defaultOptions]);

  const structureRecipeFromText = useCallback(async (
    text: string,
    language: string = 'pt'
  ) => {
    setState(prev => ({
      ...prev,
      isStructuring: true,
      error: null,
    }));

    try {
      // Tentar estruturação via API primeiro
      const apiResult = await structureText({
        text,
        language,
      }).unwrap();

      setState(prev => ({
        ...prev,
        isStructuring: false,
        structuredRecipe: apiResult.recipe,
        confidence: Math.min(prev.confidence, apiResult.confidence),
      }));

      return apiResult.recipe;
    } catch (error) {
      // Fallback para parser local
      try {
        const localResult = RecipeParser.parseFromText(text);
        
        // Converter para o formato esperado pela API
        const formattedResult = {
          title: localResult.title,
          ingredients: localResult.ingredients.map(ing => ({
            name: ing.name,
            quantity: ing.quantity?.toString() || '',
            unit: ing.unit || '',
          })),
          instructions: localResult.instructions.map(inst => ({
            stepNumber: inst.stepNumber,
            description: inst.description,
          })),
          metadata: {
            servings: localResult.servings,
            prepTime: localResult.prepTime,
            cookTime: localResult.cookTime,
          },
        };
        
        setState(prev => ({
          ...prev,
          isStructuring: false,
          structuredRecipe: formattedResult,
          confidence: Math.min(prev.confidence, 0.7), // Confiança menor para parser local
        }));

        return formattedResult;
      } catch (localError: any) {
        const errorMessage = localError.message || 'Erro ao estruturar receita';
        setState(prev => ({
          ...prev,
          isStructuring: false,
          error: errorMessage,
        }));

        Alert.alert(
          'Erro na Estruturação',
          errorMessage,
          [{text: 'OK'}]
        );

        return null;
      }
    }
  }, [structureText]);

  const validateImageQuality = useCallback((imageBase64: string) => {
    // Validações básicas locais
    const validations = {
      isValid: true,
      quality: 'good' as 'excellent' | 'good' | 'fair' | 'poor',
      score: 0.8,
      suggestions: [] as string[],
      issues: [] as any[],
    };

    // Verificar tamanho da imagem
    const sizeInBytes = (imageBase64.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);

    if (sizeInMB < 0.1) {
      validations.issues.push({
        type: 'resolution',
        severity: 'high',
        description: 'Imagem muito pequena, pode afetar a qualidade do OCR',
      });
      validations.suggestions.push('Use uma imagem com maior resolução');
      validations.quality = 'poor';
      validations.score = 0.3;
    } else if (sizeInMB > 10) {
      validations.issues.push({
        type: 'resolution',
        severity: 'medium',
        description: 'Imagem muito grande, pode ser lenta para processar',
      });
      validations.suggestions.push('Considere reduzir o tamanho da imagem');
    }

    setState(prev => ({
      ...prev,
      imageQuality: validations,
    }));

    return validations;
  }, []);

  const clearState = useCallback(() => {
    setState({
      isProcessing: false,
      isExtracting: false,
      isStructuring: false,
      extractedText: null,
      structuredRecipe: null,
      confidence: 0,
      error: null,
      imageQuality: null,
    });
  }, []);

  const retryWithDifferentOptions = useCallback(async (
    imageBase64: string,
    newOptions: Partial<OCROptions>
  ) => {
    clearState();
    return await processImageForOCR(imageBase64, newOptions);
  }, [processImageForOCR, clearState]);

  const enhanceTextExtraction = useCallback((text: string): string => {
    // Limpeza e melhoria do texto extraído
    let cleanedText = text
      // Remover caracteres especiais desnecessários
      .replace(/[^\w\s\-.,;:()\n]/g, '')
      // Corrigir espaçamentos
      .replace(/\s+/g, ' ')
      // Corrigir quebras de linha
      .replace(/\n\s*\n/g, '\n')
      // Remover linhas muito curtas (provavelmente ruído)
      .split('\n')
      .filter(line => line.trim().length > 2)
      .join('\n');

    return cleanedText.trim();
  }, []);

  const getConfidenceLevel = useCallback((confidence: number): string => {
    if (confidence >= 0.9) return 'Excelente';
    if (confidence >= 0.8) return 'Boa';
    if (confidence >= 0.7) return 'Regular';
    if (confidence >= 0.6) return 'Baixa';
    return 'Muito Baixa';
  }, []);

  const getSuggestions = useCallback((confidence: number, imageQuality: any): string[] => {
    const suggestions = [];

    if (confidence < 0.7) {
      suggestions.push('Tente usar uma imagem com melhor qualidade');
      suggestions.push('Certifique-se de que o texto está bem iluminado');
      suggestions.push('Evite imagens com muito ruído ou desfocadas');
    }

    if (imageQuality?.issues?.length > 0) {
      suggestions.push(...imageQuality.suggestions);
    }

    if (confidence < 0.5) {
      suggestions.push('Considere digitar a receita manualmente');
      suggestions.push('Tente capturar a imagem novamente com melhor ângulo');
    }

    return suggestions;
  }, []);

  return {
    ...state,
    processImageForOCR,
    structureRecipeFromText,
    validateImageQuality,
    clearState,
    retryWithDifferentOptions,
    enhanceTextExtraction,
    getConfidenceLevel,
    getSuggestions,
  };
};

export default useOCR;
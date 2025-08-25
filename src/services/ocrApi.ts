import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './api';

export interface OCRRequest {
  imageBase64: string;
  language?: string;
  options?: {
    detectText: boolean;
    detectStructure: boolean;
    enhanceImage: boolean;
  };
}

export interface OCRResponse {
  extractedText: string;
  confidence: number;
  blocks: Array<{
    text: string;
    confidence: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    type: 'title' | 'ingredient' | 'instruction' | 'other';
  }>;
  structuredData?: {
    title?: string;
    ingredients: string[];
    instructions: string[];
    metadata?: {
      servings?: string;
      prepTime?: string;
      cookTime?: string;
    };
  };
  warnings?: string[];
}

export interface ImageProcessingRequest {
  imageBase64: string;
  operations: Array<{
    type: 'enhance' | 'rotate' | 'crop' | 'contrast' | 'brightness';
    params?: any;
  }>;
}

export interface ImageProcessingResponse {
  processedImageBase64: string;
  operations: string[];
  quality: number;
}

export const ocrApi = createApi({
  reducerPath: 'ocrApi',
  baseQuery,
  tagTypes: ['OCR'],
  endpoints: builder => ({
    // Extrair texto de imagem usando OCR
    extractTextFromImage: builder.mutation<OCRResponse, OCRRequest>({
      query: ({imageBase64, language = 'pt', options}) => ({
        url: '/ocr/extract-text',
        method: 'POST',
        body: {
          image: imageBase64,
          language,
          options: {
            detectText: true,
            detectStructure: true,
            enhanceImage: true,
            ...options,
          },
        },
      }),
    }),

    // Processar imagem para melhorar qualidade do OCR
    processImageForOCR: builder.mutation<ImageProcessingResponse, ImageProcessingRequest>({
      query: ({imageBase64, operations}) => ({
        url: '/ocr/process-image',
        method: 'POST',
        body: {
          image: imageBase64,
          operations,
        },
      }),
    }),

    // Estruturar texto extraído em receita
    structureRecipeText: builder.mutation<
      {
        recipe: {
          title: string;
          ingredients: Array<{
            name: string;
            quantity?: string;
            unit?: string;
          }>;
          instructions: Array<{
            stepNumber: number;
            description: string;
          }>;
          metadata?: {
            servings?: number;
            prepTime?: number;
            cookTime?: number;
          };
        };
        confidence: number;
        warnings: string[];
      },
      {
        text: string;
        language?: string;
      }
    >({
      query: ({text, language = 'pt'}) => ({
        url: '/ocr/structure-recipe',
        method: 'POST',
        body: {
          text,
          language,
        },
      }),
    }),

    // Validar qualidade da imagem para OCR
    validateImageQuality: builder.query<
      {
        isValid: boolean;
        quality: 'excellent' | 'good' | 'fair' | 'poor';
        score: number;
        suggestions: string[];
        issues: Array<{
          type: 'blur' | 'lighting' | 'resolution' | 'angle' | 'text_density';
          severity: 'low' | 'medium' | 'high';
          description: string;
        }>;
      },
      string
    >({
      query: imageBase64 => ({
        url: '/ocr/validate-image',
        method: 'POST',
        body: {image: imageBase64},
      }),
    }),

    // Obter idiomas suportados para OCR
    getSupportedLanguages: builder.query<
      Array<{
        code: string;
        name: string;
        accuracy: number;
        supported: boolean;
      }>,
      void
    >({
      query: () => '/ocr/supported-languages',
    }),

    // Histórico de OCR
    getOCRHistory: builder.query<
      Array<{
        id: string;
        imageUrl: string;
        extractedText: string;
        confidence: number;
        status: 'success' | 'failed' | 'processing';
        createdAt: Date;
        recipe?: any;
      }>,
      {page?: number; limit?: number}
    >({
      query: ({page = 1, limit = 20}) => ({
        url: '/ocr/history',
        params: {page, limit},
      }),
      providesTags: ['OCR'],
    }),

    // Retry OCR com configurações diferentes
    retryOCR: builder.mutation<
      OCRResponse,
      {
        imageBase64: string;
        previousAttemptId: string;
        newOptions: OCRRequest['options'];
      }
    >({
      query: ({imageBase64, previousAttemptId, newOptions}) => ({
        url: '/ocr/retry',
        method: 'POST',
        body: {
          image: imageBase64,
          previousAttemptId,
          options: newOptions,
        },
      }),
      invalidatesTags: ['OCR'],
    }),
  }),
});

export const {
  useExtractTextFromImageMutation,
  useProcessImageForOCRMutation,
  useStructureRecipeTextMutation,
  useValidateImageQualityQuery,
  useGetSupportedLanguagesQuery,
  useGetOCRHistoryQuery,
  useRetryOCRMutation,
} = ocrApi;
import * as yup from 'yup';
import {
  RecipeDifficulty,
  IngredientCategory,
  MeasurementSystem,
  SocialProvider,
} from '@/types/enums';

// Validadores para receitas
export const ingredientSchema = yup.object({
  id: yup.string().required('ID é obrigatório'),
  name: yup
    .string()
    .required('Nome do ingrediente é obrigatório')
    .min(1, 'Nome não pode estar vazio'),
  quantity: yup
    .number()
    .positive('Quantidade deve ser positiva')
    .required('Quantidade é obrigatória'),
  unit: yup.string().required('Unidade é obrigatória'),
  category: yup
    .string()
    .oneOf(Object.values(IngredientCategory))
    .required('Categoria é obrigatória'),
  optional: yup.boolean().optional(),
});

export const instructionSchema = yup.object({
  id: yup.string().required('ID é obrigatório'),
  stepNumber: yup
    .number()
    .positive('Número do passo deve ser positivo')
    .integer('Número do passo deve ser inteiro')
    .required('Número do passo é obrigatório'),
  description: yup
    .string()
    .required('Descrição é obrigatória')
    .min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  duration: yup
    .number()
    .positive('Duração deve ser positiva')
    .integer('Duração deve ser em minutos inteiros')
    .optional(),
  temperature: yup
    .number()
    .positive('Temperatura deve ser positiva')
    .optional(),
  image: yup.string().url('Deve ser uma URL válida').optional(),
  video: yup.string().url('Deve ser uma URL válida').optional(),
});

export const nutritionSchema = yup.object({
  calories: yup
    .number()
    .min(0, 'Calorias não podem ser negativas')
    .required('Calorias são obrigatórias'),
  protein: yup
    .number()
    .min(0, 'Proteína não pode ser negativa')
    .required('Proteína é obrigatória'),
  carbs: yup
    .number()
    .min(0, 'Carboidratos não podem ser negativos')
    .required('Carboidratos são obrigatórios'),
  fat: yup
    .number()
    .min(0, 'Gordura não pode ser negativa')
    .required('Gordura é obrigatória'),
  fiber: yup
    .number()
    .min(0, 'Fibra não pode ser negativa')
    .required('Fibra é obrigatória'),
  sugar: yup
    .number()
    .min(0, 'Açúcar não pode ser negativo')
    .required('Açúcar é obrigatório'),
  sodium: yup
    .number()
    .min(0, 'Sódio não pode ser negativo')
    .required('Sódio é obrigatório'),
});

export const recipeSchema = yup.object({
  title: yup
    .string()
    .required('Título é obrigatório')
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  description: yup
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  servings: yup
    .number()
    .positive('Porções devem ser positivas')
    .integer('Porções devem ser um número inteiro')
    .min(1, 'Deve servir pelo menos 1 pessoa')
    .max(50, 'Máximo de 50 porções')
    .required('Número de porções é obrigatório'),
  prepTime: yup
    .number()
    .min(0, 'Tempo de preparo não pode ser negativo')
    .integer('Tempo deve ser em minutos inteiros')
    .max(1440, 'Tempo de preparo não pode exceder 24 horas')
    .required('Tempo de preparo é obrigatório'),
  cookTime: yup
    .number()
    .min(0, 'Tempo de cozimento não pode ser negativo')
    .integer('Tempo deve ser em minutos inteiros')
    .max(1440, 'Tempo de cozimento não pode exceder 24 horas')
    .required('Tempo de cozimento é obrigatório'),
  difficulty: yup
    .string()
    .oneOf(Object.values(RecipeDifficulty), 'Dificuldade inválida')
    .required('Dificuldade é obrigatória'),
  ingredients: yup
    .array()
    .of(ingredientSchema)
    .min(1, 'Receita deve ter pelo menos 1 ingrediente')
    .required('Ingredientes são obrigatórios'),
  instructions: yup
    .array()
    .of(instructionSchema)
    .min(1, 'Receita deve ter pelo menos 1 instrução')
    .required('Instruções são obrigatórias'),
  categories: yup
    .array()
    .of(yup.string())
    .min(1, 'Receita deve ter pelo menos 1 categoria')
    .required('Categorias são obrigatórias'),
  tags: yup.array().of(yup.string()).optional(),
  nutrition: nutritionSchema.optional(),
  images: yup
    .array()
    .of(yup.string().url('Deve ser uma URL válida'))
    .optional(),
  videos: yup
    .array()
    .of(yup.string().url('Deve ser uma URL válida'))
    .optional(),
  sourceUrl: yup.string().url('Deve ser uma URL válida').optional(),
  originalAuthor: yup.string().optional(),
  originalRecipe: yup.string().optional(),
  isPublic: yup.boolean().required('Visibilidade é obrigatória'),
  notes: yup
    .string()
    .max(1000, 'Notas devem ter no máximo 1000 caracteres')
    .optional(),
});

// Validadores para usuário
export const userPreferencesSchema = yup.object({
  dietaryRestrictions: yup.array().of(yup.string()).optional(),
  allergies: yup.array().of(yup.string()).optional(),
  favoriteCategories: yup.array().of(yup.string()).optional(),
  defaultServings: yup
    .number()
    .positive('Porções padrão devem ser positivas')
    .integer('Porções devem ser um número inteiro')
    .min(1)
    .max(20)
    .required('Porções padrão são obrigatórias'),
  measurementSystem: yup
    .string()
    .oneOf(Object.values(MeasurementSystem))
    .required('Sistema de medida é obrigatório'),
  language: yup.string().required('Idioma é obrigatório'),
  theme: yup
    .string()
    .oneOf(['light', 'dark', 'auto'])
    .required('Tema é obrigatório'),
});

export const userSchema = yup.object({
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  username: yup
    .string()
    .required('Nome de usuário é obrigatório')
    .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres')
    .max(30, 'Nome de usuário deve ter no máximo 30 caracteres')
    .matches(
      /^[a-zA-Z0-9_]+$/,
      'Nome de usuário pode conter apenas letras, números e underscore',
    ),
  displayName: yup
    .string()
    .required('Nome de exibição é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  bio: yup
    .string()
    .max(200, 'Bio deve ter no máximo 200 caracteres')
    .optional(),
  avatar: yup.string().url('Deve ser uma URL válida').optional(),
  preferences: userPreferencesSchema.required('Preferências são obrigatórias'),
  isPublic: yup.boolean().required('Visibilidade do perfil é obrigatória'),
});

// Validadores para autenticação
export const loginSchema = yup.object({
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const registerSchema = yup.object({
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
    ),
  confirmPassword: yup
    .string()
    .required('Confirmação de senha é obrigatória')
    .oneOf([yup.ref('password')], 'Senhas devem coincidir'),
  username: yup
    .string()
    .required('Nome de usuário é obrigatório')
    .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres')
    .max(30, 'Nome de usuário deve ter no máximo 30 caracteres')
    .matches(
      /^[a-zA-Z0-9_]+$/,
      'Nome de usuário pode conter apenas letras, números e underscore',
    ),
  displayName: yup
    .string()
    .required('Nome de exibição é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'Você deve aceitar os termos de uso')
    .required('Aceitação dos termos é obrigatória'),
});

export const socialLoginSchema = yup.object({
  provider: yup
    .string()
    .oneOf(Object.values(SocialProvider))
    .required('Provedor é obrigatório'),
  token: yup.string().required('Token é obrigatório'),
  email: yup.string().email('Email inválido').optional(),
  name: yup.string().optional(),
  avatar: yup.string().url('Deve ser uma URL válida').optional(),
});

// Validadores para planejamento
export const shoppingItemSchema = yup.object({
  name: yup
    .string()
    .required('Nome do item é obrigatório')
    .min(1, 'Nome não pode estar vazio'),
  quantity: yup
    .number()
    .positive('Quantidade deve ser positiva')
    .required('Quantidade é obrigatória'),
  unit: yup.string().required('Unidade é obrigatória'),
  category: yup.string().required('Categoria é obrigatória'),
  notes: yup
    .string()
    .max(200, 'Notas devem ter no máximo 200 caracteres')
    .optional(),
});

export const shoppingListSchema = yup.object({
  name: yup
    .string()
    .required('Nome da lista é obrigatório')
    .min(1, 'Nome não pode estar vazio')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  items: yup.array().of(shoppingItemSchema).optional(),
});

export const mealPlanSchema = yup.object({
  date: yup
    .date()
    .required('Data é obrigatória')
    .min(new Date(), 'Data não pode ser no passado'),
  meals: yup
    .object({
      breakfast: yup.string().optional(),
      lunch: yup.string().optional(),
      dinner: yup.string().optional(),
      snacks: yup.array().of(yup.string()).optional(),
    })
    .required('Refeições são obrigatórias'),
});

// Validadores para importação
export const importRecipeSchema = yup.object({
  source: yup
    .string()
    .oneOf(['url', 'image', 'text'])
    .required('Fonte é obrigatória'),
  data: yup
    .string()
    .required('Dados são obrigatórios')
    .min(1, 'Dados não podem estar vazios'),
  options: yup
    .object({
      extractNutrition: yup.boolean().optional(),
      autoCategories: yup.boolean().optional(),
      language: yup.string().optional(),
    })
    .optional(),
});

// Função utilitária para validar dados
export const validateData = async <T>(
  schema: yup.Schema<T>,
  data: any,
): Promise<{isValid: boolean; errors?: Record<string, string>; data?: T}> => {
  try {
    const validatedData = await schema.validate(data, {abortEarly: false});
    return {isValid: true, data: validatedData};
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach(err => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return {isValid: false, errors};
    }
    return {
      isValid: false,
      errors: {general: 'Erro de validação desconhecido'},
    };
  }
};

// Função para validar campos individuais
export const validateField = async <T>(
  schema: yup.Schema<T>,
  fieldName: string,
  value: any,
): Promise<string | undefined> => {
  try {
    await schema.validateAt(fieldName, {[fieldName]: value});
    return undefined;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return error.message;
    }
    return 'Erro de validação';
  }
};

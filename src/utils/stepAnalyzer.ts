import {StepAnalysis, ParsedStepTime, StepDifficulty} from '../types/cookingMode';

/**
 * Analisa um passo de receita para extrair informações úteis
 */
export const analyzeStep = (stepText: string, stepNumber: number): StepAnalysis => {
  const lowerText = stepText.toLowerCase();
  
  // Detectar timers
  const suggestedTimers = extractTimers(stepText);
  const hasTimer = suggestedTimers.length > 0;
  
  // Determinar dificuldade
  const difficulty = determineDifficulty(lowerText);
  
  // Extrair equipamentos necessários
  const requiredEquipment = extractEquipment(lowerText);
  
  // Identificar ingredientes críticos
  const criticalIngredients = extractCriticalIngredients(lowerText);
  
  // Gerar dicas
  const tips = generateTips(lowerText, stepNumber);
  
  return {
    hasTimer,
    suggestedTimers,
    difficulty,
    requiredEquipment,
    criticalIngredients,
    tips,
  };
};

/**
 * Extrai timers de um texto de passo
 */
export const extractTimers = (text: string): ParsedStepTime[] => {
  const timers: ParsedStepTime[] = [];
  
  // Padrões de tempo em português
  const timePatterns = [
    // Minutos
    {
      regex: /(\d+)\s*(?:minutos?|min)\b/gi,
      unit: 'minutes' as const,
      multiplier: 60,
    },
    // Horas
    {
      regex: /(\d+)\s*(?:horas?|h)\b/gi,
      unit: 'hours' as const,
      multiplier: 3600,
    },
    // Segundos
    {
      regex: /(\d+)\s*(?:segundos?|seg)\b/gi,
      unit: 'seconds' as const,
      multiplier: 1,
    },
    // Frações de hora (ex: "meia hora", "1/2 hora")
    {
      regex: /(?:meia\s*hora|1\/2\s*hora)/gi,
      unit: 'minutes' as const,
      multiplier: 60,
      fixedValue: 30,
    },
    // Quartos de hora
    {
      regex: /(?:um\s*quarto\s*de\s*hora|1\/4\s*hora|15\s*minutos)/gi,
      unit: 'minutes' as const,
      multiplier: 60,
      fixedValue: 15,
    },
  ];
  
  timePatterns.forEach(pattern => {
    const matches = Array.from(text.matchAll(pattern.regex));
    
    matches.forEach(match => {
      let duration: number;
      
      if (pattern.fixedValue) {
        duration = pattern.fixedValue * pattern.multiplier;
      } else {
        const number = parseInt(match[1]);
        if (isNaN(number) || number <= 0) return;
        duration = number * pattern.multiplier;
      }
      
      // Determinar confiança baseada no contexto
      const confidence = calculateTimeConfidence(text, match[0], match.index || 0);
      
      timers.push({
        duration,
        unit: pattern.unit,
        text: match[0],
        confidence,
      });
    });
  });
  
  // Remover duplicatas e ordenar por confiança
  return timers
    .filter((timer, index, arr) => 
      arr.findIndex(t => t.duration === timer.duration) === index
    )
    .sort((a, b) => b.confidence - a.confidence);
};

/**
 * Calcula a confiança de um timer baseado no contexto
 */
const calculateTimeConfidence = (text: string, timeText: string, position: number): number => {
  let confidence = 0.5; // Base confidence
  
  const beforeText = text.substring(Math.max(0, position - 50), position).toLowerCase();
  const afterText = text.substring(position + timeText.length, position + timeText.length + 50).toLowerCase();
  const context = beforeText + ' ' + afterText;
  
  // Palavras que indicam tempo de cozimento
  const cookingWords = [
    'cozinhe', 'cozinhar', 'asse', 'assar', 'frite', 'fritar', 'ferva', 'ferver',
    'deixe', 'aguarde', 'espere', 'descanse', 'repouse', 'marine', 'macere',
    'doure', 'grelhe', 'refogue', 'salteie', 'coza', 'torre', 'aqueça'
  ];
  
  // Palavras que indicam preparação (menos confiança)
  const prepWords = [
    'corte', 'pique', 'misture', 'bata', 'mexa', 'adicione', 'tempere'
  ];
  
  // Aumentar confiança se há palavras de cozimento
  if (cookingWords.some(word => context.includes(word))) {
    confidence += 0.3;
  }
  
  // Diminuir confiança se há palavras de preparação
  if (prepWords.some(word => context.includes(word))) {
    confidence -= 0.2;
  }
  
  // Aumentar confiança se há palavras relacionadas a temperatura
  if (context.includes('fogo') || context.includes('temperatura') || context.includes('°c')) {
    confidence += 0.2;
  }
  
  return Math.max(0.1, Math.min(1.0, confidence));
};

/**
 * Determina a dificuldade de um passo
 */
const determineDifficulty = (text: string): StepDifficulty => {
  // Palavras que indicam alta dificuldade
  const hardWords = [
    'tempere', 'flambe', 'caramelize', 'emulsione', 'monte', 'incorpore delicadamente',
    'ponto de neve', 'ponto de fita', 'banho-maria', 'julienne', 'brunoise',
    'chiffonade', 'redução', 'glacê', 'confit', 'sous vide'
  ];
  
  // Palavras que indicam dificuldade média
  const mediumWords = [
    'refogue', 'doure', 'salteie', 'grelhe', 'asse', 'ferva', 'cozinhe',
    'bata', 'misture bem', 'tempere a gosto', 'ajuste', 'prove'
  ];
  
  // Contar ocorrências
  const hardCount = hardWords.filter(word => text.includes(word)).length;
  const mediumCount = mediumWords.filter(word => text.includes(word)).length;
  
  if (hardCount > 0) return 'hard';
  if (mediumCount > 1) return 'medium';
  return 'easy';
};

/**
 * Extrai equipamentos necessários do texto
 */
const extractEquipment = (text: string): string[] => {
  const equipmentMap = {
    'panela': ['panela'],
    'frigideira': ['frigideira'],
    'forno': ['forno', 'asse', 'assar'],
    'liquidificador': ['liquidificador', 'bata no liquidificador'],
    'batedeira': ['batedeira', 'bata na batedeira'],
    'processador': ['processador', 'processe'],
    'peneira': ['peneira', 'peneire'],
    'ralador': ['ralador', 'rale'],
    'espremedor': ['espremedor', 'esprema'],
    'forma': ['forma', 'assadeira'],
    'grill': ['grill', 'grelhe'],
    'microondas': ['microondas'],
    'banho-maria': ['banho-maria', 'banho maria'],
  };
  
  const equipment: string[] = [];
  
  Object.entries(equipmentMap).forEach(([equipmentName, keywords]) => {
    if (keywords.some(keyword => text.includes(keyword))) {
      equipment.push(equipmentName);
    }
  });
  
  return equipment;
};

/**
 * Identifica ingredientes críticos no passo
 */
const extractCriticalIngredients = (text: string): string[] => {
  // Padrões que indicam ingredientes importantes
  const criticalPatterns = [
    /adicione\s+([^,\.]+)/gi,
    /coloque\s+([^,\.]+)/gi,
    /misture\s+([^,\.]+)/gi,
    /tempere\s+com\s+([^,\.]+)/gi,
    /polvilhe\s+([^,\.]+)/gi,
  ];
  
  const ingredients: string[] = [];
  
  criticalPatterns.forEach(pattern => {
    const matches = Array.from(text.matchAll(pattern));
    matches.forEach(match => {
      const ingredient = match[1].trim();
      if (ingredient.length > 2 && ingredient.length < 50) {
        ingredients.push(ingredient);
      }
    });
  });
  
  return ingredients;
};

/**
 * Gera dicas baseadas no conteúdo do passo
 */
const generateTips = (text: string, stepNumber: number): string[] => {
  const tips: string[] = [];
  
  // Dicas baseadas em palavras-chave
  const tipMap = {
    'ovo': 'Use ovos em temperatura ambiente para melhor incorporação.',
    'manteiga': 'Manteiga em temperatura ambiente mistura mais facilmente.',
    'chocolate': 'Derreta o chocolate em banho-maria para evitar queimar.',
    'cebola': 'Corte a cebola com uma faca bem afiada para evitar lágrimas.',
    'alho': 'Retire o germe do alho para evitar sabor amargo.',
    'sal': 'Prove antes de adicionar mais sal.',
    'pimenta': 'Adicione pimenta-do-reino moída na hora para mais sabor.',
    'azeite': 'Use azeite extra virgem para finalizar pratos.',
    'fogo alto': 'Pré-aqueça bem a panela antes de adicionar os ingredientes.',
    'fogo baixo': 'Cozinhar em fogo baixo preserva mais os sabores.',
    'misture': 'Misture delicadamente para não quebrar os ingredientes.',
    'bata': 'Não bata demais para evitar que a massa fique pesada.',
  };
  
  Object.entries(tipMap).forEach(([keyword, tip]) => {
    if (text.includes(keyword)) {
      tips.push(tip);
    }
  });
  
  // Dicas baseadas no número do passo
  if (stepNumber === 1) {
    tips.push('Leia toda a receita antes de começar.');
    tips.push('Separe todos os ingredientes antes de iniciar.');
  }
  
  if (text.includes('forno')) {
    tips.push('Pré-aqueça o forno com antecedência.');
  }
  
  if (text.includes('geladeira') || text.includes('refrigerador')) {
    tips.push('Planeje o tempo de refrigeração no seu cronograma.');
  }
  
  return tips.slice(0, 3); // Máximo 3 dicas por passo
};

/**
 * Estima o tempo total de uma receita baseado nos passos
 */
export const estimateRecipeTime = (steps: string[]): number => {
  let totalTime = 0;
  
  steps.forEach(step => {
    const timers = extractTimers(step);
    const maxTimer = timers.reduce((max, timer) => 
      timer.duration > max ? timer.duration : max, 0
    );
    
    // Se não há timer, estima 2-5 minutos por passo baseado na complexidade
    if (maxTimer === 0) {
      const difficulty = determineDifficulty(step.toLowerCase());
      switch (difficulty) {
        case 'easy':
          totalTime += 120; // 2 minutos
          break;
        case 'medium':
          totalTime += 180; // 3 minutos
          break;
        case 'hard':
          totalTime += 300; // 5 minutos
          break;
      }
    } else {
      totalTime += maxTimer;
    }
  });
  
  return totalTime;
};
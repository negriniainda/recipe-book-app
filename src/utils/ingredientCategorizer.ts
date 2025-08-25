import {GroceryCategory} from '../types/shoppingList';

// Mapeamento de ingredientes para categorias
const INGREDIENT_CATEGORY_MAP: Record<string, GroceryCategory> = {
  // Frutas e Vegetais
  'tomate': 'produce',
  'cebola': 'produce',
  'alho': 'produce',
  'batata': 'produce',
  'cenoura': 'produce',
  'abobrinha': 'produce',
  'berinjela': 'produce',
  'pimentão': 'produce',
  'brócolis': 'produce',
  'couve-flor': 'produce',
  'alface': 'produce',
  'rúcula': 'produce',
  'espinafre': 'produce',
  'banana': 'produce',
  'maçã': 'produce',
  'laranja': 'produce',
  'limão': 'produce',
  'abacaxi': 'produce',
  'manga': 'produce',
  'uva': 'produce',
  'morango': 'produce',
  'abacate': 'produce',
  'mamão': 'produce',
  'melancia': 'produce',
  'melão': 'produce',
  'kiwi': 'produce',
  'pêra': 'produce',
  'pêssego': 'produce',
  'ameixa': 'produce',
  'cereja': 'produce',
  'framboesa': 'produce',
  'mirtilo': 'produce',
  'aipo': 'produce',
  'pepino': 'produce',
  'rabanete': 'produce',
  'beterraba': 'produce',
  'nabo': 'produce',
  'inhame': 'produce',
  'mandioca': 'produce',
  'batata-doce': 'produce',
  'mandioquinha': 'produce',
  'chuchu': 'produce',
  'quiabo': 'produce',
  'jiló': 'produce',
  'maxixe': 'produce',
  'vagem': 'produce',
  'ervilha': 'produce',
  'milho': 'produce',
  'cogumelo': 'produce',
  'champignon': 'produce',
  'shimeji': 'produce',
  'shiitake': 'produce',

  // Carnes e Peixes
  'carne': 'meat',
  'frango': 'meat',
  'peixe': 'meat',
  'salmão': 'meat',
  'atum': 'meat',
  'bacalhau': 'meat',
  'tilápia': 'meat',
  'sardinha': 'meat',
  'camarão': 'meat',
  'lula': 'meat',
  'polvo': 'meat',
  'carne bovina': 'meat',
  'carne suína': 'meat',
  'porco': 'meat',
  'boi': 'meat',
  'vaca': 'meat',
  'cordeiro': 'meat',
  'carneiro': 'meat',
  'peru': 'meat',
  'pato': 'meat',
  'codorna': 'meat',
  'linguiça': 'meat',
  'salsicha': 'meat',
  'presunto': 'meat',
  'mortadela': 'meat',
  'salame': 'meat',
  'bacon': 'meat',
  'costela': 'meat',
  'picanha': 'meat',
  'alcatra': 'meat',
  'maminha': 'meat',
  'contrafilé': 'meat',
  'filé mignon': 'meat',
  'patinho': 'meat',
  'coxão mole': 'meat',
  'coxão duro': 'meat',
  'músculo': 'meat',
  'acém': 'meat',
  'peito de frango': 'meat',
  'coxa de frango': 'meat',
  'sobrecoxa': 'meat',
  'asa de frango': 'meat',

  // Laticínios
  'leite': 'dairy',
  'queijo': 'dairy',
  'iogurte': 'dairy',
  'manteiga': 'dairy',
  'margarina': 'dairy',
  'creme de leite': 'dairy',
  'leite condensado': 'dairy',
  'leite em pó': 'dairy',
  'nata': 'dairy',
  'chantilly': 'dairy',
  'ricota': 'dairy',
  'mussarela': 'dairy',
  'parmesão': 'dairy',
  'gorgonzola': 'dairy',
  'provolone': 'dairy',
  'cheddar': 'dairy',
  'gouda': 'dairy',
  'brie': 'dairy',
  'camembert': 'dairy',
  'queijo minas': 'dairy',
  'queijo coalho': 'dairy',
  'requeijão': 'dairy',
  'cream cheese': 'dairy',
  'cottage': 'dairy',

  // Padaria
  'pão': 'bakery',
  'pão de açúcar': 'bakery',
  'pão francês': 'bakery',
  'pão de forma': 'bakery',
  'pão integral': 'bakery',
  'pão de centeio': 'bakery',
  'pão sírio': 'bakery',
  'tortilla': 'bakery',
  'croissant': 'bakery',
  'brioche': 'bakery',
  'baguete': 'bakery',
  'ciabatta': 'bakery',
  'focaccia': 'bakery',
  'biscoito': 'bakery',
  'bolacha': 'bakery',
  'torrada': 'bakery',
  'rosca': 'bakery',
  'sonho': 'bakery',
  'bomba': 'bakery',
  'coxinha': 'bakery',
  'pastel': 'bakery',
  'empada': 'bakery',
  'quiche': 'bakery',
  'bolo': 'bakery',
  'torta': 'bakery',
  'cupcake': 'bakery',
  'muffin': 'bakery',

  // Despensa
  'arroz': 'pantry',
  'feijão': 'pantry',
  'macarrão': 'pantry',
  'farinha': 'pantry',
  'açúcar': 'pantry',
  'sal': 'pantry',
  'óleo': 'pantry',
  'azeite': 'pantry',
  'vinagre': 'pantry',
  'molho de tomate': 'pantry',
  'extrato de tomate': 'pantry',
  'massa de tomate': 'pantry',
  'lentilha': 'pantry',
  'grão-de-bico': 'pantry',
  'ervilha seca': 'pantry',
  'quinoa': 'pantry',
  'aveia': 'pantry',
  'granola': 'pantry',
  'cereal': 'pantry',
  'farelo': 'pantry',
  'farinha de trigo': 'pantry',
  'farinha de rosca': 'pantry',
  'farinha de mandioca': 'pantry',
  'farinha de milho': 'pantry',
  'fubá': 'pantry',
  'polvilho': 'pantry',
  'amido de milho': 'pantry',
  'fermento': 'pantry',
  'bicarbonato': 'pantry',
  'mel': 'pantry',
  'melado': 'pantry',
  'açúcar cristal': 'pantry',
  'açúcar refinado': 'pantry',
  'açúcar demerara': 'pantry',
  'açúcar mascavo': 'pantry',
  'adoçante': 'pantry',
  'gelatina': 'pantry',
  'agar-agar': 'pantry',

  // Congelados
  'sorvete': 'frozen',
  'picolé': 'frozen',
  'açaí': 'frozen',
  'polpa de fruta': 'frozen',
  'vegetais congelados': 'frozen',
  'batata frita congelada': 'frozen',
  'hambúrguer congelado': 'frozen',
  'nuggets': 'frozen',
  'pizza congelada': 'frozen',
  'lasanha congelada': 'frozen',
  'peixe congelado': 'frozen',
  'camarão congelado': 'frozen',
  'frango congelado': 'frozen',

  // Bebidas
  'água': 'beverages',
  'refrigerante': 'beverages',
  'suco': 'beverages',
  'cerveja': 'beverages',
  'vinho': 'beverages',
  'whisky': 'beverages',
  'vodka': 'beverages',
  'cachaça': 'beverages',
  'rum': 'beverages',
  'gin': 'beverages',
  'licor': 'beverages',
  'champagne': 'beverages',
  'espumante': 'beverages',
  'café': 'beverages',
  'chá': 'beverages',
  'achocolatado': 'beverages',
  'leite de coco': 'beverages',
  'água de coco': 'beverages',
  'isotônico': 'beverages',
  'energético': 'beverages',

  // Lanches
  'chips': 'snacks',
  'salgadinho': 'snacks',
  'amendoim': 'snacks',
  'castanha': 'snacks',
  'nozes': 'snacks',
  'amêndoa': 'snacks',
  'pistache': 'snacks',
  'avelã': 'snacks',
  'macadâmia': 'snacks',
  'chocolate': 'snacks',
  'barra de cereal': 'snacks',
  'pipoca': 'snacks',
  'biscoito recheado': 'snacks',
  'wafer': 'snacks',
  'bala': 'snacks',
  'chiclete': 'snacks',
  'pirulito': 'snacks',
  'doce': 'snacks',
  'brigadeiro': 'snacks',
  'beijinho': 'snacks',
  'paçoca': 'snacks',
  'pé-de-moleque': 'snacks',

  // Condimentos
  'ketchup': 'condiments',
  'mostarda': 'condiments',
  'maionese': 'condiments',
  'molho inglês': 'condiments',
  'molho de soja': 'condiments',
  'molho barbecue': 'condiments',
  'molho de pimenta': 'condiments',
  'tabasco': 'condiments',
  'azeite de dendê': 'condiments',
  'óleo de gergelim': 'condiments',
  'vinagre balsâmico': 'condiments',
  'vinagre de maçã': 'condiments',
  'vinagre de vinho': 'condiments',

  // Temperos
  'pimenta': 'spices',
  'pimenta-do-reino': 'spices',
  'páprica': 'spices',
  'cominho': 'spices',
  'orégano': 'spices',
  'manjericão': 'spices',
  'tomilho': 'spices',
  'alecrim': 'spices',
  'sálvia': 'spices',
  'louro': 'spices',
  'canela': 'spices',
  'cravo': 'spices',
  'noz-moscada': 'spices',
  'gengibre': 'spices',
  'açafrão': 'spices',
  'curry': 'spices',
  'colorau': 'spices',
  'urucum': 'spices',
  'coentro': 'spices',
  'salsa': 'spices',
  'cebolinha': 'spices',
  'dill': 'spices',
  'estragão': 'spices',
  'hortelã': 'spices',
  'menta': 'spices',

  // Limpeza
  'detergente': 'cleaning',
  'sabão': 'cleaning',
  'sabão em pó': 'cleaning',
  'amaciante': 'cleaning',
  'alvejante': 'cleaning',
  'desinfetante': 'cleaning',
  'álcool': 'cleaning',
  'água sanitária': 'cleaning',
  'esponja': 'cleaning',
  'pano de limpeza': 'cleaning',
  'papel higiênico': 'cleaning',
  'papel toalha': 'cleaning',
  'guardanapo': 'cleaning',
  'lenço': 'cleaning',
  'fralda': 'cleaning',
  'absorvente': 'cleaning',
  'shampoo': 'cleaning',
  'condicionador': 'cleaning',
  'sabonete': 'cleaning',
  'pasta de dente': 'cleaning',
  'escova de dente': 'cleaning',
  'fio dental': 'cleaning',
  'enxaguante bucal': 'cleaning',
  'desodorante': 'cleaning',
  'perfume': 'cleaning',
  'creme hidratante': 'cleaning',
  'protetor solar': 'cleaning',
};

// Palavras-chave para categorização automática
const CATEGORY_KEYWORDS: Record<GroceryCategory, string[]> = {
  produce: [
    'fruta', 'vegetal', 'verdura', 'legume', 'folha', 'raiz', 'tubérculo',
    'orgânico', 'natural', 'fresco', 'maduro', 'verde', 'folhoso'
  ],
  meat: [
    'carne', 'peixe', 'frango', 'boi', 'porco', 'cordeiro', 'peru', 'pato',
    'linguiça', 'salsicha', 'presunto', 'bacon', 'filé', 'costela', 'coxa',
    'peito', 'asa', 'camarão', 'lula', 'polvo', 'salmão', 'atum', 'sardinha'
  ],
  dairy: [
    'leite', 'queijo', 'iogurte', 'manteiga', 'margarina', 'creme', 'nata',
    'ricota', 'mussarela', 'parmesão', 'requeijão', 'cottage', 'condensado'
  ],
  bakery: [
    'pão', 'biscoito', 'bolacha', 'torrada', 'croissant', 'baguete', 'rosca',
    'bolo', 'torta', 'cupcake', 'muffin', 'donut', 'sonho', 'bomba', 'massa'
  ],
  pantry: [
    'arroz', 'feijão', 'macarrão', 'farinha', 'açúcar', 'sal', 'óleo', 'azeite',
    'vinagre', 'molho', 'extrato', 'lentilha', 'grão', 'quinoa', 'aveia',
    'cereal', 'granola', 'mel', 'fermento', 'bicarbonato', 'amido'
  ],
  frozen: [
    'congelado', 'sorvete', 'picolé', 'açaí', 'polpa', 'frozen', 'gelado',
    'pizza congelada', 'lasanha congelada', 'nuggets', 'hambúrguer congelado'
  ],
  beverages: [
    'água', 'refrigerante', 'suco', 'cerveja', 'vinho', 'whisky', 'vodka',
    'cachaça', 'café', 'chá', 'achocolatado', 'isotônico', 'energético',
    'bebida', 'líquido', 'drink'
  ],
  snacks: [
    'chips', 'salgadinho', 'amendoim', 'castanha', 'nozes', 'chocolate',
    'barra', 'pipoca', 'biscoito recheado', 'wafer', 'bala', 'doce',
    'lanche', 'snack', 'petisco'
  ],
  condiments: [
    'ketchup', 'mostarda', 'maionese', 'molho', 'tempero líquido', 'shoyu',
    'barbecue', 'pimenta', 'tabasco', 'condimento', 'tempero pronto'
  ],
  spices: [
    'pimenta', 'páprica', 'cominho', 'orégano', 'manjericão', 'tomilho',
    'alecrim', 'canela', 'cravo', 'gengibre', 'açafrão', 'curry', 'tempero',
    'especiaria', 'erva', 'seco', 'em pó', 'moído'
  ],
  cleaning: [
    'detergente', 'sabão', 'amaciante', 'alvejante', 'desinfetante', 'álcool',
    'sanitária', 'esponja', 'papel', 'higiênico', 'toalha', 'shampoo',
    'sabonete', 'pasta', 'dente', 'desodorante', 'limpeza', 'higiene'
  ],
  other: []
};

/**
 * Categoriza automaticamente um ingrediente baseado no nome
 */
export const categorizeIngredient = (ingredientName: string): GroceryCategory => {
  const normalizedName = ingredientName.toLowerCase().trim();
  
  // Primeiro, verifica se existe uma correspondência exata
  if (INGREDIENT_CATEGORY_MAP[normalizedName]) {
    return INGREDIENT_CATEGORY_MAP[normalizedName];
  }
  
  // Depois, verifica correspondências parciais no mapeamento
  for (const [ingredient, category] of Object.entries(INGREDIENT_CATEGORY_MAP)) {
    if (normalizedName.includes(ingredient) || ingredient.includes(normalizedName)) {
      return category;
    }
  }
  
  // Por último, verifica palavras-chave por categoria
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'other') continue;
    
    for (const keyword of keywords) {
      if (normalizedName.includes(keyword.toLowerCase())) {
        return category as GroceryCategory;
      }
    }
  }
  
  // Se não encontrou nada, retorna 'other'
  return 'other';
};

/**
 * Sugere uma unidade padrão baseada no ingrediente
 */
export const suggestUnit = (ingredientName: string): string => {
  const normalizedName = ingredientName.toLowerCase().trim();
  
  // Unidades por tipo de ingrediente
  const unitSuggestions: Record<string, string> = {
    // Líquidos
    'leite': 'litro',
    'água': 'litro',
    'suco': 'litro',
    'óleo': 'ml',
    'azeite': 'ml',
    'vinagre': 'ml',
    'molho': 'ml',
    'creme': 'ml',
    
    // Carnes (geralmente por peso)
    'carne': 'kg',
    'frango': 'kg',
    'peixe': 'kg',
    'linguiça': 'kg',
    'bacon': 'g',
    
    // Frutas e vegetais (geralmente por unidade ou peso)
    'tomate': 'kg',
    'cebola': 'kg',
    'batata': 'kg',
    'banana': 'unidade',
    'maçã': 'unidade',
    'laranja': 'unidade',
    'limão': 'unidade',
    
    // Produtos de padaria
    'pão': 'unidade',
    'bolo': 'unidade',
    
    // Produtos secos/despensa
    'arroz': 'kg',
    'feijão': 'kg',
    'açúcar': 'kg',
    'farinha': 'kg',
    'sal': 'kg',
    'macarrão': 'pacote',
    
    // Laticínios
    'queijo': 'g',
    'manteiga': 'g',
    'iogurte': 'unidade',
    
    // Produtos de limpeza
    'detergente': 'unidade',
    'sabão': 'unidade',
    'papel': 'pacote',
  };
  
  // Verifica correspondências exatas
  if (unitSuggestions[normalizedName]) {
    return unitSuggestions[normalizedName];
  }
  
  // Verifica correspondências parciais
  for (const [ingredient, unit] of Object.entries(unitSuggestions)) {
    if (normalizedName.includes(ingredient)) {
      return unit;
    }
  }
  
  // Sugestões baseadas em palavras-chave
  if (normalizedName.includes('líquido') || normalizedName.includes('suco') || 
      normalizedName.includes('leite') || normalizedName.includes('água')) {
    return 'litro';
  }
  
  if (normalizedName.includes('carne') || normalizedName.includes('peixe') ||
      normalizedName.includes('frango') || normalizedName.includes('boi')) {
    return 'kg';
  }
  
  if (normalizedName.includes('pão') || normalizedName.includes('bolo') ||
      normalizedName.includes('fruta') && (normalizedName.includes('banana') || 
      normalizedName.includes('maçã') || normalizedName.includes('laranja'))) {
    return 'unidade';
  }
  
  if (normalizedName.includes('pacote') || normalizedName.includes('caixa') ||
      normalizedName.includes('lata') || normalizedName.includes('garrafa')) {
    return 'unidade';
  }
  
  // Padrão
  return 'unidade';
};

/**
 * Estima um preço baseado no ingrediente (valores aproximados em reais)
 */
export const estimatePrice = (ingredientName: string, quantity: number, unit: string): number => {
  const normalizedName = ingredientName.toLowerCase().trim();
  
  // Preços aproximados por categoria (R$ por unidade padrão)
  const priceEstimates: Record<string, number> = {
    // Frutas e vegetais (por kg)
    'tomate': 8.00,
    'cebola': 4.00,
    'batata': 5.00,
    'banana': 6.00,
    'maçã': 8.00,
    'laranja': 5.00,
    'limão': 8.00,
    
    // Carnes (por kg)
    'frango': 12.00,
    'carne bovina': 35.00,
    'peixe': 25.00,
    'linguiça': 18.00,
    
    // Laticínios
    'leite': 5.00, // por litro
    'queijo': 40.00, // por kg
    'iogurte': 4.00, // por unidade
    'manteiga': 8.00, // por 200g
    
    // Despensa
    'arroz': 6.00, // por kg
    'feijão': 8.00, // por kg
    'açúcar': 4.00, // por kg
    'óleo': 6.00, // por litro
    'macarrão': 4.00, // por pacote
    
    // Bebidas
    'refrigerante': 6.00, // por 2L
    'cerveja': 3.00, // por lata
    'água': 2.00, // por litro
    
    // Produtos de limpeza
    'detergente': 3.00,
    'sabão em pó': 12.00,
    'papel higiênico': 15.00, // por pacote
  };
  
  let basePrice = 5.00; // Preço padrão
  
  // Busca preço específico
  for (const [ingredient, price] of Object.entries(priceEstimates)) {
    if (normalizedName.includes(ingredient)) {
      basePrice = price;
      break;
    }
  }
  
  // Ajusta baseado na unidade
  let multiplier = quantity;
  
  switch (unit.toLowerCase()) {
    case 'g':
    case 'grama':
    case 'gramas':
      multiplier = quantity / 1000; // Converte para kg
      break;
    case 'ml':
    case 'mililitro':
    case 'mililitros':
      multiplier = quantity / 1000; // Converte para litro
      break;
    case 'unidade':
    case 'unidades':
    case 'pacote':
    case 'pacotes':
    case 'caixa':
    case 'caixas':
    case 'lata':
    case 'latas':
    case 'garrafa':
    case 'garrafas':
      multiplier = quantity;
      break;
    default:
      multiplier = quantity;
  }
  
  return Math.round(basePrice * multiplier * 100) / 100; // Arredonda para 2 casas decimais
};
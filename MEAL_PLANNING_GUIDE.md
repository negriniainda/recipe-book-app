# Guia do Sistema de Planejamento de Refeições

## Visão Geral

O sistema de planejamento de refeições permite aos usuários organizar suas refeições de forma inteligente, com sugestões baseadas em preferências, notificações automáticas e integração completa com o sistema de receitas.

## Funcionalidades Implementadas

### ✅ 1. Calendário de Planejamento
- **Visualização semanal e mensal** de refeições planejadas
- **Navegação intuitiva** entre períodos
- **Indicadores visuais** de progresso e conclusão
- **Drag & drop** para mover refeições entre datas

### ✅ 2. Tipos de Refeição
- **Café da Manhã** (breakfast)
- **Almoço** (lunch) 
- **Jantar** (dinner)
- **Lanches** (snack) - múltiplos por dia

### ✅ 3. Sugestões Inteligentes
- **Baseadas em preferências** do usuário
- **Histórico de receitas** utilizadas
- **Categorias favoritas** e ingredientes disponíveis
- **Sistema de pontuação** e confiança das sugestões

### ✅ 4. Notificações Automáticas
- **Lembretes de refeição** (30 min antes)
- **Lembretes de preparo** (baseado no tempo de preparo)
- **Lembretes de compras** (1 dia antes)
- **Configurações personalizáveis** de notificação

### ✅ 5. Estatísticas e Progresso
- **Progresso semanal** de refeições concluídas
- **Estatísticas de uso** de receitas
- **Categorias mais utilizadas**
- **Métricas de planejamento**

## Arquitetura do Sistema

### Componentes Principais

1. **MealPlanningCalendar** - Componente principal do calendário
2. **MealPlanDay** - Representa cada dia no calendário
3. **MealPlanSuggestions** - Modal de sugestões de receitas
4. **MealPlanNotifications** - Sistema de notificações
5. **MealPlanningScreen** - Tela principal

### Hooks Personalizados

- **useMealPlanning** - Hook principal com toda a lógica de meal planning
- Gerencia estado do calendário, navegação e operações CRUD
- Integra com APIs e fornece funções utilitárias

### APIs e Serviços

- **mealPlanningApi** - API completa com RTK Query
- Endpoints para CRUD, sugestões, estatísticas e notificações
- Cache inteligente e invalidação automática

### Tipos TypeScript

- **MealPlan** - Estrutura principal de uma refeição planejada
- **MealPlanSuggestion** - Sugestões de receitas
- **MealPlanningPreferences** - Preferências do usuário
- **MealPlanCalendarDay** - Dados de um dia no calendário

## Como Usar

### 1. Navegação Básica

```typescript
// Navegar para o planejamento
navigation.navigate('MealPlanning');

// Navegar entre períodos
const {navigatePrevious, navigateNext, navigateToToday} = useMealPlanning({userId});

// Alternar entre visualizações
switchViewMode('week'); // ou 'month'
```

### 2. Adicionar Refeições

```typescript
// Adicionar refeição manualmente
await addMealToDate(date, 'lunch', recipeId, 4);

// Via drag & drop
startDragRecipe(recipeData);
await dropRecipeOnDate(date, 'dinner', recipeData);
```

### 3. Gerenciar Refeições

```typescript
// Marcar como concluída
await toggleMealCompleted(mealPlanId, true);

// Mover para outra data
await moveMealToDate(mealPlanId, newDate, 'breakfast');

// Copiar para outra data
await copyMealToDate(mealPlanId, targetDate, 'lunch');

// Remover refeição
await removeMealFromDate(mealPlanId);
```

### 4. Gerar Planos Automáticos

```typescript
// Gerar plano semanal
await generateWeekPlan(weekStartDate, replaceExisting);

// Obter sugestões inteligentes
const suggestions = await getSmartSuggestions({
  userId,
  weekStart: date.toISOString(),
  preferences: userPreferences
});
```

### 5. Configurar Notificações

```typescript
// O componente MealPlanNotifications gerencia automaticamente
<MealPlanNotifications
  mealPlans={mealPlans}
  onNotificationPress={(mealPlanId) => {
    // Navegar para detalhes da receita
    navigation.navigate('RecipeDetails', {recipeId});
  }}
/>
```

## Integração com Outros Sistemas

### Receitas
- Integração completa com o sistema de receitas
- Acesso a favoritos, categorias e detalhes
- Navegação direta para detalhes da receita

### Lista de Compras
- Geração automática baseada em refeições planejadas
- Consolidação de ingredientes duplicados
- Organização por categorias de supermercado

### Notificações
- Sistema nativo de push notifications
- Configurações granulares por usuário
- Diferentes tipos de lembretes

## Configuração de Desenvolvimento

### Dependências Necessárias

```json
{
  "react-native-push-notification": "^8.1.1",
  "@react-native-async-storage/async-storage": "^1.19.0",
  "react-native-gesture-handler": "^2.12.0"
}
```

### Configuração Android

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
```

### Configuração iOS

```xml
<!-- ios/RecipeBookApp/Info.plist -->
<key>UIBackgroundModes</key>
<array>
  <string>background-processing</string>
</array>
```

## Próximas Melhorias

### Funcionalidades Planejadas
- [ ] Integração com calendário do sistema
- [ ] Compartilhamento de planos de refeição
- [ ] Templates de planejamento
- [ ] Análise nutricional do plano
- [ ] Integração com wearables
- [ ] Modo offline completo

### Otimizações
- [ ] Cache inteligente de sugestões
- [ ] Pré-carregamento de dados
- [ ] Otimização de performance do calendário
- [ ] Redução do bundle size

## Troubleshooting

### Problemas Comuns

1. **Notificações não funcionam**
   - Verificar permissões do app
   - Confirmar configuração de canais (Android)
   - Testar em dispositivo físico

2. **Sugestões não aparecem**
   - Verificar se há receitas favoritas
   - Confirmar preferências do usuário
   - Verificar conectividade com API

3. **Calendário lento**
   - Reduzir período de dados carregados
   - Implementar virtualização
   - Otimizar re-renders

### Debug

```typescript
// Habilitar logs de debug
const {mealPlans, loadingMealPlans} = useMealPlanning({
  userId,
  debug: true // Adicionar flag de debug
});
```

## Conclusão

O sistema de planejamento de refeições oferece uma experiência completa e intuitiva para organizar refeições, com integração profunda com o ecossistema do app de receitas. A arquitetura modular permite fácil extensão e manutenção.# Guia do Sistema de Planejamento de Refeições

## Visão Geral

O sistema de planejamento de refeições permite aos usuários organizar suas refeições de forma inteligente, com funcionalidades de arrastar e soltar, sugestões automáticas e notificações de lembretes.

## Funcionalidades Implementadas

### ✅ 1. Componente de Calendário
- **Visualização semanal e mensal** de refeições planejadas
- **Interface intuitiva** com slots para cada tipo de refeição
- **Navegação fluida** entre períodos (semana/mês)
- **Indicadores visuais** para dias com refeições planejadas

### ✅ 2. Funcionalidade Drag & Drop
- **Arrastar receitas** para slots de refeições
- **Mover refeições** entre datas e tipos
- **Interface visual** para indicar áreas de drop
- **Feedback imediato** durante operações de arrastar

### ✅ 3. Visualização por Tipo de Refeição
- **Café da manhã** (breakfast) - Ícone: coffee, Cor: #FF9800
- **Almoço** (lunch) - Ícone: food, Cor: #4CAF50  
- **Jantar** (dinner) - Ícone: food-variant, Cor: #2196F3
- **Lanche** (snack) - Ícone: cookie, Cor: #9C27B0

### ✅ 4. Sugestões Baseadas em Preferências
- **Algoritmo de sugestões** baseado em histórico e preferências
- **Pontuação de compatibilidade** para cada sugestão
- **Razões explicativas** para cada sugestão
- **Filtros por tipo de refeição**

### ✅ 5. Sistema de Notificações
- **Lembretes de refeições** com antecedência configurável
- **Notificações diárias** para planejamento
- **Lembretes semanais** para preparação
- **Gerenciamento de permissões** de notificação

## Arquitetura do Sistema

### Tipos de Dados (`src/types/mealPlan.ts`)
```typescript
// Principais interfaces
- MealPlanItem: Item individual de refeição
- MealPlan: Plano completo de refeições
- MealSuggestion: Sugestão de receita
- MealPlanPreferences: Preferências do usuário
- CalendarDay/WeekView/MonthView: Visualizações do calendário
```

### API Service (`src/services/mealPlanApi.ts`)
```typescript
// Principais endpoints
- getMealPlans: Buscar planos do usuário
- addMealPlanItem: Adicionar refeição ao plano
- getMealSuggestions: Obter sugestões personalizadas
- getWeekView/getMonthView: Visualizações do calendário
- generateMealPlan: Geração automática de planos
```

### Hook Principal (`src/hooks/useMealPlan.ts`)
```typescript
// Funcionalidades principais
- Gerenciamento de estado do calendário
- Operações de drag & drop
- Navegação entre períodos
- Integração com API
```

### Componentes

#### MealPlanCalendar (`src/components/mealPlan/MealPlanCalendar.tsx`)
- Componente principal do calendário
- Suporte a visualização semanal e mensal
- Integração com drag & drop
- Menu de ações rápidas

#### MealSlot (`src/components/mealPlan/MealSlot.tsx`)
- Representa cada slot de refeição
- Suporte a múltiplas refeições por slot
- Menu contextual para ações
- Indicadores visuais de estado

#### MealSuggestions (`src/components/mealPlan/MealSuggestions.tsx`)
- Modal de sugestões de refeições
- Filtros por tipo de refeição
- Pontuação de compatibilidade
- Razões para cada sugestão

### Tela Principal (`src/screens/mealPlan/MealPlanScreen.tsx`)
- Interface principal do usuário
- Estatísticas da semana
- Ações rápidas
- Integração com navegação

## Como Usar

### Para Desenvolvedores

1. **Importar o hook principal:**
```typescript
import {useMealPlan} from '../hooks/useMealPlan';

const {
  addRecipeToMealPlan,
  getMealsForDate,
  generateSmartMealPlan,
  // ... outras funções
} = useMealPlan({userId: 'user123'});
```

2. **Adicionar receita ao plano:**
```typescript
await addRecipeToMealPlan(
  'recipe-id',
  '2024-01-15', // data
  'lunch',      // tipo de refeição
  2             // porções
);
```

3. **Obter refeições de uma data:**
```typescript
const meals = getMealsForDate('2024-01-15');
// meals = { breakfast: [...], lunch: [...], dinner: [...], snack: [...] }
```

4. **Gerar plano automático:**
```typescript
await generateSmartMealPlan('2024-01-15', '2024-01-21');
```

### Para Usuários Finais

1. **Visualizar Plano:**
   - Abra a tela "Plano de Refeições"
   - Alterne entre visualização semanal e mensal
   - Navegue entre períodos usando as setas

2. **Adicionar Refeições:**
   - Toque em um slot vazio de refeição
   - Selecione uma receita das sugestões
   - Ou arraste uma receita de outra tela

3. **Gerenciar Refeições:**
   - Toque no menu (⋮) de uma refeição
   - Ajuste porções, mova ou remova
   - Visualize detalhes da receita

4. **Ações Rápidas:**
   - Toque no botão "+" no canto inferior
   - Acesse criação de planos, importação, etc.
   - Visualize estatísticas da semana

## Configuração de Notificações

### Lembretes Automáticos
```typescript
import {scheduleDefaultReminders} from '../services/mealPlanNotifications';

// Configurar lembretes padrão para um usuário
await scheduleDefaultReminders(userId);
```

### Lembrete Personalizado
```typescript
import {scheduleMealReminder} from '../services/mealPlanNotifications';

// Agendar lembrete 30 minutos antes da refeição
const reminderId = await scheduleMealReminder(
  mealPlanItemId,
  'lunch',
  new Date('2024-01-15T12:00:00'),
  30, // minutos antes
  'Lasanha de Berinjela'
);
```

## Integração com Outras Funcionalidades

### Receitas
- Integração com sistema de receitas existente
- Drag & drop de receitas para o calendário
- Visualização de detalhes da receita

### Lista de Compras (Futuro)
- Geração automática baseada no plano de refeições
- Consolidação de ingredientes
- Organização por categorias

### Comunidade (Futuro)
- Compartilhamento de planos de refeições
- Sugestões baseadas na comunidade
- Avaliações de planos

## Próximos Passos

### Melhorias Planejadas
1. **Integração com Lista de Compras** (Tarefa 15)
2. **Notificações Push Reais** (usando react-native-push-notification)
3. **Sincronização Offline** (usando Redux Persist)
4. **Análise Nutricional** dos planos
5. **Templates de Planos** reutilizáveis
6. **Integração com Calendário** do sistema
7. **Modo Família** para múltiplos usuários

### Configurações Necessárias para Produção
1. **API Backend** real para persistência
2. **Serviço de Notificações** (Firebase, OneSignal)
3. **Análise de Dados** para melhorar sugestões
4. **Cache e Performance** otimizações
5. **Testes Automatizados** para componentes críticos

## Troubleshooting

### Problemas Comuns

1. **Sugestões não aparecem:**
   - Verifique se o usuário tem receitas favoritas
   - Confirme se as preferências estão configuradas
   - Verifique conectividade com a API

2. **Drag & drop não funciona:**
   - Confirme se o usuário não está em uma data passada
   - Verifique se há receitas sendo arrastadas
   - Teste em diferentes dispositivos

3. **Notificações não chegam:**
   - Verifique permissões do sistema
   - Confirme configuração do serviço de push
   - Teste em dispositivo físico (não simulador)

### Debug

```typescript
// Habilitar logs detalhados
console.log('MealPlan Debug:', {
  userId,
  currentDate,
  selectedDate,
  draggedRecipe,
  weekView,
  suggestions,
});
```

## Conclusão

O sistema de planejamento de refeições está completo e pronto para uso, oferecendo uma experiência rica e intuitiva para os usuários organizarem suas refeições de forma inteligente e eficiente.
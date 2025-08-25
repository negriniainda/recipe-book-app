# Guia de Acessibilidade - Recipe Book App

Este documento descreve os recursos de acessibilidade implementados no aplicativo Recipe Book, garantindo que seja utilizável por pessoas com diferentes necessidades e habilidades.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Recursos Implementados](#recursos-implementados)
- [Configurações Disponíveis](#configurações-disponíveis)
- [Componentes Acessíveis](#componentes-acessíveis)
- [Testes de Acessibilidade](#testes-de-acessibilidade)
- [Conformidade WCAG](#conformidade-wcag)
- [Como Usar](#como-usar)

## 🎯 Visão Geral

O Recipe Book App foi desenvolvido seguindo as diretrizes de acessibilidade WCAG 2.1 (Web Content Accessibility Guidelines), garantindo que seja utilizável por pessoas com:

- **Deficiências visuais**: Cegueira, baixa visão, daltonismo
- **Deficiências auditivas**: Surdez, perda auditiva
- **Deficiências motoras**: Limitações de movimento, tremores
- **Deficiências cognitivas**: Dificuldades de aprendizado, memória, atenção

## ✨ Recursos Implementados

### 🔊 Suporte a Leitores de Tela

- **VoiceOver (iOS)** e **TalkBack (Android)** totalmente suportados
- Rótulos descritivos em todos os elementos interativos
- Anúncios contextuais para navegação e ações
- Configuração de velocidade, tom e volume da fala
- Feedback sonoro para confirmações

### 👁️ Recursos Visuais

- **Alto Contraste**: Melhora a legibilidade com cores mais contrastantes
- **Tamanhos de Fonte**: 4 níveis (Pequeno, Médio, Grande, Extra Grande)
- **Peso da Fonte**: Opção de texto em negrito
- **Suporte a Daltonismo**: Ajustes para protanopia, deuteranopia e tritanopia
- **Modo Escuro**: Interface com cores escuras para reduzir fadiga visual
- **Redução de Transparência**: Minimiza efeitos visuais confusos

### ⌨️ Navegação por Teclado

- Navegação completa usando apenas teclado
- Ordem de foco lógica e previsível
- Indicadores visuais de foco
- Atalhos de teclado para ações comuns
- Suporte a teclados externos

### 🎤 Controle por Voz

- Comandos de voz para navegação
- Reconhecimento de comandos personalizados
- Feedback de confirmação
- Lista de comandos disponíveis
- Configuração de sensibilidade

### 🎯 Alvos de Toque

- Tamanhos mínimos de 44x44 pixels
- Três tamanhos configuráveis (Pequeno, Médio, Grande)
- Espaçamento adequado entre elementos
- Feedback tátil (vibração) opcional

### 🎬 Controle de Animações

- **Reduzir Movimento**: Minimiza animações e transições
- **Pausar Animações**: Para animações automáticas
- Respeita configurações do sistema

### 🔄 Feedback Multissensorial

- **Feedback Tátil**: Vibrações para confirmações
- **Feedback Sonoro**: Sons para ações importantes
- **Feedback Visual**: Indicações visuais claras

## ⚙️ Configurações Disponíveis

### Configurações Visuais
```typescript
- fontSize: 'small' | 'medium' | 'large' | 'extra-large'
- fontWeight: 'normal' | 'bold'
- highContrast: boolean
- darkMode: boolean
- colorBlindnessSupport: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
```

### Configurações de Leitor de Tela
```typescript
- screenReaderEnabled: boolean
- announceNavigation: boolean
- announceActions: boolean
- announceContent: boolean
- speechRate: number (0.5 - 2.0)
- speechPitch: number (0.5 - 2.0)
- speechVolume: number (0.0 - 1.0)
```

### Configurações de Navegação
```typescript
- keyboardNavigation: boolean
- focusIndicator: boolean
- skipLinks: boolean
- touchTargetSize: 'small' | 'medium' | 'large'
- voiceControl: boolean
```

### Configurações de Conteúdo
```typescript
- imageDescriptions: boolean
- videoDescriptions: boolean
- captionsEnabled: boolean
```

### Configurações de Animação
```typescript
- reduceMotion: boolean
- reduceTransparency: boolean
- pauseAnimations: boolean
```

### Configurações de Feedback
```typescript
- hapticFeedback: boolean
- audioFeedback: boolean
- visualFeedback: boolean
```

## 🧩 Componentes Acessíveis

### AccessibleText
Componente de texto com suporte a:
- Escala de fonte automática
- Alto contraste
- Suporte a daltonismo
- Formatação para leitores de tela

```tsx
<AccessibleText 
  variant="heading"
  highContrast={true}
  semanticRole="header"
>
  Título da Receita
</AccessibleText>
```

### AccessibleButton
Botão com recursos de acessibilidade:
- Tamanho mínimo de toque
- Feedback tátil
- Estados de acessibilidade
- Suporte a teclado

```tsx
<AccessibleButton
  title="Adicionar aos Favoritos"
  description="Salvar esta receita nos favoritos"
  accessibilityHint="Toque duplo para adicionar"
  onPress={handleAddToFavorites}
/>
```

### AccessibilityWrapper
Container que aplica configurações de acessibilidade:
- Escala de fonte
- Tamanho de alvos de toque
- Alto contraste
- Estados de acessibilidade

```tsx
<AccessibilityWrapper
  accessibilityLabel="Card da receita"
  accessibilityRole="button"
  accessibilityState={{ selected: isSelected }}
>
  {children}
</AccessibilityWrapper>
```

### KeyboardNavigationProvider
Provedor de navegação por teclado:
- Gerenciamento de foco
- Ordem de navegação
- Indicadores visuais

```tsx
<KeyboardNavigationProvider>
  <App />
</KeyboardNavigationProvider>
```

### VoiceControlProvider
Provedor de controle por voz:
- Reconhecimento de comandos
- Feedback de confirmação
- Comandos personalizados

```tsx
<VoiceControlProvider showIndicator={true}>
  <App />
</VoiceControlProvider>
```

## 🧪 Testes de Acessibilidade

### Testes Automatizados

O app inclui um sistema completo de testes de acessibilidade:

#### Categorias de Teste
- **Visual**: Contraste, tamanhos de fonte, cores
- **Auditivo**: Suporte a leitores de tela, feedback sonoro
- **Motor**: Navegação por teclado, tamanhos de toque
- **Cognitivo**: Estrutura semântica, clareza de conteúdo

#### Executando Testes
```typescript
import { AccessibilityTester } from '@/components/accessibility';

// Executar todos os testes
const results = await accessibilityValidator.runAllTests();

// Executar teste específico
const test = await accessibilityValidator.runTest('color-contrast');

// Validar elemento específico
const validation = accessibilityValidator.validateElement('button', {
  accessibilityLabel: 'Salvar receita',
  style: { backgroundColor: '#2196f3', color: '#ffffff' }
});
```

### Relatórios de Acessibilidade

O sistema gera relatórios detalhados com:
- Pontuação geral (0-100)
- Conformidade WCAG (A, AA, AAA)
- Lista de problemas encontrados
- Recomendações de correção

## 📏 Conformidade WCAG

### Nível A (Básico)
✅ Todas as imagens têm texto alternativo  
✅ Conteúdo pode ser navegado por teclado  
✅ Contraste mínimo de 3:1 para texto grande  
✅ Estrutura semântica apropriada  

### Nível AA (Padrão)
✅ Contraste mínimo de 4.5:1 para texto normal  
✅ Contraste mínimo de 3:1 para texto grande  
✅ Texto pode ser redimensionado até 200%  
✅ Alvos de toque têm pelo menos 44x44 pixels  
✅ Foco visível em elementos interativos  

### Nível AAA (Avançado)
✅ Contraste mínimo de 7:1 para texto normal  
✅ Contraste mínimo de 4.5:1 para texto grande  
✅ Sem dependência de cor para transmitir informação  
✅ Animações podem ser pausadas  

## 🚀 Como Usar

### 1. Configuração Inicial

Acesse **Configurações > Acessibilidade** para:
- Configurar preferências visuais
- Ativar leitor de tela
- Configurar navegação por teclado
- Ativar controle por voz

### 2. Ações Rápidas

Use os botões de ação rápida para:
- Alternar alto contraste
- Aumentar/diminuir fonte
- Ativar/desativar leitor de tela

### 3. Comandos de Voz

Comandos disponíveis:
- "Voltar" - Volta para tela anterior
- "Início" - Vai para tela inicial
- "Buscar" - Abre a busca
- "Ajuda" - Mostra ajuda
- "Parar escuta" - Para reconhecimento

### 4. Navegação por Teclado

Teclas principais:
- **Tab** - Próximo elemento
- **Shift+Tab** - Elemento anterior
- **Setas** - Navegação direcional
- **Enter/Espaço** - Ativar elemento
- **Esc** - Cancelar/voltar

### 5. Tutoriais

Acesse **Configurações > Acessibilidade > Tutoriais** para:
- Aprender sobre recursos disponíveis
- Praticar navegação
- Ver exemplos práticos

## 🔧 Desenvolvimento

### Adicionando Acessibilidade a Novos Componentes

```tsx
import { AccessibleButton, useAccessibilitySettings } from '@/components/accessibility';

const MyComponent = () => {
  const { settings, fontScale } = useAccessibilitySettings();
  
  return (
    <AccessibleButton
      title="Minha Ação"
      accessibilityHint="Toque duplo para executar ação"
      onPress={handleAction}
    />
  );
};
```

### Testando Acessibilidade

```tsx
import { accessibilityValidator } from '@/utils/accessibilityValidator';

// Validar componente
const validation = accessibilityValidator.validateElement('button', {
  accessibilityLabel: 'Botão de ação',
  style: { minWidth: 44, minHeight: 44 }
});

console.log('Válido:', validation.isValid);
console.log('Pontuação:', validation.score);
console.log('Problemas:', validation.issues);
```

## 📞 Suporte

Para dúvidas sobre acessibilidade:
- Consulte os tutoriais integrados no app
- Execute testes de acessibilidade regularmente
- Reporte problemas através do feedback do app

## 📚 Recursos Adicionais

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [iOS Accessibility](https://developer.apple.com/accessibility/)
- [Android Accessibility](https://developer.android.com/guide/topics/ui/accessibility)

---

**Nota**: Este aplicativo está em constante evolução para melhorar a acessibilidade. Feedback e sugestões são sempre bem-vindos!
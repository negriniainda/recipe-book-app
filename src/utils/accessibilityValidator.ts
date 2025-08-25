import { AccessibilityIssue, AccessibilityTest } from '../types/accessibility';

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  issues: AccessibilityIssue[];
  recommendations: string[];
}

export interface ElementProperties {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: any;
  style?: any;
  children?: any;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}

export class AccessibilityValidator {
  private static instance: AccessibilityValidator;
  private tests: Map<string, AccessibilityTest> = new Map();

  static getInstance(): AccessibilityValidator {
    if (!AccessibilityValidator.instance) {
      AccessibilityValidator.instance = new AccessibilityValidator();
    }
    return AccessibilityValidator.instance;
  }

  constructor() {
    this.initializeTests();
  }

  private initializeTests() {
    // Teste de rótulos de acessibilidade
    this.tests.set('accessibility-labels', {
      id: 'accessibility-labels',
      name: 'Rótulos de Acessibilidade',
      description: 'Verificar se elementos interativos têm rótulos apropriados',
      category: 'visual',
      status: 'not-tested',
      issues: [],
      lastTested: new Date().toISOString(),
    });

    // Teste de contraste de cores
    this.tests.set('color-contrast', {
      id: 'color-contrast',
      name: 'Contraste de Cores',
      description: 'Verificar se o contraste atende aos padrões WCAG',
      category: 'visual',
      status: 'not-tested',
      issues: [],
      lastTested: new Date().toISOString(),
    });

    // Teste de tamanho de alvos de toque
    this.tests.set('touch-targets', {
      id: 'touch-targets',
      name: 'Tamanho de Alvos de Toque',
      description: 'Verificar se elementos tocáveis têm tamanho adequado',
      category: 'motor',
      status: 'not-tested',
      issues: [],
      lastTested: new Date().toISOString(),
    });

    // Teste de navegação por teclado
    this.tests.set('keyboard-navigation', {
      id: 'keyboard-navigation',
      name: 'Navegação por Teclado',
      description: 'Verificar se todos os elementos são acessíveis via teclado',
      category: 'motor',
      status: 'not-tested',
      issues: [],
      lastTested: new Date().toISOString(),
    });

    // Teste de estrutura semântica
    this.tests.set('semantic-structure', {
      id: 'semantic-structure',
      name: 'Estrutura Semântica',
      description: 'Verificar se a estrutura semântica está correta',
      category: 'cognitive',
      status: 'not-tested',
      issues: [],
      lastTested: new Date().toISOString(),
    });

    // Teste de feedback de ações
    this.tests.set('action-feedback', {
      id: 'action-feedback',
      name: 'Feedback de Ações',
      description: 'Verificar se ações fornecem feedback adequado',
      category: 'auditory',
      status: 'not-tested',
      issues: [],
      lastTested: new Date().toISOString(),
    });
  }

  validateElement(
    elementType: string,
    properties: ElementProperties
  ): ValidationResult {
    const issues: AccessibilityIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Validar rótulos de acessibilidade
    const labelIssues = this.validateAccessibilityLabels(elementType, properties);
    issues.push(...labelIssues);

    // Validar contraste de cores
    const contrastIssues = this.validateColorContrast(properties);
    issues.push(...contrastIssues);

    // Validar tamanho de alvos de toque
    const touchTargetIssues = this.validateTouchTargets(elementType, properties);
    issues.push(...touchTargetIssues);

    // Validar estrutura semântica
    const semanticIssues = this.validateSemanticStructure(elementType, properties);
    issues.push(...semanticIssues);

    // Validar estados de acessibilidade
    const stateIssues = this.validateAccessibilityStates(properties);
    issues.push(...stateIssues);

    // Calcular pontuação baseada nos problemas encontrados
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;
    const lowIssues = issues.filter(i => i.severity === 'low').length;

    score -= (criticalIssues * 25) + (highIssues * 15) + (mediumIssues * 10) + (lowIssues * 5);
    score = Math.max(0, score);

    // Gerar recomendações
    if (issues.length > 0) {
      recommendations.push(...this.generateRecommendations(issues));
    }

    return {
      isValid: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
      score,
      issues,
      recommendations,
    };
  }

  private validateAccessibilityLabels(
    elementType: string,
    properties: ElementProperties
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const interactiveElements = ['button', 'link', 'textinput', 'switch', 'slider'];

    if (interactiveElements.includes(elementType.toLowerCase())) {
      if (!properties.accessibilityLabel && !properties.children) {
        issues.push({
          id: `missing-label-${Date.now()}`,
          severity: 'critical',
          type: 'missing-label',
          element: elementType,
          description: 'Elemento interativo sem rótulo de acessibilidade',
          suggestion: 'Adicione uma propriedade accessibilityLabel ou conteúdo de texto',
          wcagLevel: 'A',
          fixed: false,
        });
      }

      if (properties.accessibilityLabel && properties.accessibilityLabel.length < 3) {
        issues.push({
          id: `short-label-${Date.now()}`,
          severity: 'medium',
          type: 'missing-label',
          element: elementType,
          description: 'Rótulo de acessibilidade muito curto',
          suggestion: 'Use rótulos mais descritivos (mínimo 3 caracteres)',
          wcagLevel: 'AA',
          fixed: false,
        });
      }

      if (properties.onPress && !properties.accessibilityHint) {
        issues.push({
          id: `missing-hint-${Date.now()}`,
          severity: 'low',
          type: 'missing-label',
          element: elementType,
          description: 'Elemento interativo sem dica de acessibilidade',
          suggestion: 'Adicione accessibilityHint para explicar o que acontece ao tocar',
          wcagLevel: 'AAA',
          fixed: false,
        });
      }
    }

    return issues;
  }

  private validateColorContrast(properties: ElementProperties): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    if (properties.style) {
      const { color, backgroundColor, fontSize } = properties.style;
      
      if (color && backgroundColor) {
        const contrastRatio = this.calculateContrastRatio(color, backgroundColor);
        const isLargeText = fontSize && fontSize >= 18;
        
        const minContrastAA = isLargeText ? 3 : 4.5;
        const minContrastAAA = isLargeText ? 4.5 : 7;

        if (contrastRatio < minContrastAA) {
          issues.push({
            id: `low-contrast-${Date.now()}`,
            severity: 'high',
            type: 'low-contrast',
            element: 'text',
            description: `Contraste insuficiente: ${contrastRatio.toFixed(2)}:1 (mínimo: ${minContrastAA}:1)`,
            suggestion: 'Ajuste as cores para melhorar o contraste',
            wcagLevel: 'AA',
            fixed: false,
          });
        } else if (contrastRatio < minContrastAAA) {
          issues.push({
            id: `medium-contrast-${Date.now()}`,
            severity: 'medium',
            type: 'low-contrast',
            element: 'text',
            description: `Contraste abaixo do ideal: ${contrastRatio.toFixed(2)}:1 (ideal: ${minContrastAAA}:1)`,
            suggestion: 'Considere melhorar o contraste para nível AAA',
            wcagLevel: 'AAA',
            fixed: false,
          });
        }
      }
    }

    return issues;
  }

  private validateTouchTargets(
    elementType: string,
    properties: ElementProperties
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const touchableElements = ['button', 'touchableopacity', 'touchablehighlight', 'pressable'];

    if (touchableElements.includes(elementType.toLowerCase()) && properties.style) {
      const { width, height, minWidth, minHeight } = properties.style;
      const actualWidth = width || minWidth || 0;
      const actualHeight = height || minHeight || 0;

      const minSize = 44; // Tamanho mínimo recomendado

      if (actualWidth < minSize || actualHeight < minSize) {
        issues.push({
          id: `small-target-${Date.now()}`,
          severity: 'medium',
          type: 'small-target',
          element: elementType,
          description: `Alvo de toque muito pequeno: ${actualWidth}x${actualHeight}px (mínimo: ${minSize}x${minSize}px)`,
          suggestion: `Aumente o tamanho para pelo menos ${minSize}x${minSize}px`,
          wcagLevel: 'AA',
          fixed: false,
        });
      }
    }

    return issues;
  }

  private validateSemanticStructure(
    elementType: string,
    properties: ElementProperties
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Validar roles apropriados
    const elementRoleMap: Record<string, string[]> = {
      'button': ['button'],
      'text': ['text', 'header'],
      'textinput': ['textbox'],
      'image': ['image'],
      'scrollview': ['scrollbar'],
      'flatlist': ['list'],
      'sectionlist': ['list'],
    };

    const expectedRoles = elementRoleMap[elementType.toLowerCase()];
    if (expectedRoles && properties.accessibilityRole) {
      if (!expectedRoles.includes(properties.accessibilityRole)) {
        issues.push({
          id: `wrong-role-${Date.now()}`,
          severity: 'medium',
          type: 'keyboard-trap',
          element: elementType,
          description: `Role de acessibilidade inadequado: ${properties.accessibilityRole}`,
          suggestion: `Use um dos roles apropriados: ${expectedRoles.join(', ')}`,
          wcagLevel: 'A',
          fixed: false,
        });
      }
    }

    return issues;
  }

  private validateAccessibilityStates(properties: ElementProperties): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    if (properties.disabled && !properties.accessibilityState?.disabled) {
      issues.push({
        id: `missing-disabled-state-${Date.now()}`,
        severity: 'low',
        type: 'focus-order',
        element: 'interactive',
        description: 'Estado desabilitado não informado para leitores de tela',
        suggestion: 'Adicione accessibilityState={{ disabled: true }}',
        wcagLevel: 'A',
        fixed: false,
      });
    }

    return issues;
  }

  private calculateContrastRatio(foreground: string, background: string): number {
    // Implementação simplificada - em produção usar biblioteca específica
    // como 'color-contrast' ou 'wcag-contrast'
    
    // Converter cores para RGB
    const fgRgb = this.hexToRgb(foreground);
    const bgRgb = this.hexToRgb(background);
    
    if (!fgRgb || !bgRgb) return 1; // Fallback se não conseguir converter

    // Calcular luminância relativa
    const fgLuminance = this.getRelativeLuminance(fgRgb);
    const bgLuminance = this.getRelativeLuminance(bgRgb);

    // Calcular contraste
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  private generateRecommendations(issues: AccessibilityIssue[]): string[] {
    const recommendations: string[] = [];
    const issueTypes = new Set(issues.map(i => i.type));

    if (issueTypes.has('missing-label')) {
      recommendations.push('Adicione rótulos descritivos a todos os elementos interativos');
    }

    if (issueTypes.has('low-contrast')) {
      recommendations.push('Melhore o contraste de cores para atender aos padrões WCAG');
    }

    if (issueTypes.has('small-target')) {
      recommendations.push('Aumente o tamanho dos alvos de toque para pelo menos 44x44px');
    }

    if (issueTypes.has('keyboard-trap')) {
      recommendations.push('Verifique a navegação por teclado e ordem de foco');
    }

    if (issueTypes.has('focus-order')) {
      recommendations.push('Implemente estados de acessibilidade apropriados');
    }

    // Recomendações gerais baseadas na severidade
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;

    if (criticalIssues > 0) {
      recommendations.push('Corrija problemas críticos imediatamente - eles impedem o uso por pessoas com deficiência');
    }

    if (highIssues > 0) {
      recommendations.push('Problemas de alta prioridade devem ser corrigidos para melhorar significativamente a acessibilidade');
    }

    return recommendations;
  }

  runTest(testId: string, element?: any): AccessibilityTest {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Teste não encontrado: ${testId}`);
    }

    // Simular execução do teste
    const issues: AccessibilityIssue[] = [];
    let status: 'passed' | 'failed' | 'warning' = 'passed';

    // Lógica específica para cada teste
    switch (testId) {
      case 'accessibility-labels':
        // Simular verificação de rótulos
        if (Math.random() > 0.7) {
          issues.push({
            id: `label-issue-${Date.now()}`,
            severity: 'high',
            type: 'missing-label',
            element: 'button',
            description: 'Botão sem rótulo de acessibilidade encontrado',
            suggestion: 'Adicione accessibilityLabel ao botão',
            wcagLevel: 'A',
            fixed: false,
          });
          status = 'failed';
        }
        break;

      case 'color-contrast':
        // Simular verificação de contraste
        if (Math.random() > 0.8) {
          issues.push({
            id: `contrast-issue-${Date.now()}`,
            severity: 'medium',
            type: 'low-contrast',
            element: 'text',
            description: 'Contraste insuficiente detectado',
            suggestion: 'Ajuste as cores para melhorar o contraste',
            wcagLevel: 'AA',
            fixed: false,
          });
          status = 'warning';
        }
        break;

      // Adicionar lógica para outros testes...
    }

    const updatedTest: AccessibilityTest = {
      ...test,
      status,
      issues,
      lastTested: new Date().toISOString(),
    };

    this.tests.set(testId, updatedTest);
    return updatedTest;
  }

  getAllTests(): AccessibilityTest[] {
    return Array.from(this.tests.values());
  }

  getTestById(testId: string): AccessibilityTest | undefined {
    return this.tests.get(testId);
  }

  runAllTests(): { completed: number; failed: number; tests: AccessibilityTest[] } {
    const results = Array.from(this.tests.keys()).map(testId => this.runTest(testId));
    
    return {
      completed: results.length,
      failed: results.filter(t => t.status === 'failed').length,
      tests: results,
    };
  }
}

export const accessibilityValidator = AccessibilityValidator.getInstance();
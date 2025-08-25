import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Appbar,
  Card,
  Text,
  Button,
  Chip,
  ProgressBar,
  List,
  Divider,
  FAB,
} from 'react-native-paper';
import { useAccessibilitySettings } from '../../hooks/useAccessibility';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'visual' | 'auditory' | 'motor' | 'cognitive';
  duration: number; // em minutos
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  steps: TutorialStep[];
}

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'interactive' | 'video' | 'practice';
  completed: boolean;
}

interface AccessibilityTutorialsScreenProps {
  navigation: any;
}

const AccessibilityTutorialsScreen: React.FC<AccessibilityTutorialsScreenProps> = ({
  navigation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const { settings } = useAccessibilitySettings();

  const tutorials: Tutorial[] = [
    {
      id: 'screen-reader-basics',
      title: 'Fundamentos do Leitor de Tela',
      description: 'Aprenda a usar leitores de tela para navegar no aplicativo',
      category: 'auditory',
      duration: 10,
      difficulty: 'beginner',
      completed: false,
      steps: [
        {
          id: 'step-1',
          title: 'O que é um Leitor de Tela',
          content: 'Um leitor de tela é uma tecnologia assistiva que converte texto e elementos da interface em fala ou braille. Ele permite que pessoas cegas ou com baixa visão naveguem e interajam com aplicativos.',
          type: 'text',
          completed: false,
        },
        {
          id: 'step-2',
          title: 'Ativando o Leitor de Tela',
          content: 'Para ativar o leitor de tela no seu dispositivo:\n\n• iOS: Vá em Configurações > Acessibilidade > VoiceOver\n• Android: Vá em Configurações > Acessibilidade > TalkBack',
          type: 'interactive',
          completed: false,
        },
        {
          id: 'step-3',
          title: 'Navegação Básica',
          content: 'Com o leitor de tela ativo:\n\n• Toque uma vez para selecionar um elemento\n• Toque duas vezes para ativar\n• Deslize para direita/esquerda para navegar\n• Use dois dedos para rolar',
          type: 'practice',
          completed: false,
        },
      ],
    },
    {
      id: 'high-contrast-setup',
      title: 'Configurando Alto Contraste',
      description: 'Configure o modo de alto contraste para melhor visibilidade',
      category: 'visual',
      duration: 5,
      difficulty: 'beginner',
      completed: false,
      steps: [
        {
          id: 'step-1',
          title: 'Por que usar Alto Contraste',
          content: 'O modo de alto contraste melhora a legibilidade aumentando a diferença entre cores de primeiro plano e fundo, especialmente útil para pessoas com baixa visão ou daltonismo.',
          type: 'text',
          completed: false,
        },
        {
          id: 'step-2',
          title: 'Ativando Alto Contraste',
          content: 'Você pode ativar o alto contraste de duas formas:\n\n1. Nas configurações de acessibilidade do app\n2. Usando o botão de ação rápida na tela principal',
          type: 'interactive',
          completed: false,
        },
      ],
    },
    {
      id: 'voice-control-guide',
      title: 'Controle por Voz',
      description: 'Use comandos de voz para navegar no aplicativo',
      category: 'motor',
      duration: 15,
      difficulty: 'intermediate',
      completed: false,
      steps: [
        {
          id: 'step-1',
          title: 'Configurando Controle por Voz',
          content: 'O controle por voz permite navegar e executar ações usando apenas comandos de voz, ideal para pessoas com limitações motoras.',
          type: 'text',
          completed: false,
        },
        {
          id: 'step-2',
          title: 'Comandos Básicos',
          content: 'Comandos disponíveis:\n\n• "Voltar" - Volta para tela anterior\n• "Início" - Vai para tela inicial\n• "Buscar" - Abre a busca\n• "Ajuda" - Mostra ajuda\n• "Parar escuta" - Para o reconhecimento',
          type: 'practice',
          completed: false,
        },
      ],
    },
    {
      id: 'keyboard-navigation',
      title: 'Navegação por Teclado',
      description: 'Navegue usando apenas o teclado',
      category: 'motor',
      duration: 12,
      difficulty: 'intermediate',
      completed: false,
      steps: [
        {
          id: 'step-1',
          title: 'Ativando Navegação por Teclado',
          content: 'A navegação por teclado permite usar Tab, setas e Enter para navegar, útil para pessoas que não podem usar touch.',
          type: 'text',
          completed: false,
        },
        {
          id: 'step-2',
          title: 'Teclas de Navegação',
          content: 'Teclas principais:\n\n• Tab - Próximo elemento\n• Shift+Tab - Elemento anterior\n• Setas - Navegação direcional\n• Enter/Espaço - Ativar elemento\n• Esc - Cancelar/voltar',
          type: 'practice',
          completed: false,
        },
      ],
    },
    {
      id: 'cognitive-support',
      title: 'Suporte Cognitivo',
      description: 'Recursos para facilitar compreensão e uso',
      category: 'cognitive',
      duration: 8,
      difficulty: 'beginner',
      completed: false,
      steps: [
        {
          id: 'step-1',
          title: 'Simplificando a Interface',
          content: 'Configure o app para reduzir distrações:\n\n• Desative animações desnecessárias\n• Use fontes maiores\n• Ative feedback visual para ações',
          type: 'interactive',
          completed: false,
        },
        {
          id: 'step-2',
          title: 'Organizando Conteúdo',
          content: 'Use listas e favoritos para organizar receitas de forma que faça sentido para você. Isso reduz a carga cognitiva na busca.',
          type: 'practice',
          completed: false,
        },
      ],
    },
  ];

  const categories = [
    { value: 'all', label: 'Todos', icon: 'book-open-variant', color: '#2196f3' },
    { value: 'visual', label: 'Visual', icon: 'eye', color: '#4caf50' },
    { value: 'auditory', label: 'Auditivo', icon: 'volume-high', color: '#ff9800' },
    { value: 'motor', label: 'Motor', icon: 'gesture-tap', color: '#9c27b0' },
    { value: 'cognitive', label: 'Cognitivo', icon: 'brain', color: '#f44336' },
  ];

  const filteredTutorials = tutorials.filter(tutorial => 
    selectedCategory === 'all' || tutorial.category === selectedCategory
  );

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner':
        return '#4caf50';
      case 'intermediate':
        return '#ff9800';
      case 'advanced':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getDifficultyLabel = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner':
        return 'Iniciante';
      case 'intermediate':
        return 'Intermediário';
      case 'advanced':
        return 'Avançado';
      default:
        return difficulty;
    }
  };

  const getCategoryColor = (category: string): string => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || '#757575';
  };

  const handleStartTutorial = useCallback((tutorial: Tutorial) => {
    setCurrentTutorial(tutorial);
    setCurrentStep(0);
  }, []);

  const handleNextStep = useCallback(() => {
    if (currentTutorial && currentStep < currentTutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tutorial concluído
      setCurrentTutorial(null);
      setCurrentStep(0);
    }
  }, [currentTutorial, currentStep]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleCloseTutorial = useCallback(() => {
    setCurrentTutorial(null);
    setCurrentStep(0);
  }, []);

  const renderTutorialCard = (tutorial: Tutorial) => (
    <Card key={tutorial.id} style={styles.tutorialCard}>
      <Card.Content>
        <View style={styles.tutorialHeader}>
          <View style={styles.tutorialInfo}>
            <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
            <Text style={styles.tutorialDescription}>{tutorial.description}</Text>
          </View>
          {tutorial.completed && (
            <Chip
              style={styles.completedChip}
              textStyle={styles.completedChipText}
              icon="check"
            >
              Concluído
            </Chip>
          )}
        </View>

        <View style={styles.tutorialMeta}>
          <Chip
            style={[styles.categoryChip, { backgroundColor: getCategoryColor(tutorial.category) }]}
            textStyle={styles.categoryChipText}
          >
            {categories.find(c => c.value === tutorial.category)?.label}
          </Chip>
          <Chip
            style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(tutorial.difficulty) }]}
            textStyle={styles.difficultyChipText}
          >
            {getDifficultyLabel(tutorial.difficulty)}
          </Chip>
          <Chip
            mode="outlined"
            style={styles.durationChip}
          >
            {tutorial.duration} min
          </Chip>
        </View>

        <View style={styles.tutorialActions}>
          <Button
            mode={tutorial.completed ? 'outlined' : 'contained'}
            onPress={() => handleStartTutorial(tutorial)}
            style={styles.startButton}
            icon={tutorial.completed ? 'refresh' : 'play'}
          >
            {tutorial.completed ? 'Revisar' : 'Iniciar'}
          </Button>
          <Text style={styles.stepsCount}>
            {tutorial.steps.length} passos
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderTutorialStep = () => {
    if (!currentTutorial) return null;

    const step = currentTutorial.steps[currentStep];
    const progress = (currentStep + 1) / currentTutorial.steps.length;

    return (
      <View style={styles.tutorialOverlay}>
        <Card style={styles.tutorialStepCard}>
          <Card.Content>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Button
                mode="text"
                onPress={handleCloseTutorial}
                icon="close"
                style={styles.closeButton}
              >
                Fechar
              </Button>
            </View>

            <ProgressBar
              progress={progress}
              color="#2196f3"
              style={styles.stepProgress}
            />

            <Text style={styles.stepCounter}>
              Passo {currentStep + 1} de {currentTutorial.steps.length}
            </Text>

            <ScrollView style={styles.stepContent}>
              <Text style={styles.stepText}>{step.content}</Text>

              {step.type === 'interactive' && (
                <Card style={styles.interactiveCard}>
                  <Card.Content>
                    <Text style={styles.interactiveTitle}>💡 Experimente agora</Text>
                    <Text style={styles.interactiveText}>
                      Siga as instruções acima e experimente no seu dispositivo.
                    </Text>
                  </Card.Content>
                </Card>
              )}

              {step.type === 'practice' && (
                <Card style={styles.practiceCard}>
                  <Card.Content>
                    <Text style={styles.practiceTitle}>🎯 Pratique</Text>
                    <Text style={styles.practiceText}>
                      Use os comandos descritos para navegar nesta tela.
                    </Text>
                  </Card.Content>
                </Card>
              )}
            </ScrollView>

            <View style={styles.stepActions}>
              <Button
                mode="outlined"
                onPress={handlePreviousStep}
                disabled={currentStep === 0}
                style={styles.stepButton}
                icon="chevron-left"
              >
                Anterior
              </Button>
              <Button
                mode="contained"
                onPress={handleNextStep}
                style={styles.stepButton}
                icon={currentStep === currentTutorial.steps.length - 1 ? 'check' : 'chevron-right'}
              >
                {currentStep === currentTutorial.steps.length - 1 ? 'Concluir' : 'Próximo'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  if (currentTutorial) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleCloseTutorial} />
          <Appbar.Content title={currentTutorial.title} />
        </Appbar.Header>
        {renderTutorialStep()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Tutoriais de Acessibilidade" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Filtros de Categoria */}
        <Card style={styles.filtersCard}>
          <Card.Content>
            <Text style={styles.filtersTitle}>Categorias</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filtersRow}>
                {categories.map((category) => (
                  <Chip
                    key={category.value}
                    mode={selectedCategory === category.value ? 'flat' : 'outlined'}
                    onPress={() => setSelectedCategory(category.value)}
                    style={[
                      styles.filterChip,
                      selectedCategory === category.value && {
                        backgroundColor: category.color,
                      },
                    ]}
                    textStyle={[
                      styles.filterChipText,
                      selectedCategory === category.value && {
                        color: '#fff',
                      },
                    ]}
                    icon={category.icon}
                  >
                    {category.label}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Estatísticas */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.statsTitle}>Seu Progresso</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {tutorials.filter(t => t.completed).length}
                </Text>
                <Text style={styles.statLabel}>Concluídos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {tutorials.length}
                </Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.round((tutorials.filter(t => t.completed).length / tutorials.length) * 100)}%
                </Text>
                <Text style={styles.statLabel}>Progresso</Text>
              </View>
            </View>
            <ProgressBar
              progress={tutorials.filter(t => t.completed).length / tutorials.length}
              color="#4caf50"
              style={styles.overallProgress}
            />
          </Card.Content>
        </Card>

        {/* Lista de Tutoriais */}
        <View style={styles.tutorialsContainer}>
          {filteredTutorials.length > 0 ? (
            filteredTutorials.map(renderTutorialCard)
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>
                  Nenhum tutorial encontrado para esta categoria.
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="help-circle"
        label="Ajuda"
        onPress={() => navigation.navigate('AccessibilityHelp')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  filtersCard: {
    margin: 16,
    elevation: 2,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  overallProgress: {
    height: 8,
    borderRadius: 4,
  },
  tutorialsContainer: {
    paddingHorizontal: 16,
  },
  tutorialCard: {
    marginBottom: 16,
    elevation: 2,
  },
  tutorialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tutorialInfo: {
    flex: 1,
    marginRight: 12,
  },
  tutorialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tutorialDescription: {
    fontSize: 14,
    color: '#666',
  },
  completedChip: {
    backgroundColor: '#4caf50',
    height: 28,
  },
  completedChipText: {
    fontSize: 11,
    color: '#fff',
  },
  tutorialMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    height: 24,
  },
  categoryChipText: {
    fontSize: 10,
    color: '#fff',
  },
  difficultyChip: {
    height: 24,
  },
  difficultyChipText: {
    fontSize: 10,
    color: '#fff',
  },
  durationChip: {
    height: 24,
  },
  tutorialActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startButton: {
    flex: 1,
    marginRight: 12,
  },
  stepsCount: {
    fontSize: 12,
    color: '#666',
  },
  emptyCard: {
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  tutorialOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  tutorialStepCard: {
    maxHeight: Dimensions.get('window').height * 0.8,
    elevation: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    marginLeft: 8,
  },
  stepProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  stepCounter: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  stepContent: {
    maxHeight: 300,
    marginBottom: 16,
  },
  stepText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  interactiveCard: {
    backgroundColor: '#e3f2fd',
    marginTop: 16,
  },
  interactiveTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  interactiveText: {
    fontSize: 14,
    color: '#1976d2',
  },
  practiceCard: {
    backgroundColor: '#f3e5f5',
    marginTop: 16,
  },
  practiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7b1fa2',
    marginBottom: 8,
  },
  practiceText: {
    fontSize: 14,
    color: '#7b1fa2',
  },
  stepActions: {
    flexDirection: 'row',
    gap: 12,
  },
  stepButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  bottomSpacing: {
    height: 80,
  },
});

export default AccessibilityTutorialsScreen;
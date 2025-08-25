import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {
  CookingSession,
  CookingStep,
  StepNavigationState,
  CookingModeSettings,
} from '../../types/cookingMode';
import {colors, typography, spacing} from '../../theme';

interface StepByStepViewProps {
  session: CookingSession;
  currentStep: CookingStep | null;
  navigationState: StepNavigationState;
  settings: CookingModeSettings;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onMarkComplete: (stepId: string, notes?: string) => void;
  onAddTimer: (name: string, duration: number) => void;
}

export const StepByStepView: React.FC<StepByStepViewProps> = ({
  session,
  currentStep,
  navigationState,
  settings,
  onNextStep,
  onPreviousStep,
  onMarkComplete,
  onAddTimer,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [stepNotes, setStepNotes] = useState('');

  const getThemeColors = () => {
    switch (settings.theme) {
      case 'dark':
        return {
          background: colors.gray[900],
          cardBackground: colors.gray[800],
          text: colors.white,
          secondaryText: colors.gray[300],
          accent: colors.primary[400],
          border: colors.gray[700],
        };
      case 'high-contrast':
        return {
          background: colors.black,
          cardBackground: colors.gray[900],
          text: colors.white,
          secondaryText: colors.gray[100],
          accent: colors.yellow[400],
          border: colors.white,
        };
      default:
        return {
          background: colors.gray[50],
          cardBackground: colors.white,
          text: colors.gray[900],
          secondaryText: colors.gray[600],
          accent: colors.primary[600],
          border: colors.gray[200],
        };
    }
  };

  const themeColors = getThemeColors();

  const getTextSize = () => {
    switch (settings.textSize) {
      case 'small':
        return {
          instruction: 16,
          title: 18,
          caption: 12,
        };
      case 'large':
        return {
          instruction: 22,
          title: 26,
          caption: 16,
        };
      case 'extra-large':
        return {
          instruction: 28,
          title: 32,
          caption: 20,
        };
      default: // medium
        return {
          instruction: 18,
          title: 22,
          caption: 14,
        };
    }
  };

  const textSizes = getTextSize();

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const extractTimersFromStep = (instruction: string) => {
    // Simple regex to find time patterns
    const timePatterns = [
      /(\d+)\s*minutos?/gi,
      /(\d+)\s*min/gi,
      /(\d+)\s*horas?/gi,
      /(\d+)\s*h/gi,
      /(\d+)\s*segundos?/gi,
      /(\d+)\s*seg/gi,
    ];

    const suggestedTimers: {name: string; duration: number}[] = [];

    timePatterns.forEach(pattern => {
      const matches = instruction.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const number = parseInt(match.match(/\d+/)?.[0] || '0');
          if (number > 0) {
            let duration = number;
            if (match.includes('hora') || match.includes('h')) {
              duration *= 60;
            } else if (match.includes('segundo') || match.includes('seg')) {
              duration = Math.ceil(duration / 60);
            }
            
            suggestedTimers.push({
              name: `Timer ${match}`,
              duration: duration * 60, // Convert to seconds
            });
          }
        });
      }
    });

    return suggestedTimers;
  };

  const handleMarkComplete = () => {
    if (!currentStep) return;

    if (showNotes && stepNotes.trim()) {
      onMarkComplete(currentStep.id, stepNotes.trim());
      setStepNotes('');
      setShowNotes(false);
    } else {
      onMarkComplete(currentStep.id);
    }
  };

  const handleAddQuickTimer = (name: string, duration: number) => {
    Alert.alert(
      'Adicionar Timer',
      `Deseja adicionar um timer de ${Math.floor(duration / 60)} minutos para "${name}"?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Adicionar',
          onPress: () => onAddTimer(name, duration),
        },
      ]
    );
  };

  if (!currentStep) {
    return (
      <View style={[styles.emptyContainer, {backgroundColor: themeColors.background}]}>
        <Text style={[styles.emptyText, {color: themeColors.text}]}>
          Nenhum passo selecionado
        </Text>
      </View>
    );
  }

  const suggestedTimers = extractTimersFromStep(currentStep.instruction);

  return (
    <View style={[styles.container, {backgroundColor: themeColors.background}]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step Image */}
        {currentStep.imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{uri: currentStep.imageUrl}}
              style={styles.stepImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Step Content */}
        <View style={[styles.stepCard, {backgroundColor: themeColors.cardBackground}]}>
          {/* Step Header */}
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={[styles.stepNumberText, {color: colors.white}]}>
                {currentStep.stepNumber}
              </Text>
            </View>
            
            <View style={styles.stepMeta}>
              {currentStep.duration && (
                <View style={styles.metaItem}>
                  <Ionicons name="time" size={16} color={themeColors.accent} />
                  <Text style={[styles.metaText, {color: themeColors.secondaryText}]}>
                    {formatDuration(currentStep.duration)}
                  </Text>
                </View>
              )}
              
              {currentStep.temperature && (
                <View style={styles.metaItem}>
                  <Ionicons name="thermometer" size={16} color={themeColors.accent} />
                  <Text style={[styles.metaText, {color: themeColors.secondaryText}]}>
                    {currentStep.temperature}°C
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Step Instruction */}
          <Text
            style={[
              styles.instruction,
              {
                color: themeColors.text,
                fontSize: textSizes.instruction,
                lineHeight: textSizes.instruction * 1.4,
              },
            ]}
          >
            {currentStep.instruction}
          </Text>

          {/* Ingredients for this step */}
          {currentStep.ingredients && currentStep.ingredients.length > 0 && (
            <View style={styles.ingredientsSection}>
              <Text style={[styles.sectionTitle, {color: themeColors.text}]}>
                Ingredientes para este passo:
              </Text>
              {currentStep.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <Ionicons name="ellipse" size={6} color={themeColors.accent} />
                  <Text style={[styles.ingredientText, {color: themeColors.secondaryText}]}>
                    {ingredient}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Equipment */}
          {currentStep.equipment && currentStep.equipment.length > 0 && (
            <View style={styles.equipmentSection}>
              <Text style={[styles.sectionTitle, {color: themeColors.text}]}>
                Equipamentos necessários:
              </Text>
              <View style={styles.equipmentList}>
                {currentStep.equipment.map((equipment, index) => (
                  <View key={index} style={[styles.equipmentChip, {backgroundColor: themeColors.border}]}>
                    <Text style={[styles.equipmentText, {color: themeColors.text}]}>
                      {equipment}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Suggested Timers */}
          {suggestedTimers.length > 0 && (
            <View style={styles.timersSection}>
              <Text style={[styles.sectionTitle, {color: themeColors.text}]}>
                Timers sugeridos:
              </Text>
              <View style={styles.timersList}>
                {suggestedTimers.map((timer, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.timerChip, {borderColor: themeColors.accent}]}
                    onPress={() => handleAddQuickTimer(timer.name, timer.duration)}
                  >
                    <Ionicons name="timer-outline" size={16} color={themeColors.accent} />
                    <Text style={[styles.timerText, {color: themeColors.accent}]}>
                      {Math.floor(timer.duration / 60)}min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Tips */}
          {settings.showTips && currentStep.tips && currentStep.tips.length > 0 && (
            <View style={styles.tipsSection}>
              <Text style={[styles.sectionTitle, {color: themeColors.text}]}>
                Dicas:
              </Text>
              {currentStep.tips.map((tip, index) => (
                <View key={index} style={[styles.tipItem, {backgroundColor: colors.blue[50]}]}>
                  <Ionicons name="bulb" size={16} color={colors.blue[600]} />
                  <Text style={[styles.tipText, {color: colors.blue[800]}]}>
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation Controls */}
      <View style={[styles.navigationBar, {backgroundColor: themeColors.cardBackground, borderTopColor: themeColors.border}]}>
        <TouchableOpacity
          style={[
            styles.navButton,
            !navigationState.canGoPrevious && styles.navButtonDisabled,
          ]}
          onPress={onPreviousStep}
          disabled={!navigationState.canGoPrevious}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={navigationState.canGoPrevious ? themeColors.text : themeColors.border}
          />
          <Text
            style={[
              styles.navButtonText,
              {color: navigationState.canGoPrevious ? themeColors.text : themeColors.border},
            ]}
          >
            Anterior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.completeButton,
            currentStep.isCompleted && styles.completedButton,
          ]}
          onPress={handleMarkComplete}
        >
          <Ionicons
            name={currentStep.isCompleted ? "checkmark-circle" : "checkmark"}
            size={20}
            color={colors.white}
          />
          <Text style={styles.completeButtonText}>
            {currentStep.isCompleted ? 'Concluído' : 'Marcar como Feito'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            !navigationState.canGoNext && styles.navButtonDisabled,
          ]}
          onPress={onNextStep}
          disabled={!navigationState.canGoNext}
        >
          <Text
            style={[
              styles.navButtonText,
              {color: navigationState.canGoNext ? themeColors.text : themeColors.border},
            ]}
          >
            Próximo
          </Text>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={navigationState.canGoNext ? themeColors.text : themeColors.border}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
  },
  imageContainer: {
    height: 200,
    margin: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  stepImage: {
    width: '100%',
    height: '100%',
  },
  stepCard: {
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '700',
  },
  stepMeta: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500',
  },
  instruction: {
    marginBottom: spacing.lg,
    fontWeight: '400',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  ingredientsSection: {
    marginBottom: spacing.lg,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  ingredientText: {
    fontSize: 14,
  },
  equipmentSection: {
    marginBottom: spacing.lg,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  equipmentChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  equipmentText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timersSection: {
    marginBottom: spacing.lg,
  },
  timersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.xs,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tipsSection: {
    marginBottom: spacing.lg,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderTopWidth: 1,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 24,
    gap: spacing.sm,
  },
  completedButton: {
    backgroundColor: colors.success[600],
  },
  completeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
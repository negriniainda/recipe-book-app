import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {
  CookingSession,
  StepNavigationState,
  TimerDisplayState,
} from '../../types/cookingMode';
import {colors, typography, spacing} from '../../theme';

interface OverviewViewProps {
  session: CookingSession;
  navigationState: StepNavigationState;
  timerState: TimerDisplayState;
  onNavigateToStep: (stepIndex: number) => void;
  onStartTimer: (name: string, duration: number) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  session,
  navigationState,
  timerState,
  onNavigateToStep,
  onStartTimer,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStepStatus = (step: any, index: number) => {
    if (step.isCompleted) return 'completed';
    if (index === session.currentStepIndex) return 'current';
    if (index < session.currentStepIndex) return 'completed';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success[500];
      case 'current':
        return colors.primary[500];
      default:
        return colors.gray[400];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'current':
        return 'play-circle';
      default:
        return 'ellipse-outline';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Session Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Progresso da Sessão</Text>
          <Text style={styles.summaryProgress}>
            {navigationState.currentStep}/{navigationState.totalSteps}
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {width: `${navigationState.progress}%`},
            ]}
          />
        </View>
        
        <View style={styles.summaryStats}>
          <View style={styles.stat}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success[500]} />
            <Text style={styles.statText}>
              {session.steps.filter(s => s.isCompleted).length} concluídos
            </Text>
          </View>
          
          <View style={styles.stat}>
            <Ionicons name="time" size={16} color={colors.primary[500]} />
            <Text style={styles.statText}>
              {session.totalDuration ? `${Math.floor(session.totalDuration / 60)}min` : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.stat}>
            <Ionicons name="timer" size={16} color={colors.warning[500]} />
            <Text style={styles.statText}>
              {timerState.activeTimers.length} timers
            </Text>
          </View>
        </View>
      </View>

      {/* Active Timers */}
      {timerState.activeTimers.length > 0 && (
        <View style={styles.timersCard}>
          <Text style={styles.cardTitle}>Timers Ativos</Text>
          {timerState.activeTimers.map(timer => (
            <View key={timer.id} style={styles.timerItem}>
              <View style={styles.timerInfo}>
                <Ionicons
                  name="timer"
                  size={20}
                  color={timer.remainingTime <= 60 ? colors.error[500] : colors.primary[500]}
                />
                <Text style={styles.timerName}>{timer.name}</Text>
              </View>
              <Text
                style={[
                  styles.timerTime,
                  {color: timer.remainingTime <= 60 ? colors.error[500] : colors.gray[700]},
                ]}
              >
                {formatTime(timer.remainingTime)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Steps Overview */}
      <View style={styles.stepsCard}>
        <Text style={styles.cardTitle}>Passos da Receita</Text>
        {session.steps.map((step, index) => {
          const status = getStepStatus(step, index);
          const statusColor = getStatusColor(status);
          
          return (
            <TouchableOpacity
              key={step.id}
              style={[
                styles.stepItem,
                status === 'current' && styles.currentStepItem,
              ]}
              onPress={() => onNavigateToStep(index)}
            >
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Ionicons
                    name={getStatusIcon(status) as any}
                    size={20}
                    color={statusColor}
                  />
                  <Text style={[styles.stepNumberText, {color: statusColor}]}>
                    {step.stepNumber}
                  </Text>
                </View>
                
                <View style={styles.stepMeta}>
                  {step.duration && (
                    <View style={styles.metaItem}>
                      <Ionicons name="time" size={14} color={colors.gray[500]} />
                      <Text style={styles.metaText}>
                        {step.duration}min
                      </Text>
                    </View>
                  )}
                  
                  {step.temperature && (
                    <View style={styles.metaItem}>
                      <Ionicons name="thermometer" size={14} color={colors.gray[500]} />
                      <Text style={styles.metaText}>
                        {step.temperature}°C
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              <Text
                style={[
                  styles.stepInstruction,
                  status === 'completed' && styles.completedText,
                ]}
                numberOfLines={2}
              >
                {step.instruction}
              </Text>
              
              {step.ingredients && step.ingredients.length > 0 && (
                <View style={styles.stepIngredients}>
                  <Text style={styles.ingredientsLabel}>Ingredientes:</Text>
                  <Text style={styles.ingredientsList} numberOfLines={1}>
                    {step.ingredients.join(', ')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Ações Rápidas</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onStartTimer('Timer Rápido', 300)} // 5 minutes
          >
            <Ionicons name="timer-outline" size={20} color={colors.primary[600]} />
            <Text style={styles.actionButtonText}>Timer 5min</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onStartTimer('Timer Rápido', 600)} // 10 minutes
          >
            <Ionicons name="timer-outline" size={20} color={colors.primary[600]} />
            <Text style={styles.actionButtonText}>Timer 10min</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onStartTimer('Timer Rápido', 900)} // 15 minutes
          >
            <Ionicons name="timer-outline" size={20} color={colors.primary[600]} />
            <Text style={styles.actionButtonText}>Timer 15min</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  summaryCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
  },
  summaryProgress: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.primary[600],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.caption,
    color: colors.gray[600],
    fontWeight: '500',
  },
  timersCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  timerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  timerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timerName: {
    ...typography.body,
    color: colors.gray[700],
  },
  timerTime: {
    ...typography.body,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  stepsCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stepItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  currentStepItem: {
    backgroundColor: colors.primary[50],
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepNumberText: {
    ...typography.body,
    fontWeight: '600',
  },
  stepMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.gray[500],
  },
  stepInstruction: {
    ...typography.body,
    color: colors.gray[700],
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.gray[500],
  },
  stepIngredients: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ingredientsLabel: {
    ...typography.caption,
    color: colors.gray[600],
    fontWeight: '600',
  },
  ingredientsList: {
    ...typography.caption,
    color: colors.gray[500],
    flex: 1,
  },
  actionsCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    gap: spacing.xs,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.primary[700],
    fontWeight: '500',
  },
});
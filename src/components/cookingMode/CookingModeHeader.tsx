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
  CookingModeView,
} from '../../types/cookingMode';
import {colors, typography, spacing} from '../../theme';

interface CookingModeHeaderProps {
  session: CookingSession | null;
  navigationState: StepNavigationState;
  timerState: TimerDisplayState;
  currentView: CookingModeView;
  onViewChange: (view: CookingModeView) => void;
  onPause: () => void;
  onComplete: () => void;
  onSettings: () => void;
  theme: 'light' | 'dark' | 'high-contrast';
}

export const CookingModeHeader: React.FC<CookingModeHeaderProps> = ({
  session,
  navigationState,
  timerState,
  currentView,
  onViewChange,
  onPause,
  onComplete,
  onSettings,
  theme,
}) => {
  const getThemeColors = () => {
    switch (theme) {
      case 'dark':
        return {
          background: colors.gray[800],
          text: colors.white,
          accent: colors.primary[400],
          border: colors.gray[700],
        };
      case 'high-contrast':
        return {
          background: colors.black,
          text: colors.white,
          accent: colors.yellow[400],
          border: colors.white,
        };
      default:
        return {
          background: colors.white,
          text: colors.gray[900],
          accent: colors.primary[600],
          border: colors.gray[200],
        };
    }
  };

  const themeColors = getThemeColors();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getViewIcon = (view: CookingModeView) => {
    switch (view) {
      case 'overview':
        return 'grid-outline';
      case 'step-by-step':
        return 'list-outline';
      case 'timers':
        return 'timer-outline';
      case 'ingredients':
        return 'restaurant-outline';
      case 'notes':
        return 'document-text-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getViewLabel = (view: CookingModeView) => {
    switch (view) {
      case 'overview':
        return 'Visão Geral';
      case 'step-by-step':
        return 'Passos';
      case 'timers':
        return 'Timers';
      case 'ingredients':
        return 'Ingredientes';
      case 'notes':
        return 'Notas';
      default:
        return view;
    }
  };

  const views: CookingModeView[] = ['overview', 'step-by-step', 'timers', 'ingredients', 'notes'];

  return (
    <View style={[styles.container, {backgroundColor: themeColors.background, borderBottomColor: themeColors.border}]}>
      {/* Top Row - Recipe Info and Controls */}
      <View style={styles.topRow}>
        <View style={styles.recipeInfo}>
          <Text style={[styles.recipeName, {color: themeColors.text}]} numberOfLines={1}>
            {session?.recipeName || 'Modo Cozinha'}
          </Text>
          {session && (
            <Text style={[styles.servings, {color: themeColors.accent}]}>
              {session.servings} porções
            </Text>
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, {borderColor: themeColors.border}]}
            onPress={onSettings}
          >
            <Ionicons name="settings-outline" size={20} color={themeColors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, {borderColor: themeColors.border}]}
            onPress={onPause}
          >
            <Ionicons 
              name={session?.isPaused ? "play-outline" : "pause-outline"} 
              size={20} 
              color={themeColors.text} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.completeButton]}
            onPress={onComplete}
          >
            <Ionicons name="checkmark" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      {session && (
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, {color: themeColors.text}]}>
              Passo {navigationState.currentStep} de {navigationState.totalSteps}
            </Text>
            <Text style={[styles.progressPercentage, {color: themeColors.accent}]}>
              {Math.round(navigationState.progress)}%
            </Text>
          </View>
          
          <View style={[styles.progressBar, {backgroundColor: themeColors.border}]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${navigationState.progress}%`,
                  backgroundColor: themeColors.accent,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Active Timers */}
      {timerState.activeTimers.length > 0 && (
        <View style={styles.timersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {timerState.activeTimers.map(timer => (
              <View
                key={timer.id}
                style={[
                  styles.timerChip,
                  {
                    backgroundColor: timer.remainingTime <= 60 
                      ? colors.error[100] 
                      : themeColors.border,
                  },
                ]}
              >
                <Ionicons 
                  name="timer" 
                  size={14} 
                  color={timer.remainingTime <= 60 ? colors.error[600] : themeColors.text} 
                />
                <Text
                  style={[
                    styles.timerText,
                    {
                      color: timer.remainingTime <= 60 ? colors.error[600] : themeColors.text,
                    },
                  ]}
                >
                  {timer.name}: {formatTime(timer.remainingTime)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* View Tabs */}
      <View style={styles.tabsSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {views.map(view => (
            <TouchableOpacity
              key={view}
              style={[
                styles.tab,
                currentView === view && styles.activeTab,
                currentView === view && {backgroundColor: themeColors.accent},
              ]}
              onPress={() => onViewChange(view)}
            >
              <Ionicons
                name={getViewIcon(view) as any}
                size={16}
                color={currentView === view ? colors.white : themeColors.text}
              />
              <Text
                style={[
                  styles.tabText,
                  {color: currentView === view ? colors.white : themeColors.text},
                ]}
              >
                {getViewLabel(view)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingTop: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  recipeInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  recipeName: {
    ...typography.subtitle,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  servings: {
    ...typography.caption,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: colors.success[500],
    borderColor: colors.success[500],
  },
  progressSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressText: {
    ...typography.caption,
    fontWeight: '500',
  },
  progressPercentage: {
    ...typography.caption,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  timersSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  timerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.sm,
  },
  timerText: {
    ...typography.caption,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  tabsSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  activeTab: {
    // backgroundColor set dynamically
  },
  tabText: {
    ...typography.caption,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
});
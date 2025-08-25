import {useState, useCallback, useEffect, useMemo} from 'react';
import {Alert, Vibration} from 'react-native';
import {Audio} from 'expo-av';
import * as KeepAwake from 'expo-keep-awake';
import * as Speech from 'expo-speech';
import {
  useGetCookingSessionsQuery,
  useGetCookingSessionQuery,
  useStartCookingSessionMutation,
  useUpdateCookingSessionMutation,
  useCompleteCookingSessionMutation,
  usePauseCookingSessionMutation,
  useUpdateCookingStepMutation,
  useNavigateToStepMutation,
  useGetActiveTimersQuery,
  useCreateTimerMutation,
  useUpdateTimerMutation,
  useGetCookingModeSettingsQuery,
  useUpdateCookingModeSettingsMutation,
  useProcessVoiceCommandMutation,
} from '../services/cookingModeApi';
import {
  CookingSession,
  CookingTimer,
  CookingModeSettings,
  CookingStep,
  StepNavigationState,
  TimerDisplayState,
  VoiceCommand,
  CookingModeView,
} from '../types/cookingMode';

export interface UseCookingModeOptions {
  userId: string;
  sessionId?: string;
  autoStart?: boolean;
}

const DEFAULT_SETTINGS: CookingModeSettings = {
  keepScreenOn: true,
  voiceControlEnabled: true,
  autoAdvanceSteps: false,
  showIngredientChecklist: true,
  timerSoundEnabled: true,
  timerVibrationEnabled: true,
  textSize: 'medium',
  theme: 'light',
  language: 'pt-BR',
  voiceLanguage: 'pt-BR',
  autoStartTimers: true,
  showNutritionInfo: false,
  showTips: true,
};

export const useCookingMode = ({
  userId,
  sessionId,
  autoStart = false,
}: UseCookingModeOptions) => {
  const [currentView, setCurrentView] = useState<CookingModeView>('step-by-step');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [timerSound, setTimerSound] = useState<Audio.Sound | null>(null);
  const [activeTimerIntervals, setActiveTimerIntervals] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // API hooks
  const {
    data: sessions = [],
    isLoading: loadingSessions,
    refetch: refetchSessions,
  } = useGetCookingSessionsQuery({userId, active: true});

  const {
    data: currentSession,
    isLoading: loadingSession,
    refetch: refetchSession,
  } = useGetCookingSessionQuery(sessionId || '', {
    skip: !sessionId,
  });

  const {
    data: activeTimers = [],
    refetch: refetchTimers,
  } = useGetActiveTimersQuery({userId, sessionId});

  const {
    data: settings = DEFAULT_SETTINGS,
    refetch: refetchSettings,
  } = useGetCookingModeSettingsQuery(userId);

  // Mutations
  const [startSession] = useStartCookingSessionMutation();
  const [updateSession] = useUpdateCookingSessionMutation();
  const [completeSession] = useCompleteCookingSessionMutation();
  const [pauseSession] = usePauseCookingSessionMutation();
  const [updateStep] = useUpdateCookingStepMutation();
  const [navigateToStep] = useNavigateToStepMutation();
  const [createTimer] = useCreateTimerMutation();
  const [updateTimer] = useUpdateTimerMutation();
  const [updateSettings] = useUpdateCookingModeSettingsMutation();
  const [processVoiceCommand] = useProcessVoiceCommandMutation();

  // Computed values
  const activeSession = useMemo(() => {
    return currentSession || sessions.find(s => s.isActive);
  }, [currentSession, sessions]);

  const navigationState = useMemo((): StepNavigationState => {
    if (!activeSession) {
      return {
        canGoNext: false,
        canGoPrevious: false,
        currentStep: 0,
        totalSteps: 0,
        progress: 0,
      };
    }

    const currentStep = activeSession.currentStepIndex;
    const totalSteps = activeSession.steps.length;

    return {
      canGoNext: currentStep < totalSteps - 1,
      canGoPrevious: currentStep > 0,
      currentStep: currentStep + 1,
      totalSteps,
      progress: totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0,
    };
  }, [activeSession]);

  const timerState = useMemo((): TimerDisplayState => {
    const active = activeTimers.filter(t => t.isActive && !t.isPaused);
    const expired = activeTimers.filter(t => t.remainingTime <= 0 && t.isActive);
    const next = activeTimers
      .filter(t => !t.isActive && t.remainingTime > 0)
      .sort((a, b) => a.remainingTime - b.remainingTime)[0];

    return {
      activeTimers: active,
      nextTimer: next,
      hasExpiredTimers: expired.length > 0,
    };
  }, [activeTimers]);

  const currentStep = useMemo((): CookingStep | null => {
    if (!activeSession) return null;
    return activeSession.steps[activeSession.currentStepIndex] || null;
  }, [activeSession]);

  // Screen management
  useEffect(() => {
    if (settings.keepScreenOn && activeSession?.isActive) {
      KeepAwake.activateKeepAwake();
    } else {
      KeepAwake.deactivateKeepAwake();
    }

    return () => {
      KeepAwake.deactivateKeepAwake();
    };
  }, [settings.keepScreenOn, activeSession?.isActive]);

  // Timer management
  useEffect(() => {
    const intervals = new Map<string, NodeJS.Timeout>();

    activeTimers.forEach(timer => {
      if (timer.isActive && !timer.isPaused && timer.remainingTime > 0) {
        const interval = setInterval(() => {
          updateTimer({
            timerId: timer.id,
            action: 'tick' as any, // This would be handled by the backend
          });
        }, 1000);
        intervals.set(timer.id, interval);
      }
    });

    // Clean up old intervals
    activeTimerIntervals.forEach((interval, timerId) => {
      if (!intervals.has(timerId)) {
        clearInterval(interval);
      }
    });

    setActiveTimerIntervals(intervals);

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [activeTimers, updateTimer]);

  // Timer completion handling
  useEffect(() => {
    const expiredTimers = activeTimers.filter(t => t.remainingTime <= 0 && t.isActive);
    
    expiredTimers.forEach(timer => {
      handleTimerComplete(timer);
    });
  }, [activeTimers]);

  // Load timer sound
  useEffect(() => {
    const loadSound = async () => {
      try {
        const {sound} = await Audio.Sound.createAsync(
          require('../../assets/sounds/timer-complete.mp3') // You'll need to add this file
        );
        setTimerSound(sound);
      } catch (error) {
        console.warn('Could not load timer sound:', error);
      }
    };

    loadSound();

    return () => {
      if (timerSound) {
        timerSound.unloadAsync();
      }
    };
  }, []);

  // Actions
  const startCookingSession = useCallback(async (
    recipeId: string,
    servings?: number
  ) => {
    try {
      const result = await startSession({
        userId,
        recipeId,
        servings,
      }).unwrap();
      
      if (autoStart) {
        setCurrentView('step-by-step');
      }
      
      return result;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível iniciar a sessão de cozinha');
      throw error;
    }
  }, [startSession, userId, autoStart]);

  const goToNextStep = useCallback(async () => {
    if (!activeSession || !navigationState.canGoNext) return;

    try {
      await navigateToStep({
        sessionId: activeSession.id,
        stepIndex: activeSession.currentStepIndex + 1,
      }).unwrap();

      // Auto-announce step if voice is enabled
      if (settings.voiceControlEnabled) {
        const nextStep = activeSession.steps[activeSession.currentStepIndex + 1];
        if (nextStep) {
          Speech.speak(nextStep.instruction, {
            language: settings.voiceLanguage,
          });
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível avançar para o próximo passo');
    }
  }, [activeSession, navigationState, navigateToStep, settings]);

  const goToPreviousStep = useCallback(async () => {
    if (!activeSession || !navigationState.canGoPrevious) return;

    try {
      await navigateToStep({
        sessionId: activeSession.id,
        stepIndex: activeSession.currentStepIndex - 1,
      }).unwrap();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível voltar ao passo anterior');
    }
  }, [activeSession, navigationState, navigateToStep]);

  const markStepComplete = useCallback(async (stepId: string, notes?: string) => {
    if (!activeSession) return;

    try {
      await updateStep({
        sessionId: activeSession.id,
        stepId,
        isCompleted: true,
        notes,
      }).unwrap();

      // Auto-advance if enabled
      if (settings.autoAdvanceSteps && navigationState.canGoNext) {
        setTimeout(() => goToNextStep(), 1000);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível marcar o passo como concluído');
    }
  }, [activeSession, updateStep, settings, navigationState, goToNextStep]);

  const addTimer = useCallback(async (
    name: string,
    duration: number,
    stepId?: string
  ) => {
    if (!activeSession) return;

    try {
      const result = await createTimer({
        sessionId: activeSession.id,
        name,
        duration,
        stepId,
        autoStart: settings.autoStartTimers,
      }).unwrap();
      
      return result;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o timer');
      throw error;
    }
  }, [activeSession, createTimer, settings]);

  const controlTimer = useCallback(async (
    timerId: string,
    action: 'start' | 'pause' | 'resume' | 'stop' | 'reset'
  ) => {
    try {
      await updateTimer({timerId, action}).unwrap();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível controlar o timer');
    }
  }, [updateTimer]);

  const handleTimerComplete = useCallback(async (timer: CookingTimer) => {
    // Play sound
    if (settings.timerSoundEnabled && timerSound) {
      try {
        await timerSound.replayAsync();
      } catch (error) {
        console.warn('Could not play timer sound:', error);
      }
    }

    // Vibrate
    if (settings.timerVibrationEnabled) {
      Vibration.vibrate([0, 500, 200, 500]);
    }

    // Show alert
    Alert.alert(
      'Timer Concluído!',
      `${timer.name} - ${Math.floor(timer.duration / 60)} minutos`,
      [
        {text: 'OK', onPress: () => controlTimer(timer.id, 'stop')},
        {text: 'Repetir', onPress: () => controlTimer(timer.id, 'reset')},
      ]
    );

    // Voice announcement
    if (settings.voiceControlEnabled) {
      Speech.speak(`Timer ${timer.name} concluído`, {
        language: settings.voiceLanguage,
      });
    }
  }, [settings, timerSound, controlTimer]);

  const pauseSession = useCallback(async () => {
    if (!activeSession) return;

    try {
      await pauseSession({
        sessionId: activeSession.id,
        pause: !activeSession.isPaused,
      }).unwrap();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível pausar/retomar a sessão');
    }
  }, [activeSession, pauseSession]);

  const completeSession = useCallback(async (rating?: number, notes?: string) => {
    if (!activeSession) return;

    try {
      await completeSession({
        sessionId: activeSession.id,
        rating,
        notes,
      }).unwrap();
      
      Alert.alert('Parabéns!', 'Sessão de cozinha concluída com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível concluir a sessão');
    }
  }, [activeSession, completeSession]);

  const handleVoiceCommand = useCallback(async (command: string) => {
    if (!activeSession) return;

    try {
      const result = await processVoiceCommand({
        sessionId: activeSession.id,
        command,
        confidence: 0.8, // This would come from speech recognition
      }).unwrap();

      if (result.success) {
        // Handle the action based on result
        switch (result.action) {
          case 'next':
            goToNextStep();
            break;
          case 'previous':
            goToPreviousStep();
            break;
          case 'repeat':
            if (currentStep) {
              Speech.speak(currentStep.instruction, {
                language: settings.voiceLanguage,
              });
            }
            break;
          case 'pause':
            pauseSession();
            break;
          // Add more actions as needed
        }
      }
    } catch (error) {
      console.warn('Voice command failed:', error);
    }
  }, [activeSession, processVoiceCommand, goToNextStep, goToPreviousStep, currentStep, settings, pauseSession]);

  const updateCookingSettings = useCallback(async (
    newSettings: Partial<CookingModeSettings>
  ) => {
    try {
      await updateSettings({
        userId,
        settings: newSettings,
      }).unwrap();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar as configurações');
    }
  }, [updateSettings, userId]);

  return {
    // Data
    sessions,
    activeSession,
    currentStep,
    activeTimers,
    settings,
    
    // State
    currentView,
    setCurrentView,
    navigationState,
    timerState,
    isVoiceListening,
    setIsVoiceListening,
    
    // Loading states
    loadingSessions,
    loadingSession,
    
    // Actions
    startCookingSession,
    goToNextStep,
    goToPreviousStep,
    markStepComplete,
    addTimer,
    controlTimer,
    pauseSession,
    completeSession,
    handleVoiceCommand,
    updateCookingSettings,
    
    // Utilities
    refetchSessions,
    refetchSession,
    refetchTimers,
    refetchSettings,
  };
};
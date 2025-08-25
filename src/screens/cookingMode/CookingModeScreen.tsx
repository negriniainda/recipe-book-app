import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  BackHandler,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {CookingModeHeader} from '../../components/cookingMode/CookingModeHeader';
import {StepByStepView} from '../../components/cookingMode/StepByStepView';
import {TimersView} from '../../components/cookingMode/TimersView';
import {IngredientsView} from '../../components/cookingMode/IngredientsView';
import {OverviewView} from '../../components/cookingMode/OverviewView';
import {NotesView} from '../../components/cookingMode/NotesView';
import {CookingModeSettings} from '../../components/cookingMode/CookingModeSettings';
import {VoiceControlIndicator} from '../../components/cookingMode/VoiceControlIndicator';
import {useCookingMode} from '../../hooks/useCookingMode';
import {useAuth} from '../../hooks/useAuth';
import {colors, spacing} from '../../theme';
import {CookingModeView} from '../../types/cookingMode';

type CookingModeScreenRouteProp = RouteProp<{
  CookingMode: {
    recipeId?: string;
    sessionId?: string;
    autoStart?: boolean;
  };
}, 'CookingMode'>;

export const CookingModeScreen: React.FC = () => {
  const route = useRoute<CookingModeScreenRouteProp>();
  const navigation = useNavigation();
  const {user} = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  const {recipeId, sessionId, autoStart = false} = route.params || {};

  const {
    activeSession,
    currentStep,
    currentView,
    setCurrentView,
    navigationState,
    timerState,
    settings,
    isVoiceListening,
    startCookingSession,
    goToNextStep,
    goToPreviousStep,
    markStepComplete,
    pauseSession,
    completeSession,
    handleVoiceCommand,
  } = useCookingMode({
    userId: user?.id || '',
    sessionId,
    autoStart,
  });

  // Start session if recipeId is provided and no active session
  useEffect(() => {
    if (recipeId && !activeSession && !sessionId) {
      startCookingSession(recipeId);
    }
  }, [recipeId, activeSession, sessionId, startCookingSession]);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activeSession?.isActive) {
        Alert.alert(
          'Sair do Modo Cozinha',
          'Você tem uma sessão ativa. Deseja pausar e sair?',
          [
            {text: 'Cancelar', style: 'cancel'},
            {
              text: 'Pausar e Sair',
              onPress: () => {
                pauseSession();
                navigation.goBack();
              },
            },
          ]
        );
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [activeSession, pauseSession, navigation]);

  // Apply theme settings
  const getThemeStyles = () => {
    switch (settings.theme) {
      case 'dark':
        return {
          backgroundColor: colors.gray[900],
          textColor: colors.white,
        };
      case 'high-contrast':
        return {
          backgroundColor: colors.black,
          textColor: colors.white,
        };
      default:
        return {
          backgroundColor: colors.white,
          textColor: colors.gray[900],
        };
    }
  };

  const themeStyles = getThemeStyles();

  const renderCurrentView = () => {
    if (!activeSession) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, {color: themeStyles.textColor}]}>
            Nenhuma sessão ativa
          </Text>
        </View>
      );
    }

    switch (currentView) {
      case 'overview':
        return (
          <OverviewView
            session={activeSession}
            navigationState={navigationState}
            timerState={timerState}
            onNavigateToStep={(stepIndex) => {
              // Navigate to specific step
            }}
            onStartTimer={(name, duration) => {
              // Start timer
            }}
          />
        );
      
      case 'step-by-step':
        return (
          <StepByStepView
            session={activeSession}
            currentStep={currentStep}
            navigationState={navigationState}
            settings={settings}
            onNextStep={goToNextStep}
            onPreviousStep={goToPreviousStep}
            onMarkComplete={(stepId, notes) => markStepComplete(stepId, notes)}
            onAddTimer={(name, duration) => {
              // Add timer for current step
            }}
          />
        );
      
      case 'timers':
        return (
          <TimersView
            timers={timerState.activeTimers}
            onCreateTimer={(name, duration) => {
              // Create new timer
            }}
            onControlTimer={(timerId, action) => {
              // Control timer
            }}
          />
        );
      
      case 'ingredients':
        return (
          <IngredientsView
            session={activeSession}
            showChecklist={settings.showIngredientChecklist}
            onToggleIngredient={(ingredientId) => {
              // Toggle ingredient check
            }}
          />
        );
      
      case 'notes':
        return (
          <NotesView
            session={activeSession}
            onAddNote={(note) => {
              // Add note to session
            }}
            onUpdateNote={(noteId, content) => {
              // Update existing note
            }}
          />
        );
      
      default:
        return null;
    }
  };

  if (showSettings) {
    return (
      <CookingModeSettings
        settings={settings}
        onUpdateSettings={(newSettings) => {
          // Update settings
        }}
        onClose={() => setShowSettings(false)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: themeStyles.backgroundColor}]}>
      <StatusBar
        barStyle={settings.theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={themeStyles.backgroundColor}
      />
      
      <CookingModeHeader
        session={activeSession}
        navigationState={navigationState}
        timerState={timerState}
        currentView={currentView}
        onViewChange={setCurrentView}
        onPause={pauseSession}
        onComplete={() => {
          Alert.alert(
            'Concluir Sessão',
            'Deseja marcar esta sessão como concluída?',
            [
              {text: 'Cancelar', style: 'cancel'},
              {
                text: 'Concluir',
                onPress: () => completeSession(),
              },
            ]
          );
        }}
        onSettings={() => setShowSettings(true)}
        theme={settings.theme}
      />

      <View style={styles.content}>
        {renderCurrentView()}
      </View>

      {settings.voiceControlEnabled && (
        <VoiceControlIndicator
          isListening={isVoiceListening}
          onVoiceCommand={handleVoiceCommand}
          language={settings.voiceLanguage}
        />
      )}
    </SafeAreaView>
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
});
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Alert, AccessibilityInfo, Dimensions } from 'react-native';
import * as Speech from 'expo-speech';
import {
  useGetAccessibilitySettingsQuery,
  useUpdateAccessibilitySettingsMutation,
  useCreateAnnouncementMutation,
  useGetVoiceCommandsQuery,
  useRegisterVoiceCommandMutation,
  useGetAccessibilityReportQuery,
  useGenerateAccessibilityReportMutation,
  useRunAccessibilityTestMutation,
  useRunAllAccessibilityTestsMutation,
  useGetSystemAccessibilityInfoQuery,
  useEnableHighContrastMutation,
  useDisableHighContrastMutation,
  useIncreaseFontSizeMutation,
  useDecreaseFontSizeMutation,
  useEnableScreenReaderMutation,
  useDisableScreenReaderMutation,
} from '../services/accessibilityApi';
import {
  UpdateAccessibilitySettingsRequest,
  CreateAnnouncementRequest,
  RegisterVoiceCommandRequest,
  getFontScale,
  getTouchTargetSize,
  formatAccessibilityLabel,
  getAccessibilityHint,
} from '../types/accessibility';

export const useAccessibilitySettings = () => {
  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useGetAccessibilitySettingsQuery();

  const [updateSettings, { isLoading: isUpdating }] = useUpdateAccessibilitySettingsMutation();

  const handleUpdateSettings = useCallback(async (data: UpdateAccessibilitySettingsRequest) => {
    try {
      const result = await updateSettings(data).unwrap();
      return { success: true, settings: result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao atualizar configurações',
      };
    }
  }, [updateSettings]);

  const fontScale = useMemo(() => {
    return settings ? getFontScale(settings.fontSize) : 1.0;
  }, [settings]);

  const touchTargetSize = useMemo(() => {
    return settings ? getTouchTargetSize(settings.touchTargetSize) : 48;
  }, [settings]);

  return {
    settings,
    fontScale,
    touchTargetSize,
    isLoading,
    error,
    refetch,
    updateSettings: handleUpdateSettings,
    isUpdating,
  };
};

export const useScreenReader = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [createAnnouncement] = useCreateAnnouncementMutation();
  const { settings } = useAccessibilitySettings();

  useEffect(() => {
    // Verificar se o leitor de tela está ativo
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    return () => subscription?.remove();
  }, []);

  const announce = useCallback(async (
    message: string,
    priority: 'low' | 'medium' | 'high' | 'assertive' = 'medium'
  ) => {
    if (!settings?.screenReaderEnabled && !isScreenReaderEnabled) return;

    try {
      // Anunciar via AccessibilityInfo (nativo)
      AccessibilityInfo.announceForAccessibility(message);

      // Registrar no sistema para histórico
      await createAnnouncement({
        type: 'content',
        message,
        priority,
      });
    } catch (error) {
      console.warn('Erro ao fazer anúncio de acessibilidade:', error);
    }
  }, [settings, isScreenReaderEnabled, createAnnouncement]);

  const announceNavigation = useCallback((screenName: string) => {
    if (settings?.announceNavigation) {
      announce(`Navegou para ${screenName}`, 'medium');
    }
  }, [settings, announce]);

  const announceAction = useCallback((action: string, result?: string) => {
    if (settings?.announceActions) {
      const message = result ? `${action}. ${result}` : action;
      announce(message, 'medium');
    }
  }, [settings, announce]);

  const announceError = useCallback((error: string) => {
    announce(`Erro: ${error}`, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((message: string) => {
    announce(`Sucesso: ${message}`, 'high');
  }, [announce]);

  return {
    isScreenReaderEnabled,
    announce,
    announceNavigation,
    announceAction,
    announceError,
    announceSuccess,
  };
};

export const useVoiceControl = () => {
  const [isListening, setIsListening] = useState(false);
  const [isVoiceControlEnabled, setIsVoiceControlEnabled] = useState(false);
  
  const {
    data: voiceCommands,
    isLoading,
    refetch,
  } = useGetVoiceCommandsQuery();

  const [registerCommand] = useRegisterVoiceCommandMutation();
  const { settings } = useAccessibilitySettings();

  useEffect(() => {
    setIsVoiceControlEnabled(settings?.voiceControl || false);
  }, [settings]);

  const startListening = useCallback(() => {
    if (!isVoiceControlEnabled) return;
    
    setIsListening(true);
    // Implementar reconhecimento de voz
    // Por enquanto, apenas simular
    console.log('Iniciando reconhecimento de voz...');
  }, [isVoiceControlEnabled]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    console.log('Parando reconhecimento de voz...');
  }, []);

  const registerVoiceCommand = useCallback(async (data: RegisterVoiceCommandRequest) => {
    try {
      const result = await registerCommand(data).unwrap();
      return { success: true, command: result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao registrar comando',
      };
    }
  }, [registerCommand]);

  const executeCommand = useCallback((command: string) => {
    if (!voiceCommands) return;

    const matchedCommand = voiceCommands.find(
      cmd => cmd.command.toLowerCase() === command.toLowerCase() ||
             cmd.aliases.some(alias => alias.toLowerCase() === command.toLowerCase())
    );

    if (matchedCommand && matchedCommand.enabled) {
      matchedCommand.action();
      return true;
    }

    return false;
  }, [voiceCommands]);

  return {
    isVoiceControlEnabled,
    isListening,
    voiceCommands: voiceCommands || [],
    isLoading,
    refetch,
    startListening,
    stopListening,
    registerVoiceCommand,
    executeCommand,
  };
};

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { settings } = useAccessibilitySettings();

  const speak = useCallback(async (text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
  }) => {
    if (!settings?.screenReaderEnabled) return;

    try {
      setIsSpeaking(true);
      
      await Speech.speak(text, {
        rate: options?.rate || settings.speechRate || 1.0,
        pitch: options?.pitch || settings.speechPitch || 1.0,
        volume: options?.volume || settings.speechVolume || 1.0,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.warn('Erro ao falar texto:', error);
      setIsSpeaking(false);
    }
  }, [settings]);

  const stop = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    Speech.pause();
  }, []);

  const resume = useCallback(() => {
    Speech.resume();
  }, []);

  return {
    isSpeaking,
    speak,
    stop,
    pause,
    resume,
  };
};

export const useKeyboardNavigation = () => {
  const [currentFocus, setCurrentFocus] = useState<string | null>(null);
  const { settings } = useAccessibilitySettings();

  const isKeyboardNavigationEnabled = useMemo(() => {
    return settings?.keyboardNavigation || false;
  }, [settings]);

  const focusElement = useCallback((elementId: string) => {
    if (!isKeyboardNavigationEnabled) return;
    
    setCurrentFocus(elementId);
    // Implementar foco real no elemento
    console.log(`Focando elemento: ${elementId}`);
  }, [isKeyboardNavigationEnabled]);

  const moveFocus = useCallback((direction: 'next' | 'previous' | 'up' | 'down') => {
    if (!isKeyboardNavigationEnabled) return;
    
    // Implementar lógica de navegação por teclado
    console.log(`Movendo foco: ${direction}`);
  }, [isKeyboardNavigationEnabled]);

  const handleKeyPress = useCallback((key: string) => {
    if (!isKeyboardNavigationEnabled) return;

    switch (key) {
      case 'Tab':
        moveFocus('next');
        break;
      case 'Shift+Tab':
        moveFocus('previous');
        break;
      case 'ArrowUp':
        moveFocus('up');
        break;
      case 'ArrowDown':
        moveFocus('down');
        break;
      case 'Enter':
      case 'Space':
        // Ativar elemento focado
        console.log('Ativando elemento focado');
        break;
    }
  }, [isKeyboardNavigationEnabled, moveFocus]);

  return {
    isKeyboardNavigationEnabled,
    currentFocus,
    focusElement,
    moveFocus,
    handleKeyPress,
  };
};

export const useAccessibilityTesting = () => {
  const {
    data: report,
    isLoading: reportLoading,
    refetch: refetchReport,
  } = useGetAccessibilityReportQuery();

  const [generateReport, { isLoading: isGenerating }] = useGenerateAccessibilityReportMutation();
  const [runTest, { isLoading: isRunningTest }] = useRunAccessibilityTestMutation();
  const [runAllTests, { isLoading: isRunningAllTests }] = useRunAllAccessibilityTestsMutation();

  const handleGenerateReport = useCallback(async () => {
    try {
      const result = await generateReport().unwrap();
      Alert.alert(
        'Relatório Gerado',
        `Relatório de acessibilidade gerado com pontuação ${result.overallScore}/100`
      );
      return { success: true, report: result };
    } catch (error: any) {
      Alert.alert('Erro', error.data?.message || 'Erro ao gerar relatório');
      return {
        success: false,
        error: error.data?.message || 'Erro ao gerar relatório',
      };
    }
  }, [generateReport]);

  const handleRunTest = useCallback(async (testId: string, elementId?: string) => {
    try {
      const result = await runTest({ testId, elementId }).unwrap();
      return { success: true, test: result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao executar teste',
      };
    }
  }, [runTest]);

  const handleRunAllTests = useCallback(async () => {
    try {
      const result = await runAllTests().unwrap();
      Alert.alert(
        'Testes Concluídos',
        `${result.completed} testes concluídos, ${result.failed} falharam`
      );
      return { success: true, ...result };
    } catch (error: any) {
      Alert.alert('Erro', error.data?.message || 'Erro ao executar testes');
      return {
        success: false,
        error: error.data?.message || 'Erro ao executar testes',
      };
    }
  }, [runAllTests]);

  return {
    report,
    reportLoading,
    refetchReport,
    generateReport: handleGenerateReport,
    runTest: handleRunTest,
    runAllTests: handleRunAllTests,
    isGenerating,
    isRunningTest,
    isRunningAllTests,
  };
};

export const useAccessibilityQuickActions = () => {
  const [enableHighContrast] = useEnableHighContrastMutation();
  const [disableHighContrast] = useDisableHighContrastMutation();
  const [increaseFontSize] = useIncreaseFontSizeMutation();
  const [decreaseFontSize] = useDecreaseFontSizeMutation();
  const [enableScreenReader] = useEnableScreenReaderMutation();
  const [disableScreenReader] = useDisableScreenReaderMutation();

  const toggleHighContrast = useCallback(async (enabled: boolean) => {
    try {
      if (enabled) {
        await enableHighContrast().unwrap();
      } else {
        await disableHighContrast().unwrap();
      }
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao alterar contraste',
      };
    }
  }, [enableHighContrast, disableHighContrast]);

  const changeFontSize = useCallback(async (increase: boolean) => {
    try {
      if (increase) {
        await increaseFontSize().unwrap();
      } else {
        await decreaseFontSize().unwrap();
      }
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao alterar tamanho da fonte',
      };
    }
  }, [increaseFontSize, decreaseFontSize]);

  const toggleScreenReader = useCallback(async (enabled: boolean) => {
    try {
      if (enabled) {
        await enableScreenReader().unwrap();
      } else {
        await disableScreenReader().unwrap();
      }
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao alterar leitor de tela',
      };
    }
  }, [enableScreenReader, disableScreenReader]);

  return {
    toggleHighContrast,
    changeFontSize,
    toggleScreenReader,
  };
};

export const useAccessibilityHelpers = () => {
  const { settings } = useAccessibilitySettings();

  const formatLabel = useCallback((
    type: string,
    label: string,
    value?: string,
    state?: string
  ) => {
    return formatAccessibilityLabel(type, label, value, state);
  }, []);

  const formatHint = useCallback((action: string, gesture?: string) => {
    return getAccessibilityHint(action, gesture);
  }, []);

  const getAccessibilityProps = useCallback((
    label: string,
    hint?: string,
    role?: string,
    state?: any
  ) => {
    const props: any = {
      accessible: true,
      accessibilityLabel: label,
    };

    if (hint) {
      props.accessibilityHint = hint;
    }

    if (role) {
      props.accessibilityRole = role;
    }

    if (state) {
      props.accessibilityState = state;
    }

    // Ajustar tamanho do alvo de toque se necessário
    if (settings?.touchTargetSize) {
      const minSize = getTouchTargetSize(settings.touchTargetSize);
      props.style = {
        minWidth: minSize,
        minHeight: minSize,
        ...props.style,
      };
    }

    return props;
  }, [settings]);

  const shouldReduceMotion = useMemo(() => {
    return settings?.reduceMotion || false;
  }, [settings]);

  const shouldReduceTransparency = useMemo(() => {
    return settings?.reduceTransparency || false;
  }, [settings]);

  return {
    formatLabel,
    formatHint,
    getAccessibilityProps,
    shouldReduceMotion,
    shouldReduceTransparency,
  };
};

export const useSystemAccessibility = () => {
  const {
    data: systemInfo,
    isLoading,
    refetch,
  } = useGetSystemAccessibilityInfoQuery();

  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    // Verificar configurações do sistema
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderEnabled);
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotionEnabled);

    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setScreenReaderEnabled
    );

    const reduceMotionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotionEnabled
    );

    return () => {
      screenReaderSubscription?.remove();
      reduceMotionSubscription?.remove();
    };
  }, []);

  return {
    systemInfo,
    screenReaderEnabled,
    reduceMotionEnabled,
    isLoading,
    refetch,
  };
};
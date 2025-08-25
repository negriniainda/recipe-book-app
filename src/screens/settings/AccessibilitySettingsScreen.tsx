import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Appbar,
  List,
  Switch,
  Text,
  Card,
  Button,
  Slider,
  Chip,
  Divider,
  ActivityIndicator,
  SegmentedButtons,
} from 'react-native-paper';
import {
  useAccessibilitySettings,
  useAccessibilityQuickActions,
  useSystemAccessibility,
  useAccessibilityTesting,
} from '../../hooks/useAccessibility';
import {
  FONT_SIZES,
  TOUCH_TARGET_SIZES,
  COLOR_BLINDNESS_TYPES,
  SPEECH_RATES,
} from '../../types/accessibility';

interface AccessibilitySettingsScreenProps {
  navigation: any;
}

const AccessibilitySettingsScreen: React.FC<AccessibilitySettingsScreenProps> = ({
  navigation,
}) => {
  const [testingExpanded, setTestingExpanded] = useState(false);

  const {
    settings,
    fontScale,
    touchTargetSize,
    isLoading,
    updateSettings,
    isUpdating,
  } = useAccessibilitySettings();

  const {
    toggleHighContrast,
    changeFontSize,
    toggleScreenReader,
  } = useAccessibilityQuickActions();

  const {
    systemInfo,
    screenReaderEnabled,
    reduceMotionEnabled,
  } = useSystemAccessibility();

  const {
    report,
    generateReport,
    runAllTests,
    isGenerating,
    isRunningAllTests,
  } = useAccessibilityTesting();

  const handleUpdateSetting = useCallback(async (key: string, value: any) => {
    const result = await updateSettings({ [key]: value });
    if (!result.success) {
      Alert.alert('Erro', result.error);
    }
  }, [updateSettings]);

  const handleQuickToggle = useCallback(async (
    action: 'highContrast' | 'fontSize' | 'screenReader',
    value: any
  ) => {
    let result;
    
    switch (action) {
      case 'highContrast':
        result = await toggleHighContrast(value);
        break;
      case 'fontSize':
        result = await changeFontSize(value);
        break;
      case 'screenReader':
        result = await toggleScreenReader(value);
        break;
    }

    if (!result.success) {
      Alert.alert('Erro', result.error);
    }
  }, [toggleHighContrast, changeFontSize, toggleScreenReader]);

  const getFontSizeLabel = (size: string) => {
    const fontSize = FONT_SIZES.find(f => f.value === size);
    return fontSize?.label || size;
  };

  const getTouchTargetLabel = (size: string) => {
    const target = TOUCH_TARGET_SIZES.find(t => t.value === size);
    return target?.label || size;
  };

  const getColorBlindnessLabel = (type: string) => {
    const colorType = COLOR_BLINDNESS_TYPES.find(c => c.value === type);
    return colorType?.label || type;
  };

  const getSpeechRateLabel = (rate: number) => {
    const speechRate = SPEECH_RATES.find(s => s.value === rate);
    return speechRate?.label || `${rate}x`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Acessibilidade" />
        </Appbar.Header>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Carregando configurações...</Text>
        </View>
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={styles.errorContainer}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Acessibilidade" />
        </Appbar.Header>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            Erro ao carregar configurações
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Acessibilidade" />
        <Appbar.Action
          icon="help-circle"
          onPress={() => navigation.navigate('AccessibilityHelp')}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Status do Sistema */}
        <Card style={styles.systemCard}>
          <Card.Content>
            <Text style={styles.systemTitle}>Status do Sistema</Text>
            <View style={styles.systemStatus}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Leitor de Tela:</Text>
                <Chip
                  style={[
                    styles.statusChip,
                    { backgroundColor: screenReaderEnabled ? '#4caf50' : '#f44336' },
                  ]}
                  textStyle={styles.statusChipText}
                >
                  {screenReaderEnabled ? 'Ativo' : 'Inativo'}
                </Chip>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Reduzir Movimento:</Text>
                <Chip
                  style={[
                    styles.statusChip,
                    { backgroundColor: reduceMotionEnabled ? '#4caf50' : '#f44336' },
                  ]}
                  textStyle={styles.statusChipText}
                >
                  {reduceMotionEnabled ? 'Ativo' : 'Inativo'}
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Ações Rápidas */}
        <Card style={styles.quickActionsCard}>
          <Card.Content>
            <Text style={styles.quickActionsTitle}>Ações Rápidas</Text>
            <View style={styles.quickActionsRow}>
              <Button
                mode={settings.highContrast ? 'contained' : 'outlined'}
                onPress={() => handleQuickToggle('highContrast', !settings.highContrast)}
                style={styles.quickActionButton}
              >
                Alto Contraste
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleQuickToggle('fontSize', true)}
                style={styles.quickActionButton}
              >
                A+
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleQuickToggle('fontSize', false)}
                style={styles.quickActionButton}
              >
                A-
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Configurações Visuais */}
        <List.Section>
          <List.Subheader>Configurações Visuais</List.Subheader>
          
          <List.Item
            title="Tamanho da Fonte"
            description={`Atual: ${getFontSizeLabel(settings.fontSize)} (${fontScale}x)`}
            left={(props) => <List.Icon {...props} icon="format-size" />}
            right={() => (
              <Chip mode="outlined">
                {getFontSizeLabel(settings.fontSize)}
              </Chip>
            )}
            onPress={() => navigation.navigate('FontSizeSettings')}
          />

          <List.Item
            title="Peso da Fonte"
            description="Tornar texto mais legível"
            left={(props) => <List.Icon {...props} icon="format-bold" />}
            right={() => (
              <Switch
                value={settings.fontWeight === 'bold'}
                onValueChange={(value) => 
                  handleUpdateSetting('fontWeight', value ? 'bold' : 'normal')
                }
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Alto Contraste"
            description="Aumentar contraste para melhor visibilidade"
            left={(props) => <List.Icon {...props} icon="contrast" />}
            right={() => (
              <Switch
                value={settings.highContrast}
                onValueChange={(value) => handleUpdateSetting('highContrast', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Modo Escuro"
            description="Interface com cores escuras"
            left={(props) => <List.Icon {...props} icon="weather-night" />}
            right={() => (
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => handleUpdateSetting('darkMode', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Suporte a Daltonismo"
            description={`Atual: ${getColorBlindnessLabel(settings.colorBlindnessSupport)}`}
            left={(props) => <List.Icon {...props} icon="palette" />}
            right={() => (
              <Chip mode="outlined">
                {getColorBlindnessLabel(settings.colorBlindnessSupport)}
              </Chip>
            )}
            onPress={() => navigation.navigate('ColorBlindnessSettings')}
          />
        </List.Section>

        <Divider />

        {/* Configurações de Leitor de Tela */}
        <List.Section>
          <List.Subheader>Leitor de Tela</List.Subheader>
          
          <List.Item
            title="Habilitar Leitor de Tela"
            description="Ler conteúdo em voz alta"
            left={(props) => <List.Icon {...props} icon="volume-high" />}
            right={() => (
              <Switch
                value={settings.screenReaderEnabled}
                onValueChange={(value) => handleUpdateSetting('screenReaderEnabled', value)}
                disabled={isUpdating}
              />
            )}
          />

          {settings.screenReaderEnabled && (
            <>
              <List.Item
                title="Anunciar Navegação"
                description="Anunciar mudanças de tela"
                left={(props) => <List.Icon {...props} icon="navigation" />}
                right={() => (
                  <Switch
                    value={settings.announceNavigation}
                    onValueChange={(value) => handleUpdateSetting('announceNavigation', value)}
                    disabled={isUpdating}
                  />
                )}
              />

              <List.Item
                title="Anunciar Ações"
                description="Anunciar resultados de ações"
                left={(props) => <List.Icon {...props} icon="gesture-tap" />}
                right={() => (
                  <Switch
                    value={settings.announceActions}
                    onValueChange={(value) => handleUpdateSetting('announceActions', value)}
                    disabled={isUpdating}
                  />
                )}
              />

              <List.Item
                title="Velocidade da Fala"
                description={`Atual: ${getSpeechRateLabel(settings.speechRate)}`}
                left={(props) => <List.Icon {...props} icon="speedometer" />}
                right={() => (
                  <Chip mode="outlined">
                    {getSpeechRateLabel(settings.speechRate)}
                  </Chip>
                )}
                onPress={() => navigation.navigate('SpeechSettings')}
              />
            </>
          )}
        </List.Section>

        <Divider />

        {/* Configurações de Navegação */}
        <List.Section>
          <List.Subheader>Navegação</List.Subheader>
          
          <List.Item
            title="Navegação por Teclado"
            description="Navegar usando teclado"
            left={(props) => <List.Icon {...props} icon="keyboard" />}
            right={() => (
              <Switch
                value={settings.keyboardNavigation}
                onValueChange={(value) => handleUpdateSetting('keyboardNavigation', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Indicador de Foco"
            description="Destacar elemento focado"
            left={(props) => <List.Icon {...props} icon="target" />}
            right={() => (
              <Switch
                value={settings.focusIndicator}
                onValueChange={(value) => handleUpdateSetting('focusIndicator', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Tamanho do Alvo de Toque"
            description={`Atual: ${getTouchTargetLabel(settings.touchTargetSize)} (${touchTargetSize}px)`}
            left={(props) => <List.Icon {...props} icon="gesture-tap" />}
            right={() => (
              <Chip mode="outlined">
                {getTouchTargetLabel(settings.touchTargetSize)}
              </Chip>
            )}
            onPress={() => navigation.navigate('TouchTargetSettings')}
          />

          <List.Item
            title="Controle por Voz"
            description="Navegar usando comandos de voz"
            left={(props) => <List.Icon {...props} icon="microphone" />}
            right={() => (
              <Switch
                value={settings.voiceControl}
                onValueChange={(value) => handleUpdateSetting('voiceControl', value)}
                disabled={isUpdating}
              />
            )}
          />
        </List.Section>

        <Divider />

        {/* Configurações de Conteúdo */}
        <List.Section>
          <List.Subheader>Conteúdo</List.Subheader>
          
          <List.Item
            title="Descrições de Imagem"
            description="Ler descrições de imagens"
            left={(props) => <List.Icon {...props} icon="image" />}
            right={() => (
              <Switch
                value={settings.imageDescriptions}
                onValueChange={(value) => handleUpdateSetting('imageDescriptions', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Legendas"
            description="Mostrar legendas em vídeos"
            left={(props) => <List.Icon {...props} icon="closed-caption" />}
            right={() => (
              <Switch
                value={settings.captionsEnabled}
                onValueChange={(value) => handleUpdateSetting('captionsEnabled', value)}
                disabled={isUpdating}
              />
            )}
          />
        </List.Section>

        <Divider />

        {/* Configurações de Animação */}
        <List.Section>
          <List.Subheader>Animações</List.Subheader>
          
          <List.Item
            title="Reduzir Movimento"
            description="Minimizar animações e transições"
            left={(props) => <List.Icon {...props} icon="motion-pause" />}
            right={() => (
              <Switch
                value={settings.reduceMotion}
                onValueChange={(value) => handleUpdateSetting('reduceMotion', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Reduzir Transparência"
            description="Reduzir efeitos de transparência"
            left={(props) => <List.Icon {...props} icon="opacity" />}
            right={() => (
              <Switch
                value={settings.reduceTransparency}
                onValueChange={(value) => handleUpdateSetting('reduceTransparency', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Pausar Animações"
            description="Pausar animações automáticas"
            left={(props) => <List.Icon {...props} icon="pause" />}
            right={() => (
              <Switch
                value={settings.pauseAnimations}
                onValueChange={(value) => handleUpdateSetting('pauseAnimations', value)}
                disabled={isUpdating}
              />
            )}
          />
        </List.Section>

        <Divider />

        {/* Configurações de Feedback */}
        <List.Section>
          <List.Subheader>Feedback</List.Subheader>
          
          <List.Item
            title="Feedback Tátil"
            description="Vibração para confirmações"
            left={(props) => <List.Icon {...props} icon="vibrate" />}
            right={() => (
              <Switch
                value={settings.hapticFeedback}
                onValueChange={(value) => handleUpdateSetting('hapticFeedback', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Feedback Sonoro"
            description="Sons para confirmações"
            left={(props) => <List.Icon {...props} icon="volume-medium" />}
            right={() => (
              <Switch
                value={settings.audioFeedback}
                onValueChange={(value) => handleUpdateSetting('audioFeedback', value)}
                disabled={isUpdating}
              />
            )}
          />

          <List.Item
            title="Feedback Visual"
            description="Indicações visuais para ações"
            left={(props) => <List.Icon {...props} icon="eye" />}
            right={() => (
              <Switch
                value={settings.visualFeedback}
                onValueChange={(value) => handleUpdateSetting('visualFeedback', value)}
                disabled={isUpdating}
              />
            )}
          />
        </List.Section>

        <Divider />

        {/* Testes de Acessibilidade */}
        <List.Section>
          <List.Subheader>Testes e Relatórios</List.Subheader>
          
          <List.Item
            title="Relatório de Acessibilidade"
            description={report ? `Pontuação: ${report.overallScore}/100` : 'Gerar relatório'}
            left={(props) => <List.Icon {...props} icon="chart-line" />}
            right={() => (
              <Button
                mode="outlined"
                onPress={generateReport}
                disabled={isGenerating}
                loading={isGenerating}
              >
                {report ? 'Atualizar' : 'Gerar'}
              </Button>
            )}
          />

          <List.Item
            title="Executar Todos os Testes"
            description="Verificar conformidade WCAG"
            left={(props) => <List.Icon {...props} icon="test-tube" />}
            right={() => (
              <Button
                mode="outlined"
                onPress={runAllTests}
                disabled={isRunningAllTests}
                loading={isRunningAllTests}
              >
                Executar
              </Button>
            )}
          />

          <List.Item
            title="Tutoriais de Acessibilidade"
            description="Aprender sobre recursos de acessibilidade"
            left={(props) => <List.Icon {...props} icon="school" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('AccessibilityTutorials')}
          />
        </List.Section>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
  systemCard: {
    margin: 16,
    elevation: 2,
  },
  systemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  systemStatus: {
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    fontSize: 11,
    color: '#fff',
  },
  quickActionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default AccessibilitySettingsScreen;
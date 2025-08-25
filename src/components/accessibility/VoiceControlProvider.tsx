import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Text, Button, Card, Chip } from 'react-native-paper';
import { useVoiceControl, useScreenReader } from '../../hooks/useAccessibility';
import { VoiceCommand } from '../../types/accessibility';

interface VoiceControlContextType {
  isListening: boolean;
  isVoiceControlEnabled: boolean;
  currentCommand: string | null;
  confidence: number;
  startListening: () => void;
  stopListening: () => void;
  registerCommand: (command: VoiceCommand) => void;
  unregisterCommand: (commandId: string) => void;
  executeCommand: (command: string) => boolean;
}

const VoiceControlContext = createContext<VoiceControlContextType | null>(null);

export const useVoiceControlContext = () => {
  const context = useContext(VoiceControlContext);
  if (!context) {
    throw new Error('useVoiceControlContext must be used within VoiceControlProvider');
  }
  return context;
};

interface VoiceControlProviderProps {
  children: React.ReactNode;
  showIndicator?: boolean;
}

export const VoiceControlProvider: React.FC<VoiceControlProviderProps> = ({
  children,
  showIndicator = true,
}) => {
  const [currentCommand, setCurrentCommand] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [localCommands, setLocalCommands] = useState<Map<string, VoiceCommand>>(new Map());
  const [recognitionResults, setRecognitionResults] = useState<string[]>([]);

  const {
    isVoiceControlEnabled,
    isListening,
    voiceCommands,
    startListening: startVoiceListening,
    stopListening: stopVoiceListening,
    executeCommand: executeVoiceCommand,
  } = useVoiceControl();

  const { announce } = useScreenReader();

  // Comandos padrão do sistema
  const defaultCommands: VoiceCommand[] = [
    {
      id: 'go-back',
      command: 'voltar',
      aliases: ['volta', 'anterior', 'back'],
      description: 'Voltar para tela anterior',
      category: 'navigation',
      action: () => {
        // Implementar navegação de volta
        console.log('Executando: voltar');
        announce('Voltando para tela anterior');
      },
      enabled: true,
    },
    {
      id: 'go-home',
      command: 'início',
      aliases: ['home', 'principal', 'menu principal'],
      description: 'Ir para tela inicial',
      category: 'navigation',
      action: () => {
        console.log('Executando: ir para início');
        announce('Indo para tela inicial');
      },
      enabled: true,
    },
    {
      id: 'search',
      command: 'buscar',
      aliases: ['procurar', 'encontrar', 'search'],
      description: 'Abrir busca',
      category: 'action',
      action: () => {
        console.log('Executando: buscar');
        announce('Abrindo busca');
      },
      enabled: true,
    },
    {
      id: 'help',
      command: 'ajuda',
      aliases: ['socorro', 'help', 'assistência'],
      description: 'Mostrar ajuda',
      category: 'system',
      action: () => {
        console.log('Executando: ajuda');
        announce('Abrindo ajuda');
      },
      enabled: true,
    },
    {
      id: 'repeat',
      command: 'repetir',
      aliases: ['repita', 'de novo', 'repeat'],
      description: 'Repetir última ação',
      category: 'system',
      action: () => {
        console.log('Executando: repetir');
        announce('Repetindo última ação');
      },
      enabled: true,
    },
    {
      id: 'stop-listening',
      command: 'parar escuta',
      aliases: ['parar', 'stop', 'cancelar'],
      description: 'Parar reconhecimento de voz',
      category: 'system',
      action: () => {
        stopListening();
        announce('Parando reconhecimento de voz');
      },
      enabled: true,
    },
  ];

  useEffect(() => {
    // Registrar comandos padrão
    const commandsMap = new Map();
    defaultCommands.forEach(cmd => {
      commandsMap.set(cmd.id, cmd);
    });
    setLocalCommands(commandsMap);
  }, []);

  const startListening = useCallback(() => {
    if (!isVoiceControlEnabled) {
      Alert.alert(
        'Controle por Voz Desabilitado',
        'Ative o controle por voz nas configurações de acessibilidade.'
      );
      return;
    }

    startVoiceListening();
    announce('Iniciando reconhecimento de voz. Diga um comando.');
    setCurrentCommand(null);
    setConfidence(0);
  }, [isVoiceControlEnabled, startVoiceListening, announce]);

  const stopListening = useCallback(() => {
    stopVoiceListening();
    setCurrentCommand(null);
    setConfidence(0);
    setRecognitionResults([]);
  }, [stopVoiceListening]);

  const registerCommand = useCallback((command: VoiceCommand) => {
    setLocalCommands(prev => {
      const newCommands = new Map(prev);
      newCommands.set(command.id, command);
      return newCommands;
    });
  }, []);

  const unregisterCommand = useCallback((commandId: string) => {
    setLocalCommands(prev => {
      const newCommands = new Map(prev);
      newCommands.delete(commandId);
      return newCommands;
    });
  }, []);

  const executeCommand = useCallback((command: string) => {
    const normalizedCommand = command.toLowerCase().trim();
    setCurrentCommand(normalizedCommand);

    // Procurar nos comandos locais primeiro
    for (const cmd of localCommands.values()) {
      if (!cmd.enabled) continue;

      const matches = [cmd.command, ...cmd.aliases].some(
        cmdText => cmdText.toLowerCase() === normalizedCommand ||
                  normalizedCommand.includes(cmdText.toLowerCase())
      );

      if (matches) {
        try {
          cmd.action();
          announce(`Comando executado: ${cmd.description}`);
          setCurrentCommand(null);
          return true;
        } catch (error) {
          console.error('Erro ao executar comando:', error);
          announce('Erro ao executar comando');
          return false;
        }
      }
    }

    // Tentar comandos do sistema
    const systemResult = executeVoiceCommand(normalizedCommand);
    if (systemResult) {
      setCurrentCommand(null);
      return true;
    }

    // Comando não reconhecido
    announce(`Comando não reconhecido: ${command}. Diga "ajuda" para ver comandos disponíveis.`);
    setCurrentCommand(null);
    return false;
  }, [localCommands, executeVoiceCommand, announce]);

  // Simular reconhecimento de voz (em produção usaria react-native-voice ou similar)
  useEffect(() => {
    if (!isListening) return;

    const simulateRecognition = () => {
      // Simular resultados de reconhecimento
      const mockResults = [
        'buscar receitas',
        'voltar',
        'ajuda',
        'início',
        'parar escuta',
      ];

      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      const mockConfidence = 0.7 + Math.random() * 0.3;

      setRecognitionResults([randomResult]);
      setConfidence(mockConfidence);
      setCurrentCommand(randomResult);

      // Auto-executar se confiança for alta
      if (mockConfidence > 0.8) {
        setTimeout(() => {
          executeCommand(randomResult);
        }, 1000);
      }
    };

    // Simular delay de reconhecimento
    const timer = setTimeout(simulateRecognition, 2000);

    return () => clearTimeout(timer);
  }, [isListening, executeCommand]);

  const getAvailableCommands = useCallback(() => {
    const allCommands = [
      ...Array.from(localCommands.values()),
      ...voiceCommands,
    ];

    return allCommands.filter(cmd => cmd.enabled);
  }, [localCommands, voiceCommands]);

  const contextValue: VoiceControlContextType = {
    isListening,
    isVoiceControlEnabled,
    currentCommand,
    confidence,
    startListening,
    stopListening,
    registerCommand,
    unregisterCommand,
    executeCommand,
  };

  return (
    <VoiceControlContext.Provider value={contextValue}>
      <View style={styles.container}>
        {children}
        {showIndicator && isVoiceControlEnabled && (
          <VoiceControlIndicator
            isListening={isListening}
            currentCommand={currentCommand}
            confidence={confidence}
            onStartListening={startListening}
            onStopListening={stopListening}
            availableCommands={getAvailableCommands()}
          />
        )}
      </View>
    </VoiceControlContext.Provider>
  );
};

interface VoiceControlIndicatorProps {
  isListening: boolean;
  currentCommand: string | null;
  confidence: number;
  onStartListening: () => void;
  onStopListening: () => void;
  availableCommands: VoiceCommand[];
}

const VoiceControlIndicator: React.FC<VoiceControlIndicatorProps> = ({
  isListening,
  currentCommand,
  confidence,
  onStartListening,
  onStopListening,
  availableCommands,
}) => {
  const [showCommands, setShowCommands] = useState(false);

  if (!isListening && !currentCommand) {
    return (
      <View style={styles.floatingButton}>
        <Button
          mode="contained"
          onPress={onStartListening}
          icon="microphone"
          style={styles.micButton}
          contentStyle={styles.micButtonContent}
        >
          Voz
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.indicator}>
      <Card style={styles.indicatorCard}>
        <Card.Content style={styles.indicatorContent}>
          {isListening ? (
            <>
              <View style={styles.listeningHeader}>
                <View style={styles.listeningIcon}>
                  <Text style={styles.micIcon}>🎤</Text>
                  <View style={[styles.pulseRing, { opacity: confidence }]} />
                </View>
                <Text style={styles.listeningText}>Escutando...</Text>
              </View>
              
              {currentCommand && (
                <View style={styles.commandContainer}>
                  <Text style={styles.commandText}>"{currentCommand}"</Text>
                  <Chip
                    style={[
                      styles.confidenceChip,
                      { backgroundColor: confidence > 0.8 ? '#4caf50' : confidence > 0.6 ? '#ff9800' : '#f44336' }
                    ]}
                    textStyle={styles.confidenceText}
                  >
                    {Math.round(confidence * 100)}%
                  </Chip>
                </View>
              )}

              <View style={styles.indicatorActions}>
                <Button
                  mode="outlined"
                  onPress={onStopListening}
                  style={styles.actionButton}
                  icon="stop"
                >
                  Parar
                </Button>
                <Button
                  mode="text"
                  onPress={() => setShowCommands(!showCommands)}
                  style={styles.actionButton}
                  icon="help-circle"
                >
                  Comandos
                </Button>
              </View>

              {showCommands && (
                <View style={styles.commandsList}>
                  <Text style={styles.commandsTitle}>Comandos Disponíveis:</Text>
                  {availableCommands.slice(0, 6).map((cmd) => (
                    <Text key={cmd.id} style={styles.commandItem}>
                      • "{cmd.command}" - {cmd.description}
                    </Text>
                  ))}
                  {availableCommands.length > 6 && (
                    <Text style={styles.moreCommands}>
                      +{availableCommands.length - 6} mais comandos
                    </Text>
                  )}
                </View>
              )}
            </>
          ) : (
            <View style={styles.processingContainer}>
              <Text style={styles.processingText}>Processando comando...</Text>
              <Text style={styles.commandText}>"{currentCommand}"</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

// Hook para componentes registrarem comandos de voz
export const useVoiceCommand = (
  command: string,
  action: () => void,
  options: {
    aliases?: string[];
    description?: string;
    category?: 'navigation' | 'action' | 'content' | 'system';
    enabled?: boolean;
  } = {}
) => {
  const { registerCommand, unregisterCommand } = useVoiceControlContext();

  useEffect(() => {
    const voiceCommand: VoiceCommand = {
      id: `custom-${command.replace(/\s+/g, '-')}`,
      command,
      aliases: options.aliases || [],
      description: options.description || `Executar ${command}`,
      category: options.category || 'action',
      action,
      enabled: options.enabled !== false,
    };

    registerCommand(voiceCommand);

    return () => {
      unregisterCommand(voiceCommand.id);
    };
  }, [command, action, options.aliases, options.description, options.category, options.enabled, registerCommand, unregisterCommand]);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  micButton: {
    borderRadius: 30,
    elevation: 4,
  },
  micButtonContent: {
    height: 60,
    width: 60,
  },
  indicator: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  indicatorCard: {
    elevation: 8,
    borderRadius: 12,
  },
  indicatorContent: {
    padding: 16,
  },
  listeningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  listeningIcon: {
    position: 'relative',
    marginRight: 12,
  },
  micIcon: {
    fontSize: 24,
  },
  pulseRing: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2196f3',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  listeningText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  commandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  commandText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    flex: 1,
  },
  confidenceChip: {
    height: 24,
  },
  confidenceText: {
    fontSize: 11,
    color: '#fff',
  },
  indicatorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  commandsList: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  commandsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  commandItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  moreCommands: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  processingContainer: {
    alignItems: 'center',
    padding: 16,
  },
  processingText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
});

export default VoiceControlProvider;
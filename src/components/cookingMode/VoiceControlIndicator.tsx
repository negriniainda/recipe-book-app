import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import {Audio} from 'expo-av';
import {colors, typography, spacing} from '../../theme';

interface VoiceControlIndicatorProps {
  isListening: boolean;
  onVoiceCommand: (command: string) => void;
  language: string;
}

export const VoiceControlIndicator: React.FC<VoiceControlIndicatorProps> = ({
  isListening,
  onVoiceCommand,
  language,
}) => {
  const [showCommands, setShowCommands] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Voice commands in Portuguese
  const voiceCommands = [
    {command: 'próximo', action: 'next', description: 'Ir para o próximo passo'},
    {command: 'anterior', action: 'previous', description: 'Voltar ao passo anterior'},
    {command: 'repetir', action: 'repeat', description: 'Repetir instrução atual'},
    {command: 'pausar', action: 'pause', description: 'Pausar sessão'},
    {command: 'continuar', action: 'resume', description: 'Continuar sessão'},
    {command: 'timer', action: 'timer', description: 'Criar timer (ex: "timer 5 minutos")'},
    {command: 'concluído', action: 'complete', description: 'Marcar passo como concluído'},
    {command: 'ajuda', action: 'help', description: 'Mostrar comandos disponíveis'},
  ];

  // Pulse animation for listening indicator
  useEffect(() => {
    if (isListening) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  const startListening = async () => {
    try {
      // Request permissions
      const {status} = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão Negada', 'É necessário permitir o acesso ao microfone para usar comandos de voz.');
        return;
      }

      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(recordingOptions);
      await newRecording.startAsync();
      setRecording(newRecording);

      // Auto-stop after 5 seconds
      setTimeout(() => {
        stopListening();
      }, 5000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Erro', 'Não foi possível iniciar o reconhecimento de voz.');
    }
  };

  const stopListening = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      // Here you would typically send the audio to a speech recognition service
      // For now, we'll simulate with a mock response
      simulateVoiceRecognition();

    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const simulateVoiceRecognition = () => {
    // This is a mock implementation
    // In a real app, you would send the audio to a speech recognition service
    const mockCommands = ['próximo', 'anterior', 'repetir', 'pausar', 'timer 5 minutos'];
    const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
    
    setRecognizedText(randomCommand);
    processVoiceCommand(randomCommand);
  };

  const processVoiceCommand = (text: string) => {
    const lowerText = text.toLowerCase().trim();
    
    // Find matching command
    const matchedCommand = voiceCommands.find(cmd => 
      lowerText.includes(cmd.command.toLowerCase())
    );

    if (matchedCommand) {
      // Handle special cases like timer with duration
      if (matchedCommand.action === 'timer') {
        const timerMatch = lowerText.match(/timer\s+(\d+)\s*(minuto|minutos|segundo|segundos)?/);
        if (timerMatch) {
          const duration = parseInt(timerMatch[1]);
          const unit = timerMatch[2] || 'minutos';
          const seconds = unit.includes('segundo') ? duration : duration * 60;
          onVoiceCommand(`timer:${seconds}`);
        } else {
          onVoiceCommand('timer');
        }
      } else {
        onVoiceCommand(matchedCommand.action);
      }

      // Provide audio feedback
      Speech.speak(`Comando reconhecido: ${matchedCommand.description}`, {
        language: language,
        rate: 0.8,
      });
    } else {
      // Command not recognized
      Speech.speak('Comando não reconhecido. Diga "ajuda" para ver os comandos disponíveis.', {
        language: language,
        rate: 0.8,
      });
    }

    // Clear recognized text after a delay
    setTimeout(() => setRecognizedText(''), 3000);
  };

  const handleMicPress = () => {
    if (isListening || recording) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <>
      {/* Voice Control Button */}
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => setShowCommands(true)}
        >
          <Ionicons name="help-circle-outline" size={20} color={colors.gray[600]} />
        </TouchableOpacity>

        <Animated.View style={[styles.micButton, {transform: [{scale: pulseAnim}]}]}>
          <TouchableOpacity
            style={[
              styles.micButtonInner,
              (isListening || recording) && styles.micButtonActive,
            ]}
            onPress={handleMicPress}
          >
            <Ionicons
              name={isListening || recording ? "mic" : "mic-outline"}
              size={24}
              color={isListening || recording ? colors.white : colors.primary[600]}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Recognized Text Display */}
        {recognizedText && (
          <View style={styles.recognizedTextContainer}>
            <Text style={styles.recognizedText}>"{recognizedText}"</Text>
          </View>
        )}
      </View>

      {/* Voice Commands Modal */}
      <Modal
        visible={showCommands}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCommands(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCommands(false)}>
              <Text style={styles.closeButton}>Fechar</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Comandos de Voz</Text>
            
            <View style={styles.placeholder} />
          </View>

          <View style={styles.modalContent}>
            <View style={styles.instructionsSection}>
              <Ionicons name="information-circle" size={24} color={colors.blue[600]} />
              <View style={styles.instructionsText}>
                <Text style={styles.instructionsTitle}>Como usar:</Text>
                <Text style={styles.instructionsDescription}>
                  Toque no botão do microfone e fale um dos comandos abaixo. 
                  Mantenha o dispositivo próximo e fale claramente.
                </Text>
              </View>
            </View>

            <Text style={styles.commandsTitle}>Comandos Disponíveis:</Text>
            
            {voiceCommands.map((cmd, index) => (
              <View key={index} style={styles.commandItem}>
                <View style={styles.commandHeader}>
                  <Text style={styles.commandText}>"{cmd.command}"</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
                </View>
                <Text style={styles.commandDescription}>{cmd.description}</Text>
              </View>
            ))}

            <View style={styles.examplesSection}>
              <Text style={styles.examplesTitle}>Exemplos:</Text>
              <Text style={styles.exampleText}>• "Próximo" - Avança para o próximo passo</Text>
              <Text style={styles.exampleText}>• "Timer 10 minutos" - Cria um timer de 10 minutos</Text>
              <Text style={styles.exampleText}>• "Repetir" - Repete a instrução atual</Text>
              <Text style={styles.exampleText}>• "Pausar" - Pausa a sessão de cozinha</Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    alignItems: 'center',
  },
  helpButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  micButton: {
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  micButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[700],
  },
  recognizedTextContainer: {
    position: 'absolute',
    bottom: 80,
    right: 0,
    backgroundColor: colors.black,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    maxWidth: 200,
  },
  recognizedText: {
    color: colors.white,
    fontSize: 14,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  closeButton: {
    ...typography.body,
    color: colors.primary[600],
    fontWeight: '500',
  },
  modalTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
  },
  placeholder: {
    width: 50, // Same width as close button for centering
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  instructionsSection: {
    flexDirection: 'row',
    backgroundColor: colors.blue[50],
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  instructionsText: {
    flex: 1,
  },
  instructionsTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.blue[800],
    marginBottom: spacing.xs,
  },
  instructionsDescription: {
    ...typography.body,
    color: colors.blue[700],
    lineHeight: 20,
  },
  commandsTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  commandItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  commandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  commandText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary[600],
    fontFamily: 'monospace',
  },
  commandDescription: {
    ...typography.body,
    color: colors.gray[600],
  },
  examplesSection: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
  },
  examplesTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  exampleText: {
    ...typography.body,
    color: colors.gray[700],
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
});
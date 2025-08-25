import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {CookingTimer} from '../../types/cookingMode';
import {colors, typography, spacing} from '../../theme';

interface TimersViewProps {
  timers: CookingTimer[];
  onCreateTimer: (name: string, duration: number) => void;
  onControlTimer: (timerId: string, action: 'start' | 'pause' | 'resume' | 'stop' | 'reset') => void;
}

export const TimersView: React.FC<TimersViewProps> = ({
  timers,
  onCreateTimer,
  onControlTimer,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTimerName, setNewTimerName] = useState('');
  const [newTimerMinutes, setNewTimerMinutes] = useState('');
  const [newTimerSeconds, setNewTimerSeconds] = useState('');

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (timer: CookingTimer) => {
    if (!timer.isActive) return colors.gray[400];
    if (timer.isPaused) return colors.warning[500];
    if (timer.remainingTime <= 60) return colors.error[500];
    if (timer.remainingTime <= 300) return colors.warning[500];
    return colors.success[500];
  };

  const getTimerIcon = (timer: CookingTimer) => {
    if (!timer.isActive) return 'timer-outline';
    if (timer.isPaused) return 'pause-circle';
    if (timer.remainingTime <= 0) return 'alarm';
    return 'timer';
  };

  const handleCreateTimer = () => {
    if (!newTimerName.trim()) {
      Alert.alert('Erro', 'Digite um nome para o timer');
      return;
    }

    const minutes = parseInt(newTimerMinutes) || 0;
    const seconds = parseInt(newTimerSeconds) || 0;
    const totalSeconds = minutes * 60 + seconds;

    if (totalSeconds <= 0) {
      Alert.alert('Erro', 'Digite um tempo válido');
      return;
    }

    onCreateTimer(newTimerName.trim(), totalSeconds);
    setNewTimerName('');
    setNewTimerMinutes('');
    setNewTimerSeconds('');
    setShowCreateModal(false);
  };

  const handleTimerAction = (timer: CookingTimer, action: string) => {
    switch (action) {
      case 'toggle':
        if (!timer.isActive) {
          onControlTimer(timer.id, 'start');
        } else if (timer.isPaused) {
          onControlTimer(timer.id, 'resume');
        } else {
          onControlTimer(timer.id, 'pause');
        }
        break;
      case 'stop':
        Alert.alert(
          'Parar Timer',
          `Deseja parar o timer "${timer.name}"?`,
          [
            {text: 'Cancelar', style: 'cancel'},
            {text: 'Parar', onPress: () => onControlTimer(timer.id, 'stop')},
          ]
        );
        break;
      case 'reset':
        Alert.alert(
          'Reiniciar Timer',
          `Deseja reiniciar o timer "${timer.name}"?`,
          [
            {text: 'Cancelar', style: 'cancel'},
            {text: 'Reiniciar', onPress: () => onControlTimer(timer.id, 'reset')},
          ]
        );
        break;
    }
  };

  const renderTimer = ({item: timer}: {item: CookingTimer}) => {
    const timerColor = getTimerColor(timer);
    const isExpired = timer.remainingTime <= 0 && timer.isActive;

    return (
      <View style={[styles.timerCard, isExpired && styles.expiredTimer]}>
        <View style={styles.timerHeader}>
          <View style={styles.timerInfo}>
            <Ionicons
              name={getTimerIcon(timer) as any}
              size={24}
              color={timerColor}
            />
            <View style={styles.timerDetails}>
              <Text style={styles.timerName}>{timer.name}</Text>
              <Text style={styles.timerDuration}>
                {formatTime(timer.duration)} total
              </Text>
            </View>
          </View>

          <View style={styles.timerActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              onPress={() => handleTimerAction(timer, 'reset')}
            >
              <Ionicons name="refresh" size={16} color={colors.gray[600]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.stopButton]}
              onPress={() => handleTimerAction(timer, 'stop')}
            >
              <Ionicons name="stop" size={16} color={colors.error[600]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.timerDisplay}>
          <Text style={[styles.timeText, {color: timerColor}]}>
            {formatTime(Math.max(0, timer.remainingTime))}
          </Text>
          
          {isExpired && (
            <Text style={styles.expiredText}>TEMPO ESGOTADO!</Text>
          )}
        </View>

        <View style={styles.timerProgress}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.max(0, (timer.remainingTime / timer.duration) * 100)}%`,
                  backgroundColor: timerColor,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.timerControls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.primaryControl,
              {backgroundColor: timerColor},
            ]}
            onPress={() => handleTimerAction(timer, 'toggle')}
          >
            <Ionicons
              name={
                !timer.isActive
                  ? 'play'
                  : timer.isPaused
                  ? 'play'
                  : 'pause'
              }
              size={20}
              color={colors.white}
            />
            <Text style={styles.controlButtonText}>
              {!timer.isActive
                ? 'Iniciar'
                : timer.isPaused
                ? 'Retomar'
                : 'Pausar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const quickTimers = [
    {name: '1 minuto', duration: 60},
    {name: '5 minutos', duration: 300},
    {name: '10 minutos', duration: 600},
    {name: '15 minutos', duration: 900},
    {name: '30 minutos', duration: 1800},
    {name: '1 hora', duration: 3600},
  ];

  return (
    <View style={styles.container}>
      {/* Quick Timers */}
      <View style={styles.quickTimersSection}>
        <Text style={styles.sectionTitle}>Timers Rápidos</Text>
        <View style={styles.quickTimersGrid}>
          {quickTimers.map((quickTimer, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickTimerButton}
              onPress={() => onCreateTimer(quickTimer.name, quickTimer.duration)}
            >
              <Ionicons name="timer-outline" size={20} color={colors.primary[600]} />
              <Text style={styles.quickTimerText}>{quickTimer.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Active Timers */}
      <View style={styles.activeTimersSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Timers Ativos ({timers.length})
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={20} color={colors.primary[600]} />
            <Text style={styles.addButtonText}>Novo</Text>
          </TouchableOpacity>
        </View>

        {timers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="timer-outline" size={48} color={colors.gray[400]} />
            <Text style={styles.emptyText}>Nenhum timer ativo</Text>
            <Text style={styles.emptySubtext}>
              Crie um timer personalizado ou use um dos timers rápidos
            </Text>
          </View>
        ) : (
          <FlatList
            data={timers}
            renderItem={renderTimer}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.timersList}
          />
        )}
      </View>

      {/* Create Timer Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelButton}>Cancelar</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Novo Timer</Text>
            
            <TouchableOpacity onPress={handleCreateTimer}>
              <Text style={styles.createButton}>Criar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Nome do Timer</Text>
              <TextInput
                style={styles.textInput}
                value={newTimerName}
                onChangeText={setNewTimerName}
                placeholder="Ex: Cozinhar macarrão, Assar bolo..."
                autoFocus
              />
            </View>

            <View style={styles.timeInputSection}>
              <Text style={styles.inputLabel}>Duração</Text>
              <View style={styles.timeInputs}>
                <View style={styles.timeInputGroup}>
                  <TextInput
                    style={styles.timeInput}
                    value={newTimerMinutes}
                    onChangeText={setNewTimerMinutes}
                    placeholder="00"
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <Text style={styles.timeLabel}>min</Text>
                </View>

                <Text style={styles.timeSeparator}>:</Text>

                <View style={styles.timeInputGroup}>
                  <TextInput
                    style={styles.timeInput}
                    value={newTimerSeconds}
                    onChangeText={setNewTimerSeconds}
                    placeholder="00"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.timeLabel}>seg</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  quickTimersSection: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  sectionTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  quickTimersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickTimerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary[200],
    gap: spacing.xs,
  },
  quickTimerText: {
    ...typography.caption,
    color: colors.primary[700],
    fontWeight: '500',
  },
  activeTimersSection: {
    flex: 1,
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addButtonText: {
    ...typography.body,
    color: colors.primary[600],
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.subtitle,
    color: colors.gray[600],
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.gray[500],
    textAlign: 'center',
  },
  timersList: {
    gap: spacing.md,
  },
  timerCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  expiredTimer: {
    borderColor: colors.error[300],
    backgroundColor: colors.error[50],
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  timerDetails: {
    flex: 1,
  },
  timerName: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  timerDuration: {
    ...typography.caption,
    color: colors.gray[600],
  },
  timerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: colors.gray[100],
  },
  stopButton: {
    backgroundColor: colors.error[100],
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  expiredText: {
    ...typography.caption,
    color: colors.error[600],
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  timerProgress: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  timerControls: {
    alignItems: 'center',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 24,
    gap: spacing.sm,
  },
  primaryControl: {
    // backgroundColor set dynamically
  },
  controlButtonText: {
    ...typography.button,
    color: colors.white,
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
  cancelButton: {
    ...typography.body,
    color: colors.gray[600],
  },
  modalTitle: {
    ...typography.subtitle,
    fontWeight: '600',
    color: colors.gray[900],
  },
  createButton: {
    ...typography.body,
    color: colors.primary[600],
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.gray[700],
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.gray[900],
  },
  timeInputSection: {
    marginBottom: spacing.xl,
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  timeInputGroup: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 80,
    fontFamily: 'monospace',
  },
  timeLabel: {
    ...typography.caption,
    color: colors.gray[600],
    fontWeight: '500',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.gray[600],
  },
});
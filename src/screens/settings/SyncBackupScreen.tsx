import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Appbar,
  List,
  Text,
  Card,
  Button,
  Chip,
  ProgressBar,
  ActivityIndicator,
  Switch,
  Divider,
} from 'react-native-paper';
import {
  useSyncStatus,
  useSyncSettings,
  useBackup,
  useDeviceManagement,
  useOfflineMode,
} from '../../hooks/useSync';
import { formatSyncTime, formatFileSize } from '../../types/sync';

interface SyncBackupScreenProps {
  navigation: any;
}

const SyncBackupScreen: React.FC<SyncBackupScreenProps> = ({
  navigation,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const {
    status,
    statusColor,
    statusText,
    lastSyncText,
    isLoading: statusLoading,
    sync,
    pauseSync,
    resumeSync,
    isSyncing,
    isPausing,
    isResuming,
    refetch: refetchStatus,
  } = useSyncStatus();

  const {
    settings,
    isLoading: settingsLoading,
    updateSettings,
    isUpdating,
    refetch: refetchSettings,
  } = useSyncSettings();

  const {
    backups,
    isLoading: backupsLoading,
    createBackup,
    isCreating,
    refetch: refetchBackups,
  } = useBackup();

  const {
    devices,
    isLoading: devicesLoading,
    refetch: refetchDevices,
  } = useDeviceManagement();

  const {
    isOnline,
    clearCache,
    refreshCache,
    isClearing,
    isRefreshing,
  } = useOfflineMode();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchStatus(),
        refetchSettings(),
        refetchBackups(),
        refetchDevices(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchStatus, refetchSettings, refetchBackups, refetchDevices]);

  const handleSync = useCallback(async () => {
    const result = await sync({ force: true });
    if (!result.success) {
      // Error já é tratado no hook
    }
  }, [sync]);

  const handleToggleAutoSync = useCallback(async (enabled: boolean) => {
    const result = await updateSettings({ autoSync: enabled });
    if (!result.success) {
      // Error já é tratado no hook
    }
  }, [updateSettings]);

  const handleCreateBackup = useCallback(async () => {
    const result = await createBackup({ type: 'manual', includeImages: true });
    if (!result.success) {
      // Error já é tratado no hook
    }
  }, [createBackup]);

  const getLastBackup = () => {
    if (!backups || backups.length === 0) return null;
    return backups.find(backup => backup.status === 'completed') || backups[0];
  };

  const lastBackup = getLastBackup();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Sincronização e Backup" />
        <Appbar.Action
          icon="help-circle"
          onPress={() => navigation.navigate('SyncHelp')}
        />
      </Appbar.Header>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Status de Conectividade */}
        <Card style={styles.connectivityCard}>
          <Card.Content>
            <View style={styles.connectivityHeader}>
              <Text style={styles.connectivityTitle}>Status da Conexão</Text>
              <Chip
                style={[
                  styles.connectivityChip,
                  { backgroundColor: isOnline ? '#4caf50' : '#f44336' },
                ]}
                textStyle={styles.connectivityChipText}
              >
                {isOnline ? 'Online' : 'Offline'}
              </Chip>
            </View>
            {!isOnline && (
              <Text style={styles.offlineWarning}>
                Algumas funcionalidades podem estar limitadas no modo offline
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Status de Sincronização */}
        <Card style={styles.syncCard}>
          <Card.Content>
            <View style={styles.syncHeader}>
              <Text style={styles.syncTitle}>Sincronização</Text>
              <Chip
                style={[
                  styles.syncStatusChip,
                  { backgroundColor: statusColor },
                ]}
                textStyle={styles.syncStatusChipText}
              >
                {statusText}
              </Chip>
            </View>

            {status && (
              <>
                <Text style={styles.lastSyncText}>
                  Última sincronização: {lastSyncText}
                </Text>

                {status.syncInProgress && (
                  <View style={styles.progressContainer}>
                    <ProgressBar
                      indeterminate
                      style={styles.progressBar}
                      color="#2196f3"
                    />
                    <Text style={styles.progressText}>Sincronizando...</Text>
                  </View>
                )}

                {status.pendingChanges > 0 && (
                  <Text style={styles.pendingText}>
                    {status.pendingChanges} alteração{status.pendingChanges > 1 ? 'ões' : ''} pendente{status.pendingChanges > 1 ? 's' : ''}
                  </Text>
                )}

                {status.conflictsCount > 0 && (
                  <Text style={styles.conflictsText}>
                    {status.conflictsCount} conflito{status.conflictsCount > 1 ? 's' : ''} precisa{status.conflictsCount > 1 ? 'm' : ''} ser resolvido{status.conflictsCount > 1 ? 's' : ''}
                  </Text>
                )}

                <View style={styles.syncActions}>
                  {status.syncInProgress ? (
                    <Button
                      mode="outlined"
                      onPress={pauseSync}
                      disabled={isPausing}
                      loading={isPausing}
                      style={styles.syncButton}
                    >
                      Pausar
                    </Button>
                  ) : (
                    <Button
                      mode="contained"
                      onPress={handleSync}
                      disabled={isSyncing || !isOnline}
                      loading={isSyncing}
                      style={styles.syncButton}
                    >
                      Sincronizar Agora
                    </Button>
                  )}

                  {status.conflictsCount > 0 && (
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('SyncConflicts')}
                      style={styles.syncButton}
                    >
                      Resolver Conflitos
                    </Button>
                  )}
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Configurações de Sincronização */}
        <List.Section>
          <List.Subheader>Configurações</List.Subheader>
          
          <List.Item
            title="Sincronização Automática"
            description="Sincronizar automaticamente em segundo plano"
            left={(props) => <List.Icon {...props} icon="sync" />}
            right={() => (
              <Switch
                value={settings?.autoSync || false}
                onValueChange={handleToggleAutoSync}
                disabled={isUpdating || !isOnline}
              />
            )}
          />

          <List.Item
            title="Configurações Avançadas"
            description="Intervalo, conflitos, dispositivos"
            left={(props) => <List.Icon {...props} icon="cog" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('SyncSettings')}
          />

          <List.Item
            title="Operações de Sincronização"
            description="Ver histórico e operações pendentes"
            left={(props) => <List.Icon {...props} icon="history" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('SyncOperations')}
          />
        </List.Section>

        <Divider />

        {/* Backup */}
        <List.Section>
          <List.Subheader>Backup</List.Subheader>
          
          <Card style={styles.backupCard}>
            <Card.Content>
              <View style={styles.backupHeader}>
                <Text style={styles.backupTitle}>Último Backup</Text>
                <Button
                  mode="contained"
                  onPress={handleCreateBackup}
                  disabled={isCreating || !isOnline}
                  loading={isCreating}
                  style={styles.createBackupButton}
                >
                  Criar Backup
                </Button>
              </View>

              {lastBackup ? (
                <View style={styles.backupInfo}>
                  <Text style={styles.backupDate}>
                    {formatSyncTime(lastBackup.createdAt)}
                  </Text>
                  <Text style={styles.backupSize}>
                    {formatFileSize(lastBackup.size)}
                  </Text>
                  <Text style={styles.backupItems}>
                    {lastBackup.itemsCount.recipes} receitas, {lastBackup.itemsCount.lists} listas, {lastBackup.itemsCount.plans} planejamentos
                  </Text>
                  <Chip
                    style={[
                      styles.backupStatusChip,
                      {
                        backgroundColor:
                          lastBackup.status === 'completed'
                            ? '#4caf50'
                            : lastBackup.status === 'failed'
                            ? '#f44336'
                            : '#ff9800',
                      },
                    ]}
                    textStyle={styles.backupStatusChipText}
                  >
                    {lastBackup.status === 'completed'
                      ? 'Concluído'
                      : lastBackup.status === 'failed'
                      ? 'Falhou'
                      : 'Criando...'}
                  </Chip>
                </View>
              ) : (
                <Text style={styles.noBackupText}>
                  Nenhum backup encontrado
                </Text>
              )}
            </Card.Content>
          </Card>

          <List.Item
            title="Gerenciar Backups"
            description="Ver, baixar e restaurar backups"
            left={(props) => <List.Icon {...props} icon="backup-restore" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('BackupManagement')}
          />

          <List.Item
            title="Configurações de Backup"
            description="Backup automático e frequência"
            left={(props) => <List.Icon {...props} icon="cog-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('BackupSettings')}
          />
        </List.Section>

        <Divider />

        {/* Cache Offline */}
        <List.Section>
          <List.Subheader>Cache Offline</List.Subheader>
          
          <List.Item
            title="Atualizar Cache"
            description="Baixar dados mais recentes para uso offline"
            left={(props) => <List.Icon {...props} icon="download" />}
            right={() => (
              <Button
                mode="outlined"
                onPress={refreshCache}
                disabled={isRefreshing || !isOnline}
                loading={isRefreshing}
              >
                Atualizar
              </Button>
            )}
          />

          <List.Item
            title="Limpar Cache"
            description="Liberar espaço removendo dados offline"
            left={(props) => <List.Icon {...props} icon="delete" />}
            right={() => (
              <Button
                mode="outlined"
                onPress={clearCache}
                disabled={isClearing}
                loading={isClearing}
              >
                Limpar
              </Button>
            )}
          />

          <List.Item
            title="Informações do Cache"
            description="Ver tamanho e conteúdo do cache"
            left={(props) => <List.Icon {...props} icon="information" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('CacheInfo')}
          />
        </List.Section>

        <Divider />

        {/* Dispositivos */}
        <List.Section>
          <List.Subheader>Dispositivos Conectados</List.Subheader>
          
          <List.Item
            title="Gerenciar Dispositivos"
            description={`${devices.length} dispositivo${devices.length !== 1 ? 's' : ''} conectado${devices.length !== 1 ? 's' : ''}`}
            left={(props) => <List.Icon {...props} icon="devices" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('DeviceManagement')}
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
  content: {
    flex: 1,
  },
  connectivityCard: {
    margin: 16,
    elevation: 2,
  },
  connectivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectivityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  connectivityChip: {
    height: 28,
  },
  connectivityChipText: {
    fontSize: 12,
    color: '#fff',
  },
  offlineWarning: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 8,
    fontStyle: 'italic',
  },
  syncCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  syncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  syncStatusChip: {
    height: 28,
  },
  syncStatusChipText: {
    fontSize: 12,
    color: '#fff',
  },
  lastSyncText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    marginVertical: 12,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  pendingText: {
    fontSize: 12,
    color: '#2196f3',
    marginBottom: 4,
  },
  conflictsText: {
    fontSize: 12,
    color: '#ff9800',
    marginBottom: 8,
  },
  syncActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  syncButton: {
    flex: 1,
  },
  backupCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 1,
  },
  backupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  createBackupButton: {
    backgroundColor: '#4caf50',
  },
  backupInfo: {
    gap: 4,
  },
  backupDate: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  backupSize: {
    fontSize: 12,
    color: '#666',
  },
  backupItems: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  backupStatusChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  backupStatusChipText: {
    fontSize: 11,
    color: '#fff',
  },
  noBackupText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default SyncBackupScreen;
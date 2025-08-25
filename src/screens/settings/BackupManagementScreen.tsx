import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Appbar,
  Text,
  Card,
  Button,
  Chip,
  ActivityIndicator,
  Menu,
  FAB,
  Dialog,
  Portal,
  RadioButton,
} from 'react-native-paper';
import { useBackup, useRestore } from '../../hooks/useSync';
import { BackupInfo, formatFileSize, formatSyncTime } from '../../types/sync';

interface BackupManagementScreenProps {
  navigation: any;
}

const BackupManagementScreen: React.FC<BackupManagementScreenProps> = ({
  navigation,
}) => {
  const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [conflictResolution, setConflictResolution] = useState<'skip' | 'replace' | 'merge'>('skip');

  const {
    backups,
    hasMore,
    isLoading,
    isFetching,
    error,
    refetch,
    loadMore,
    createBackup,
    downloadBackup,
    deleteBackup,
    isCreating,
    isDeleting,
  } = useBackup();

  const { restoreBackup, isRestoring } = useRestore();

  const handleCreateBackup = useCallback(async () => {
    const result = await createBackup({
      type: 'manual',
      includeImages: true,
      compression: 'high',
    });
    
    if (!result.success) {
      // Error já é tratado no hook
    }
  }, [createBackup]);

  const handleDownloadBackup = useCallback((backup: BackupInfo) => {
    setMenuVisible(null);
    if (backup.status === 'completed' && backup.downloadUrl) {
      downloadBackup(backup.id, `backup-${backup.id}.zip`);
    } else {
      Alert.alert('Erro', 'Este backup não está disponível para download');
    }
  }, [downloadBackup]);

  const handleDeleteBackup = useCallback((backupId: string) => {
    setMenuVisible(null);
    deleteBackup(backupId);
  }, [deleteBackup]);

  const handleRestoreBackup = useCallback(async () => {
    if (!selectedBackup) return;

    setShowRestoreDialog(false);
    
    const result = await restoreBackup({
      backupId: selectedBackup.id,
      conflictResolution,
      restoreImages: true,
    });

    setSelectedBackup(null);
  }, [selectedBackup, conflictResolution, restoreBackup]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'creating':
        return '#ff9800';
      case 'failed':
        return '#f44336';
      case 'expired':
        return '#9e9e9e';
      default:
        return '#2196f3';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'creating':
        return 'Criando...';
      case 'failed':
        return 'Falhou';
      case 'expired':
        return 'Expirado';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'manual' ? 'Manual' : 'Automático';
  };

  const isBackupExpired = (backup: BackupInfo) => {
    if (!backup.expiresAt) return false;
    return new Date(backup.expiresAt) < new Date();
  };

  const renderBackup = useCallback(({ item }: { item: BackupInfo }) => (
    <Card style={[
      styles.backupCard,
      isBackupExpired(item) && styles.expiredCard,
    ]}>
      <Card.Content>
        <View style={styles.backupHeader}>
          <View style={styles.backupInfo}>
            <Text style={styles.backupDate}>
              {formatSyncTime(item.createdAt)}
            </Text>
            <View style={styles.backupChips}>
              <Chip
                style={[
                  styles.typeChip,
                  { backgroundColor: item.type === 'manual' ? '#2196f3' : '#4caf50' },
                ]}
                textStyle={styles.chipText}
              >
                {getTypeLabel(item.type)}
              </Chip>
              <Chip
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
                textStyle={styles.chipText}
              >
                {getStatusLabel(item.status)}
              </Chip>
            </View>
          </View>

          <Menu
            visible={menuVisible === item.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <Button
                mode="text"
                onPress={() => setMenuVisible(item.id)}
                disabled={isDeleting}
              >
                ⋮
              </Button>
            }
          >
            {item.status === 'completed' && (
              <>
                <Menu.Item
                  onPress={() => handleDownloadBackup(item)}
                  title="Baixar"
                  leadingIcon="download"
                />
                <Menu.Item
                  onPress={() => {
                    setSelectedBackup(item);
                    setShowRestoreDialog(true);
                    setMenuVisible(null);
                  }}
                  title="Restaurar"
                  leadingIcon="restore"
                />
              </>
            )}
            <Menu.Item
              onPress={() => handleDeleteBackup(item.id)}
              title="Deletar"
              leadingIcon="delete"
            />
          </Menu>
        </View>

        <View style={styles.backupDetails}>
          <Text style={styles.backupSize}>
            Tamanho: {formatFileSize(item.size)}
          </Text>
          
          <View style={styles.itemsCount}>
            <Text style={styles.itemsText}>
              {item.itemsCount.recipes} receitas • {item.itemsCount.lists} listas • {item.itemsCount.plans} planejamentos
            </Text>
          </View>

          {item.completedAt && (
            <Text style={styles.completedText}>
              Concluído em {formatSyncTime(item.completedAt)}
            </Text>
          )}

          {item.expiresAt && (
            <Text style={[
              styles.expiresText,
              isBackupExpired(item) && styles.expiredText,
            ]}>
              {isBackupExpired(item) ? 'Expirado' : `Expira em ${formatSyncTime(item.expiresAt)}`}
            </Text>
          )}

          {item.error && (
            <Text style={styles.errorText}>
              Erro: {item.error}
            </Text>
          )}
        </View>

        {item.status === 'completed' && !isBackupExpired(item) && (
          <View style={styles.backupActions}>
            <Button
              mode="outlined"
              onPress={() => handleDownloadBackup(item)}
              style={styles.actionButton}
            >
              Baixar
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setSelectedBackup(item);
                setShowRestoreDialog(true);
              }}
              style={styles.actionButton}
            >
              Restaurar
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  ), [menuVisible, isDeleting, handleDownloadBackup, handleDeleteBackup]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Carregando backups...</Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>Nenhum backup encontrado</Text>
        <Text style={styles.emptyDescription}>
          Crie seu primeiro backup para proteger seus dados
        </Text>
        <Button
          mode="contained"
          onPress={handleCreateBackup}
          disabled={isCreating}
          loading={isCreating}
          style={styles.createFirstBackupButton}
        >
          Criar Primeiro Backup
        </Button>
      </View>
    );
  }, [isLoading, handleCreateBackup, isCreating]);

  const renderFooter = useCallback(() => {
    if (!isFetching || !hasMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingMoreText}>Carregando mais...</Text>
      </View>
    );
  }, [isFetching, hasMore]);

  const renderHeader = useCallback(() => (
    <Card style={styles.headerCard}>
      <Card.Content>
        <Text style={styles.headerTitle}>Gerenciar Backups</Text>
        <Text style={styles.headerDescription}>
          Seus backups são mantidos por 30 dias. Baixe-os para armazenamento permanente.
        </Text>
      </Card.Content>
    </Card>
  ), []);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Gerenciar Backups" />
        <Appbar.Action
          icon="help-circle"
          onPress={() => navigation.navigate('BackupHelp')}
        />
      </Appbar.Header>

      <FlatList
        data={backups}
        renderItem={renderBackup}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refetch}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateBackup}
        disabled={isCreating}
        loading={isCreating}
      />

      {/* Dialog de Restauração */}
      <Portal>
        <Dialog
          visible={showRestoreDialog}
          onDismiss={() => setShowRestoreDialog(false)}
        >
          <Dialog.Title>Restaurar Backup</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogDescription}>
              Como tratar conflitos com dados existentes?
            </Text>
            
            <RadioButton.Group
              onValueChange={(value) => setConflictResolution(value as any)}
              value={conflictResolution}
            >
              <View style={styles.radioOption}>
                <RadioButton value="skip" />
                <View style={styles.radioContent}>
                  <Text style={styles.radioTitle}>Pular conflitos</Text>
                  <Text style={styles.radioDescription}>
                    Manter dados existentes quando houver conflito
                  </Text>
                </View>
              </View>
              
              <View style={styles.radioOption}>
                <RadioButton value="replace" />
                <View style={styles.radioContent}>
                  <Text style={styles.radioTitle}>Substituir dados</Text>
                  <Text style={styles.radioDescription}>
                    Substituir dados existentes pelos do backup
                  </Text>
                </View>
              </View>
              
              <View style={styles.radioOption}>
                <RadioButton value="merge" />
                <View style={styles.radioContent}>
                  <Text style={styles.radioTitle}>Mesclar dados</Text>
                  <Text style={styles.radioDescription}>
                    Combinar dados quando possível
                  </Text>
                </View>
              </View>
            </RadioButton.Group>

            <Text style={styles.warningText}>
              ⚠️ Esta ação pode alterar seus dados atuais. Considere fazer um backup antes de restaurar.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowRestoreDialog(false)}>
              Cancelar
            </Button>
            <Button
              onPress={handleRestoreBackup}
              disabled={isRestoring}
              loading={isRestoring}
            >
              Restaurar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  backupCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    elevation: 1,
  },
  expiredCard: {
    opacity: 0.6,
  },
  backupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  backupInfo: {
    flex: 1,
  },
  backupDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  backupChips: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    height: 24,
  },
  statusChip: {
    height: 24,
  },
  chipText: {
    fontSize: 11,
    color: '#fff',
  },
  backupDetails: {
    gap: 4,
    marginBottom: 12,
  },
  backupSize: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  itemsCount: {
    marginVertical: 4,
  },
  itemsText: {
    fontSize: 12,
    color: '#666',
  },
  completedText: {
    fontSize: 12,
    color: '#4caf50',
  },
  expiresText: {
    fontSize: 12,
    color: '#ff9800',
  },
  expiredText: {
    color: '#f44336',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    fontStyle: 'italic',
  },
  backupActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  createFirstBackupButton: {
    backgroundColor: '#4caf50',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#4caf50',
  },
  dialogDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  radioContent: {
    flex: 1,
    marginLeft: 8,
  },
  radioTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  radioDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  warningText: {
    fontSize: 12,
    color: '#ff9800',
    marginTop: 16,
    padding: 8,
    backgroundColor: '#fff3e0',
    borderRadius: 4,
  },
});

export default BackupManagementScreen;
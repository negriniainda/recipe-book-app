import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Appbar,
  Text,
  Card,
  Button,
  Chip,
  ActivityIndicator,
  Menu,
  Dialog,
  Portal,
  RadioButton,
} from 'react-native-paper';
import { useSyncConflicts } from '../../hooks/useSync';
import { SyncConflict } from '../../types/sync';

interface SyncConflictsScreenProps {
  navigation: any;
}

const SyncConflictsScreen: React.FC<SyncConflictsScreenProps> = ({
  navigation,
}) => {
  const [selectedConflict, setSelectedConflict] = useState<SyncConflict | null>(null);
  const [showResolutionDialog, setShowResolutionDialog] = useState(false);
  const [resolution, setResolution] = useState<'local' | 'remote' | 'merge'>('local');
  const [bulkMenuVisible, setBulkMenuVisible] = useState(false);

  const {
    conflicts,
    hasMore,
    isLoading,
    isFetching,
    error,
    refetch,
    loadMore,
    resolveConflict,
    resolveAllConflicts,
    isResolving,
    isResolvingAll,
  } = useSyncConflicts();

  const handleResolveConflict = useCallback(async () => {
    if (!selectedConflict) return;

    const result = await resolveConflict({
      conflictId: selectedConflict.id,
      resolution,
    });

    if (result.success) {
      setShowResolutionDialog(false);
      setSelectedConflict(null);
    }
  }, [selectedConflict, resolution, resolveConflict]);

  const handleBulkResolve = useCallback((resolution: 'local' | 'remote' | 'newest') => {
    setBulkMenuVisible(false);
    resolveAllConflicts(resolution);
  }, [resolveAllConflicts]);

  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case 'recipe':
        return 'Receita';
      case 'list':
        return 'Lista';
      case 'plan':
        return 'Planejamento';
      case 'profile':
        return 'Perfil';
      default:
        return entityType;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const renderConflict = useCallback(({ item }: { item: SyncConflict }) => (
    <Card style={styles.conflictCard}>
      <Card.Content>
        <View style={styles.conflictHeader}>
          <View style={styles.conflictInfo}>
            <Text style={styles.conflictTitle}>
              {getEntityTypeLabel(item.entityType)}
            </Text>
            <Chip
              style={styles.entityTypeChip}
              textStyle={styles.entityTypeChipText}
            >
              ID: {item.entityId.substring(0, 8)}...
            </Chip>
          </View>
        </View>

        <Text style={styles.conflictDescription}>
          Conflito entre versão local e remota
        </Text>

        <View style={styles.versionsContainer}>
          <View style={styles.versionInfo}>
            <Text style={styles.versionTitle}>Versão Local</Text>
            <Text style={styles.versionTimestamp}>
              {formatTimestamp(item.localTimestamp)}
            </Text>
          </View>
          
          <View style={styles.versionInfo}>
            <Text style={styles.versionTitle}>Versão Remota</Text>
            <Text style={styles.versionTimestamp}>
              {formatTimestamp(item.remoteTimestamp)}
            </Text>
          </View>
        </View>

        {item.conflictFields.length > 0 && (
          <View style={styles.conflictFields}>
            <Text style={styles.fieldsTitle}>Campos em conflito:</Text>
            <View style={styles.fieldsContainer}>
              {item.conflictFields.map((field, index) => (
                <Chip
                  key={index}
                  style={styles.fieldChip}
                  textStyle={styles.fieldChipText}
                >
                  {field}
                </Chip>
              ))}
            </View>
          </View>
        )}

        <View style={styles.conflictActions}>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedConflict(item);
              setShowResolutionDialog(true);
            }}
            disabled={isResolving}
            style={styles.resolveButton}
          >
            Resolver
          </Button>
          
          <Button
            mode="text"
            onPress={() => navigation.navigate('ConflictDetail', { conflictId: item.id })}
            style={styles.detailButton}
          >
            Ver Detalhes
          </Button>
        </View>
      </Card.Content>
    </Card>
  ), [navigation, isResolving]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Carregando conflitos...</Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>Nenhum conflito encontrado</Text>
        <Text style={styles.emptyDescription}>
          Todos os seus dados estão sincronizados corretamente!
        </Text>
      </View>
    );
  }, [isLoading]);

  const renderFooter = useCallback(() => {
    if (!isFetching || !hasMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingMoreText}>Carregando mais...</Text>
      </View>
    );
  }, [isFetching, hasMore]);

  const renderHeader = useCallback(() => {
    if (conflicts.length === 0) return null;

    return (
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text style={styles.headerTitle}>
            {conflicts.length} conflito{conflicts.length > 1 ? 's' : ''} encontrado{conflicts.length > 1 ? 's' : ''}
          </Text>
          <Text style={styles.headerDescription}>
            Resolva os conflitos para continuar a sincronização
          </Text>
          
          <Menu
            visible={bulkMenuVisible}
            onDismiss={() => setBulkMenuVisible(false)}
            anchor={
              <Button
                mode="contained"
                onPress={() => setBulkMenuVisible(true)}
                disabled={isResolvingAll}
                loading={isResolvingAll}
                style={styles.bulkResolveButton}
              >
                Resolver Todos
              </Button>
            }
          >
            <Menu.Item
              onPress={() => handleBulkResolve('local')}
              title="Manter versão local"
              leadingIcon="laptop"
            />
            <Menu.Item
              onPress={() => handleBulkResolve('remote')}
              title="Usar versão do servidor"
              leadingIcon="cloud"
            />
            <Menu.Item
              onPress={() => handleBulkResolve('newest')}
              title="Usar versão mais recente"
              leadingIcon="clock"
            />
          </Menu>
        </Card.Content>
      </Card>
    );
  }, [conflicts, bulkMenuVisible, isResolvingAll, handleBulkResolve]);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Conflitos de Sincronização" />
        <Appbar.Action
          icon="help-circle"
          onPress={() => navigation.navigate('ConflictsHelp')}
        />
      </Appbar.Header>

      <FlatList
        data={conflicts}
        renderItem={renderConflict}
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

      {/* Dialog de Resolução */}
      <Portal>
        <Dialog
          visible={showResolutionDialog}
          onDismiss={() => setShowResolutionDialog(false)}
        >
          <Dialog.Title>Resolver Conflito</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogDescription}>
              Como você gostaria de resolver este conflito?
            </Text>
            
            <RadioButton.Group
              onValueChange={(value) => setResolution(value as any)}
              value={resolution}
            >
              <View style={styles.radioOption}>
                <RadioButton value="local" />
                <View style={styles.radioContent}>
                  <Text style={styles.radioTitle}>Manter versão local</Text>
                  <Text style={styles.radioDescription}>
                    Usar as alterações feitas neste dispositivo
                  </Text>
                </View>
              </View>
              
              <View style={styles.radioOption}>
                <RadioButton value="remote" />
                <View style={styles.radioContent}>
                  <Text style={styles.radioTitle}>Usar versão do servidor</Text>
                  <Text style={styles.radioDescription}>
                    Aceitar as alterações do servidor
                  </Text>
                </View>
              </View>
              
              <View style={styles.radioOption}>
                <RadioButton value="merge" />
                <View style={styles.radioContent}>
                  <Text style={styles.radioTitle}>Mesclar versões</Text>
                  <Text style={styles.radioDescription}>
                    Combinar alterações quando possível
                  </Text>
                </View>
              </View>
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowResolutionDialog(false)}>
              Cancelar
            </Button>
            <Button
              onPress={handleResolveConflict}
              disabled={isResolving}
              loading={isResolving}
            >
              Resolver
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
    paddingBottom: 16,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    backgroundColor: '#fff3e0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f57c00',
    marginBottom: 4,
  },
  headerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  bulkResolveButton: {
    backgroundColor: '#ff9800',
  },
  conflictCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    elevation: 1,
  },
  conflictHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conflictInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conflictTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  entityTypeChip: {
    backgroundColor: '#e3f2fd',
    height: 24,
  },
  entityTypeChipText: {
    fontSize: 11,
    color: '#1976d2',
  },
  conflictDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  versionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  versionInfo: {
    flex: 1,
    paddingHorizontal: 8,
  },
  versionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  versionTimestamp: {
    fontSize: 11,
    color: '#666',
  },
  conflictFields: {
    marginBottom: 12,
  },
  fieldsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  fieldsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  fieldChip: {
    backgroundColor: '#ffebee',
    height: 20,
  },
  fieldChipText: {
    fontSize: 10,
    color: '#d32f2f',
  },
  conflictActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  resolveButton: {
    flex: 1,
  },
  detailButton: {
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
});

export default SyncConflictsScreen;
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Alert, AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {
  useGetSyncStatusQuery,
  useInitiateSyncMutation,
  usePauseSyncMutation,
  useResumeSyncMutation,
  useGetSyncOperationsQuery,
  useRetryOperationMutation,
  useGetSyncConflictsQuery,
  useResolveConflictMutation,
  useResolveAllConflictsMutation,
  useGetSyncSettingsQuery,
  useUpdateSyncSettingsMutation,
  useGetBackupsQuery,
  useCreateBackupMutation,
  useLazyDownloadBackupQuery,
  useDeleteBackupMutation,
  useRestoreBackupMutation,
  useGetDevicesQuery,
  useUpdateDeviceNameMutation,
  useRemoveDeviceMutation,
  useGetSyncStatsQuery,
  useClearCacheMutation,
  useRefreshCacheMutation,
  useCheckConnectivityQuery,
  useForceSyncEntityMutation,
  useResetSyncMutation,
} from '../services/syncApi';
import {
  InitiateSyncRequest,
  CreateBackupRequest,
  RestoreBackupRequest,
  ResolveConflictRequest,
  UpdateSyncSettingsRequest,
  getSyncStatusColor,
  getSyncStatusText,
  formatSyncTime,
  formatFileSize,
} from '../types/sync';

export const useSyncStatus = () => {
  const {
    data: status,
    isLoading,
    error,
    refetch,
  } = useGetSyncStatusQuery(undefined, {
    pollingInterval: 30000, // Poll a cada 30 segundos
    refetchOnMountOrArgChange: true,
  });

  const [initiateSync, { isLoading: isSyncing }] = useInitiateSyncMutation();
  const [pauseSync, { isLoading: isPausing }] = usePauseSyncMutation();
  const [resumeSync, { isLoading: isResuming }] = useResumeSyncMutation();

  const handleSync = useCallback(async (options: InitiateSyncRequest = {}) => {
    try {
      const result = await initiateSync(options).unwrap();
      return { success: true, message: result.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao iniciar sincronização',
      };
    }
  }, [initiateSync]);

  const handlePauseSync = useCallback(async () => {
    try {
      await pauseSync().unwrap();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao pausar sincronização',
      };
    }
  }, [pauseSync]);

  const handleResumeSync = useCallback(async () => {
    try {
      await resumeSync().unwrap();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao retomar sincronização',
      };
    }
  }, [resumeSync]);

  const statusColor = useMemo(() => {
    return status ? getSyncStatusColor(status) : '#666';
  }, [status]);

  const statusText = useMemo(() => {
    return status ? getSyncStatusText(status) : 'Carregando...';
  }, [status]);

  const lastSyncText = useMemo(() => {
    return status ? formatSyncTime(status.lastSyncTime) : 'Nunca';
  }, [status]);

  return {
    status,
    statusColor,
    statusText,
    lastSyncText,
    isLoading,
    error,
    refetch,
    sync: handleSync,
    pauseSync: handlePauseSync,
    resumeSync: handleResumeSync,
    isSyncing,
    isPausing,
    isResuming,
  };
};

export const useSyncOperations = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetSyncOperationsQuery(
    { page, limit: 20, status: statusFilter },
    { refetchOnMountOrArgChange: true }
  );

  const [retryOperation, { isLoading: isRetrying }] = useRetryOperationMutation();

  const operations = useMemo(() => data?.operations || [], [data]);
  const hasMore = useMemo(() => data?.hasMore || false, [data]);

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isFetching]);

  const handleRetryOperation = useCallback(async (operationId: string) => {
    try {
      await retryOperation(operationId).unwrap();
      Alert.alert('Sucesso', 'Operação reenviada para sincronização');
      return { success: true };
    } catch (error: any) {
      Alert.alert('Erro', error.data?.message || 'Erro ao retentar operação');
      return {
        success: false,
        error: error.data?.message || 'Erro ao retentar operação',
      };
    }
  }, [retryOperation]);

  const setFilter = useCallback((status: string | undefined) => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  return {
    operations,
    hasMore,
    isLoading,
    isFetching,
    error,
    refetch,
    loadMore,
    retryOperation: handleRetryOperation,
    isRetrying,
    statusFilter,
    setFilter,
  };
};

export const useSyncConflicts = () => {
  const [page, setPage] = useState(1);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetSyncConflictsQuery(
    { page, limit: 20 },
    { refetchOnMountOrArgChange: true }
  );

  const [resolveConflict, { isLoading: isResolving }] = useResolveConflictMutation();
  const [resolveAllConflicts, { isLoading: isResolvingAll }] = useResolveAllConflictsMutation();

  const conflicts = useMemo(() => data?.conflicts || [], [data]);
  const hasMore = useMemo(() => data?.hasMore || false, [data]);

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isFetching]);

  const handleResolveConflict = useCallback(async (data: ResolveConflictRequest) => {
    try {
      await resolveConflict(data).unwrap();
      Alert.alert('Sucesso', 'Conflito resolvido com sucesso');
      return { success: true };
    } catch (error: any) {
      Alert.alert('Erro', error.data?.message || 'Erro ao resolver conflito');
      return {
        success: false,
        error: error.data?.message || 'Erro ao resolver conflito',
      };
    }
  }, [resolveConflict]);

  const handleResolveAllConflicts = useCallback(async (
    resolution: 'local' | 'remote' | 'newest'
  ) => {
    const resolutionLabels = {
      local: 'versão local',
      remote: 'versão do servidor',
      newest: 'versão mais recente',
    };

    Alert.alert(
      'Resolver Todos os Conflitos',
      `Tem certeza que deseja resolver todos os conflitos usando a ${resolutionLabels[resolution]}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const result = await resolveAllConflicts({ resolution }).unwrap();
              Alert.alert(
                'Sucesso',
                `${result.resolved} conflito${result.resolved > 1 ? 's' : ''} resolvido${result.resolved > 1 ? 's' : ''}`
              );
            } catch (error: any) {
              Alert.alert('Erro', error.data?.message || 'Erro ao resolver conflitos');
            }
          },
        },
      ]
    );
  }, [resolveAllConflicts]);

  return {
    conflicts,
    hasMore,
    isLoading,
    isFetching,
    error,
    refetch,
    loadMore,
    resolveConflict: handleResolveConflict,
    resolveAllConflicts: handleResolveAllConflicts,
    isResolving,
    isResolvingAll,
  };
};

export const useSyncSettings = () => {
  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useGetSyncSettingsQuery();

  const [updateSettings, { isLoading: isUpdating }] = useUpdateSyncSettingsMutation();

  const handleUpdateSettings = useCallback(async (data: UpdateSyncSettingsRequest) => {
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

  return {
    settings,
    isLoading,
    error,
    refetch,
    updateSettings: handleUpdateSettings,
    isUpdating,
  };
};

export const useBackup = () => {
  const [page, setPage] = useState(1);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetBackupsQuery(
    { page, limit: 20 },
    { refetchOnMountOrArgChange: true }
  );

  const [createBackup, { isLoading: isCreating }] = useCreateBackupMutation();
  const [downloadBackup] = useLazyDownloadBackupQuery();
  const [deleteBackup, { isLoading: isDeleting }] = useDeleteBackupMutation();

  const backups = useMemo(() => data?.backups || [], [data]);
  const hasMore = useMemo(() => data?.hasMore || false, [data]);

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isFetching]);

  const handleCreateBackup = useCallback(async (data: CreateBackupRequest) => {
    try {
      const result = await createBackup(data).unwrap();
      Alert.alert(
        'Backup Iniciado',
        'Seu backup está sendo criado. Você receberá uma notificação quando estiver pronto.'
      );
      return { success: true, backup: result };
    } catch (error: any) {
      Alert.alert('Erro', error.data?.message || 'Erro ao criar backup');
      return {
        success: false,
        error: error.data?.message || 'Erro ao criar backup',
      };
    }
  }, [createBackup]);

  const handleDownloadBackup = useCallback(async (backupId: string, filename: string) => {
    try {
      const result = await downloadBackup(backupId).unwrap();
      // Implementar download do arquivo
      // Por enquanto, apenas mostrar sucesso
      Alert.alert('Download Iniciado', 'O download do backup foi iniciado');
      return { success: true };
    } catch (error: any) {
      Alert.alert('Erro', error.data?.message || 'Erro ao baixar backup');
      return {
        success: false,
        error: error.data?.message || 'Erro ao baixar backup',
      };
    }
  }, [downloadBackup]);

  const handleDeleteBackup = useCallback(async (backupId: string) => {
    Alert.alert(
      'Deletar Backup',
      'Tem certeza que deseja deletar este backup? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBackup(backupId).unwrap();
              Alert.alert('Sucesso', 'Backup deletado com sucesso');
            } catch (error: any) {
              Alert.alert('Erro', error.data?.message || 'Erro ao deletar backup');
            }
          },
        },
      ]
    );
  }, [deleteBackup]);

  return {
    backups,
    hasMore,
    isLoading,
    isFetching,
    error,
    refetch,
    loadMore,
    createBackup: handleCreateBackup,
    downloadBackup: handleDownloadBackup,
    deleteBackup: handleDeleteBackup,
    isCreating,
    isDeleting,
  };
};

export const useRestore = () => {
  const [restoreBackup, { isLoading: isRestoring }] = useRestoreBackupMutation();

  const handleRestoreBackup = useCallback(async (data: RestoreBackupRequest) => {
    Alert.alert(
      'Restaurar Backup',
      'ATENÇÃO: Esta ação irá substituir seus dados atuais. Tem certeza que deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await restoreBackup(data).unwrap();
              Alert.alert(
                'Restauração Iniciada',
                'Seus dados estão sendo restaurados. Você receberá uma notificação quando o processo for concluído.'
              );
              return { success: true, restore: result };
            } catch (error: any) {
              Alert.alert('Erro', error.data?.message || 'Erro ao restaurar backup');
              return {
                success: false,
                error: error.data?.message || 'Erro ao restaurar backup',
              };
            }
          },
        },
      ]
    );
  }, [restoreBackup]);

  return {
    restoreBackup: handleRestoreBackup,
    isRestoring,
  };
};

export const useDeviceManagement = () => {
  const {
    data: devices,
    isLoading,
    error,
    refetch,
  } = useGetDevicesQuery();

  const [updateDeviceName, { isLoading: isUpdating }] = useUpdateDeviceNameMutation();
  const [removeDevice, { isLoading: isRemoving }] = useRemoveDeviceMutation();

  const handleUpdateDeviceName = useCallback(async (deviceId: string, name: string) => {
    try {
      await updateDeviceName({ deviceId, name }).unwrap();
      Alert.alert('Sucesso', 'Nome do dispositivo atualizado');
      return { success: true };
    } catch (error: any) {
      Alert.alert('Erro', error.data?.message || 'Erro ao atualizar nome');
      return {
        success: false,
        error: error.data?.message || 'Erro ao atualizar nome',
      };
    }
  }, [updateDeviceName]);

  const handleRemoveDevice = useCallback(async (deviceId: string, deviceName: string) => {
    Alert.alert(
      'Remover Dispositivo',
      `Tem certeza que deseja remover "${deviceName}" da sua conta?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeDevice(deviceId).unwrap();
              Alert.alert('Sucesso', 'Dispositivo removido da conta');
            } catch (error: any) {
              Alert.alert('Erro', error.data?.message || 'Erro ao remover dispositivo');
            }
          },
        },
      ]
    );
  }, [removeDevice]);

  return {
    devices: devices || [],
    isLoading,
    error,
    refetch,
    updateDeviceName: handleUpdateDeviceName,
    removeDevice: handleRemoveDevice,
    isUpdating,
    isRemoving,
  };
};

export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [clearCache, { isLoading: isClearing }] = useClearCacheMutation();
  const [refreshCache, { isLoading: isRefreshing }] = useRefreshCacheMutation();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return unsubscribe;
  }, []);

  const handleClearCache = useCallback(async () => {
    Alert.alert(
      'Limpar Cache',
      'Tem certeza que deseja limpar o cache offline? Você precisará estar online para acessar seus dados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          onPress: async () => {
            try {
              await clearCache().unwrap();
              Alert.alert('Sucesso', 'Cache limpo com sucesso');
            } catch (error: any) {
              Alert.alert('Erro', error.data?.message || 'Erro ao limpar cache');
            }
          },
        },
      ]
    );
  }, [clearCache]);

  const handleRefreshCache = useCallback(async () => {
    try {
      await refreshCache().unwrap();
      Alert.alert('Sucesso', 'Cache atualizado com sucesso');
      return { success: true };
    } catch (error: any) {
      Alert.alert('Erro', error.data?.message || 'Erro ao atualizar cache');
      return {
        success: false,
        error: error.data?.message || 'Erro ao atualizar cache',
      };
    }
  }, [refreshCache]);

  return {
    isOnline,
    clearCache: handleClearCache,
    refreshCache: handleRefreshCache,
    isClearing,
    isRefreshing,
  };
};

export const useAutoSync = () => {
  const { settings, updateSettings } = useSyncSettings();
  const { status, sync } = useSyncStatus();

  useEffect(() => {
    if (!settings?.autoSync) return;

    const interval = setInterval(() => {
      if (status?.isOnline && !status?.syncInProgress) {
        sync({ force: false });
      }
    }, settings.syncInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [settings, status, sync]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && settings?.autoSync) {
        // Sincronizar quando o app voltar ao primeiro plano
        if (status?.isOnline && !status?.syncInProgress) {
          sync({ force: false });
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [settings, status, sync]);

  return {
    autoSyncEnabled: settings?.autoSync || false,
    syncInterval: settings?.syncInterval || 60,
  };
};
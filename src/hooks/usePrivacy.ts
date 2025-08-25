import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import {
  useGetPrivacySettingsQuery,
  useUpdatePrivacySettingsMutation,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useGetRecipePrivacySettingsQuery,
  useUpdateRecipePrivacyMutation,
  useBulkUpdateRecipePrivacyMutation,
  useGetBlockedUsersQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useGetDataExportsQuery,
  useRequestDataExportMutation,
  useLazyDownloadDataExportQuery,
  useDeleteDataExportMutation,
  useGetAccountDeletionRequestQuery,
  useRequestAccountDeletionMutation,
  useCancelAccountDeletionMutation,
  useGetPrivacyReportQuery,
  useSetAllRecipesPrivateMutation,
  useSetAllRecipesPublicMutation,
  useDisableAllNotificationsMutation,
  useEnableEssentialNotificationsMutation,
} from '../services/privacyApi';
import {
  UpdatePrivacySettingsRequest,
  UpdateNotificationSettingsRequest,
  UpdateRecipePrivacyRequest,
  BlockUserRequest,
  RequestDataExportRequest,
  RequestAccountDeletionRequest,
} from '../types/privacy';

export const usePrivacySettings = () => {
  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useGetPrivacySettingsQuery();

  const [updateSettings, { isLoading: isUpdating }] = useUpdatePrivacySettingsMutation();

  const handleUpdateSettings = useCallback(async (data: UpdatePrivacySettingsRequest) => {
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

export const useNotificationSettings = () => {
  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useGetNotificationSettingsQuery();

  const [updateSettings, { isLoading: isUpdating }] = useUpdateNotificationSettingsMutation();
  const [disableAll, { isLoading: isDisabling }] = useDisableAllNotificationsMutation();
  const [enableEssential, { isLoading: isEnabling }] = useEnableEssentialNotificationsMutation();

  const handleUpdateSettings = useCallback(async (data: UpdateNotificationSettingsRequest) => {
    try {
      const result = await updateSettings(data).unwrap();
      return { success: true, settings: result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao atualizar notificações',
      };
    }
  }, [updateSettings]);

  const handleDisableAll = useCallback(async () => {
    try {
      const result = await disableAll().unwrap();
      Alert.alert(
        'Sucesso',
        'Todas as notificações foram desabilitadas'
      );
      return { success: true, settings: result };
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.data?.message || 'Erro ao desabilitar notificações'
      );
      return {
        success: false,
        error: error.data?.message || 'Erro ao desabilitar notificações',
      };
    }
  }, [disableAll]);

  const handleEnableEssential = useCallback(async () => {
    try {
      const result = await enableEssential().unwrap();
      Alert.alert(
        'Sucesso',
        'Notificações essenciais foram habilitadas'
      );
      return { success: true, settings: result };
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.data?.message || 'Erro ao habilitar notificações'
      );
      return {
        success: false,
        error: error.data?.message || 'Erro ao habilitar notificações',
      };
    }
  }, [enableEssential]);

  return {
    settings,
    isLoading,
    error,
    refetch,
    updateSettings: handleUpdateSettings,
    disableAllNotifications: handleDisableAll,
    enableEssentialNotifications: handleEnableEssential,
    isUpdating,
    isDisabling,
    isEnabling,
  };
};

export const useRecipePrivacy = () => {
  const [page, setPage] = useState(1);
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetRecipePrivacySettingsQuery({ page, limit: 50 });

  const [updateRecipe, { isLoading: isUpdatingRecipe }] = useUpdateRecipePrivacyMutation();
  const [bulkUpdate, { isLoading: isBulkUpdating }] = useBulkUpdateRecipePrivacyMutation();
  const [makeAllPrivate, { isLoading: isMakingPrivate }] = useSetAllRecipesPrivateMutation();
  const [makeAllPublic, { isLoading: isMakingPublic }] = useSetAllRecipesPublicMutation();

  const recipes = useMemo(() => data || [], [data]);

  const handleUpdateRecipe = useCallback(async (data: UpdateRecipePrivacyRequest) => {
    try {
      const result = await updateRecipe(data).unwrap();
      return { success: true, recipe: result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao atualizar receita',
      };
    }
  }, [updateRecipe]);

  const handleBulkUpdate = useCallback(async (
    recipeIds: string[],
    settings: Omit<UpdateRecipePrivacyRequest, 'recipeId'>
  ) => {
    try {
      const result = await bulkUpdate({ recipeIds, settings }).unwrap();
      Alert.alert(
        'Sucesso',
        `${result.updated} receita${result.updated > 1 ? 's' : ''} atualizada${result.updated > 1 ? 's' : ''}`
      );
      return { success: true, updated: result.updated };
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.data?.message || 'Erro ao atualizar receitas'
      );
      return {
        success: false,
        error: error.data?.message || 'Erro ao atualizar receitas',
      };
    }
  }, [bulkUpdate]);

  const handleMakeAllPrivate = useCallback(async () => {
    Alert.alert(
      'Confirmar Ação',
      'Tem certeza que deseja tornar todas as suas receitas privadas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await makeAllPrivate().unwrap();
              Alert.alert(
                'Sucesso',
                `${result.updated} receita${result.updated > 1 ? 's' : ''} tornada${result.updated > 1 ? 's' : ''} privada${result.updated > 1 ? 's' : ''}`
              );
            } catch (error: any) {
              Alert.alert(
                'Erro',
                error.data?.message || 'Erro ao atualizar receitas'
              );
            }
          },
        },
      ]
    );
  }, [makeAllPrivate]);

  const handleMakeAllPublic = useCallback(async () => {
    Alert.alert(
      'Confirmar Ação',
      'Tem certeza que deseja tornar todas as suas receitas públicas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const result = await makeAllPublic().unwrap();
              Alert.alert(
                'Sucesso',
                `${result.updated} receita${result.updated > 1 ? 's' : ''} tornada${result.updated > 1 ? 's' : ''} pública${result.updated > 1 ? 's' : ''}`
              );
            } catch (error: any) {
              Alert.alert(
                'Erro',
                error.data?.message || 'Erro ao atualizar receitas'
              );
            }
          },
        },
      ]
    );
  }, [makeAllPublic]);

  return {
    recipes,
    isLoading,
    isFetching,
    error,
    refetch,
    updateRecipe: handleUpdateRecipe,
    bulkUpdate: handleBulkUpdate,
    makeAllPrivate: handleMakeAllPrivate,
    makeAllPublic: handleMakeAllPublic,
    isUpdatingRecipe,
    isBulkUpdating,
    isMakingPrivate,
    isMakingPublic,
  };
};

export const useBlockedUsers = () => {
  const [page, setPage] = useState(1);
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetBlockedUsersQuery({ page, limit: 20 });

  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [unblockUser, { isLoading: isUnblocking }] = useUnblockUserMutation();

  const users = useMemo(() => data?.users || [], [data]);
  const hasMore = useMemo(() => data?.hasMore || false, [data]);

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isFetching]);

  const handleBlockUser = useCallback(async (data: BlockUserRequest) => {
    try {
      const result = await blockUser(data).unwrap();
      Alert.alert(
        'Usuário Bloqueado',
        'O usuário foi bloqueado com sucesso'
      );
      return { success: true, blockedUser: result };
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.data?.message || 'Erro ao bloquear usuário'
      );
      return {
        success: false,
        error: error.data?.message || 'Erro ao bloquear usuário',
      };
    }
  }, [blockUser]);

  const handleUnblockUser = useCallback(async (userId: string, username: string) => {
    Alert.alert(
      'Desbloquear Usuário',
      `Tem certeza que deseja desbloquear @${username}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desbloquear',
          onPress: async () => {
            try {
              await unblockUser(userId).unwrap();
              Alert.alert(
                'Usuário Desbloqueado',
                'O usuário foi desbloqueado com sucesso'
              );
            } catch (error: any) {
              Alert.alert(
                'Erro',
                error.data?.message || 'Erro ao desbloquear usuário'
              );
            }
          },
        },
      ]
    );
  }, [unblockUser]);

  return {
    users,
    hasMore,
    isLoading,
    isFetching,
    error,
    refetch,
    loadMore,
    blockUser: handleBlockUser,
    unblockUser: handleUnblockUser,
    isBlocking,
    isUnblocking,
  };
};

export const useDataExport = () => {
  const {
    data: exports,
    isLoading,
    error,
    refetch,
  } = useGetDataExportsQuery();

  const [requestExport, { isLoading: isRequesting }] = useRequestDataExportMutation();
  const [downloadExport] = useLazyDownloadDataExportQuery();
  const [deleteExport, { isLoading: isDeleting }] = useDeleteDataExportMutation();

  const handleRequestExport = useCallback(async (data: RequestDataExportRequest) => {
    try {
      const result = await requestExport(data).unwrap();
      Alert.alert(
        'Exportação Solicitada',
        'Sua solicitação de exportação foi processada. Você receberá uma notificação quando estiver pronta.'
      );
      return { success: true, export: result };
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.data?.message || 'Erro ao solicitar exportação'
      );
      return {
        success: false,
        error: error.data?.message || 'Erro ao solicitar exportação',
      };
    }
  }, [requestExport]);

  const handleDownloadExport = useCallback(async (exportId: string, filename: string) => {
    try {
      const result = await downloadExport(exportId).unwrap();
      // Implementar download do arquivo
      // Por enquanto, apenas mostrar sucesso
      Alert.alert(
        'Download Iniciado',
        'O download dos seus dados foi iniciado'
      );
      return { success: true };
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.data?.message || 'Erro ao baixar exportação'
      );
      return {
        success: false,
        error: error.data?.message || 'Erro ao baixar exportação',
      };
    }
  }, [downloadExport]);

  const handleDeleteExport = useCallback(async (exportId: string) => {
    Alert.alert(
      'Deletar Exportação',
      'Tem certeza que deseja deletar esta exportação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExport(exportId).unwrap();
              Alert.alert(
                'Exportação Deletada',
                'A exportação foi deletada com sucesso'
              );
            } catch (error: any) {
              Alert.alert(
                'Erro',
                error.data?.message || 'Erro ao deletar exportação'
              );
            }
          },
        },
      ]
    );
  }, [deleteExport]);

  return {
    exports: exports || [],
    isLoading,
    error,
    refetch,
    requestExport: handleRequestExport,
    downloadExport: handleDownloadExport,
    deleteExport: handleDeleteExport,
    isRequesting,
    isDeleting,
  };
};

export const useAccountDeletion = () => {
  const {
    data: deletionRequest,
    isLoading,
    error,
    refetch,
  } = useGetAccountDeletionRequestQuery();

  const [requestDeletion, { isLoading: isRequesting }] = useRequestAccountDeletionMutation();
  const [cancelDeletion, { isLoading: isCancelling }] = useCancelAccountDeletionMutation();

  const handleRequestDeletion = useCallback(async (data: RequestAccountDeletionRequest) => {
    Alert.alert(
      'Deletar Conta',
      'ATENÇÃO: Esta ação é irreversível. Sua conta será deletada permanentemente em 30 dias. Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar Deleção',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await requestDeletion(data).unwrap();
              Alert.alert(
                'Deleção Agendada',
                'Sua conta será deletada em 30 dias. Você pode cancelar esta ação a qualquer momento durante este período.'
              );
              return { success: true, request: result };
            } catch (error: any) {
              Alert.alert(
                'Erro',
                error.data?.message || 'Erro ao solicitar deleção da conta'
              );
              return {
                success: false,
                error: error.data?.message || 'Erro ao solicitar deleção da conta',
              };
            }
          },
        },
      ]
    );
  }, [requestDeletion]);

  const handleCancelDeletion = useCallback(async () => {
    Alert.alert(
      'Cancelar Deleção',
      'Tem certeza que deseja cancelar a deleção da sua conta?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          onPress: async () => {
            try {
              await cancelDeletion().unwrap();
              Alert.alert(
                'Deleção Cancelada',
                'A deleção da sua conta foi cancelada com sucesso'
              );
            } catch (error: any) {
              Alert.alert(
                'Erro',
                error.data?.message || 'Erro ao cancelar deleção da conta'
              );
            }
          },
        },
      ]
    );
  }, [cancelDeletion]);

  return {
    deletionRequest,
    isLoading,
    error,
    refetch,
    requestDeletion: handleRequestDeletion,
    cancelDeletion: handleCancelDeletion,
    isRequesting,
    isCancelling,
  };
};

export const usePrivacyReport = () => {
  const {
    data: report,
    isLoading,
    error,
    refetch,
  } = useGetPrivacyReportQuery();

  return {
    report,
    isLoading,
    error,
    refetch,
  };
};
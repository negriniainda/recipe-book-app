import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import {
  useGetFeedQuery,
  useGetUserPostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useToggleLikePostMutation,
  useToggleBookmarkPostMutation,
  useGetPostCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useToggleLikeCommentMutation,
  useGetUserProfileQuery,
  useUpdateProfileMutation,
  useToggleFollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useSearchUsersQuery,
  useReportContentMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useGetTrendingPostsQuery,
  useGetSavedPostsQuery,
} from '../services/communityApi';
import {
  CommunityFeedFilters,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateProfileRequest,
  ReportContentRequest,
} from '../types/community';

export const useCommunityFeed = (filters: CommunityFeedFilters = {}) => {
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetFeedQuery(
    { page, limit: 20, filters },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const posts = useMemo(() => data?.posts || [], [data]);
  const hasMore = useMemo(() => data?.hasMore || false, [data]);

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isFetching]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const resetFeed = useCallback(() => {
    setPage(1);
  }, []);

  return {
    posts,
    isLoading: isLoading && page === 1,
    isFetching,
    refreshing,
    hasMore,
    error,
    loadMore,
    refresh,
    resetFeed,
  };
};

export const useCommunityPost = () => {
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [toggleLike, { isLoading: isLiking }] = useToggleLikePostMutation();
  const [toggleBookmark, { isLoading: isBookmarking }] = useToggleBookmarkPostMutation();

  const handleCreatePost = useCallback(async (data: CreatePostRequest) => {
    try {
      const result = await createPost(data).unwrap();
      return { success: true, post: result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao criar post',
      };
    }
  }, [createPost]);

  const handleUpdatePost = useCallback(async (
    postId: string,
    data: UpdatePostRequest
  ) => {
    try {
      const result = await updatePost({ postId, data }).unwrap();
      return { success: true, post: result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao atualizar post',
      };
    }
  }, [updatePost]);

  const handleDeletePost = useCallback(async (postId: string) => {
    try {
      await deletePost(postId).unwrap();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao deletar post',
      };
    }
  }, [deletePost]);

  const handleToggleLike = useCallback(async (postId: string) => {
    try {
      const result = await toggleLike(postId).unwrap();
      return { success: true, ...result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao curtir post',
      };
    }
  }, [toggleLike]);

  const handleToggleBookmark = useCallback(async (postId: string) => {
    try {
      const result = await toggleBookmark(postId).unwrap();
      return { success: true, ...result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao salvar post',
      };
    }
  }, [toggleBookmark]);

  const confirmDeletePost = useCallback((postId: string, onSuccess?: () => void) => {
    Alert.alert(
      'Deletar Post',
      'Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            const result = await handleDeletePost(postId);
            if (result.success) {
              onSuccess?.();
            } else {
              Alert.alert('Erro', result.error);
            }
          },
        },
      ]
    );
  }, [handleDeletePost]);

  return {
    createPost: handleCreatePost,
    updatePost: handleUpdatePost,
    deletePost: handleDeletePost,
    toggleLike: handleToggleLike,
    toggleBookmark: handleToggleBookmark,
    confirmDeletePost,
    isCreating,
    isUpdating,
    isDeleting,
    isLiking,
    isBookmarking,
  };
};

export const useCommunityComments = (postId: string) => {
  const [page, setPage] = useState(1);
  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();
  const [toggleLike, { isLoading: isLiking }] = useToggleLikeCommentMutation();

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetPostCommentsQuery(
    { postId, page, limit: 20 },
    { skip: !postId }
  );

  const comments = useMemo(() => data?.comments || [], [data]);
  const hasMore = useMemo(() => data?.hasMore || false, [data]);

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isFetching]);

  const handleCreateComment = useCallback(async (
    content: string,
    parentId?: string
  ) => {
    try {
      const result = await createComment({
        postId,
        content,
        parentId,
      }).unwrap();
      return { success: true, comment: result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao criar comentário',
      };
    }
  }, [createComment, postId]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    try {
      await deleteComment(commentId).unwrap();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao deletar comentário',
      };
    }
  }, [deleteComment]);

  const handleToggleLike = useCallback(async (commentId: string) => {
    try {
      const result = await toggleLike(commentId).unwrap();
      return { success: true, ...result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao curtir comentário',
      };
    }
  }, [toggleLike]);

  return {
    comments,
    isLoading,
    isFetching,
    hasMore,
    error,
    loadMore,
    refetch,
    createComment: handleCreateComment,
    deleteComment: handleDeleteComment,
    toggleLike: handleToggleLike,
    isCreating,
    isDeleting,
    isLiking,
  };
};

export const useCommunityProfile = (userId?: string) => {
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [toggleFollow, { isLoading: isFollowing }] = useToggleFollowUserMutation();
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [unblockUser, { isLoading: isUnblocking }] = useUnblockUserMutation();

  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useGetUserProfileQuery(userId!, { skip: !userId });

  const handleUpdateProfile = useCallback(async (data: UpdateProfileRequest) => {
    try {
      const result = await updateProfile(data).unwrap();
      return { success: true, profile: result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao atualizar perfil',
      };
    }
  }, [updateProfile]);

  const handleToggleFollow = useCallback(async (targetUserId: string) => {
    try {
      const result = await toggleFollow(targetUserId).unwrap();
      return { success: true, ...result };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao seguir usuário',
      };
    }
  }, [toggleFollow]);

  const handleBlockUser = useCallback(async (targetUserId: string) => {
    try {
      await blockUser(targetUserId).unwrap();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao bloquear usuário',
      };
    }
  }, [blockUser]);

  const handleUnblockUser = useCallback(async (targetUserId: string) => {
    try {
      await unblockUser(targetUserId).unwrap();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao desbloquear usuário',
      };
    }
  }, [unblockUser]);

  const confirmBlockUser = useCallback((
    targetUserId: string,
    username: string,
    onSuccess?: () => void
  ) => {
    Alert.alert(
      'Bloquear Usuário',
      `Tem certeza que deseja bloquear @${username}? Você não verá mais os posts desta pessoa.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Bloquear',
          style: 'destructive',
          onPress: async () => {
            const result = await handleBlockUser(targetUserId);
            if (result.success) {
              onSuccess?.();
            } else {
              Alert.alert('Erro', result.error);
            }
          },
        },
      ]
    );
  }, [handleBlockUser]);

  return {
    profile,
    isLoading,
    error,
    refetch,
    updateProfile: handleUpdateProfile,
    toggleFollow: handleToggleFollow,
    blockUser: handleBlockUser,
    unblockUser: handleUnblockUser,
    confirmBlockUser,
    isUpdating,
    isFollowing,
    isBlocking,
    isUnblocking,
  };
};

export const useCommunitySearch = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce da busca
  useState(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  });

  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useSearchUsersQuery(
    { query: debouncedQuery, limit: 20 },
    { skip: debouncedQuery.length < 2 }
  );

  const users = useMemo(() => data?.users || [], [data]);
  const hasMore = useMemo(() => data?.hasMore || false, [data]);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    query,
    users,
    isLoading,
    isFetching,
    hasMore,
    error,
    updateQuery,
    clearSearch,
  };
};

export const useCommunityModeration = () => {
  const [reportContent] = useReportContentMutation();

  const handleReportContent = useCallback(async (data: ReportContentRequest) => {
    try {
      await reportContent(data).unwrap();
      Alert.alert(
        'Conteúdo Reportado',
        'Obrigado por reportar este conteúdo. Nossa equipe irá analisá-lo em breve.'
      );
      return { success: true };
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.data?.message || 'Erro ao reportar conteúdo'
      );
      return {
        success: false,
        error: error.data?.message || 'Erro ao reportar conteúdo',
      };
    }
  }, [reportContent]);

  const showReportDialog = useCallback((
    targetId: string,
    targetType: 'post' | 'comment' | 'user',
    targetName: string
  ) => {
    const reasons = [
      { key: 'spam', label: 'Spam' },
      { key: 'inappropriate', label: 'Conteúdo Inapropriado' },
      { key: 'harassment', label: 'Assédio' },
      { key: 'copyright', label: 'Violação de Direitos Autorais' },
      { key: 'other', label: 'Outro' },
    ];

    Alert.alert(
      'Reportar Conteúdo',
      `Por que você está reportando este ${targetType === 'user' ? 'usuário' : 'conteúdo'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        ...reasons.map(reason => ({
          text: reason.label,
          onPress: () => {
            handleReportContent({
              targetId,
              targetType,
              reason: reason.key as any,
            });
          },
        })),
      ]
    );
  }, [handleReportContent]);

  return {
    reportContent: handleReportContent,
    showReportDialog,
  };
};

export const useTrendingPosts = (timeframe: 'day' | 'week' | 'month' = 'week') => {
  const [page, setPage] = useState(1);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetTrendingPostsQuery(
    { page, limit: 20, timeframe },
    { refetchOnMountOrArgChange: true }
  );

  const posts = useMemo(() => data?.posts || [], [data]);
  const hasMore = useMemo(() => data?.hasMore || false, [data]);

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isFetching]);

  const refresh = useCallback(async () => {
    setPage(1);
    await refetch();
  }, [refetch]);

  return {
    posts,
    isLoading: isLoading && page === 1,
    isFetching,
    hasMore,
    error,
    loadMore,
    refresh,
  };
};

export const useSavedPosts = () => {
  const [page, setPage] = useState(1);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetSavedPostsQuery(
    { page, limit: 20 },
    { refetchOnMountOrArgChange: true }
  );

  const posts = useMemo(() => data?.posts || [], [data]);
  const hasMore = useMemo(() => data?.hasMore || false, [data]);

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isFetching]);

  const refresh = useCallback(async () => {
    setPage(1);
    await refetch();
  }, [refetch]);

  return {
    posts,
    isLoading: isLoading && page === 1,
    isFetching,
    hasMore,
    error,
    loadMore,
    refresh,
  };
};
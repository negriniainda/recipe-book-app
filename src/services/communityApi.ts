import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  CommunityPost,
  CommunityUser,
  Comment,
  UserProfile,
  Follow,
  Like,
  Report,
  CommunityFeedFilters,
  CommunityStats,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  FollowUserRequest,
  ReportContentRequest,
  UpdateProfileRequest,
} from '../types/community';

export const communityApi = createApi({
  reducerPath: 'communityApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/community',
    prepareHeaders: (headers, { getState }) => {
      // Adicionar token de autenticação
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Post', 'Comment', 'User', 'Profile', 'Follow', 'Stats'],
  endpoints: (builder) => ({
    // Feed da comunidade
    getFeed: builder.query<
      { posts: CommunityPost[]; hasMore: boolean },
      { page?: number; limit?: number; filters?: CommunityFeedFilters }
    >({
      query: ({ page = 1, limit = 20, filters = {} }) => ({
        url: '/feed',
        params: {
          page,
          limit,
          ...filters,
        },
      }),
      providesTags: ['Post'],
      serializeQueryArgs: ({ queryArgs }) => {
        const { page, ...otherArgs } = queryArgs;
        return otherArgs;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        return {
          ...newItems,
          posts: [...currentCache.posts, ...newItems.posts],
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
    }),

    // Posts de um usuário específico
    getUserPosts: builder.query<
      { posts: CommunityPost[]; hasMore: boolean },
      { userId: string; page?: number; limit?: number }
    >({
      query: ({ userId, page = 1, limit = 20 }) => ({
        url: `/users/${userId}/posts`,
        params: { page, limit },
      }),
      providesTags: (result, error, arg) => [
        { type: 'Post', id: `USER_${arg.userId}` },
      ],
    }),

    // Criar post
    createPost: builder.mutation<CommunityPost, CreatePostRequest>({
      query: (data) => ({
        url: '/posts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Post', 'Stats'],
    }),

    // Atualizar post
    updatePost: builder.mutation<
      CommunityPost,
      { postId: string; data: UpdatePostRequest }
    >({
      query: ({ postId, data }) => ({
        url: `/posts/${postId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Post', id: arg.postId },
      ],
    }),

    // Deletar post
    deletePost: builder.mutation<void, string>({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post', 'Stats'],
    }),

    // Curtir/descurtir post
    toggleLikePost: builder.mutation<
      { isLiked: boolean; likesCount: number },
      string
    >({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: 'POST',
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        // Atualização otimista
        const patchResult = dispatch(
          communityApi.util.updateQueryData('getFeed', {}, (draft) => {
            const post = draft.posts.find((p) => p.id === postId);
            if (post) {
              post.isLiked = !post.isLiked;
              post.likesCount += post.isLiked ? 1 : -1;
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Salvar/dessalvar post
    toggleBookmarkPost: builder.mutation<
      { isBookmarked: boolean },
      string
    >({
      query: (postId) => ({
        url: `/posts/${postId}/bookmark`,
        method: 'POST',
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          communityApi.util.updateQueryData('getFeed', {}, (draft) => {
            const post = draft.posts.find((p) => p.id === postId);
            if (post) {
              post.isBookmarked = !post.isBookmarked;
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Comentários de um post
    getPostComments: builder.query<
      { comments: Comment[]; hasMore: boolean },
      { postId: string; page?: number; limit?: number }
    >({
      query: ({ postId, page = 1, limit = 20 }) => ({
        url: `/posts/${postId}/comments`,
        params: { page, limit },
      }),
      providesTags: (result, error, arg) => [
        { type: 'Comment', id: arg.postId },
      ],
    }),

    // Criar comentário
    createComment: builder.mutation<Comment, CreateCommentRequest>({
      query: (data) => ({
        url: '/comments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Comment', id: arg.postId },
        { type: 'Post', id: arg.postId },
      ],
    }),

    // Atualizar comentário
    updateComment: builder.mutation<
      Comment,
      { commentId: string; data: UpdateCommentRequest }
    >({
      query: ({ commentId, data }) => ({
        url: `/comments/${commentId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Comment', id: arg.commentId },
      ],
    }),

    // Deletar comentário
    deleteComment: builder.mutation<void, string>({
      query: (commentId) => ({
        url: `/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Comment'],
    }),

    // Curtir/descurtir comentário
    toggleLikeComment: builder.mutation<
      { isLiked: boolean; likesCount: number },
      string
    >({
      query: (commentId) => ({
        url: `/comments/${commentId}/like`,
        method: 'POST',
      }),
    }),

    // Perfil de usuário
    getUserProfile: builder.query<UserProfile, string>({
      query: (userId) => `/users/${userId}/profile`,
      providesTags: (result, error, arg) => [{ type: 'Profile', id: arg }],
    }),

    // Atualizar perfil próprio
    updateProfile: builder.mutation<UserProfile, UpdateProfileRequest>({
      query: (data) => ({
        url: '/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),

    // Seguir/deixar de seguir usuário
    toggleFollowUser: builder.mutation<
      { isFollowing: boolean; followersCount: number },
      string
    >({
      query: (userId) => ({
        url: `/users/${userId}/follow`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Profile', id: arg },
        { type: 'Follow' },
      ],
    }),

    // Lista de seguidores
    getFollowers: builder.query<
      { users: CommunityUser[]; hasMore: boolean },
      { userId: string; page?: number; limit?: number }
    >({
      query: ({ userId, page = 1, limit = 20 }) => ({
        url: `/users/${userId}/followers`,
        params: { page, limit },
      }),
      providesTags: ['Follow'],
    }),

    // Lista de seguindo
    getFollowing: builder.query<
      { users: CommunityUser[]; hasMore: boolean },
      { userId: string; page?: number; limit?: number }
    >({
      query: ({ userId, page = 1, limit = 20 }) => ({
        url: `/users/${userId}/following`,
        params: { page, limit },
      }),
      providesTags: ['Follow'],
    }),

    // Buscar usuários
    searchUsers: builder.query<
      { users: CommunityUser[]; hasMore: boolean },
      { query: string; page?: number; limit?: number }
    >({
      query: ({ query, page = 1, limit = 20 }) => ({
        url: '/users/search',
        params: { q: query, page, limit },
      }),
    }),

    // Reportar conteúdo
    reportContent: builder.mutation<Report, ReportContentRequest>({
      query: (data) => ({
        url: '/reports',
        method: 'POST',
        body: data,
      }),
    }),

    // Bloquear usuário
    blockUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/users/${userId}/block`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Profile', id: arg },
      ],
    }),

    // Desbloquear usuário
    unblockUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/users/${userId}/unblock`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Profile', id: arg },
      ],
    }),

    // Estatísticas da comunidade
    getCommunityStats: builder.query<CommunityStats, void>({
      query: () => '/stats',
      providesTags: ['Stats'],
    }),

    // Posts em alta/trending
    getTrendingPosts: builder.query<
      { posts: CommunityPost[]; hasMore: boolean },
      { page?: number; limit?: number; timeframe?: 'day' | 'week' | 'month' }
    >({
      query: ({ page = 1, limit = 20, timeframe = 'week' }) => ({
        url: '/trending',
        params: { page, limit, timeframe },
      }),
      providesTags: ['Post'],
    }),

    // Posts salvos pelo usuário
    getSavedPosts: builder.query<
      { posts: CommunityPost[]; hasMore: boolean },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) => ({
        url: '/saved',
        params: { page, limit },
      }),
      providesTags: ['Post'],
    }),

    // Notificações da comunidade
    getCommunityNotifications: builder.query<
      {
        notifications: Array<{
          id: string;
          type: 'like' | 'comment' | 'follow' | 'mention';
          userId: string;
          user: CommunityUser;
          postId?: string;
          commentId?: string;
          message: string;
          isRead: boolean;
          createdAt: string;
        }>;
        hasMore: boolean;
      },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) => ({
        url: '/notifications',
        params: { page, limit },
      }),
    }),

    // Marcar notificação como lida
    markNotificationAsRead: builder.mutation<void, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetFeedQuery,
  useGetUserPostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useToggleLikePostMutation,
  useToggleBookmarkPostMutation,
  useGetPostCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
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
  useGetCommunityStatsQuery,
  useGetTrendingPostsQuery,
  useGetSavedPostsQuery,
  useGetCommunityNotificationsQuery,
  useMarkNotificationAsReadMutation,
} = communityApi;
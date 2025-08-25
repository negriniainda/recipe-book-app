import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from './api';
import {
  ShareLink,
  ShareTemplate,
  ShareStats,
  ShareActivity,
  SharePreferences,
  ShareNotification,
  SocialMediaIntegration,
  CreateShareLinkRequest,
  ShareContentRequest,
  GenerateShareImageRequest,
  ExportPDFRequest,
  ShareAnalyticsRequest,
  SharePlatform,
  ShareContentType,
  ShareFormat,
} from '../types/sharing';

export const sharingApi = createApi({
  reducerPath: 'sharingApi',
  baseQuery,
  tagTypes: [
    'ShareLink',
    'ShareTemplate',
    'ShareStats',
    'ShareActivity',
    'SharePreferences',
    'ShareNotification',
    'SocialIntegration'
  ],
  endpoints: builder => ({
    // Share Links
    createShareLink: builder.mutation<
      ShareLink,
      CreateShareLinkRequest & {userId: string}
    >({
      query: ({userId, ...body}) => ({
        url: '/sharing/links',
        method: 'POST',
        body: {userId, ...body},
      }),
      invalidatesTags: ['ShareLink', 'ShareStats'],
    }),

    getShareLink: builder.query<ShareLink, string>({
      query: linkId => `/sharing/links/${linkId}`,
      providesTags: ['ShareLink'],
    }),

    getShareLinks: builder.query<
      ShareLink[],
      {userId: string; contentType?: ShareContentType}
    >({
      query: ({userId, contentType}) => ({
        url: '/sharing/links',
        params: {userId, contentType},
      }),
      providesTags: ['ShareLink'],
    }),

    updateShareLink: builder.mutation<
      ShareLink,
      {linkId: string; updates: Partial<ShareLink>}
    >({
      query: ({linkId, updates}) => ({
        url: `/sharing/links/${linkId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['ShareLink'],
    }),

    deleteShareLink: builder.mutation<void, string>({
      query: linkId => ({
        url: `/sharing/links/${linkId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ShareLink', 'ShareStats'],
    }),

    // Share Content
    shareContent: builder.mutation<
      {success: boolean; shareId: string; analytics?: any},
      ShareContentRequest
    >({
      query: body => ({
        url: '/sharing/share',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ShareActivity', 'ShareStats'],
    }),

    // Share Templates
    getShareTemplates: builder.query<
      ShareTemplate[],
      {platform?: SharePlatform; contentType?: ShareContentType}
    >({
      query: ({platform, contentType}) => ({
        url: '/sharing/templates',
        params: {platform, contentType},
      }),
      providesTags: ['ShareTemplate'],
    }),

    createShareTemplate: builder.mutation<
      ShareTemplate,
      Omit<ShareTemplate, 'id' | 'createdAt' | 'updatedAt'>
    >({
      query: body => ({
        url: '/sharing/templates',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ShareTemplate'],
    }),

    updateShareTemplate: builder.mutation<
      ShareTemplate,
      {templateId: string; updates: Partial<ShareTemplate>}
    >({
      query: ({templateId, updates}) => ({
        url: `/sharing/templates/${templateId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['ShareTemplate'],
    }),

    deleteShareTemplate: builder.mutation<void, string>({
      query: templateId => ({
        url: `/sharing/templates/${templateId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ShareTemplate'],
    }),

    // Generate Share Images
    generateShareImage: builder.mutation<
      {imageUrl: string; dimensions: {width: number; height: number}},
      GenerateShareImageRequest
    >({
      query: body => ({
        url: '/sharing/generate-image',
        method: 'POST',
        body,
      }),
    }),

    // Export PDF
    exportToPDF: builder.mutation<
      {pdfUrl: string; fileName: string},
      ExportPDFRequest
    >({
      query: body => ({
        url: '/sharing/export-pdf',
        method: 'POST',
        body,
      }),
    }),

    // Share Statistics
    getShareStats: builder.query<
      ShareStats,
      {contentId: string; contentType: ShareContentType}
    >({
      query: ({contentId, contentType}) => ({
        url: '/sharing/stats',
        params: {contentId, contentType},
      }),
      providesTags: ['ShareStats'],
    }),

    getShareAnalytics: builder.query<
      {
        totalShares: number;
        sharesByPlatform: Record<SharePlatform, number>;
        sharesByFormat: Record<ShareFormat, number>;
        timeline: Array<{
          date: string;
          shares: number;
          clicks: number;
          views: number;
        }>;
        topContent: Array<{
          contentId: string;
          title: string;
          shares: number;
          clicks: number;
        }>;
      },
      ShareAnalyticsRequest & {userId: string}
    >({
      query: ({userId, ...params}) => ({
        url: '/sharing/analytics',
        params: {userId, ...params},
      }),
      providesTags: ['ShareStats'],
    }),

    // Share Activity
    getShareActivity: builder.query<
      ShareActivity[],
      {userId: string; limit?: number; contentId?: string}
    >({
      query: ({userId, limit = 50, contentId}) => ({
        url: '/sharing/activity',
        params: {userId, limit, contentId},
      }),
      providesTags: ['ShareActivity'],
    }),

    // Share Preferences
    getSharePreferences: builder.query<SharePreferences, string>({
      query: userId => `/sharing/preferences/${userId}`,
      providesTags: ['SharePreferences'],
    }),

    updateSharePreferences: builder.mutation<
      SharePreferences,
      {userId: string; preferences: Partial<SharePreferences>}
    >({
      query: ({userId, preferences}) => ({
        url: `/sharing/preferences/${userId}`,
        method: 'PATCH',
        body: preferences,
      }),
      invalidatesTags: ['SharePreferences'],
    }),

    // Social Media Integration
    getSocialIntegrations: builder.query<SocialMediaIntegration[], string>({
      query: userId => `/sharing/social-integrations/${userId}`,
      providesTags: ['SocialIntegration'],
    }),

    connectSocialPlatform: builder.mutation<
      SocialMediaIntegration,
      {userId: string; platform: SharePlatform; authCode: string}
    >({
      query: ({userId, platform, authCode}) => ({
        url: '/sharing/social-integrations/connect',
        method: 'POST',
        body: {userId, platform, authCode},
      }),
      invalidatesTags: ['SocialIntegration'],
    }),

    disconnectSocialPlatform: builder.mutation<
      void,
      {userId: string; platform: SharePlatform}
    >({
      query: ({userId, platform}) => ({
        url: '/sharing/social-integrations/disconnect',
        method: 'POST',
        body: {userId, platform},
      }),
      invalidatesTags: ['SocialIntegration'],
    }),

    // Share Notifications
    getShareNotifications: builder.query<
      ShareNotification[],
      {userId: string; unreadOnly?: boolean}
    >({
      query: ({userId, unreadOnly}) => ({
        url: '/sharing/notifications',
        params: {userId, unreadOnly},
      }),
      providesTags: ['ShareNotification'],
    }),

    markNotificationAsRead: builder.mutation<
      ShareNotification,
      {notificationId: string}
    >({
      query: ({notificationId}) => ({
        url: `/sharing/notifications/${notificationId}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['ShareNotification'],
    }),

    // QR Code Generation
    generateQRCode: builder.mutation<
      {qrCodeUrl: string},
      {
        url: string;
        size?: number;
        backgroundColor?: string;
        foregroundColor?: string;
        logo?: string;
      }
    >({
      query: body => ({
        url: '/sharing/qr-code',
        method: 'POST',
        body,
      }),
    }),

    // Bulk Operations
    bulkShare: builder.mutation<
      Array<{contentId: string; success: boolean; shareId?: string; error?: string}>,
      {
        contentIds: string[];
        contentType: ShareContentType;
        platform: SharePlatform;
        format: ShareFormat;
        message?: string;
      }
    >({
      query: body => ({
        url: '/sharing/bulk-share',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ShareActivity', 'ShareStats'],
    }),

    // Popular Content
    getPopularSharedContent: builder.query<
      Array<{
        contentId: string;
        contentType: ShareContentType;
        title: string;
        imageUrl?: string;
        shareCount: number;
        clickCount: number;
        trending: boolean;
      }>,
      {
        contentType?: ShareContentType;
        timeframe: 'day' | 'week' | 'month' | 'all';
        limit?: number;
      }
    >({
      query: ({contentType, timeframe, limit = 20}) => ({
        url: '/sharing/popular',
        params: {contentType, timeframe, limit},
      }),
      providesTags: ['ShareStats'],
    }),

    // Share Link Analytics
    getShareLinkAnalytics: builder.query<
      {
        totalClicks: number;
        uniqueVisitors: number;
        clicksByDate: Array<{date: string; clicks: number}>;
        referrers: Array<{source: string; clicks: number}>;
        locations: Array<{country: string; clicks: number}>;
        devices: Array<{device: string; clicks: number}>;
      },
      {linkId: string; dateRange?: {start: Date; end: Date}}
    >({
      query: ({linkId, dateRange}) => ({
        url: `/sharing/links/${linkId}/analytics`,
        params: dateRange,
      }),
      providesTags: ['ShareStats'],
    }),

    // Template Preview
    previewShareTemplate: builder.mutation<
      {previewUrl: string},
      {
        templateId: string;
        contentId: string;
        contentType: ShareContentType;
        customizations?: any;
      }
    >({
      query: body => ({
        url: '/sharing/templates/preview',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useCreateShareLinkMutation,
  useGetShareLinkQuery,
  useGetShareLinksQuery,
  useUpdateShareLinkMutation,
  useDeleteShareLinkMutation,
  useShareContentMutation,
  useGetShareTemplatesQuery,
  useCreateShareTemplateMutation,
  useUpdateShareTemplateMutation,
  useDeleteShareTemplateMutation,
  useGenerateShareImageMutation,
  useExportToPDFMutation,
  useGetShareStatsQuery,
  useGetShareAnalyticsQuery,
  useGetShareActivityQuery,
  useGetSharePreferencesQuery,
  useUpdateSharePreferencesMutation,
  useGetSocialIntegrationsQuery,
  useConnectSocialPlatformMutation,
  useDisconnectSocialPlatformMutation,
  useGetShareNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useGenerateQRCodeMutation,
  useBulkShareMutation,
  useGetPopularSharedContentQuery,
  useGetShareLinkAnalyticsQuery,
  usePreviewShareTemplateMutation,
} = sharingApi;
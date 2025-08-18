import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './api';
import {
    RecipeRating,
    RecipeNote,
    RecipeVersion,
    CreateRecipeRatingInput,
    CreateRecipeNoteInput,
    CreateRecipeVersionInput,
    UpdateRecipeNoteInput,
    UpdateRecipeVersionInput,
    PaginatedResponse,
} from '../types';

export const ratingsApi = createApi({
    reducerPath: 'ratingsApi',
    baseQuery,
    tagTypes: ['Rating', 'Note', 'Version'],
    endpoints: builder => ({
        // Ratings
        getRecipeRatings: builder.query<PaginatedResponse<RecipeRating>, { recipeId: string; page?: number; limit?: number }>({
            query: ({ recipeId, page = 1, limit = 20 }) => ({
                url: `/recipes/${recipeId}/ratings`,
                params: { page, limit },
            }),
            providesTags: (_result, _error, { recipeId }) => [
                { type: 'Rating', id: recipeId },
                'Rating',
            ],
        }),

        getUserRating: builder.query<RecipeRating | null, { recipeId: string; userId: string }>({
            query: ({ recipeId, userId }) => `/recipes/${recipeId}/ratings/user/${userId}`,
            providesTags: (_result, _error, { recipeId, userId }) => [
                { type: 'Rating', id: `${recipeId}-${userId}` },
            ],
        }),

        createRating: builder.mutation<RecipeRating, CreateRecipeRatingInput>({
            query: data => ({
                url: `/recipes/${data.recipeId}/ratings`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (_result, _error, { recipeId, userId }) => [
                { type: 'Rating', id: recipeId },
                { type: 'Rating', id: `${recipeId}-${userId}` },
                'Rating',
            ],
        }),

        updateRating: builder.mutation<RecipeRating, { id: string; rating: number; review?: string }>({
            query: ({ id, ...data }) => ({
                url: `/ratings/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Rating', id },
                'Rating',
            ],
        }),

        deleteRating: builder.mutation<void, string>({
            query: id => ({
                url: `/ratings/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Rating', id },
                'Rating',
            ],
        }),

        // Notes
        getRecipeNotes: builder.query<RecipeNote[], { recipeId: string; userId?: string; includePrivate?: boolean }>({
            query: ({ recipeId, userId, includePrivate = false }) => ({
                url: `/recipes/${recipeId}/notes`,
                params: { userId, includePrivate },
            }),
            providesTags: (_result, _error, { recipeId }) => [
                { type: 'Note', id: recipeId },
                'Note',
            ],
        }),

        createNote: builder.mutation<RecipeNote, CreateRecipeNoteInput>({
            query: data => ({
                url: `/recipes/${data.recipeId}/notes`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (_result, _error, { recipeId }) => [
                { type: 'Note', id: recipeId },
                'Note',
            ],
        }),

        updateNote: builder.mutation<RecipeNote, UpdateRecipeNoteInput>({
            query: ({ id, ...data }) => ({
                url: `/notes/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Note', id },
                'Note',
            ],
        }),

        deleteNote: builder.mutation<void, string>({
            query: id => ({
                url: `/notes/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Note', id },
                'Note',
            ],
        }),

        toggleNotePrivacy: builder.mutation<RecipeNote, { id: string; isPrivate: boolean }>({
            query: ({ id, isPrivate }) => ({
                url: `/notes/${id}/privacy`,
                method: 'PATCH',
                body: { isPrivate },
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Note', id },
                'Note',
            ],
        }),

        // Versions
        getRecipeVersions: builder.query<RecipeVersion[], string>({
            query: recipeId => `/recipes/${recipeId}/versions`,
            providesTags: (_result, _error, recipeId) => [
                { type: 'Version', id: recipeId },
                'Version',
            ],
        }),

        getVersion: builder.query<RecipeVersion, string>({
            query: id => `/versions/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Version', id }],
        }),

        createVersion: builder.mutation<RecipeVersion, CreateRecipeVersionInput>({
            query: data => ({
                url: `/recipes/${data.recipeId}/versions`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (_result, _error, { recipeId }) => [
                { type: 'Version', id: recipeId },
                'Version',
            ],
        }),

        updateVersion: builder.mutation<RecipeVersion, UpdateRecipeVersionInput>({
            query: ({ id, ...data }) => ({
                url: `/versions/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Version', id },
                'Version',
            ],
        }),

        deleteVersion: builder.mutation<void, string>({
            query: id => ({
                url: `/versions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Version', id },
                'Version',
            ],
        }),

        restoreVersion: builder.mutation<RecipeVersion, string>({
            query: id => ({
                url: `/versions/${id}/restore`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Version', id },
                'Version',
            ],
        }),

        compareVersions: builder.query<
            {
                version1: RecipeVersion;
                version2: RecipeVersion;
                differences: {
                    ingredients: {
                        added: any[];
                        removed: any[];
                        modified: any[];
                    };
                    instructions: {
                        added: any[];
                        removed: any[];
                        modified: any[];
                    };
                    metadata: {
                        changed: string[];
                    };
                };
            },
            { version1Id: string; version2Id: string }
        >({
            query: ({ version1Id, version2Id }) => ({
                url: `/versions/compare`,
                params: { version1Id, version2Id },
            }),
        }),

        // Analytics
        getRecipeRatingStats: builder.query<
            {
                averageRating: number;
                totalRatings: number;
                ratingDistribution: Record<number, number>;
                recentRatings: RecipeRating[];
            },
            string
        >({
            query: recipeId => `/recipes/${recipeId}/rating-stats`,
        }),

        getUserRecipeStats: builder.query<
            {
                totalNotes: number;
                totalVersions: number;
                totalRatings: number;
                averageRatingGiven: number;
                mostUsedTags: Array<{ tag: string; count: number }>;
                recentActivity: Array<{
                    type: 'note' | 'version' | 'rating';
                    recipeId: string;
                    recipeTitle: string;
                    createdAt: Date;
                }>;
            },
            string
        >({
            query: userId => `/users/${userId}/recipe-stats`,
        }),
    }),
});

export const {
    // Ratings
    useGetRecipeRatingsQuery,
    useGetUserRatingQuery,
    useCreateRatingMutation,
    useUpdateRatingMutation,
    useDeleteRatingMutation,

    // Notes
    useGetRecipeNotesQuery,
    useCreateNoteMutation,
    useUpdateNoteMutation,
    useDeleteNoteMutation,
    useToggleNotePrivacyMutation,

    // Versions
    useGetRecipeVersionsQuery,
    useGetVersionQuery,
    useCreateVersionMutation,
    useUpdateVersionMutation,
    useDeleteVersionMutation,
    useRestoreVersionMutation,
    useCompareVersionsQuery,

    // Analytics
    useGetRecipeRatingStatsQuery,
    useGetUserRecipeStatsQuery,
} = ratingsApi;
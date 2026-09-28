// lib/services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ITransaction, ICategory, IDashboardStats } from "@/types";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include",
  }),
  tagTypes: ["Transaction", "Category", "Stats"],
  endpoints: (builder) => ({
    // ==================== TRANSACTIONS ====================
    getTransactions: builder.query<
      { transactions: ITransaction[]; total: number },
      {
        page?: number;
        limit?: number;
        categoryId?: string;
        startDate?: string;
        endDate?: string;
      } | void
    >({
      query: (params) => ({
        url: "/transactions",
        params: params || {},
      }),
      providesTags: ["Transaction"],
    }),

    addTransaction: builder.mutation<ITransaction, Partial<ITransaction>>({
      query: (body) => ({
        url: "/transactions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Transaction", "Stats"],
    }),

    deleteTransaction: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/transactions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Transaction", "Stats"],
    }),

    // ==================== CATEGORIES ====================
    getCategories: builder.query<ICategory[], void>({
      query: () => "/categories",
      providesTags: ["Category"],
    }),

    addCategory: builder.mutation<ICategory, { name: string; icon: string }>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"], // 👈 triggers instant refetch
    }),

    // ==================== STATS ====================
    getDashboardStats: builder.query<IDashboardStats, void>({
      query: () => "/stats",
      providesTags: ["Stats"],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useAddTransactionMutation,
  useDeleteTransactionMutation,
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useGetDashboardStatsQuery,
} = apiSlice;

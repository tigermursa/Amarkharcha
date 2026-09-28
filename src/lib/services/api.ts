// lib/services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ITransaction,
  ICategory,
  IDashboardStats,
  IMonthlyReport,
  IDailyReport,
} from "@/types";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include",
  }),
  tagTypes: [
    "Transaction",
    "Category",
    "Stats",
    "MonthlyReport",
    "DailyReport",
  ],
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
      query: (params) => ({ url: "/transactions", params: params || {} }),
      providesTags: ["Transaction"],
    }),

    addTransaction: builder.mutation<ITransaction, Partial<ITransaction>>({
      query: (body) => ({ url: "/transactions", method: "POST", body }),
      invalidatesTags: ["Transaction", "Stats", "MonthlyReport", "DailyReport"],
    }),

    deleteTransaction: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/transactions/${id}`, method: "DELETE" }),
      invalidatesTags: ["Transaction", "Stats", "MonthlyReport", "DailyReport"],
    }),

    // ==================== CATEGORIES ====================
    getCategories: builder.query<ICategory[], void>({
      query: () => "/categories",
      providesTags: ["Category"],
    }),

    addCategory: builder.mutation<ICategory, { name: string; icon: string }>({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation<
      { success: boolean; name: string; icon: string },
      { id: string; name: string; icon: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Category", "Transaction"],
    }),

    deleteCategory: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    // ==================== STATS ====================
    getDashboardStats: builder.query<IDashboardStats, void>({
      query: () => "/stats",
      providesTags: ["Stats"],
    }),

    // ==================== REPORTS ====================
    getMonthlyReport: builder.query<
      IMonthlyReport[],
      { months?: number } | void
    >({
      query: (params) => ({
        url: "/reports/monthly",
        params: params || {},
      }),
      providesTags: ["MonthlyReport"],
    }),

    getDailyReport: builder.query<IDailyReport[], { days?: number } | void>({
      query: (params) => ({
        url: "/reports/daily",
        params: params || {},
      }),
      providesTags: ["DailyReport"],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useAddTransactionMutation,
  useDeleteTransactionMutation,
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetDashboardStatsQuery,
  useGetMonthlyReportQuery,
  useGetDailyReportQuery,
} = apiSlice;

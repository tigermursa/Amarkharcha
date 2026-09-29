// lib/services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ITransaction,
  ICategory,
  IDashboardStats,
  IPeriodSummary,
  IDailyReport,
} from "@/types";
import { IPeriodSummaryReport } from "../docx/period-report";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include",
  }),
  tagTypes: ["Transaction", "Category", "Stats", "Period", "DailyReport"],
  endpoints: (builder) => ({
    getTransactions: builder.query<
      {
        transactions: ITransaction[];
        total: number;
        totalAmount: number; // 👈 new
        page: number;
        limit: number;
        totalPages: number;
      },
      {
        page?: number;
        limit?: number;
        sort?:
          | "created_desc"
          | "date_desc"
          | "date_asc"
          | "price_desc"
          | "price_asc";
        startDate?: string;
        endDate?: string;
        categoryId?: string;
        periodId?: string;
      } | void
    >({
      query: (params) => ({ url: "/transactions", params: params || {} }),
      providesTags: ["Transaction"],
    }),
    addTransaction: builder.mutation<ITransaction, Partial<ITransaction>>({
      query: (body) => ({ url: "/transactions", method: "POST", body }),
      invalidatesTags: ["Transaction", "Stats", "Period", "DailyReport"],
    }),

    deleteTransaction: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/transactions/${id}`, method: "DELETE" }),
      invalidatesTags: ["Transaction", "Stats", "Period", "DailyReport"],
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
      { success: boolean },
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
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["Category"],
    }),

    // ==================== PERIODS ====================
    getPeriods: builder.query<IPeriodSummary[], void>({
      query: () => "/periods",
      providesTags: ["Period"],
    }),

    createPeriod: builder.mutation<
      IPeriodSummary,
      {
        name: string;
        startDate: string;
        endDate: string;
        setActive?: boolean;
      }
    >({
      query: (body) => ({ url: "/periods", method: "POST", body }),
      invalidatesTags: ["Period", "Stats"],
    }),

    updatePeriod: builder.mutation<
      { success: boolean },
      { id: string; name: string; startDate: string; endDate: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/periods/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Period", "Transaction"],
    }),

    deletePeriod: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/periods/${id}`, method: "DELETE" }),
      invalidatesTags: ["Period", "Stats"],
    }),

    setActivePeriod: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/periods/${id}/active`,
        method: "PATCH",
      }),
      invalidatesTags: ["Period", "Stats", "Transaction"],
    }),

    // ==================== STATS ====================
    getDashboardStats: builder.query<IDashboardStats, void>({
      query: () => "/stats",
      providesTags: ["Stats"],
    }),

    // ==================== REPORTS ====================
    getDailyReport: builder.query<IDailyReport[], { days?: number } | void>({
      query: (params) => ({
        url: "/reports/daily",
        params: params || {},
      }),
      providesTags: ["DailyReport"],
    }),
    // summary report for a specific period
    getPeriodSummary: builder.query<IPeriodSummaryReport, string>({
      query: (id) => `/periods/${id}/summary`,
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
  useGetPeriodsQuery,
  useCreatePeriodMutation,
  useUpdatePeriodMutation,
  useDeletePeriodMutation,
  useSetActivePeriodMutation,
  useGetDashboardStatsQuery,
  useGetDailyReportQuery,
} = apiSlice;

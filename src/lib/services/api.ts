// lib/services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ITransaction,
  ICategory,
  IDashboardStats,
  IPeriodSummary,
  IDailyReport,
  IPending,
  IPendingGrouped,
  PendingType,
  IBusiness,
  IBusinessWithTotals,
  IProfit,
} from "@/types";
import { IPeriodSummaryReport } from "../docx/period-report";

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
    "Period",
    "DailyReport",
    "Pending",
    "Business",
    "Profit",
  ],
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
    // ==================== PENDINGS ====================
    getPendings: builder.query<IPendingGrouped, void>({
      query: () => "/pendings",
      providesTags: ["Pending"],
    }),

    addPending: builder.mutation<
      IPending,
      { type: PendingType; name: string; amount: number; note?: string }
    >({
      query: (body) => ({ url: "/pendings", method: "POST", body }),
      invalidatesTags: ["Pending"],
    }),

    updatePending: builder.mutation<
      { success: boolean },
      {
        id: string;
        name?: string;
        amount?: number;
        note?: string;
        type?: PendingType;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/pendings/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Pending"],
    }),

    deletePending: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/pendings/${id}`, method: "DELETE" }),
      invalidatesTags: ["Pending"],
    }),

    // ==================== BUSINESS ====================
    getBusinesses: builder.query<IBusinessWithTotals[], void>({
      query: () => "/businesses",
      providesTags: ["Business"],
    }),

    getBusiness: builder.query<
      { business: IBusiness; profits: IProfit[]; totalProfit: number },
      string
    >({
      query: (id) => `/businesses/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Business", id }, "Profit"],
    }),

    addBusiness: builder.mutation<
      IBusinessWithTotals,
      { name: string; personName: string; amount: number; investedDate: string }
    >({
      query: (body) => ({ url: "/businesses", method: "POST", body }),
      invalidatesTags: ["Business"],
    }),

    updateBusiness: builder.mutation<
      { success: boolean },
      {
        id: string;
        name?: string;
        personName?: string;
        amount?: number;
        investedDate?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/businesses/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        "Business",
        { type: "Business", id },
      ],
    }),

    deleteBusiness: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/businesses/${id}`, method: "DELETE" }),
      invalidatesTags: ["Business"],
    }),

    addProfit: builder.mutation<
      IProfit,
      { businessId: string; month: string; amount: number }
    >({
      query: ({ businessId, ...body }) => ({
        url: `/businesses/${businessId}/profits`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { businessId }) => [
        "Business",
        "Profit",
        { type: "Business", id: businessId },
      ],
    }),

    deleteProfit: builder.mutation<
      { success: boolean },
      { businessId: string; profitId: string }
    >({
      query: ({ businessId, profitId }) => ({
        url: `/businesses/${businessId}/profits/${profitId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { businessId }) => [
        "Business",
        "Profit",
        { type: "Business", id: businessId },
      ],
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
  useGetPeriodSummaryQuery,
  useGetPendingsQuery,
  useAddPendingMutation,
  useUpdatePendingMutation,
  useDeletePendingMutation,
  useGetBusinessesQuery,
  useGetBusinessQuery,
  useAddBusinessMutation,
  useUpdateBusinessMutation,
  useDeleteBusinessMutation,
  useAddProfitMutation,
  useDeleteProfitMutation,
} = apiSlice;

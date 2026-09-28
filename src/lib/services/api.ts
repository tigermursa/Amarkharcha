// lib/services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ITransaction, ICategory, IDashboardStats } from "@/types";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include", // কুকি পাঠানোর জন্য
  }),
  tagTypes: ["Transaction", "Category", "Stats"],
  endpoints: (builder) => ({
    // ==================== ট্রানজ্যাকশন ====================
    getTransactions: builder.query<
      { transactions: ITransaction[]; total: number },
      {
        page?: number;
        limit?: number;
        categoryId?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: (params) => ({
        url: "/transactions",
        params,
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

    updateTransaction: builder.mutation<
      ITransaction,
      { id: string; body: Partial<ITransaction> }
    >({
      query: ({ id, body }) => ({
        url: `/transactions/${id}`,
        method: "PUT",
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

    // ==================== ক্যাটাগরি ====================
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
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    // ==================== ড্যাশবোর্ড স্ট্যাটস ====================
    getDashboardStats: builder.query<IDashboardStats, void>({
      query: () => "/stats",
      providesTags: ["Stats"],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useAddTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useDeleteCategoryMutation,
  useGetDashboardStatsQuery,
} = apiSlice;

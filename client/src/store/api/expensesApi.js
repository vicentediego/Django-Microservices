import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const expensesApi = createApi({
  reducerPath: "expensesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ExpenseCategory", "Expense"],
  endpoints: (builder) => ({
    // Categorias
    getExpenseCategories: builder.query({
      query: () => "/sales/categories/",
      providesTags: ["ExpenseCategory"],
    }),

    getExpenseCategoryById: builder.query({
      query: (id) => `/sales/categories/${id}/`,
      providesTags: (result, error, id) => [{ type: "ExpenseCategory", id }],
    }),

    createExpenseCategory: builder.mutation({
      query: (data) => ({
        url: "/sales/categories/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ExpenseCategory"],
    }),

    updateExpenseCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/sales/categories/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ExpenseCategory"],
    }),

    deleteExpenseCategory: builder.mutation({
      query: (id) => ({
        url: `/sales/categories/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["ExpenseCategory"],
    }),

    // Gastos
    getExpenses: builder.query({
      query: () => "/sales/expenses/",
      providesTags: ["Expense"],
    }),

    getExpenseById: builder.query({
      query: (id) => `/sales/expenses/${id}/`,
      providesTags: (result, error, id) => [{ type: "Expense", id }],
    }),

    createExpense: builder.mutation({
      query: (data) => ({
        url: "/sales/expenses/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Expense"],
    }),

    updateExpense: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/sales/expenses/${id}/update/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Expense", id },
        "Expense",
      ],
    }),

    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `/sales/expenses/${id}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expense"],
    }),
  }),
});

export const {
  useGetExpenseCategoriesQuery,
  useGetExpenseCategoryByIdQuery,
  useCreateExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
  useGetExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expensesApi;

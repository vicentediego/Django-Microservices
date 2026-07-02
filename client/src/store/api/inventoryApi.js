import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const inventoryApi = createApi({
  reducerPath: "inventoryApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Category", "Product", "ProductMovement"],
  endpoints: (builder) => ({
    // Categorias
    getCategories: builder.query({
      query: () => "/inventory/categories/",
      providesTags: ["Category"],
    }),

    createCategory: builder.mutation({
      query: (data) => ({
        url: "/inventory/categories/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/inventory/categories/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/inventory/categories/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    // Productos
    getProducts: builder.query({
      query: () => "/inventory/products/",
      providesTags: ["Product"],
    }),

    getProductById: builder.query({
      query: (id) => `/inventory/products/${id}/`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    createProduct: builder.mutation({
      query: (data) => ({
        url: "/inventory/products/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/inventory/products/${id}/update/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Product", id },
        "Product",
      ],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/inventory/products/${id}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    // Movimientos de producto
    getProductMovements: builder.query({
      query: () => "/inventory/products/movements/",
      providesTags: ["ProductMovement"],
    }),

    createProductMovement: builder.mutation({
      query: (data) => ({
        url: "/inventory/products/movements/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ProductMovement", "Product"],
    }),

    updateProductMovement: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/inventory/products/movements/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ProductMovement", "Product"],
    }),

    deleteProductMovement: builder.mutation({
      query: (id) => ({
        url: `/inventory/products/movements/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProductMovement", "Product"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductMovementsQuery,
  useCreateProductMovementMutation,
  useUpdateProductMovementMutation,
  useDeleteProductMovementMutation,
} = inventoryApi;

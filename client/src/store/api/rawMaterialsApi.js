import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const rawMaterialsApi = createApi({
  reducerPath: "rawMaterialsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["RawMaterialCategory", "RawMaterial", "RawMaterialMovement"],
  endpoints: (builder) => ({
    // Categorias
    getRawMaterialCategories: builder.query({
      query: () => "/inventory/raw-materials/categories/",
      providesTags: ["RawMaterialCategory"],
    }),

    createRawMaterialCategory: builder.mutation({
      query: (data) => ({
        url: "/inventory/raw-materials/categories/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RawMaterialCategory"],
    }),

    updateRawMaterialCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/inventory/raw-materials/categories/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["RawMaterialCategory"],
    }),

    deleteRawMaterialCategory: builder.mutation({
      query: (id) => ({
        url: `/inventory/raw-materials/categories/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["RawMaterialCategory"],
    }),

    // Insumos
    getRawMaterials: builder.query({
      query: () => "/inventory/raw-materials/",
      providesTags: ["RawMaterial"],
    }),

    getRawMaterialById: builder.query({
      query: (id) => `/inventory/raw-materials/${id}/`,
      providesTags: (result, error, id) => [{ type: "RawMaterial", id }],
    }),

    createRawMaterial: builder.mutation({
      query: (data) => ({
        url: "/inventory/raw-materials/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RawMaterial"],
    }),

    updateRawMaterial: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/inventory/raw-materials/${id}/update/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "RawMaterial", id },
        "RawMaterial",
      ],
    }),

    deleteRawMaterial: builder.mutation({
      query: (id) => ({
        url: `/inventory/raw-materials/${id}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: ["RawMaterial"],
    }),

    // Movimientos
    getRawMaterialMovements: builder.query({
      query: () => "/inventory/raw-materials/movements/",
      providesTags: ["RawMaterialMovement"],
    }),

    createRawMaterialMovement: builder.mutation({
      query: (data) => ({
        url: "/inventory/raw-materials/movements/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RawMaterialMovement", "RawMaterial"],
    }),

    updateRawMaterialMovement: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/inventory/raw-materials/movements/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["RawMaterialMovement", "RawMaterial"],
    }),

    deleteRawMaterialMovement: builder.mutation({
      query: (id) => ({
        url: `/inventory/raw-materials/movements/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["RawMaterialMovement", "RawMaterial"],
    }),
  }),
});

export const {
  useGetRawMaterialCategoriesQuery,
  useCreateRawMaterialCategoryMutation,
  useUpdateRawMaterialCategoryMutation,
  useDeleteRawMaterialCategoryMutation,
  useGetRawMaterialsQuery,
  useGetRawMaterialByIdQuery,
  useCreateRawMaterialMutation,
  useUpdateRawMaterialMutation,
  useDeleteRawMaterialMutation,
  useGetRawMaterialMovementsQuery,
  useCreateRawMaterialMovementMutation,
  useUpdateRawMaterialMovementMutation,
  useDeleteRawMaterialMovementMutation,
} = rawMaterialsApi;

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const salesApi = createApi({
  reducerPath: "salesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Sale"],
  endpoints: (builder) => ({
    getSales: builder.query({
      query: () => "/sales/sales/",
      providesTags: ["Sale"],
    }),

    getSaleById: builder.query({
      query: (id) => `/sales/sales/${id}/`,
      providesTags: (result, error, id) => [{ type: "Sale", id }],
    }),

    createSale: builder.mutation({
      query: (data) => ({
        url: "/sales/sales/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Sale"],
    }),

    updateSale: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/sales/sales/${id}/update/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Sale", id },
        "Sale",
      ],
    }),

    deleteSale: builder.mutation({
      query: (id) => ({
        url: `/sales/sales/${id}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sale"],
    }),
  }),
});

export const {
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useCreateSaleMutation,
  useUpdateSaleMutation,
  useDeleteSaleMutation,
} = salesApi;

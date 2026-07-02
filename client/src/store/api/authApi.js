import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login/",
        method: "POST",
        body: credentials,
      }),
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: "/auth/register/",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    getUsers: builder.query({
      query: () => "/auth/users/",
      providesTags: ["User"],
    }),

    getUserById: builder.query({
      query: (id) => `/auth/users/${id}/`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/auth/users/${id}/update/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        "User",
      ],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/auth/users/${id}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = authApi;

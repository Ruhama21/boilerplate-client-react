import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from 'app/redux';
import { User } from 'common/models/user';
import { environment } from 'environment';

export const userApi = createApi({
  reducerPath: 'userApi',

  baseQuery: fetchBaseQuery({
    baseUrl: `${environment.apiRoute}/users`,

    prepareHeaders: (headers: Headers, { getState }) => {
      const token = (getState() as RootState).auth.session?.token;

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ['User'],

  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => ({ url: '/' }),
      providesTags: ['User'],
    }),

    deleteUser: builder.mutation<void, number>({
      query: (userId) => ({
        url: `/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    forgotPassword: builder.mutation<void, Pick<User, 'email'>>({
      query: (payload) => ({
        url: '/forgot-password',
        method: 'POST',
        body: payload,
      }),
    }),

    resendActivationEmail: builder.mutation<void, Pick<User, 'id'>>({
      query: ({ id }) => ({
        url: `/resend-activation-email/${id}`,
        method: 'GET',
      }),
    }),

    // addUser
    // updateUser
  }),
});

export const { useGetUsersQuery, useDeleteUserMutation, useForgotPasswordMutation, useResendActivationEmailMutation } =
  userApi;
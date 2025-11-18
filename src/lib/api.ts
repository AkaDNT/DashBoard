"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";
import { setJwtToken } from "./slices/authSlice";

export interface User {
  id?: number;
  username: string;
  email: string;
}

interface TotalUsersResponse {
  totalUsers: number;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api/",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.jwtToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth: typeof rawBaseQuery = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra);
  if (result.error && (result.error as any).status === 401) {
    const refreshToken = null;
    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        { url: "auth/refresh", method: "POST", body: { refreshToken } },
        api,
        extra
      );
      if (refreshResult.data && (refreshResult.data as any).token) {
        const newToken = (refreshResult.data as any).token as string;
        api.dispatch(setJwtToken(newToken));
        return await rawBaseQuery(args, api, extra);
      }
    }
  }
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: (build) => ({
    getMe: build.query<User, void>({
      query: () => ({ url: "user/info/me", method: "GET" }),
    }),
    login: build.mutation<{ token: string }, { username: string; password: string }>({
      query: (body) => ({ url: "authenticate/login", method: "POST", body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setJwtToken(data.token));
      },
    }),
    signup: build.mutation<void, { email: string; username: string; password: string }>({
      query: (body) => ({ url: "authenticate/register", method: "POST", body }),
    }),
    getTotalUsers: build.query<TotalUsersResponse, void>({
      query: () => ({ url: "Admin/total-users", method: "GET" }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useLoginMutation,
  useSignupMutation,
  useGetTotalUsersQuery,
} = api;

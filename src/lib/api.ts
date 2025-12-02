"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";
import { setJwtToken } from "./slices/authSlice";

interface TotalUsersResponse {
  totalUsers: number;
}

interface TotalOrdersResponse {
  totalOrders: number;
}

export interface OrderItem {
  productID: string;
  productName: string;
  image: string;
  quantity: number;
  unitPrice: number;
}

export interface ReceiveInfo {
  name: string;
  phone: string;
  address: string;
}

export interface Order {
  orderID: string;
  userID: number;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string | null;
  status: string;
  createdAt: string;
  receiveInfo: ReceiveInfo | null;
}

export interface TopSellerDto {
  productId: string;
  productName: string;
  image: string;
  category: string;
  rating: number;
  orderCount: number;
  selledCount: number;
}

export interface PagedOrdersResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: Order[];
}

export interface UserProfileBanking {
  bankAccount: string | null;
  creditCard: string | null;
}

export interface UserProfile {
  id: string;
  userId: number;
  name: string | null;
  avatar: string;
  phoneNumber: string;
  gender: string;
  category: Record<string, unknown>;
  cart: unknown[];
  wishlist: unknown[];
  receiveInfo: unknown[];
  birthday: string;
  banking: UserProfileBanking;
}

export interface MongoOverview {
  databaseName: string;
  collections: number;
  objects: number;
  dataSize: number;
  storageSize: number;
  indexes: number;
  indexSize: number;
  currentConnections: number;
  availableConnections: number;
}

export interface MongoServerMetrics {
  currentConnections: number;
  availableConnections: number;

  inserts: number;
  queries: number;
  updates: number;
  deletes: number;
  commands: number;

  bytesIn: number;
  bytesOut: number;
  numRequests: number;

  cacheBytes: number;
  cacheDirtyBytes: number;
}

export interface MongoCollectionStats {
  name: string;
  count: number;
  size: number;
  storageSize: number;
  avgObjSize: number;
  totalIndexSize: number;
  indexes: number;
}

export interface MongoIndexStat {
  collection: string;
  name: string;
  key: string;
  accessesOps: number;
  since: string;  // ISO date
  isTtl: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
}

export interface PagedUsersResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: User[];
}

export interface AdminUserOverview {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  isEmailVerified: boolean;

  name: string;
  avatar: string;
  phoneNumber: string;
  gender: string;
  birthday: string;

  cartItemCount: number;
  wishlistCount: number;
  totalOrders: number;
  notConfirmOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  confirmedOrders: number;    
  totalSpent: number;
  firstOrderAt: string;
  lastOrderAt: string;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface AdminProductListItem {
  productId: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  ratingAverage: number;
  isOnSale: boolean;
  salePercent: number | null;
  imageURL: string[];
}

export interface PagedProductsResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: AdminProductListItem[];
}

export interface AdminProductOverview {
  productId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  color: string[];
  stock: number;
  sold: number;

  ratingAverage: number;
  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;

  isOnSale: boolean;
  salePercent: number | null;
  saleStart: string | null;
  saleEnd: string | null;
  imageURL: string[];

  totalOrders: number;
  totalQuantityOrdered: number;
  totalRevenue: number;

  notConfirmOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

export interface AdminProductStats {
  totalProducts: number;
  totalCategories: number;
  totalStock: number;
  totalSold: number;
}

export interface AdminProductSaleInfo {
  percent: number;      // 0.1 = 10%
  startDate: string;    // ISO
  endDate: string;      // ISO
  isActive: boolean;
}

export interface CreateAdminProductRequest {
  name: string;
  description?: string;
  price: number;
  color?: string[];
  imageURL?: string[];
  detail?: Record<string, string>;
  category: string;
  stock: number;
  sale?: AdminProductSaleInfo;
}

export interface UpdateAdminProductRequest {
  name: string;
  description?: string;
  price: number;
  color?: string[];
  imageURL?: string[];
  detail?: Record<string, string>;
  category: string;
  stock: number;
  sale?: AdminProductSaleInfo;
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
    login: build.mutation<{ token: string }, { username: string; password: string }>(
      {
        query: (body) => ({ url: "authenticate/login", method: "POST", body }),
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          const { data } = await queryFulfilled;
          dispatch(setJwtToken(data.token));
        },
      }
    ),
    signup: build.mutation<void, { email: string; username: string; password: string }>(
      {
        query: (body) => ({ url: "authenticate/register", method: "POST", body }),
      }
    ),
    getTotalUsers: build.query<TotalUsersResponse, void>({
      query: () => ({ url: "Admin/total-users", method: "GET" }),
    }),
    getTotalOrders: build.query<TotalOrdersResponse, void>({
      query: () => ({ url: "Admin/total-orders", method: "GET" }),
    }),

    getOrders: build.query<Order[], void>({
      query: () => ({
        url: "Order", 
        method: "GET",
      }),
    }),

    getTopSellers: build.query<TopSellerDto[], void>({
      query: () => ({ url: "Admin/top-sellers", method: "GET" }),
    }),

    getRecentOrders: build.query<Order[], void>({
      query: () => ({ url: "Admin/recent-orders", method: "GET" }),
    }),

    getSortedOrders: build.query<PagedOrdersResponse, { page: number }>({
      query: ({ page }) => ({
        url: "Admin/sorted-orders",
        method: "GET",
        params: { page },
      }),
    }),
    getUserProfile: build.query<UserProfile, void>({
      query: () => ({ url: "User/Info/Profile", method: "GET" }),
    }),
    updateUserProfile: build.mutation<UserProfile, UserProfile>({
      query: (body) => ({
        url: "User/Profile/Update",
        method: "PUT",
        body,
      }),
    }),
     getOrderById: build.query<Order, string | number>({
      query: (id) => ({
        url: `Order/${id}`,
        method: "GET",
      }),
    }),
    updateOrderStatus: build.mutation<string, { orderId: string; newStatus: string }>(
  {
    query: ({ orderId, newStatus }) => ({
      url: `Order/status/${orderId}`,
      method: "PUT",

      body: JSON.stringify(newStatus),

      headers: {
        "Content-Type": "application/json",
      },

      responseHandler: (response) => response.text(), 
    }),
  }
),
    deleteOrders: build.mutation<number, string[]>({
          query: (orderIds) => ({
            url: "Order/Admin/orders",
            method: "DELETE",
            body: orderIds, 
          }),
        }),
    getMongoOverview: build.query<MongoOverview, void>({
      query: () => ({ url: "Admin/overview", method: "GET" }),
    }),

    getMongoServerMetrics: build.query<MongoServerMetrics, void>({
      query: () => ({ url: "Admin/server", method: "GET" }),
    }),

    getMongoCollectionStats: build.query<MongoCollectionStats, string>({
      query: (name) => ({
        url: `Admin/collection/${name}`,
        method: "GET",
      }),
    }),

    getMongoIndexStats: build.query<MongoIndexStat[], string>({
      query: (collection) => ({
        url: `Admin/collection/${collection}/indexes`,
        method: "GET",
      }),
    }),

    getAdminUsers: build.query<
  PagedUsersResponse,
  { page: number; pageSize: number; keyword?: string }
>({
  query: ({ page, pageSize, keyword }) => ({
    url: "Admin/users",
    method: "GET",
    params: {
      page,
      pageSize,
      ...(keyword ? { keyword } : {}),
    },
  }),
}),
    getAdminUserOverview: build.query<AdminUserOverview, number>({
  query: (id) => ({
    url: `Admin/users/${id}/overview`,
    method: "GET",
  }),
}),

    deleteAdminUsers: build.mutation<number, number[]>({
  query: (userIds) => ({
    url: "Admin/users",
    method: "DELETE",
    body: userIds, 
  }),
}),
    updateUserRole: build.mutation<void, { id: number; isAdmin: boolean }>({
      query: ({ id, isAdmin }) => ({
        url: `Admin/users/${id}/role`,
        method: "PUT",
        body: { isAdmin }, 
      }),
    }),
    createUser: build.mutation<void, CreateUserRequest>({
  query: (body) => ({
    url: "User",              
    method: "POST",
    body,
  }),
}),

    getAdminProducts: build.query<
      PagedProductsResponse,
      { page: number; pageSize: number; keyword?: string; category?: string }
    >({
      query: ({ page, pageSize, keyword, category }) => ({
        url: "Admin/products",
        method: "GET",
        params: {
          page,
          pageSize,
          ...(keyword ? { keyword } : {}),
          ...(category ? { category } : {}),
        },
      }),
    }),

    getAdminProductOverview: build.query<AdminProductOverview, string>({
      query: (id) => ({
        url: `Admin/products/${id}/overview`,
        method: "GET",
      }),
    }),

    getAdminProductStats: build.query<AdminProductStats, void>({
      query: () => ({
        url: "Admin/products/statistics",
        method: "GET",
      }),
    }),

    createAdminProduct: build.mutation<
      AdminProductOverview,
      CreateAdminProductRequest
    >({
      query: (body) => ({
        url: "Admin/products",
        method: "POST",
        body,
      }),
    }),

    updateAdminProduct: build.mutation<
      AdminProductOverview,
      { id: string; data: UpdateAdminProductRequest }
    >({
      query: ({ id, data }) => ({
        url: `Admin/products/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    deleteAdminProducts: build.mutation<number, string[]>({
      query: (productIds) => ({
        url: "Admin/products",
        method: "DELETE",
        body: productIds,
      }),
    }),

    updateProductSale: build.mutation<
      void,
      { id: string; sale: AdminProductSaleInfo }
    >({
      query: ({ id, sale }) => ({
        url: `Admin/products/${id}/sale`,
        method: "PUT",
        body: sale,
      }),
    }),

    getActiveSaleProducts: build.query<AdminProductOverview[], void>({
      query: () => ({
        url: "Admin/products/active-sales",
        method: "GET",
      }),
    }),

    applyRandomSales: build.mutation<void, { numberOfProducts: number }>({
      query: ({ numberOfProducts }) => ({
        url: "Admin/products/random-sales",
        method: "POST",
        params: { numberOfProducts },
      }),
    }),




  }),
    
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useLoginMutation,
  useSignupMutation,
  useGetTotalUsersQuery,
  useGetTotalOrdersQuery,
  useGetOrdersQuery,
  useGetTopSellersQuery,
  useGetRecentOrdersQuery,
  useGetSortedOrdersQuery,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrdersMutation,
  useGetMongoOverviewQuery,
  useGetMongoServerMetricsQuery,
  useGetMongoCollectionStatsQuery,
  useGetMongoIndexStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminUserOverviewQuery,
  useDeleteAdminUsersMutation,
  useUpdateUserRoleMutation,
  useCreateUserMutation,
  useGetAdminProductsQuery,
  useGetAdminProductOverviewQuery,
  useGetAdminProductStatsQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useDeleteAdminProductsMutation,
  useUpdateProductSaleMutation,
  useGetActiveSaleProductsQuery,
  useApplyRandomSalesMutation,
} = api;

"use client";
import React, { useMemo } from "react";
import { BoxIconLine, GroupIcon } from "@/icons";
import {
  useGetTotalUsersQuery,
  useGetTotalOrdersQuery,
  useGetOrdersQuery,
  useGetAdminProductStatsQuery,
} from "@/lib/api";

export const EcommerceMetrics = () => {
  const {
    data: usersData,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useGetTotalUsersQuery();

  const {
    data: ordersCountData,
    isLoading: isOrdersCountLoading,
    isError: isOrdersCountError,
  } = useGetTotalOrdersQuery();

  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    isError: isOrdersError,
  } = useGetOrdersQuery();

  const {
    data: productStats,
    isLoading: isProductStatsLoading,
    isError: isProductStatsError,
  } = useGetAdminProductStatsQuery();

  const {
    totalRevenue,
    deliveredOrdersCount,
    cancelRate,
    deliveredRate,
    avgOrderValue,
  } = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalRevenue: 0,
        deliveredOrdersCount: 0,
        cancelRate: 0,
        deliveredRate: 0,
        avgOrderValue: 0,
      };
    }

    const delivered = orders.filter((o) => o.status === "Delivered");
    const cancelled = orders.filter((o) => o.status === "Cancelled");

    const revenue = delivered.reduce((sum, o) => sum + o.totalAmount, 0);

    const deliveredCount = delivered.length;
    const totalOrders = orders.length;

    const deliveredRate =
      totalOrders > 0 ? (deliveredCount / totalOrders) * 100 : 0;

    const cancelRate =
      totalOrders > 0 ? (cancelled.length / totalOrders) * 100 : 0;

    const avgOrderValue = deliveredCount > 0 ? revenue / deliveredCount : 0;

    return {
      totalRevenue: revenue,
      deliveredOrdersCount: deliveredCount,
      cancelRate,
      deliveredRate,
      avgOrderValue,
    };
  }, [orders]);

  const totalUsers =
    !isUsersLoading && !isUsersError && usersData
      ? usersData.totalUsers
      : null;

  const totalOrders =
    !isOrdersCountLoading && !isOrdersCountError && ordersCountData
      ? ordersCountData.totalOrders
      : null;

  const totalProducts =
    !isProductStatsLoading && !isProductStatsError && productStats
      ? productStats.totalProducts
      : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
          <GroupIcon className="size-6 text-gray-800 dark:text-white/90" />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Người dùng
            </span>
            <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
              {totalUsers !== null
                ? totalUsers.toLocaleString("vi-VN")
                : "Đang tải..."}
            </h4>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Đơn hàng
            </span>
            <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
              {totalOrders !== null
                ? totalOrders.toLocaleString("vi-VN")
                : "Đang tải..."}
            </h4>
            <p className="mt-1 text-xs text-gray-400">
              Đã giao: {deliveredOrdersCount.toLocaleString("vi-VN")} (
              {deliveredRate.toFixed(1)}%)
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
          <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            ₫
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div className="min-w-0">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Doanh thu (đơn đã giao)
            </span>
            <h4 className="mt-2 text-base sm:text-lg font-bold text-gray-800 dark:text-white/90 break-all leading-tight">
              {isOrdersLoading || isOrdersError
                ? "Đang tải..."
                : totalRevenue.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  })}
            </h4>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            AOV
          </span>
        </div>
        <div className="mt-5 space-y-1">
          <div className="flex items-end justify-between">
            <div className="min-w-0">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Giá trị đơn hàng trung bình
              </span>
              <h4 className="mt-2 text-base sm:text-lg font-bold text-gray-800 dark:text-white/90 break-all leading-tight">
                {isOrdersLoading || isOrdersError
                  ? "Đang tải..."
                  : avgOrderValue.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      maximumFractionDigits: 0,
                    })}
              </h4>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Sản phẩm:{" "}
            {totalProducts !== null
              ? totalProducts.toLocaleString("vi-VN")
              : "..."}{" "}
            • Tỷ lệ huỷ: {cancelRate.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

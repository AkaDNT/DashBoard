"use client";

import React, { useMemo } from "react";
import { useGetAdminProductStatsQuery } from "@/lib/api";

export const ProductStatsCard: React.FC = () => {
  const {
    data: stats,
    isLoading,
    isError,
  } = useGetAdminProductStatsQuery();

  const sellThrough = useMemo(() => {
    if (!stats) return 0;
    const total = stats.totalStock + stats.totalSold;
    if (total === 0) return 0;
    return (stats.totalSold / total) * 100;
  }, [stats]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
        Đang tải thống kê sản phẩm...
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-600">
        Không thể tải thống kê sản phẩm.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Tổng quan sản phẩm
        </h3>
        <span className="text-xs font-medium text-gray-400">
          {stats.totalCategories} danh mục
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tổng số sản phẩm
          </p>
          <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
            {stats.totalProducts.toLocaleString("vi-VN")}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Số lượng đã bán
          </p>
          <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
            {stats.totalSold.toLocaleString("vi-VN")}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Số lượng tồn kho
          </p>
          <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
            {stats.totalStock.toLocaleString("vi-VN")}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tỷ lệ bán hết
          </p>
          <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
            {sellThrough.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Đã bán / Tồn kho</span>
          <span>
            {stats.totalSold.toLocaleString("vi-VN")} /{" "}
            {(stats.totalSold + stats.totalStock).toLocaleString("vi-VN")}
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className="h-2 rounded-full bg-indigo-500 dark:bg-indigo-400"
            style={{ width: `${sellThrough}%` }}
          />
        </div>
      </div>
    </div>
  );
};

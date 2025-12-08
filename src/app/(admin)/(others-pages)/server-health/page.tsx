"use client";

import React from "react";
import {
  useGetMongoOverviewQuery,
  useGetMongoServerMetricsQuery,
  useGetMongoCollectionStatsQuery,
  useGetMongoIndexStatsQuery,
} from "@/lib/api";

function formatBytes(bytes: number) {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(1)} ${units[i]}`;
}

export default function MongoDashboardPage() {
  const {
    data: overview,
    isLoading: loadingOverview,
    isError: errorOverview,
  } = useGetMongoOverviewQuery();

  const {
    data: server,
    isLoading: loadingServer,
    isError: errorServer,
  } = useGetMongoServerMetricsQuery();

  // 7 collections cố định → dùng 7 hook (ổn vì số lượng nhỏ & cố định)
  const cartsStats = useGetMongoCollectionStatsQuery("Carts");
  const categoryStats = useGetMongoCollectionStatsQuery("Category");
  const orderStats = useGetMongoCollectionStatsQuery("Order");
  const productStats = useGetMongoCollectionStatsQuery("Product");
  const repliesStats = useGetMongoCollectionStatsQuery("Replies");
  const reviewsStats = useGetMongoCollectionStatsQuery("Reviews");
  const userDetailStats = useGetMongoCollectionStatsQuery("UserDetail");

  const cartsIdx = useGetMongoIndexStatsQuery("Carts");
  const categoryIdx = useGetMongoIndexStatsQuery("Category");
  const orderIdx = useGetMongoIndexStatsQuery("Order");
  const productIdx = useGetMongoIndexStatsQuery("Product");
  const repliesIdx = useGetMongoIndexStatsQuery("Replies");
  const reviewsIdx = useGetMongoIndexStatsQuery("Reviews");
  const userDetailIdx = useGetMongoIndexStatsQuery("UserDetail");

  const collectionRows = [
    { label: "Carts", ...cartsStats },
    { label: "Category", ...categoryStats },
    { label: "Order", ...orderStats },
    { label: "Product", ...productStats },
    { label: "Replies", ...repliesStats },
    { label: "Reviews", ...reviewsStats },
    { label: "UserDetail", ...userDetailStats },
  ];

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* DB overview + connections */}
      <div className="col-span-12 xl:col-span-7">
        <MongoOverviewCard
          overview={overview}
          loading={loadingOverview}
          error={errorOverview}
        />
      </div>

      {/* Server metrics */}
      <div className="col-span-12 xl:col-span-5">
        <MongoServerCard
          metrics={server}
          loading={loadingServer}
          error={errorServer}
        />
      </div>

      {/* Collection stats */}
      <div className="col-span-12">
        <MongoCollectionsCard
          rows={collectionRows}
          formatBytes={formatBytes}
        />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <MongoIndexHealthCard
          stats={[
            { label: "Carts", hook: cartsIdx },
            { label: "Category", hook: categoryIdx },
            { label: "Order", hook: orderIdx },
            { label: "Product", hook: productIdx },
            { label: "Replies", hook: repliesIdx },
            { label: "Reviews", hook: reviewsIdx },
            { label: "UserDetail", hook: userDetailIdx },
          ]}
        />
      </div>
    </div>
  );
}

/* --------- Cards components ---------- */

type OverviewProps = {
  overview: import("@/lib/api").MongoOverview | undefined;
  loading: boolean;
  error: boolean;
};

function MongoOverviewCard({ overview, loading, error }: OverviewProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
        Đang tải tổng quan MongoDB...
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10">
        Không thể tải tổng quan MongoDB.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Tổng quan MongoDB
      </h3>
      <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
        Tóm tắt sức khỏe và kích thước cơ sở dữ liệu
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <OverviewStat
          label="Cơ sở dữ liệu"
          value={overview.databaseName}
          muted
        />
        <OverviewStat
          label="Số collection"
          value={overview.collections.toLocaleString()}
        />
        <OverviewStat
          label="Số document"
          value={overview.objects.toLocaleString()}
        />
        <OverviewStat
          label="Dung lượng dữ liệu"
          value={formatBytes(overview.dataSize)}
        />
        <OverviewStat
          label="Dung lượng lưu trữ"
          value={formatBytes(overview.storageSize)}
        />
        <OverviewStat
          label="Indexes"
          value={`${overview.indexes.toLocaleString()} (${formatBytes(
            overview.indexSize
          )})`}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm dark:border-gray-700/60 dark:bg-white/[0.02]">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Kết nối
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Hiện tại:{" "}
            <span className="font-semibold text-gray-800 dark:text-white/90">
              {overview.currentConnections}
            </span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Còn trống:{" "}
            <span className="font-semibold text-gray-800 dark:text-white/90">
              {overview.availableConnections}
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm dark:border-gray-700/60 dark:bg-white/[0.02]">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Dữ liệu vs Chỉ mục
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Dữ liệu: {formatBytes(overview.dataSize)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Chỉ mục: {formatBytes(overview.indexSize)}
          </p>

          {/* simple progress bar */}
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            {(() => {
              const data = overview.dataSize;
              const index = overview.indexSize;
              const total = data + index || 1;
              const dataPercent = (data / total) * 100;
              return (
                <div className="flex h-full w-full">
                  <span
                    className="h-full bg-indigo-500"
                    style={{ width: `${dataPercent}%` }}
                  />
                  <span
                    className="h-full bg-emerald-400/80"
                    style={{ width: `${100 - dataPercent}%` }}
                  />
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewStat({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700/60 dark:bg-white/[0.02]">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p
        className={`mt-1 text-base font-semibold ${
          muted
            ? "text-gray-700 dark:text-gray-300"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

type ServerProps = {
  metrics: import("@/lib/api").MongoServerMetrics | undefined;
  loading: boolean;
  error: boolean;
};

function MongoServerCard({ metrics, loading, error }: ServerProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
        Đang tải số liệu server...
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10">
        Không thể tải số liệu server.
      </div>
    );
  }

  const connectionUsedPercent =
    metrics.availableConnections + metrics.currentConnections > 0
      ? (metrics.currentConnections /
          (metrics.availableConnections + metrics.currentConnections)) *
        100
      : 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Số liệu server MongoDB
      </h3>
      <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
        Kết nối, thao tác và bộ nhớ đệm (WiredTiger)
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4">
        {/* Kết nối */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm dark:border-gray-700/60 dark:bg-white/[0.02]">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Mức sử dụng kết nối
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {metrics.currentConnections}
            <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              / {metrics.currentConnections + metrics.availableConnections}
            </span>
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className="h-full bg-indigo-500"
              style={{ width: `${connectionUsedPercent.toFixed(1)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {connectionUsedPercent.toFixed(1)}% đang được sử dụng
          </p>
        </div>

        {/* WiredTiger cache */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm dark:border-gray-700/60 dark:bg-white/[0.02]">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Bộ nhớ đệm WiredTiger
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Trong bộ nhớ đệm:{" "}
            <span className="font-semibold text-gray-800 dark:text-white/90">
              {formatBytes(metrics.cacheBytes)}
            </span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Dữ liệu bẩn (dirty):{" "}
            <span className="font-semibold text-gray-800 dark:text-white/90">
              {formatBytes(metrics.cacheDirtyBytes)}
            </span>
          </p>
        </div>
      </div>

      {/* Thao tác & request */}
      <div className="mt-5 grid grid-cols-3 gap-4 text-sm">
        <ServerStat
          label="Thêm (insert)"
          value={metrics.inserts.toLocaleString()}
        />
        <ServerStat
          label="Truy vấn (query)"
          value={metrics.queries.toLocaleString()}
        />
        <ServerStat
          label="Cập nhật (update)"
          value={metrics.updates.toLocaleString()}
        />
        <ServerStat
          label="Xóa (delete)"
          value={metrics.deletes.toLocaleString()}
        />
        <ServerStat
          label="Lệnh (command)"
          value={metrics.commands.toLocaleString()}
        />
        <ServerStat
          label="Yêu cầu (request)"
          value={metrics.numRequests.toLocaleString()}
        />
      </div>

      {/* Bytes in/out */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <ServerStat
          label="Dung lượng vào (bytes in)"
          value={formatBytes(metrics.bytesIn)}
        />
        <ServerStat
          label="Dung lượng ra (bytes out)"
          value={formatBytes(metrics.bytesOut)}
        />
      </div>
    </div>
  );
}

function ServerStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-700/60 dark:bg-white/[0.02]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
        {value}
      </p>
    </div>
  );
}


type CollectionsCardProps = {
  rows: {
    label: string;
    data?: import("@/lib/api").MongoCollectionStats;
    isLoading?: boolean;
    isError?: boolean;
  }[];
  formatBytes: (v: number) => string;
};

function MongoCollectionsCard({ rows, formatBytes }: CollectionsCardProps) {
  const isLoading = rows.some((r) => r.isLoading);
  const isError = rows.some((r) => r.isError);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
        Đang tải thống kê collection...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10">
        Không thể tải thống kê collection.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Tổng quan collection
      </h3>
      <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
        Các collection của ứng dụng (Carts, Orders, Products, Reviews, ...)
      </p>

      <div className="mt-5 max-w-full overflow-x-auto custom-scrollbar">
        <table className="min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:border-gray-800">
              <th className="py-2 pr-4">Collection</th>
              <th className="py-2 px-4 text-right">Số document</th>
              <th className="py-2 px-4 text-right">Dung lượng dữ liệu</th>
              <th className="py-2 px-4 text-right">Dung lượng lưu trữ</th>
              <th className="py-2 px-4 text-right">Doc trung bình</th>
              <th className="py-2 px-4 text-right">Số index</th>
              <th className="py-2 pl-4 text-right">Dung lượng index</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const s = row.data;
              if (!s) return null;
              return (
                <tr
                  key={row.label}
                  className="border-b border-gray-50 text-gray-700 last:border-none dark:border-gray-800 dark:text-gray-300"
                >
                  <td className="py-2 pr-4 font-medium text-gray-800 dark:text-white">
                    {row.label}
                  </td>
                  <td className="py-2 px-4 text-right">
                    {s.count.toLocaleString()}
                  </td>
                  <td className="py-2 px-4 text-right">
                    {formatBytes(s.size * 1024)} {/* scale=1024 => KB */}
                  </td>
                  <td className="py-2 px-4 text-right">
                    {formatBytes(s.storageSize * 1024)}
                  </td>
                  <td className="py-2 px-4 text-right">
                    {s.avgObjSize > 0 ? formatBytes(s.avgObjSize * 1024) : "-"}
                  </td>
                  <td className="py-2 px-4 text-right">
                    {s.indexes.toLocaleString()}
                  </td>
                  <td className="py-2 pl-4 text-right">
                    {formatBytes(s.totalIndexSize * 1024)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type IndexHealthProps = {
  stats: {
    label: string;
    hook: {
      data?: import("@/lib/api").MongoIndexStat[];
      isLoading: boolean;
      isError: boolean;
    };
  }[];
};

function MongoIndexHealthCard({ stats }: IndexHealthProps) {
  const isLoading = stats.some((s) => s.hook.isLoading);
  const isError = stats.some((s) => s.hook.isError);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
        Đang tải tình trạng index...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10">
        Không thể tải thống kê index.
      </div>
    );
  }

  const allIndexes: import("@/lib/api").MongoIndexStat[] = [];
  stats.forEach((s) => {
    if (s.hook.data) allIndexes.push(...s.hook.data);
  });

  const topIndexes = [...allIndexes]
    .sort((a, b) => b.accessesOps - a.accessesOps)
    .slice(0, 10);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Tình trạng index
      </h3>
      <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
        Top 10 index được sử dụng nhiều nhất trên các collection
      </p>

      <div className="mt-4 max-w-full overflow-x-auto custom-scrollbar">
        <table className="min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:border-gray-800">
              <th className="py-2 pr-3">Collection</th>
              <th className="py-2 px-3">Index</th>
              <th className="py-2 px-3">Key</th>
              <th className="py-2 px-3 text-right">Số lần truy cập</th>
              <th className="py-2 pl-3 text-right">Từ thời điểm</th>
            </tr>
          </thead>
          <tbody>
            {topIndexes.map((idx) => (
              <tr
                key={`${idx.collection}-${idx.name}`}
                className="border-b border-gray-50 text-gray-700 last:border-none dark:border-gray-800 dark:text-gray-300"
              >
                <td className="py-2 pr-3 font-medium text-gray-800 dark:text-white">
                  {idx.collection}
                  {idx.isTtl && (
                    <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                      TTL
                    </span>
                  )}
                </td>
                <td className="py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-200">
                  {idx.name}
                </td>
                <td className="py-2 px-3 text-xs text-gray-500 dark:text-gray-400">
                  {idx.key}
                </td>
                <td className="py-2 px-3 text-right">
                  {idx.accessesOps.toLocaleString()}
                </td>
                <td className="py-2 pl-3 text-right text-xs text-gray-500 dark:text-gray-400">
                  {idx.since ? new Date(idx.since).toLocaleString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

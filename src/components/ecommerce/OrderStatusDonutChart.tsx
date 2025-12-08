"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useGetOrderStatusDistributionQuery } from "@/lib/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// Map status -> nhãn tiếng Việt
const statusLabelMap: Record<string, string> = {
  Pending: "Đang xử lý",
  Delivered: "Đã giao",
  Cancelled: "Đã huỷ",
  NotConfirm: "Chưa xác nhận",
  Confirmed: "Đã xác nhận",
  "To rate": "Chờ đánh giá",
  Shipping: "Đang giao",
};

// Map status -> màu (mỗi status 1 màu)
const statusColorMap: Record<string, string> = {
  Pending: "#F97316",    // cam
  Delivered: "#22C55E",  // xanh lá
  Cancelled: "#EF4444",  // đỏ
  NotConfirm: "#6B7280", // xám
  Confirmed: "#3B82F6",  // xanh dương
  "To rate": "#A855F7",  // tím
  Shipping: "#0EA5E9",   // xanh cyan
};

// fallback palette nếu có status lạ
const fallbackColors = [
  "#6366F1",
  "#22C55E",
  "#F97316",
  "#EF4444",
  "#0EA5E9",
  "#6B7280",
  "#A855F7",
  "#14B8A6",
  "#FACC15",
  "#FB7185",
];

export default function OrderStatusDonutChart() {
  const { data = [], isLoading, isError } =
    useGetOrderStatusDistributionQuery();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
        Đang tải trạng thái đơn hàng...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-600">
        Không thể tải trạng thái đơn hàng.
      </div>
    );
  }

  // Nhãn & data
  const labels = data.map((d) => statusLabelMap[d.status] ?? d.status);
  const series = data.map((d) => d.count);

  // Mỗi status 1 màu
  const colors = data.map((d, idx) => {
    const c = statusColorMap[d.status];
    if (c) return c;
    return fallbackColors[idx % fallbackColors.length];
  });

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
    },
    labels,
    legend: {
      position: "bottom",
      fontSize: "11px",
    },
    dataLabels: { enabled: false },
    colors,
    tooltip: {
      y: {
        formatter: (val: number) => `${val} đơn hàng`,
      },
    },
  };

  const total = series.reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Trạng thái đơn hàng
        </h3>
        <span className="text-xs text-gray-400">
          Tổng: {total.toLocaleString("vi-VN")}
        </span>
      </div>

      {series.length === 0 ? (
        <p className="text-sm text-gray-400">Không có đơn hàng.</p>
      ) : (
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={260}
        />
      )}
    </div>
  );
}

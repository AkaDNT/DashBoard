"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useGetOrdersQuery } from "@/lib/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

function formatCurrency(value: number) {
  return Math.round(value).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
}

function getMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function MonthlyTarget() {
  const { data: orders = [], isLoading, isError } = useGetOrdersQuery();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const currentMonthValue = `${currentYear}-${String(currentMonth).padStart(
    2,
    "0"
  )}`;

  const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), 1);
  const minMonthValue = `${fiveYearsAgo.getFullYear()}-${String(
    fiveYearsAgo.getMonth() + 1
  ).padStart(2, "0")}`;

  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);

  // Tách selectedMonth -> năm / tháng số
  const [selectedYearStr, selectedMonthStr] = selectedMonth.split("-");
  const selectedYearNum = Number(selectedYearStr);
  const selectedMonthNum = Number(selectedMonthStr);

  // Label hiển thị dạng MM/YYYY (không phụ thuộc locale)
  const selectedMonthLabel = `${selectedMonthStr}/${selectedYearStr}`;

  const deliveredOrders = orders.filter((o) => o.status === "Delivered");

  const selectedMonthRevenue = deliveredOrders
    .filter((o) => getMonthKey(o.createdAt) === selectedMonth)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const selectedDate = new Date(selectedYearNum, selectedMonthNum - 1, 1);
  const prevMonthDate = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() - 1,
    1
  );
  const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(
    prevMonthDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const lastMonthRevenue = deliveredOrders
    .filter((o) => getMonthKey(o.createdAt) === prevMonthKey)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const diffRevenue = selectedMonthRevenue - lastMonthRevenue;

  let percentChange = 0;
  if (lastMonthRevenue > 0) {
    percentChange = (diffRevenue / lastMonthRevenue) * 100;
  } else if (lastMonthRevenue === 0 && selectedMonthRevenue > 0) {
    percentChange = 100;
  } else {
    percentChange = 0;
  }

  const displayPercent = Math.abs(percentChange);
  const percentLabel = `${displayPercent.toFixed(1)}%`;

  const sign = diffRevenue > 0 ? "+" : diffRevenue < 0 ? "-" : "";
  const centerText = `${sign}${displayPercent.toFixed(2)}%`;

  const chartPercent = Math.min(Math.max(displayPercent, 0), 100);
  const series = [Number(chartPercent.toFixed(2))];

  let changeSentence: string;
  if (lastMonthRevenue === 0 && selectedMonthRevenue === 0) {
    changeSentence = "bằng cùng kỳ tháng trước.";
  } else if (diffRevenue > 0) {
    changeSentence = `tăng ${percentLabel} so với cùng kỳ tháng trước.`;
  } else if (diffRevenue < 0) {
    changeSentence = `giảm ${percentLabel} so với cùng kỳ tháng trước.`;
  } else {
    changeSentence = "bằng cùng kỳ tháng trước.";
  }

  const valueColor =
    diffRevenue > 0 ? "#16a34a" : diffRevenue < 0 ? "#dc2626" : "#1D2939";

  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: valueColor,
            formatter: () => centerText,
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Tiến độ"],
  };

  // Hàm update selectedMonth từ năm + tháng, vẫn check min/max như cũ
  function updateSelectedMonth(year: number, month: number) {
    const value = `${year}-${String(month).padStart(2, "0")}`;
    if (value > currentMonthValue) return;
    if (value < minMonthValue) return;
    setSelectedMonth(value);
  }

  function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newYear = Number(e.target.value);
    updateSelectedMonth(newYear, selectedMonthNum);
  }

  function handleMonthNumberChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newMonth = Number(e.target.value);
    updateSelectedMonth(selectedYearNum, newMonth);
  }

  // Tạo danh sách năm (5 năm gần nhất đến hiện tại)
  const yearOptions: number[] = [];
  for (let y = fiveYearsAgo.getFullYear(); y <= currentYear; y++) {
    yearOptions.push(y);
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-100 p-6 text-sm text-gray-500">
        Đang tải dữ liệu doanh thu theo tháng...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-500">
        Không thể tải dữ liệu đơn hàng.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="rounded-2xl bg-white px-5 pb-11 pt-5 shadow-default dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              So sánh doanh thu theo tháng
            </h3>
            <p className="mt-1 text-theme-sm font-normal text-gray-500 dark:text-gray-400">
              Tháng này so với cùng kỳ tháng trước (chỉ đơn đã giao)
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
              Tháng / Năm
            </span>
            <div className="flex items-center gap-2">
              {/* chọn tháng dạng số 1–12 */}
              <select
                value={selectedMonthNum}
                onChange={handleMonthNumberChange}
                className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-xs font-medium text-gray-700 shadow-theme-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>

              {/* chọn năm dạng số */}
              <select
                value={selectedYearNum}
                onChange={handleYearChange}
                className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-xs font-medium text-gray-700 shadow-theme-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-[10px] text-gray-400">
              Trong khoảng 5 năm gần nhất
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="max-h-[330px]">
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>
        </div>

        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          Doanh thu lũy kế của {selectedMonthLabel} là{" "}
          {formatCurrency(selectedMonthRevenue)}, {changeSentence}
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Tháng này
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {formatCurrency(selectedMonthRevenue)}
          </p>
        </div>

        <div className="h-7 w-px bg-gray-200 dark:bg-gray-800" />

        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Tháng trước
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {formatCurrency(lastMonthRevenue)}
          </p>
        </div>

        <div className="h-7 w-px bg-gray-200 dark:bg-gray-800" />

        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Chênh lệch
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {diffRevenue > 0 ? "+" : diffRevenue < 0 ? "-" : ""}
            {formatCurrency(Math.abs(diffRevenue))}
          </p>
        </div>
      </div>
    </div>
  );
}

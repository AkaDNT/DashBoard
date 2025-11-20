"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useGetOrdersQuery } from "@/lib/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

function formatCurrency(value: number) {
  return "$" + Math.round(value).toLocaleString("en-US");
}

function getMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function MonthlyTarget() {
  const { data: orders = [], isLoading, isError } = useGetOrdersQuery();

  const now = new Date();

  const currentMonthValue = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), 1);
  const minMonthValue = `${fiveYearsAgo.getFullYear()}-${String(
    fiveYearsAgo.getMonth() + 1
  ).padStart(2, "0")}`;

  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);

  const selectedMonthLabel = new Date(
    Number(selectedMonth.split("-")[0]),
    Number(selectedMonth.split("-")[1]) - 1
  ).toLocaleString("en-US", { month: "short", year: "numeric" });

  const deliveredOrders = orders.filter((o) => o.status === "Delivered");

  const selectedMonthRevenue = deliveredOrders
    .filter((o) => getMonthKey(o.createdAt) === selectedMonth)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const selectedDate = new Date(
    Number(selectedMonth.split("-")[0]),
    Number(selectedMonth.split("-")[1]) - 1,
    1
  );
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

  const chartPercent = Math.min(Math.max(displayPercent, 0), 100);
  const series = [Number(chartPercent.toFixed(2))];

  const badgeText =
    diffRevenue > 0
      ? `+${percentLabel}`
      : diffRevenue < 0
      ? `-${percentLabel}`
      : `${percentLabel}`;

  let changeSentence: string;
  if (lastMonthRevenue === 0 && selectedMonthRevenue === 0) {
    changeSentence = "equal to the same period last month.";
  } else if (diffRevenue > 0) {
    changeSentence = `up ${percentLabel} vs the same period last month.`;
  } else if (diffRevenue < 0) {
    changeSentence = `down ${percentLabel} vs the same period last month.`;
  } else {
    changeSentence = "equal to the same period last month.";
  }

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
            color: "#1D2939",
            formatter: function (val) {
              return val + "%";
            },
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
    labels: ["Progress"],
  };

  function handleMonthChange(e: any) {
    const value = e.target.value as string;
    if (!value) return;

    if (value > currentMonthValue) return;

    if (value < minMonthValue) return;

    setSelectedMonth(value);
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-100 p-6 text-sm text-gray-500">
        Loading monthly revenue...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-500">
        Failed to load orders data.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="rounded-2xl bg-white px-5 pb-11 pt-5 shadow-default dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Monthly Revenue Comparison
            </h3>
            <p className="mt-1 text-theme-sm font-normal text-gray-500 dark:text-gray-400">
              This month vs same period last month (Delivered orders only)
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
              Month
            </span>
            <input
              type="month"
              value={selectedMonth}
              min={minMonthValue}
              max={currentMonthValue}
              onChange={handleMonthChange}
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 shadow-theme-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
            <span className="text-[10px] text-gray-400">
              Format: YYYY-MM (last 5 years)
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

          <span className="absolute left-1/2 top	full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            {badgeText}
          </span>
        </div>
        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          MTD of {selectedMonthLabel} is{" "}
          {formatCurrency(selectedMonthRevenue)}, {changeSentence}
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            This Month
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {formatCurrency(selectedMonthRevenue)}
          </p>
        </div>

        <div className="h-7 w-px bg-gray-200 dark:bg-gray-800" />

        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Last Month
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {formatCurrency(lastMonthRevenue)}
          </p>
        </div>

        <div className="h-7 w-px bg-gray-200 dark:bg-gray-800" />

        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Difference
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

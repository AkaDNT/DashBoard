"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useGetOrdersQuery } from "@/lib/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlySalesChart() {
  const { data: orders = [], isLoading, isError } = useGetOrdersQuery();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [metric, setMetric] = useState<"orders" | "revenue">("orders");
  const [isOpen, setIsOpen] = useState(false);

  const monthlyOrders = Array.from({ length: 12 }, () => 0);
  const monthlyRevenue = Array.from({ length: 12 }, () => 0);

  orders.forEach((order) => {
    if (order.status !== "Delivered") return;

    const date = new Date(order.createdAt);
    const year = date.getFullYear();
    if (year !== selectedYear) return;

    const monthIndex = date.getMonth();
    if (monthIndex < 0 || monthIndex > 11) return;

    monthlyOrders[monthIndex] += 1;
    monthlyRevenue[monthIndex] += order.totalAmount;
  });

  const totalOrdersYear = monthlyOrders.reduce((a, b) => a + b, 0);
  const totalRevenueYear = monthlyRevenue.reduce((a, b) => a + b, 0);

  const chartData = metric === "orders" ? monthlyOrders : monthlyRevenue;

  const series = [
    {
      name:
        metric === "orders"
          ? `Đơn hàng ${selectedYear}`
          : `Doanh thu ${selectedYear}`,
      data: chartData,
    },
  ];

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Th1",
        "Th2",
        "Th3",
        "Th4",
        "Th5",
        "Th6",
        "Th7",
        "Th8",
        "Th9",
        "Th10",
        "Th11",
        "Th12",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: false,
    },
    yaxis: {
      labels: {
        formatter: (val: number) =>
          metric === "orders"
            ? val.toFixed(0)
            : `${(val / 1_000_000).toFixed(1)} triệu`,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) =>
          metric === "orders"
            ? `${val} đơn hàng`
            : `${val.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              })}`,
      },
    },
  };

  function toggleDropdown() {
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function handleYearSelect(year: number) {
    setSelectedYear(year);
    closeDropdown();
  }

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 py-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
        Đang tải dữ liệu doanh số theo tháng...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-600">
        Không thể tải dữ liệu doanh số theo tháng.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {metric === "orders"
              ? "Đơn hàng theo tháng"
              : "Doanh thu theo tháng"}
          </h3>
          <p className="mt-1 text-xs text-gray-400">
            {metric === "orders" ? (
              <>
                {totalOrdersYear.toLocaleString("vi-VN")} đơn hàng trong{" "}
                {selectedYear}
              </>
            ) : (
              <>
                {totalRevenueYear.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  maximumFractionDigits: 0,
                })}{" "}
                trong {selectedYear}
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs dark:border-gray-700 dark:bg-gray-900">
            <button
              onClick={() => setMetric("orders")}
              className={`rounded-md px-2.5 py-1 ${
                metric === "orders"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Đơn hàng
            </button>
            <button
              onClick={() => setMetric("revenue")}
              className={`rounded-md px-2.5 py-1 ${
                metric === "revenue"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Doanh thu
            </button>
          </div>

          <div className="relative inline-block">
            <button
              onClick={toggleDropdown}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              <span>{selectedYear}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                className="fill-current"
              >
                <path d="M4.47 6.47a.75.75 0 0 1 1.06 0L8 8.94l2.47-2.47a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </button>

            <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-32 p-2">
              {years.map((year) => (
                <DropdownItem
                  key={year}
                  onItemClick={() => handleYearSelect(year)}
                  className="flex w-full rounded-lg text-left text-sm font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  {year}
                </DropdownItem>
              ))}
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] pl-2 xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={180}
          />
        </div>
      </div>
    </div>
  );
}

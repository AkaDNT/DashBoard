"use client";

import React, { useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useGetOrdersQuery } from "@/lib/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const MONTH_LABELS = [
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
];

export default function StatisticsChart() {
  const { data: orders = [], isLoading, isError } = useGetOrdersQuery();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [isOpen, setIsOpen] = useState(false);

  const monthlyTotalsAll = Array.from({ length: 12 }, () => 0);
  const monthlyTotalsCancelled = Array.from({ length: 12 }, () => 0);

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    const year = date.getFullYear();
    if (year !== selectedYear) return;
    const monthIndex = date.getMonth();
    if (monthIndex < 0 || monthIndex > 11) return;

    monthlyTotalsAll[monthIndex] += 1;
    if (order.status === "Cancelled") {
      monthlyTotalsCancelled[monthIndex] += 1;
    }
  });

  const series = [
    {
      name: `Tổng đơn hàng ${selectedYear}`,
      data: MONTH_LABELS.map((_, index) => ({
        x: index + 1,
        y: monthlyTotalsAll[index],
      })),
    },
    {
      name: `Đơn bị hủy ${selectedYear}`,
      data: MONTH_LABELS.map((_, index) => ({
        x: index + 1,
        y: monthlyTotalsCancelled[index],
      })),
    },
  ];

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#F97373"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      curve: "straight",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        left: 0,
        right: 0,
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      x: {
        formatter: (_, opts) => {
          const idx = opts.dataPointIndex;
          return MONTH_LABELS[idx] || "";
        },
      },
      y: {
        formatter: (val: number) => `${val} đơn hàng`,
      },
    },
    xaxis: {
      type: "numeric",
      min: 1,
      max: 12,
      tickAmount: 11,
      labels: {
        formatter: (value: string | number) => {
          const v = Number(value);
          return MONTH_LABELS[v - 1] || "";
        },
        style: {
          fontSize: "12px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
      title: {
        text: "",
        style: {
          fontSize: "0px",
        },
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
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
        Đang tải thống kê...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-600">
        Không thể tải thống kê.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Thống kê
          </h3>
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
            Tổng số đơn vs đơn bị hủy theo tháng
          </p>
        </div>
        <div className="flex w-full items-start gap-3 sm:justify-end">
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

            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-32 p-2"
            >
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
        <div className="min-w-[1000px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={310}
          />
        </div>
      </div>
    </div>
  );
}

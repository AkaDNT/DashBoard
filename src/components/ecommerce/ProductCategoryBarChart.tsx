"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useGetProductCategoryStatsQuery } from "@/lib/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function ProductCategoryBarChart() {
  const { data = [], isLoading, isError } = useGetProductCategoryStatsQuery();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
        Loading category stats...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-600">
        Failed to load category stats.
      </div>
    );
  }

  const categories = data.map((d) => d.category);
  const soldSeries = data.map((d) => d.totalSold);
  const stockSeries = data.map((d) => d.totalStock);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Outfit, sans-serif",
      stacked: false,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: -30,
        style: { fontSize: "11px" },
      },
    },
    yaxis: {
      labels: {
        style: { fontSize: "11px" },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontSize: "11px",
    },
    grid: {
      yaxis: { lines: { show: true } },
    },
    colors: ["#4F46E5", "#9CA3AF"],
    tooltip: {
      shared: true,
      intersect: false,
    },
  };

  const series = [
    { name: "Sold", data: soldSeries },
    { name: "In stock", data: stockSeries },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Products by Category
        </h3>
        <span className="text-xs text-gray-400">
          {data.length} categories
        </span>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-gray-400">No data.</p>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="-ml-5 min-w-[650px] pl-2 xl:min-w-full">
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={260}
            />
          </div>
        </div>
      )}
    </div>
  );
}

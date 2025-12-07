"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useGetUserDemographicsQuery } from "@/lib/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function UserDemographicsCharts() {
  const { data, isLoading, isError } = useGetUserDemographicsQuery();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
        Loading demographics...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-600">
        Failed to load demographics.
      </div>
    );
  }

  const genderLabels = data.gender.map((g) => g.gender);
  const genderSeries = data.gender.map((g) => g.count);
  const genderTotal = genderSeries.reduce((a, b) => a + b, 0);

  const ageCategories = data.age.map((a) => a.range);
  const ageCounts = data.age.map((a) => a.count);

  const genderOptions: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
    },
    labels: genderLabels,
    legend: {
      position: "bottom",
      fontSize: "11px",
    },
    dataLabels: { enabled: false },
    tooltip: {
      y: {
        formatter: (val: number) => {
          const pct =
            genderTotal > 0 ? ((val / genderTotal) * 100).toFixed(1) + "%" : "";
          return `${val} users (${pct})`;
        },
      },
    },
    colors: ["#6366F1", "#EC4899", "#9CA3AF"],
  };

  const ageOptions: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    xaxis: {
      categories: ageCategories,
      labels: { style: { fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontSize: "11px" } },
    },
    grid: {
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    colors: ["#0EA5E9"],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          User Demographics
        </h3>
        <span className="text-xs text-gray-400">
          {genderTotal.toLocaleString("vi-VN")} users
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            Gender
          </p>
          {genderTotal === 0 ? (
            <p className="text-xs text-gray-400">No data.</p>
          ) : (
            <ReactApexChart
              options={genderOptions}
              series={genderSeries}
              type="donut"
              height={220}
            />
          )}
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            Age
          </p>
          {ageCounts.length === 0 ? (
            <p className="text-xs text-gray-400">No data.</p>
          ) : (
            <ReactApexChart
              options={ageOptions}
              series={[{ name: "Users", data: ageCounts }]}
              type="bar"
              height={220}
            />
          )}
        </div>
      </div>
    </div>
  );
}

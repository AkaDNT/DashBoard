"use client";

import React, { useMemo } from "react";
import { useGetSaleEventsQuery, SaleEvent } from "@/lib/api";

function parseDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatRange(startIso: string, endIso: string) {
  const start = parseDate(startIso);
  const end = parseDate(endIso);
  if (!start || !end) return `${startIso} - ${endIso}`;

  const fmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short" });
  return `${fmt.format(start)} - ${fmt.format(end)}`;
}

function getEventStatus(event: SaleEvent, now: Date) {
  const start = parseDate(event.startDate);
  const end = parseDate(event.endDate);
  if (!start || !end) return "Unknown";

  if (now < start) return "Upcoming";
  if (now > end) return "Ended";
  return "Active";
}

function eventStatusClass(status: string) {
  switch (status) {
    case "Active":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
    case "Upcoming":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300";
    case "Ended":
      return "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300";
  }
}

function colorBadgeClass(color: SaleEvent["color"]) {
  switch (color) {
    case "Danger":
      return "bg-red-500";
    case "Success":
      return "bg-emerald-500";
    case "Primary":
      return "bg-indigo-500";
    case "Warning":
      return "bg-amber-500";
    default:
      return "bg-gray-400";
  }
}

export const SalesEventsCard: React.FC = () => {
  const { data: events = [], isLoading, isError } = useGetSaleEventsQuery();
  const now = new Date();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { active, upcoming, ended, topEvents } = useMemo(() => {
    const withStatus = events.map((e) => ({
      ...e,
      status: getEventStatus(e, now),
    }));

    const active = withStatus.filter((e) => e.status === "Active");
    const upcoming = withStatus.filter((e) => e.status === "Upcoming");
    const ended = withStatus.filter((e) => e.status === "Ended");

    // Hiển thị ưu tiên Active -> Upcoming -> Ended, sort theo startDate
    const sorted = [...withStatus].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    const topEvents = sorted.slice(0, 5);

    return { active, upcoming, ended, topEvents };
  }, [events, now]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
        Loading sale events...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-600">
        Failed to load sale events.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Sale Events
        </h3>
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <span>Active: {active.length}</span>
          <span>Upcoming: {upcoming.length}</span>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        {topEvents.length === 0 && (
          <p className="text-center text-sm text-gray-400">
            No sale events configured.
          </p>
        )}

        {topEvents.map((e) => {
          const status = getEventStatus(e, now);
          const percent = Math.round(e.percent * 100);

          return (
            <div
              key={e.id}
              className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-white/[0.02]"
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-1 inline-block h-2 w-2 rounded-full ${colorBadgeClass(
                    e.color
                  )}`}
                />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {e.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatRange(e.startDate, e.endDate)}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Applies to{" "}
                    <span className="font-medium text-gray-600 dark:text-gray-200">
                      {e.productIds.length} products
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                  -{percent}%
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${eventStatusClass(
                    status
                  )}`}
                >
                  {status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

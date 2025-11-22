"use client";

import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useGetSortedOrdersQuery } from "@/lib/api";

type OrderStatus = "Delivered" | "Pending" | "Cancelled" | "NotConfirm" | string;

interface OrderRow {
  orderID: string;
  userID: number;
  totalAmount: number;
  status: OrderStatus;
}

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const handleChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  const startPage = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
  const endPage = Math.min(totalPages, startPage + 2);

  const pages: number[] = [];
  for (let p = startPage; p <= endPage; p++) {
    pages.push(p);
  }

  const showLeftDots = startPage > 1;
  const showRightDots = endPage < totalPages;

  return (
    <div className="flex items-center">
      <button
        onClick={() => handleChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="mr-2.5 flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      >
        Previous
      </button>

      <div className="flex items-center gap-2">
        {showLeftDots && <span className="px-2 text-sm">...</span>}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handleChange(page)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium ${
              currentPage === page
                ? "bg-brand-500 text-white"
                : "text-gray-700 hover:bg-blue-500/[0.08] hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-500"
            }`}
          >
            {page}
          </button>
        ))}

        {showRightDots && <span className="px-2 text-sm">...</span>}
      </div>

      <button
        onClick={() => handleChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="ml-2.5 flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      >
        Next
      </button>
    </div>
  );
};

const OrdersPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isError } = useGetSortedOrdersQuery({
    page: currentPage,
  });

  const rows: OrderRow[] = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((order) => ({
      orderID: order.orderID,
      userID: order.userID,
      totalAmount: order.totalAmount,
      status: order.status as OrderStatus,
    }));
  }, [data]);

  const filtered = useMemo(
    () =>
      rows.filter((order) => {
        const keyword = search.toLowerCase();
        return (
          order.orderID.toLowerCase().includes(keyword) ||
          order.userID.toString().includes(keyword) ||
          order.totalAmount.toString().includes(keyword) ||
          order.status.toLowerCase().includes(keyword)
        );
      }),
    [rows, search]
  );

  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;
  const pageSize = data?.pageSize ?? 12;
  const page = data?.page ?? currentPage;

  let from = 0;
  let to = 0;
  let totalDisplay = totalCount;

  if (!data || totalCount === 0) {
    from = 0;
    to = 0;
    totalDisplay = 0;
  } else if (search.trim() === "") {
    from = (page - 1) * pageSize + 1;
    to = from + data.data.length - 1;
    totalDisplay = totalCount;
  } else {
    from = filtered.length === 0 ? 0 : 1;
    to = filtered.length;
    totalDisplay = filtered.length;
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Orders" />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 pt-4 pb-4 dark:border-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 pr-10 text-sm text-gray-700 shadow-theme-xs outline-none placeholder:text-gray-400 focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-500"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle cx="11" cy="11" r="6" />
                <line x1="16" y1="16" x2="20" y2="20" />
              </svg>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg:white/[0.03]">
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  d="M4 13.5V16h2.5L14 8.5 11.5 6 4 13.5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Edit
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-500/70 bg-red-500/10 px-3.5 text-sm font-medium text-red-600 shadow-theme-xs hover:bg-red-500/15 dark:border-red-500/60 dark:bg-red-500/10 dark:text-red-300">
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  d="M4 5h12M8 5V3h4v2m-6 0v11a1 1 0 001 1h6a1 1 0 001-1V5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Delete
            </button>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50/60 dark:border-white/[0.05] dark:bg-white/[0.02]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    OrderID
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    UserID
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Price
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {isLoading && (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      Loading...
                    </TableCell>
                  </TableRow>
                )}

                {isError && !isLoading && (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-sm text-red-500">
                      Failed to load data.
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  !isError &&
                  filtered.map((order) => (
                    <TableRow key={order.orderID}>
                      <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-0 dark:border-gray-600"
                          />
                          <span>{order.orderID}</span>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {order.userID}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {order.totalAmount.toLocaleString("vi-VN")} VND
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={
                            order.status === "Delivered"
                              ? "success"
                              : order.status === "Pending" ||
                                order.status === "NotConfirm"
                              ? "warning"
                              : "error"
                          }
                        >
                          {order.status === "NotConfirm"
                            ? "Not confirmed"
                            : order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}

                {!isLoading && !isError && filtered.length === 0 && (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 px-5 pb-4 pt-3 sm:flex-row">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing {from} to {to} of {totalDisplay} entries
          </p>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;

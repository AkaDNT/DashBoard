"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useGetTopCustomersQuery } from "@/lib/api";

function formatCurrency(value: number) {
  // Nếu dùng VND
  return value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}

export default function TopCustomers() {
  const { data: customers, isLoading, isError } = useGetTopCustomersQuery();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Khách hàng chi tiêu nhiều
        </h3>
        <p className="text-theme-xs text-gray-500 dark:text-gray-400">
          Top 5 khách hàng theo tổng tiền các đơn đã giao
        </p>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Khách hàng
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Tổng đơn
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Đã giao
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Đã huỷ
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Tổng chi tiêu
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading && (
              <TableRow>
                <TableCell
                  className="py-4 text-center text-theme-sm text-gray-500 dark:text-gray-400"
                >
                  Đang tải...
                </TableCell>
              </TableRow>
            )}

            {isError && !isLoading && (
              <TableRow>
                <TableCell
                  className="py-4 text-center text-theme-sm text-red-500"
                >
                  Không thể tải dữ liệu
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && customers && customers.length === 0 && (
              <TableRow>
                <TableCell
                  className="py-4 text-center text-theme-sm text-gray-500 dark:text-gray-400"
                >
                  Chưa có dữ liệu khách hàng.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !isError &&
              customers &&
              customers.map((customer) => (
                <TableRow key={customer.userId}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[36px] w-[36px] overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        {(
                          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-500">
                            {(
                              (customer.name ||
                                customer.username ||
                                customer.email ||
                                "?")[0] || "?"
                            )
                              .toString()
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                          {customer.name || customer.username || "Khách không tên"}
                        </p>
                        <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                          {customer.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                    {customer.totalOrders}
                  </TableCell>

                  <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                    {customer.deliveredOrders}
                  </TableCell>

                  <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                    {customer.cancelledOrders}
                  </TableCell>

                  <TableCell className="py-3 text-end text-theme-sm font-medium text-gray-800 dark:text-white/90">
                    {formatCurrency(customer.totalSpent)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Image from "next/image";
import { useGetTopSellersQuery } from "@/lib/api";

export default function TopSellers() {
  const { data: sellers, isLoading, isError } = useGetTopSellersQuery();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Sản phẩm bán chạy
        </h3>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Sản phẩm
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Danh mục
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Số lượng bán
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Đánh giá
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading && (
              <TableRow>
                <TableCell className="py-4 text-center text-theme-sm text-gray-500 dark:text-gray-400">
                  Đang tải...
                </TableCell>
              </TableRow>
            )}

            {isError && !isLoading && (
              <TableRow>
                <TableCell className="py-4 text-center text-theme-sm text-red-500">
                  Không thể tải dữ liệu
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !isError &&
              sellers &&
              sellers.map((product) => (
                <TableRow key={product.productId}>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                        <Image
                          width={50}
                          height={50}
                          src={product.image}
                          className="h-[50px] w-[50px] object-cover"
                          alt={product.productName}
                        />
                      </div>
                      <div>
                        <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                          {product.productName}
                        </p>
                        <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                          {product.orderCount} đơn hàng
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                    {product.category}
                  </TableCell>

                  <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                    {product.selledCount}
                  </TableCell>

                  <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <span>{product.rating.toFixed(1)}</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                        className="fill-yellow-400 text-yellow-400"
                      >
                        <path d="M10 1.66797L12.575 6.52564L17.917 7.35064L13.958 11.1923L14.85 16.5173L10 14.1006L5.15 16.5173L6.042 11.1923L2.083 7.35064L7.425 6.52564L10 1.66797Z" />
                      </svg>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

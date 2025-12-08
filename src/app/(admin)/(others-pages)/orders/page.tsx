"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  useGetSortedOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrdersMutation,
} from "@/lib/api";
import { Modal } from "@/components/ui/modal";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/alert/Alert"; // 👈 THÊM
import Image from "next/image";

type OrderStatus =
  | "Delivered"
  | "Pending"
  | "Cancelled"
  | "NotConfirm"
  | "Confirmed"
  | "To rate"
  | "Shipping"
  | "Processed"
  | string;

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
        className="mr-2.5 flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      >
        Trước
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
        className="ml-2.5 flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      >
        Sau
      </button>
    </div>
  );
};

type AlertState = {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
} | null;

const OrdersPage: React.FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // danh sách id đơn đã tick
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  // modal chi tiết
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [statusInput, setStatusInput] = useState<OrderStatus>("Pending");

  // modal xác nhận xoá
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Alert state
  const [alert, setAlert] = useState<AlertState>(null);

  const singleSelectedId =
    selectedOrderIds.length === 1 ? selectedOrderIds[0] : null;

  const {
    data,
    isLoading,
    isError,
    refetch: refetchOrders,
  } = useGetSortedOrdersQuery({
    page: currentPage,
  });

  // lấy chi tiết order khi có id + modal mở
  const {
    data: selectedOrder,
    isLoading: isOrderLoading,
    isError: isOrderError,
    refetch: refetchOrder,
  } = useGetOrderByIdQuery(singleSelectedId ?? "", {
    skip: !singleSelectedId || !isDetailOpen,
  });

  const [updateOrderStatus, { isLoading: isUpdatingStatus }] =
    useUpdateOrderStatusMutation();

  const [deleteOrders, { isLoading: isDeleting }] = useDeleteOrdersMutation();

  useEffect(() => {
    if (selectedOrder && selectedOrder.status) {
      setStatusInput(selectedOrder.status as OrderStatus);
    }
  }, [selectedOrder]);

  // auto hide alert sau 3s (có thể chỉnh tuỳ ý)
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 3000);
    return () => clearTimeout(timer);
  }, [alert]);

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

  const getStatusColor = (
  status: OrderStatus
): "success" | "warning" | "error" => {
  if (status === "Delivered" || status === "Confirmed" || status === "To rate" || status === "Processed") {
    return "success";
  }

  if (
    status === "Pending" ||
    status === "NotConfirm" ||
    status === "Shipping"
  ) {
    // màu cam / vàng
    return "warning";
  }

  // Cancelled và các trạng thái còn lại
  return "error";
};

// 🇻🇳 Text hiển thị tiếng Việt cho từng status
const getStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case "Delivered":
      return "Đã giao";
    case "Pending":
      return "Đang xử lý";
    case "Cancelled":
      return "Đã huỷ";
    case "NotConfirm":
      return "Chưa xác nhận";
    case "Confirmed":
      return "Đã xác nhận";
      case "Processed":
      return "Đã xác nhận";
    case "To rate":
      return "Chờ đánh giá";
    case "Shipping":
      return "Đang giao";
    default:
      return status;
  }
};

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

  const handleCheckboxChange = (orderId: string, checked: boolean) => {
    setSelectedOrderIds((prev) => {
      if (checked) {
        if (prev.includes(orderId)) return prev;
        return [...prev, orderId];
      }
      return prev.filter((id) => id !== orderId);
    });
  };

  const handleOpenDetails = () => {
    if (!singleSelectedId) return;
    setIsDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailOpen(false);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;

    try {
      await updateOrderStatus({
        orderId: selectedOrder.orderID,
        newStatus: statusInput,
      }).unwrap();

      // refetch lại list + chi tiết
      await Promise.all([refetchOrders(), refetchOrder()]);
      setIsDetailOpen(false);
      router.refresh();

      // Alert thành công
      setAlert({
        variant: "success",
        title: "Lưu thành công",
        message: "Trạng thái đơn hàng đã được cập nhật.",
      });
    } catch (error) {
      console.error("Failed to update order status", error);
      setAlert({
        variant: "error",
        title: "Lỗi",
        message: "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.",
      });
    }
  };

  // mở modal xác nhận xoá
  const handleOpenDeleteConfirm = () => {
    if (selectedOrderIds.length === 0) return;
    setIsDeleteConfirmOpen(true);
  };

  // xác nhận xoá trong modal
  const handleConfirmDelete = async () => {
    if (selectedOrderIds.length === 0) {
      setIsDeleteConfirmOpen(false);
      return;
    }

    const idsToDelete = [...selectedOrderIds];

    try {
      await deleteOrders(idsToDelete).unwrap(); // body: string[]
      setSelectedOrderIds([]);
      await refetchOrders();

      // nếu đang mở modal của order vừa xoá thì đóng lại
      if (
        isDetailOpen &&
        singleSelectedId &&
        idsToDelete.includes(singleSelectedId)
      ) {
        setIsDetailOpen(false);
      }

      setIsDeleteConfirmOpen(false);

      // Alert xoá thành công
      setAlert({
        variant: "success",
        title: "Xoá thành công",
        message: `Đã xoá ${idsToDelete.length} đơn hàng.`,
      });
    } catch (error) {
      console.error("Failed to delete orders", error);
      setAlert({
        variant: "error",
        title: "Lỗi",
        message: "Không thể xoá đơn hàng. Vui lòng thử lại.",
      });
    }
  };

  const handleCloseDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Đơn hàng" />

      {alert && (
        <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
          <div className="w-full max-w-md">
            <Alert
              variant={alert.variant}
              title={alert.title}
              message={alert.message}
            />
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Header + actions */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 pt-4 pb-4 dark:border-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
                setSelectedOrderIds([]);
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
            <button
              onClick={handleOpenDetails}
              disabled={selectedOrderIds.length !== 1}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
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
              Xem chi tiết
            </button>
            <button
              onClick={handleOpenDeleteConfirm}
              disabled={selectedOrderIds.length === 0 || isDeleting}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-500/70 bg-red-500/10 px-3.5 text-sm font-medium text-red-600 shadow-theme-xs hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/60 dark:bg-red-500/10 dark:text-red-300"
            >
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
              {isDeleting ? "Đang xoá..." : "Xoá"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50/60 dark:border-white/[0.05] dark:bg-white/[0.02]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Mã đơn hàng
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Mã người dùng
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Tổng tiền
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Trạng thái
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {isLoading && (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                )}

                {isError && !isLoading && (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-sm text-red-500">
                      Không thể tải dữ liệu.
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
                            checked={selectedOrderIds.includes(order.orderID)}
                            onChange={(e) =>
                              handleCheckboxChange(
                                order.orderID,
                                e.target.checked
                              )
                            }
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
  <Badge size="sm" color={getStatusColor(order.status)}>
    {getStatusLabel(order.status)}
  </Badge>
</TableCell>

                    </TableRow>
                  ))}

                {!isLoading && !isError && filtered.length === 0 && (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      Không có đơn hàng nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* footer */}
        <div className="flex flex-col items-center justify-between gap-3 px-5 pb-4 pt-3 sm:flex-row">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Hiển thị từ {from} đến {to} trên tổng {totalDisplay} dòng
          </p>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modal chi tiết order */}
      <Modal
        isOpen={isDetailOpen}
        onClose={handleCloseDetails}
        className="m-4 max-w-[900px]"
      >
        <div className="no-scrollbar relative w-full max-w-[900px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <div className="px-2 pr-10">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Chi tiết đơn hàng
            </h4>
            {singleSelectedId && (
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Mã đơn hàng:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {singleSelectedId}
                </span>
              </p>
            )}
          </div>

          <div className="custom-scrollbar max-h-[520px] overflow-y-auto px-2 pb-3">
            {isOrderLoading && (
              <p className="px-2 text-sm text-gray-500 dark:text-gray-400">
                Đang tải...
              </p>
            )}

            {isOrderError && !isOrderLoading && (
              <p className="px-2 text-sm text-red-500">
                Không thể tải chi tiết đơn hàng.
              </p>
            )}

            {!isOrderLoading && !isOrderError && selectedOrder && (
              <div className="space-y-8">
                {/* Thông tin cơ bản */}
                <section className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Mã đơn hàng
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {selectedOrder.orderID}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Mã người dùng
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {selectedOrder.userID}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Tổng tiền
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {selectedOrder.totalAmount.toLocaleString("vi-VN")} VND
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Phương thức thanh toán
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {selectedOrder.paymentMethod ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Ngày tạo
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {new Date(
                        selectedOrder.createdAt
                      ).toLocaleString("vi-VN")}
                    </p>
                  </div>

                  {/* Status có thể sửa */}
                  <div>
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Trạng thái
                    </p>
                    <select
                      className="mt-0.5 h-9 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm text-gray-800 shadow-sm outline-none focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      value={statusInput}
                      onChange={(e) =>
                        setStatusInput(e.target.value as OrderStatus)
                      }
                    >
                      <option value="Pending">Đang xử lý</option>
                      <option value="Delivered">Đã giao</option>
                      <option value="Cancelled">Đã huỷ</option>
                      <option value="NotConfirm">Chưa xác nhận</option>
                      <option value="Confirmed">Đã xác nhận</option>
                      <option value="To rate">Chờ đánh giá</option>
                    </select>
                  </div>
                </section>

                {/* Receive info */}
                {selectedOrder.receiveInfo && (
                  <section className="space-y-3">
                    <h5 className="text-sm font-semibold text-gray-800 dark:text:white/90">
                      Thông tin nhận hàng
                    </h5>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                          Họ tên
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {selectedOrder.receiveInfo.name}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                          Số điện thoại
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {selectedOrder.receiveInfo.phone}
                        </p>
                      </div>
                      <div className="lg:col-span-2">
                        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                          Địa chỉ
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {selectedOrder.receiveInfo.address}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Items */}
                <section className="space-y-3">
                  <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    Sản phẩm
                  </h5>
                  <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-white/[0.08]">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500 dark:border-white/[0.05] dark:bg-white/[0.02]">
                        <tr>
                          <th className="px-4 py-2 font-medium">Sản phẩm</th>
                          <th className="px-4 py-2 font-medium">Số lượng</th>
                          <th className="px-4 py-2 font-medium">Đơn giá</th>
                          <th className="px-4 py-2 font-medium">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {selectedOrder.items.map((item) => (
                          <tr key={item.productID}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="relative h-10 w-10 flex-shrink-0">
                                  <Image
                                    src={item.image}
                                    alt={item.productName}
                                    fill
                                    className="rounded-lg object-cover"
                                    sizes="40px"
                                  />
                                </div>
                                <span className="font-medium text-gray-800 dark:text-gray-100">
                                  {item.productName}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                              {item.unitPrice.toLocaleString("vi-VN")} VND
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                              {(item.unitPrice * item.quantity).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VND
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 px-2">
            <button
              type="button"
              onClick={handleCloseDetails}
              className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg:white/[0.03]"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSaveStatus}
              disabled={isUpdatingStatus}
              className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdatingStatus ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal xác nhận xoá */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        className="m-4 max-w-md"
      >
        <div className="w-full max-w-md rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
            Xác nhận xoá
          </h4>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
            Bạn có chắc chắn muốn xoá{" "}
            <span className="font-semibold">
              {selectedOrderIds.length} đơn hàng đã chọn
            </span>
            ? Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseDeleteConfirm}
              className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/[0.03]"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="inline-flex items-center rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Đang xoá..." : "Xoá"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrdersPage;

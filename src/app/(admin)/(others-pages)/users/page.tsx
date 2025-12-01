"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Modal } from "@/components/ui/modal";
import Alert from "@/components/ui/alert/Alert";
import {
  useGetAdminUsersQuery,
  useGetAdminUserOverviewQuery,
  useDeleteAdminUsersMutation,
  useUpdateUserRoleMutation,
} from "@/lib/api";

/* ------------ Types ------------ */

type UserRow = {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
};

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

type AlertState = {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
} | null;

/* ------------ Pagination (giống OrdersPage) ------------ */

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
        className="ml-2.5 flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      >
        Next
      </button>
    </div>
  );
};

/* ------------ UsersPage ------------ */

const UsersPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // danh sách user đã tick
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  // modal view details
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  // modal confirm delete
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  // alert
  const [alert, setAlert] = useState<AlertState>(null);
  // input role trong modal
  const [roleInput, setRoleInput] = useState<"Admin" | "User">("User");

  const pageSize = 12;

  const {
    data,
    isLoading,
    isError,
    refetch: refetchUsers,
  } = useGetAdminUsersQuery({
    page: currentPage,
    pageSize,
    keyword: search.trim() || undefined,
  });

  const [deleteAdminUsers, { isLoading: isDeleting }] =
    useDeleteAdminUsersMutation();

  const [updateUserRole, { isLoading: isUpdatingRole }] =
    useUpdateUserRoleMutation();

  const rows: UserRow[] = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      isAdmin: u.isAdmin,
      isEmailVerified: u.isEmailVerified,
    }));
  }, [data]);

  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;
  const page = data?.page ?? currentPage;

  let from = 0;
  let to = 0;
  if (rows.length > 0 && totalCount > 0) {
    from = (page - 1) * pageSize + 1;
    to = from + rows.length - 1;
  }

  const singleSelectedId =
    selectedUserIds.length === 1 ? selectedUserIds[0] : null;

  // gọi overview khi có id + modal mở
  const {
    data: selectedUser,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useGetAdminUserOverviewQuery(singleSelectedId ?? 0, {
    skip: !singleSelectedId || !isDetailOpen,
  });

  // đồng bộ roleInput với selectedUser
  useEffect(() => {
    if (selectedUser) {
      setRoleInput(selectedUser.isAdmin ? "Admin" : "User");
    }
  }, [selectedUser]);

  // auto hide alert sau 3s
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 3000);
    return () => clearTimeout(timer);
  }, [alert]);

  const handleCheckboxChange = (userId: number, checked: boolean) => {
    setSelectedUserIds((prev) => {
      if (checked) {
        if (prev.includes(userId)) return prev;
        return [...prev, userId];
      }
      return prev.filter((id) => id !== userId);
    });
  };

  const handleOpenDetails = () => {
    if (!singleSelectedId) return;
    setIsDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailOpen(false);
  };

  // mở modal xác nhận xoá
  const handleOpenDeleteConfirm = () => {
    if (selectedUserIds.length === 0) return;
    setIsDeleteConfirmOpen(true);
  };

  // xác nhận xoá
  const handleConfirmDelete = async () => {
    if (selectedUserIds.length === 0) {
      setIsDeleteConfirmOpen(false);
      return;
    }

    const idsToDelete = [...selectedUserIds];

    try {
      await deleteAdminUsers(idsToDelete).unwrap();
      setSelectedUserIds([]);
      await refetchUsers();

      setIsDeleteConfirmOpen(false);

      setAlert({
        variant: "success",
        title: "Delete successful",
        message: `Deleted ${idsToDelete.length} user${
          idsToDelete.length > 1 ? "s" : ""
        }.`,
      });
    } catch (error) {
      console.error("Failed to delete users", error);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Could not delete users. Please try again.",
      });
    }
  };

  const handleCloseDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
  };

  // lưu role (set Admin/User)
  const handleSaveRole = async () => {
    if (!selectedUser) return;

    try {
      await updateUserRole({
        id: selectedUser.id,
        isAdmin: roleInput === "Admin",
      }).unwrap();

      await refetchUsers();
      setIsDetailOpen(false);

      setAlert({
        variant: "success",
        title: "Saved",
        message: "User role has been updated.",
      });
    } catch (error) {
      console.error("Failed to update user role", error);
      setAlert({
        variant: "error",
        title: "Error",
        message: "Could not update user role. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Users" />

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
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
                setSelectedUserIds([]);
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
              disabled={selectedUserIds.length !== 1}
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
              View details
            </button>

            <button
              onClick={handleOpenDeleteConfirm}
              disabled={selectedUserIds.length === 0 || isDeleting}
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
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[900px]">
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50/60 dark:border-white/[0.05] dark:bg-white/[0.02]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    User ID
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Username
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Email
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Role
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Email verified
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
                  rows.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={(e) =>
                              handleCheckboxChange(user.id, e.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-0 dark:border-gray-600"
                          />
                          <span>{user.id}</span>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-700 dark:text-gray-200">
                        {user.username}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={user.isAdmin ? "success" : "warning"}
                        >
                          {user.isAdmin ? "Admin" : "User"}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        <Badge
                          size="sm"
                          color={user.isEmailVerified ? "success" : "error"}
                        >
                          {user.isEmailVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}

                {!isLoading && !isError && rows.length === 0 && (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center justify-between gap-3 px-5 pb-4 pt-3 sm:flex-row">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing {from} to {to} of {totalCount} entries
          </p>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              setSelectedUserIds([]);
            }}
          />
        </div>
      </div>

      {/* Modal view details user */}
      <Modal
        isOpen={isDetailOpen}
        onClose={handleCloseDetails}
        className="m-4 max-w-[900px]"
      >
        <div className="no-scrollbar relative w-full max-w-[900px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <div className="px-2 pr-10">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              User details
            </h4>
            {singleSelectedId && (
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                User ID:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {singleSelectedId}
                </span>
              </p>
            )}
          </div>

          <div className="custom-scrollbar max-h-[520px] overflow-y-auto px-2 pb-3">
            {isUserLoading && (
              <p className="px-2 text-sm text-gray-500 dark:text-gray-400">
                Loading...
              </p>
            )}

            {isUserError && !isUserLoading && (
              <p className="px-2 text-sm text-red-500">
                Failed to load user details.
              </p>
            )}

            {!isUserLoading && !isUserError && selectedUser && (
              <div className="space-y-8">
                {/* Account */}
                <section className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-[auto,1fr] items-center">
                  <div className="flex justify-center lg:justify-start" />
                  <div className="grid grid-cols-1 gap-x-6 gap-y-3 lg:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                        Username
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {selectedUser.username}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                        Email
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {selectedUser.email}
                      </p>
                    </div>

                    {/* Role có thể chỉnh sửa */}
                    <div>
                      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                        Role
                      </p>
                      <select
                        className="mt-0.5 h-9 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm text-gray-800 shadow-sm outline-none focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        value={roleInput}
                        onChange={(e) =>
                          setRoleInput(e.target.value as "Admin" | "User")
                        }
                      >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>

                    <div>
                      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                        Email verified
                      </p>
                      <Badge
                        size="sm"
                        color={
                          selectedUser.isEmailVerified ? "success" : "error"
                        }
                      >
                        {selectedUser.isEmailVerified
                          ? "Verified"
                          : "Unverified"}
                      </Badge>
                    </div>
                  </div>
                </section>

                {/* Profile info */}
                <section className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Name
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {selectedUser.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Phone number
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {selectedUser.phoneNumber || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Gender
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {selectedUser.gender || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Birthday
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {selectedUser.birthday
                        ? new Date(
                            selectedUser.birthday
                          ).toLocaleDateString("vi-VN")
                        : "-"}
                    </p>
                  </div>
                </section>

                {/* Order stats */}
                <section className="space-y-3">
                  <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    Order statistics
                  </h5>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-gray-100 p-3 text-xs dark:border-white/10">
                      <p className="text-gray-500 dark:text-gray-400">
                        Total orders
                      </p>
                      <p className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
                        {selectedUser.totalOrders}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-3 text-xs dark:border-white/10">
                      <p className="text-gray-500 dark:text-gray-400">
                        Not confirmed
                      </p>
                      <p className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
                        {selectedUser.notConfirmOrders}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-3 text-xs dark:border-white/10">
                      <p className="text-gray-500 dark:text-gray-400">
                        Pending
                      </p>
                      <p className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
                        {selectedUser.pendingOrders}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-3 text-xs dark:border-white/10">
                      <p className="text-gray-500 dark:text-gray-400">
                        Confirmed
                      </p>
                      <p className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
                        {selectedUser.confirmedOrders}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-3 text-xs dark:border-white/10">
                      <p className="text-gray-500 dark:text-gray-400">
                        Shipped
                      </p>
                      <p className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
                        {selectedUser.shippedOrders}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-3 text-xs dark:border-white/10">
                      <p className="text-gray-500 dark:text-gray-400">
                        Delivered
                      </p>
                      <p className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
                        {selectedUser.deliveredOrders}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-3 text-xs dark:border-white/10">
                      <p className="text-gray-500 dark:text-gray-400">
                        Cancelled
                      </p>
                      <p className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
                        {selectedUser.cancelledOrders}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                        Total spent
                      </p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                        {selectedUser.totalSpent.toLocaleString("vi-VN")} VND
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                        First order at
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {selectedUser.firstOrderAt
                          ? new Date(
                              selectedUser.firstOrderAt
                            ).toLocaleString("vi-VN")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                        Last order at
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {selectedUser.lastOrderAt
                          ? new Date(
                              selectedUser.lastOrderAt
                            ).toLocaleString("vi-VN")
                          : "-"}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Cart & wishlist */}
                <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-2xl border border-gray-100 p-3 text-xs dark:border-white/10">
                    <p className="text-gray-500 dark:text-gray-400">
                      Cart items
                    </p>
                    <p className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
                      {selectedUser.cartItemCount}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 p-3 text-xs dark:border-white/10">
                    <p className="text-gray-500 dark:text-gray-400">
                      Wishlist items
                    </p>
                    <p className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
                      {selectedUser.wishlistCount}
                    </p>
                  </div>
                </section>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 px-2">
            <button
              type="button"
              onClick={handleCloseDetails}
              className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/[0.03]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSaveRole}
              disabled={isUpdatingRole}
              className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdatingRole ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal xác nhận xoá user */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        className="m-4 max-w-md"
      >
        <div className="w-full max-w-md rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
            Confirm delete
          </h4>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {selectedUserIds.length} selected user
              {selectedUserIds.length > 1 ? "s" : ""}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseDeleteConfirm}
              className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="inline-flex items-center rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;

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
import { Modal } from "@/components/ui/modal";
import Alert from "@/components/ui/alert/Alert";

import {
  useGetAdminProductsQuery,
  useGetAdminProductOverviewQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useDeleteAdminProductsMutation,
  type AdminProductListItem,
} from "@/lib/api";

/* ------------ Types ------------ */

type ProductRow = AdminProductListItem;

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

/* ------------ Pagination ------------ */

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

/* ------------ ProductsPage ------------ */

const ProductsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // modals
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [alert, setAlert] = useState<AlertState>(null);

  // form add / edit
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPrice, setFormPrice] = useState<number | "">("");
  const [formStock, setFormStock] = useState<number | "">("");

  // ⬇️ đổi từ string sang array
  const [formImageUrls, setFormImageUrls] = useState<string[]>([""]);

  const [formError, setFormError] = useState<string | null>(null);

  const pageSize = 12;

  const {
    data,
    isLoading,
    isError,
    refetch: refetchProducts,
  } = useGetAdminProductsQuery({
    page: currentPage,
    pageSize,
    keyword: search.trim() || undefined,
    category: undefined,
  });

  const [createAdminProduct, { isLoading: isCreating }] =
    useCreateAdminProductMutation();
  const [updateAdminProduct, { isLoading: isUpdating }] =
    useUpdateAdminProductMutation();
  const [deleteAdminProducts, { isLoading: isDeleting }] =
    useDeleteAdminProductsMutation();

  const rows: ProductRow[] = useMemo(() => {
    if (!data?.data) return [];
    return data.data;
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
    selectedProductIds.length === 1 ? selectedProductIds[0] : null;

  const {
    data: selectedProduct,
    isLoading: isProductLoading,
    isError: isProductError,
  } = useGetAdminProductOverviewQuery(singleSelectedId ?? "", {
    skip: !singleSelectedId || !isDetailOpen,
  });

  const normalizedImageUrls = useMemo(
    () =>
      formImageUrls
        .map((u) => u.trim())
        .filter((u, idx, arr) => u && arr.indexOf(u) === idx),
    [formImageUrls]
  );

  const handleImageUrlChange = (index: number, value: string) => {
    setFormImageUrls((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddImageField = () => {
    setFormImageUrls((prev) => [...prev, ""]);
  };

  const handleRemoveImageField = (index: number) => {
    setFormImageUrls((prev) => {
      if (prev.length === 1) {
        return [""];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  useEffect(() => {
    if (selectedProduct && isDetailOpen) {
      setFormName(selectedProduct.name);
      setFormDescription(selectedProduct.description ?? "");
      setFormCategory(selectedProduct.category ?? "");
      setFormPrice(selectedProduct.price);
      setFormStock(selectedProduct.stock);
      setFormImageUrls(
        selectedProduct.imageURL && selectedProduct.imageURL.length > 0
          ? selectedProduct.imageURL
          : [""]
      );
      setFormError(null);
    }
  }, [selectedProduct, isDetailOpen]);

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 3000);
    return () => clearTimeout(timer);
  }, [alert]);

  const handleCheckboxChange = (productId: string, checked: boolean) => {
    setSelectedProductIds((prev) => {
      if (checked) {
        if (prev.includes(productId)) return prev;
        return [...prev, productId];
      }
      return prev.filter((id) => id !== productId);
    });
  };

  const handleOpenDetails = () => {
    if (!singleSelectedId) return;
    setIsDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailOpen(false);
  };

  const handleOpenAdd = () => {
    setFormName("");
    setFormDescription("");
    setFormCategory("");
    setFormPrice("");
    setFormStock("");
    setFormImageUrls([""]);
    setFormError(null);
    setIsAddOpen(true);
  };

  const handleCloseAdd = () => {
    setIsAddOpen(false);
  };

  const handleOpenDeleteConfirm = () => {
    if (selectedProductIds.length === 0) return;
    setIsDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (selectedProductIds.length === 0) {
      setIsDeleteConfirmOpen(false);
      return;
    }
    const idsToDelete = [...selectedProductIds];

    try {
      await deleteAdminProducts(idsToDelete).unwrap();
      setSelectedProductIds([]);
      await refetchProducts();

      setIsDeleteConfirmOpen(false);
      setAlert({
        variant: "success",
        title: "Xoá thành công",
        message: `Đã xoá ${idsToDelete.length} sản phẩm.`,
      });
    } catch (error) {
      console.error("Failed to delete products", error);
      setAlert({
        variant: "error",
        title: "Lỗi",
        message: "Không thể xoá sản phẩm. Vui lòng thử lại.",
      });
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName || !formCategory || formPrice === "" || formStock === "") {
      setFormError(
        "Vui lòng nhập đầy đủ tên, danh mục, giá và số lượng tồn kho."
      );
      return;
    }

    const priceNum = Number(formPrice);
    const stockNum = Number(formStock);
    if (Number.isNaN(priceNum) || Number.isNaN(stockNum)) {
      setFormError("Giá và tồn kho phải là số.");
      return;
    }

    try {
      setFormError(null);

      await createAdminProduct({
        name: formName,
        description: formDescription || undefined,
        price: priceNum,
        category: formCategory,
        stock: stockNum,
        imageURL:
          normalizedImageUrls.length > 0 ? normalizedImageUrls : undefined,
      }).unwrap();

      await refetchProducts();
      setIsAddOpen(false);

      setAlert({
        variant: "success",
        title: "Tạo sản phẩm thành công",
        message: "Sản phẩm mới đã được tạo.",
      });
    } catch (error) {
      console.error("Failed to create product", error);
      setFormError(
        "Không thể tạo sản phẩm. Vui lòng kiểm tra dữ liệu và thử lại."
      );
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    if (!formName || !formCategory || formPrice === "" || formStock === "") {
      setFormError(
        "Vui lòng nhập đầy đủ tên, danh mục, giá và số lượng tồn kho."
      );
      return;
    }

    const priceNum = Number(formPrice);
    const stockNum = Number(formStock);
    if (Number.isNaN(priceNum) || Number.isNaN(stockNum)) {
      setFormError("Giá và tồn kho phải là số.");
      return;
    }

    try {
      setFormError(null);

      const imageUrls =
        normalizedImageUrls.length > 0
          ? normalizedImageUrls
          : selectedProduct.imageURL;

      await updateAdminProduct({
        id: selectedProduct.productId,
        data: {
          name: formName,
          description: formDescription || undefined,
          price: priceNum,
          category: formCategory,
          stock: stockNum,
          imageURL: imageUrls,
        },
      }).unwrap();

      await refetchProducts();
      setIsDetailOpen(false);

      setAlert({
        variant: "success",
        title: "Cập nhật sản phẩm thành công",
        message: "Sản phẩm đã được cập nhật.",
      });
    } catch (error) {
      console.error("Failed to update product", error);
      setFormError("Không thể cập nhật sản phẩm. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Sản phẩm" />

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
              placeholder="Tìm theo tên sản phẩm..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
                setSelectedProductIds([]);
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
              onClick={handleOpenAdd}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  d="M10 4v12M4 10h12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Thêm sản phẩm
            </button>

            <button
              onClick={handleOpenDetails}
              disabled={selectedProductIds.length !== 1}
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
              Xem / sửa
            </button>

            <button
              onClick={handleOpenDeleteConfirm}
              disabled={selectedProductIds.length === 0 || isDeleting}
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
          <div className="min-w-[900px]">
            <Table>
              <TableHeader className="border-b border-gray-100 bg-gray-50/60 dark:border-white/[0.05] dark:bg-white/[0.02]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    ID sản phẩm
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Tên sản phẩm
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Danh mục
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Giá
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Tồn kho
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Đã bán
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Đánh giá
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Khuyến mãi
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
                  rows.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(
                              product.productId
                            )}
                            onChange={(e) =>
                              handleCheckboxChange(
                                product.productId,
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-0 dark:border-gray-600"
                          />
                          <span className="truncate max-w-[180px]">
                            {product.productId}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-700 dark:text-gray-200">
                        {product.name}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {product.category}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-700 dark:text-gray-200">
                        {product.price.toLocaleString("vi-VN")} VND
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-700 dark:text-gray-200">
                        {product.stock}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-700 dark:text-gray-200">
                        {product.sold}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {product.ratingAverage.toFixed(1)}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {product.isOnSale ? (
                          <Badge size="sm" color="success">
                            {Math.round((product.salePercent ?? 0) * 100)}%
                          </Badge>
                        ) : (
                          <Badge size="sm" color="warning">
                            Không khuyến mãi
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                {!isLoading && !isError && rows.length === 0 && (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      Không tìm thấy sản phẩm nào.
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
            Hiển thị từ {from} đến {to} trên tổng {totalCount} dòng
          </p>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              setSelectedProductIds([]);
            }}
          />
        </div>
      </div>

      {/* Modal view / edit product */}
      <Modal
        isOpen={isDetailOpen}
        onClose={handleCloseDetails}
        className="m-4 max-w-[900px]"
      >
        <div className="no-scrollbar relative w-full max-w-[900px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <div className="px-2 pr-10">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Chi tiết sản phẩm
            </h4>
            {singleSelectedId && (
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                ID sản phẩm:{" "}
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {singleSelectedId}
                </span>
              </p>
            )}
          </div>

          <div className="custom-scrollbar max-h-[520px] overflow-y-auto px-2 pb-3">
            {isProductLoading && (
              <p className="px-2 text-sm text-gray-500 dark:text-gray-400">
                Đang tải...
              </p>
            )}

            {isProductError && !isProductLoading && (
              <p className="px-2 text-sm text-red-500">
                Không thể tải chi tiết sản phẩm.
              </p>
            )}

            {!isProductLoading && !isProductError && selectedProduct && (
              <div className="space-y-8">
                {/* Edit form basic info */}
                <section className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Tên sản phẩm
                    </p>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Danh mục
                    </p>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Giá (VND)
                    </p>
                    <input
                      type="number"
                      value={formPrice}
                      onChange={(e) =>
                        setFormPrice(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Tồn kho
                    </p>
                    <input
                      type="number"
                      value={formStock}
                      onChange={(e) =>
                        setFormStock(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Mô tả
                    </p>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>

                  {/* Images editor */}
                  <div className="lg:col-span-2">
                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                      Ảnh
                    </p>
                    <div className="space-y-2">
                      {formImageUrls.map((url, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={url}
                            onChange={(e) =>
                              handleImageUrlChange(index, e.target.value)
                            }
                            placeholder="https://example.com/image.jpg"
                            className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImageField(index)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-xs text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-white/[0.06]"
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddImageField}
                        className="mt-1 inline-flex items-center rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg:white/[0.04]"
                      >
                        + Thêm ảnh
                      </button>

                      {normalizedImageUrls.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {normalizedImageUrls.map((url) => (
                            <div
                              key={url}
                              className="h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt="xem trước"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Stats */}
                <section className="space-y-3">
                  <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    Thống kê
                  </h5>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    <div>
                      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                        Điểm đánh giá TB
                      </p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                        {selectedProduct.ratingAverage.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                        Đã bán
                      </p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                        {selectedProduct.sold}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                        Tồn kho
                      </p>
                      <p className="text-sm font-semibold text-gray-800 dark:text:white/90">
                        {selectedProduct.stock}
                      </p>
                    </div>
                  </div>
                </section>

                {formError && (
                  <p className="text-xs text-red-500">{formError}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 px-2">
            <button
              type="button"
              onClick={handleCloseDetails}
              className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/[0.03]"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleUpdateProduct}
              disabled={isUpdating}
              className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal add product */}
      <Modal
        isOpen={isAddOpen}
        onClose={handleCloseAdd}
        className="m-4 max-w-md"
      >
        <div className="w-full max-w-md rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
            Thêm sản phẩm mới
          </h4>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Tạo một sản phẩm mới.
          </p>

          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                Tên sản phẩm
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                Danh mục
              </label>
              <input
                type="text"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                Giá (VND)
              </label>
              <input
                type="number"
                value={formPrice}
                onChange={(e) =>
                  setFormPrice(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                Tồn kho
              </label>
              <input
                type="number"
                value={formStock}
                onChange={(e) =>
                  setFormStock(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="h-9 w-full rounded-lg border border-gray-300 bg:white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                Mô tả
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            {/* Images editor for create */}
            <div>
              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                Ảnh
              </label>
              <div className="space-y-2">
                {formImageUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) =>
                        handleImageUrlChange(index, e.target.value)
                      }
                      placeholder="https://example.com/image.jpg"
                      className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImageField(index)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-xs text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-white/[0.06]"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddImageField}
                  className="mt-1 inline-flex items-center rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-white/[0.04]"
                >
                  + Thêm ảnh
                </button>

                {normalizedImageUrls.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {normalizedImageUrls.map((url) => (
                      <div
                        key={url}
                        className="h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt="xem trước"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {formError && <p className="text-xs text-red-500">{formError}</p>}

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseAdd}
                className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/[0.03]"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="inline-flex items-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? "Đang tạo..." : "Tạo"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal delete confirm */}
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
              {selectedProductIds.length} sản phẩm đã chọn
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
              className="inline-flex items-center rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text:white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Đang xoá..." : "Xoá"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductsPage;

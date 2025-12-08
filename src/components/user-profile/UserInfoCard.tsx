"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} from "@/lib/api";

function safe(val?: string | null) {
  if (!val) return "";
  const trimmed = val.trim();
  return trimmed === "" ? "" : trimmed;
}

function formatBirthdayForDisplay(birthdayIso?: string | null) {
  if (!birthdayIso || birthdayIso === "0001-01-01T00:00:00Z") return "";
  const d = new Date(birthdayIso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN");
}

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { data: profile, refetch } = useGetUserProfileQuery();
  const [updateUserProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation();

  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [genderInput, setGenderInput] = useState("");
  const [birthdayInput, setBirthdayInput] = useState("");
  const [bankAccountInput, setBankAccountInput] = useState("");
  const [creditCardInput, setCreditCardInput] = useState("");

  useEffect(() => {
    if (profile) {
      setNameInput(safe(profile.name));
      setPhoneInput(safe(profile.phoneNumber));
      setGenderInput(safe(profile.gender));
      setBirthdayInput(
        profile.birthday && profile.birthday !== "0001-01-01T00:00:00Z"
          ? profile.birthday.slice(0, 10)
          : ""
      );
      setBankAccountInput(safe(profile.banking?.bankAccount ?? ""));
      setCreditCardInput(safe(profile.banking?.creditCard ?? ""));
    }
  }, [profile]);

  const displayBirthday = useMemo(() => {
    if (birthdayInput) {
      const d = new Date(birthdayInput);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString("vi-VN");
      }
    }
    return formatBirthdayForDisplay(profile?.birthday);
  }, [birthdayInput, profile?.birthday]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const birthdayIso = birthdayInput
      ? new Date(birthdayInput + "T00:00:00").toISOString()
      : profile.birthday;

    const payload = {
      ...profile,
      name: nameInput || "",
      phoneNumber: phoneInput || "",
      gender: genderInput || "",
      birthday: birthdayIso,
      banking: {
        bankAccount: bankAccountInput || "",
        creditCard: creditCardInput || "",
      },
    };

    try {
      await updateUserProfile(payload).unwrap();
      await refetch();
      closeModal();
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5 dark:border-white/[0.05] dark:bg-white/[0.03] sm:px-6 sm:py-6 lg:px-8 lg:py-7">
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
          Thông tin cá nhân
        </h4>

        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2 text-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-white/[0.02] dark:text-gray-200 dark:hover:bg-white/[0.06]"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill="currentColor"
            />
          </svg>
          <span>Chỉnh sửa</span>
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-x-24 gap-y-6 md:grid-cols-2">
        <div>
          <p className="mb-1 text-xs leading-normal text-gray-500 dark:text-gray-400">
            Họ và tên
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {nameInput}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs leading-normal text-gray-500 dark:text-gray-400">
            Số điện thoại
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {phoneInput}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs leading-normal text-gray-500 dark:text-gray-400">
            Giới tính
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {genderInput}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs leading-normal text-gray-500 dark:text-gray-400">
            Tài khoản ngân hàng
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {bankAccountInput}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs leading-normal text-gray-500 dark:text-gray-400">
            Ngày sinh
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {displayBirthday}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs leading-normal text-gray-500 dark:text-gray-400">
            Thẻ tín dụng
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {creditCardInput}
          </p>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <div className="px-2 pr-10">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Chỉnh sửa thông tin cá nhân
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Cập nhật thông tin để hồ sơ của bạn luôn chính xác.
            </p>
          </div>

          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar max-h-[450px] overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Họ và tên</Label>
                  <Input
                    type="text"
                    value={nameInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNameInput(e.target.value)
                    }
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Số điện thoại</Label>
                  <Input
                    type="text"
                    value={phoneInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPhoneInput(e.target.value)
                    }
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Giới tính</Label>
                  <Input
                    type="text"
                    value={genderInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setGenderInput(e.target.value)
                    }
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Ngày sinh</Label>
                  <Input
                    type="date"
                    value={birthdayInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setBirthdayInput(e.target.value)
                    }
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Tài khoản ngân hàng</Label>
                  <Input
                    type="text"
                    value={bankAccountInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setBankAccountInput(e.target.value)
                    }
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Thẻ tín dụng</Label>
                  <Input
                    type="text"
                    value={creditCardInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCreditCardInput(e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" type="button" onClick={closeModal}>
                Đóng
              </Button>
              <Button size="sm" type="submit" disabled={isUpdating}>
                {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

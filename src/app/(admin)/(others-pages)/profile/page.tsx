import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import React from "react";

export default function Profile() {
  return (
    <div>
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Profile" />
        <div className="space-y-6">
          <UserInfoCard />
        </div>
      </div>
    </div>
  );
}

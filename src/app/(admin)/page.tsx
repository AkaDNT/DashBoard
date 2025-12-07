
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import TopSellers from "@/components/ecommerce/TopSellers";
import { ProductStatsCard } from "@/components/ecommerce/ProductStatsCard";
import { SalesEventsCard } from "@/components/ecommerce/SalesEventsCard";
import OrdersDailyChart from "@/components/ecommerce/OrdersDailyChart";
import ProductCategoryBarChart from "@/components/ecommerce/ProductCategoryBarChart";
import OrderStatusDonutChart from "@/components/ecommerce/OrderStatusDonutChart";
import PaymentMethodChart from "@/components/ecommerce/PaymentMethodChart";
import UserDemographicsCharts from "@/components/ecommerce/RatingDistributionChart";



export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-8">
    <EcommerceMetrics />
    <MonthlySalesChart />
    <OrdersDailyChart />
    <ProductCategoryBarChart />
  </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 space-y-6 xl:col-span-5">
        <TopSellers />
        <SalesEventsCard />
        <RecentOrders />
      </div>

  <div className="col-span-12 space-y-6 xl:col-span-4">
    <OrderStatusDonutChart />
    <PaymentMethodChart />
    <ProductStatsCard/>
    <UserDemographicsCharts />
  </div>
      
      
    </div>
  );
}

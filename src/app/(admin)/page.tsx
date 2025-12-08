
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import TopSellers from "@/components/ecommerce/TopSellers";
import { ProductStatsCard } from "@/components/ecommerce/ProductStatsCard";
import OrdersDailyChart from "@/components/ecommerce/OrdersDailyChart";
import ProductCategoryBarChart from "@/components/ecommerce/ProductCategoryBarChart";
import OrderStatusDonutChart from "@/components/ecommerce/OrderStatusDonutChart";
import PaymentMethodChart from "@/components/ecommerce/PaymentMethodChart";
import UserDemographicsCharts from "@/components/ecommerce/RatingDistributionChart";



export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-6">
    <EcommerceMetrics />
    <MonthlySalesChart />
    <OrdersDailyChart />
  </div>

      <div className="col-span-12 space-y-6 xl:col-span-6">
        <MonthlyTarget />
        <ProductCategoryBarChart />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 space-y-6 xl:col-span-6">
        <TopSellers />
        <RecentOrders />
      </div>

  <div className="col-span-12 space-y-6 xl:col-span-6">
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
    <div>
      <OrderStatusDonutChart />
    </div>
    <div>
      <PaymentMethodChart />
    </div>
  </div>
    
    <ProductStatsCard/>
    <UserDemographicsCharts />
  </div>
      
      
    </div>
  );
}

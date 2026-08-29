"use client";

import { useEffect, useState } from "react";
import { dashboardService } from "@/lib/services/dashboardService";
import { DashboardStats } from "@/types";
import StatCard from "@/components/StatCard";
import { getErrorMessage } from "@/lib/getErrorMessage";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn tất",
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardService.getStats().then(setStats).catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!stats) return <p className="text-neutral-500">Đang tải...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Tổng quan</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Tổng người dùng" value={stats.totalUsers} />
        <StatCard label="Tổng số phòng" value={stats.totalRooms} />
        <StatCard label="Phòng đang hoạt động" value={stats.activeRooms} />
        <StatCard label="Tổng đơn đặt phòng" value={stats.totalBookings} />
        <StatCard label="Doanh thu tháng này" value={formatPrice(stats.revenueThisMonth)} accent />
        <StatCard label="Tổng doanh thu" value={formatPrice(stats.totalRevenue)} accent />
      </div>

      <h2 className="mt-8 mb-4 text-lg font-semibold text-neutral-900">Đơn đặt phòng theo trạng thái</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Object.entries(stats.bookingsByStatus).map(([status, count]) => (
          <StatCard key={status} label={STATUS_LABELS[status] ?? status} value={count} />
        ))}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Plus, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { DashboardStats, ShipmentListItem } from "@/lib/types";
import {
  getDashboardStats,
  getShipments,
  bulkDeleteShipments,
  getAnalyticsData,
} from "@/lib/dashboard-actions";
import { ShipmentsTable } from "@/components/dashboard/ShipmentsTable";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ShipmentsStatistics } from "@/components/dashboard/ShipmentsStatistics";
import { TrackingWidget } from "@/components/dashboard/TrackingWidget";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import { NotificationCenter } from "@/components/ui/notification-center";
import { ToastContainer } from "@/components/ui/toast-notification";
import { useNotifications } from "@/hooks/use-notifications";

const WorldMapWidget = dynamic(
  () => import("@/components/dashboard/WorldMapWidget"),
  {
    ssr: false,
  }
);

// interface AnalyticsData {
//   totalShipments: number;
//   deliveredShipments: number;
//   inTransitShipments: number;
//   deliveryRate: number;
//   revenue: number;
// }

// Function to get appropriate greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  } else if (hour < 17) {
    return "Good Afternoon";
  } else if (hour < 21) {
    return "Good Evening";
  } else {
    return "Good Night";
  }
};

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  // const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [shipments, setShipments] = useState<ShipmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    dateFrom: "",
    dateTo: "",
    service: "all",
  });
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    to: new Date(),
  });
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);
  const loadDataRef = useRef<(() => Promise<void>) | null>(null);

  // Notification system
  const {
    notifications,
    toasts,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    dismissToast,
    notifyShipmentUpdate,
    notifySystemAlert,
    notifyMaintenance,
    // notifyPerformanceAlert
  } = useNotifications();

  // Check if user is admin
  useEffect(() => {
    if (isLoaded && (!user || user.publicMetadata.role !== "admin")) {
      redirect("/");
    }
  }, [user, isLoaded]);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Format dates for API calls
      const dateFrom = format(dateRange.from, "yyyy-MM-dd");
      const dateTo = format(dateRange.to, "yyyy-MM-dd");

      // Load stats and analytics data
      const [statsData] = await Promise.all([
        getDashboardStats(),
        getAnalyticsData(),
      ]);

      setStats(statsData);
      // setAnalyticsData(analyticsData);

      // Create updated filters with date range
      const updatedFilters = {
        ...filters,
        dateFrom,
        dateTo,
      };

      // Load shipments with pagination and date filtering
      const shipmentsData = await getShipments({
        page: currentPage,
        limit: 10,
        ...updatedFilters,
      });

      setShipments(shipmentsData.data);
      setTotalPages(shipmentsData.pagination.totalPages);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, filters, currentPage]);

  // Update the ref whenever loadDashboardData changes
  useEffect(() => {
    loadDataRef.current = loadDashboardData;
  }, [loadDashboardData]);

  // Load data when user changes, page changes, or filters change
  useEffect(() => {
    if (user?.publicMetadata.role === "admin") {
      // Clear existing timeout
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        if (loadDataRef.current) {
          loadDataRef.current();
        }
      }, 500); // 500ms debounce

      setDebounceTimeout(timeout);
    }

    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [
    user,
    currentPage,
    filters.status,
    filters.search,
    filters.service,
    filters.dateFrom,
    filters.dateTo
  ]);

  // Demo notifications for testing (remove in production)
  useEffect(() => {
    if (user?.publicMetadata.role === "admin" && notifications.length === 0) {
      // Add some demo notifications
      setTimeout(() => {
        notifySystemAlert(
          "Welcome to the Dashboard",
          "Your real-time notification system is now active. You'll receive alerts for shipment updates, system events, and performance metrics.",
          "medium"
        );
      }, 2000);

      setTimeout(() => {
        notifyShipmentUpdate("demo-1", "DELIVERED", "TRK123456789");
      }, 5000);

      setTimeout(() => {
        notifyMaintenance("VH-001", "Truck Alpha", "Oil Change");
      }, 8000);
    }
  }, [
    user,
    notifications.length,
    notifySystemAlert,
    notifyShipmentUpdate,
    notifyMaintenance,
  ]);

  // Performance monitoring - check for alerts when stats change
  useEffect(() => {
    if (stats && user?.publicMetadata.role === "admin") {
      // Check delivery rate
      const deliveryRate =
        stats.totalShipments > 0
          ? (stats.deliveredShipments / stats.totalShipments) * 100
          : 0;
      if (deliveryRate < 80 && stats.totalShipments > 10) {
        notifySystemAlert(
          "Low Delivery Rate Alert",
          `Delivery rate is ${deliveryRate.toFixed(
            1
          )}%, which is below the 80% threshold. Consider reviewing delayed shipments.`,
          "high"
        );
      }

      // Check pending shipments
      if (stats.pendingShipments > 50) {
        notifySystemAlert(
          "High Pending Shipments",
          `There are ${stats.pendingShipments} pending shipments. Consider processing them to improve delivery times.`,
          "medium"
        );
      }

      // Check revenue threshold
      if (stats.revenue > 100000) {
        notifySystemAlert(
          "Revenue Milestone",
          `Congratulations! Monthly revenue has reached $${stats.revenue.toLocaleString()}.`,
          "medium"
        );
      }
    }
  }, [stats, user, notifySystemAlert]);

  const handleBulkDelete = async () => {
    if (selectedShipments.length === 0) return;

    if (
      confirm(
        `Are you sure you want to delete ${selectedShipments.length} shipments?`
      )
    ) {
      try {
        await bulkDeleteShipments(selectedShipments);
        setSelectedShipments([]);
        if (loadDataRef.current) {
          loadDataRef.current();
        }

        // Notify about bulk deletion
        notifySystemAlert(
          "Bulk Deletion Completed",
          `Successfully deleted ${selectedShipments.length} shipments from the system.`,
          "medium"
        );
      } catch (error) {
        console.error("Failed to delete shipments:", error);
        notifySystemAlert(
          "Deletion Failed",
          "Failed to delete selected shipments. Please try again.",
          "high"
        );
      }
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedShipments(shipments.map((s) => s.id));
    } else {
      setSelectedShipments([]);
    }
  };

  const handleSelectShipment = (shipmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedShipments((prev) => [...prev, shipmentId]);
    } else {
      setSelectedShipments((prev) => prev.filter((id) => id !== shipmentId));
    }
  };

  const handleDateRangeChange = (
    range: { from?: Date; to?: Date } | undefined
  ) => {
    if (range?.from && range?.to) {
      setDateRange({ from: range.from, to: range.to });
      // Update filters to trigger API call
      setFilters((prev) => ({
        ...prev,
        dateFrom: format(range.from!, "yyyy-MM-dd"),
        dateTo: format(range.to!, "yyyy-MM-dd"),
      }));
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      // Format dates for export
      if (!dateRange.from || !dateRange.to) {
        console.error("Date range not set");
        notifySystemAlert(
          "Export Failed",
          "Date range is not properly set. Please select a valid date range.",
          "high"
        );
        return;
      }
      const dateFrom = format(dateRange.from, "yyyy-MM-dd");
      const dateTo = format(dateRange.to, "yyyy-MM-dd");

      // Create export filters
      const exportFilters = {
        ...filters,
        dateFrom,
        dateTo,
      };

      // Get all shipments for export (no pagination)
      const response = await fetch("/api/shipments/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exportFilters),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `shipments-${dateFrom}-to-${dateTo}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Notify successful export
        notifySystemAlert(
          "Export Completed",
          `Shipments data exported successfully for ${dateFrom} to ${dateTo}.`,
          "medium"
        );
      } else {
        console.error("Failed to export CSV");
        notifySystemAlert(
          "Export Failed",
          "Failed to export shipments data. Please try again.",
          "high"
        );
      }
    } catch (error) {
      console.error("Export failed:", error);
      notifySystemAlert(
        "Export Error",
        "An error occurred while exporting data. Please try again.",
        "high"
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (!isLoaded || !user || user.publicMetadata.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-lg font-medium text-gray-700">
                Hello {user.firstName || "Admin"}
              </h1>
              <p className="text-3xl font-bold text-gray-900">
                {getGreeting()}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Notification Center */}
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDelete={deleteNotification}
                onClearAll={clearAllNotifications}
              />

              {/* Date Range Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal bg-white shadow-sm"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(dateRange.from, "MMM dd")} -{" "}
                    {format(dateRange.to, "MMM dd, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 border-b">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDateRangeChange({
                            from: new Date(
                              new Date().setDate(new Date().getDate() - 7)
                            ),
                            to: new Date(),
                          })
                        }
                      >
                        Last 7 days
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDateRangeChange({
                            from: new Date(
                              new Date().setMonth(new Date().getMonth() - 1)
                            ),
                            to: new Date(),
                          })
                        }
                      >
                        Last 30 days
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDateRangeChange({
                            from: new Date(
                              new Date().getFullYear(),
                              new Date().getMonth(),
                              1
                            ),
                            to: new Date(),
                          })
                        }
                      >
                        This month
                      </Button>
                    </div>
                  </div>
                  <CalendarComponent
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                    className="rounded-md border-0"
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="sm"
                className="shadow-sm"
                onClick={handleExportCSV}
                disabled={isExporting}
              >
                {isExporting ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting ? "Exporting..." : "Export CSV"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Simulate a random notification
                  const types = [
                    "shipment_update",
                    "maintenance_alert",
                    "system_alert",
                  ];
                  const randomType =
                    types[Math.floor(Math.random() * types.length)];

                  if (randomType === "shipment_update") {
                    notifyShipmentUpdate(
                      "demo-" + Date.now(),
                      "DELIVERED",
                      "TRK" + Math.random().toString().substr(2, 9)
                    );
                  } else if (randomType === "maintenance_alert") {
                    notifyMaintenance(
                      "VH-" + Math.floor(Math.random() * 100),
                      "Truck " +
                        String.fromCharCode(
                          65 + Math.floor(Math.random() * 26)
                        ),
                      "Maintenance Check"
                    );
                  } else {
                    notifySystemAlert(
                      "Demo Alert",
                      "This is a test notification to demonstrate the real-time notification system.",
                      "medium"
                    );
                  }
                }}
                className="shadow-sm"
              >
                Test Notifications
              </Button>
              <Link href="/admin/shipments/new">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add new shipment
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-8">
          {/* Column 1: KPI Cards + Shipments Statistics (7/12 width) */}
          <div className="xl:col-span-7 flex flex-col space-y-4">
            {/* Top Half: KPI Cards */}
            <StatsCards
              stats={
                stats || {
                  totalShipments: 0,
                  pendingShipments: 0,
                  inTransitShipments: 0,
                  deliveredShipments: 0,
                  revenue: 0,
                  newContacts: 0,
                }
              }
              isLoading={isLoading}
            />

            {/* Bottom Half: Shipments Statistics with Tabs */}
            <div className="flex-1">
              <ShipmentsStatistics
                totalDeliveries={stats?.deliveredShipments || 0}
                dateFrom={filters.dateFrom}
                dateTo={filters.dateTo}
              />
            </div>
          </div>

          {/* Column 2: Tracking Delivery (5/12 width) */}
          <div className="xl:col-span-5">
            <TrackingWidget />
          </div>
        </div>

        {/* Bottom Section: Shipments Activities Table + World Map */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Column 1: Shipments Activities Table (8/12 width) */}
          <div className="xl:col-span-8">
            <Card className="border-0 shadow-sm bg-white h-full">
              <CardHeader className="border-b border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Shipments Activities
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Keep track of recent shipping activity
                    </p>
                  </div>

                  {/* Status Tabs - Desktop */}
                  <div className="hidden lg:block">
                    <Tabs
                      value={filters.status}
                      onValueChange={(value) =>
                        setFilters({ ...filters, status: value })
                      }
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="all">All Shipments</TabsTrigger>
                        <TabsTrigger value="DELIVERED">Delivered</TabsTrigger>
                        <TabsTrigger value="IN_TRANSIT">In transit</TabsTrigger>
                        <TabsTrigger value="PENDING">Pending</TabsTrigger>
                        <TabsTrigger value="PICKED_UP">Processing</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Status Tabs - Tablet */}
                  <div className="hidden md:block lg:hidden">
                    <Tabs
                      value={filters.status}
                      onValueChange={(value) =>
                        setFilters({ ...filters, status: value })
                      }
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All Shipments</TabsTrigger>
                        <TabsTrigger value="DELIVERED">Delivered</TabsTrigger>
                        <TabsTrigger value="IN_TRANSIT">In transit</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Status Dropdown - Mobile */}
                  <div className="md:hidden">
                    <Select
                      value={filters.status}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Shipments</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="IN_TRANSIT">In transit</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="PICKED_UP">Processing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ShipmentsTable
                  shipments={shipments}
                  selectedShipments={selectedShipments}
                  onSelectAll={handleSelectAll}
                  onSelectShipment={handleSelectShipment}
                  onBulkDelete={handleBulkDelete}
                  filters={filters}
                  setFilters={setFilters}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>

          {/* Column 2: World Map (4/12 width) */}
          <div className="xl:col-span-4">
            <WorldMapWidget isLoading={isLoading} />
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer notifications={toasts} onDismiss={dismissToast} />
    </div>
  );
}

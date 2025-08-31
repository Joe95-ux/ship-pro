import { Package, Clock, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@/lib/types";

interface StatsCardsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading = false }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Shipments",
      value: stats.totalShipments.toLocaleString(),
      icon: Package,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      change: "+1.92%",
      changeType: "positive" as const
    },
    {
      title: "Pending Package",
      value: stats.pendingShipments.toLocaleString(),
      icon: Clock,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      change: "+1.89%",
      changeType: "positive" as const
    },
    {
      title: "Delivery Shipments",
      value: stats.deliveredShipments.toLocaleString(),
      icon: CheckCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      change: "-0.98%",
      changeType: "negative" as const
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="border-0 shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{card.value}</p>
                <div className="flex items-center">
                  {card.changeType === "positive" ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    card.changeType === "positive" ? "text-green-600" : "text-red-600"
                  }`}>
                    {card.change}
                  </span>
                </div>
              </div>
              <div className={`p-2 rounded-xl ${card.bgColor} flex-shrink-0`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

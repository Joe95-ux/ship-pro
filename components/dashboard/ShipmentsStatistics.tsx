"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getChartData, getRevenueData } from "@/lib/dashboard-actions";

interface ChartData {
  date: string;
  shipments: number;
  deliveries: number;
}

interface RevenueData {
  service: string;
  revenue: number;
  percentage: number;
  color: string;
}

interface ShipmentsStatisticsProps {
  totalDeliveries: number;
}

export function ShipmentsStatistics({ totalDeliveries }: ShipmentsStatisticsProps) {
  const [activeTab, setActiveTab] = useState('shipments');
  const [timeframe, setTimeframe] = useState('daily');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
                 if (activeTab === 'shipments') {
           const data = await getChartData(timeframe as 'daily' | 'weekly' | 'monthly');
          setChartData(data);
        } else {
          const data = await getRevenueData();
          setRevenueData(data);
        }
      } catch (error) {
        console.error('Failed to load chart data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [activeTab, timeframe]);

  const maxValue = Math.max(...chartData.map(d => Math.max(d.shipments, d.deliveries)), 1);
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <Card className="border-0 shadow-sm bg-white h-full">
      <CardHeader className="pb-4 border-b border-gray-100">
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">Shipments Statistics</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Total number of deliveries {totalDeliveries.toLocaleString()}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
            {/* Timeframe Selector - Only show for shipments tab */}
            {activeTab === 'shipments' && (
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-24 h-9 bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 flex-1">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="shipments">Shipments</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          {activeTab === 'shipments' && (
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Legends */}
              <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0"></div>
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Shipments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-600 whitespace-nowrap">Deliveries</span>
                </div>
              </div>

              {/* Y-axis and Chart */}
              <div className="flex flex-1">
                {/* Y-axis */}
                <div className="flex flex-col justify-between text-xs text-gray-500 mr-3 sm:mr-4 h-48 sm:h-64">
                  <span className="font-medium">{maxValue}</span>
                  <span>{Math.round(maxValue * 0.8)}</span>
                  <span>{Math.round(maxValue * 0.6)}</span>
                  <span>{Math.round(maxValue * 0.4)}</span>
                  <span>{Math.round(maxValue * 0.2)}</span>
                  <span className="font-medium">0</span>
                </div>

                                 {/* Chart Area */}
                 <div className="flex-1 min-w-0">
                   <div className="relative h-48 sm:h-64">
                     {isLoading ? (
                       <div className="h-full flex items-center justify-center">
                         <div className="text-center">
                           <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto mb-2"></div>
                           <p className="text-xs text-gray-500">Loading chart data...</p>
                         </div>
                       </div>
                     ) : (
                       <>
                         {/* Grid Lines */}
                         <div className="absolute inset-0">
                           {[0, 20, 40, 60, 80, 100].map((percent) => (
                             <div
                               key={percent}
                               className="absolute w-full border-t border-gray-100"
                               style={{ top: `${100 - (percent / 100) * 100}%` }}
                             ></div>
                           ))}
                         </div>
                         
                         {/* Bars */}
                         <div className="relative h-full flex items-end justify-between space-x-1">
                           {chartData.map((data, index) => (
                             <div key={index} className="flex-1 flex items-end space-x-0.5 sm:space-x-1">
                               <div 
                                 className="flex-1 bg-blue-600 rounded-t transition-all duration-300 hover:bg-blue-700"
                                 style={{ 
                                   height: `${(data.shipments / maxValue) * 100}%`,
                                   minHeight: '4px'
                                 }}
                                 title={`Shipments: ${data.shipments}`}
                               ></div>
                               <div 
                                 className="flex-1 bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                                 style={{ 
                                   height: `${(data.deliveries / maxValue) * 100}%`,
                                   minHeight: '4px'
                                 }}
                                 title={`Deliveries: ${data.deliveries}`}
                               ></div>
                             </div>
                           ))}
                         </div>
                       </>
                     )}
                   </div>
                   
                   {/* X-axis labels */}
                   <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                     {chartData.map((data, index) => (
                       <span key={index} className="font-medium text-center flex-1 truncate px-0.5">
                         {data.date}
                       </span>
                     ))}
                   </div>
                 </div>
              </div>
              
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-gray-100">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg sm:text-xl font-semibold text-blue-600">
                    {chartData.reduce((sum, d) => sum + d.shipments, 0).toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Shipments</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg sm:text-xl font-semibold text-green-600">
                    {chartData.reduce((sum, d) => sum + d.deliveries, 0).toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Deliveries</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="space-y-6 flex-1 flex flex-col">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto mb-2"></div>
                    <p className="text-xs text-gray-500">Loading revenue data...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Total Revenue Display */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-sm text-green-600 font-medium">+2.52%</span>
                      <span className="text-sm text-gray-600">vs last month</span>
                    </div>
                  </div>

                  {/* Pie Chart and Legend Container */}
                  <div className="flex-1 flex flex-col lg:flex-row items-center gap-6">
                    {/* Pie Chart */}
                    <div className="flex-shrink-0">
                      <h4 className="text-sm font-medium text-gray-700 text-center mb-4">Revenue Distribution</h4>
                      <div className="relative w-64 h-64">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          {/* Pie Chart */}
                          {(() => {
                            let currentAngle = 0;
                            return revenueData.map((item, index) => {
                              const angle = (item.percentage / 100) * 360;
                              const startAngle = currentAngle;
                              const endAngle = currentAngle + angle;
                              
                              const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
                              const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
                              const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
                              const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
                              
                              const largeArcFlag = angle > 180 ? 1 : 0;
                              
                              const pathData = [
                                `M 50 50`,
                                `L ${x1} ${y1}`,
                                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                `Z`
                              ].join(' ');
                              
                              currentAngle += angle;
                              
                              return (
                                <path
                                  key={index}
                                  d={pathData}
                                  fill={item.color}
                                  stroke="#fff"
                                  strokeWidth="1"
                                />
                              );
                            });
                          })()}
                          
                          {/* Center circle */}
                          <circle cx="50" cy="50" r="15" fill="#fff" stroke="#e5e7eb" strokeWidth="1" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex-1 space-y-3 min-w-0">
                      <h4 className="text-sm font-medium text-gray-700 lg:hidden">Revenue Breakdown</h4>
                      {revenueData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div 
                              className="w-4 h-4 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-gray-700 font-medium truncate">{item.service}</span>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className="font-semibold text-gray-900">${item.revenue.toLocaleString()}</div>
                            <div className="text-gray-500 text-xs">{item.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {revenueData.length}
                      </div>
                      <div className="text-xs text-gray-600">Services</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        ${Math.round(totalRevenue / revenueData.length).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Avg per Service</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

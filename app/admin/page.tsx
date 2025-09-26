"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  Users,
  DollarSign,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import type { DashboardStats, ShipmentListItem, ContactFormListItem, ShipmentWithDetails } from "@/lib/types";

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [shipments, setShipments] = useState<ShipmentListItem[]>([]);
  const [contacts, setContacts] = useState<ContactFormListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (isLoaded && (!user || user.publicMetadata.role !== 'admin')) {
      redirect('/');
    }
  }, [user, isLoaded]);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let loadedShipments: (ShipmentWithDetails | ShipmentListItem)[] = [];
      let loadedContacts: ContactFormListItem[] = [];
      
      // Load shipments from API
      const shipmentsResponse = await fetch('/api/shipments?limit=50');
      if (shipmentsResponse.ok) {
        const shipmentsData = await shipmentsResponse.json();
        loadedShipments = shipmentsData.data || [];
        setShipments((loadedShipments as ShipmentWithDetails[]).map((shipment) => ({
          id: shipment.id,
          trackingNumber: shipment.trackingNumber,
          status: shipment.status,
          senderName: shipment.senderName,
          receiverName: shipment.receiverName,
          shipmentType: shipment.shipmentType,
          paymentMode: shipment.paymentMode,
          estimatedDelivery: new Date(shipment.estimatedDelivery || shipment.createdAt),
          estimatedCost: shipment.estimatedCost,
          createdAt: new Date(shipment.createdAt),
          service: { name: shipment.service?.name || 'Unknown Service' }
        })));
      } else {
        console.error('Failed to load shipments');
        // Fallback to mock data if API fails
        const mockShipments = [
          {
            id: "1",
            trackingNumber: "SP123456789",
            status: "IN_TRANSIT" as const,
            senderName: "John Doe",
            receiverName: "Jane Smith",
            estimatedDelivery: new Date("2024-01-15T17:00:00Z"),
            createdAt: new Date("2024-01-12T09:00:00Z"),
            service: { name: "Express Delivery" }
          }
        ] as ShipmentListItem[];
        setShipments(mockShipments);
        loadedShipments = mockShipments;
      }

      // Load contacts from API (if available)
      try {
        const contactsResponse = await fetch('/api/contact');
        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          loadedContacts = contactsData.data || [];
          setContacts(loadedContacts);
        } else {
          // Fallback to mock data
          const mockContacts = [
            {
              id: "1",
              name: "Sarah Johnson",
              email: "sarah@example.com",
              company: "Tech Corp",
              serviceType: "Express Delivery",
              status: "new",
              createdAt: new Date("2024-01-13T14:30:00Z")
            }
          ] as ContactFormListItem[];
          setContacts(mockContacts);
          loadedContacts = mockContacts;
        }
      } catch (error) {
        console.error('Failed to load contacts:', error);
        loadedContacts = [];
      }

      // Calculate stats from loaded data
      const totalShipments = loadedShipments.length;
      const pendingShipments = loadedShipments.filter((s) => s.status === 'PENDING').length;
      const inTransitShipments = loadedShipments.filter((s) => s.status === 'IN_TRANSIT').length;
      const deliveredShipments = loadedShipments.filter((s) => s.status === 'DELIVERED').length;
      
      setStats({
        totalShipments,
        pendingShipments,
        inTransitShipments,
        deliveredShipments,
        revenue: totalShipments * 45, // Mock revenue calculation
        newContacts: loadedContacts.length
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set fallback data
      setStats({
        totalShipments: 0,
        pendingShipments: 0,
        inTransitShipments: 0,
        deliveredShipments: 0,
        revenue: 0,
        newContacts: 0
      });
    } finally {
      setIsLoading(false);
    }
     }, []);

  useEffect(() => {
    if (user?.publicMetadata.role === 'admin') {
      loadDashboardData();
    }
  }, [loadDashboardData, user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PICKED_UP':
        return 'bg-blue-100 text-blue-800';
      case 'IN_TRANSIT':
        return 'bg-purple-100 text-purple-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-orange-100 text-orange-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getContactStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoaded || !user || user.publicMetadata.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Skeleton loading component
  const SkeletonCard = () => (
    <Card className="border-0 logistics-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );

  const SkeletonTableRow = () => (
    <TableRow>
      <TableCell><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></TableCell>
      <TableCell><div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div></TableCell>
      <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
      <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
      <TableCell><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></TableCell>
      <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
      <TableCell><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage shipments, track performance, and handle customer inquiries</p>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <Card className="border-0 logistics-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalShipments.toLocaleString()}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 logistics-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pendingShipments}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 logistics-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Transit</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.inTransitShipments}</p>
                  </div>
                  <Truck className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 logistics-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.deliveredShipments.toLocaleString()}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 logistics-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 logistics-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New Contacts</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.newContacts}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Main Content */}
        <Tabs defaultValue="shipments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-2 max-w-[320px] h-11">
            <TabsTrigger value="shipments">Shipments</TabsTrigger>
            <TabsTrigger value="contacts">Contact Forms</TabsTrigger>
          </TabsList>

          {/* Shipments Tab */}
          <TabsContent value="shipments" className="space-y-6">
            <Card className="border-0 logistics-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Shipment Management</CardTitle>
                  <Link href="/admin/shipments/new">
                    <Button className="dhl-gradient text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      New Shipment
                    </Button>
                  </Link>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by tracking number, sender, or receiver..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                      <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                      <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tracking Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sender</TableHead>
                        <TableHead>Receiver</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Est. Delivery</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        [...Array(5)].map((_, i) => (
                          <SkeletonTableRow key={i} />
                        ))
                      ) : (
                        (shipments as ShipmentListItem[]).map((shipment) => (
                        <TableRow key={shipment.id as string}>
                          <TableCell className="font-mono font-medium">
                            {shipment.trackingNumber as string}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(shipment.status as string)}>
                              {(shipment.status as string).replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{shipment.senderName as string}</TableCell>
                          <TableCell>{shipment.receiverName as string}</TableCell>
                          <TableCell>{(shipment.service as { name: string }).name}</TableCell>
                          <TableCell>{(shipment as ShipmentListItem).shipmentType?.replace('_', ' ') || 'N/A'}</TableCell>
                          <TableCell>{(shipment as ShipmentListItem).paymentMode?.replace('_', ' ') || 'N/A'}</TableCell>
                          <TableCell>{formatDate(shipment.estimatedDelivery)}</TableCell>
                          <TableCell>{formatDate(shipment.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Link href={`/admin/shipments/${shipment.id}`}>
                                <Button variant="outline" size="sm">View</Button>
                              </Link>
                              <Link href={`/admin/shipments/${shipment.id}/edit`}>
                                <Button variant="outline" size="sm">Edit</Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Forms Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <Card className="border-0 logistics-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Contact Form Submissions</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Service Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        [...Array(3)].map((_, i) => (
                          <SkeletonTableRow key={i} />
                        ))
                      ) : (
                        contacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell>{contact.email}</TableCell>
                          <TableCell>{contact.company || '-'}</TableCell>
                          <TableCell>{contact.serviceType || '-'}</TableCell>
                          <TableCell>
                            <Badge className={getContactStatusColor(contact.status)}>
                              {contact.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(contact.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Link href={`/admin/contacts/${contact.id}`}>
                                <Button variant="outline" size="sm">View</Button>
                              </Link>
                              <Button variant="outline" size="sm">
                                Mark Contacted
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

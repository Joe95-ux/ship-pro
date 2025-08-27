"use client";

import { useState, useEffect } from "react";
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
import type { DashboardStats, ShipmentListItem, ContactFormListItem } from "@/lib/types";

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

  useEffect(() => {
    if (user?.publicMetadata.role === 'admin') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, these would be actual API calls
      // For demo purposes, using mock data
      setStats({
        totalShipments: 1250,
        pendingShipments: 45,
        inTransitShipments: 89,
        deliveredShipments: 1116,
        revenue: 125000,
        newContacts: 23
      });

      setShipments([
        {
          id: "1",
          trackingNumber: "SP123456789",
          status: "IN_TRANSIT" as const,
          senderName: "John Doe",
          receiverName: "Jane Smith",
          estimatedDelivery: "2024-01-15T17:00:00Z",
          createdAt: "2024-01-12T09:00:00Z",
          service: { name: "Express Delivery" }
        },
        {
          id: "2",
          trackingNumber: "SP123456790",
          status: "DELIVERED" as const,
          senderName: "Alice Johnson",
          receiverName: "Bob Wilson",
          estimatedDelivery: "2024-01-14T15:00:00Z",
          createdAt: "2024-01-11T10:30:00Z",
          service: { name: "Standard Delivery" }
        },
        {
          id: "3",
          trackingNumber: "SP123456791",
          status: "PENDING" as const,
          senderName: "Carol Brown",
          receiverName: "David Lee",
          estimatedDelivery: "2024-01-16T14:00:00Z",
          createdAt: "2024-01-13T11:15:00Z",
          service: { name: "International Shipping" }
        }
      ] as ShipmentListItem[]);

      setContacts([
        {
          id: "1",
          name: "Sarah Johnson",
          email: "sarah@example.com",
          company: "Tech Corp",
          serviceType: "Express Delivery",
          status: "new",
          createdAt: "2024-01-13T14:30:00Z"
        },
        {
          id: "2",
          name: "Michael Chen",
          email: "michael@company.com",
          company: "Global Imports",
          serviceType: "International Shipping",
          status: "contacted",
          createdAt: "2024-01-13T10:20:00Z"
        }
      ] as ContactFormListItem[]);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage shipments, track performance, and handle customer inquiries</p>
        </div>

        {/* Stats Cards */}
        {stats && (
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
        )}

        {/* Main Content */}
        <Tabs defaultValue="shipments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
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
                        <TableHead>Est. Delivery</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(shipments as ShipmentListItem[]).map((shipment) => (
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
                          <TableCell>{formatDate(shipment.estimatedDelivery as string)}</TableCell>
                          <TableCell>{formatDate(shipment.createdAt as string)}</TableCell>
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
                      ))}
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
                      {contacts.map((contact) => (
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
                      ))}
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

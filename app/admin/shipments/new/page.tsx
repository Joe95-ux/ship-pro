"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect, useRouter } from "next/navigation";
import { ArrowLeft, Package, MapPin, User, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import type { ShipmentCreateData, Service } from "@/lib/types";

export default function NewShipmentPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  
  const [formData, setFormData] = useState<ShipmentCreateData>({
    // Sender Information
    senderName: "",
    senderEmail: "",
    senderPhone: "",
    senderAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "USA"
    },

    // Receiver Information
    receiverName: "",
    receiverEmail: "",
    receiverPhone: "",
    receiverAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "USA"
    },

    // Shipment Details
    serviceId: "",
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      unit: "cm"
    },
    value: 0,
    description: "",
    specialInstructions: "",

    // Pricing
    estimatedCost: 0,
    currency: "USD"
  });

  // Check if user is admin
  useEffect(() => {
    if (isLoaded && (!user || user.publicMetadata.role !== 'admin')) {
      redirect('/');
    }
  }, [user, isLoaded]);

  useEffect(() => {
    if (user?.publicMetadata.role === 'admin') {
      loadServices();
    }
  }, [user]);

  const loadServices = async () => {
    // Mock services data
    setServices([
      { 
        id: "1", 
        name: "Express Delivery", 
        description: "Fast delivery service",
        features: [],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        id: "2", 
        name: "Standard Delivery", 
        description: "Regular delivery service",
        features: [],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        id: "3", 
        name: "International Shipping", 
        description: "International delivery service",
        features: [],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof ShipmentCreateData],
        [field]: value
      }
    }));
  };

  const handleAddressChange = (type: 'senderAddress' | 'receiverAddress', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleDimensionChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [field]: value
      }
    }));
  };

  const calculateEstimatedCost = () => {
    // Simple calculation based on weight and service
    const baseRate = formData.serviceId === "1" ? 25 : formData.serviceId === "2" ? 15 : 35;
    const weightRate = formData.weight * 2;
    const total = baseRate + weightRate;
    
    setFormData(prev => ({
      ...prev,
      estimatedCost: total
    }));
  };

  useEffect(() => {
    if (formData.weight > 0 && formData.serviceId) {
      calculateEstimatedCost();
    }
  }, [formData.weight, formData.serviceId]);

  const generateTrackingNumber = () => {
    return `SP${Date.now().toString().slice(-9)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.senderName || !formData.receiverName || !formData.serviceId) {
        throw new Error("Please fill in all required fields");
      }

      // Generate tracking number
      const trackingNumber = generateTrackingNumber();

      // Here you would typically make an API call to create the shipment
      // For demo purposes, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Shipment Created!",
        description: `Tracking number: ${trackingNumber}`,
      });

      // Redirect to shipment details or back to dashboard
      router.push('/admin');

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create shipment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Shipment</h1>
          <p className="text-gray-600">Enter shipment details to create a new shipping order</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sender Information */}
          <Card className="border-0 logistics-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-red-600" />
                <span>Sender Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="senderName">Full Name *</Label>
                  <Input
                    id="senderName"
                    value={formData.senderName}
                    onChange={(e) => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="senderEmail">Email Address *</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    value={formData.senderEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, senderEmail: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="senderPhone">Phone Number *</Label>
                  <Input
                    id="senderPhone"
                    type="tel"
                    value={formData.senderPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, senderPhone: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="senderStreet">Street Address *</Label>
                  <Input
                    id="senderStreet"
                    value={formData.senderAddress.street}
                    onChange={(e) => handleAddressChange('senderAddress', 'street', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="senderCity">City *</Label>
                  <Input
                    id="senderCity"
                    value={formData.senderAddress.city}
                    onChange={(e) => handleAddressChange('senderAddress', 'city', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="senderState">State *</Label>
                  <Input
                    id="senderState"
                    value={formData.senderAddress.state}
                    onChange={(e) => handleAddressChange('senderAddress', 'state', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="senderPostalCode">Postal Code *</Label>
                  <Input
                    id="senderPostalCode"
                    value={formData.senderAddress.postalCode}
                    onChange={(e) => handleAddressChange('senderAddress', 'postalCode', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="senderCountry">Country *</Label>
                  <Select 
                    value={formData.senderAddress.country}
                    onValueChange={(value) => handleAddressChange('senderAddress', 'country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USA">United States</SelectItem>
                      <SelectItem value="CAN">Canada</SelectItem>
                      <SelectItem value="MEX">Mexico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receiver Information */}
          <Card className="border-0 logistics-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-red-600" />
                <span>Receiver Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="receiverName">Full Name *</Label>
                  <Input
                    id="receiverName"
                    value={formData.receiverName}
                    onChange={(e) => setFormData(prev => ({ ...prev, receiverName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="receiverEmail">Email Address *</Label>
                  <Input
                    id="receiverEmail"
                    type="email"
                    value={formData.receiverEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, receiverEmail: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="receiverPhone">Phone Number *</Label>
                  <Input
                    id="receiverPhone"
                    type="tel"
                    value={formData.receiverPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, receiverPhone: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="receiverStreet">Street Address *</Label>
                  <Input
                    id="receiverStreet"
                    value={formData.receiverAddress.street}
                    onChange={(e) => handleAddressChange('receiverAddress', 'street', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="receiverCity">City *</Label>
                  <Input
                    id="receiverCity"
                    value={formData.receiverAddress.city}
                    onChange={(e) => handleAddressChange('receiverAddress', 'city', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="receiverState">State *</Label>
                  <Input
                    id="receiverState"
                    value={formData.receiverAddress.state}
                    onChange={(e) => handleAddressChange('receiverAddress', 'state', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="receiverPostalCode">Postal Code *</Label>
                  <Input
                    id="receiverPostalCode"
                    value={formData.receiverAddress.postalCode}
                    onChange={(e) => handleAddressChange('receiverAddress', 'postalCode', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="receiverCountry">Country *</Label>
                  <Select 
                    value={formData.receiverAddress.country}
                    onValueChange={(value) => handleAddressChange('receiverAddress', 'country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USA">United States</SelectItem>
                      <SelectItem value="CAN">Canada</SelectItem>
                      <SelectItem value="MEX">Mexico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Information */}
          <Card className="border-0 logistics-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-red-600" />
                <span>Package Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service">Service Type *</Label>
                  <Select 
                    value={formData.serviceId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, serviceId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="weight">Weight (lbs) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label>Dimensions (cm) *</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Input
                      placeholder="Length"
                      type="number"
                      value={formData.dimensions.length}
                      onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Width"
                      type="number"
                      value={formData.dimensions.width}
                      onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Height"
                      type="number"
                      value={formData.dimensions.height}
                      onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">Package Value ($)</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    step="0.01"
                    value={formData.estimatedCost}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Package Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the contents of the package..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  placeholder="Any special handling or delivery instructions..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/admin">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="dhl-gradient text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Creating...
                </>
              ) : (
                'Create Shipment'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

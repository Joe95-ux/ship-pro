"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect, useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, MapPin, User, Save, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

interface EditShipmentData {
  id: string;
  trackingNumber: string;
  status: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  receiverName: string;
  receiverEmail: string;
  receiverPhone: string;
  receiverAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  serviceId: string;
  shipmentType: string;
  shipmentMode: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  value: number;
  description: string;
  specialInstructions: string;
  currentLocation?: {
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  estimatedCost: number;
  finalCost: number;
  currency: string;
  paymentStatus: string;
  paymentMode: string;
}

export default function EditShipmentPage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  const shipmentId = params.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<EditShipmentData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const totalSteps = 5;
  const stepTitles = [
    "Status & Payment",
    "Sender Information",
    "Receiver Information", 
    "Current Location",
    "Package Details"
  ];

  const loadShipmentData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/shipments/${shipmentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch shipment data');
      }
      
      const shipmentData = await response.json();
      const shipment = shipmentData.shipment;
      
      // Transform the API data to match the form structure
      const editData: EditShipmentData = {
        id: shipment.id,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        senderName: shipment.senderName,
        senderEmail: shipment.senderEmail,
        senderPhone: shipment.senderPhone,
        senderAddress: shipment.senderAddress,
        receiverName: shipment.receiverName,
        receiverEmail: shipment.receiverEmail,
        receiverPhone: shipment.receiverPhone,
        receiverAddress: shipment.receiverAddress,
        serviceId: shipment.serviceId || shipment.service?.id || "",
        shipmentType: shipment.shipmentType || "INTERNATIONAL_SHIPPING",
        shipmentMode: shipment.shipmentMode || "LAND_SHIPPING",
        weight: shipment.weight,
        dimensions: shipment.dimensions,
        value: shipment.value,
        description: shipment.description,
        specialInstructions: shipment.specialInstructions,
        currentLocation: shipment.currentLocation || {
          name: "",
          address: {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "USA"
          },
          coordinates: {
            latitude: 0,
            longitude: 0
          }
        },
        estimatedCost: shipment.estimatedCost,
        finalCost: shipment.finalCost,
        currency: shipment.currency,
        paymentStatus: shipment.paymentStatus,
        paymentMode: shipment.paymentMode || "CARD"
      };
      
      setFormData(editData);
      
    } catch (error) {
      console.error('Failed to load shipment data:', error);
      toast({
        title: "Error",
        description: "Failed to load shipment data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [shipmentId]);

  // Check if user is admin
  useEffect(() => {
    if (isLoaded && (!user || user.publicMetadata.role !== 'admin')) {
      redirect('/');
    }
  }, [user, isLoaded]);

  useEffect(() => {
    if (user?.publicMetadata.role === 'admin' && shipmentId) {
      loadShipmentData();
    }
  }, [user, shipmentId, loadShipmentData]);

  const handleInputChange = (field: string, value: string | number) => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const handleAddressChange = (type: 'senderAddress' | 'receiverAddress', field: string, value: string) => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      [type]: {
        ...prev![type],
        [field]: value
      }
    }));
  };

  const handleDimensionChange = (field: string, value: number) => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      dimensions: {
        ...prev!.dimensions,
        [field]: value
      }
    }));
  };

  const handleCurrentLocationChange = (field: string, value: string | number) => {
    if (!formData) return;
    if (field.startsWith('address.')) {
      const addressField = field.replace('address.', '');
      setFormData(prev => ({
        ...prev!,
        currentLocation: {
          ...prev!.currentLocation!,
          address: {
            ...prev!.currentLocation!.address,
            [addressField]: value
          }
        }
      }));
    } else if (field.startsWith('coordinates.')) {
      const coordField = field.replace('coordinates.', '');
      setFormData(prev => ({
        ...prev!,
        currentLocation: {
          ...prev!.currentLocation!,
          coordinates: {
            ...prev!.currentLocation!.coordinates!,
            [coordField]: typeof value === 'string' ? parseFloat(value) || 0 : value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev!,
        currentLocation: {
          ...prev!.currentLocation!,
          [field]: value
        }
      }));
    }
  };

  // Step validation functions
  const validateStep = (step: number): boolean => {
    if (!formData) return false;
    
    switch (step) {
      case 1: // Status & Payment
        return !!(formData.status && formData.paymentStatus);
      case 2: // Sender Information
        return !!(formData.senderName && formData.senderEmail && formData.senderPhone && 
                 formData.senderAddress.street && formData.senderAddress.city && 
                 formData.senderAddress.state && formData.senderAddress.postalCode);
      case 3: // Receiver Information
        return !!(formData.receiverName && formData.receiverEmail && formData.receiverPhone && 
                 formData.receiverAddress.street && formData.receiverAddress.city && 
                 formData.receiverAddress.state && formData.receiverAddress.postalCode);
      case 4: // Current Location
        return !!(formData.currentLocation?.name);
      case 5: // Package Details
        return !!(formData.serviceId && formData.weight > 0 && formData.dimensions.length > 0 && 
                 formData.dimensions.width > 0 && formData.dimensions.height > 0 && formData.description);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive"
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    // Allow going to completed steps or the next step
    if (completedSteps.includes(step) || step === currentStep + 1) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    if (!formData) return;
    
    setIsSubmitting(true);

    try {
      // Validate all steps before submitting
      for (let i = 1; i <= totalSteps; i++) {
        if (!validateStep(i)) {
          throw new Error("Please complete all required information before submitting");
        }
      }

      // Make API call to update the shipment
      const response = await fetch(`/api/shipments/${shipmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: formData.status,
          senderName: formData.senderName,
          senderEmail: formData.senderEmail,
          senderPhone: formData.senderPhone,
          senderAddress: formData.senderAddress,
          receiverName: formData.receiverName,
          receiverEmail: formData.receiverEmail,
          receiverPhone: formData.receiverPhone,
          receiverAddress: formData.receiverAddress,
          serviceId: formData.serviceId,
          shipmentType: formData.shipmentType,
          shipmentMode: formData.shipmentMode,
          weight: formData.weight,
          dimensions: formData.dimensions,
          value: formData.value,
          description: formData.description,
          specialInstructions: formData.specialInstructions,
          currentLocation: formData.currentLocation,
          estimatedCost: formData.estimatedCost,
          finalCost: formData.finalCost,
          currency: formData.currency,
          paymentStatus: formData.paymentStatus,
          paymentMode: formData.paymentMode
        }),
      });

      if (response.ok) {
        await response.json();
        
        toast({
          title: "Shipment Updated!",
          description: `Shipment ${formData.trackingNumber} has been updated successfully.`,
        });

        // Redirect back to shipment details with refresh flag
        router.push(`/admin/shipments/${shipmentId}?updated=${Date.now()}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update shipment');
      }

    } catch (error) {
      console.error('Update shipment error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update shipment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shipment data...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Shipment Not Found</h2>
          <p className="text-gray-600 mb-4">The requested shipment could not be found.</p>
          <Link href="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/admin/shipments/${shipmentId}`} className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shipment Details
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Shipment</h1>
              <p className="text-gray-600">Tracking Number: {formData.trackingNumber}</p>
            </div>
            <Badge className={getStatusColor(formData.status)}>
              {formData.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Progress Indicator */}
        <Card className="mb-8 border-0 logistics-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Progress</h3>
              <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="mb-4" />
            <div className="flex justify-between">
              {stepTitles.map((title, index) => (
                <button
                  key={index + 1}
                  onClick={() => goToStep(index + 1)}
                  className={`flex flex-col items-center space-y-2 p-2 rounded-lg transition-colors ${
                    currentStep === index + 1
                      ? 'bg-red-50 text-red-600'
                      : completedSteps.includes(index + 1)
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  disabled={!completedSteps.includes(index + 1) && index + 1 !== currentStep + 1}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === index + 1
                      ? 'bg-red-600 text-white'
                      : completedSteps.includes(index + 1)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {completedSteps.includes(index + 1) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-xs text-center max-w-20">{title}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {currentStep === 1 && (
          <Card className="border-0 logistics-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Save className="h-5 w-5 text-red-600" />
                <span>Step 1: Status & Payment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                      <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                      <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-group">
                  <Label htmlFor="paymentStatus">Payment Status *</Label>
                  <Select value={formData.paymentStatus} onValueChange={(value) => handleInputChange('paymentStatus', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="border-0 logistics-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-red-600" />
                <span>Step 2: Sender Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <Label htmlFor="senderName">Full Name *</Label>
                  <Input
                    id="senderName"
                    value={formData.senderName}
                    onChange={(e) => handleInputChange('senderName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="senderEmail">Email Address *</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    value={formData.senderEmail}
                    onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="senderPhone">Phone Number *</Label>
                  <Input
                    id="senderPhone"
                    type="tel"
                    value={formData.senderPhone}
                    onChange={(e) => handleInputChange('senderPhone', e.target.value)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 form-group">
                  <Label htmlFor="senderStreet">Street Address *</Label>
                  <Input
                    id="senderStreet"
                    value={formData.senderAddress.street}
                    onChange={(e) => handleAddressChange('senderAddress', 'street', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="senderCity">City *</Label>
                  <Input
                    id="senderCity"
                    value={formData.senderAddress.city}
                    onChange={(e) => handleAddressChange('senderAddress', 'city', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="senderState">State *</Label>
                  <Input
                    id="senderState"
                    value={formData.senderAddress.state}
                    onChange={(e) => handleAddressChange('senderAddress', 'state', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="senderPostalCode">Postal Code *</Label>
                  <Input
                    id="senderPostalCode"
                    value={formData.senderAddress.postalCode}
                    onChange={(e) => handleAddressChange('senderAddress', 'postalCode', e.target.value)}
                  />
                </div>
                <div className="form-group">
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
        )}

        {currentStep === 3 && (
          <Card className="border-0 logistics-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-red-600" />
                <span>Step 3: Receiver Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <Label htmlFor="receiverName">Full Name *</Label>
                  <Input
                    id="receiverName"
                    value={formData.receiverName}
                    onChange={(e) => handleInputChange('receiverName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="receiverEmail">Email Address *</Label>
                  <Input
                    id="receiverEmail"
                    type="email"
                    value={formData.receiverEmail}
                    onChange={(e) => handleInputChange('receiverEmail', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="receiverPhone">Phone Number *</Label>
                  <Input
                    id="receiverPhone"
                    type="tel"
                    value={formData.receiverPhone}
                    onChange={(e) => handleInputChange('receiverPhone', e.target.value)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 form-group">
                  <Label htmlFor="receiverStreet">Street Address *</Label>
                  <Input
                    id="receiverStreet"
                    value={formData.receiverAddress.street}
                    onChange={(e) => handleAddressChange('receiverAddress', 'street', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="receiverCity">City *</Label>
                  <Input
                    id="receiverCity"
                    value={formData.receiverAddress.city}
                    onChange={(e) => handleAddressChange('receiverAddress', 'city', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="receiverState">State *</Label>
                  <Input
                    id="receiverState"
                    value={formData.receiverAddress.state}
                    onChange={(e) => handleAddressChange('receiverAddress', 'state', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="receiverPostalCode">Postal Code *</Label>
                  <Input
                    id="receiverPostalCode"
                    value={formData.receiverAddress.postalCode}
                    onChange={(e) => handleAddressChange('receiverAddress', 'postalCode', e.target.value)}
                  />
                </div>
                <div className="form-group">
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
        )}

        {currentStep === 4 && (
          <Card className="border-0 logistics-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-red-600" />
                <span>Step 4: Current Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="form-group">
                <Label htmlFor="currentLocationName">Location Name *</Label>
                <Input
                  id="currentLocationName"
                  value={formData.currentLocation?.name || ""}
                  onChange={(e) => handleCurrentLocationChange('name', e.target.value)}
                  placeholder="e.g., Distribution Center"
                />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 form-group">
                  <Label htmlFor="currentLocationStreet">Street Address</Label>
                  <Input
                    id="currentLocationStreet"
                    value={formData.currentLocation?.address.street || ""}
                    onChange={(e) => handleCurrentLocationChange('address.street', e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="currentLocationCity">City</Label>
                  <Input
                    id="currentLocationCity"
                    value={formData.currentLocation?.address.city || ""}
                    onChange={(e) => handleCurrentLocationChange('address.city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="currentLocationState">State</Label>
                  <Input
                    id="currentLocationState"
                    value={formData.currentLocation?.address.state || ""}
                    onChange={(e) => handleCurrentLocationChange('address.state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="currentLocationPostalCode">Postal Code</Label>
                  <Input
                    id="currentLocationPostalCode"
                    value={formData.currentLocation?.address.postalCode || ""}
                    onChange={(e) => handleCurrentLocationChange('address.postalCode', e.target.value)}
                    placeholder="Postal Code"
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="currentLocationCountry">Country</Label>
                  <Select 
                    value={formData.currentLocation?.address.country || "USA"}
                    onValueChange={(value) => handleCurrentLocationChange('address.country', value)}
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
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <Label htmlFor="currentLocationLat">Latitude (Optional)</Label>
                  <Input
                    id="currentLocationLat"
                    type="number"
                    step="any"
                    value={formData.currentLocation?.coordinates?.latitude || ""}
                    onChange={(e) => handleCurrentLocationChange('coordinates.latitude', e.target.value)}
                    placeholder="e.g., 40.7128"
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="currentLocationLng">Longitude (Optional)</Label>
                  <Input
                    id="currentLocationLng"
                    type="number"
                    step="any"
                    value={formData.currentLocation?.coordinates?.longitude || ""}
                    onChange={(e) => handleCurrentLocationChange('coordinates.longitude', e.target.value)}
                    placeholder="e.g., -74.0060"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 5 && (
          <Card className="border-0 logistics-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-red-600" />
                <span>Step 5: Package Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <Label htmlFor="shipmentType">Shipment Type *</Label>
                  <Select 
                    value={formData.shipmentType}
                    onValueChange={(value) => handleInputChange('shipmentType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AIR_FREIGHT">Air Freight</SelectItem>
                      <SelectItem value="INTERNATIONAL_SHIPPING">International Shipping</SelectItem>
                      <SelectItem value="TRUCKLOAD">Truckload</SelectItem>
                      <SelectItem value="VAN_TRANSPORT">Van Transport</SelectItem>
                      <SelectItem value="SEA_TRANSPORT">Sea Transport</SelectItem>
                      <SelectItem value="PET">Pet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-group">
                  <Label htmlFor="shipmentMode">Shipment Mode *</Label>
                  <Select 
                    value={formData.shipmentMode}
                    onValueChange={(value) => handleInputChange('shipmentMode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEA_TRANSPORT">Sea Transport</SelectItem>
                      <SelectItem value="LAND_SHIPPING">Land Shipping</SelectItem>
                      <SelectItem value="AIR_FREIGHT">Air Freight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-group">
                  <Label htmlFor="paymentMode">Payment Mode *</Label>
                  <Select 
                    value={formData.paymentMode}
                    onValueChange={(value) => handleInputChange('paymentMode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="PAYPAL">PayPal</SelectItem>
                      <SelectItem value="CARD">Card</SelectItem>
                      <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                      <SelectItem value="APPLE_PAY">Apple Pay</SelectItem>
                      <SelectItem value="ZELLE">Zelle</SelectItem>
                      <SelectItem value="BACCS">BACCS</SelectItem>
                      <SelectItem value="ESCROW">Escrow</SelectItem>
                      <SelectItem value="GOOGLE_PAY">Google Pay</SelectItem>
                      <SelectItem value="CASHAPP">Cash App</SelectItem>
                      <SelectItem value="AMEX_GIFT_CARDS">AMEX Gift Cards</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <Label htmlFor="weight">Weight (lbs) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="value">Package Value ($)</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <Label>Dimensions (cm) *</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="form-group">
                    <Input
                      placeholder="Length"
                      type="number"
                      value={formData.dimensions.length}
                      onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <Input
                      placeholder="Width"
                      type="number"
                      value={formData.dimensions.width}
                      onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <Input
                      placeholder="Height"
                      type="number"
                      value={formData.dimensions.height}
                      onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    step="0.01"
                    value={formData.estimatedCost}
                    onChange={(e) => handleInputChange('estimatedCost', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="finalCost">Final Cost ($)</Label>
                  <Input
                    id="finalCost"
                    type="number"
                    step="0.01"
                    value={formData.finalCost || 0}
                    onChange={(e) => handleInputChange('finalCost', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <Label htmlFor="description">Package Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the contents of the package..."
                />
              </div>
              
              <div className="form-group">
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  placeholder="Any special handling or delivery instructions..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex space-x-4">
            <Link href={`/admin/shipments/${shipmentId}`}>
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            
            {currentStep < totalSteps ? (
              <Button 
                type="button"
                onClick={nextStep}
                className="dhl-gradient text-white flex items-center"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="dhl-gradient text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Shipment
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Prisma-generated types
import type {
  Shipment,
  Service,
  ContactForm,
  TrackingEvent,
  ShipmentStatus,
  PaymentStatus,
} from '@prisma/client';

export type {
  Shipment,
  Service,
  ContactForm,
  TrackingEvent,
  ShipmentStatus,
  PaymentStatus,
};

// Custom interfaces for API responses and form data
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: Coordinates;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  name: string;
  address: Address;
  coordinates: Coordinates;
  timestamp?: Date | string;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

// Contact Form Types
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  serviceType?: string;
  message: string;
}

export interface ContactFormResponse {
  id: string;
  message: string;
}

// Shipment Types
export interface ShipmentCreateData {
  // Sender Information
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderAddress: Address;

  // Receiver Information
  receiverName: string;
  receiverEmail: string;
  receiverPhone: string;
  receiverAddress: Address;

  // Shipment Details
  serviceId: string;
  weight: number;
  dimensions: Dimensions;
  value?: number;
  description: string;
  specialInstructions?: string;

  // Pricing
  estimatedCost: number;
  currency?: string;

  // Dates
  estimatedDelivery?: Date | string;
}

export interface ShipmentWithDetails extends Shipment {
  service: Service;
  trackingEvents: TrackingEvent[];
}

// Tracking Types
export interface TrackingData {
  trackingNumber: string;
  status: ShipmentStatus;
  estimatedDelivery?: Date | string;
  actualDelivery?: Date | string;
  currentLocation?: Location;
  route: Location[];
  events: TrackingEvent[];
  progress: number;
  sender: {
    name: string;
    address: Address;
  };
  receiver: {
    name: string;
    address: Address;
  };
  service: {
    name: string;
    description: string;
  };
  weight: number;
  dimensions: Dimensions;
  estimatedCost: number;
  finalCost?: number;
}

export interface TrackingEventCreate {
  shipmentId: string;
  status: string;
  description?: string;
  location?: Location;
  timestamp?: Date | string;
}

export interface TrackingUpdateData {
  status?: ShipmentStatus;
  location?: Location;
  description?: string;
}

// Service Types
export interface ServiceCreateData {
  name: string;
  description: string;
  features: string[];
  price?: string;
  icon?: string;
  active?: boolean;
}

// Admin Dashboard Types
export interface DashboardStats {
  totalShipments: number;
  pendingShipments: number;
  inTransitShipments: number;
  deliveredShipments: number;
  revenue: number;
  newContacts: number;
}

export interface ShipmentFilters {
  status?: ShipmentStatus;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  search?: string;
  serviceId?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
}

// Form State Types
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Table Types for Admin Dashboard
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
}

export interface TableSort {
  field: string;
  direction: 'asc' | 'desc';
}

// User Types (Clerk integration)
export interface UserMetadata {
  role?: 'admin' | 'user';
  company?: string;
  phone?: string;
}

// Receipt and Waybill Types
export interface ReceiptData {
  shipmentId: string;
  trackingNumber: string;
  sender: {
    name: string;
    address: Address;
  };
  receiver: {
    name: string;
    address: Address;
  };
  service: string;
  weight: number;
  dimensions: Dimensions;
  cost: number;
  currency: string;
  paymentStatus: PaymentStatus;
  createdAt: Date | string;
}

export interface WaybillData {
  shipmentId: string;
  trackingNumber: string;
  barcodeData: string;
  sender: {
    name: string;
    address: Address;
    phone: string;
    email: string;
  };
  receiver: {
    name: string;
    address: Address;
    phone: string;
    email: string;
  };
  service: {
    name: string;
    description: string;
  };
  package: {
    weight: number;
    dimensions: Dimensions;
    description: string;
    value?: number;
  };
  shipping: {
    cost: number;
    currency: string;
    estimatedDelivery: Date | string;
  };
  specialInstructions?: string;
  createdAt: Date | string;
}

// Notification Types
export interface NotificationData {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
}

// Map Types
export interface MapConfig {
  center: Coordinates;
  zoom: number;
  markers: MapMarker[];
  polyline?: Coordinates[];
}

export interface MapMarker {
  id: string;
  position: Coordinates;
  title: string;
  description?: string;
  icon?: string;
  type: 'origin' | 'destination' | 'current' | 'waypoint';
}

// Search Types
export interface SearchParams {
  query: string;
  filters?: Record<string, unknown>;
  sort?: TableSort;
  pagination?: PaginationParams;
}

export interface SearchResults<T> {
  results: T[];
  total: number;
  query: string;
  suggestions?: string[];
}

// File Upload Types
export interface FileUploadData {
  file: File;
  type: 'receipt' | 'waybill' | 'document';
  shipmentId?: string;
}

export interface UploadedFile {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date | string;
}

// Export commonly used type combinations
export type ShipmentListItem = Pick<
  ShipmentWithDetails,
  'id' | 'trackingNumber' | 'status' | 'senderName' | 'receiverName' | 'estimatedDelivery' | 'createdAt'
> & {
  service: Pick<Service, 'name'>;
};

export type ContactFormListItem = Pick<
  ContactForm,
  'id' | 'name' | 'email' | 'company' | 'serviceType' | 'status' | 'createdAt'
>;

export type TrackingEventWithLocation = TrackingEvent & {
  location?: Location;
};

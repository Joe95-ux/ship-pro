"use client";

import { useState, useCallback, useEffect } from "react";
import { Notification, ToastNotification } from "@/components/ui/notification-center";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('dashboard-notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        // Convert timestamp strings back to Date objects
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(notificationsWithDates);
      } catch (error) {
        console.error('Failed to load notifications from localStorage:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dashboard-notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    return newNotification.id;
  }, []);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const newToast: ToastNotification = {
      ...toast,
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    setToasts(prev => [...prev, newToast]);
    return newToast.id;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Helper functions for common notification types
  const notifyShipmentUpdate = useCallback((shipmentId: string, status: string, trackingNumber: string) => {
    const statusMessages = {
      'PICKED_UP': 'Package picked up and ready for transit',
      'IN_TRANSIT': 'Package is now in transit',
      'OUT_FOR_DELIVERY': 'Package is out for delivery',
      'DELIVERED': 'Package has been delivered successfully',
      'DELAYED': 'Package delivery has been delayed'
    };

    const priority = status === 'DELIVERED' ? 'high' : 
                    status === 'DELAYED' ? 'urgent' : 'medium';

    const type = status === 'DELIVERED' ? 'success' :
                 status === 'DELAYED' ? 'error' : 'info';

    addNotification({
      title: `Shipment Update: #${trackingNumber}`,
      message: statusMessages[status as keyof typeof statusMessages] || `Status updated to ${status}`,
      type,
      priority,
      actionUrl: `/admin/shipments/${shipmentId}`,
      actionLabel: 'View Details',
      metadata: { shipmentId, trackingNumber, status }
    });

    // Also show toast for important updates
    if (status === 'DELIVERED' || status === 'DELAYED') {
      addToast({
        title: `Shipment #${trackingNumber}`,
        message: statusMessages[status as keyof typeof statusMessages],
        type,
        duration: 5000
      });
    }
  }, [addNotification, addToast]);

  const notifySystemAlert = useCallback((title: string, message: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') => {
    const type = priority === 'urgent' ? 'error' : 
                 priority === 'high' ? 'warning' : 'info';

    addNotification({
      title,
      message,
      type,
      priority
    });

    if (priority === 'urgent' || priority === 'high') {
      addToast({
        title,
        message,
        type,
        duration: 7000
      });
    }
  }, [addNotification, addToast]);

  const notifyMaintenance = useCallback((vehicleId: string, vehicleName: string, maintenanceType: string) => {
    addNotification({
      title: `Maintenance Required: ${vehicleName}`,
      message: `${maintenanceType} maintenance is due for vehicle ${vehicleId}`,
      type: 'warning',
      priority: 'high',
      actionUrl: `/admin/vehicles/${vehicleId}`,
      actionLabel: 'View Vehicle',
      metadata: { vehicleId, vehicleName, maintenanceType }
    });

    addToast({
      title: 'Maintenance Alert',
      message: `${vehicleName} requires ${maintenanceType} maintenance`,
      type: 'warning',
      duration: 6000
    });
  }, [addNotification, addToast]);

  const notifyPerformanceAlert = useCallback((metric: string, value: number, threshold: number) => {
    const isAboveThreshold = value > threshold;
    const priority = isAboveThreshold ? 'high' : 'medium';
    const type = isAboveThreshold ? 'warning' : 'info';

    addNotification({
      title: `Performance Alert: ${metric}`,
      message: `${metric} is ${isAboveThreshold ? 'above' : 'below'} threshold (${value} vs ${threshold})`,
      type,
      priority,
      metadata: { metric, value, threshold }
    });
  }, [addNotification]);

  return {
    // State
    notifications,
    toasts,
    
    // Actions
    addNotification,
    addToast,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    dismissToast,
    
    // Helper functions
    notifyShipmentUpdate,
    notifySystemAlert,
    notifyMaintenance,
    notifyPerformanceAlert
  };
}

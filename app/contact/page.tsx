"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    serviceType: "",
    message: ""
  });

  const serviceTypes = [
    "Express Delivery",
    "International Shipping",
    "Freight Services",
    "Same Day Delivery",
    "Custom Solutions",
    "General Inquiry"
  ];

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: "1-800-SHIP-PRO",
      subdetails: "(1-800-744-7776)",
      action: "tel:+18007447776"
    },
    {
      icon: Mail,
      title: "Email",
      details: "info@shippro.com",
      subddetails: "support@shippro.com",
      action: "mailto:info@shippro.com"
    },
    {
      icon: MapPin,
      title: "Address",
      details: "123 Logistics Avenue",
      subddetails: "Ship City, SC 12345, USA",
      action: "https://maps.google.com"
    },
    {
      icon: Clock,
      title: "Hours",
      details: "24/7 Customer Support",
      subddetails: "Always here to help",
      action: null
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          serviceType: "",
          message: ""
        });
        toast({
          title: "Message Sent!",
          description: "We'll get back to you within 24 hours.",
        });
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-pattern bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Contact <span className="text-red-600">ShipPro</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Ready to revolutionize your shipping experience? Get in touch with our experts 
              for a free quote or to learn more about our comprehensive logistics solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="border-0 logistics-shadow hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
                    <info.icon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                  {info.action ? (
                    <a 
                      href={info.action}
                      className="block text-red-600 font-medium hover:text-red-700 transition-colors"
                    >
                      {info.details}
                    </a>
                  ) : (
                    <p className="text-red-600 font-medium">{info.details}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">{info.subddetails}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="border-0 logistics-shadow">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Request a Quote
                  </CardTitle>
                  <p className="text-gray-600">
                    Fill out the form below and we'll get back to you with a customized shipping solution.
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
                      <p className="text-gray-600">
                        Your message has been sent successfully. We'll get back to you within 24 hours.
                      </p>
                      <Button 
                        onClick={() => setIsSubmitted(false)}
                        variant="outline" 
                        className="mt-4"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="John Doe"
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="john@company.com"
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="(555) 123-4567"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="company">Company Name</Label>
                          <Input
                            id="company"
                            type="text"
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            placeholder="Company Inc."
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="serviceType">Service Type</Label>
                        <Select 
                          value={formData.serviceType} 
                          onValueChange={(value) => handleInputChange('serviceType', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceTypes.map((service) => (
                              <SelectItem key={service} value={service}>
                                {service}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          placeholder="Tell us about your shipping needs, package details, or any questions you have..."
                          rows={5}
                          required
                          className="mt-1"
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full dhl-gradient text-white hover:opacity-90"
                      >
                        {isSubmitting ? (
                          "Sending..."
                        ) : (
                          <>
                            Send Message
                            <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-6">
              {/* Map Placeholder */}
              <Card className="border-0 logistics-shadow">
                <CardContent className="p-0">
                  <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Interactive Map</p>
                      <p className="text-sm text-gray-400">123 Logistics Avenue, Ship City, SC</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Why Choose Us */}
              <Card className="border-0 logistics-shadow">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Why Choose ShipPro?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-red-600 rounded-full" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Free Quotes</h4>
                        <p className="text-gray-600 text-sm">No hidden fees or surprises - transparent pricing</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-red-600 rounded-full" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Expert Support</h4>
                        <p className="text-gray-600 text-sm">24/7 customer service from shipping professionals</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-red-600 rounded-full" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Fast Response</h4>
                        <p className="text-gray-600 text-sm">Same-day quotes and rapid shipment processing</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-red-600 rounded-full" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Global Reach</h4>
                        <p className="text-gray-600 text-sm">Worldwide shipping to 50+ countries</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="border-0 logistics-shadow bg-red-50 border-red-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Need Immediate Assistance?</h3>
                  <p className="text-red-700 text-sm mb-3">
                    For urgent shipping matters or existing shipment issues, call our emergency hotline:
                  </p>
                  <a 
                    href="tel:+18007447776"
                    className="inline-flex items-center font-semibold text-red-600 hover:text-red-700"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    1-800-SHIP-PRO
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Quick answers to common shipping questions
            </p>
          </div>
          
          <div className="space-y-6">
            <Card className="border-0 logistics-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How quickly can I get a shipping quote?
                </h3>
                <p className="text-gray-600">
                  Most quotes are provided within 2-4 hours during business hours. For urgent requests, 
                  call our hotline for immediate assistance.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 logistics-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Do you offer international shipping?
                </h3>
                <p className="text-gray-600">
                  Yes! We ship to over 50 countries worldwide with full customs clearance support 
                  and international tracking capabilities.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 logistics-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What information do I need for a quote?
                </h3>
                <p className="text-gray-600">
                  We need pickup and delivery addresses, package dimensions and weight, 
                  desired delivery timeframe, and any special handling requirements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

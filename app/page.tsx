import Link from "next/link";
import { ArrowRight, Clock, Shield, Truck, Globe, Package, MapPin, Star, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const services = [
    {
      icon: Truck,
      title: "Express Delivery",
      description: "Fast and reliable express delivery services for urgent shipments with same-day and next-day options.",
      features: ["Same-day delivery", "Next-day delivery", "Priority handling", "Real-time tracking"]
    },
    {
      icon: Globe,
      title: "International Shipping",
      description: "Global shipping solutions with customs clearance and international tracking capabilities.",
      features: ["Worldwide coverage", "Customs clearance", "Documentation support", "Multi-language tracking"]
    },
    {
      icon: Package,
      title: "Freight Services",
      description: "Comprehensive freight solutions for large shipments with competitive pricing and reliable handling.",
      features: ["LTL & FTL options", "Warehouse storage", "Loading assistance", "Insurance coverage"]
    },
    {
      icon: MapPin,
      title: "Real-time Tracking",
      description: "Advanced tracking system with GPS monitoring and real-time updates for complete visibility.",
      features: ["GPS tracking", "Live updates", "Delivery notifications", "Route optimization"]
    }
  ];

  const stats = [
    { icon: Package, value: "500K+", label: "Packages Delivered" },
    { icon: Globe, value: "50+", label: "Countries Served" },
    { icon: Users, value: "10K+", label: "Happy Customers" },
    { icon: TrendingUp, value: "99.8%", label: "On-Time Delivery" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "Tech Solutions Inc.",
      rating: 5,
      text: "ShipPro has revolutionized our shipping operations. The tracking system is incredible and customer service is top-notch."
    },
    {
      name: "Michael Chen",
      company: "Global Imports Ltd.",
      rating: 5,
      text: "Fast, reliable, and cost-effective. We've been using ShipPro for all our international shipments for over 2 years."
    },
    {
      name: "Emily Rodriguez",
      company: "E-commerce Store",
      rating: 5,
      text: "The best shipping partner we've ever had. Their technology and customer support are outstanding."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-pattern bg-gradient-to-br from-gray-50 to-gray-100 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Badge variant="secondary" className="px-3 py-1 bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Star className="h-3 w-3 mr-1" />
                  #1 Shipping Platform
                </Badge>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Ship Smarter,
                <span className="text-red-600 block">Deliver Faster</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Professional shipping and logistics solutions with real-time tracking, 
                competitive rates, and reliable delivery worldwide. Join thousands of businesses 
                who trust ShipPro for their shipping needs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button size="lg" className="dhl-gradient text-white hover:opacity-90 transition-all duration-300 w-full sm:w-auto">
                    Get Free Quote
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                
                <Link href="/tracking">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Track Package
                    <MapPin className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              
              <div className="mt-8 flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>Insured Delivery</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Truck className="h-4 w-4" />
                  <span>Fast Shipping</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl logistics-shadow p-8 border border-gray-200">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Ship</h3>
                    <Badge className="dhl-gradient text-white">Express</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="text-sm text-gray-600">New York, NY 10001</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="text-sm text-gray-600">Los Angeles, CA 90210</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm text-gray-600">5.2 lbs</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-sm text-gray-600">Express</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total Cost:</span>
                        <span className="text-2xl font-bold text-red-600">$24.99</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Delivery by tomorrow 5:00 PM</p>
                    </div>
                  </div>
                  
                  <Link href="/contact">
                    <Button className="w-full dhl-gradient text-white">
                      Ship Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
                  <stat.icon className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Shipping Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive logistics solutions tailored to meet your specific shipping needs, 
              from local delivery to international freight.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300 border-0 logistics-shadow">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
                    <service.icon className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-500">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/services">
              <Button size="lg" variant="outline" className="hover:bg-red-50 hover:border-red-200">
                View All Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers say about their shipping experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 logistics-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 dhl-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Ship with ShipPro?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses who trust us with their shipping needs. 
            Get started today with a free quote.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 w-full sm:w-auto">
                Request Free Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/tracking">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-600 w-full sm:w-auto">
                Track Your Package
                <MapPin className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import { 
  Truck, 
  Globe, 
  Package, 
  Clock, 
  Shield, 
  MapPin, 
  Plane, 
  Ship, 
  ArrowRight,
  Check,
  Star,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ServicesPage() {
  const mainServices = [
    {
      icon: Zap,
      title: "Express Delivery",
      description: "Lightning-fast delivery for time-sensitive shipments",
      features: [
        "Same-day delivery available",
        "Next-day delivery guarantee",
        "Priority handling and processing",
        "Real-time tracking and updates",
        "Signature confirmation",
        "Insurance up to $5,000"
      ],
      pricing: "Starting at $15.99",
      deliveryTime: "Same day - Next day",
      popular: true
    },
    {
      icon: Globe,
      title: "International Shipping",
      description: "Seamless global shipping with customs support",
      features: [
        "Worldwide coverage (50+ countries)",
        "Customs clearance assistance",
        "International documentation",
        "Multi-language tracking",
        "Duty and tax calculation",
        "Local delivery partners"
      ],
      pricing: "Starting at $29.99",
      deliveryTime: "3-7 business days",
      popular: false
    },
    {
      icon: Package,
      title: "Freight Services",
      description: "Heavy-duty shipping for large and bulk items",
      features: [
        "LTL (Less Than Truckload)",
        "FTL (Full Truckload)",
        "White glove delivery",
        "Warehouse storage",
        "Loading dock services",
        "Specialized equipment"
      ],
      pricing: "Custom pricing",
      deliveryTime: "2-5 business days",
      popular: false
    },
    {
      icon: Clock,
      title: "Same Day Delivery",
      description: "Ultra-fast local delivery within hours",
      features: [
        "Delivery within 4 hours",
        "Local courier network",
        "Real-time tracking",
        "Proof of delivery",
        "Emergency shipping",
        "Metropolitan coverage"
      ],
      pricing: "Starting at $24.99",
      deliveryTime: "2-4 hours",
      popular: false
    }
  ];

  const additionalServices = [
    {
      icon: Shield,
      title: "Package Insurance",
      description: "Comprehensive protection for valuable shipments",
      details: "Full coverage for loss, damage, or theft with easy claims process"
    },
    {
      icon: MapPin,
      title: "Tracking & Notifications",
      description: "Advanced tracking with real-time updates",
      details: "GPS tracking, SMS alerts, email notifications, and mobile app access"
    },
    {
      icon: Plane,
      title: "Air Freight",
      description: "Fast air transportation for urgent shipments",
      details: "Next-flight-out service for critical time-sensitive deliveries"
    },
    {
      icon: Ship,
      title: "Ocean Freight",
      description: "Cost-effective shipping for large volumes",
      details: "Container shipping with full port-to-port and door-to-door services"
    }
  ];

  const industries = [
    {
      name: "E-commerce",
      description: "Scalable shipping solutions for online retailers",
      benefits: ["API integration", "Bulk shipping", "Return logistics", "Automated tracking"]
    },
    {
      name: "Healthcare",
      description: "Specialized medical and pharmaceutical shipping",
      benefits: ["Temperature control", "Regulatory compliance", "Chain of custody", "Emergency delivery"]
    },
    {
      name: "Manufacturing",
      description: "Industrial shipping and supply chain management",
      benefits: ["Just-in-time delivery", "Bulk freight", "Parts distribution", "Warehouse solutions"]
    },
    {
      name: "Retail",
      description: "Store-to-store and customer delivery solutions",
      benefits: ["Multi-location shipping", "Seasonal scaling", "Last-mile delivery", "Inventory management"]
    }
  ];

  const pricingTiers = [
    {
      name: "Basic",
      price: "$15.99",
      period: "per shipment",
      description: "Perfect for occasional shipping needs",
      features: [
        "Standard delivery (3-5 days)",
        "Basic tracking",
        "Up to 10 lbs",
        "Standard packaging",
        "Email notifications"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Express",
      price: "$24.99",
      period: "per shipment",
      description: "Fast delivery for urgent shipments",
      features: [
        "Express delivery (1-2 days)",
        "Real-time tracking",
        "Up to 25 lbs",
        "Priority handling",
        "SMS + Email alerts",
        "Signature confirmation"
      ],
      cta: "Choose Express",
      popular: true
    },
    {
      name: "Premium",
      price: "$39.99",
      period: "per shipment",
      description: "Complete solution with all features",
      features: [
        "Same-day delivery available",
        "Advanced tracking + GPS",
        "Up to 50 lbs",
        "White glove service",
        "All notifications",
        "Insurance included",
        "Dedicated support"
      ],
      cta: "Go Premium",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-pattern bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Badge variant="secondary" className="px-3 py-1 bg-yellow-100 text-yellow-800 border-yellow-200">
                <Star className="h-3 w-3 mr-1" />
                Comprehensive Solutions
              </Badge>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Shipping <span className="text-red-600">Services</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              From express delivery to international freight, we offer comprehensive 
              logistics solutions tailored to your business needs. Fast, reliable, 
              and cost-effective shipping worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Core Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our range of shipping solutions designed to meet every business need
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mainServices.map((service, index) => (
              <Card key={index} className={`h-full border-0 logistics-shadow hover:shadow-lg transition-all duration-300 ${service.popular ? 'ring-2 ring-red-200' : ''}`}>
                {service.popular && (
                  <div className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-t-lg text-center">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
                      <service.icon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Starting at</p>
                      <p className="text-xl font-bold text-red-600">{service.pricing}</p>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold">{service.title}</CardTitle>
                  <p className="text-gray-600">{service.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{service.deliveryTime}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact">
                    <Button className="w-full dhl-gradient text-white hover:opacity-90">
                      Get Quote
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Additional Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive add-ons to enhance your shipping experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service, index) => (
              <Card key={index} className="h-full border-0 logistics-shadow hover:shadow-lg transition-shadow duration-300 text-center">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
                    <service.icon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                  <p className="text-xs text-gray-500">{service.details}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No hidden fees, no surprises. Choose the plan that fits your shipping needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`h-full border-0 logistics-shadow hover:shadow-lg transition-all duration-300 ${tier.popular ? 'ring-2 ring-red-200 scale-105' : ''}`}>
                {tier.popular && (
                  <div className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-t-lg text-center">
                    RECOMMENDED
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900">{tier.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-red-600">{tier.price}</span>
                    <span className="text-gray-500 ml-1">{tier.period}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{tier.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact">
                    <Button className={`w-full ${tier.popular ? 'dhl-gradient text-white' : 'border border-red-200 text-red-600 hover:bg-red-50'}`}>
                      {tier.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Industry Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Specialized shipping solutions tailored for different industries
            </p>
          </div>
          
          <Tabs defaultValue="E-commerce" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
              {industries.map((industry) => (
                <TabsTrigger key={industry.name} value={industry.name} className="text-sm">
                  {industry.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {industries.map((industry) => (
              <TabsContent key={industry.name} value={industry.name}>
                <Card className="border-0 logistics-shadow">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{industry.name}</h3>
                        <p className="text-lg text-gray-600 mb-6">{industry.description}</p>
                        <div className="grid grid-cols-2 gap-4">
                          {industry.benefits.map((benefit, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-gray-600">{benefit}</span>
                            </div>
                          ))}
                        </div>
                        <Link href="/contact">
                          <Button className="mt-6 dhl-gradient text-white">
                            Learn More
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                      <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                        <div className="text-center">
                          <Package className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Industry Illustration</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 dhl-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Ship with ShipPro?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Get started today with a free quote and experience the difference 
            professional logistics can make for your business.
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

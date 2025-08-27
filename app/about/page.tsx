import { Users, Truck, Globe, Award, Clock, Shield, Target, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  const values = [
    {
      icon: Clock,
      title: "Reliability",
      description: "We deliver on time, every time, with a 99.8% on-time delivery rate that our customers trust."
    },
    {
      icon: Shield,
      title: "Security",
      description: "Your packages are protected with comprehensive insurance and advanced security protocols."
    },
    {
      icon: Target,
      title: "Innovation",
      description: "Cutting-edge technology and tracking systems keep you informed every step of the way."
    },
    {
      icon: Heart,
      title: "Customer Care",
      description: "24/7 support with a dedicated team that goes above and beyond for every customer."
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      description: "15+ years in logistics and supply chain management, leading Logistica Falcon's vision for revolutionary shipping solutions."
    },
    {
      name: "Michael Chen",
      role: "CTO",
      description: "Technology expert specializing in real-time tracking systems and logistics optimization platforms."
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Operations",
      description: "Operations specialist ensuring smooth logistics processes and maintaining our high service standards."
    },
    {
      name: "David Kim",
      role: "Customer Success Manager",
      description: "Dedicated to providing exceptional customer experiences and building lasting business relationships."
    }
  ];

  const milestones = [
    { year: "2018", event: "Logistica Falcon Founded", description: "Started with a vision to revolutionize shipping" },
    { year: "2019", event: "First 1000 Customers", description: "Reached our first major milestone" },
    { year: "2020", event: "International Expansion", description: "Extended services to 20+ countries" },
    { year: "2021", event: "500K Packages", description: "Delivered half a million packages" },
    { year: "2022", event: "AI Integration", description: "Launched AI-powered route optimization" },
    { year: "2023", event: "10K+ Customers", description: "Reached 10,000+ satisfied customers" },
    { year: "2024", event: "Green Initiative", description: "100% carbon-neutral shipping program" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-pattern bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Badge variant="secondary" className="px-3 py-1 bg-yellow-100 text-yellow-800 border-yellow-200">
                <Award className="h-3 w-3 mr-1" />
                Industry Leader
              </Badge>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              About <span className="text-red-600">Logistica Falcon</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Founded in 2018, Logistica Falcon has revolutionized the shipping and logistics industry with 
              innovative technology, exceptional customer service, and a commitment to reliability. 
              We&apos;re more than just a shipping company – we&apos;re your trusted logistics partner.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <Truck className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">500K+</div>
              <div className="text-sm text-gray-600">Packages Delivered</div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <Globe className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">50+</div>
              <div className="text-sm text-gray-600">Countries Served</div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">10K+</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <Award className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">99.8%</div>
              <div className="text-sm text-gray-600">On-Time Delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To revolutionize the shipping and logistics industry by providing innovative, 
                reliable, and customer-centric solutions that connect businesses and people 
                around the world.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe that exceptional logistics should be accessible to everyone, from 
                small businesses shipping their first package to large enterprises managing 
                complex supply chains. Our technology-driven approach ensures transparency, 
                efficiency, and peace of mind for every shipment.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl logistics-shadow p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Logistica Falcon?</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-red-600 rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Advanced Technology</h4>
                    <p className="text-gray-600 text-sm">Real-time tracking, AI-powered optimization, and seamless integration</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-red-600 rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Global Network</h4>
                    <p className="text-gray-600 text-sm">Extensive coverage across 50+ countries with local expertise</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-red-600 rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Competitive Pricing</h4>
                    <p className="text-gray-600 text-sm">Fair, transparent pricing with no hidden fees or surprises</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-red-600 rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">24/7 Support</h4>
                    <p className="text-gray-600 text-sm">Round-the-clock customer support from shipping experts</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and shape our commitment to excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="h-full border-0 logistics-shadow text-center">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <value.icon className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experienced professionals dedicated to revolutionizing the shipping industry
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="h-full border-0 logistics-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-red-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key milestones in Logistica Falcon&apos;s growth and evolution
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-red-200 hidden lg:block" />
            
            <div className="space-y-8 lg:space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`w-full lg:w-5/12 ${index % 2 === 0 ? 'lg:pr-8' : 'lg:pl-8'}`}>
                    <Card className="border-0 logistics-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-2">
                          <span className="text-2xl font-bold text-red-600 mr-3">{milestone.year}</span>
                          <Badge variant="outline" className="border-red-200 text-red-600">
                            {milestone.event}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="hidden lg:flex w-2/12 justify-center">
                    <div className="w-4 h-4 bg-red-600 rounded-full border-4 border-white logistics-shadow" />
                  </div>
                  
                  <div className="hidden lg:block w-5/12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 dhl-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Experience the Logistica Falcon Difference?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses who trust Logistica Falcon for their shipping and logistics needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="inline-block">
              <button className="bg-white text-red-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Get Started Today
              </button>
            </a>
            <a href="/services" className="inline-block">
              <button className="border-2 border-white text-white hover:bg-white hover:text-red-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                View Our Services
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

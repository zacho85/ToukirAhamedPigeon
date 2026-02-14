import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  DollarSign, 
  Users, 
  BarChart3, 
  Shield,
  Smartphone,
  Clock,
  ArrowRight,
  Check,
  TrendingUp,
  Award,
  Headphones
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Agent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-green-900">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-teal-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-emerald-100 text-emerald-800 px-4 py-2">
                🤝 Agent Network
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Become a
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {" "}KongossaPay Agent
                </span>
              </h1>
              <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
                Join our growing network of agents and earn commissions while providing 
                essential financial services to your community. No experience required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 text-lg"
                  asChild
                >
                  <Link to={createPageUrl("Dashboard")}>
                    Apply to Be an Agent
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg"
                  asChild
                >
                  <Link to={createPageUrl("Support")}>
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="KongossaPay Agent"
                className="w-full rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why become a KongossaPay agent?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Unlock earning potential while serving your community with essential financial services
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <DollarSign className="w-8 h-8 text-emerald-600" />,
                title: "Competitive Commissions",
                description: "Earn up to 2% commission on every transaction you process. The more you help, the more you earn."
              },
              {
                icon: <Clock className="w-8 h-8 text-blue-600" />,
                title: "Flexible Schedule",
                description: "Work at your own pace and set your own hours. Perfect for supplemental income."
              },
              {
                icon: <Users className="w-8 h-8 text-purple-600" />,
                title: "Serve Your Community",
                description: "Provide essential financial services to people in your neighborhood and beyond."
              },
              {
                icon: <Smartphone className="w-8 h-8 text-amber-600" />,
                title: "Mobile-First Tools",
                description: "Everything you need is in the KongossaPay agent app. No complex hardware required."
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-red-600" />,
                title: "Real-time Analytics",
                description: "Track your earnings, transaction volume, and performance with detailed reporting."
              },
              {
                icon: <Headphones className="w-8 h-8 text-indigo-600" />,
                title: "24/7 Support",
                description: "Get help whenever you need it with our dedicated agent support team."
              }
            ].map((benefit, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-0 bg-white">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Services you'll provide as an agent
            </h2>
            <p className="text-xl text-slate-600">
              Help your community access modern financial services
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                title: "Cash-In Services",
                description: "Help customers add money to their digital wallets",
                features: [
                  "Accept cash deposits",
                  "Process bank transfers",
                  "Handle mobile money top-ups",
                  "Instant wallet credits"
                ]
              },
              {
                title: "Cash-Out Services", 
                description: "Allow customers to withdraw money from their accounts",
                features: [
                  "Dispense cash withdrawals",
                  "Process to bank accounts",
                  "Handle bill payments",
                  "Manage transaction limits"
                ]
              },
              {
                title: "Customer Support",
                description: "Provide first-level support and account assistance",
                features: [
                  "Help with account setup",
                  "Resolve basic issues",
                  "Explain services",
                  "Process KYC documents"
                ]
              },
              {
                title: "Business Services",
                description: "Support local businesses with merchant services",
                features: [
                  "Merchant account setup",
                  "Payment processing help",
                  "POS system training",
                  "Business analytics overview"
                ]
              }
            ].map((service, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-shadow border-0 bg-slate-50">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{service.title}</h3>
                  <p className="text-slate-600 mb-6">{service.description}</p>
                  <ul className="space-y-3">
                    {service.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-emerald-500" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-24 bg-emerald-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Agent requirements
            </h2>
            <p className="text-xl text-slate-600">
              Simple requirements to join our agent network
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 bg-white border-0">
              <CardContent className="p-0">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <Award className="w-6 h-6 text-emerald-600" />
                  Basic Requirements
                </h3>
                <ul className="space-y-3">
                  {[
                    "18+ years old",
                    "Valid government ID",
                    "Smartphone with internet",
                    "Basic literacy skills",
                    "Clean background check"
                  ].map((req, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-emerald-500" />
                      <span className="text-slate-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="p-6 bg-white border-0">
              <CardContent className="p-0">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  Preferred Qualifications
                </h3>
                <ul className="space-y-3">
                  {[
                    "Previous customer service experience",
                    "Basic understanding of mobile money",
                    "Active in local community",
                    "Reliable internet connection",
                    "Business or retail experience"
                  ].map((pref, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-blue-500" />
                      <span className="text-slate-700">{pref}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How to become an agent
            </h2>
            <p className="text-xl text-slate-600">
              Simple 4-step process to join our network
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Apply Online",
                description: "Fill out our simple online application form with your basic information."
              },
              {
                step: "02", 
                title: "Verification",
                description: "We'll verify your documents and conduct a background check."
              },
              {
                step: "03",
                title: "Training",
                description: "Complete our comprehensive training program on the KongossaPay platform."
              },
              {
                step: "04",
                title: "Start Earning",
                description: "Begin serving customers and earning commissions immediately."
              }
            ].map((process, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">{process.step}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{process.title}</h3>
                <p className="text-slate-600">{process.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-900 to-teal-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to become a KongossaPay agent?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of agents earning money while serving their communities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 text-lg"
              asChild
            >
              <Link to={createPageUrl("Dashboard")}>
                Apply Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg"
              asChild
            >
              <Link to={createPageUrl("Support")}>
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
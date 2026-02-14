import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Shield, 
  Users, 
  TrendingUp, 
  Zap, 
  Globe,
  ArrowRight,
  Check,
  Star,
  Play
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-blue-100 text-blue-800 px-4 py-2">
                🚀 Next-Generation Digital Wallet
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                The Future of
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {" "}Digital Payments
                </span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Send, receive, and manage money with ease. Join millions who trust KongossaPay 
                for secure, instant, and affordable financial transactions worldwide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
                  asChild
                >
                  <Link to={createPageUrl("Dashboard")}>
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/20 text-black hover:text-white hover:bg-white/10 px-8 py-4 text-lg"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-8 text-blue-200">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Bank-grade security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>24/7 support</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="KongossaPay Mobile App"
                  className="w-full max-w-md mx-auto rounded-3xl shadow-2xl"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need for modern payments
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From personal transfers to business solutions, KongossaPay has you covered
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Smartphone className="w-8 h-8 text-blue-600" />,
                title: "Mobile First",
                description: "Send money instantly with just a phone number. No complex account details needed."
              },
              {
                icon: <Shield className="w-8 h-8 text-green-600" />,
                title: "Bank-Grade Security",
                description: "Your money and data are protected with enterprise-level encryption and fraud detection."
              },
              {
                icon: <Users className="w-8 h-8 text-purple-600" />,
                title: "Digital Tontine",
                description: "Join savings circles with friends and family. Automated contributions and transparent payouts."
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-amber-600" />,
                title: "Investment Tools",
                description: "Grow your wealth with our curated investment options and automated savings plans."
              },
              {
                icon: <Zap className="w-8 h-8 text-red-600" />,
                title: "Instant Transfers",
                description: "Money moves in seconds, not days. Send to anyone, anywhere, anytime."
              },
              {
                icon: <Globe className="w-8 h-8 text-indigo-600" />,
                title: "Global Reach",
                description: "Send money across borders with competitive exchange rates and low fees."
              }
            ].map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-0 bg-white">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Solutions for everyone
            </h2>
            <p className="text-xl text-slate-600">
              Whether you're an individual, business, or agent, we have the right tools for you
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                title: "Personal",
                description: "Perfect for individuals and families",
                features: [
                  "Send & receive money",
                  "Digital wallet",
                  "QR payments",
                  "Savings circles",
                  "Bill payments",
                  "Investment options"
                ],
                cta: "Start Personal Account",
                ctaLink: createPageUrl("Personal"),
                gradient: "from-blue-600 to-blue-700"
              },
              {
                title: "Business",
                description: "Complete solution for merchants",
                features: [
                  "Accept payments",
                  "API integration",
                  "Analytics dashboard",
                  "Multi-currency support",
                  "Invoice management",
                  "Team accounts"
                ],
                cta: "Explore Business Tools",
                ctaLink: createPageUrl("Business"),
                gradient: "from-purple-600 to-purple-700"
              },
              {
                title: "Agent Network",
                description: "Become a KongossaPay agent",
                features: [
                  "Cash-in/cash-out",
                  "Commission earnings",
                  "Agent dashboard",
                  "Customer support",
                  "Marketing materials",
                  "Training programs"
                ],
                cta: "Become an Agent",
                ctaLink: createPageUrl("Agent"),
                gradient: "from-emerald-600 to-emerald-700"
              }
            ].map((solution, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-shadow border-0 bg-gradient-to-br from-slate-50 to-white">
                <CardContent className="p-0">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{solution.title}</h3>
                    <p className="text-slate-600">{solution.description}</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {solution.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full bg-gradient-to-r ${solution.gradient} hover:opacity-90 text-white`}
                    asChild
                  >
                    <Link to={solution.ctaLink}>
                      {solution.cta}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "2M+", label: "Active Users" },
              { number: "$500M+", label: "Processed Monthly" },
              { number: "150+", label: "Countries Served" },
              { number: "99.9%", label: "Uptime Guarantee" }
            ].map((stat, index) => (
              <div key={index} className="text-white">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Trusted by millions worldwide
            </h2>
            <div className="flex justify-center items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-slate-600">4.9/5 from 10,000+ reviews</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "KongossaPay has revolutionized how I manage money for my business. The API integration was seamless.",
                author: "Sarah Johnson",
                role: "Small Business Owner",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
              },
              {
                quote: "The tontine feature helped our family save together for our vacation. It's like having a digital piggy bank!",
                author: "Michael Chen",
                role: "Family Organizer",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
              },
              {
                quote: "As an agent, KongossaPay provides all the tools I need to serve my community and earn good commissions.",
                author: "Amina Okafor",
                role: "KongossaPay Agent",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 bg-slate-50 border-0">
                <CardContent className="p-0">
                  <p className="text-slate-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">{testimonial.author}</div>
                      <div className="text-slate-600 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-blue-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your financial life?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join millions who have already discovered the power of KongossaPay
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
              asChild
            >
              <Link to={createPageUrl("Dashboard")}>
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/20 text-black hover:text-white hover:bg-white/10 px-8 py-4 text-lg"
              asChild
            >
              <Link to={createPageUrl("Support")}>
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
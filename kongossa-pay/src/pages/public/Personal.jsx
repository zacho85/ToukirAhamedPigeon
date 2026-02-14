import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Shield, 
  Users, 
  Zap, 
  CreditCard,
  QrCode,
  TrendingUp,
  ArrowRight,
  Check,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Personal() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-blue-100 text-blue-800 px-4 py-2">
                💳 Personal Banking
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Your Personal
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {" "}Digital Wallet
                </span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Send money, pay bills, save with friends, and invest for your future. 
                Everything you need for modern personal finance in one secure app.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
                  asChild
                >
                  <Link to={createPageUrl("Dashboard")}>
                    Open Personal Account
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Personal Banking App"
                className="w-full max-w-md mx-auto rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need for personal finance
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Manage, grow, and protect your money with powerful tools designed for individuals
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8 text-blue-600" />,
                title: "Instant Money Transfers",
                description: "Send money to friends and family instantly using just their phone number or email."
              },
              {
                icon: <QrCode className="w-8 h-8 text-green-600" />,
                title: "QR Code Payments",
                description: "Pay at stores, restaurants, and online with secure QR code scanning."
              },
              {
                icon: <Users className="w-8 h-8 text-purple-600" />,
                title: "Digital Tontine",
                description: "Join savings circles with friends and family. Automated contributions and fair payouts."
              },
              {
                icon: <CreditCard className="w-8 h-8 text-amber-600" />,
                title: "Multiple Payment Methods",
                description: "Link credit cards, debit cards, bank accounts, and mobile money for easy funding."
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-red-600" />,
                title: "Investment Options",
                description: "Grow your wealth with curated investment products and automated savings plans."
              },
              {
                icon: <Shield className="w-8 h-8 text-indigo-600" />,
                title: "Advanced Security",
                description: "Your money is protected with biometric authentication and fraud monitoring."
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

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-slate-600">
              No hidden fees. Pay only for what you use.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Basic",
                price: "Free",
                description: "Perfect for getting started",
                features: [
                  "Send & receive money",
                  "QR code payments",
                  "Basic budgeting tools",
                  "Mobile app access",
                  "Email support"
                ],
                cta: "Get Started Free",
                popular: false
              },
              {
                name: "Premium",
                price: "$4.99/mo",
                description: "For active users",
                features: [
                  "Everything in Basic",
                  "Digital tontine access",
                  "Investment options",
                  "Advanced analytics",
                  "Priority support",
                  "No transaction limits"
                ],
                cta: "Start Premium Trial",
                popular: true
              },
              {
                name: "Family",
                price: "$9.99/mo",
                description: "For families up to 6 members",
                features: [
                  "Everything in Premium",
                  "Family expense tracking",
                  "Shared savings goals",
                  "Parental controls",
                  "Family tontines",
                  "Dedicated account manager"
                ],
                cta: "Get Family Plan",
                popular: false
              }
            ].map((plan, index) => (
              <Card key={index} className={`p-8 hover:shadow-xl transition-shadow border-2 ${plan.popular ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                <CardContent className="p-0">
                  {plan.popular && (
                    <Badge className="mb-4 bg-blue-100 text-blue-800">Most Popular</Badge>
                  )}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-slate-900 mb-2">{plan.price}</div>
                  <p className="text-slate-600 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-slate-900 text-white'}`}
                    asChild
                  >
                    <Link to={createPageUrl("Dashboard")}>
                      {plan.cta}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join over 2 million users who trust KongossaPay for their personal banking needs
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
            asChild
          >
            <Link to={createPageUrl("Dashboard")}>
              Open Your Account Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
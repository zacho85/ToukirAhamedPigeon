import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  CreditCard, 
  BarChart3, 
  Zap, 
  Shield,
  Globe,
  Users,
  ArrowRight,
  Check,
  DollarSign,
  Smartphone,
  Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Business() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-purple-100 text-purple-800 px-4 py-2">
                🏢 Business Solutions
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Scale Your Business
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {" "}With KongossaPay
                </span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Accept payments, manage finances, and grow your business with our comprehensive 
                suite of merchant tools and APIs. Trusted by thousands of businesses worldwide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg"
                  asChild
                >
                  <Link to={createPageUrl("Dashboard")}>
                    Start Accepting Payments
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
                    Schedule Demo
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Business Dashboard"
                className="w-full rounded-3xl shadow-2xl"
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
              Complete business payment solution
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to accept payments, manage finances, and grow your business
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <CreditCard className="w-8 h-8 text-purple-600" />,
                title: "Accept All Payment Types",
                description: "Credit cards, debit cards, mobile money, bank transfers, and digital wallets."
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
                title: "Real-time Analytics",
                description: "Track sales, monitor performance, and make data-driven decisions with detailed reporting."
              },
              {
                icon: <Zap className="w-8 h-8 text-amber-600" />,
                title: "Fast Settlement",
                description: "Get paid quickly with same-day settlement options for your business transactions."
              },
              {
                icon: <Globe className="w-8 h-8 text-green-600" />,
                title: "Global Payments",
                description: "Accept payments from customers worldwide with multi-currency support."
              },
              {
                icon: <Users className="w-8 h-8 text-red-600" />,
                title: "Team Management",
                description: "Add team members with role-based access and permissions for your business account."
              },
              {
                icon: <Shield className="w-8 h-8 text-indigo-600" />,
                title: "Enterprise Security",
                description: "Advanced fraud protection and compliance tools to keep your business safe."
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

      {/* API Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-blue-100 text-blue-800 px-4 py-2">
                🔧 Developer Tools
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Powerful APIs for seamless integration
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Integrate KongossaPay into your existing systems with our RESTful APIs. 
                Complete documentation and SDKs available for popular programming languages.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "RESTful API with comprehensive documentation",
                  "SDKs for Python, Node.js, PHP, and more",
                  "Webhook support for real-time notifications",
                  "Sandbox environment for testing",
                  "99.9% uptime guarantee"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                asChild
              >
                <Link to={createPageUrl("ApiAccess")}>
                  Explore API Documentation
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
            <div className="bg-slate-900 rounded-xl p-6 text-green-400 font-mono text-sm overflow-auto">
              <pre>{`// Initialize KongossaPay
const kongossa = require('kongossapay')({
  apiKey: 'your_api_key',
  environment: 'sandbox'
});

// Create payment intent
const payment = await kongossa.payments.create({
  amount: 10000, // $100.00
  currency: 'USD',
  customer_id: 'cust_123',
  description: 'Payment for services'
});

// Process payment
const result = await kongossa.payments.confirm(
  payment.id,
  { payment_method: 'card_456' }
);

console.log('Payment status:', result.status);`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Transparent business pricing
            </h2>
            <p className="text-xl text-slate-600">
              No setup fees. No monthly fees. Pay only when you make money.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Starter",
                price: "2.9% + 30¢",
                description: "Perfect for new businesses",
                features: [
                  "Accept all payment types",
                  "Basic analytics dashboard",
                  "Email support",
                  "Standard settlement",
                  "Basic fraud protection"
                ],
                cta: "Get Started",
                popular: false
              },
              {
                name: "Growth",
                price: "2.7% + 30¢",
                description: "For growing businesses",
                features: [
                  "Everything in Starter",
                  "Advanced analytics",
                  "API access",
                  "Priority support",
                  "Advanced fraud tools",
                  "Same-day settlement"
                ],
                cta: "Choose Growth",
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large businesses",
                features: [
                  "Everything in Growth",
                  "Custom pricing",
                  "Dedicated account manager",
                  "Custom integrations",
                  "SLA guarantees",
                  "White-label options"
                ],
                cta: "Contact Sales",
                popular: false
              }
            ].map((plan, index) => (
              <Card key={index} className={`p-8 hover:shadow-xl transition-shadow border-2 ${plan.popular ? 'border-purple-500 bg-purple-50' : 'border-slate-200'}`}>
                <CardContent className="p-0">
                  {plan.popular && (
                    <Badge className="mb-4 bg-purple-100 text-purple-800">Most Popular</Badge>
                  )}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{plan.price}</div>
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
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'bg-slate-900 text-white'}`}
                    asChild
                  >
                    <Link to={plan.name === 'Enterprise' ? createPageUrl("Support") : createPageUrl("Dashboard")}>
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
      <section className="py-24 bg-gradient-to-br from-purple-900 to-blue-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to grow your business?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of businesses that trust KongossaPay for their payment needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg"
              asChild
            >
              <Link to={createPageUrl("Dashboard")}>
                Start Accepting Payments
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
                Talk to Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
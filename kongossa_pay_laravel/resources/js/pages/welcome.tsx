import Header from "@/components/TheHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WebsiteLayout from "@/layouts/WebsiteLayout";
import { Link } from "@inertiajs/react";
import {
  Banknote,
  BarChart3,
  Bell,
  CreditCard,
  FileText,
  Gift,
  Globe,
  HeadphonesIcon,
  Key,
  QrCode,
  ReceiptText,
  RefreshCw,
  Send,
  Settings,
  Shield,
  Smartphone,
  TrendingUp,
  Users,
  Wallet
} from "lucide-react";

export default function Home() {
  const coreFeatures = [
    {
      icon: <Send className="h-8 w-8" />,
      title: "Send Money",
      description: "Transfer funds instantly to anyone, anywhere in the world with low fees",
      color: "bg-blue-500",
    },
    {
      icon: <QrCode className="h-8 w-8" />,
      title: "QR Payments",
      description: "Accept payments instantly with QR codes - perfect for merchants and businesses",
      color: "bg-green-500",
    },
    {
      icon: <Wallet className="h-8 w-8" />,
      title: "Digital Wallet",
      description: "Store, manage and spend your money with our secure digital wallet solution",
      color: "bg-purple-500",
    },
    {
      icon: <ReceiptText className="h-8 w-8" />,
      title: "Transaction History",
      description: "Complete transaction history with detailed analytics and reporting",
      color: "bg-orange-500",
    },
    {
      icon: <Gift className="h-8 w-8" />,
      title: "Rewards Program",
      description: "Earn rewards and bonuses through our multi-level referral system",
      color: "bg-pink-500",
    },
    {
      icon: <RefreshCw className="h-8 w-8" />,
      title: "Currency Exchange",
      description: "Real-time currency exchange with competitive rates",
      color: "bg-cyan-500",
    },
  ];

  const paymentMethods = [
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Credit Cards",
      description: "Visa, Mastercard, American Express",
    },
    {
      icon: <Banknote className="h-6 w-6" />,
      title: "Bank Transfer",
      description: "Direct bank account transfers",
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile Payments",
      description: "Google Pay, Apple Pay, Samsung Pay",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "PayPal",
      description: "Secure PayPal integration",
    },
  ];

  const merchantFeatures = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics Dashboard",
      description: "Real-time business insights",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Customer Management",
      description: "Manage customer relationships",
    },
    {
      icon: <Key className="h-6 w-6" />,
      title: "API Access",
      description: "Developer-friendly APIs",
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Gateway Settings",
      description: "Configure payment gateways",
    },
  ];

  const adminFeatures = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Analytics Dashboard",
      description: "Comprehensive system analytics",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "User Management",
      description: "Complete user oversight",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Compliance & Reporting",
      description: "Regulatory compliance tools",
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Notifications",
      description: "System-wide notifications",
    },
  ];

  return (
    <WebsiteLayout>

      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        <Header />

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            <Badge variant="outline" className="px-4 py-2">
              Complete KongossaPay Solution with All Add-ons Bundle
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              The Future of{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Digital Payments
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Complete KongossaPay solution with digital wallet, merchant payments, remittance,
              multi-level referral system, and comprehensive admin features. Accept payments
              with QR codes and grow your business globally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="px-8 py-6 text-lg">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                  Watch Demo
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Bank-level Security
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Available Worldwide
              </div>
              <div className="flex items-center gap-2">
                <HeadphonesIcon className="h-4 w-4" />
                24/7 Support
              </div>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Core Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for modern digital payments and financial management
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-xl ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Payment Methods */}
        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Multiple Payment Methods</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Support for all major payment methods and digital wallets
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paymentMethods.map((method, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        {method.icon}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{method.title}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Merchant Features */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">For Merchants</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced tools for businesses to accept payments and manage transactions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {merchantFeatures.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Admin Panel */}
        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Admin Panel</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive administrative tools for system management
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {adminFeatures.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                        {feature.icon}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-12 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Payments?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already using KongossaPay for their payment needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="px-8 py-6 text-lg">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-background border-t py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-xl">KongossaPay</span>
                </div>
                <p className="text-muted-foreground">
                  Complete digital payment solution for modern businesses
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Features</h3>
                <div className="space-y-2 text-sm">
                  <Link href="/send" className="block text-muted-foreground hover:text-foreground">Send Money</Link>
                  <Link href="/qr-pay" className="block text-muted-foreground hover:text-foreground">QR Payments</Link>
                  <Link href="/wallet" className="block text-muted-foreground hover:text-foreground">Digital Wallet</Link>
                  <Link href="/remittance" className="block text-muted-foreground hover:text-foreground">Remittance</Link>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">For Business</h3>
                <div className="space-y-2 text-sm">
                  <Link href="/merchant" className="block text-muted-foreground hover:text-foreground">Merchant Tools</Link>
                  <Link href="/merchant/api" className="block text-muted-foreground hover:text-foreground">API Access</Link>
                  <Link href="/merchant/analytics" className="block text-muted-foreground hover:text-foreground">Analytics</Link>
                  <Link href="/support" className="block text-muted-foreground hover:text-foreground">Support</Link>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Company</h3>
                <div className="space-y-2 text-sm">
                  <Link href="/about" className="block text-muted-foreground hover:text-foreground">About Us</Link>
                  <Link href="/privacy" className="block text-muted-foreground hover:text-foreground">Privacy Policy</Link>
                  <Link href="/terms" className="block text-muted-foreground hover:text-foreground">Terms of Service</Link>
                  <Link href="/contact" className="block text-muted-foreground hover:text-foreground">Contact</Link>
                </div>
              </div>
            </div>
            <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; 2025 KongossaPay. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </WebsiteLayout>
  );
}

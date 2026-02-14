// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import {
//   Smartphone,
//   Shield,
//   Users,
//   TrendingUp,
//   Zap,
//   Globe,
//   ArrowRight,
//   Check,
//   Star,
//   Play
// } from "lucide-react";
// import { Link } from "react-router-dom";
// import PublicLayout from "@/layouts/PublicLayout";

// export default function Home() {
//   return (
//     <PublicLayout>
//         <div className="min-h-screen bg-white">
//         {/* Hero Section */}
//         <section className="relative overflow-hidden bg-linear-to-br from-slate-900 via-blue-900 to-slate-900">
//             <div className="absolute inset-0 bg-linear-to-br from-blue-600/10 to-purple-600/10"></div>
//             <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
//             <div className="grid lg:grid-cols-2 gap-12 items-center">
//                 <div className="text-center lg:text-left">
//                 <Badge className="mb-6 bg-blue-100 text-blue-800 hover:text-white px-4 py-2">
//                     🚀 Next-Generation Digital Wallet
//                 </Badge>
//                 <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
//                     The Future of
//                     <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
//                     {" "}Digital Payments
//                     </span>
//                 </h1>
//                 <p className="text-xl text-blue-100 mb-8 leading-relaxed">
//                     Send, receive, and manage money with ease. Join millions who trust KongossaPay
//                     for secure, instant, and affordable financial transactions worldwide.
//                 </p>
//                 <div className="flex flex-col sm:flex-row gap-4">
//                     <Button
//                     size="lg"
//                     className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
//                     asChild
//                     >
//                     <Link to="/dashboard">
//                         Get Started Free
//                         <ArrowRight className="ml-2 w-5 h-5" />
//                     </Link>
//                     </Button>
//                     <Button
//                     size="lg"
//                     variant="outline"
//                     className="border-white/20 text-black hover:text-white hover:bg-white/10 px-8 py-4 text-lg"
//                     >
//                     <Play className="mr-2 w-5 h-5" />
//                     Watch Demo
//                     </Button>
//                 </div>
//                 <div className="flex items-center gap-6 mt-8 text-blue-200">
//                     <div className="flex items-center gap-2">
//                     <Check className="w-5 h-5 text-green-400" />
//                     <span>No setup fees</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                     <Check className="w-5 h-5 text-green-400" />
//                     <span>Bank-grade security</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                     <Check className="w-5 h-5 text-green-400" />
//                     <span>24/7 support</span>
//                     </div>
//                 </div>
//                 </div>
//                 <div className="relative">
//                 <div className="relative z-10">
//                     <img
//                     src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
//                     alt="KongossaPay Mobile App"
//                     className="w-full max-w-md mx-auto rounded-3xl shadow-2xl"
//                     />
//                 </div>
//                 <div className="absolute inset-0 bg-linear-to-tr from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
//                 </div>
//             </div>
//             </div>
//         </section>

//         {/* Features Section */}
//         <section className="py-24 bg-slate-50">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="text-center mb-16">
//                 <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
//                 Everything you need for modern payments
//                 </h2>
//                 <p className="text-xl text-slate-600 max-w-2xl mx-auto">
//                 From personal transfers to business solutions, KongossaPay has you covered
//                 </p>
//             </div>
//             <div className="grid md:grid-cols-3 gap-8">
//                 {[
//                 {
//                     icon: <Smartphone className="w-8 h-8 text-blue-600" />,
//                     title: "Mobile First",
//                     description: "Send money instantly with just a phone number. No complex account details needed."
//                 },
//                 {
//                     icon: <Shield className="w-8 h-8 text-green-600" />,
//                     title: "Bank-Grade Security",
//                     description: "Your money and data are protected with enterprise-level encryption and fraud detection."
//                 },
//                 {
//                     icon: <Users className="w-8 h-8 text-purple-600" />,
//                     title: "Digital Tontine",
//                     description: "Join savings circles with friends and family. Automated contributions and transparent payouts."
//                 },
//                 {
//                     icon: <TrendingUp className="w-8 h-8 text-amber-600" />,
//                     title: "Investment Tools",
//                     description: "Grow your wealth with our curated investment options and automated savings plans."
//                 },
//                 {
//                     icon: <Zap className="w-8 h-8 text-red-600" />,
//                     title: "Instant Transfers",
//                     description: "Money moves in seconds, not days. Send to anyone, anywhere, anytime."
//                 },
//                 {
//                     icon: <Globe className="w-8 h-8 text-indigo-600" />,
//                     title: "Global Reach",
//                     description: "Send money across borders with competitive exchange rates and low fees."
//                 }
//                 ].map((feature, index) => (
//                 <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-0 bg-white">
//                     <CardContent className="p-0">
//                     <div className="w-16 h-16 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4">
//                         {feature.icon}
//                     </div>
//                     <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
//                     <p className="text-slate-600">{feature.description}</p>
//                     </CardContent>
//                 </Card>
//                 ))}
//             </div>
//             </div>
//         </section>

//         {/* Solutions Section */}
//         <section className="py-24 bg-white">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="text-center mb-16">
//                 <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
//                 Solutions for everyone
//                 </h2>
//                 <p className="text-xl text-slate-600">
//                 Whether you're an individual, business, or agent, we have the right tools for you
//                 </p>
//             </div>
//             <div className="grid lg:grid-cols-3 gap-8">
//                 {[
//                 {
//                     title: "Personal",
//                     description: "Perfect for individuals and families",
//                     features: [
//                     "Send & receive money",
//                     "Digital wallet",
//                     "QR payments",
//                     "Savings circles",
//                     "Bill payments",
//                     "Investment options"
//                     ],
//                     cta: "Start Personal Account",
//                     ctaLink: "/personal",
//                     gradient: "from-blue-600 to-blue-700"
//                 },
//                 {
//                     title: "Business",
//                     description: "Complete solution for merchants",
//                     features: [
//                     "Accept payments",
//                     "API integration",
//                     "Analytics dashboard",
//                     "Multi-currency support",
//                     "Invoice management",
//                     "Team accounts"
//                     ],
//                     cta: "Explore Business Tools",
//                     ctaLink: "/business",
//                     gradient: "from-purple-600 to-purple-700"
//                 },
//                 {
//                     title: "Agent Network",
//                     description: "Become a KongossaPay agent",
//                     features: [
//                     "Cash-in/cash-out",
//                     "Commission earnings",
//                     "Agent dashboard",
//                     "Customer support",
//                     "Marketing materials",
//                     "Training programs"
//                     ],
//                     cta: "Become an Agent",
//                     ctaLink: "/agent",
//                     gradient: "from-emerald-600 to-emerald-700"
//                 }
//                 ].map((solution, index) => (
//                 <Card key={index} className="p-8 hover:shadow-xl transition-shadow border-0 bg-linear-to-br from-slate-50 to-white">
//                     <CardContent className="p-0">
//                     <div className="mb-6">
//                         <h3 className="text-2xl font-bold text-slate-900 mb-2">{solution.title}</h3>
//                         <p className="text-slate-600">{solution.description}</p>
//                     </div>
//                     <ul className="space-y-3 mb-8">
//                         {solution.features.map((feature, fIndex) => (
//                         <li key={fIndex} className="flex items-center gap-3">
//                             <Check className="w-5 h-5 text-green-500" />
//                             <span className="text-slate-700">{feature}</span>
//                         </li>
//                         ))}
//                     </ul>
//                     <Button
//                         className={`w-full bg-linear-to-r ${solution.gradient} hover:opacity-90 text-white`}
//                         asChild
//                     >
//                         <Link to={solution.ctaLink}>
//                         {solution.cta}
//                         <ArrowRight className="ml-2 w-4 h-4" />
//                         </Link>
//                     </Button>
//                     </CardContent>
//                 </Card>
//                 ))}
//             </div>
//             </div>
//         </section>

//         {/* Stats Section */}
//         <section className="py-24 bg-linear-to-r from-blue-900 to-purple-900">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="grid md:grid-cols-4 gap-8 text-center">
//                 {[
//                 { number: "2M+", label: "Active Users" },
//                 { number: "$500M+", label: "Processed Monthly" },
//                 { number: "150+", label: "Countries Served" },
//                 { number: "99.9%", label: "Uptime Guarantee" }
//                 ].map((stat, index) => (
//                 <div key={index} className="text-white">
//                     <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
//                     <div className="text-blue-200">{stat.label}</div>
//                 </div>
//                 ))}
//             </div>
//             </div>
//         </section>

//         {/* Testimonials Section */}
//         <section className="py-24 bg-white">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="text-center mb-16">
//                 <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
//                 Trusted by millions worldwide
//                 </h2>
//                 <div className="flex justify-center items-center gap-1 mb-4">
//                 {[...Array(5)].map((_, i) => (
//                     <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
//                 ))}
//                 <span className="ml-2 text-slate-600">4.9/5 from 10,000+ reviews</span>
//                 </div>
//             </div>
//             <div className="grid md:grid-cols-3 gap-8">
//                 {[
//                 {
//                     quote: "KongossaPay has revolutionized how I manage money for my business. The API integration was seamless.",
//                     author: "Sarah Johnson",
//                     role: "Small Business Owner",
//                     avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
//                 },
//                 {
//                     quote: "The tontine feature helped our family save together for our vacation. It's like having a digital piggy bank!",
//                     author: "Michael Chen",
//                     role: "Family Organizer",
//                     avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
//                 },
//                 {
//                     quote: "As an agent, KongossaPay provides all the tools I need to serve my community and earn good commissions.",
//                     author: "Amina Okafor",
//                     role: "KongossaPay Agent",
//                     avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
//                 }
//                 ].map((testimonial, index) => (
//                 <Card key={index} className="p-6 bg-slate-50 border-0">
//                     <CardContent className="p-0">
//                     <p className="text-slate-700 mb-6 italic">"{testimonial.quote}"</p>
//                     <div className="flex items-center gap-4">
//                         <img
//                         src={testimonial.avatar}
//                         alt={testimonial.author}
//                         className="w-12 h-12 rounded-full"
//                         />
//                         <div>
//                         <div className="font-semibold text-slate-900">{testimonial.author}</div>
//                         <div className="text-slate-600 text-sm">{testimonial.role}</div>
//                         </div>
//                     </div>
//                     </CardContent>
//                 </Card>
//                 ))}
//             </div>
//             </div>
//         </section>

//         {/* CTA Section */}
//         <section className="py-24 bg-linear-to-br from-slate-900 to-blue-900">
//             <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
//             <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
//                 Ready to transform your financial life?
//             </h2>
//             <p className="text-xl text-blue-100 mb-8">
//                 Join millions who have already discovered the power of KongossaPay
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                 <Button
//                 size="lg"
//                 className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
//                 asChild
//                 >
//                 <Link to="/dashboard">
//                     Start Your Journey
//                     <ArrowRight className="ml-2 w-5 h-5" />
//                 </Link>
//                 </Button>
//                 <Button
//                 size="lg"
//                 variant="outline"
//                 className="border-white/20 text-black hover:text-white hover:bg-white/10 px-8 py-4 text-lg"
//                 asChild
//                 >
//                 <Link to="/support">
//                     Contact Sales
//                 </Link>
//                 </Button>
//             </div>
//             </div>
//         </section>
//         </div>
//     </PublicLayout>
//   );
// }

// "use client"

// import { motion } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import {
//   Wallet,
//   QrCode,
//   Send,
//   ShieldCheck,
//   Globe,
//   Banknote,
//   Users,
//   LineChart,
// } from "lucide-react"
// import { Link } from "react-router-dom"
// import PublicLayout from "@/layouts/PublicLayout"

// export default function HomePage() {
//   return (
//     <PublicLayout>
//       <div className="bg-white dark:bg-black text-black dark:text-white">

//      <section
//   className="relative overflow-hidden group"
//   style={{
//     backgroundImage: "url('/banners/1.jpg')",
//     backgroundSize: "cover",
//     backgroundPosition: "center",
//     backgroundRepeat: "no-repeat",
//   }}
// >
//   {/* Overlay */}
//   <div className="absolute inset-0 bg-black/80 group-hover:bg-black/50 transition duration-700" />

//   {/* Content */}
//   <div className="relative max-w-7xl mx-auto px-6 py-28 text-center">
//     <motion.h1
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="text-5xl md:text-6xl font-bold leading-tight text-white"
//     >
//       One Wallet. <br /> All Your Money, Everywhere.
//     </motion.h1>

//     <p className="mt-6 text-lg text-white/70 max-w-2xl mx-auto">
//       KongossaPay is a secure digital wallet for payments, remittance,
//       budgeting, crypto, QR payments, and financial freedom.
//     </p>

//     <div className="mt-10 flex justify-center gap-4">
//       <Button asChild size="lg">
//         <Link to="/register">Get Started</Link>
//       </Button>
//       <Button variant="outline" size="lg" asChild>
//         <Link to="/features">Explore Features</Link>
//       </Button>
//     </div>
//   </div>
// </section>


//       {/* ================= TRUST ================= */}
//       <section className="py-20 border-b border-black/5 dark:border-white/10">
//         <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-center">
//           {[
//             ["10M+", "Transactions"],
//             ["120+", "Countries"],
//             ["99.99%", "Uptime"],
//             ["Bank-grade", "Security"],
//           ].map(([value, label]) => (
//             <div key={label}>
//               <p className="text-3xl font-bold">{value}</p>
//               <p className="text-sm text-black/60 dark:text-white/60">
//                 {label}
//               </p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ================= BENTO FEATURES ================= */}
//       <section className="py-24">
//         <div className="max-w-7xl mx-auto px-6">
//           <h2 className="text-4xl font-bold mb-12 text-center">
//             Everything You Need in One App
//           </h2>

//           <div className="grid md:grid-cols-3 gap-6">

//             <FeatureCard
//               icon={<Wallet />}
//               title="Digital Wallet"
//               desc="Store, send and receive money in multiple currencies securely."
//             />

//             <FeatureCard
//               icon={<Send />}
//               title="Global Remittance"
//               desc="Send money worldwide at low cost and fast settlement."
//             />

//             <FeatureCard
//               icon={<QrCode />}
//               title="QR Payments"
//               desc="Pay instantly at merchants using secure QR codes."
//             />

//             <FeatureCard
//               icon={<Banknote />}
//               title="Budget & Tontine"
//               desc="Track spending, manage budgets and join tontines."
//             />

//             <FeatureCard
//               icon={<Globe />}
//               title="Crypto & FX"
//               desc="Buy, sell and exchange currencies seamlessly."
//             />

//             <FeatureCard
//               icon={<ShieldCheck />}
//               title="Compliance & Security"
//               desc="KYC, AML and bank-grade encryption by default."
//             />

//           </div>
//         </div>
//       </section>

//       {/* ================= PEOPLE / USE CASES ================= */}
//       <section className="py-24 bg-neutral-50 dark:bg-neutral-950">
//         <div className="max-w-7xl mx-auto px-6">
//           <h2 className="text-4xl font-bold mb-12 text-center">
//             Built for Everyone
//           </h2>

//           <div className="grid md:grid-cols-3 gap-6">

//             <UseCase
//               title="Individuals"
//               desc="Manage daily spending, remittance and savings from one wallet."
//             />

//             <UseCase
//               title="Businesses"
//               desc="Accept payments, manage cash flow and automate payouts."
//             />

//             <UseCase
//               title="Merchants"
//               desc="QR payments, invoicing and instant settlement."
//             />

//           </div>
//         </div>
//       </section>

//       {/* ================= STATS / GROWTH ================= */}
//       <section className="py-24">
//         <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

//           <div>
//             <h2 className="text-4xl font-bold mb-4">
//               Powering Modern Finance
//             </h2>
//             <p className="text-black/70 dark:text-white/70 mb-6">
//               KongossaPay enables fast, transparent and compliant digital
//               finance across borders.
//             </p>

//             <ul className="space-y-3 text-sm">
//               <li className="flex items-center gap-2">
//                 <LineChart className="h-4" /> Real-time transaction tracking
//               </li>
//               <li className="flex items-center gap-2">
//                 <Users className="h-4" /> Millions of active users
//               </li>
//               <li className="flex items-center gap-2">
//                 <ShieldCheck className="h-4" /> Regulatory compliant
//               </li>
//             </ul>
//           </div>

//           <motion.img
//             src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d"
//             alt="Finance"
//             className="rounded-xl shadow-lg"
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//           />
//         </div>
//       </section>

//       {/* ================= FINAL CTA ================= */}
//       <section
//         className="relative py-24 text-white text-center bg-black overflow-hidden group"
//         style={{
//             backgroundImage: "url('/banners/2.jpg')",
//             backgroundSize: "cover",
//             backgroundPosition: "center",
//             backgroundRepeat: "no-repeat",
//         }}
//         >
//         {/* Dark overlay */}
//         <div
//             className="absolute inset-0 bg-black/70 group-hover:bg-black/40 transition-all duration-700"
//         ></div>

//         {/* Content */}
//         <div className="relative z-10 max-w-2xl mx-auto px-4">
//             <h2 className="text-4xl font-bold mb-4">
//             Start Your Financial Freedom Today
//             </h2>
//             <p className="text-white/70 mb-8">
//             Create your free KongossaPay account in minutes.
//             </p>
//             <Button size="lg" asChild>
//             <Link to="/register">Create Free Account</Link>
//             </Button>
//         </div>
//         </section>

//       </div>
//     </PublicLayout>
//   )
// }

// /* ================= COMPONENTS ================= */

// function FeatureCard({
//   icon,
//   title,
//   desc,
// }: {
//   icon: React.ReactNode
//   title: string
//   desc: string
// }) {
//   return (
//     <Card className="hover:shadow-xl transition">
//       <CardContent className="p-6">
//         <div className="mb-4 text-black dark:text-white">
//           {icon}
//         </div>
//         <h3 className="font-semibold text-lg mb-2">
//           {title}
//         </h3>
//         <p className="text-sm text-black/60 dark:text-white/60">
//           {desc}
//         </p>
//       </CardContent>
//     </Card>
//   )
// }

// function UseCase({
//   title,
//   desc,
// }: {
//   title: string
//   desc: string
// }) {
//   return (
//     <Card>
//       <CardContent className="p-6">
//         <h3 className="font-semibold text-xl mb-2">
//           {title}
//         </h3>
//         <p className="text-sm text-black/70 dark:text-white/70">
//           {desc}
//         </p>
//       </CardContent>
//     </Card>
//   )
// }

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
  Wallet,
} from "lucide-react";

// import Header from "@/components/TheHeader";
// import WebsiteLayout from "@/layouts/WebsiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PublicLayout from "@/layouts/PublicLayout";
import { cn } from "@/lib/utils";

export default function Home() {
  /* ---------------- CORE FEATURES ---------------- */
  const coreFeatures = [
    {
      icon: <Send className="h-8 w-8" />,
      title: "Send Money",
      description:
        "Transfer funds instantly to anyone, anywhere in the world with low fees",
      color: "bg-blue-500",
    },
    {
      icon: <QrCode className="h-8 w-8" />,
      title: "QR Payments",
      description:
        "Accept payments instantly with QR codes - perfect for merchants and businesses",
      color: "bg-green-500",
    },
    {
      icon: <Wallet className="h-8 w-8" />,
      title: "Digital Wallet",
      description:
        "Store, manage and spend your money with our secure digital wallet solution",
      color: "bg-purple-500",
    },
    {
      icon: <ReceiptText className="h-8 w-8" />,
      title: "Transaction History",
      description:
        "Complete transaction history with detailed analytics and reporting",
      color: "bg-orange-500",
    },
    {
      icon: <Gift className="h-8 w-8" />,
      title: "Rewards Program",
      description:
        "Earn rewards and bonuses through our multi-level referral system",
      color: "bg-pink-500",
    },
    {
      icon: <RefreshCw className="h-8 w-8" />,
      title: "Currency Exchange",
      description: "Real-time currency exchange with competitive rates",
      color: "bg-cyan-500",
    },
  ];

  /* ---------------- PAYMENT METHODS ---------------- */
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

  /* ---------------- MERCHANT FEATURES ---------------- */
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

  /* ---------------- ADMIN FEATURES ---------------- */
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
    <PublicLayout>
      <div className="min-h-screen bg-linear-to-br from-background to-muted/30">
        {/* <Header /> */}

        {/* ================= HERO ================= */}
        <div className="relative flex h-[40rem] w-full items-center justify-center bg-white dark:bg-black">
        <div
            className={cn(
            "absolute inset-0",
            "[background-size:20px_20px]",
            "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
            "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
            )}
        />
        {/* Radial gradient for the container to give a faded look */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
        <section className="container relative z-20 mx-auto px-4 py-20 bg-linear-to-b from-neutral-200 to-neutral-500 bg-clip-text  text-4xl font-bold text-transparent sm:text-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <Badge variant="outline" className="z-20 px-4 py-2">
              Complete KongossaPay Solution with All Add-ons Bundle
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              The Future of{" "}
              <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Digital Payments
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Complete KongossaPay solution with digital wallet, merchant
              payments, remittance, multi-level referral system, and
              comprehensive admin features.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="px-8 py-6 text-lg">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg text-gray-800 dark:text-white/50 dark:hover:text-white bg-white dark:bg-black hover:bg-white/50 dark:hover:bg-black/50">
                  Watch Demo
                </Button>
              </Link>
            </div>

            <div className="flex justify-center gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Bank-level Security
              </span>
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> Available Worldwide
              </span>
              <span className="flex items-center gap-2">
                <HeadphonesIcon className="h-4 w-4" /> 24/7 Support
              </span>
            </div>
          </motion.div>
        </section>
        {/* <p className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-4xl font-bold text-transparent sm:text-7xl">
            Backgrounds
        </p> */}
        </div>


        {/* ================= CORE FEATURES ================= */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-16">
            Core Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Card className="hover:shadow-xl transition">
                  <CardHeader>
                    <div
                      className={`w-16 h-16 rounded-xl ${f.color} text-white flex items-center justify-center mb-4`}
                    >
                      {f.icon}
                    </div>
                    <CardTitle>{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{f.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= PAYMENT METHODS ================= */}
        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold mb-16">
              Multiple Payment Methods
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paymentMethods.map((m, i) => (
                <Card key={i} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        {m.icon}
                      </div>
                    </div>
                    <CardTitle>{m.title}</CardTitle>
                    <CardDescription>{m.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ================= MERCHANT ================= */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-center text-3xl font-bold mb-16">
            For Merchants
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {merchantFeatures.map((f, i) => (
              <Card key={i} className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center text-green-600">
                      {f.icon}
                    </div>
                  </div>
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription>{f.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* ================= ADMIN ================= */}
        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold mb-16">
              Admin Panel
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {adminFeatures.map((f, i) => (
                <Card key={i} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600">
                        {f.icon}
                      </div>
                    </div>
                    <CardTitle>{f.title}</CardTitle>
                    <CardDescription>{f.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="container mx-auto px-4 py-20">
          <div className="bg-linear-to-r from-primary to-primary/80 rounded-3xl p-12 text-center text-primary-foreground">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Payments?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of businesses already using KongossaPay
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="secondary">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        {/* <footer className="border-t py-12">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            © 2025 KongossaPay. All rights reserved.
          </div>
        </footer> */}
      </div>
    </PublicLayout>
  );
}


"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Wallet,
  Send,
  QrCode,
  ShieldCheck,
  Globe,
  Banknote,
  LineChart,
  Gift,
  Repeat,
  Code,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"
import PublicLayout from "@/layouts/PublicLayout"

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

export default function Features() {
  return (
    <PublicLayout>
      <div className="bg-white dark:bg-black text-black dark:text-white">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden group">
        {/* Background image */}
        <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-500"
            style={{ backgroundImage: "url('/banners/3.jpg')" }}
        />

        {/* Dark overlay with hover transition */}
        <div className="absolute inset-0 bg-black/70 group-hover:bg-black/40 transition-all duration-700" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 py-28 text-center">
            <motion.h1
            {...fadeUp}
            className="text-5xl md:text-6xl font-bold text-white"
            >
            Powerful Features for Modern Finance
            </motion.h1>
            <p className="mt-6 text-lg text-white/70 max-w-3xl mx-auto">
            KongossaPay combines digital wallet, payments, remittance, budgeting,
            crypto, and business tools into one secure platform.
            </p>
        </div>
        </section>


      {/* ================= CORE FEATURES ================= */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            {...fadeUp}
            className="text-4xl font-bold mb-14 text-center"
          >
            Core Financial Features
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Wallet />}
              title="Digital Wallet"
              desc="Securely store, send, and receive money in multiple currencies. Manage balances, view transaction history, and control your funds from one place."
            />
            <FeatureCard
              icon={<Send />}
              title="Global Remittance"
              desc="Send money internationally with reduced fees and competitive exchange rates. Fast, transparent, and reliable transfers worldwide."
            />
            <FeatureCard
              icon={<QrCode />}
              title="QR Code Payments"
              desc="Merchants can generate QR codes to accept instant payments at stores, counters, or online checkout."
            />
            <FeatureCard
              icon={<Repeat />}
              title="Currency Exchange"
              desc="Convert currencies instantly at real-time market rates with transparent fees. Buy or sell directly from your wallet."
            />
            <FeatureCard
              icon={<LineChart />}
              title="Budget Management"
              desc="Track expenses, set spending limits, analyze habits, and receive insights to improve your financial health."
            />
            <FeatureCard
              icon={<Users />}
              title="Tontine Savings"
              desc="Join trusted digital savings circles with friends or colleagues and receive rotating payouts securely."
            />
          </div>
        </div>
      </section>

      {/* ================= ADVANCED FEATURES ================= */}
      <section className="py-24 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            {...fadeUp}
            className="text-4xl font-bold mb-14 text-center"
          >
            Advanced & Business Features
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Banknote />}
              title="Merchant & Business Payments"
              desc="Accept online and in-store payments, manage revenues, withdraw funds, and track performance from a unified dashboard."
            />
            <FeatureCard
              icon={<Gift />}
              title="Rewards & Loyalty"
              desc="Earn points on every transaction and redeem them for discounts, cashback, or exclusive offers."
            />
            <FeatureCard
              icon={<Code />}
              title="Developer API"
              desc="Power your business with open APIs for payments, wallet operations, webhooks, and automated accounting."
            />
            <FeatureCard
              icon={<ShieldCheck />}
              title="Security & Compliance"
              desc="KYC, AML, PCI-DSS aligned processes, encrypted transactions, and fraud monitoring ensure bank-grade security."
            />
            <FeatureCard
              icon={<Globe />}
              title="Multi-Country Support"
              desc="Operate globally with support for multiple countries, currencies, and regulatory requirements."
            />
            <FeatureCard
              icon={<LineChart />}
              title="Analytics & Revenue"
              desc="View real-time analytics, transaction insights, and revenue generated by your application or business."
            />
          </div>
        </div>
      </section>

      {/* ================= BENTO GRID ================= */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            {...fadeUp}
            className="text-4xl font-bold mb-14 text-center"
          >
            One Platform, Endless Possibilities
          </motion.h2>

          <div className="grid md:grid-cols-4 gap-6">
            <BentoCard
              title="Individuals"
              desc="Daily payments, remittance, budgeting, rewards, and crypto — all from one wallet."
            />
            <BentoCard
              title="Small Businesses"
              desc="QR payments, invoicing, payouts, and financial insights to grow faster."
            />
            <BentoCard
              title="Enterprises"
              desc="High-volume transactions, APIs, automated accounting, and premium support."
            />
            <BentoCard
              title="Developers"
              desc="Build fintech products using KongossaPay APIs, webhooks, and sandbox tools."
            />
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section
        className="relative py-24 text-white text-center bg-cover bg-center group"
        style={{ backgroundImage: `url('/banners/4.jpg')` }}
        >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70 group-hover:bg-black/40 transition-all duration-700" />

        {/* Content */}
        <div className="relative z-10">
            <motion.h2 {...fadeUp} className="text-4xl font-bold mb-4">
            Ready to Experience Smart Finance?
            </motion.h2>
            <p className="text-white/70 mb-8">
            Create your KongossaPay account and access all features today.
            </p>
            <Button size="lg" asChild>
            <Link to="/register">Get Started Now</Link>
            </Button>
        </div>
        </section>


    </div>
    </PublicLayout>
  )
}

/* ================= COMPONENTS ================= */

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <motion.div {...fadeUp}>
      <Card className="hover:shadow-xl transition">
        <CardContent className="p-6">
          <div className="mb-4">{icon}</div>
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-sm text-black/70 dark:text-white/70">{desc}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function BentoCard({
  title,
  desc,
}: {
  title: string
  desc: string
}) {
  return (
    <motion.div {...fadeUp}>
      <Card className="h-full">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm text-black/70 dark:text-white/70">{desc}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

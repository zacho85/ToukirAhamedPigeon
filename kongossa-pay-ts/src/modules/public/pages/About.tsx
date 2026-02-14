"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import {
  ShieldCheck,
  Globe,
  Users,
  Wallet,
  LineChart,
  Code,
} from "lucide-react"
import PublicLayout from "@/layouts/PublicLayout"

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
}

export default function About() {
  return (
    <PublicLayout>
      <div className="bg-white dark:bg-black text-black dark:text-white">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden group">
        {/* Background Image */}
        <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
            style={{ backgroundImage: "url('/banners/5.jpg')" }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70 group-hover:bg-black/40 transition-all duration-700" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 py-28">
            <motion.h1
            {...fadeUp}
            className="text-5xl md:text-6xl font-bold text-white max-w-4xl"
            >
            About KongossaPay
            </motion.h1>
            <p className="mt-6 text-lg text-white/70 max-w-3xl">
            KongossaPay is an all-in-one digital financial platform built to
            simplify payments, remittance, savings, and business finance across
            borders.
            </p>
        </div>
        </section>


      {/* ================= MISSION ================= */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-14">
          <motion.div {...fadeUp}>
            <h2 className="text-4xl font-bold mb-4">Our Mission</h2>
            <p className="text-black/70 dark:text-white/70 leading-relaxed">
              Our mission is to empower individuals, businesses, and communities
              with accessible, secure, and transparent financial tools. We
              believe modern financial services should be inclusive, fast, and
              easy to use — regardless of borders or banking limitations.
            </p>
          </motion.div>

          <motion.div {...fadeUp}>
            <h2 className="text-4xl font-bold mb-4">Our Vision</h2>
            <p className="text-black/70 dark:text-white/70 leading-relaxed">
              We envision a world where anyone can send, receive, save, and
              manage money digitally without friction. KongossaPay aims to
              bridge traditional finance with modern technology to create
              borderless financial freedom.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= VALUES ================= */}
      <section className="py-24 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            {...fadeUp}
            className="text-4xl font-bold mb-14 text-center"
          >
            Our Core Values
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            <ValueCard
              icon={<ShieldCheck />}
              title="Security First"
              desc="Bank-grade encryption, compliance, and fraud protection are at the heart of everything we build."
            />
            <ValueCard
              icon={<Users />}
              title="User-Centric"
              desc="We design simple, intuitive experiences that prioritize trust, transparency, and usability."
            />
            <ValueCard
              icon={<Globe />}
              title="Global Access"
              desc="We enable cross-border transactions and financial inclusion for users worldwide."
            />
          </div>
        </div>
      </section>

      {/* ================= WHAT WE DO ================= */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            {...fadeUp}
            className="text-4xl font-bold mb-14 text-center"
          >
            What We Do
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Wallet />}
              title="Digital Wallet & Payments"
              desc="Store funds, send money, receive payments, and manage transactions securely from your smartphone."
            />
            <FeatureCard
              icon={<LineChart />}
              title="Smart Finance Tools"
              desc="Track expenses, manage budgets, participate in tontines, and gain financial insights."
            />
            <FeatureCard
              icon={<Code />}
              title="Business & API Solutions"
              desc="Enable businesses and developers to build scalable fintech solutions using our APIs."
            />
          </div>
        </div>
      </section>

      {/* ================= TRUST ================= */}
      <section className="relative group py-24">
        {/* Background Image */}
        <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/banners/6.jpg')" }}
        />

        {/* Dark Overlay with hover effect */}
        <div className="absolute inset-0 bg-black/70 group-hover:bg-black/40 transition-all duration-700" />

        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-6 text-center text-white">
            <motion.h2 {...fadeUp} className="text-4xl font-bold mb-6">
            Built on Trust & Compliance
            </motion.h2>
            <p className="text-white/70 max-w-3xl mx-auto">
            KongossaPay follows strict KYC and AML policies, implements robust
            data protection standards, and aligns with global regulatory
            requirements to keep your money safe.
            </p>
        </div>
        </section>

    </div>
    </PublicLayout>
  )
}

/* ================= COMPONENTS ================= */

function ValueCard({
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
      <Card className="h-full hover:shadow-xl transition">
        <CardContent className="p-6">
          <div className="mb-4">{icon}</div>
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-sm text-black/70 dark:text-white/70">{desc}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

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
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="mb-4">{icon}</div>
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-sm text-black/70 dark:text-white/70">{desc}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

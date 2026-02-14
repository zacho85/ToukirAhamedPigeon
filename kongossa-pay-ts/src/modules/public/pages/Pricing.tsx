"use client"

import PublicLayout from "@/layouts/PublicLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
}

export default function Pricing() {
  return (
    <PublicLayout>
      <section className="relative py-24 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6">

          {/* Header */}
          <motion.div {...fadeUp} className="text-center mb-16">
            <Badge className="mb-4">Transparent Pricing</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white">
              Simple, Fair & Scalable Fees
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              KongossaPay follows a progressive commission model — the more you
              transact, the less you pay.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {/* Personal */}
            <motion.div {...fadeUp}>
              <Card className="h-full border dark:border-gray-800">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold text-black dark:text-white">
                    Personal Account
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Best for individuals & families
                  </p>

                  <ul className="mt-6 space-y-3">
                    {[
                      "Digital Wallet",
                      "Send & Receive Money",
                      "Tontine (Savings Circles)",
                      "Budget Management",
                      "QR Payments",
                      "Instant Alerts",
                    ].map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button className="mt-8 w-full">Create Personal Account</Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Business */}
            <motion.div {...fadeUp}>
              <Card className="h-full border dark:border-gray-800 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold">
                    Business / Merchant
                  </h3>
                  <p className="text-indigo-100 mt-2">
                    Designed for SMEs & Enterprises
                  </p>

                  <ul className="mt-6 space-y-3">
                    {[
                      "Payment Gateway & PayLink",
                      "Merchant Dashboard",
                      "API Access",
                      "Multi-currency Support",
                      "Automated Accounting",
                      "Priority Support",
                    ].map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check className="w-5 h-5 text-green-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant="secondary"
                    className="mt-8 w-full text-black"
                  >
                    Open Business Account
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Commission Tables */}
          <motion.div {...fadeUp} className="mb-16">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-6">
              Progressive Commission – Personal
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border dark:border-gray-800">
                <thead className="bg-gray-100 dark:bg-gray-900">
                  <tr>
                    <th className="p-3 text-left">Transfer Amount</th>
                    <th className="p-3 text-left">Commission</th>
                    <th className="p-3 text-left">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["0 – 30$", "5%", "30$ → 1.5$"],
                    ["31 – 100$", "4%", "100$ → 4$"],
                    ["101 – 200$", "3.5%", "200$ → 7$"],
                    ["201 – 300$", "3%", "300$ → 9$"],
                    ["301 – 500$", "2.5%", "500$ → 12.5$"],
                    ["501 – 750$", "2%", "750$ → 15$"],
                    ["751 – 1,500$", "1.5%", "1,500$ → 22.5$"],
                    ["1,501 – 2,000$", "1%", "2,000$ → 20$"],
                    ["2,001 – 5,000$", "0.8%", "5,000$ → 40$"],
                  ].map((row) => (
                    <tr key={row[0]} className="border-t dark:border-gray-800">
                      <td className="p-3">{row[0]}</td>
                      <td className="p-3">{row[1]}</td>
                      <td className="p-3">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-bold text-black dark:text-white mb-6">
              Progressive Commission – Business
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border dark:border-gray-800">
                <thead className="bg-gray-100 dark:bg-gray-900">
                  <tr>
                    <th className="p-3 text-left">Transfer Amount</th>
                    <th className="p-3 text-left">Commission</th>
                    <th className="p-3 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["0 – 5,000$", "0.8%", "Entry rate for SMEs"],
                    ["5,001 – 10,000$", "0.6%", "Volume incentive"],
                    ["10,001 – 25,000$", "0.5%", "Bank-level rates"],
                    ["25,001 – 50,000$", "0.4%", "Large operations"],
                    ["50,001 – 100,000$", "0.3%", "Key accounts"],
                    ["> 100,000$", "Negotiable", "Custom contract"],
                  ].map((row) => (
                    <tr key={row[0]} className="border-t dark:border-gray-800">
                      <td className="p-3">{row[0]}</td>
                      <td className="p-3">{row[1]}</td>
                      <td className="p-3">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

        </div>
      </section>
    </PublicLayout>
  )
}

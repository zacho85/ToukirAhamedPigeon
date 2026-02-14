"use client"

import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import RouteProgress from "@/components/module/admin/layout/RouteProgress"
import { Button } from "@/components/ui/button"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const accessToken = null

  return (
    <>
      <RouteProgress color="#000000" />

      <div className="min-h-screen flex flex-col bg-white text-black dark:bg-black dark:text-white transition-colors">

        {/* ================= HEADER ================= */}
        <header className="sticky top-0 z-50 backdrop-blur bg-white/70 dark:bg-black/70 border-b border-black/5 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" className="h-9" />
            </Link>

            {/* NAV */}
            <nav className="hidden md:flex gap-6 text-sm font-medium">
              <Link to="/about" className="hover:opacity-70">About</Link>
              <Link to="/features" className="hover:opacity-70">Features</Link>
              <Link to="/pricing" className="hover:opacity-70">Pricing</Link>
              <Link to="/contact" className="hover:opacity-70">Contact</Link>
            </nav>

            {/* AUTH */}
            <div className="flex items-center gap-3">
              {!accessToken ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* ================= MAIN ================= */}
        <main className="flex-1">
          <motion.div
            key={typeof window !== "undefined" ? window.location.pathname : "page"}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>

        {/* ================= FOOTER ================= */}
        <footer className="border-t border-black/5 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8 text-sm">

            {/* Brand */}
            <div>
              <h4 className="font-semibold mb-3">KongossaPay</h4>
              <p className="text-black/60 dark:text-white/60">
                Modern digital wallet, payments & financial services platform.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/features">Features</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>

              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/terms">Terms</Link></li>
                <li><Link to="/privacy">Privacy</Link></li>
                {/* <li><Link to="/aml">AML Policy</Link></li> */}
                {/* <li><Link to="/gdpr">GDPR</Link></li> */}
              </ul>
            </div>
          </div>

          <div className="border-t border-black/5 dark:border-white/10 py-6 text-center text-xs text-black/60 dark:text-white/60">
            © {new Date().getFullYear()} KongossaPay Ltd. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  )
}

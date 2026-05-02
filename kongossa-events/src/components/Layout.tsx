import React from 'react';
import { Navbar } from './Navbar';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-600 selection:text-white">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
      <footer className="py-12 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-600 rounded-full" />
            <span className="font-bold tracking-tighter uppercase">Kongossa Events</span>
          </div>
          <div className="flex gap-8 text-sm text-white/50">
            <a href="#" className="hover:text-white transition-colors">Conditions</a>
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs text-white/30">© 2026 Kongossa Events. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

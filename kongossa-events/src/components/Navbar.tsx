import { Link } from 'react-router-dom';
import { Music, Calendar, MapPin, User, LogOut, PlusCircle, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white uppercase">Kongossa</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          <Link to="/" className="hover:text-white transition-colors">Événements</Link>
          <Link to="/villes" className="hover:text-white transition-colors">Villes</Link>
          <Link to="/abonnements" className="hover:text-white transition-colors">Abonnements</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/creer">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              <PlusCircle className="w-4 h-4 mr-2" />
              Organiser
            </Button>
          </Link>
          <Link to="/profil">
            <Button size="icon" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              <User className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

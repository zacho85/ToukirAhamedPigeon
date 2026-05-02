import { motion } from 'motion/react';
import { CheckCircle, ArrowRight, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function Success() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-4">Paiement Réussi !</h1>
        <p className="text-white/60 mb-10">
          Votre place a été réservée. Vous recevrez un email de confirmation avec votre billet QR Code très prochainement.
        </p>
        
        <div className="space-y-4">
          <Button className="w-full bg-white text-black hover:bg-white/90 font-bold py-6 rounded-xl flex items-center justify-center gap-2">
            <Ticket className="w-5 h-5" /> Voir mes billets
          </Button>
          <Link to="/" className="block">
            <Button variant="ghost" className="w-full text-white/60 hover:text-white flex items-center justify-center gap-2">
              Retour à l'accueil <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

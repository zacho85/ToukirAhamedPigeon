import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CreditCard, ShieldCheck, ArrowLeft, Ticket, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Event } from '../types';
import { toast } from 'sonner';

export function PaymentLink() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setEvent(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        toast.error("Événement introuvable");
        navigate('/');
      });
  }, [id, navigate]);

  const handlePayment = async () => {
    if (!event) return;
    setProcessing(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: null, // We use price_data for one-time payments
          successUrl: `${window.location.origin}/success`,
          cancelUrl: window.location.href,
          mode: 'payment',
          metadata: {
            eventId: event.id,
            eventTitle: event.title,
            price: event.price.toString()
          }
        }),
      });
      const { url, error } = await response.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'initialisation du paiement");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!event) return null;

  const serviceFee = (event.price * 0.025 + 0.50).toFixed(2);
  const total = (event.price + parseFloat(serviceFee)).toFixed(2);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <Card className="bg-white/5 border-white/10 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter uppercase">Finaliser l'achat</CardTitle>
            <CardDescription className="text-white/50">Vous êtes sur le point d'acheter votre place pour :</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{event.title}</h3>
                  <p className="text-sm text-white/50">{event.city} • {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
                </div>
                <div className="text-xl font-black">{event.price.toFixed(2)}€</div>
              </div>
              <Separator className="bg-white/10 mb-4" />
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Frais de service</span>
                <span>{serviceFee}€</span>
              </div>
              <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t border-white/10">
                <span>Total</span>
                <span className="text-orange-600">{total}€</span>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-white text-black hover:bg-white/90 font-bold py-7 rounded-2xl text-lg flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
                Payer par Carte
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-white/30 uppercase tracking-widest font-bold">
                <ShieldCheck className="w-4 h-4" />
                Paiement Sécurisé par Stripe
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-center pb-8">
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
              className="text-white/40 hover:text-white flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Retour aux événements
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}


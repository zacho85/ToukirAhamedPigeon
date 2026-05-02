import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Link } from 'react-router-dom';
import { Event } from '../types';

export function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/party/1920/1080?blur=10" 
            className="w-full h-full object-cover opacity-40 scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-[12vw] md:text-[8vw] font-black leading-[0.85] tracking-tighter uppercase mb-8">
              Vivez <br />
              <span className="text-orange-600">L'Instant</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 font-medium">
              Découvrez les meilleurs concerts, expositions et soirées privées dans les plus grandes villes du monde.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto bg-white/5 p-2 rounded-2xl backdrop-blur-xl border border-white/10">
              <div className="flex-1 flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-white/10 py-2 md:py-0">
                <Search className="w-5 h-5 text-white/40" />
                <Input 
                  placeholder="Artiste, événement..." 
                  className="bg-transparent border-0 focus-visible:ring-0 placeholder:text-white/30 text-white"
                />
              </div>
              <div className="flex-1 flex items-center px-4 gap-3 py-2 md:py-0">
                <MapPin className="w-5 h-5 text-white/40" />
                <Input 
                  placeholder="Ville..." 
                  className="bg-transparent border-0 focus-visible:ring-0 placeholder:text-white/30 text-white"
                />
              </div>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-6 rounded-xl transition-all hover:scale-105">
                Explorer
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Prochains Événements</h2>
          <Button variant="link" className="text-orange-600 hover:text-orange-500 p-0">
            Voir tout <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[4/5] bg-white/5 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/paiement/${event.id}`}>
                  <Card className="bg-white/5 border-white/10 overflow-hidden group cursor-pointer hover:border-white/20 transition-all">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-black/60 backdrop-blur-md text-white border-0 uppercase text-[10px] tracking-widest">
                          {event.category}
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/40 to-transparent">
                        <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </div>
                        <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-orange-500 transition-colors">
                          {event.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-white/60">
                            <MapPin className="w-3 h-3" />
                            {event.city}
                          </div>
                          <div className="text-lg font-black">
                            {event.price}€
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Subscription Teaser */}
      <section className="max-w-7xl mx-auto px-4 mt-32">
        <div className="bg-gradient-to-br from-orange-600 to-orange-900 rounded-[2rem] p-8 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
            <svg className="w-full h-full rotate-12 translate-x-1/4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6 leading-none">
              Accès Illimité <br /> aux Meilleurs Événements
            </h2>
            <p className="text-lg text-white/80 mb-8 font-medium">
              Abonnez-vous pour bénéficier de préventes exclusives, de réductions et d'un accès prioritaire à tous nos événements partenaires.
            </p>
            <Link to="/abonnements">
              <Button className="bg-white text-orange-600 hover:bg-white/90 font-bold px-10 py-7 rounded-2xl text-lg shadow-2xl transition-all hover:scale-105">
                Découvrir les Abonnements
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


import { motion } from 'motion/react';
import { Check, Zap, Star, Crown } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';

const PLANS = [
  {
    name: 'Découverte',
    price: '0',
    description: 'Pour explorer les événements locaux.',
    features: [
      'Accès à la billetterie standard',
      'Alertes événements par email',
      'Support standard'
    ],
    icon: Zap,
    color: 'bg-white/10'
  },
  {
    name: 'Passionné',
    price: '9.99',
    description: 'Pour les fans de musique et d\'art.',
    features: [
      'Tout du plan Découverte',
      'Préventes exclusives (24h avant)',
      'Réduction de 5% sur tous les billets',
      'Accès aux événements privés'
    ],
    icon: Star,
    color: 'bg-orange-600',
    popular: true
  },
  {
    name: 'VIP Kongossa',
    price: '24.99',
    description: 'L\'expérience ultime pour les passionnés.',
    features: [
      'Tout du plan Passionné',
      'Accès Coupe-file aux événements',
      'Réduction de 15% sur tous les billets',
      'Accès aux zones VIP',
      'Support prioritaire 24/7'
    ],
    icon: Crown,
    color: 'bg-purple-600'
  }
];

export function Subscription() {
  return (
    <div className="py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6"
        >
          Choisissez votre <span className="text-orange-600">Expérience</span>
        </motion.h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto">
          Des avantages exclusifs pour vivre vos événements préférés comme jamais auparavant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`h-full flex flex-col bg-white/5 border-white/10 relative overflow-hidden ${plan.popular ? 'ring-2 ring-orange-600' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-bl-lg tracking-widest">
                  Plus Populaire
                </div>
              )}
              <CardHeader className="pt-10">
                <div className={`w-12 h-12 ${plan.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <plan.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">{plan.name}</CardTitle>
                <CardDescription className="text-white/50">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black tracking-tighter">{plan.price}€</span>
                  <span className="text-white/40 font-medium">/ mois</span>
                </div>
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-white/80">
                      <div className="mt-1 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pb-10 pt-6">
                <Button 
                  className={`w-full py-6 font-bold text-lg rounded-xl transition-all hover:scale-[1.02] ${
                    plan.popular 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20' 
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  S'abonner maintenant
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 p-8 md:p-12 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="text-2xl font-bold mb-2">Besoin d'un plan sur mesure ?</h3>
          <p className="text-white/60">Pour les entreprises et les grands organisateurs d'événements.</p>
        </div>
        <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white px-8 py-6 rounded-xl font-bold">
          Contacter l'équipe Sales
        </Button>
      </div>
    </div>
  );
}

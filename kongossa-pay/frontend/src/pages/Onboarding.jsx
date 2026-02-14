import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/api/auth';
import { ArrowRight, Globe, Shield, Users, Wallet } from 'lucide-react';

const onboardingSteps = [
  {
    icon: Wallet,
    title: "Bienvenue sur KongossaPay",
    description: "Votre portefeuille numérique nouvelle génération pour gérer votre argent en toute simplicité et sécurité.",
    image: "https://images.unsplash.com/photo-1620714223084-86c9df2a889a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    icon: Globe,
    title: "Envoyez de l'argent partout",
    description: "Transférez des fonds instantanément à vos proches, où qu'ils soient dans le monde, avec des frais compétitifs.",
    image: "https://images.unsplash.com/photo-1614583224967-a6ca5d1a4a41?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    icon: Shield,
    title: "Une sécurité de niveau bancaire",
    description: "Vos transactions et vos données personnelles sont protégées par les technologies de cryptage les plus avancées.",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    icon: Users,
    title: "Épargnez et investissez en communauté",
    description: "Rejoignez des tontines numériques pour atteindre vos objectifs financiers collectifs et explorez des options d'investissement.",
    image: "https://images.unsplash.com/photo-1521791136064-7986c28e7489?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      getCurrentUser().then(() => {
        window.location.href = '/dashboard';
      });
    }
  };

  const handleSkip = () => {
    getCurrentUser().then(() => {
      window.location.href = '/dashboard';
    });
  };

  const { icon: Icon, title, description, image } = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <img src={image} alt={title} className="w-full h-full object-cover opacity-20" />
      </div>
      
      <div className="relative z-10 flex flex-col flex-1 p-6 md:p-10">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-amber-400" />
            <span className="font-bold text-lg">KongossaPay</span>
          </div>
          <Button variant="ghost" onClick={handleSkip} className="text-slate-300 hover:text-white">
            Passer
          </Button>
        </header>

        <main className="flex-1 flex flex-col justify-center text-center">
          <div className="bg-white/10 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-8 backdrop-blur-sm">
            <Icon className="w-12 h-12 text-amber-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
          <p className="max-w-md mx-auto text-slate-300">{description}</p>
        </main>

        <footer className="flex flex-col items-center gap-6">
          <div className="flex gap-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentStep === index ? 'bg-amber-400 scale-125' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
          <Button 
            onClick={handleNext} 
            size="lg" 
            className="w-full max-w-sm bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-lg rounded-full"
          >
            {currentStep === onboardingSteps.length - 1 ? "Commencer" : "Suivant"}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </footer>
      </div>
    </div>
  );
}
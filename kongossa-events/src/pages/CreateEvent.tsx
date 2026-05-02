import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, MapPin, Image as ImageIcon, Ticket, Info, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

export function CreateEvent() {
  const navigate = useNavigate();
  const [step, setStep] = useState('details');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    city: '',
    category: 'music',
    price: '',
    ticketsAvailable: '',
    imageUrl: 'https://picsum.photos/seed/event/800/600'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.price) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          ticketsAvailable: parseInt(formData.ticketsAvailable) || 100
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de la création");
      
      toast.success("Événement créé avec succès !");
      navigate('/');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Créer un Événement</h1>
        <p className="text-white/60">Remplissez les détails pour commencer à vendre vos places.</p>
      </div>

      <Tabs value={step} onValueChange={setStep} className="space-y-8">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl w-full justify-start overflow-x-auto">
          <TabsTrigger value="details" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-lg px-6 py-2 flex items-center gap-2">
            <Info className="w-4 h-4" /> Détails
          </TabsTrigger>
          <TabsTrigger value="tickets" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-lg px-6 py-2 flex items-center gap-2">
            <Ticket className="w-4 h-4" /> Billetterie
          </TabsTrigger>
          <TabsTrigger value="media" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-lg px-6 py-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Médias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
              <CardDescription>Donnez un nom et une description à votre événement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'événement</Label>
                <Input id="title" value={formData.title} onChange={handleChange} placeholder="ex: Festival de Jazz 2026" className="bg-white/5 border-white/10 focus:border-orange-600" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Date et Heure</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input id="date" type="datetime-local" value={formData.date} onChange={handleChange} className="bg-white/5 border-white/10 pl-10 focus:border-orange-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input id="city" value={formData.city} onChange={handleChange} placeholder="ex: Paris" className="bg-white/5 border-white/10 pl-10 focus:border-orange-600" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={handleChange} placeholder="Décrivez votre événement en quelques lignes..." className="bg-white/5 border-white/10 min-h-[150px] focus:border-orange-600" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Configuration de la Billetterie</CardTitle>
              <CardDescription>Définissez les prix et les quantités disponibles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix du billet (€)</Label>
                  <Input id="price" type="number" value={formData.price} onChange={handleChange} placeholder="0.00" className="bg-white/5 border-white/10 focus:border-orange-600" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticketsAvailable">Nombre de places</Label>
                  <Input id="ticketsAvailable" type="number" value={formData.ticketsAvailable} onChange={handleChange} placeholder="100" className="bg-white/5 border-white/10 focus:border-orange-600" />
                </div>
              </div>
              <div className="p-4 bg-orange-600/10 border border-orange-600/20 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-600/80">
                  Kongossa Events prélève une commission de 2.5% + 0.50€ par billet vendu pour couvrir les frais de transaction.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Visuels de l'événement</CardTitle>
              <CardDescription>Ajoutez une affiche pour attirer plus de monde.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-orange-600/50 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-orange-600/10 transition-colors">
                  <PlusCircle className="w-8 h-8 text-white/40 group-hover:text-orange-600" />
                </div>
                <div className="text-center">
                  <p className="font-bold">Cliquez pour uploader une image</p>
                  <p className="text-sm text-white/40">PNG, JPG jusqu'à 10MB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-12 flex justify-end gap-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-white/60 hover:text-white">Annuler</Button>
        <Button 
          onClick={handleSubmit}
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-6 rounded-xl flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Publier l'événement
        </Button>
      </div>
    </div>
  );
}

// Helper component for the icon
function PlusCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}


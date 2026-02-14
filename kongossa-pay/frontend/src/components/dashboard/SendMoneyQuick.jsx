import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const contacts = [
    { name: 'Joynal Abedin', img: 'https://avatar.vercel.sh/joynal.png' },
    { name: 'Imran Khan', img: 'https://avatar.vercel.sh/imran.png' },
    { name: 'Zayn Malik', img: 'https://avatar.vercel.sh/zayn.png' },
    { name: 'Sarah Doe', img: 'https://avatar.vercel.sh/sarah.png' },
];

export default function SendMoneyQuick() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Send Money</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search your contact..." className="pl-9 bg-slate-100 border-none" />
        </div>
        <div>
            <p className="text-sm font-semibold text-slate-600 mb-2">Recent Contact</p>
            <div className="flex gap-4">
                {contacts.map(c => (
                    <div key={c.name} className="flex flex-col items-center gap-1 cursor-pointer">
                        <img src={c.img} alt={c.name} className="w-10 h-10 rounded-full" />
                        <p className="text-xs text-slate-500">{c.name.split(' ')[0]}</p>
                    </div>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  )
}
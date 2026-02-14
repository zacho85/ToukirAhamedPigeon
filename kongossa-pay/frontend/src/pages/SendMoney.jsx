
import React, { useState, useEffect } from "react";
// import { User, Transaction, PaymentMethod } from "@/api/entities";
import { getCurrentUser } from "@/api/auth";
import { createTransaction } from "@/api/transactions";
import { getPaymentMethods } from "@/api/paymentMethod";
import { updateUser } from "@/api/users";
import { Send, ArrowLeft, Check, Search, CreditCard, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const contacts = [
    { name: 'Joynal Abedin', email: 'joynal@example.com', img: 'https://avatar.vercel.sh/joynal.png' },
    { name: 'Imran Khan', email: 'imran@example.com', img: 'https://avatar.vercel.sh/imran.png' },
    { name: 'Zayn Malik', email: 'zayn@example.com', img: 'https://avatar.vercel.sh/zayn.png' },
    { name: 'Sarah Doe', email: 'sarah@example.com', img: 'https://avatar.vercel.sh/sarah.png' },
    { name: 'John Smith', email: 'john@example.com', img: 'https://avatar.vercel.sh/john.png' },
];

export default function SendMoney() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [amount, setAmount] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        const methods = await getPaymentMethods({ user_id: currentUser.id, type: 'credit_card' });
        setPaymentMethods(methods);
        if (methods.length > 0) {
            setSelectedCard(methods[0]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleSendMoney = async () => {
    if (!selectedContact || !amount || !selectedCard) {
        alert("Please select a contact, enter an amount, and choose a card.");
        return;
    }
    setIsSending(true);
     try {
      await createTransaction({
        sender_id: user.id,
        recipient_id: selectedContact.email,
        amount: parseFloat(amount),
        currency: user.currency || 'USD',
        type: 'send',
        status: 'completed',
        payment_method: 'card',
        description: `Payment to ${selectedContact.name}`
      });
      const newBalance = (user.wallet_balance || 0) - parseFloat(amount);
      await updateUser(user.id, { walletBalance: Math.max(0, newBalance) });
      setIsSuccess(true);
    } catch (error) {
      console.error("Error sending money:", error);
    } finally {
        setIsSending(false);
    }
  };
  
  if (isSuccess) {
      return (
           <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
               <Card className="w-full max-w-md text-center p-8 rounded-2xl shadow-lg">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Money Sent!</h2>
                    <p className="text-slate-600 mb-6">
                        You have successfully sent ${amount} to {selectedContact.name}.
                    </p>
                    <Button onClick={() => navigate(createPageUrl("Dashboard"))} className="w-full">
                        Back to Dashboard
                    </Button>
               </Card>
           </div>
      )
  }

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-800">Send Money</h1>
        </div>

        <div className="space-y-6">
            {/* Search Contact */}
            <Card className="rounded-2xl">
                <CardContent className="p-4">
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input placeholder="Search your contact..." className="pl-9 bg-slate-100 border-none rounded-lg" />
                    </div>
                </CardContent>
            </Card>

            {/* Select Person */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Select Person</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                        {contacts.map(contact => (
                            <div key={contact.email} onClick={() => setSelectedContact(contact)} className={`flex flex-col items-center gap-2 cursor-pointer p-2 rounded-lg transition-all ${selectedContact?.email === contact.email ? 'bg-blue-100' : ''}`}>
                                <Avatar className="w-12 h-12 border-2 border-white ring-2 ring-transparent group-hover:ring-blue-500">
                                    <AvatarImage src={contact.img} />
                                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="text-xs text-slate-600">{contact.name}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            
            {/* Amount and Card */}
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <Label htmlFor="amount" className="text-slate-600">Amount</Label>
                    <Input id="amount" value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="$0.00" className="h-12 text-lg mt-1"/>
                </div>
            </div>

            {/* Select Card */}
            <Card className="rounded-2xl">
                <CardHeader>
                     <CardTitle className="text-base font-semibold">Select Card</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {paymentMethods.map(method => (
                        <div key={method.id} onClick={() => setSelectedCard(method)} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${selectedCard?.id === method.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-slate-500"/>
                                <div>
                                    <p className="font-medium">{method.provider}</p>
                                    <p className="text-sm text-slate-500">**** {method.last_four}</p>
                                </div>
                            </div>
                            {selectedCard?.id === method.id && <Check className="w-5 h-5 text-blue-600"/>}
                        </div>
                    ))}
                     <Button variant="outline" className="w-full" asChild>
                        <Link to={createPageUrl("Wallet")}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Card or Method
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            <Button onClick={handleSendMoney} className="w-full h-12 text-lg" disabled={isSending}>
                {isSending ? 'Sending...' : 'Send Now'}
            </Button>
        </div>
      </div>
    </div>
  );
}

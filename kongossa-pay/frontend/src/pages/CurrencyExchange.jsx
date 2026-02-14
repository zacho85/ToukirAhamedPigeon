
import React, { useState, useEffect } from 'react';
// import { InvokeLLM } from '@/api/integrations';
// import { User, Transaction, PaymentMethod } from '@/api/entities';
import { getCurrentUser } from '@/api/auth';
import { getPaymentMethods } from '@/api/paymentMethod';
import { createTransaction } from '@/api/transactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft, Loader2, CreditCard, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CNY", "INR", "NGN", "GHS", "KES", "ZAR"];

export default function CurrencyExchange() {
    const [user, setUser] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [fromCurrency, setFromCurrency] = useState("USD");
    const [toCurrency, setToCurrency] = useState("EUR");
    const [amount, setAmount] = useState(100);
    const [rate, setRate] = useState(null);
    const [convertedAmount, setConvertedAmount] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExchanging, setIsExchanging] = useState(false);

    useEffect(() => {
        const fetchUserAndMethods = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
                
                const methods = await getPaymentMethods({ user_id: currentUser.id });
                setPaymentMethods(methods);
                if (methods.length > 0) {
                    setSelectedPaymentMethod(methods[0]);
                }
            } catch (error) {
                console.error("Error loading user data:", error);
            }
        };
        fetchUserAndMethods();
    }, []);

    const getRate = async () => {
        if (!amount || amount <= 0 || !fromCurrency || !toCurrency) return;
        setIsLoading(true);
        setRate(null);
        setConvertedAmount(null);
        try {
            const response = await InvokeLLM({
                prompt: `What is the current exchange rate from ${fromCurrency} to ${toCurrency}? Provide only the number, for example: 0.92`,
                add_context_from_internet: true,
            });
            const exchangeRate = parseFloat(response);
            if (!isNaN(exchangeRate)) {
                setRate(exchangeRate);
                setConvertedAmount(amount * exchangeRate);
            }
        } catch (error) {
            console.error("Error fetching exchange rate:", error);
        }
        setIsLoading(false);
    };

    const handleExchange = async () => {
        if (!convertedAmount || !user || !selectedPaymentMethod) {
            alert('Please select a payment method and get the current rate.');
            return;
        }
        
        setIsExchanging(true);
        try {
            // Simulate withdrawal from selected payment method
            await createTransaction({
                sender_id: user.id,
                recipient_id: 'fx_exchange',
                amount: parseFloat(amount),
                currency: fromCurrency,
                type: 'withdrawal',
                status: 'completed',
                payment_method: selectedPaymentMethod.type,
                description: `FX: Convert ${amount} ${fromCurrency} to ${toCurrency}`
            });
            
            // Simulate deposit of converted currency
            await createTransaction({
                sender_id: 'fx_exchange',
                recipient_id: user.id,
                amount: parseFloat(convertedAmount),
                currency: toCurrency,
                type: 'deposit',
                status: 'completed',
                description: `FX: Received ${convertedAmount.toFixed(2)} ${toCurrency}`
            });
            
            alert(`Exchange successful! You received ${convertedAmount.toFixed(2)} ${toCurrency}`);
            setAmount(100);
            setRate(null);
            setConvertedAmount(null);
        } catch (error) {
            console.error("Exchange failed:", error);
            alert('Exchange failed. Please try again.');
        }
        setIsExchanging(false);
    };

    const swapCurrencies = () => {
        const temp = fromCurrency;
        setFromCurrency(toCurrency);
        setToCurrency(temp);
        setRate(null);
        setConvertedAmount(null);
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Currency Exchange</h1>
                <p className="text-slate-600">Exchange currencies at competitive rates</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowRightLeft className="w-5 h-5" />
                        Convert Currency
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* From Currency */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">You Send</label>
                        <div className="flex gap-3">
                            <Input 
                                type="number" 
                                value={amount} 
                                onChange={e => setAmount(parseFloat(e.target.value))} 
                                placeholder="100.00"
                                className="flex-1"
                            />
                            <Select value={fromCurrency} onValueChange={setFromCurrency}>
                                <SelectTrigger className="w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center">
                        <Button variant="outline" size="icon" onClick={swapCurrencies} className="rounded-full">
                            <ArrowRightLeft className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* To Currency */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">You Receive</label>
                        <div className="flex gap-3">
                            <Input 
                                type="text" 
                                value={convertedAmount ? convertedAmount.toFixed(2) : ''} 
                                placeholder="0.00"
                                className="flex-1"
                                disabled
                            />
                            <Select value={toCurrency} onValueChange={setToCurrency}>
                                <SelectTrigger className="w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Payment Method</label>
                        {paymentMethods.length === 0 ? (
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                                <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-slate-600 mb-3">No payment methods found</p>
                                <Button variant="outline" asChild>
                                    <Link to={createPageUrl("Wallet")}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Payment Method
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Select 
                                    value={selectedPaymentMethod?.id || ''} 
                                    onValueChange={(value) => {
                                        const method = paymentMethods.find(m => m.id === value);
                                        setSelectedPaymentMethod(method);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentMethods.map(method => (
                                            <SelectItem key={method.id} value={method.id}>
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4" />
                                                    {method.provider} •••• {method.last_four}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                    <Link to={createPageUrl("Wallet")}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add or manage payment methods
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Get Rate Button */}
                    <Button 
                        onClick={getRate} 
                        disabled={isLoading || !selectedPaymentMethod} 
                        className="w-full"
                        variant="outline"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Get Live Rate
                    </Button>
                    
                    {/* Exchange Information */}
                    {rate && convertedAmount && (
                        <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                            <div className="text-center">
                                <p className="text-sm text-slate-600">Exchange Rate</p>
                                <p className="text-lg font-semibold">1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-slate-900">
                                    {amount} {fromCurrency} → {convertedAmount.toFixed(2)} {toCurrency}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Confirm Exchange Button */}
                    {rate && convertedAmount && selectedPaymentMethod && (
                        <Button 
                            onClick={handleExchange} 
                            disabled={isExchanging} 
                            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3"
                        >
                            {isExchanging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isExchanging ? 'Processing Exchange...' : `Confirm Exchange`}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

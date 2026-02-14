import React, { useState, useEffect } from 'react';
// import { InvokeLLM } from '@/api/integrations';
// import { User, Transaction, PaymentMethod } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft, Loader2, CreditCard, Plus, Bitcoin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { User } from '@/modules/auth/types';
import { useAppSelector } from '@/hooks/useRedux';
// import { createPageUrl } from '@/utils';

const cryptos = ["BTC", "ETH", "SOL", "USDT", "BNB", "ADA", "MATIC"];
const fiats = ["USD", "EUR", "GBP", "NGN"];

interface PaymentMethodType {
    id: string;
    type: string;
    provider: string;
    last_four: string;
}

export default function CryptoExchange() {
    const [user, setUser] = useState<User | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | null>(null);
    const [fromAsset, setFromAsset] = useState<string>("USD");
    const [toAsset, setToAsset] = useState<string>("BTC");
    const [amount, setAmount] = useState<number>(1000);
    const [rate, setRate] = useState<number | null>(null);
    const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isExchanging, setIsExchanging] = useState<boolean>(false);

    useEffect(() => {
        const fetchUserAndMethods = async () => {
            try {
                const currentUser = useAppSelector((state) => state.auth.user);
                setUser(currentUser);

                // const methods: PaymentMethodType[] = await PaymentMethod.filter({ user_id: currentUser.id });
                // setPaymentMethods(methods);
                // if (methods.length > 0) {
                //     setSelectedPaymentMethod(methods[0]);
                // }
            } catch (error) {
                console.error("Error loading user data:", error);
            }
        };
        fetchUserAndMethods();
    }, []);

    const getRate = async () => {
        if (!amount || amount <= 0 || !fromAsset || !toAsset) return;
        setIsLoading(true);
        setRate(null);
        setConvertedAmount(null);
        try {
            // const response = await InvokeLLM({
            //     prompt: `What is the current price of 1 ${fromAsset} in ${toAsset}? Provide only the number.`,
            //     add_context_from_internet: true,
            // });
            // const exchangeRate = parseFloat(response);
            // if (!isNaN(exchangeRate)) {
            //     setRate(exchangeRate);
            //     setConvertedAmount(amount * exchangeRate);
            // }
        } catch (error) {
            console.error("Error fetching crypto rate:", error);
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
            // Simulate crypto trade transaction
            // await Transaction.create({
            //     sender_id: user.id,
            //     recipient_id: 'crypto_exchange',
            //     amount: parseFloat(amount.toString()),
            //     currency: fromAsset,
            //     type: fromAsset.includes('USD') || fromAsset.includes('EUR') ? 'withdrawal' : 'send',
            //     status: 'completed',
            //     payment_method: selectedPaymentMethod.type,
            //     description: `Crypto: Buy ${convertedAmount.toPrecision(6)} ${toAsset} with ${amount} ${fromAsset}`
            // });

            alert(`Trade successful! You received ${convertedAmount.toPrecision(6)} ${toAsset}`);
            setAmount(1000);
            setRate(null);
            setConvertedAmount(null);
        } catch (error) {
            console.error("Crypto exchange failed:", error);
            alert('Trade failed. Please try again.');
        }
        setIsExchanging(false);
    };

    const swapAssets = () => {
        const temp = fromAsset;
        setFromAsset(toAsset);
        setToAsset(temp);
        setRate(null);
        setConvertedAmount(null);
    };

    const assets = [...fiats, ...cryptos];

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-gray-100 mb-2 flex items-center justify-center gap-3">
                    <Bitcoin className="w-8 h-8 text-orange-500" />
                    Crypto Exchange
                </h1>
                <p className="text-slate-600 dark:text-gray-300">Buy and sell cryptocurrencies instantly</p>
            </div>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <ArrowRightLeft className="w-5 h-5" />
                        Trade Crypto
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* From Asset */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900 dark:text-gray-200">You Pay</label>
                        <div className="flex gap-3">
                            <Input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(parseFloat(e.target.value))}
                                placeholder="1000.00"
                                className="flex-1"
                            />
                            <Select value={fromAsset} onValueChange={setFromAsset}>
                                <SelectTrigger className="w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {assets.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center">
                        <Button variant="outline" size="icon" onClick={swapAssets} className="rounded-full">
                            <ArrowRightLeft className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* To Asset */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900 dark:text-gray-200">You Receive</label>
                        <div className="flex gap-3">
                            <Input
                                type="text"
                                value={convertedAmount ? convertedAmount.toPrecision(8) : ''}
                                placeholder="0.00000000"
                                className="flex-1"
                                disabled
                            />
                            <Select value={toAsset} onValueChange={setToAsset}>
                                <SelectTrigger className="w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {assets.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Payment Method</label>
                        {paymentMethods.length === 0 ? (
                            <div className="border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-lg p-4 text-center">
                                <CreditCard className="w-8 h-8 text-slate-400 dark:text-gray-400 mx-auto mb-2" />
                                <p className="text-slate-600 dark:text-gray-300 mb-3">No payment methods found</p>
                                <Button variant="outline" asChild>
                                    <Link to="/wallet">
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
                                        setSelectedPaymentMethod(method || null);
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
                                    <Link to="/wallet">
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
                        Get Live Price
                    </Button>

                    {/* Exchange Information */}
                    {rate && convertedAmount && (
                        <div className="bg-orange-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                            <div className="text-center">
                                <p className="text-sm text-slate-600 dark:text-gray-300">Current Price</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    1 {fromAsset} ≈ {rate.toPrecision(6)} {toAsset}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-slate-900 dark:text-gray-100">
                                    {amount} {fromAsset} → {convertedAmount.toPrecision(6)} {toAsset}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Confirm Trade Button */}
                    {rate && convertedAmount && selectedPaymentMethod && (
                        <Button
                            onClick={handleExchange}
                            disabled={isExchanging}
                            className="w-full bg-linear-gradient(to-r, from-orange-500 to-yellow-500) hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3"
                        >
                            {isExchanging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isExchanging ? 'Processing Trade...' : `Confirm Trade`}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

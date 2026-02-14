import React, { useState, useEffect } from 'react';
// import { InvokeLLM } from '@/api/integrations';
// import { User, Transaction, PaymentMethod } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft, Loader2, CreditCard, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { User } from '@/modules/auth/types';
import { useAppSelector } from '@/hooks/useRedux';
// import { createPageUrl } from '@/utils';

const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CNY", "INR", "NGN", "GHS", "KES", "ZAR"];

interface PaymentMethodType {
    id: string;
    type: string;
    provider: string;
    last_four: string;
}

export default function CurrencyExchange() {
    const [user, setUser] = useState<User | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | null>(null);
    const [fromCurrency, setFromCurrency] = useState<string>("USD");
    const [toCurrency, setToCurrency] = useState<string>("EUR");
    const [amount, setAmount] = useState<number>(100);
    const [rate, setRate] = useState<number | null>(null);
    const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isExchanging, setIsExchanging] = useState<boolean>(false);

    useEffect(() => {
        const fetchUserAndMethods = async () => {
            try {
                const currentUser = useAppSelector((state) => state.auth.user);
                setUser(currentUser);

                // const methods = await PaymentMethod.filter({ user_id: currentUser.id });
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
        if (!amount || amount <= 0 || !fromCurrency || !toCurrency) return;
        setIsLoading(true);
        setRate(null);
        setConvertedAmount(null);
        try {
            // const response = await InvokeLLM({
            //     prompt: `What is the current exchange rate from ${fromCurrency} to ${toCurrency}? Provide only the number, for example: 0.92`,
            //     add_context_from_internet: true,
            // });
            // const exchangeRate = parseFloat(response);
            // if (!isNaN(exchangeRate)) {
            //     setRate(exchangeRate);
            //     setConvertedAmount(amount * exchangeRate);
            // }
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
            // await Transaction.create({
            //     sender_id: user.id,
            //     recipient_id: 'fx_exchange',
            //     amount: parseFloat(amount.toString()),
            //     currency: fromCurrency,
            //     type: 'withdrawal',
            //     status: 'completed',
            //     payment_method: selectedPaymentMethod.type,
            //     description: `FX: Convert ${amount} ${fromCurrency} to ${toCurrency}`
            // });

            // Simulate deposit of converted currency
            // await Transaction.create({
            //     sender_id: 'fx_exchange',
            //     recipient_id: user.id,
            //     amount: parseFloat(convertedAmount.toString()),
            //     currency: toCurrency,
            //     type: 'deposit',
            //     status: 'completed',
            //     description: `FX: Received ${convertedAmount.toFixed(2)} ${toCurrency}`
            // });

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
                <h1 className="text-3xl font-bold text-slate-900 dark:text-gray-100 mb-2">Currency Exchange</h1>
                <p className="text-slate-600 dark:text-gray-400">Exchange currencies at competitive rates</p>
            </div>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <ArrowRightLeft className="w-5 h-5" />
                        Convert Currency
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* From Currency */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">You Send</label>
                        <div className="flex gap-3">
                            <Input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(parseFloat(e.target.value))}
                                placeholder="100.00"
                                className="flex-1 bg-[#fbfdff] dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-[#aab4c3] dark:placeholder-gray-500"
                            />
                            <Select value={fromCurrency} onValueChange={setFromCurrency}>
                                <SelectTrigger className="w-24 bg-[#fbfdff] dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                    {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center">
                        <Button variant="outline" size="icon" onClick={swapCurrencies} className="rounded-full text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                            <ArrowRightLeft className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* To Currency */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">You Receive</label>
                        <div className="flex gap-3">
                            <Input
                                type="text"
                                value={convertedAmount ? convertedAmount.toFixed(2) : ''}
                                placeholder="0.00"
                                className="flex-1 bg-[#fbfdff] dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-[#aab4c3] dark:placeholder-gray-500"
                                disabled
                            />
                            <Select value={toCurrency} onValueChange={setToCurrency}>
                                <SelectTrigger className="w-24 bg-[#fbfdff] dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                    {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
                        {paymentMethods.length === 0 ? (
                            <div className="border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-lg p-4 text-center">
                                <CreditCard className="w-8 h-8 text-slate-400 dark:text-gray-400 mx-auto mb-2" />
                                <p className="text-slate-600 dark:text-gray-400 mb-3">No payment methods found</p>
                                <Button variant="outline" asChild className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
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
                                    <SelectTrigger className="bg-[#fbfdff] dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
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
                                <Button variant="outline" size="sm" className="w-full text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" asChild>
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
                        className="w-full text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        variant="outline"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Get Live Rate
                    </Button>

                    {/* Exchange Information */}
                    {rate && convertedAmount && (
                        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 space-y-3 text-gray-900 dark:text-gray-100">
                            <div className="text-center">
                                <p className="text-sm text-slate-600 dark:text-gray-400">Exchange Rate</p>
                                <p className="text-lg font-semibold">1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">
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
                            className="w-full bg-linear-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3"
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

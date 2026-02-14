import React, { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, CreditCard, Calendar } from 'lucide-react';

interface CheckoutSuccessProps {
    session: {
        id: string;
        amount_total: number;
        currency: string;
        customer_email: string;
        payment_status: string;
    };
    subscription?: {
        id: string;
        status: string;
        current_period_end: string;
        plan_name: string;
    };
}

export default function CheckoutSuccess({ session, subscription }: CheckoutSuccessProps) {
    useEffect(() => {
        // Track successful payment/subscription
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'purchase', {
                transaction_id: session.id,
                value: session.amount_total / 100,
                currency: session.currency,
            });
        }
    }, [session]);

    const formatAmount = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount / 100);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleContinue = () => {
        router.visit('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <Head title="Payment Successful" />
            
            <div className="w-full max-w-md space-y-6">
                {/* Success Icon */}
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Payment Successful!
                    </h1>
                    <p className="text-gray-600">
                        Thank you for your payment. Your transaction has been completed successfully.
                    </p>
                </div>

                {/* Payment Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Payment Details
                        </CardTitle>
                        <CardDescription>
                            Transaction ID: {session?.id}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Amount Paid</span>
                            <span className="font-semibold text-lg">
                                {formatAmount(session?.amount_total, session?.currency)}
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Email</span>
                            <span className="font-medium">{session?.customer_email}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Status</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {session?.payment_status}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscription Details Card (if applicable) */}
                {subscription && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Subscription Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Plan</span>
                                <span className="font-medium">{subscription.plan_name}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Status</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {subscription.status}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Next Billing</span>
                                <span className="font-medium">
                                    {formatDate(subscription.current_period_end)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button 
                        onClick={handleContinue}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        size="lg"
                    >
                        Continue to Dashboard
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    <Button 
                        variant="outline" 
                        onClick={() => window.print()}
                        className="w-full"
                    >
                        Print Receipt
                    </Button>
                </div>

                {/* Additional Information */}
                <div className="text-center text-sm text-gray-500 space-y-1">
                    <p>A confirmation email has been sent to {session?.customer_email}</p>
                    <p>If you have any questions, please contact our support team.</p>
                </div>
            </div>
        </div>
    );
}

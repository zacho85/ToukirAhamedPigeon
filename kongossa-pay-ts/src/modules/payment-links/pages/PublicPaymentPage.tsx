// PublicPaymentPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getPublicPaymentLink, type PublicPaymentLink } from '../api';
import { AlertCircle, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PublicPaymentPage() {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentLink, setPaymentLink] = useState<PublicPaymentLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    if (!linkId) {
      setError('Invalid payment link');
      setLoading(false);
      return;
    }

    const fetchLink = async () => {
      try {
        const data = await getPublicPaymentLink(linkId);
        setPaymentLink(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invalid or expired payment link');
      } finally {
        setLoading(false);
      }
    };

    fetchLink();
  }, [linkId]);

  const handlePay = async () => {
    if (!paymentLink?.stripeCheckoutUrl) {
      setError('Payment link not available');
      return;
    }

    // For flexible amount, we need to create a custom session
    if (paymentLink.type === 'flexible_amount') {
      const amount = parseFloat(customAmount);
      if (isNaN(amount) || amount < 0.5) {
        setError('Please enter a valid amount (minimum $0.50)');
        return;
      }
      // Here you would call an API to create a custom checkout session
      // For now, redirect with amount parameter
      window.location.href = `${paymentLink.stripeCheckoutUrl}?amount=${amount}`;
    } else {
      setRedirecting(true);
      window.location.href = paymentLink.stripeCheckoutUrl;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Link Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Payment Request</h1>
            <p className="text-muted-foreground">
              from {paymentLink?.merchantName}
            </p>
            {paymentLink?.type === 'quantity_limited' && paymentLink.quantityRemaining !== undefined && (
              <p className="text-sm text-muted-foreground mt-1">
                {paymentLink.quantityRemaining} payments remaining
              </p>
            )}
          </div>

          <div className="bg-muted rounded-lg p-4 mb-6 text-center">
            {paymentLink?.type === 'flexible_amount' ? (
              <>
                <p className="text-sm text-muted-foreground mb-2">Enter Amount</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.5"
                    placeholder="0.00"
                    className="pl-7 text-center text-2xl h-14"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Minimum amount: $0.50</p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-3xl font-bold">
                  {paymentLink?.currency} {paymentLink?.amount?.toFixed(2)}
                </p>
                {paymentLink?.type === 'subscription' && (
                  <p className="text-xs text-muted-foreground mt-1">Monthly recurring</p>
                )}
              </>
            )}
            {paymentLink?.description && (
              <>
                <p className="text-sm text-muted-foreground mt-2">For</p>
                <p className="font-medium">{paymentLink?.description}</p>
              </>
            )}
          </div>

          <Button
            onClick={handlePay}
            disabled={redirecting || (paymentLink?.type === 'flexible_amount' && !customAmount)}
            className="w-full"
            size="lg"
          >
            {redirecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redirecting to payment...
              </>
            ) : (
              'Pay Now'
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Secure payment powered by Stripe. No account required.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
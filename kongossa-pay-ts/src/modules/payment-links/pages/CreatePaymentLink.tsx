import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createPaymentLink } from '../api';
import { dispatchShowToast } from '@/lib/dispatch';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const EXPIRY_OPTIONS = [
  { value: 1, label: '1 day' },
  { value: 2, label: '2 days' },
  { value: 3, label: '3 days' },
  { value: 7, label: '7 days (default)' },
];

export default function CreatePaymentLink() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    description: '',
    expiresInDays: 7,
    customerEmail: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      dispatchShowToast({ type: 'danger', message: 'Please enter a valid amount' });
      return;
    }

    setLoading(true);
    try {
      const result = await createPaymentLink({
        amount,
        description: form.description || undefined,
        expiresInDays: form.expiresInDays,
        customerEmail: form.customerEmail || undefined,
      });
      dispatchShowToast({ type: 'success', message: 'Payment link created!' });
      navigate('/payment-links');
    } catch (err: any) {
      dispatchShowToast({ type: 'danger', message: err.response?.data?.message || 'Failed to create link' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/payment-links')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Create Payment Link</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.5"
                  placeholder="0.00"
                  className="pl-7"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Minimum amount: $0.50</p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What is this payment for? (e.g., Web Design, Course, Consultation)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Expiry */}
            <div>
              <Label htmlFor="expiry">Link Expiry</Label>
              <Select
                value={form.expiresInDays.toString()}
                onValueChange={(val) => setForm({ ...form, expiresInDays: parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select expiry" />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                After expiry, customers cannot make payments using this link.
              </p>
            </div>

            {/* Customer Email (optional) */}
            <div>
              <Label htmlFor="email">Customer Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={form.customerEmail}
                onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pre-fill customer email on Stripe checkout.
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Generate Payment Link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
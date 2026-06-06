// CreatePaymentLink.tsx - FULL UPDATED VERSION
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createPaymentLink } from '../api';
import { dispatchShowToast } from '@/lib/dispatch';
import { ArrowLeft, Calendar, CreditCard, Infinity } from 'lucide-react';
import { format } from 'date-fns';

const EXPIRY_OPTIONS = [
  { value: 1, label: '1 day' },
  { value: 2, label: '2 days' },
  { value: 3, label: '3 days' },
  { value: 7, label: '7 days (default)' },
  { value: 30, label: '30 days' },
  { value: 0, label: 'Never expires' },
];

const LINK_TYPES = [
  { value: 'fixed_amount', label: 'Fixed Amount', description: 'Customer pays a fixed amount' },
  { value: 'flexible_amount', label: 'Flexible Amount', description: 'Customer can enter any amount' },
  { value: 'quantity_limited', label: 'Quantity Limited', description: 'Multiple payments up to a limit' },
  { value: 'subscription', label: 'Subscription', description: 'Recurring payments (daily, weekly, monthly, etc.)' },
];

// NEW: Frequency options
const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily', description: 'Every day' },
  { value: 'weekly', label: 'Weekly', description: 'Every week' },
  { value: 'bi_monthly', label: 'Twice per month', description: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly', description: 'Every month' },
  { value: 'quarterly', label: 'Quarterly', description: 'Every 3 months' },
  { value: 'semiannual', label: 'Semiannual', description: 'Every 6 months' },
  { value: 'annual', label: 'Annual', description: 'Every year' },
  { value: 'custom', label: 'Custom', description: 'Set custom interval' },
];

// NEW: Duration type options
const DURATION_OPTIONS = [
  { value: 'recurring', label: 'Indefinite', description: 'Until canceled', icon: <Infinity className="w-4 h-4" /> },
  { value: 'fixed_term', label: 'Fixed Term', description: 'For a set number of months', icon: <Calendar className="w-4 h-4" /> },
  { value: 'fixed_payments', label: 'Fixed Payments', description: 'For a set number of payments', icon: <CreditCard className="w-4 h-4" /> },
  { value: 'end_date', label: 'Specific End Date', description: 'Until a specific date', icon: <Calendar className="w-4 h-4" /> },
];

export default function CreatePaymentLink() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [linkType, setLinkType] = useState('fixed_amount');
  const [form, setForm] = useState({
    amount: '',
    description: '',
    expiresInDays: 7,
    customerEmail: '',
    quantity: '',
    // NEW subscription fields
    frequency: 'monthly',
    customIntervalDays: 30,
    durationType: 'recurring',
    durationMonths: 3,
    totalPayments: 12,
    endDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountRequired = ['fixed_amount', 'quantity_limited', 'subscription'].includes(linkType);
    if (amountRequired && linkType !== 'subscription') {
      const amount = parseFloat(form.amount);
      if (isNaN(amount) || amount <= 0) {
        dispatchShowToast({ type: 'danger', message: 'Please enter a valid amount' });
        return;
      }
    }

    if (linkType === 'quantity_limited') {
      const quantity = parseInt(form.quantity);
      if (isNaN(quantity) || quantity < 1) {
        dispatchShowToast({ type: 'danger', message: 'Please enter a valid quantity' });
        return;
      }
    }

    // Validate subscription fields
    if (linkType === 'subscription') {
      const amount = parseFloat(form.amount);
      if (isNaN(amount) || amount <= 0) {
        dispatchShowToast({ type: 'danger', message: 'Please enter a valid subscription amount' });
        return;
      }
      
      if (form.durationType === 'fixed_term' && (!form.durationMonths || form.durationMonths < 1)) {
        dispatchShowToast({ type: 'danger', message: 'Please enter valid number of months' });
        return;
      }
      
      if (form.durationType === 'fixed_payments' && (!form.totalPayments || form.totalPayments < 1)) {
        dispatchShowToast({ type: 'danger', message: 'Please enter valid number of payments' });
        return;
      }
      
      if (form.durationType === 'end_date' && !form.endDate) {
        dispatchShowToast({ type: 'danger', message: 'Please select an end date' });
        return;
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        type: linkType,
        description: form.description || undefined,
        expiresInDays: form.expiresInDays === 0 ? undefined : form.expiresInDays,
        customerEmail: form.customerEmail || undefined,
      };

      if (amountRequired) {
        payload.amount = parseFloat(form.amount);
      }

      if (linkType === 'quantity_limited') {
        payload.quantity = parseInt(form.quantity);
      }

      // Add subscription fields
      if (linkType === 'subscription') {
        payload.frequency = form.frequency;
        if (form.frequency === 'custom') {
          payload.customIntervalDays = form.customIntervalDays;
        }
        payload.durationType = form.durationType;
        
        if (form.durationType === 'fixed_term') {
          payload.durationMonths = form.durationMonths;
        } else if (form.durationType === 'fixed_payments') {
          payload.totalPayments = form.totalPayments;
        } else if (form.durationType === 'end_date') {
          payload.endDate = new Date(form.endDate);
        }
      }

      await createPaymentLink(payload);
      dispatchShowToast({ type: 'success', message: 'Payment link created!' });
      navigate('/payment-links');
    } catch (err: any) {
      dispatchShowToast({ type: 'danger', message: err.response?.data?.message || 'Failed to create link' });
    } finally {
      setLoading(false);
    }
  };

  // Helper to render subscription form fields
  const renderSubscriptionFields = () => (
    <div className="space-y-5 mt-6">
      {/* Frequency Selection */}
      <div>
        <Label className="text-gray-700 dark:text-gray-300 mb-2 block">Billing Frequency</Label>
        <RadioGroup
          value={form.frequency}
          onValueChange={(val) => setForm({ ...form, frequency: val })}
          className="space-y-2"
        >
          {FREQUENCY_OPTIONS.map((freq) => (
            <div key={freq.value} className="flex items-start space-x-3 p-3 border rounded-lg dark:border-gray-700">
              <RadioGroupItem value={freq.value} id={`freq-${freq.value}`} className="mt-0.5" />
              <Label htmlFor={`freq-${freq.value}`} className="flex-1 cursor-pointer">
                <div className="font-medium text-gray-900 dark:text-white">{freq.label}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{freq.description}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Custom Interval Days */}
      {form.frequency === 'custom' && (
        <div>
          <Label htmlFor="customIntervalDays" className="text-gray-700 dark:text-gray-300">Interval (days)</Label>
          <Input
            id="customIntervalDays"
            type="number"
            min="1"
            max="365"
            value={form.customIntervalDays}
            onChange={(e) => setForm({ ...form, customIntervalDays: parseInt(e.target.value) || 30 })}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">How many days between each payment?</p>
        </div>
      )}

      {/* Duration Type */}
      <div>
        <Label className="text-gray-700 dark:text-gray-300 mb-2 block">Subscription Duration</Label>
        <RadioGroup
          value={form.durationType}
          onValueChange={(val) => setForm({ ...form, durationType: val })}
          className="space-y-2"
        >
          {DURATION_OPTIONS.map((dur) => (
            <div key={dur.value} className="flex items-start space-x-3 p-3 border rounded-lg dark:border-gray-700">
              <RadioGroupItem value={dur.value} id={`dur-${dur.value}`} className="mt-0.5" />
              <Label htmlFor={`dur-${dur.value}`} className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  {dur.icon}
                  <span className="font-medium text-gray-900 dark:text-white">{dur.label}</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{dur.description}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Fixed Term Months */}
      {form.durationType === 'fixed_term' && (
        <div>
          <Label htmlFor="durationMonths" className="text-gray-700 dark:text-gray-300">Duration (months)</Label>
          <Select
            value={form.durationMonths.toString()}
            onValueChange={(val) => setForm({ ...form, durationMonths: parseInt(val) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 months</SelectItem>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">1 year</SelectItem>
              <SelectItem value="24">2 years</SelectItem>
              <SelectItem value="36">3 years</SelectItem>
              <SelectItem value="60">5 years</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Subscription will automatically end after this period</p>
        </div>
      )}

      {/* Fixed Payments Count */}
      {form.durationType === 'fixed_payments' && (
        <div>
          <Label htmlFor="totalPayments" className="text-gray-700 dark:text-gray-300">Number of Payments</Label>
          <Input
            id="totalPayments"
            type="number"
            min="1"
            max="365"
            placeholder="e.g., 12"
            value={form.totalPayments}
            onChange={(e) => setForm({ ...form, totalPayments: parseInt(e.target.value) || 12 })}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Subscription will end after this many payments</p>
        </div>
      )}

      {/* Specific End Date */}
      {form.durationType === 'end_date' && (
        <div>
          <Label htmlFor="endDate" className="text-gray-700 dark:text-gray-300">End Date</Label>
          <Input
            id="endDate"
            type="date"
            min={format(new Date(), 'yyyy-MM-dd')}
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Subscription will automatically end on this date</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/payment-links')} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Create Payment Link</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-gray-900 dark:text-white">Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            {/* Link Type */}
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Link Type</Label>
              <RadioGroup value={linkType} onValueChange={setLinkType} className="mt-2 space-y-2">
                {LINK_TYPES.map((type) => (
                  <div key={type.value} className="flex items-start space-x-3 p-3 border rounded-lg dark:border-gray-700">
                    <RadioGroupItem value={type.value} id={type.value} className="mt-0.5 cursor-pointer" />
                    <Label htmlFor={type.value} className="flex-1 cursor-pointer">
                      <div className="font-medium text-gray-900 dark:text-white">{type.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{type.description}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Amount - for non-subscription */}
            {['fixed_amount', 'quantity_limited'].includes(linkType) && (
              <div>
                <Label htmlFor="amount" className="text-gray-700 dark:text-gray-300">Amount *</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.5"
                    placeholder="0.00"
                    className="pl-7"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum amount: $0.50</p>
              </div>
            )}

            {/* Amount - for subscription */}
            {linkType === 'subscription' && (
              <div>
                <Label htmlFor="amount" className="text-gray-700 dark:text-gray-300">Payment Amount *</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.5"
                    placeholder="0.00"
                    className="pl-7"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Amount charged for each payment</p>
              </div>
            )}

            {/* Quantity */}
            {linkType === 'quantity_limited' && (
              <div>
                <Label htmlFor="quantity" className="text-gray-700 dark:text-gray-300">Number of payments *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="e.g., 10"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maximum number of times this link can be used
                </p>
              </div>
            )}

            {/* Subscription specific fields */}
            {linkType === 'subscription' && renderSubscriptionFields()}

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What is this payment for? (e.g., Monthly Membership, Course Subscription)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Expiry */}
            <div>
              <Label htmlFor="expiry" className="text-gray-700 dark:text-gray-300">Link Expiry</Label>
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                After expiry, customers cannot make payments using this link.
              </p>
            </div>

            {/* Customer Email */}
            <div>
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Customer Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={form.customerEmail}
                onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
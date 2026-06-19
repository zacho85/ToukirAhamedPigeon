// src/modules/payment-links/pages/PaymentLinksList.tsx - FULLY UPDATED WITH ALL SUBSCRIPTION INFO

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Copy, ExternalLink, Trash2, CheckCircle, Clock, Calendar, Infinity, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getMyPaymentLinks, cancelPaymentLink, type PaymentLink } from '../api';
import { dispatchShowToast } from '@/lib/dispatch';
import { formatDistanceToNow, format } from 'date-fns';

export default function PaymentLinksList() {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const data = await getMyPaymentLinks();
      setLinks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    dispatchShowToast({ type: 'success', message: 'Link copied to clipboard!' });
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this payment link?')) return;
    try {
      await cancelPaymentLink(id);
      await loadLinks();
      dispatchShowToast({ type: 'success', message: 'Payment link cancelled' });
    } catch (err) {
      dispatchShowToast({ type: 'danger', message: 'Failed to cancel' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>;
      case 'paid':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Paid</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Cancelled</Badge>;
      case 'subscription_active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Subscription Active</Badge>;
      case 'subscription_cancelled':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">Subscription Cancelled</Badge>;
      case 'subscription_completed':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Completed</Badge>;
      case 'partially_paid':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Partially Paid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getFrequencyDisplay = (link: PaymentLink): string => {
    if (!link.frequency) return 'Monthly';
    
    switch (link.frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'bi_monthly': return 'Twice monthly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'semiannual': return 'Every 6 months';
      case 'annual': return 'Annual';
      case 'custom': 
        return link.customIntervalDays ? `Every ${link.customIntervalDays} days` : 'Custom interval';
      default: return 'Monthly';
    }
  };

  const getDurationDisplay = (link: PaymentLink): string => {
    if (!link.durationType) return 'Indefinite';
    
    switch (link.durationType) {
      case 'recurring':
        return 'Until canceled 🔄';
      case 'fixed_term':
        return link.durationMonths ? `${link.durationMonths} months` : 'Fixed term';
      case 'fixed_payments':
        return link.totalPayments ? `${link.totalPayments} payments` : 'Fixed payments';
      case 'end_date':
        return link.endDate ? `Until ${format(new Date(link.endDate), 'PPP')}` : 'End date';
      default:
        return 'Indefinite';
    }
  };

  const getAmountDisplay = (link: PaymentLink): string => {
    if (link.type === 'flexible_amount') {
      return 'Flexible Amount';
    }
    if (link.amount !== null && link.amount !== undefined) {
      return `${link.currency} ${link.amount.toFixed(2)}`;
    }
    return `${link.currency} 0.00`;
  };

  // Helper to get duration icon
  const getDurationIcon = (durationType?: string) => {
    switch (durationType) {
      case 'recurring':
        return <Infinity className="w-3 h-3" />;
      case 'fixed_term':
        return <Calendar className="w-3 h-3" />;
      case 'fixed_payments':
        return <CreditCard className="w-3 h-3" />;
      case 'end_date':
        return <Calendar className="w-3 h-3" />;
      default:
        return <Infinity className="w-3 h-3" />;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Payment Links</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage secure payment links</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/payment-links/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Payment Link
          </Link>
        </Button>
      </div>

      {links.length === 0 ? (
        <Card>
          <CardContent className="p-8 md:p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No payment links yet</p>
            <Button asChild variant="outline">
              <Link to="/payment-links/create">Create your first payment link</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:gap-4">
          {links.map((link) => (
            <Card key={link.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                  {/* Left section - Link details */}
                  <div className="flex-1 space-y-2">
                    {/* Status and Amount */}
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(link.status)}
                      <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                        {getAmountDisplay(link)}
                      </span>
                    </div>

                    {/* Description */}
                    {link.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
                        {link.description}
                      </p>
                    )}
                    
                    {/* ============================================================
                        SUBSCRIPTION INFO - FULL DETAILS
                        ============================================================ */}
                    {link.type === 'subscription' && link.frequency && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-1.5 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Subscription Details:</span>
                        </div>
                        
                        {/* Frequency */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Frequency:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{getFrequencyDisplay(link)}</span>
                        </div>
                        
                        {/* Duration - THIS IS THE KEY FIX */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                          <div className="flex items-center gap-1">
                            {getDurationIcon(link.durationType)}
                            <span className={`font-medium ${
                              link.durationType === 'recurring' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {getDurationDisplay(link)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Payments progress (for fixed payments) */}
                        {(link.durationType === 'fixed_payments' && link.totalPayments) && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Payments:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {link.paymentsMade || 0} of {link.totalPayments} made
                            </span>
                            <div className="flex-1 max-w-[100px] ml-2">
                              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full transition-all"
                                  style={{ width: `${((link.paymentsMade || 0) / link.totalPayments) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* End date (for end_date type) */}
                        {link.durationType === 'end_date' && link.endDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Ends on:</span>
                            <span className="font-medium text-orange-600 dark:text-orange-400">
                              {format(new Date(link.endDate), 'PPP')}
                            </span>
                          </div>
                        )}
                        
                        {/* Link Expiry (separate from subscription duration) */}
                        {link.expiresAt && (
                          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                            <Clock className="w-3 h-3" />
                            <span>Payment link expires: {format(new Date(link.expiresAt), 'PPP')}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quantity limited info */}
                    {link.type === 'quantity_limited' && link.quantityTotal && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Usage:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {link.quantityUsed || 0} of {link.quantityTotal} used
                          </span>
                          <div className="flex-1 max-w-[100px] ml-2">
                            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-yellow-500 rounded-full transition-all"
                                style={{ width: `${((link.quantityUsed || 0) / link.quantityTotal) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Created and Link Expiry (if not already shown) */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Created {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                      </span>
                      {link.type !== 'subscription' && link.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires {format(new Date(link.expiresAt), 'PPP')}
                        </span>
                      )}
                    </div>

                    {/* URL with copy button */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded break-all flex-1 min-w-[150px]">
                        {link.paymentUrl}
                      </code>
                      <Button size="sm" variant="ghost" onClick={() => handleCopyUrl(link.paymentUrl)} className="shrink-0">
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" asChild className="shrink-0">
                        <a href={link.paymentUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Right section - Actions */}
                  <div className="flex flex-row md:flex-col justify-end items-center gap-2 md:justify-start">
                    {(link.status === 'active' || link.status === 'subscription_active') && (
                      <Button variant="ghost" size="sm" onClick={() => handleCancel(link.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                    {(link.status === 'paid' || link.status === 'subscription_completed') && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
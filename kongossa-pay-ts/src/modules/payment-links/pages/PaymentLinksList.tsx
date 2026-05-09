import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Copy, ExternalLink, Trash2, CheckCircle, Clock } from 'lucide-react';
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
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header - Responsive */}
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
                {/* Mobile: Column layout, Desktop: Row layout */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                  {/* Left section - Link details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(link.status)}
                      <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                        {link.currency} {link.amount.toFixed(2)}
                      </span>
                    </div>

                    {link.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
                        {link.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Created {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                      </span>
                      {link.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires {format(new Date(link.expiresAt), 'PPP')}
                        </span>
                      )}
                    </div>

                    {/* URL with copy button - responsive */}
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
                    {link.status === 'active' && (
                      <Button variant="ghost" size="sm" onClick={() => handleCancel(link.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                    {link.status === 'paid' && (
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
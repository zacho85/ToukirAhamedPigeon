import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Copy, ExternalLink, Trash2, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'paid':
        return <Badge className="bg-blue-100 text-blue-800">Paid</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Payment Links</h1>
          <p className="text-muted-foreground">Create and manage secure payment links</p>
        </div>
        <Button asChild>
          <Link to="/payment-links/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Payment Link
          </Link>
        </Button>
      </div>

      {links.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No payment links yet</p>
            <Button asChild variant="outline">
              <Link to="/payment-links/create">Create your first payment link</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {links.map((link) => (
            <Card key={link.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(link.status)}
                      <span className="text-2xl font-bold">
                        {link.currency} {link.amount.toFixed(2)}
                      </span>
                    </div>

                    {link.description && (
                      <p className="text-muted-foreground">{link.description}</p>
                    )}

                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Created {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                      </div>
                      {link.expiresAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires {format(new Date(link.expiresAt), 'PPP')}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted p-1 rounded">{link.paymentUrl}</code>
                      <Button size="sm" variant="ghost" onClick={() => handleCopyUrl(link.paymentUrl)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={link.paymentUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  {link.status === 'active' && (
                    <Button variant="ghost" size="sm" onClick={() => handleCancel(link.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}

                  {link.status === 'paid' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
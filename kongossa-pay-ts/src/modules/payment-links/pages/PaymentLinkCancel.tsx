// PaymentLinkCancel.tsx
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentLinkCancel() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center">
          <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Cancelled</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You cancelled the payment. No charges were made.
          </p>
          <Button asChild variant="outline">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
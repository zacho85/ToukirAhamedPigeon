import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound, Copy, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ApiAccess() {
    const apiKey = "kp_live_********************abcd";
    const secretKey = "ks_live_********************wxyz";

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const codeSnippet = `const kongossa = require('kongossapay');
const client = kongossa({ apiKey: '${apiKey}' });

async function createCharge() {
  try {
    const charge = await client.charges.create({
      amount: 1000,
      currency: 'USD',
      source: 'tok_visa',
      description: 'Charge for jenny.rosen@example.com'
    });
    console.log(charge);
  } catch (error) {
    console.error(error);
  }
}

createCharge();`;

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Developer API & Payment Gateway</h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        Integrate KongossaPay into your applications with our powerful and easy-to-use REST API.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* API Keys */}
                    <div className="lg:col-span-1 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5" /> API Keys</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Publishable Key</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <pre className="text-sm p-2 bg-slate-100 rounded-md flex-1 overflow-x-auto">{apiKey}</pre>
                                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiKey)}><Copy className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Secret Key</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <pre className="text-sm p-2 bg-slate-100 rounded-md flex-1 overflow-x-auto">{secretKey}</pre>
                                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(secretKey)}><Copy className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-2 text-sm text-slate-500">
                                    <ShieldCheck className="w-5 h-5 text-green-600" />
                                    <span>Your secret keys are safe. They are not stored in plaintext.</span>
                                </div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Webhooks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600 text-sm mb-4">Configure webhooks to receive real-time notifications for events like successful payments, refunds, and more.</p>
                                <Button variant="outline" className="w-full">Configure Webhooks</Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Code Example */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Example: Create a Payment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-slate-900 rounded-lg p-4 text-sm text-white font-mono relative">
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white hover:bg-slate-700" onClick={() => copyToClipboard(codeSnippet)}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                    <pre className="overflow-x-auto">{codeSnippet}</pre>
                                </div>
                                <div className="mt-4 flex gap-4">
                                    <Button>View Full Documentation</Button>
                                    <Button variant="secondary">Go to Sandbox</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
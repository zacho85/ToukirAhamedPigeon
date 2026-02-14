import React, { useState, useEffect } from 'react';
// import { SystemSettings } from '@/api/entities';
import { getSystemSettings, updateSystemSettings, createSystemSettings } from '@/api/systemSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Percent, Settings } from 'lucide-react';

export default function AdminFeeManagement() {
    const [settings, setSettings] = useState({
        transfer_fee_percent: 1.5,
        withdrawal_fee_flat: 2.50,
        forex_markup_percent: 2.0,
        crypto_markup_percent: 2.5,
        tontine_fee_percent: 0.5
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const systemSettings = await getSystemSettings();
            if (systemSettings.length > 0) {
                setSettings(systemSettings[0]);
            }
        } catch (error) {
            console.error("Error loading settings:", error);
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const existing = await getSystemSettings();
            if (existing.length > 0) {
                await updateSystemSettings(existing[0].id, settings);
            } else {
                await createSystemSettings(settings);
            }
            alert('Settings saved successfully!');
        } catch (error) {
            console.error("Error saving settings:", error);
            alert('Failed to save settings.');
        }
        setIsSaving(false);
    };

    const handleInputChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: parseFloat(value) || 0
        }));
    };

    if (isLoading) {
        return <div className="p-6">Loading settings...</div>;
    }

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-blue-600" />
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Fee Management</h1>
                    <p className="text-slate-600">Configure platform fees and commissions</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Transfer & Withdrawal Fees */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Transfer & Withdrawal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="transfer_fee">Money Transfer Fee (%)</Label>
                            <div className="relative">
                                <Input
                                    id="transfer_fee"
                                    type="number"
                                    step="0.1"
                                    value={settings.transfer_fee_percent}
                                    onChange={(e) => handleInputChange('transfer_fee_percent', e.target.value)}
                                    className="pr-8"
                                />
                                <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                            <p className="text-xs text-slate-500">Fee charged for money transfers</p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="withdrawal_fee">Withdrawal Fee (Flat Rate)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    id="withdrawal_fee"
                                    type="number"
                                    step="0.25"
                                    value={settings.withdrawal_fee_flat}
                                    onChange={(e) => handleInputChange('withdrawal_fee_flat', e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <p className="text-xs text-slate-500">Fixed fee for withdrawals</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Exchange Fees */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Percent className="w-5 h-5 text-blue-600" />
                            Exchange Markups
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="forex_markup">Forex Markup (%)</Label>
                            <div className="relative">
                                <Input
                                    id="forex_markup"
                                    type="number"
                                    step="0.1"
                                    value={settings.forex_markup_percent}
                                    onChange={(e) => handleInputChange('forex_markup_percent', e.target.value)}
                                    className="pr-8"
                                />
                                <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                            <p className="text-xs text-slate-500">Markup on currency exchange rates</p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="crypto_markup">Crypto Markup (%)</Label>
                            <div className="relative">
                                <Input
                                    id="crypto_markup"
                                    type="number"
                                    step="0.1"
                                    value={settings.crypto_markup_percent}
                                    onChange={(e) => handleInputChange('crypto_markup_percent', e.target.value)}
                                    className="pr-8"
                                />
                                <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                            <p className="text-xs text-slate-500">Markup on cryptocurrency trades</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Tontine Fees */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-purple-600" />
                            Tontine & Investment Fees
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="tontine_fee">Tontine Management Fee (%)</Label>
                            <div className="relative">
                                <Input
                                    id="tontine_fee"
                                    type="number"
                                    step="0.1"
                                    value={settings.tontine_fee_percent}
                                    onChange={(e) => handleInputChange('tontine_fee_percent', e.target.value)}
                                    className="pr-8"
                                />
                                <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                            <p className="text-xs text-slate-500">Fee charged for tontine management and payouts</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Preview Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Fee Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3 text-sm">
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="font-medium">$100 Transfer</p>
                            <p className="text-slate-600">Fee: ${(100 * settings.transfer_fee_percent / 100).toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="font-medium">$1000 Forex</p>
                            <p className="text-slate-600">Markup: ${(1000 * settings.forex_markup_percent / 100).toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="font-medium">Withdrawal</p>
                            <p className="text-slate-600">Fee: ${settings.withdrawal_fee_flat.toFixed(2)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
}
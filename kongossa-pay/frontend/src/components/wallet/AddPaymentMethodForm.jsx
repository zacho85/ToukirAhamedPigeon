import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function AddPaymentMethodForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    type: '',
    provider: '',
    account_name: '',
    account_number: '',
    bank_name: '',
    expiry_date: '',
    is_default: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      last_four: formData.account_number.slice(-4),
      is_verified: false
    };
    onSubmit(processedData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Payment Method Type</Label>
        <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="debit_card">Debit Card</SelectItem>
            <SelectItem value="bank_account">Bank Account</SelectItem>
            <SelectItem value="mobile_money">Mobile Money</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
            <SelectItem value="google_pay">Google Pay</SelectItem>
            <SelectItem value="apple_pay">Apple Pay</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="account_name">Account Holder Name</Label>
        <Input
          id="account_name"
          value={formData.account_name}
          onChange={(e) => handleInputChange('account_name', e.target.value)}
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <Label htmlFor="account_number">
          {formData.type.includes('card') ? 'Card Number' : 
           formData.type === 'paypal' ? 'PayPal Email' :
           formData.type === 'mobile_money' ? 'Phone Number' : 'Account Number'}
        </Label>
        <Input
          id="account_number"
          value={formData.account_number}
          onChange={(e) => handleInputChange('account_number', e.target.value)}
          placeholder={
            formData.type.includes('card') ? '1234 5678 9012 3456' :
            formData.type === 'paypal' ? 'your@email.com' :
            formData.type === 'mobile_money' ? '+1 234 567 8900' : 'Account number'
          }
          required
        />
      </div>

      {formData.type === 'bank_account' && (
        <div>
          <Label htmlFor="bank_name">Bank Name</Label>
          <Input
            id="bank_name"
            value={formData.bank_name}
            onChange={(e) => handleInputChange('bank_name', e.target.value)}
            placeholder="Bank of America"
          />
        </div>
      )}

      {formData.type.includes('card') && (
        <div>
          <Label htmlFor="expiry_date">Expiry Date</Label>
          <Input
            id="expiry_date"
            value={formData.expiry_date}
            onChange={(e) => handleInputChange('expiry_date', e.target.value)}
            placeholder="MM/YY"
          />
        </div>
      )}

      <div>
        <Label htmlFor="provider">Provider</Label>
        <Input
          id="provider"
          value={formData.provider}
          onChange={(e) => handleInputChange('provider', e.target.value)}
          placeholder={
            formData.type.includes('card') ? 'Visa, Mastercard, etc.' :
            formData.type === 'mobile_money' ? 'MTN, Orange, etc.' :
            formData.type === 'paypal' ? 'PayPal' :
            formData.type === 'google_pay' ? 'Google Pay' :
            formData.type === 'apple_pay' ? 'Apple Pay' : 'Provider name'
          }
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="is_default"
          checked={formData.is_default}
          onCheckedChange={(checked) => handleInputChange('is_default', checked)}
        />
        <Label htmlFor="is_default">Set as default payment method</Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
          Add Method
        </Button>
      </div>
    </form>
  );
}
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Tontine } from '@/api/entities';
import { createTontine } from '@/api/tontines';

export default function CreateTontineDialog({ isOpen, onClose, onTontineCreated, user }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'friends',
    contribution_amount: '',
    contribution_frequency: 'monthly',
    max_members: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to create a tontine.");
      return;
    }
    setIsCreating(true);
    try {
      await createTontine({
        ...formData,
        contribution_amount: parseFloat(formData.contribution_amount),
        max_members: parseInt(formData.max_members, 10),
        creator_id: user.id,
        members: [user.id],
      });
      onTontineCreated();
    } catch (error) {
      console.error("Failed to create tontine:", error);
      alert("There was an error creating the tontine. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a New E-Tontine</DialogTitle>
          <DialogDescription>
            Fill in the details below to start a new savings circle with your community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Tontine Name</Label>
            <Input id="name" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="e.g., Family Vacation Fund" required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} placeholder="A short description of your tontine's goal." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contribution_amount">Contribution Amount ($)</Label>
              <Input id="contribution_amount" type="number" value={formData.contribution_amount} onChange={e => handleInputChange('contribution_amount', e.target.value)} placeholder="100" required />
            </div>
            <div>
              <Label htmlFor="contribution_frequency">Frequency</Label>
              <Select value={formData.contribution_frequency} onValueChange={value => handleInputChange('contribution_frequency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_members">Max Members</Label>
              <Input id="max_members" type="number" value={formData.max_members} onChange={e => handleInputChange('max_members', e.target.value)} placeholder="12" required />
            </div>
            <div>
              <Label htmlFor="type">Tontine Type</Label>
              <Select value={formData.type} onValueChange={value => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friends">Friends</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isCreating}>Cancel</Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Tontine'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
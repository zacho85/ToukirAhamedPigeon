import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BudgetForm, 
  BudgetCategoryForm, 
  ExpenseForm, 
  TontineForm, 
  TontineInviteForm,
  TontineContributionForm,
  TontineMemberForm 
} from './index';
import { Badge } from '@/components/ui/badge';

// Mock data for examples
const mockBudgetCategories = [
  { id: 1, budget_id: 1, name: 'Food & Dining', color: '#ef4444', limit_amount: 500, created_at: '', updated_at: '' },
  { id: 2, budget_id: 1, name: 'Transportation', color: '#3b82f6', limit_amount: 200, created_at: '', updated_at: '' },
  { id: 3, budget_id: 1, name: 'Entertainment', color: '#8b5cf6', limit_amount: 150, created_at: '', updated_at: '' },
];

const mockTontine = {
  id: 1,
  name: 'Family Emergency Fund',
  type: 'family' as const,
  contribution_amount: 100,
  frequency: 'monthly' as const,
};

const mockTontineMember = {
  id: 1,
  user: { name: 'John Doe', email: 'john@example.com' },
  tontine: mockTontine,
};

const mockAvailableUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
  { id: 3, name: 'Carol Brown', email: 'carol@example.com' },
];

export function FormExamples() {
  const [activeForm, setActiveForm] = useState<string | null>(null);

  const handleSuccess = () => {
    console.log('Form submitted successfully!');
    setActiveForm(null);
  };

  const handleCancel = () => {
    setActiveForm(null);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Kongossa Pay Form Components</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Complete data collection forms built with React, TypeScript, shadcn/ui, and Tailwind CSS
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary">React 18</Badge>
          <Badge variant="secondary">TypeScript</Badge>
          <Badge variant="secondary">shadcn/ui</Badge>
          <Badge variant="secondary">Tailwind CSS</Badge>
          <Badge variant="secondary">Inertia.js</Badge>
        </div>
      </div>

      <Tabs defaultValue="budget" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="budget">Budget Forms</TabsTrigger>
          <TabsTrigger value="expense">Expense Forms</TabsTrigger>
          <TabsTrigger value="tontine">Tontine Forms</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="budget" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Budget Form</CardTitle>
                <CardDescription>
                  Create and edit budgets with period selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setActiveForm('budget')}
                  className="w-full"
                >
                  Try Budget Form
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Category Form</CardTitle>
                <CardDescription>
                  Manage budget categories with color selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setActiveForm('budgetCategory')}
                  className="w-full"
                >
                  Try Category Form
                </Button>
              </CardContent>
            </Card>
          </div>

          {activeForm === 'budget' && (
            <BudgetForm 
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}

          {activeForm === 'budgetCategory' && (
            <BudgetCategoryForm 
              budgetId={1}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </TabsContent>

        <TabsContent value="expense" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Form</CardTitle>
              <CardDescription>
                Record and track expenses with category assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setActiveForm('expense')}
                className="w-full"
              >
                Try Expense Form
              </Button>
            </CardContent>
          </Card>

          {activeForm === 'expense' && (
            <ExpenseForm 
              budgetCategories={mockBudgetCategories}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </TabsContent>

        <TabsContent value="tontine" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tontine Form</CardTitle>
                <CardDescription>
                  Create and configure tontines with type selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setActiveForm('tontine')}
                  className="w-full"
                >
                  Try Tontine Form
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invite Form</CardTitle>
                <CardDescription>
                  Send invitations to join tontines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setActiveForm('invite')}
                  className="w-full"
                >
                  Try Invite Form
                </Button>
              </CardContent>
            </Card>
          </div>

          {activeForm === 'tontine' && (
            <TontineForm 
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}

          {activeForm === 'invite' && (
            <TontineInviteForm 
              tontine={mockTontine}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contribution Form</CardTitle>
                <CardDescription>
                  Record member contributions with status tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setActiveForm('contribution')}
                  className="w-full"
                >
                  Try Contribution Form
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Member Management</CardTitle>
                <CardDescription>
                  Manage tontine members and administrative privileges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setActiveForm('member')}
                  className="w-full"
                >
                  Try Member Form
                </Button>
              </CardContent>
            </Card>
          </div>

          {activeForm === 'contribution' && (
            <TontineContributionForm 
              tontineMember={mockTontineMember}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}

          {activeForm === 'member' && (
            <TontineMemberForm 
              tontine={mockTontine}
              availableUsers={mockAvailableUsers}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

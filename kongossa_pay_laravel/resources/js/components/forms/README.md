# Form Components

This directory contains all the data collection forms for the Kongossa Pay application, built with React, TypeScript, shadcn/ui, and Tailwind CSS.

## Components Overview

### Budget Management Forms
- **`BudgetForm`** - Create and edit budgets with period selection
- **`BudgetCategoryForm`** - Manage budget categories with color selection
- **`ExpenseForm`** - Record and track expenses with category assignment

### Tontine System Forms
- **`TontineForm`** - Create and configure tontines with type selection
- **`TontineInviteForm`** - Send invitations to join tontines
- **`TontineContributionForm`** - Record member contributions with status tracking
- **`TontineMemberForm`** - Manage tontine members and administrative privileges

### Utility Components
- **`ColorPicker`** - Color selection for categorization
- **`useForm`** - Custom hook for form state management with Inertia.js integration

## Features

### Design & UX
- ✅ **Modern shadcn/ui Components** - Beautiful, accessible design system
- ✅ **Responsive Layout** - Mobile-first design with grid layouts
- ✅ **Dark Mode Support** - Full dark/light theme compatibility
- ✅ **Interactive Previews** - Real-time form data visualization
- ✅ **Loading States** - Proper feedback during form submission
- ✅ **Error Handling** - Comprehensive validation and error display

### Form Management
- ✅ **TypeScript Types** - Full type safety for all form data
- ✅ **Real-time Validation** - Immediate feedback on user input
- ✅ **Dirty State Tracking** - Detect unsaved changes
- ✅ **Auto-save Capabilities** - Draft state management
- ✅ **Server-side Integration** - Seamless Laravel backend communication

### Data Collection Features
- ✅ **Smart Defaults** - Pre-populated reasonable values
- ✅ **Conditional Fields** - Dynamic form fields based on selections
- ✅ **Data Relationships** - Proper foreign key handling
- ✅ **Bulk Operations** - Multiple record management
- ✅ **Import/Export** - Data portability features

## Usage Examples

### Basic Budget Creation
\`\`\`tsx
import { BudgetForm } from '@/components/forms';

function CreateBudgetPage() {
  return (
    <BudgetForm 
      onSuccess={() => {
        // Handle successful creation
        router.visit('/budgets');
      }}
    />
  );
}
\`\`\`

### Edit Existing Budget
\`\`\`tsx
import { BudgetForm } from '@/components/forms';

function EditBudgetPage({ budget }) {
  return (
    <BudgetForm 
      budget={budget}
      onSuccess={() => {
        // Handle successful update
        router.visit('/budgets');
      }}
      onCancel={() => {
        router.visit('/budgets');
      }}
    />
  );
}
\`\`\`

### Expense Form with Category Pre-selection
\`\`\`tsx
import { ExpenseForm } from '@/components/forms';

function AddExpensePage({ budgetCategoryId, budgetCategories }) {
  return (
    <ExpenseForm 
      budgetCategoryId={budgetCategoryId}
      budgetCategories={budgetCategories}
      onSuccess={() => {
        // Handle successful expense creation
        router.visit('/expenses');
      }}
    />
  );
}
\`\`\`

### Tontine Creation with Type Selection
\`\`\`tsx
import { TontineForm } from '@/components/forms';

function CreateTontinePage() {
  return (
    <TontineForm 
      onSuccess={() => {
        // Handle successful tontine creation
        router.visit('/tontines');
      }}
    />
  );
}
\`\`\`

## Form Validation

All forms include comprehensive validation:

### Client-side Validation
- Required field checking
- Data type validation (email, number, date)
- Range validation (min/max values)
- Pattern matching (color codes, etc.)

### Server-side Integration
- Laravel Form Request validation
- Real-time error display
- Field-specific error messages
- Validation state preservation

## Styling Guidelines

### Color System
- Primary actions: Blue (`bg-blue-600`)
- Success states: Green (`bg-green-600`)
- Warning states: Orange (`bg-orange-600`)
- Error states: Red (`bg-red-600`)
- Neutral states: Gray (`bg-gray-600`)

### Component Structure
- Cards for form containers
- Grid layouts for responsive design
- Proper spacing with Tailwind classes
- Consistent typography scaling

## Accessibility

All forms follow WCAG 2.1 guidelines:
- ✅ Proper label associations
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Focus management
- ✅ Error announcement
- ✅ High contrast support

## Performance

### Optimization Features
- Lazy component loading
- Debounced validation
- Minimal re-renders
- Efficient state updates
- Memoized calculations

## Integration with Backend

All forms are designed to work seamlessly with the Laravel backend:

### API Endpoints
- `POST /budgets` - Create budget
- `PUT /budgets/{id}` - Update budget
- `POST /budgets/{id}/categories` - Create category
- `POST /tontines` - Create tontine
- `POST /tontines/{id}/invites` - Send invitation

### Data Flow
1. Form submission triggers Inertia.js request
2. Laravel validates using Form Requests
3. Service layer processes business logic
4. Response returns Resources/Collections
5. Frontend updates with new data

## Future Enhancements

### Planned Features
- [ ] Multi-step form wizard
- [ ] File upload support
- [ ] Bulk import/export
- [ ] Form templates
- [ ] Auto-save drafts
- [ ] Offline support
- [ ] Form analytics

### Performance Improvements
- [ ] Virtual scrolling for large lists
- [ ] Background form validation
- [ ] Predictive loading
- [ ] Cache optimization

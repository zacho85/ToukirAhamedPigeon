<?php

namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Check if the expense belongs to the authenticated user
        return $this->route('expense')->budgetCategory->budget->user_id === auth()->id();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'amount' => ['sometimes', 'numeric', 'min:0.01', 'max:999999.99'],
            'expense_date' => ['sometimes', 'date', 'before_or_equal:today'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.max' => 'Expense title cannot exceed 255 characters.',
            'amount.numeric' => 'Amount must be a valid number.',
            'amount.min' => 'Amount must be greater than 0.',
            'amount.max' => 'Amount cannot exceed 999,999.99.',
            'expense_date.date' => 'Expense date must be a valid date.',
            'expense_date.before_or_equal' => 'Expense date cannot be in the future.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->has('amount')) {
                $expense = $this->route('expense');
                $category = $expense->budgetCategory;
                $currentSpent = $category->total_spent - $expense->amount;
                $newAmount = $this->input('amount');

                if (($currentSpent + $newAmount) > $category->limit_amount) {
                    $validator->warnings()->add(
                        'amount',
                        'This expense will exceed the category limit.'
                    );
                }
            }
        });
    }
}

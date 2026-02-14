<?php

namespace App\Http\Requests\BudgetCategory;

use Illuminate\Foundation\Http\FormRequest;

class StoreBudgetCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Check if the budget belongs to the authenticated user
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'budget_id' => 'required|exists:budgets,id',
            'name' => ['required', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:20', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'limit_amount' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'description' => 'required|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Category name is required.',
            'name.max' => 'Category name cannot exceed 255 characters.',
            'color.regex' => 'Color must be a valid hex color code (e.g., #FF0000).',
            'color.max' => 'Color code cannot exceed 20 characters.',
            'limit_amount.required' => 'Limit amount is required.',
            'limit_amount.numeric' => 'Limit amount must be a valid number.',
            'limit_amount.min' => 'Limit amount must be greater than 0.',
            'limit_amount.max' => 'Limit amount cannot exceed 999,999.99.',
        ];
    }
}

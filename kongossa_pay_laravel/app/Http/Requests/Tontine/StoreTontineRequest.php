<?php

namespace App\Http\Requests\Tontine;

use App\Enums\FrequencyEnums;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTontineRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
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
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:friends,family,savings,investment'],
            'contribution_amount' => ['required', 'numeric', 'min:1', 'max:999999.99'],
            'frequency' => ['required', Rule::enum(FrequencyEnums::class)],
            'duration_months' => ['required', 'integer', 'min:1', 'max:120'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Tontine name is required.',
            'name.max' => 'Tontine name cannot exceed 255 characters.',
            'type.required' => 'Tontine type is required.',
            'type.in' => 'Tontine type must be one of: friends, family, savings, investment.',
            'contribution_amount.required' => 'Contribution amount is required.',
            'contribution_amount.numeric' => 'Contribution amount must be a valid number.',
            'contribution_amount.min' => 'Contribution amount must be at least 1.',
            'contribution_amount.max' => 'Contribution amount cannot exceed 999,999.99.',
            'frequency.required' => 'Contribution frequency is required.',
            'frequency.enum' => 'Frequency must be weekly or monthly.',
            'duration_months.required' => 'Duration in months is required.',
            'duration_months.integer' => 'Duration must be a whole number.',
            'duration_months.min' => 'Duration must be at least 1 month.',
            'duration_months.max' => 'Duration cannot exceed 120 months (10 years).',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'contribution_amount' => 'contribution amount',
            'duration_months' => 'duration',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'created_by' => auth()->id(),
        ]);
    }
}

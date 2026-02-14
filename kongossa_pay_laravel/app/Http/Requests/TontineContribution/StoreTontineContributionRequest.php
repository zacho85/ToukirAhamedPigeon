<?php

namespace App\Http\Requests\TontineContribution;

use Illuminate\Foundation\Http\FormRequest;

class StoreTontineContributionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $member = $this->route('tontineMember');

        // Only the member themselves or tontine admins can record contributions
        return $member->user_id === auth()->id() ||
            $member->tontine->members()->where('user_id', auth()->id())->where('is_admin', true)->exists();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999.99'],
            'contribution_date' => ['required', 'date', 'before_or_equal:today'],
            'status' => ['sometimes', 'string', 'in:pending,paid,late'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'amount.required' => 'Contribution amount is required.',
            'amount.numeric' => 'Amount must be a valid number.',
            'amount.min' => 'Amount must be greater than 0.',
            'amount.max' => 'Amount cannot exceed 999,999.99.',
            'contribution_date.required' => 'Contribution date is required.',
            'contribution_date.date' => 'Contribution date must be a valid date.',
            'contribution_date.before_or_equal' => 'Contribution date cannot be in the future.',
            'status.in' => 'Status must be pending, paid, or late.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'contribution_date' => 'contribution date',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $member = $this->route('tontineMember');
            $expectedAmount = $member->tontine->contribution_amount;
            $providedAmount = $this->input('amount');

            // Warn if amount doesn't match expected contribution
            if ($providedAmount != $expectedAmount) {
                $validator->warnings()->add(
                    'amount',
                    "Expected contribution amount is {$expectedAmount}."
                );
            }

            // Check for duplicate contribution on the same date
            $existingContribution = $member->contributions()
                ->whereDate('contribution_date', $this->input('contribution_date'))
                ->exists();

            if ($existingContribution) {
                $validator->errors()->add(
                    'contribution_date',
                    'A contribution for this date already exists.'
                );
            }
        });
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Default status to pending if not provided
        if (!$this->has('status')) {
            $this->merge(['status' => 'pending']);
        }
    }
}

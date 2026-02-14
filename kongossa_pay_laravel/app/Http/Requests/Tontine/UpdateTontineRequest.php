<?php

namespace App\Http\Requests\Tontine;

use App\Enums\FrequencyEnums;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTontineRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $tontine = $this->route('tontine');

        // Only creator or admin members can update tontine
        return $tontine->created_by === auth()->id() ||
            $tontine->members()->where('user_id', auth()->id())->where('is_admin', true)->exists();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'string', 'in:friends,family,savings,investment'],
            'contribution_amount' => ['sometimes', 'numeric', 'min:1', 'max:999999.99'],
            'frequency' => ['sometimes', Rule::enum(FrequencyEnums::class)],
            'duration_months' => ['sometimes', 'integer', 'min:1', 'max:120'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.max' => 'Tontine name cannot exceed 255 characters.',
            'type.in' => 'Tontine type must be one of: friends, family, savings, investment.',
            'contribution_amount.numeric' => 'Contribution amount must be a valid number.',
            'contribution_amount.min' => 'Contribution amount must be at least 1.',
            'contribution_amount.max' => 'Contribution amount cannot exceed 999,999.99.',
            'frequency.enum' => 'Frequency must be weekly or monthly.',
            'duration_months.integer' => 'Duration must be a whole number.',
            'duration_months.min' => 'Duration must be at least 1 month.',
            'duration_months.max' => 'Duration cannot exceed 120 months (10 years).',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $tontine = $this->route('tontine');

            // Prevent changes if tontine has started and has contributions
            if ($tontine->contributions()->exists()) {
                if ($this->has('contribution_amount') || $this->has('frequency')) {
                    $validator->errors()->add(
                        'general',
                        'Cannot modify contribution amount or frequency after contributions have been made.'
                    );
                }
            }
        });
    }
}

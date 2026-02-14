<?php

namespace App\Http\Requests\User;

use App\Enums\UserTypeEnums;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class UpdateUserRequest extends FormRequest
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
        $userId = $this->route('user')->id ?? $this->user()->id;

        return [
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($userId),
            ],
            'phone' => [
                'sometimes',
                'required',
                'string',
                'max:15',
                Rule::unique(User::class)->ignore($userId),
            ],
            'user_type' => ['sometimes', 'required', 'string', Rule::in(UserTypeEnums::getValues())],
            'password' => ['sometimes', 'confirmed', Rules\Password::defaults()],
            'status' => 'sometimes|in:active,inactive',
            'role' => 'sometimes|exists:roles,name',

            // Business fields
            'company_name' => ['sometimes', 'string', 'max:255', Rule::requiredIf(fn() => $this->user_type === UserTypeEnums::BUSINESS->value)],
            'company_legal_form' => ['sometimes', 'string', 'max:100', Rule::requiredIf(fn() => $this->user_type === UserTypeEnums::BUSINESS->value)],
            'manager_name' => ['sometimes', 'string', 'max:255', Rule::requiredIf(fn() => $this->user_type === UserTypeEnums::BUSINESS->value)],
            'company_phone' => ['sometimes', 'string', 'max:20', Rule::requiredIf(fn() => $this->user_type === UserTypeEnums::BUSINESS->value)],
            'company_address' => ['sometimes', 'string', 'max:500', Rule::requiredIf(fn() => $this->user_type === UserTypeEnums::BUSINESS->value)],
            'legal_form_document' => ['sometimes', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'business_description' => ['sometimes', 'string', 'max:1000', Rule::requiredIf(fn() => $this->user_type === UserTypeEnums::BUSINESS->value)],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'legal_form_document.mimes' => 'Legal form document must be a PDF, JPG, JPEG, or PNG file.',
            'legal_form_document.max' => 'Legal form document must not be larger than 5MB.',
            'company_name.required' => 'Company name is required for business accounts.',
            'company_legal_form.required' => 'Company legal form is required for business accounts.',
            'manager_name.required' => 'Manager name is required for business accounts.',
            'company_phone.required' => 'Company phone is required for business accounts.',
            'company_address.required' => 'Company address is required for business accounts.',
            'business_description.required' => 'Business description is required for business accounts.',
        ];
    }
}

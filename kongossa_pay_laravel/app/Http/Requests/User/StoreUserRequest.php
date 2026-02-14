<?php

namespace App\Http\Requests\User;

use App\Enums\UserTypeEnums;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class StoreUserRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'phone' => 'required|string|max:15|unique:' . User::class,
            'user_type' => ['required', 'string', Rule::in(UserTypeEnums::getValues())],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],

            // Business fields
            'company_name' => ['string', 'max:255', Rule::requiredIf(fn() => $this->user_type === UserTypeEnums::BUSINESS->value)],
            'company_legal_form' => ['string', 'max:100', Rule::requiredIf(fn() => $this->user_type === UserTypeEnums::BUSINESS->value)],
            'manager_name' => ['string', 'max:255', Rule::requiredIf(fn() => $this->user_type === UserTypeEnums::BUSINESS->value)],
            'company_phone' => ['string', 'max:20', Rule::requiredIf(fn() => $this->user_type === UserTypeEnums::BUSINESS->value)],
            'company_address' => ['string', 'max:500', Rule::requiredIf(fn() => $this->user_type === UserTypeEnums::BUSINESS->value)],
            'legal_form_document' => ['file', 'mimes:pdf,jpg,jpeg,png', 'max:5120', Rule::requiredIf(fn() => $this->user_type === UserTypeEnums::BUSINESS->value)],
            'business_description' => ['string', 'max:1000', Rule::requiredIf(fn() => $this->user_type === UserTypeEnums::BUSINESS->value)],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'legal_form_document.required' => 'Legal form document is required for business accounts.',
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

<?php

namespace App\Http\Requests\TontineInvite;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTontineInviteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $tontine = $this->route('tontine');

        // Only creator or admin members can send invites
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
        $tontine = $this->route('tontine');

        return [
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('tontine_invites')->where(function ($query) use ($tontine) {
                    return $query->where('tontine_id', $tontine->id)
                        ->whereIn('status', ['pending', 'accepted']);
                }),
                Rule::unique('tontine_members', 'user_id')->where(function ($query) use ($tontine) {
                    return $query->where('tontine_id', $tontine->id)
                        ->whereExists(function ($subQuery) {
                            $subQuery->select('id')
                                ->from('users')
                                ->whereColumn('users.id', 'tontine_members.user_id')
                                ->where('users.email', $this->input('email'));
                        });
                }),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.max' => 'Email address cannot exceed 255 characters.',
            'email.unique' => 'An invite has already been sent to this email address for this tontine.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $tontine = $this->route('tontine');

            // Check if tontine has reached maximum capacity (optional business rule)
            $maxMembers = 20; // You can make this configurable
            $currentMembers = $tontine->members()->count();
            $pendingInvites = $tontine->invites()->where('status', 'pending')->count();

            if (($currentMembers + $pendingInvites) >= $maxMembers) {
                $validator->errors()->add(
                    'email',
                    'This tontine has reached its maximum capacity.'
                );
            }
        });
    }
}

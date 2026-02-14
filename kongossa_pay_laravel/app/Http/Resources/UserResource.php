<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Str;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'status' => Str::ucfirst($this->status),
            'role' => $this->role,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            'user_type' => $this->user_type,
            'company_name' => $this->company_name ?? '',
            'company_address' => $this->company_address,
            'company_phone' => $this->company_phone ?? '',
            'manager_name' => $this->manager_name ?? '',
            'company_legal_form' => $this->company_legal_form ?? '',
            'legal_form_document' => $this->legal_form_document ?? '',
            'legal_form_document_url' => $this->legal_form_document ? asset('storage/' . $this->legal_form_document) : null,
            'business_description' => $this->business_description,

            // Conditional relationships (only load when explicitly requested)
            'budgets' => BudgetResource::collection($this->whenLoaded('budgets')),
            'created_tontines' => TontineResource::collection($this->whenLoaded('createdTontines')),
            'tontine_memberships' => TontineMemberResource::collection($this->whenLoaded('tontineMembers')),
        ];
    }
}

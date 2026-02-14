<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserTypeEnums;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    function __construct(
        protected UserService $userService
    ) {
    }

    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'phone' => 'required|string|max:15|unique:' . User::class,
            'user_type' => ['required', 'string', Rule::in(UserTypeEnums::getValues())],
            'company_name' => ['string', 'max:255', Rule::requiredIf(fn() => $request->user_type === UserTypeEnums::BUSINESS->value)],
            'company_legal_form' => ['string', 'max:100', Rule::requiredIf(fn() => $request->user_type === UserTypeEnums::BUSINESS->value)],
            'manager_name' => ['string', 'max:255', Rule::requiredIf(fn() => $request->user_type === UserTypeEnums::BUSINESS->value)],
            'company_phone' => ['string', 'max:20', Rule::requiredIf(fn() => $request->user_type === UserTypeEnums::BUSINESS->value)],
            'company_address' => ['string', 'max:255', Rule::requiredIf(fn() => $request->user_type === UserTypeEnums::BUSINESS->value)],
            'legal_form_document' => ['file', 'mimes:pdf,jpg,jpeg,png', 'max:5120', Rule::requiredIf(fn() => $request->user_type === UserTypeEnums::BUSINESS->value)],
            'business_description' => ['string', 'max:1000', Rule::requiredIf(fn() => $request->user_type === UserTypeEnums::BUSINESS->value)],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'phone' => $request->phone,
            'role_id' => 2,
            'user_type' => $request->user_type,
        ];

        if ($request->user_type === UserTypeEnums::BUSINESS->value) {
            $userData = array_merge($userData, [
                'company_name' => $request->company_name,
                'company_legal_form' => $request->company_legal_form,
                'manager_name' => $request->manager_name,
                'company_phone' => $request->company_phone,
                'company_address' => $request->company_address,
                'legal_form_document' => $request->file('legal_form_document'),
                'business_description' => $request->business_description,
            ]);
        }

        $user = $this->userService->createUser($userData);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}

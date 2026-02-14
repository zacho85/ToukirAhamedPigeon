<?php

use App\Enums\UserTypeEnums;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('user_type', UserTypeEnums::getValues())->default('personal')->after('role_id');
            // Business/Merchant account fields
            $table->string('company_name')->nullable()->after('user_type');
            $table->text('company_address')->nullable()->after('company_name');
            $table->string('company_phone')->nullable()->after('company_address');
            $table->string('manager_name')->nullable()->after('company_phone');
            $table->string('company_legal_form')->nullable()->after('manager_name');
            $table->string('trade_register_document')->nullable()->after('company_legal_form');
            $table->text('business_description')->nullable()->after('trade_register_document');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'user_type',
                'company_name',
                'company_address',
                'company_phone',
                'manager_name',
                'company_legal_form',
                'trade_register_document',
                'business_description'
            ]);
        });
    }
};

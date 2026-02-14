<?php

use App\Enums\StatusEnums;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tontines', function (Blueprint $table) {
            $table->enum('status', [
                StatusEnums::ACTIVE->value,
                StatusEnums::INACTIVE->value,
                StatusEnums::FULL->value,
                StatusEnums::CANCELLED->value,
                StatusEnums::ON_HOLD->value,
                StatusEnums::SUSPENDED->value,
                StatusEnums::CLOSED->value,
            ])->after('duration_months')->default(StatusEnums::ACTIVE->value);
            $table->integer('max_members')->after('status')->default(10);
            $table->string('stripe_price_id')->after('max_members')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tontines', function (Blueprint $table) {
            $table->dropColumn('status');
            $table->dropColumn('max_members');
            $table->dropColumn('stripe_price_id');
        });
    }
};

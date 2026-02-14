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
        Schema::create('tontine_payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tontine_member_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->date('payout_date');
            $table->enum('status', StatusEnums::cases())->default(StatusEnums::SCHEDULED);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tontine_payouts');
    }
};

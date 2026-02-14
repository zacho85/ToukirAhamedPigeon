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
        Schema::create('tontine_contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tontine_member_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->date('contribution_date');
            $table->enum('status', StatusEnums::cases())->default(StatusEnums::PENDING);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tontine_contributions');
    }
};

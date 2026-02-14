<?php

use App\Enums\FrequencyEnums;
use App\Enums\TontineTypeEnums;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tontines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->string('name'); // Family Tontine, Friends Saving
            $table->enum('type', TontineTypeEnums::cases());
            $table->decimal('contribution_amount', 12, 2);
            $table->enum('frequency', FrequencyEnums::cases());
            $table->integer('duration_months'); // total cycle
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tontines');
    }
};

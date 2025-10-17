<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            // Foreign key linking to restaurants.id
            $table->foreignId('restaurant_id')
                ->constrained('restaurants')
                ->onDelete('cascade');

            $table->decimal('order_amount', 10, 2);
            $table->timestamp('order_time');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            
            // Clés étrangères
            $table->foreignId('school_id')
                  ->constrained('schools')
                  ->onDelete('cascade');
            
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');
            
            // Contenu de l'avis
            $table->unsignedInteger('rating');   // 1 à 5 (pas de négatif)
            $table->text('comment');
            
            // Statut de l'avis
            $table->boolean('verified')->default(false);
            $table->boolean('status')->default(true);
            
            $table->timestamps();
            
            // Index pour optimiser les requêtes
            $table->index(['school_id', 'verified']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
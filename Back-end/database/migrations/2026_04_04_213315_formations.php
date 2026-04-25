<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('formations', function (Blueprint $table) {
            $table->id();
            
            // Clé étrangère vers schools
            $table->foreignId('school_id')
                  ->constrained('schools')
                  ->onDelete('cascade');
            
            // Détails de la formation
            $table->string('nom');              // ex: "Génie Logiciel"
            $table->string('type')->nullable();  // ex: "Master", "Licence", "Filière"
            $table->text('description')->nullable();
            $table->integer('duree_mois')->nullable(); // durée en mois
            $table->string('niveau_acces')->nullable(); // Bac, Bac+2, etc.
            
            $table->timestamps();
            
            // Index composite pour les recherches fréquentes
            $table->index(['school_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('formations');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            
            // Informations de base
            $table->string('nom');
            $table->string('ville');
            $table->string('type');
            $table->text('description')->nullable();
            $table->text('presentation')->nullable();
            
            // Parcours scolaire
            $table->string('dureeEtudes')->nullable();
            $table->string('diplome')->nullable();
            $table->string('admission')->nullable();
            
            // Contact et visuel
            $table->string('siteWeb')->nullable();
            $table->string('contact')->nullable();
            $table->string('telephone')->nullable();
            $table->string('adresse')->nullable();
            $table->string('logo')->nullable();
            
            // Évaluation
            $table->decimal('note', 2, 1)->default(0);
            
            $table->timestamps();
            
            // Index pour accélérer les filtres (recherche par ville, type, combinaison)
            $table->index('ville');
            $table->index('type');
            $table->index(['ville', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};
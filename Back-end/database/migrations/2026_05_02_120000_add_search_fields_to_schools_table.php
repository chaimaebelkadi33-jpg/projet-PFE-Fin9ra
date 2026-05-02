<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->string('short_name')->nullable()->after('nom');
            $table->string('domaine_principal')->nullable()->after('type');
            $table->string('categorie_ecole')->nullable()->after('domaine_principal');
            $table->json('mots_cles_recherche')->nullable()->after('categorie_ecole');
            $table->json('prerequis_bac_type')->nullable()->after('bac_min_note');
            $table->string('prerequis_bac_mention')->nullable()->after('prerequis_bac_type');
            $table->boolean('a_internat')->nullable()->after('logo');

            $table->index('short_name');
            $table->index('domaine_principal');
            $table->index('categorie_ecole');
            $table->index('a_internat');
            $table->index(['ville', 'domaine_principal']);
            $table->index(['ville', 'categorie_ecole']);
        });
    }

    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->dropIndex(['ville', 'categorie_ecole']);
            $table->dropIndex(['ville', 'domaine_principal']);
            $table->dropIndex(['a_internat']);
            $table->dropIndex(['categorie_ecole']);
            $table->dropIndex(['domaine_principal']);
            $table->dropIndex(['short_name']);

            $table->dropColumn([
                'short_name',
                'domaine_principal',
                'categorie_ecole',
                'mots_cles_recherche',
                'prerequis_bac_type',
                'prerequis_bac_mention',
                'a_internat',
            ]);
        });
    }
};

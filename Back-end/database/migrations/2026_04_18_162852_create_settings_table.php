<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $col) {
            $col->id();
            $col->string('key')->unique();
            $col->text('value')->nullable();
            $col->string('group')->default('general');
            $col->string('type')->default('text');
            $col->timestamps();
        });

        // Insert default settings
        DB::table('settings')->insert([
            // General
            ['key' => 'site_name', 'value' => 'FinN9ra', 'group' => 'general', 'type' => 'text'],
            ['key' => 'site_description', 'value' => 'La plateforme de référence pour les étudiants.', 'group' => 'general', 'type' => 'text'],
            ['key' => 'footer_text', 'value' => '© 2026 FinN9ra. Tous droits réservés.', 'group' => 'general', 'type' => 'text'],
            
            // Contact
            ['key' => 'contact_email', 'value' => 'contact@finn9ra.ma', 'group' => 'contact', 'type' => 'text'],
            ['key' => 'contact_phone', 'value' => '+212 5XX XX XX XX', 'group' => 'contact', 'type' => 'text'],
            ['key' => 'contact_address', 'value' => 'Casablanca, Maroc', 'group' => 'contact', 'type' => 'text'],
            
            // Social
            ['key' => 'social_facebook', 'value' => 'https://facebook.com/finn9ra', 'group' => 'social', 'type' => 'text'],
            ['key' => 'social_instagram', 'value' => 'https://instagram.com/finn9ra', 'group' => 'social', 'type' => 'text'],
            ['key' => 'social_linkedin', 'value' => 'https://linkedin.com/company/finn9ra', 'group' => 'social', 'type' => 'text'],
            
            // System
            ['key' => 'maintenance_mode', 'value' => '0', 'group' => 'system', 'type' => 'boolean'],
            ['key' => 'allow_registration', 'value' => '1', 'group' => 'system', 'type' => 'boolean'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};

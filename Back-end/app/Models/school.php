<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class School extends Model
{
    /**
     * Les attributs qui sont assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nom',
        'short_name',
        'ville',
        'type',
        'domaine_principal',
        'categorie_ecole',
        'mots_cles_recherche',
        'description',
        'presentation',
        'dureeEtudes',
        'diplome',
        'admission',
        'siteWeb',
        'contact',
        'telephone',
        'adresse',
        'logo',
        'a_internat',
        'images',
        'note',
        'cout',
        'bac_min_note',
        'prerequis_bac_type',
        'prerequis_bac_mention',
        'debouches',
    ];

    protected $casts = [
        'images' => 'array',
        'mots_cles_recherche' => 'array',
        'prerequis_bac_type' => 'array',
        'debouches' => 'array',
        'a_internat' => 'boolean',
    ];
    /**
     * Relation : Une école a plusieurs formations.
     */
    public function formations(): HasMany
    {
        return $this->hasMany(Formation::class);
    }

    /**
     * Relation : Une école a plusieurs avis.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Relation : Une école peut être en favori par plusieurs utilisateurs.
     */
    public function favoritedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'favorites')->withTimestamps();
    }

    /**
     * Accesseur pour obtenir la note moyenne calculée à partir des avis.
     * (Optionnel - peut être utilisé si tu ne stockes pas 'note' en base)
     */
    public function getAverageRatingAttribute(): float
    {
        return round($this->reviews()->avg('rating') ?? 0, 1);
    }
}

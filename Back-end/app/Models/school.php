<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class school extends Model
{
    /**
     * Les attributs qui sont assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nom',
        'ville',
        'type',
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
        'images',
        'note',
    ];
protected $casts = [
        'images' => 'array', 
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
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Formation extends Model
{
    /**
     * Les attributs assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'school_id',
        'nom',
        'specialites',
        'type',
        'description',
        'duree_mois',
        'niveau_acces',
    ];
protected $casts = [
    'specialites' => 'array',  
];
    /**
     * Relation : Une formation appartient à une école.
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }
}
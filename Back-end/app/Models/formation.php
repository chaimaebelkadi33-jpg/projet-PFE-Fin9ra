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
        'objectifs',
        'competences',
        'debouches',
        'conditions_acces',
        'code',
        'responsable_nom',
        'responsable_email',
        'est_alternance',
        'est_international',
    ];
protected $casts = [
    'specialites' => 'array',  
    'objectifs' => 'array',
    'competences' => 'array',
    'debouches' => 'array',
    'est_alternance' => 'boolean',
    'est_international' => 'boolean',
];
    /**
     * Relation : Une formation appartient à une école.
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }
}
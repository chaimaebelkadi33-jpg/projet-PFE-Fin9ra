<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use App\Models\School;
use Illuminate\Http\Request;

class FormationAdminController extends Controller
{
    // Liste des formations d'une école
    public function index($schoolId)
    {
        $school = School::find($schoolId);
        if (!$school) {
            return response()->json(['message' => 'École non trouvée'], 404);
        }
        
        $formations = $school->formations;
        return response()->json($formations);
    }

    // Ajouter une formation
    public function store(Request $request, $schoolId)
    {
        $school = School::find($schoolId);
        if (!$school) {
            return response()->json(['message' => 'École non trouvée'], 404);
        }

        $request->validate([
            'nom' => 'required|string|max:255',
            'type' => 'nullable|string|max:255',
            'specialites' => 'nullable|array',
            'description' => 'nullable|string',
            'duree_mois' => 'nullable|integer',
            'niveau_acces' => 'nullable|string',
        ]);

        $formation = Formation::create([
            'school_id' => $schoolId,
            'nom' => $request->nom,
            'type' => $request->type,
            'specialites' => $request->specialites ? json_encode($request->specialites) : null,
            'description' => $request->description,
            'duree_mois' => $request->duree_mois,
            'niveau_acces' => $request->niveau_acces,
        ]);

        return response()->json($formation, 201);
    }

    // Mettre à jour une formation
    public function update(Request $request, $id)
    {
        $formation = Formation::find($id);
        if (!$formation) {
            return response()->json(['message' => 'Formation non trouvée'], 404);
        }

        $request->validate([
            'nom' => 'sometimes|string|max:255',
            'type' => 'nullable|string|max:255',
            'specialites' => 'nullable|array',
            'description' => 'nullable|string',
            'duree_mois' => 'nullable|integer',
            'niveau_acces' => 'nullable|string',
        ]);

        if ($request->has('specialites')) {
            $request->merge(['specialites' => json_encode($request->specialites)]);
        }

        $formation->update($request->all());

        return response()->json($formation);
    }

    // Supprimer une formation
    public function destroy($id)
    {
        $formation = Formation::find($id);
        if (!$formation) {
            return response()->json(['message' => 'Formation non trouvée'], 404);
        }

        $formation->delete();
        return response()->json(['message' => 'Formation supprimée avec succès']);
    }
}
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
            'objectifs' => 'nullable',
            'competences' => 'nullable',
            'debouches' => 'nullable',
            'conditions_acces' => 'nullable|string',
            'code' => 'nullable|string',
            'responsable_nom' => 'nullable|string',
            'responsable_email' => 'nullable|email',
            'est_alternance' => 'nullable|boolean',
            'est_international' => 'nullable|boolean',
        ]);

        $data = $request->all();
        $data['school_id'] = $schoolId;

        // Handle JSON arrays if they come as strings from FormData
        foreach (['specialites', 'objectifs', 'competences', 'debouches'] as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $data[$field] = json_decode($data[$field], true);
            }
        }

        $data['est_alternance'] = $request->boolean('est_alternance');
        $data['est_international'] = $request->boolean('est_international');

        $formation = Formation::create($data);

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
            'objectifs' => 'nullable',
            'competences' => 'nullable',
            'debouches' => 'nullable',
            'conditions_acces' => 'nullable|string',
            'code' => 'nullable|string',
            'responsable_nom' => 'nullable|string',
            'responsable_email' => 'nullable|email',
            'est_alternance' => 'nullable|boolean',
            'est_international' => 'nullable|boolean',
        ]);

        $data = $request->all();

        // Handle JSON arrays if they come as strings from FormData
        foreach (['specialites', 'objectifs', 'competences', 'debouches'] as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $data[$field] = json_decode($data[$field], true);
            }
        }

        if ($request->has('est_alternance')) {
            $data['est_alternance'] = $request->boolean('est_alternance');
        }
        if ($request->has('est_international')) {
            $data['est_international'] = $request->boolean('est_international');
        }

        $formation->update($data);

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
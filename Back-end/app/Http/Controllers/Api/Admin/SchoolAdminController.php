<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\Formation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class SchoolAdminController extends Controller
{
    // Liste toutes les écoles (avec pagination)
    public function index()
    {
        $schools = School::with('formations')->orderBy('created_at', 'desc')->paginate(10);
        return response()->json($schools);
    }

    // Afficher une école spécifique
    public function show($id)
    {
        $school = School::with('formations')->find($id);
        if (!$school) {
            return response()->json(['message' => 'École non trouvée'], 404);
        }
        return response()->json($school);
    }

    // Créer une nouvelle école
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'ville' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'description' => 'nullable|string',
            'presentation' => 'nullable|string',
            'dureeEtudes' => 'nullable|string',
            'diplome' => 'nullable|string',
            'admission' => 'nullable|string',
            'siteWeb' => 'nullable|url',
            'contact' => 'nullable|email',
            'telephone' => 'nullable|string',
            'adresse' => 'nullable|string',
            'logo' => 'nullable',
            'note' => 'nullable|numeric|min:0|max:5',
        ]);

        $data = $request->except('logo');

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('schools/logos', 'public');
            $data['logo'] = '/storage/' . $path;
        } elseif ($request->filled('logo')) {
            $data['logo'] = $request->logo;
        }

        $school = School::create($data);
        
        return response()->json($school, 201);
    }

    // Mettre à jour une école
    public function update(Request $request, $id)
    {
        $school = School::find($id);
        if (!$school) {
            return response()->json(['message' => 'École non trouvée'], 404);
        }

        $request->validate([
            'nom' => 'sometimes|string|max:255',
            'ville' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'presentation' => 'nullable|string',
            'dureeEtudes' => 'nullable|string',
            'diplome' => 'nullable|string',
            'admission' => 'nullable|string',
            'siteWeb' => 'nullable|url',
            'contact' => 'nullable|email',
            'telephone' => 'nullable|string',
            'adresse' => 'nullable|string',
            'logo' => 'nullable',
            'note' => 'nullable|numeric|min:0|max:5',
        ]);

        $data = $request->except('logo');

        if ($request->hasFile('logo')) {
            if ($school->logo && strpos($school->logo, '/storage/') === 0) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $school->logo));
            }
            $path = $request->file('logo')->store('schools/logos', 'public');
            $data['logo'] = '/storage/' . $path;
        } elseif ($request->has('logo') && empty($request->logo)) {
            if ($school->logo && strpos($school->logo, '/storage/') === 0) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $school->logo));
            }
            $data['logo'] = null;
        } elseif ($request->filled('logo')) {
            $data['logo'] = $request->logo;
        }

        $school->update($data);
        
        return response()->json($school);
    }

    // Supprimer une école (avec ses formations et avis)
    public function destroy($id)
    {
        $school = School::find($id);
        if (!$school) {
            return response()->json(['message' => 'École non trouvée'], 404);
        }

        // Supprimer les formations associées
        $school->formations()->delete();
        // Supprimer les avis associés
        $school->reviews()->delete();
        // Supprimer l'école
        $school->delete();

        return response()->json(['message' => 'École supprimée avec succès']);
    }
}
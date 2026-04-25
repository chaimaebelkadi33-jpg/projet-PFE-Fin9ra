<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\Formation;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SchoolController extends Controller
{
    // ========== ROUTES PUBLIQUES ==========
    
    public function index()
    {
        try {
            $schools = School::with(['formations', 'reviews'])->get();
            return response()->json([
                'success' => true,
                'data' => $schools
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des écoles'
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $school = School::with(['formations', 'reviews.user'])->find($id);
            
            if (!$school) {
                return response()->json([
                    'success' => false,
                    'message' => 'École non trouvée'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $school
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement de l\'école'
            ], 500);
        }
    }

    public function filters()
    {
        try {
            $villes = School::select('ville')->distinct()->orderBy('ville')->pluck('ville');
            $types = School::select('type')->distinct()->orderBy('type')->pluck('type');
            $specialites = Formation::select('nom')->distinct()->orderBy('nom')->pluck('nom');
            
            return response()->json([
                'success' => true,
                'data' => [
                    'villes' => $villes,
                    'types' => $types,
                    'specialites' => $specialites,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des filtres'
            ], 500);
        }
    }

    public function search(Request $request)
    {
        try {
            $query = School::query();

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('ville', 'like', "%{$search}%")
                      ->orWhere('type', 'like', "%{$search}%");
                });
            }

            if ($request->filled('ville')) {
                $query->where('ville', $request->ville);
            }

            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            if ($request->filled('specialite')) {
                $query->whereHas('formations', function ($q) use ($request) {
                    $q->where('nom', 'like', "%{$request->specialite}%");
                });
            }

            $schools = $query->with(['formations', 'reviews'])->get();

            return response()->json([
                'success' => true,
                'data' => $schools
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la recherche'
            ], 500);
        }
    }

    // ========== ROUTES ADMIN (protégées par middleware) ==========

    // Lister toutes les écoles (admin)
    public function adminIndex()
    {
        try {
            $schools = School::with('formations')->orderBy('created_at', 'desc')->paginate(10);
            return response()->json([
                'success' => true,
                'data' => $schools
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des écoles'
            ], 500);
        }
    }

    // Créer une école (admin)
    public function adminStore(Request $request)
    {
        try {
            $validated = $request->validate([
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
                'note' => 'nullable|numeric|min:0|max:5',
            ]);

            // Valeur par défaut pour la note
            if (empty($validated['note']) && $validated['note'] !== 0) {
                $validated['note'] = 0;
            }

            $school = School::create($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'École créée avec succès',
                'data' => $school
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la création'
            ], 500);
        }
    }

    // Modifier une école (admin)
    public function adminUpdate(Request $request, $id)
    {
        try {
            $school = School::find($id);
            
            if (!$school) {
                return response()->json([
                    'success' => false,
                    'message' => 'École non trouvée'
                ], 404);
            }

            $validated = $request->validate([
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
                'note' => 'nullable|numeric|min:0|max:5',
            ]);

            $school->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'École modifiée avec succès',
                'data' => $school
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la modification'
            ], 500);
        }
    }

    // Supprimer une école (admin)
    public function adminDestroy($id)
    {
        try {
            $school = School::find($id);
            
            if (!$school) {
                return response()->json([
                    'success' => false,
                    'message' => 'École non trouvée'
                ], 404);
            }

            // Supprimer les formations et avis associés
            $school->formations()->delete();
            $school->reviews()->delete();
            $school->delete();

            return response()->json([
                'success' => true,
                'message' => 'École supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la suppression'
            ], 500);
        }
    }
}
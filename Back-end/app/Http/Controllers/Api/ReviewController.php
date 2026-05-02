<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    // Lister les avis d'une école
    public function index($schoolId)
    {
        $school = School::find($schoolId);
        if (!$school) {
            return response()->json(['message' => 'École non trouvée'], 404);
        }

        $reviews = $school->reviews()
            ->with('user')
            ->where('verified', true)
            ->latest()
            ->get();
        return response()->json($reviews);
    }

    // Ajouter un avis (nécessite d'être authentifié)
    public function store(Request $request)
    {
        $request->validate([
            'school_id' => 'required|exists:schools,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:3',
        ]);

        // Vérifier si l'utilisateur a déjà laissé un avis pour cette école
        $existing = Review::where('user_id', Auth::id())
                         ->where('school_id', $request->school_id)
                         ->first();

        if ($existing) {
            return response()->json(['message' => 'Vous avez déjà donné votre avis pour cette école'], 422);
        }

        $review = Review::create([
            'school_id' => $request->school_id,
            'user_id' => Auth::id(),
            'rating' => $request->rating,
            'comment' => $request->comment,
            'verified' => false, // À modérer plus tard
            'status' => true,
        ]);

        // Mettre à jour la note moyenne de l'école
        $this->updateSchoolAverageRating($request->school_id);

        return response()->json($review, 201);
    }

    // Modifier un avis (seulement par l'auteur)
    public function update(Request $request, $id)
    {
        $review = Review::find($id);
        if (!$review) {
            return response()->json(['message' => 'Avis non trouvé'], 404);
        }

        if ($review->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:3',
        ]);

        $review->update([
            'rating' => $request->rating,
            'comment' => $request->comment,
            'verified' => false, // Repasse en non vérifié après modification
        ]);

        $this->updateSchoolAverageRating($review->school_id);

        $review->load('school');

        return response()->json($review);
    }

    // Supprimer un avis (seulement par l'auteur ou admin)
    public function destroy($id)
    {
        $review = Review::find($id);
        if (!$review) {
            return response()->json(['message' => 'Avis non trouvé'], 404);
        }

        if ($review->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $schoolId = $review->school_id;
        $review->delete();

        $this->updateSchoolAverageRating($schoolId);

        return response()->json(['message' => 'Avis supprimé']);
    }

    // Méthode privée pour recalculer la note moyenne d'une école
    private function updateSchoolAverageRating($schoolId)
    {
        $school = School::find($schoolId);
        if ($school) {
            $average = $school->reviews()->where('verified', true)->avg('rating') ?? 0;
            $school->note = round($average, 1);
            $school->save();
        }
    }
}
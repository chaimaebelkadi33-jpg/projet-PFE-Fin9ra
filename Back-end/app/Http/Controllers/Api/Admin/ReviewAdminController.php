<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewAdminController extends Controller
{
    // Liste tous les avis (avec pagination)
    public function index()
    {
        $reviews = Review::with(['user', 'school'])->orderBy('created_at', 'desc')->paginate(20);
        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    // Avis en attente de modération
    public function pending()
    {
        $reviews = Review::with(['user', 'school'])
            ->where('verified', false)
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    // Valider un avis
    public function verify($id)
    {
        $review = Review::find($id);
        if (!$review) {
            return response()->json(['message' => 'Avis non trouvé'], 404);
        }

        $review->verified = true;
        $review->save();

        // Recalculer la note de l'école
        $school = $review->school;
        $average = $school->reviews()->where('verified', true)->avg('rating') ?? 0;
        $school->note = round($average, 1);
        $school->save();

        return response()->json([
            'success' => true,
            'message' => 'Avis vérifié avec succès'
        ]);
    }

    // Supprimer un avis
    public function destroy($id)
    {
        $review = Review::find($id);
        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Avis non trouvé'
            ], 404);
        }

        $schoolId = $review->school_id;
        $review->delete();

        // Recalculer la note de l'école
        $school = \App\Models\School::find($schoolId);
        $average = $school->reviews()->where('verified', true)->avg('rating') ?? 0;
        $school->note = round($average, 1);
        $school->save();

        return response()->json([
            'success' => true,
            'message' => 'Avis supprimé avec succès'
        ]);
    }
    public function pendingCount()
{
    $count = Review::where('verified', false)->count();
    return response()->json([
        'success' => true,
        'count' => $count
    ]);
}
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile with reviews and favorite schools.
     */
    public function getProfile()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        // Load relations
        $user->load(['reviews.school', 'favorites']);

        return response()->json([
            'user' => $user,
            'favorites' => $user->favorites,
            'reviews' => $user->reviews
        ]);
    }

    /**
     * Toggle a school in the user's favorites list.
     */
    public function toggleFavorite(Request $request, $schoolId)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Veuillez vous connecter pour ajouter des favoris'], 401);
        }

        $school = School::find($schoolId);
        if (!$school) {
            return response()->json(['message' => 'École non trouvée'], 404);
        }

        // Toggle the favorite
        $user->favorites()->toggle($schoolId);

        // Check the new state
        $isFavorited = $user->favorites()->where('school_id', $schoolId)->exists();

        return response()->json([
            'success' => true,
            'message' => $isFavorited ? 'Ajouté aux favoris' : 'Retiré des favoris',
            'is_favorited' => $isFavorited
        ]);
    }
}

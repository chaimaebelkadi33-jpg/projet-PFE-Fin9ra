<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\school;
use App\Models\review;
use Illuminate\Http\JsonResponse;

class DashboardAdminController extends Controller
{
    /**
     * Get summary statistics for the admin dashboard.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $totalUsers = User::count();
            $totalSchools = school::count();
            $totalReviews = review::count();
            $pendingReviews = review::where('verified', false)->count();
            
            // Calculate satisfaction rate
            // Assuming rating is between 1 and 5
            $avgRating = review::avg('rating') ?? 0;
            $satisfaction = round(($avgRating / 5) * 100);

            return response()->json([
                'success' => true,
                'data' => [
                    'totalUsers' => $totalUsers,
                    'totalSchools' => $totalSchools,
                    'totalReviews' => $totalReviews,
                    'pendingReviews' => $pendingReviews,
                    'satisfaction' => $satisfaction,
                    'avgRating' => round($avgRating, 1)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

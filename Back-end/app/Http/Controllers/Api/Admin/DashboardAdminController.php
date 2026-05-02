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

            // Schools by city - Robust grouping (handles casing and spaces)
            $schoolsByCity = school::select(\DB::raw('MAX(ville) as ville'), \DB::raw('count(*) as total'))
                ->groupBy(\DB::raw('LOWER(TRIM(ville))'))
                ->orderBy('total', 'desc')
                ->get();

            // Schools by type - Robust grouping (handles casing and spaces)
            $schoolsByType = school::select(\DB::raw('MAX(type) as type'), \DB::raw('count(*) as total'))
                ->groupBy(\DB::raw('LOWER(TRIM(type))'))
                ->orderBy('total', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'totalUsers' => $totalUsers,
                    'totalSchools' => $totalSchools,
                    'totalReviews' => $totalReviews,
                    'pendingReviews' => $pendingReviews,
                    'satisfaction' => $satisfaction,
                    'avgRating' => round($avgRating, 1),
                    'schoolsByCity' => $schoolsByCity,
                    'schoolsByType' => $schoolsByType
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

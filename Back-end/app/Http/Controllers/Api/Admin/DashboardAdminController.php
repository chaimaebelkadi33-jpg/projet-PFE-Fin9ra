<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\school;
use App\Models\review;
use App\Models\UserActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

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
            $avgRating = review::avg('rating') ?? 0;
            $satisfaction = round(($avgRating / 5) * 100);

            // Schools by city
            $schoolsByCity = school::select(DB::raw('MAX(ville) as ville'), DB::raw('count(*) as total'))
                ->groupBy(DB::raw('LOWER(TRIM(ville))'))
                ->orderBy('total', 'desc')
                ->get();

            // Schools by Short Name (Network/Type)
            $schoolsByType = school::select(DB::raw('MAX(SUBSTRING_INDEX(short_name, \' \', 1)) as type'), DB::raw('count(*) as total'))
                ->whereNotNull('short_name')
                ->groupBy(DB::raw('LOWER(SUBSTRING_INDEX(short_name, \' \', 1))'))
                ->orderBy('total', 'desc')
                ->get();

            // User Activities by action
            $activitiesByType = UserActivity::select('action', DB::raw('count(*) as total'))
                ->groupBy('action')
                ->get();

            // Daily Activity (last 7 days)
            $dailyActivity = UserActivity::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as total'))
                ->where('created_at', '>=', now()->subDays(7))
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy('date', 'asc')
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
                    'schoolsByType' => $schoolsByType,
                    'activitiesByType' => $activitiesByType,
                    'dailyActivity' => $dailyActivity
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

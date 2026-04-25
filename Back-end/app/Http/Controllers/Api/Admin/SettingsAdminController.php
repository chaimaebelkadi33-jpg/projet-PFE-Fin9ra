<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SettingsAdminController extends Controller
{
    /**
     * Get all settings grouped by their category.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $settings = Setting::all()->groupBy('group');
            
            // Format for easier frontend use: { group: { key: value } }
            $formatted = [];
            foreach ($settings as $group => $items) {
                $formatted[$group] = $items->pluck('value', 'key');
            }

            return response()->json([
                'success' => true,
                'data' => $formatted
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des paramètres',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update multiple settings at once.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        try {
            $updates = $request->all(); // Expecting { key: value } pairs

            foreach ($updates as $key => $value) {
                // We only update if the setting exists to prevent injection of unknown keys
                $setting = Setting::where('key', $key)->first();
                if ($setting) {
                    // Convert boolean-like values to string if necessary
                    if (is_bool($value)) {
                        $value = $value ? '1' : '0';
                    }
                    $setting->update(['value' => (string) $value]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Paramètres mis à jour avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

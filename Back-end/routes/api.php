<?php

use App\Http\Controllers\Api\SchoolController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\Admin\ReviewAdminController;
use App\Http\Controllers\Api\RecommendationController;

// ========== ROUTES PUBLIQUES ==========
Route::get('/schools', [SchoolController::class, 'index']);
Route::get('/schools/{id}', [SchoolController::class, 'show']);
Route::get('/filters', [SchoolController::class, 'filters']);
Route::post('/schools/search', [SchoolController::class, 'search']);

// Routes de recommandation
Route::get('/recommendations/filters', [RecommendationController::class, 'getFilters']);
Route::post('/recommendations', [RecommendationController::class, 'getRecommendations']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes Google Auth
Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// ========== ROUTES ADMIN (protégées) ==========
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/schools', [\App\Http\Controllers\Api\Admin\SchoolAdminController::class, 'index']);
    Route::post('/schools', [\App\Http\Controllers\Api\Admin\SchoolAdminController::class, 'store']);
    Route::put('/schools/{id}', [\App\Http\Controllers\Api\Admin\SchoolAdminController::class, 'update']);
    Route::delete('/schools/{id}', [\App\Http\Controllers\Api\Admin\SchoolAdminController::class, 'destroy']);
    Route::get('/schools/{id}', [\App\Http\Controllers\Api\Admin\SchoolAdminController::class, 'show']);
    
    // Gestion des formations
    Route::get('/schools/{schoolId}/formations', [\App\Http\Controllers\Api\Admin\FormationAdminController::class, 'index']);
    Route::post('/schools/{schoolId}/formations', [\App\Http\Controllers\Api\Admin\FormationAdminController::class, 'store']);
    Route::put('/formations/{id}', [\App\Http\Controllers\Api\Admin\FormationAdminController::class, 'update']);
    Route::delete('/formations/{id}', [\App\Http\Controllers\Api\Admin\FormationAdminController::class, 'destroy']);
    
    // Gestion des avis
    Route::get('/reviews', [ReviewAdminController::class, 'index']);
    Route::get('/reviews/pending', [ReviewAdminController::class, 'pending']);
    Route::post('/reviews/{id}/verify', [ReviewAdminController::class, 'verify']);
    Route::delete('/reviews/{id}', [ReviewAdminController::class, 'destroy']);
    Route::get('/reviews/pending/count', [ReviewAdminController::class, 'pendingCount']);
    Route::get('/stats', [\App\Http\Controllers\Api\Admin\DashboardAdminController::class, 'index']);
    
    // Gestion des utilisateurs
    Route::get('/users', [\App\Http\Controllers\Api\Admin\UserAdminController::class, 'index']);
    Route::put('/users/{id}', [\App\Http\Controllers\Api\Admin\UserAdminController::class, 'update']);
    Route::put('/users/{id}/role', [\App\Http\Controllers\Api\Admin\UserAdminController::class, 'toggleRole']);
    Route::delete('/users/{id}', [\App\Http\Controllers\Api\Admin\UserAdminController::class, 'destroy']);
    
    // Paramètres
    Route::get('/settings', [\App\Http\Controllers\Api\Admin\SettingsAdminController::class, 'index']);
    Route::put('/settings', [\App\Http\Controllers\Api\Admin\SettingsAdminController::class, 'update']);
});

// ========== ROUTES PROTÉGÉES (utilisateur connecté) ==========
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    // Profil utilisateur
    Route::get('/profile', [ProfileController::class, 'getProfile']);
    Route::post('/schools/{schoolId}/favorite', [ProfileController::class, 'toggleFavorite']);
});

// Route publique pour voir les avis d'une école
Route::get('/schools/{schoolId}/reviews', [ReviewController::class, 'index']);

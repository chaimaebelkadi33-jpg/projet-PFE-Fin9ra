<?php

use App\Http\Controllers\Api\SchoolController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\admin\ReviewAdminController;
// ========== ROUTES PUBLIQUES ==========
Route::get('/schools', [SchoolController::class, 'index']);
Route::get('/schools/{id}', [SchoolController::class, 'show']);
Route::get('/filters', [SchoolController::class, 'filters']);
Route::post('/schools/search', [SchoolController::class, 'search']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ========== ROUTES ADMIN (protégées) ==========
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/schools', [SchoolController::class, 'adminIndex']);
    Route::post('/schools', [SchoolController::class, 'adminStore']);
    Route::put('/schools/{id}', [SchoolController::class, 'adminUpdate']);
    Route::delete('/schools/{id}', [SchoolController::class, 'adminDestroy']);
    Route::get('/reviews/pending/count', [ReviewAdminController::class, 'pendingCount']);
    Route::get('/stats', [\App\Http\Controllers\Api\Admin\DashboardAdminController::class, 'index']);
    
    // Gestion des utilisateurs
    Route::get('/users', [\App\Http\Controllers\Api\Admin\UserAdminController::class, 'index']);
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
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    // Profil utilisateur
    Route::get('/profile', [ProfileController::class, 'getProfile']);
    Route::post('/schools/{schoolId}/favorite', [ProfileController::class, 'toggleFavorite']);
});

// Route publique pour voir les avis d'une école
Route::get('/schools/{schoolId}/reviews', [ReviewController::class, 'index']);
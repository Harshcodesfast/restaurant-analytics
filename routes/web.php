<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;

use Inertia\Inertia;

// 👇 Root route now shows Dashboard directly
Route::get('/', function () {
    return Inertia::render('Dashboard');
});

// 👇 Profile routes (if you’re using auth)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// 👇 Your API routes
Route::prefix('api')->middleware('api')->group(function () {
    Route::get('/restaurants', [DashboardController::class, 'restaurants']);
    Route::get('/restaurants/{id}/analytics', [DashboardController::class, 'restaurantAnalytics']);
    Route::get('/top-restaurants', [DashboardController::class, 'topRestaurants']);
    Route::get('/orders/filter', [DashboardController::class, 'filteredOrders']);
});

Route::get('/welcome', function () {
    return Inertia::render('Welcome', [
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

require __DIR__ . '/auth.php';

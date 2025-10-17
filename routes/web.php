<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


Route::prefix('api')->middleware('api')->group(function () {
    Route::get('/restaurants', [DashboardController::class, 'restaurants']);
    Route::get('/restaurants/{id}/analytics', [DashboardController::class, 'restaurantAnalytics']);
    Route::get('/top-restaurants', [DashboardController::class, 'topRestaurants']);
    Route::get('/orders/filter', [DashboardController::class, 'filteredOrders']);
});

require __DIR__ . '/auth.php';

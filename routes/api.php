<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your dashboard analytics.
| These routes are automatically assigned the "api" middleware group.
|
*/

Route::get('/restaurants', [DashboardController::class, 'restaurants']);
Route::get('/restaurants/{id}/analytics', [DashboardController::class, 'restaurantAnalytics']);
Route::get('/top-restaurants', [DashboardController::class, 'topRestaurants']);
Route::get('/orders/filter', [DashboardController::class, 'filteredOrders']);

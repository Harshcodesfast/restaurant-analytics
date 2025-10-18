<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Restaurant;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Pagination\CursorPaginator;

class DashboardController extends Controller
{
    // 1) List restaurants with search / sort / filter / pagination
    public function restaurants(Request $request)
    {
        $request->validate([
            'search' => 'sometimes|string',
            'sort_by' => 'sometimes|string|in:id,name,location,cuisine,rating,created_at',
            'direction' => 'sometimes|string|in:asc,desc',
            'location' => 'sometimes|string',
            'cuisine' => 'sometimes|string',
            'min_rating' => 'sometimes|numeric|min:0|max:5',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'use_cache' => 'sometimes|boolean',
        ]);

        // Base query
        $q = Restaurant::query();

        //  Searching across name, location, cuisine
        if ($search = $request->get('search')) {
            $q->where(function ($sub) use ($search) {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('cuisine', 'like', "%{$search}%");
            });
        }

        //  Filter by location
        if ($location = $request->get('location')) {
            $q->where('location', $location);
        }

        //  Filter by cuisine
        if ($cuisine = $request->get('cuisine')) {
            $q->where('cuisine', $cuisine);
        }

        //  Filter by rating
        if ($minRating = $request->get('min_rating')) {
            $q->where('rating', '>=', $minRating);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'name');
        $direction = $request->get('direction', 'asc');
        $q->orderBy($sortBy, $direction);

        // Pagination
        $perPage = $request->get('per_page', 10);

        // Caching (for repeated dashboard queries)
        $useCache = $request->boolean('use_cache', true);
        $cacheKey = 'restaurants_' . md5(json_encode($request->all()));

        if ($useCache) {
            $restaurants = Cache::remember($cacheKey, now()->addSeconds(60), function () use ($q, $perPage) {
                return $q->paginate($perPage);
            });
        } else {
            $restaurants = $q->paginate($perPage);
        }

        return response()->json($restaurants);
    }

    // 2) Restaurant analytics for a date range (daily metrics)
    public function restaurantAnalytics(Request $request, $id)
    {
        $request->validate([
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date',
        ]);

        $restaurant = Restaurant::findOrFail($id);

        $start = $request->get('start_date', Order::min('order_time'));
        $end = $request->get('end_date', Order::max('order_time'));

        // ✅ Step 1: Aggregate daily data
        $daily = DB::table('orders')
            ->select(
                DB::raw("strftime('%Y-%m-%d', order_time) as date"),
                DB::raw("COUNT(*) as total_orders"),
                DB::raw("SUM(order_amount) as total_revenue"),
                DB::raw("ROUND(AVG(order_amount), 2) as avg_order_value")
            )
            ->where('restaurant_id', $id)
            // ✅ FIXED: Added date range array as 2nd argument
            ->whereBetween(DB::raw("strftime('%Y-%m-%d', order_time)"), [$start, $end])
            ->groupBy(DB::raw("strftime('%Y-%m-%d', order_time)"))
            ->orderBy('date', 'asc')
            ->get();

        // ✅ Step 2: Compute peak order hour per day
        $orders = Order::where('restaurant_id', $id)
            ->whereBetween(DB::raw("strftime('%Y-%m-%d', order_time)"), [$start, $end])
            ->get(['order_time']);

        $peakHours = [];
        foreach ($orders->groupBy(fn($o) => Carbon::parse($o->order_time)->format('Y-m-d')) as $day => $dayOrders) {
            $hourCounts = $dayOrders
                ->groupBy(fn($o) => Carbon::parse($o->order_time)->format('H'))
                ->map->count();

            $topHour = $hourCounts->sortDesc()->keys()->first();
            $orderCount = $hourCounts[$topHour] ?? 0;

            $peakHours[$day] = [
                'hour' => $topHour,
                'orders' => $orderCount,
            ];
        }

        // ✅ Step 3: Merge both datasets
        $result = $daily->map(function ($row) use ($peakHours) {
            $day = $row->date;
            return [
                'date' => $day,
                'total_orders' => (int) $row->total_orders,
                'total_revenue' => (float) $row->total_revenue,
                'avg_order_value' => (float) $row->avg_order_value,
                'peak_hour' => $peakHours[$day] ?? null,
            ];
        });

        return response()->json([
            'restaurant' => [
                'id' => $restaurant->id,
                'name' => $restaurant->name,
                'location' => $restaurant->location,
                'cuisine' => $restaurant->cuisine,
                'rating' => $restaurant->rating,
            ],
            'start_date' => $start,
            'end_date' => $end,
            'daily_stats' => $result,
        ]);
    }

    // 3) Top N restaurants by revenue (default top 3)
    public function topRestaurants(Request $request)
    {
        $start = $request->get('start_date', '2000-01-01'); // old enough start
        $end = $request->get('end_date', now()->toDateString());

        $cacheKey = "top_restaurants_{$start}_{$end}";

        $topRestaurants = Cache::remember($cacheKey, 300, function () use ($start, $end) {
            return DB::table('orders')
                ->join('restaurants', 'orders.restaurant_id', '=', 'restaurants.id')
                ->select(
                    'restaurants.id',
                    'restaurants.name',
                    'restaurants.location',
                    'restaurants.cuisine',
                    'restaurants.rating',
                    DB::raw('SUM(orders.order_amount) as total_revenue'),
                    DB::raw('COUNT(orders.id) as total_orders')
                )
                ->whereBetween(DB::raw("DATE(orders.order_time)"), [$start, $end])
                ->groupBy(
                    'restaurants.id',
                    'restaurants.name',
                    'restaurants.location',
                    'restaurants.cuisine',
                    'restaurants.rating'
                )
                ->orderByDesc('total_revenue')
                ->limit(3)
                ->get();
        });

        return response()->json([
            'start_date' => $start,
            'end_date' => $end,
            'top_3_restaurants' => $topRestaurants,
        ]);
    }

    // 4) Filtered orders (by restaurant, date range, amount range, hour range)
    public function filteredOrders(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'sometimes|integer|exists:restaurants,id',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date',
            'min_amount' => 'sometimes|numeric|min:0',
            'max_amount' => 'sometimes|numeric|min:0',
            'start_hour' => 'sometimes|integer|min:0|max:23',
            'end_hour' => 'sometimes|integer|min:0|max:23',
            'sort_by' => 'sometimes|string|in:id,order_time,order_amount',
            'direction' => 'sometimes|string|in:asc,desc',
            'per_page' => 'sometimes|integer|min:1|max:1000',
            'use_cursor' => 'sometimes|boolean',
        ]);

        $q = Order::query()->with('restaurant');

        // Filters
        if ($rid = $request->get('restaurant_id')) {
            $q->where('restaurant_id', $rid);
        }

        // Date range - use whereDate for DB-agnostic behavior
        if ($start = $request->get('start_date')) {
            $end = $request->get('end_date', $start);
            $q->whereDate('order_time', '>=', $start)
                ->whereDate('order_time', '<=', $end);
        }

        // Amount range (note column is order_amount)
        if ($request->has('min_amount') || $request->has('max_amount')) {
            $min = $request->get('min_amount', 0);
            $max = $request->get('max_amount', PHP_INT_MAX);
            $q->whereBetween('order_amount', [$min, $max]);
        }

        // Hour range (use SQLite compatible strftime for hour extraction)
        if ($request->has('start_hour')) {
            $startHour = str_pad((string) $request->get('start_hour'), 2, '0', STR_PAD_LEFT);
            $endHour = str_pad((string) $request->get('end_hour', 23), 2, '0', STR_PAD_LEFT);

            // Use DB::raw for portability; for SQLite strftime('%H', order_time) returns hour
            $q->whereBetween(DB::raw("strftime('%H', order_time)"), [$startHour, $endHour]);
        }

        // Search / sorting
        $sortBy = $request->get('sort_by', 'order_time');
        $direction = $request->get('direction', 'desc');
        $q->orderBy($sortBy, $direction);

        // Caching: build a cache key from request params (optional)
        $useCache = config('app.debug') === false || $request->get('cache', false); // optional rule
        $cacheKey = 'orders_filter_' . md5(json_encode($request->all()));

        // Pagination options
        $useCursor = (bool) $request->get('use_cursor', false);
        $perPage = (int) $request->get('per_page', 50);

        if ($useCache) {
            $result = Cache::remember($cacheKey, now()->addSeconds(60), function () use ($q, $useCursor, $perPage) {
                if ($useCursor) {
                    // cursorPaginate: efficient for large datasets but disables total count
                    return $q->orderBy('id')->cursorPaginate($perPage);
                }
                return $q->paginate($perPage);
            });

            // If cursor paginate was used, Laravel returns a Paginator-like object already
            return response()->json($result);
        }

        // No cache path
        if ($useCursor) {
            $paginated = $q->orderBy('id')->cursorPaginate($perPage);
            return response()->json($paginated);
        }

        $paginated = $q->paginate($perPage);

        return response()->json($paginated);
    }
}

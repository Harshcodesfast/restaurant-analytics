<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Restaurant;

class RestaurantSeeder extends Seeder
{
    public function run(): void
    {
        // Read JSON file
        $json = file_get_contents(database_path('data/restaurants.json'));
        $data = json_decode($json, true);

        // Loop and insert each restaurant
        foreach ($data as $item) {
            Restaurant::create($item);
        }
    }
}

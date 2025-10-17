<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        // Read orders.json from database/data/
        $json = file_get_contents(database_path('data/orders.json'));
        $data = json_decode($json, true);

        foreach ($data as $item) {
            //Convert ISO 8601 timestamps (2025-06-22T10:00:00) into standard SQL datetime (2025-06-22 10:00:00)
            if (!empty($item['order_time'])) {
                $item['order_time'] = date('Y-m-d H:i:s', strtotime($item['order_time']));
            }

            Order::create($item);
        }
    }
}
import React, { useState } from "react";
import RestaurantTable from "../Components/RestaurantTable";
import AnalyticsChart from "../Components/AnalyticsChart";
import TopRestaurants from "../Components/TopRestaurants";
import RestaurantPerformanceTable from "@/Components/RestaurantPerformanceTable";

export default function Dashboard() {
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">
                🍽️ Restaurant Dashboard
            </h1>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white rounded-lg shadow p-4">
                    <RestaurantTable onSelect={setSelectedRestaurant} />
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <TopRestaurants />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
                <AnalyticsChart restaurant={selectedRestaurant} />
            </div>
            <div className="bg-white rounded-lg shadow p-4">
                <RestaurantPerformanceTable />
            </div>
        </div>
    );
}

import React, { useEffect, useState } from "react";
import { api } from "../utils/api";

const RestaurantPerformanceTable = () => {
    const [performance, setPerformance] = useState([]);
    const [loading, setLoading] = useState(true);

    // Track sorting state
    const [sortConfig, setSortConfig] = useState({
        key: "avgOrderValue",
        order: "desc", // or 'asc'
    });

    useEffect(() => {
        fetchPerformanceData();
    }, []);

    const fetchPerformanceData = async () => {
        try {
            setLoading(true);

            const res = await api.get("/restaurants");
            const list = res.data.data || [];

            const results = [];

            for (const r of list) {
                const analytics = await api.get(
                    `/restaurants/${r.id}/analytics`
                );

                const stats = analytics.data.daily_stats || [];

                const totalRevenue = stats.reduce(
                    (sum, d) => sum + (d.total_revenue || 0),
                    0
                );
                const totalOrders = stats.reduce(
                    (sum, d) => sum + (d.total_orders || 0),
                    0
                );

                const avgOrderValue =
                    totalOrders > 0
                        ? parseFloat((totalRevenue / totalOrders).toFixed(2))
                        : 0;

                const numberOfDays = stats.length || 1;
                const ordersPerDay = parseFloat(
                    (totalOrders / numberOfDays).toFixed(2)
                );

                results.push({
                    id: r.id,
                    name: r.name,
                    location: r.location,
                    cuisine: r.cuisine,
                    avgOrderValue,
                    totalRevenue,
                    ordersPerDay,
                });
            }

            const sorted = sortData(results, sortConfig.key, sortConfig.order);
            setPerformance(sorted);
        } catch (err) {
            console.error("Error fetching performance data:", err);
        } finally {
            setLoading(false);
        }
    };

    // 🔁 Sorting logic
    const sortData = (data, key, order) => {
        return [...data].sort((a, b) => {
            const valA = a[key] ?? 0;
            const valB = b[key] ?? 0;
            return order === "asc" ? valA - valB : valB - valA;
        });
    };

    // 🔘 Handle sort click
    const handleSort = (key) => {
        const nextOrder =
            sortConfig.key === key && sortConfig.order === "desc"
                ? "asc"
                : "desc";

        const sorted = sortData(performance, key, nextOrder);
        setPerformance(sorted);
        setSortConfig({ key, order: nextOrder });
    };

    // 🎯 Sorting indicator icon
    const sortIcon = (key) => {
        if (sortConfig.key !== key) return "↕️";
        return sortConfig.order === "asc" ? "▲" : "▼";
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md mt-8">
            <h2 className="text-2xl font-semibold mb-4">
                📈 Restaurant Performance
            </h2>

            {loading ? (
                <p>Loading performance data...</p>
            ) : performance.length === 0 ? (
                <p className="text-gray-500 italic">
                    No performance data found.
                </p>
            ) : (
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Location</th>
                            <th className="p-3 text-left">Cuisine</th>

                            {/* Sort by Avg Order Value */}
                            <th
                                className={`p-3 text-left cursor-pointer select-none ${
                                    sortConfig.key === "avgOrderValue"
                                        ? "text-blue-600 font-semibold"
                                        : "hover:text-blue-600"
                                }`}
                                onClick={() => handleSort("avgOrderValue")}
                            >
                                Avg Order Value (₹)
                                <span className="ml-1 text-sm">
                                    {sortIcon("avgOrderValue")}
                                </span>
                            </th>

                            {/* Sort by Total Revenue */}
                            <th
                                className={`p-3 text-left cursor-pointer select-none ${
                                    sortConfig.key === "totalRevenue"
                                        ? "text-blue-600 font-semibold"
                                        : "hover:text-blue-600"
                                }`}
                                onClick={() => handleSort("totalRevenue")}
                            >
                                Total Revenue (₹)
                                <span className="ml-1 text-sm">
                                    {sortIcon("totalRevenue")}
                                </span>
                            </th>

                            {/* Sort by Orders per Day */}
                            <th
                                className={`p-3 text-left cursor-pointer select-none ${
                                    sortConfig.key === "ordersPerDay"
                                        ? "text-blue-600 font-semibold"
                                        : "hover:text-blue-600"
                                }`}
                                onClick={() => handleSort("ordersPerDay")}
                            >
                                Orders per Day
                                <span className="ml-1 text-sm">
                                    {sortIcon("ordersPerDay")}
                                </span>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {performance.map((p) => (
                            <tr
                                key={p.id}
                                className="border-b hover:bg-gray-50 transition"
                            >
                                <td className="p-3 font-medium">{p.name}</td>
                                <td className="p-3 text-gray-600">
                                    {p.location}
                                </td>
                                <td className="p-3 text-gray-600">
                                    {p.cuisine}
                                </td>
                                <td className="p-3 text-gray-800">
                                    ₹{p.avgOrderValue.toLocaleString()}
                                </td>
                                <td className="p-3 font-semibold text-green-600">
                                    ₹{p.totalRevenue.toLocaleString()}
                                </td>
                                <td className="p-3 font-medium">
                                    {p.ordersPerDay.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default RestaurantPerformanceTable;

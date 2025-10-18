import React, { useEffect, useState } from "react";
import { api } from "../utils/api";
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";

const AnalyticsChart = ({ restaurant }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        start_date: "2025-06-20",
        end_date: "2025-06-30",
    });

    // Fetch analytics when restaurant or date range changes
    useEffect(() => {
        if (restaurant) fetchAnalytics();
    }, [restaurant, dateRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await api.get(
                `/restaurants/${restaurant.id}/analytics`,
                {
                    params: dateRange,
                }
            );
            console.log(res.data);
            setData(res.data.daily_stats || []);
        } catch (err) {
            console.error("Error fetching analytics:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!restaurant)
        return (
            <div className="text-center text-gray-500 py-6">
                Select a restaurant to view its performance 📊
            </div>
        );

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    {restaurant.name} — Performance Analytics
                </h2>

                {/* Date range picker */}
                <div className="flex gap-3 mt-3 md:mt-0">
                    <input
                        type="date"
                        value={dateRange.start_date}
                        onChange={(e) =>
                            setDateRange({
                                ...dateRange,
                                start_date: e.target.value,
                            })
                        }
                        className="border rounded px-3 py-1"
                    />
                    <input
                        type="date"
                        value={dateRange.end_date}
                        onChange={(e) =>
                            setDateRange({
                                ...dateRange,
                                end_date: e.target.value,
                            })
                        }
                        className="border rounded px-3 py-1"
                    />
                </div>
            </div>

            {loading ? (
                <p className="text-center text-gray-500 py-6">
                    Loading analytics...
                </p>
            ) : data.length === 0 ? (
                <p className="text-center text-gray-500 py-6">
                    No data found for this date range.
                </p>
            ) : (
                <>
                    {/* Daily Orders & Revenue */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">
                            📈 Daily Orders & Revenue
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="#82ca9d"
                                />
                                <Tooltip />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="total_orders"
                                    stroke="#8884d8"
                                    name="Orders"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="total_revenue"
                                    stroke="#82ca9d"
                                    name="Revenue"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Average Order Value */}
                    <div className="mt-10">
                        <h3 className="text-lg font-semibold mb-2">
                            💵 Average Order Value
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar
                                    dataKey="avg_order_value"
                                    fill="#8884d8"
                                    name="Avg Order Value"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Peak Order Hour */}
                    <div className="mt-10">
                        <h3 className="text-lg font-semibold mb-2">
                            ⏰ Orders During Peak Hour (Per Day)
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                                data={data.map((d) => ({
                                    date: d.date,
                                    peak_orders: d.peak_hour?.orders || 0,
                                    peak_hour_label: d.peak_hour
                                        ? `${d.peak_hour.hour}:00`
                                        : "N/A",
                                }))}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, name, props) => [
                                        value,
                                        `Orders at ${props.payload.peak_hour_label}`,
                                    ]}
                                />
                                <Bar
                                    dataKey="peak_orders"
                                    fill="#f59e0b"
                                    name="Orders at Peak Hour"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {/* 🧾 Total Orders per Day */}
                    <div className="mt-10">
                        <h3 className="text-lg font-semibold mb-2">
                            🧾 Total Orders per Day
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar
                                    dataKey="total_orders"
                                    fill="#34d399"
                                    name="Total Orders"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
};

export default AnalyticsChart;

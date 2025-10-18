import React, { useEffect, useState } from "react";
import { api } from "../utils/api.js";
const TopRestaurants = () => {
    const [top, setTop] = useState([]);
    useEffect(() => {
        fetchTop();
    }, []);
    const fetchTop = async () => {
        const res = await api.get("/top-restaurants");
        setTop(res.data.top_3_restaurants || []);
    };
    return (
        <div className="p-4 bg-gray-50 rounded-lg shadow">
            {" "}
            <h2 className="text-xl font-bold mb-3">
                {" "}
                🏆 Top 3 Restaurants by Revenue{" "}
            </h2>{" "}
            <ul>
                {" "}
                {top.map((r, i) => (
                    <li key={r.id} className="mb-2">
                        {" "}
                        <span className="font-semibold">
                            {" "}
                            {i + 1}. {r.name}{" "}
                        </span>{" "}
                        — 💰 {r.total_revenue.toLocaleString()} revenue ({" "}
                        {r.total_orders} orders){" "}
                    </li>
                ))}{" "}
            </ul>{" "}
        </div>
    );
};
export default TopRestaurants;

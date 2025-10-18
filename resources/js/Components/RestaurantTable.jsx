import React, { useEffect, useState } from "react";
import { api } from "../utils/api.js";

const RestaurantTable = ({ onSelect }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (search !== null && search !== "") fetchRestaurants();
        else fetchdefaultRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        setLoading(true);
        const res = await api.get("/restaurants", { params: { search } });
        setRestaurants(res.data.data || []);
        setLoading(false);
    };

    const fetchdefaultRestaurants = async () => {
        setLoading(true);
        const res = await api.get("/restaurants");
        setRestaurants(res.data.data || []);
        setLoading(false);
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-3">🍴 Restaurants</h2>
            <input
                type="text"
                placeholder="Search..."
                className="border p-2 mb-4 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchRestaurants()}
            />
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="min-w-full border">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-2">Name</th>
                            <th className="p-2">Location</th>
                            <th className="p-2">Cuisine</th>
                            <th className="p-2">Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {restaurants.map((r) => (
                            <tr
                                key={r.id}
                                onClick={() => onSelect(r)}
                                className="cursor-pointer hover:bg-gray-100"
                            >
                                <td className="p-2">{r.name}</td>
                                <td className="p-2">{r.location}</td>
                                <td className="p-2">{r.cuisine}</td>
                                <td className="p-2">{r.rating}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
export default RestaurantTable;

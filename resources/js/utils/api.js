import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
});

export const getTopRestaurants = (start, end) =>
    api.get(`/top-restaurants`, {
        params: { start_date: start, end_date: end },
    });

export const getRestaurantAnalytics = (id, start, end) =>
    api.get(`/restaurants/${id}/analytics`, {
        params: { start_date: start, end_date: end },
    });

export const getRestaurants = () => api.get(`/restaurants`);
// resources/js/utils/api.js

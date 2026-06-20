import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
            error.config._retry = true;
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (refreshToken) {
                    const res = await axios.post(`${API_URL}/api/v1/auth/refresh`, { refreshToken });
                    const { token: newToken } = res.data;
                    localStorage.setItem("token", newToken);
                    error.config.headers.Authorization = `Bearer ${newToken}`;
                    return axios(error.config);
                }
            } catch {
                // refresh failed — force logout
            }
        }
        return Promise.reject(error);
    }
);

export default api;
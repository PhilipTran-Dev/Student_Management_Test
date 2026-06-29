import axios from "axios";

const CLASS_API_URL = import.meta.env.VITE_CLASS_API_URL || "http://localhost:8082";

const classApi = axios.create({
    baseURL: CLASS_API_URL,
});

classApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

classApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
            error.config._retry = true;
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (refreshToken) {
                    const { default: api } = await import("./api");
                    const res = await api.post("/api/v1/auth/refresh", { refreshToken });
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

export default classApi;
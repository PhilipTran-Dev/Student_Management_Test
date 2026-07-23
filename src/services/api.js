import axios from "axios";

const GATEWAY_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const userApi = axios.create({ baseURL: GATEWAY_BASE_URL });
export const classApi = axios.create({ baseURL: GATEWAY_BASE_URL });
export const assignmentApi = axios.create({ baseURL: GATEWAY_BASE_URL });

// ─── Shared Interceptors ────────────────────────────────────────

const attachTokenInterceptor = (config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

const refreshTokenInterceptor = (axiosInstance) => async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
        error.config._retry = true;
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                // Đã sửa endpoint chuẩn: /v1/auth/refresh-token
                const res = await userApi.post("/v1/auth/refresh-token", { refreshToken });
                const { token: newToken } = res.data;
                localStorage.setItem("token", newToken);
                error.config.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(error.config);
            }
        } catch {
            localStorage.clear();
            window.location.href = "/login";
        }
    }
    return Promise.reject(error);
};

userApi.interceptors.request.use(attachTokenInterceptor);
classApi.interceptors.request.use(attachTokenInterceptor);
assignmentApi.interceptors.request.use(attachTokenInterceptor);

userApi.interceptors.response.use((response) => response, refreshTokenInterceptor(userApi));
classApi.interceptors.response.use((response) => response, refreshTokenInterceptor(classApi));
assignmentApi.interceptors.response.use((response) => response, refreshTokenInterceptor(assignmentApi));

export default userApi;
import axios from "axios";

/**
 * User-service API client (auth, registration, user management)
 * Uses relative path `/api` — Vite dev proxy or Nginx reverse proxy
 * routes requests to the actual user-service backend.
 */
export const userApi = axios.create({
    baseURL: "/api",
});

/**
 * Class-service API client (classes, announcements, materials, etc.)
 * Uses relative path `/class-api` — Vite dev proxy or Nginx reverse proxy
 * routes requests to the actual class-service backend.
 */
export const classApi = axios.create({
    baseURL: "/class-api",
});

/**
 * Assignment & Grading service API client
 * Uses relative path `/assignment-api` — Vite dev proxy or Nginx reverse proxy
 * routes requests to the actual assignment-service backend.
 */
export const assignmentApi = axios.create({
    baseURL: "/assignment-api",
});

// ─── Shared interceptors ────────────────────────────────────────

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
                // Use the userApi instance so the request goes through the proxy
                const res = await userApi.post("/v1/auth/refresh", { refreshToken });
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

// Attach request interceptor to both instances
userApi.interceptors.request.use(attachTokenInterceptor);
classApi.interceptors.request.use(attachTokenInterceptor);
assignmentApi.interceptors.request.use(attachTokenInterceptor);

// Attach response interceptor to both instances
userApi.interceptors.response.use(
    (response) => response,
    refreshTokenInterceptor(userApi)
);
classApi.interceptors.response.use(
    (response) => response,
    refreshTokenInterceptor(classApi)
);
assignmentApi.interceptors.response.use(
    (response) => response,
    refreshTokenInterceptor(assignmentApi)
);

export default userApi;
import axios from "axios";

const CLASS_SERVICE_URL = "http://localhost:8082";

const classApi = axios.create({
    baseURL: CLASS_SERVICE_URL,
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
                    const res = await axios.post(
                        `${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`,
                        { refreshToken }
                    );
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

/**
 * Fetch all classes for the logged-in teacher.
 * @returns {Promise<Array>} Array of class objects
 */
export const fetchClasses = async () => {
    const response = await classApi.get("/api/v1/classes/teacher/all");
    return response.data;
};

/**
 * Create a new class.
 * @param {Object} payload - { name, courseId, semesterId }
 * @returns {Promise<Object>} The created class object with system-generated code
 */
export const createClass = async (payload) => {
    const response = await classApi.post(
        "/api/v1/classes/teacher/create",
        payload
    );
    return response.data;
};

export default classApi;
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
 * Fetch a single class by its ID (teacher view).
 * @param {number|string} classId - The class ID
 * @returns {Promise<Object>} The class object with code, name, etc.
 */
export const fetchClassById = async (classId) => {
    const response = await classApi.get(`/api/v1/classes/${classId}`);
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

/**
 * Fetch all announcements for a class.
 * @param {number|string} classId - The class ID
 * @param {string} role - "teacher" or "student"
 * @returns {Promise<Array>} Array of announcement objects
 */
export const fetchAnnouncements = async (classId, role) => {
    const response = await classApi.get(
        `/api/v1/classes/${role.toLowerCase()}/${classId}/announcements`
    );
    return response.data;
};

/**
 * Create a new announcement (teacher only).
 * @param {number|string} classId - The class ID
 * @param {Object} payload - { title, content }
 * @returns {Promise<Object>} The created announcement object
 */
export const createAnnouncement = async (classId, payload) => {
    const response = await classApi.post(
        `/api/v1/classes/teacher/${classId}/announcements`,
        payload
    );
    return response.data;
};

/**
 * Delete an announcement (teacher only).
 * @param {number|string} id - The announcement ID
 */
export const deleteAnnouncement = async (id) => {
    await classApi.delete(`/api/v1/classes/teacher/announcements/${id}`);
};

/**
 * Fetch all materials for a class.
 * @param {number|string} classId - The class ID
 * @param {string} role - "teacher" or "student"
 * @returns {Promise<Array>} Array of material objects
 */
export const fetchMaterials = async (classId, role) => {
    const response = await classApi.get(`/api/v1/classes/${role.toLowerCase()}/${classId}/materials`);
    return response.data;
};

/**
 * Upload a material file (teacher only).
 * @param {number|string} classId - The class ID
 * @param {File} file - The file to upload
 * @returns {Promise<Object>} The uploaded material object
 */
export const uploadMaterial = async (classId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await classApi.post(`/api/v1/classes/teacher/${classId}/materials/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

/**
 * Get a presigned download URL for a material file.
 * @param {number|string} fileId - The material/file ID
 * @returns {Promise<string>} The temporary download URL
 */
export const getDownloadUrl = async (fileId) => {
    const response = await classApi.get(`/api/v1/classes/materials/${fileId}/download`);
    return response.data.downloadUrl;
};

/**
 * Delete a material file (teacher only).
 * @param {number|string} fileId - The material/file ID
 */
export const deleteMaterial = async (fileId) => {
    await classApi.delete(`/api/v1/classes/teacher/materials/${fileId}`);
};

/**
 * Update the join password for a class (teacher only).
 * @param {number|string} classId - The class ID
 * @param {string} password - The new join password
 * @returns {Promise<Object>} The updated class object
 */
export const updateClassPassword = async (classId, password) => {
    const response = await classApi.put(`/api/v1/classes/teacher/${classId}/password`, { password });
    return response.data;
};

/**
 * Join a class as a student using a code and optional password.
 * @param {string} code - The class code
 * @param {string} [password] - The class join password
 */
export const joinClass = async (code, password) => {
    const response = await classApi.post("/api/v1/classes/student/join", {
        code: code.trim(),
        password: password ? password.trim() : null
    });
    return response.data;
};

/**
 * Fetch all classes for the logged-in student.
 * @returns {Promise<Array>} Array of class objects
 */
export const fetchStudentClasses = async () => {
    const response = await classApi.get("/api/v1/classes/student/all");
    return response.data;
};

/**
 * Fetch all members of a class (teacher view).
 * @param {number|string} classId - The class ID
 * @returns {Promise<Array>} Array of member objects
 */
export const fetchClassMembers = async (classId) => {
    const response = await classApi.get(`/api/v1/classes/${classId}/members`);
    return response.data;
};

export default classApi;

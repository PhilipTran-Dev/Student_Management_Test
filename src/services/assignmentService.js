import { assignmentApi } from "./api";

const ASSIGNMENTS_BASE = "/v1/assignments";
// ─── Teacher endpoints ─────────────────────────────────────────

export const createAssignment = async (formData) => {
    const response = await assignmentApi.post(
        `${ASSIGNMENTS_BASE}/teacher/create`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
};

export const gradeSubmission = async (submissionId, payload) => {
    const response = await assignmentApi.put(
        `${ASSIGNMENTS_BASE}/teacher/submissions/${submissionId}/grade`,
        payload
    );
    return response.data;
};

export const getAssignmentSubmissions = async (assignmentId, status) => {
    const params = status && status !== "all" ? { status } : {};
    const response = await assignmentApi.get(
        `${ASSIGNMENTS_BASE}/teacher/${assignmentId}/submissions`,
        { params }
    );
    return response.data;
};

export const getTeacherAssignments = async (classId) => {
    const response = await assignmentApi.get(
        `${ASSIGNMENTS_BASE}/teacher/class/${classId}`
    );
    return response.data;
};

export const getTeacherAssignmentById = async (assignmentId) => {
    const response = await assignmentApi.get(
        `${ASSIGNMENTS_BASE}/teacher/${assignmentId}`
    );
    return response.data;
};

export const updateAssignment = async (id, formData) => {
    const response = await assignmentApi.put(
        `${ASSIGNMENTS_BASE}/teacher/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
};

export const deleteAssignment = async (id) => {
    const response = await assignmentApi.delete(`${ASSIGNMENTS_BASE}/teacher/${id}`);
    return response.data;
};

export const deleteFile = async (assignmentId, fileName) => {
    const response = await assignmentApi.delete(
        `${ASSIGNMENTS_BASE}/teacher/${assignmentId}/file/${encodeURIComponent(fileName)}`
    );
    return response.data;
};

export const getAttachmentUrl = async (objectName) => {
    const response = await assignmentApi.get(`${ASSIGNMENTS_BASE}/teacher/download-url`, {
        params: { objectName },
    });
    return response.data;
};

export const getClassGradebook = async (classId) => {
    const response = await assignmentApi.get(
        `${ASSIGNMENTS_BASE}/teacher/class/${classId}/gradebook`
    );
    return response.data;
};

// ─── Student endpoints ─────────────────────────────────────────

export const getClassAssignments = async (classId) => {
    const response = await assignmentApi.get(
        `${ASSIGNMENTS_BASE}/student/class/${classId}`
    );
    return response.data;
};

export const getDashboardStats = async () => {
    const response = await assignmentApi.get(`${ASSIGNMENTS_BASE}/student/dashboard-stats`);
    return response.data;
};

export const submitAssignment = async (assignmentId, files) => {
    const formData = new FormData();
    if (files && files.length > 0) {
        files.forEach((file) => formData.append("files", file));
    }
    const response = await assignmentApi.post(
        `${ASSIGNMENTS_BASE}/student/${assignmentId}/submit`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
};

export const unsubmitAssignment = async (assignmentId) => {
    const response = await assignmentApi.delete(
        `${ASSIGNMENTS_BASE}/student/${assignmentId}/unsubmit`
    );
    return response.data;
};

export const getStudentAttachmentUrl = async (objectName) => {
    const response = await assignmentApi.get(`${ASSIGNMENTS_BASE}/student/download-url`, {
        params: { objectName },
    });
    return response.data;
};

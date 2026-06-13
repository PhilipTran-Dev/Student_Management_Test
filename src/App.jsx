import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentLayout from "./student/layouts/StudentLayout";
import StudentDashboardPage from "./student/pages/DashboardPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentProfilePage from "./student/pages/ProfilePage";
import StudentClassListPage from "./student/pages/ClassListPage";
import StudentClassDetailPage from "./student/pages/ClassDetailPage";
import StudentAssignmentListPage from "./student/pages/AssignmentListPage";
import StudentAssignmentDetailPage from "./student/pages/AssignmentDetailPage";
import StudentGradebookPage from "./student/pages/GradebookPage";

import TeacherLayout from "./teacher/layouts/TeacherLayout";
import TeacherProfilePage from "./teacher/pages/ProfilePage";
import TeacherClassListPage from "./teacher/pages/ClassListPage";
import TeacherClassDetailPage from "./teacher/pages/ClassDetailPage";
import TeacherAssignmentListPage from "./teacher/pages/AssignmentListPage";
import TeacherAssignmentDetailPage from "./teacher/pages/AssignmentDetailPage";
import TeacherSubmissionsPage from "./teacher/pages/SubmissionsPage";
import TeacherGradebookPage from "./teacher/pages/GradebookPage";

import AdminLayout from "./admin/layouts/AdminLayout";
import AdminUserManagementPage from "./admin/pages/UserManagementPage";
import AdminFacultyManagementPage from "./admin/pages/FacultyManagementPage";
import AdminCourseManagementPage from "./admin/pages/CourseManagementPage";
import AdminSemesterManagementPage from "./admin/pages/SemesterManagementPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Unified Login — all roles handled by a single component */}
        <Route path="/login" element={<Login />} />
        <Route path="/teacher/login" element={<Login />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboardPage />} />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="classes" element={<StudentClassListPage />} />
          <Route path="classes/:classId" element={<StudentClassDetailPage />} />
          <Route path="assignments" element={<StudentAssignmentListPage />} />
          <Route path="assignments/:assignmentId" element={<StudentAssignmentDetailPage />} />
          <Route path="grades" element={<StudentGradebookPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
        </Route>

        {/* Teacher routes */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<TeacherClassListPage />} />
          <Route path="classes" element={<TeacherClassListPage />} />
          <Route path="classes/:classId" element={<TeacherClassDetailPage />} />
          <Route path="assignments" element={<TeacherAssignmentListPage />} />
          <Route path="assignments/:assignmentId" element={<TeacherAssignmentDetailPage />} />
          <Route path="submissions" element={<TeacherSubmissionsPage />} />
          <Route path="grades" element={<TeacherGradebookPage />} />
          <Route path="profile" element={<TeacherProfilePage />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminUserManagementPage />} />
          <Route path="users" element={<AdminUserManagementPage />} />
          <Route path="faculties" element={<AdminFacultyManagementPage />} />
          <Route path="courses" element={<AdminCourseManagementPage />} />
          <Route path="semesters" element={<AdminSemesterManagementPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
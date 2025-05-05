// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Users/Sidebar";
import AdminSidebar from "./components/Admin/Adminsidebar";
import LandingPage from "./components/LandingPage";
import UserDashboard from "./components/Users/UserCalendar/UserCalendar";
import RequestsPage from "./components/Users/requests/RequestsPage";
import AdminMembers from "./components/Admin/members/AdminMembers";
import AdminCalendar from "./components/Admin/calendar/CalendarPage";
import BudgetTracking from "./components/Admin/Budget/BudgetTracking";
import AdminApprove from "./components/Admin/AdminApprove";
import TaskList from "./components/Users/Tasks/TaskList";
import UserTimesheet from "./components/Users/Tasks/Timesheet";
import AdminTimesheet from "./components/Admin/AdminTimesheet";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

/*Layout for About Us Page */
function AboutUsLayout({ children }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}

/* Layout for User Pages */
function UserLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
    </div>
  );
}

/* Layout for Admin Pages */
function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <AboutUsLayout>
              <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-6 bg-gray-100">
                <LandingPage />
              </div>
            </AboutUsLayout>
          }
        />

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <UserLayout>
                <UserDashboard />
              </UserLayout>
            }
          />
          <Route
            path="/members"
            element={
              <UserLayout>
                <RequestsPage />
              </UserLayout>
            }
          />
          <Route
            path="/tasks"
            element={
              <UserLayout>
                <TaskList />
              </UserLayout>
            }
          />
          <Route
            path="/timesheet"
            element={
              <UserLayout>
                <UserTimesheet />
              </UserLayout>
            }
          />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route
            path="/admin/dashboard"
            element={
              <AdminLayout>
                <AdminCalendar />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminLayout>
                <AdminMembers />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/tasks"
            element={
              <AdminLayout>
                <AdminApprove />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/budget"
            element={
              <AdminLayout>
                <BudgetTracking />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/timesheet"
            element={
              <AdminLayout>
                <AdminTimesheet />
              </AdminLayout>
            }
          />
        </Route>

        {/* Redirect invalid paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

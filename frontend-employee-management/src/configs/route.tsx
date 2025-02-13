import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/login";
import Layout from "../layout/index";
import Profile from "../pages/profile";
import JobTracking from "../pages/jobtracking";
import AdminProfile from "../pages/Admin/adminprofile";
import AdminJobTracking from "../pages/Admin/adminjobtracking";
import PrivateRoute from "../components/PrivateRoute";
import ErrorPage from "../pages/error";
import Admin from "../pages/Admin/admin";
import Employee from "../pages/employee";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/employee",
    element: <Layout isAdmin={false} />,
    children: [
      {
        path: "",
        element: <Employee />,
      },
      {
        path: "profile",
        element: <PrivateRoute element={<Profile />} role='Employee' />,
      },
      {
        path: "job-tracking",
        element: <PrivateRoute element={<JobTracking />} role='Employee' />,
      },
    ],
  },
  {
    path: "/admin",
    element: <Layout isAdmin={true} />,
    children: [
      {
        path: "",
        element: <Admin />,
      },
      {
        path: "profile",
        element: <PrivateRoute element={<AdminProfile />} role='Admin' />,
      },
      {
        path: "job-tracking",
        element: <PrivateRoute element={<AdminJobTracking />} role='Admin' />,
      },
    ],
  },
]);

export default router;

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Entry from "./components/landing/Entry";
import Photo from "./components/photo/Photo";
import Login from "./components/admin/login/Login";
import AdminDashboard from "./components/admin/dashboard/Dashboard";
import UserLogin from "./components/user/login/UserLogin";

function App() {
  const router = createBrowserRouter([
    { path: "/", element: <Entry />, errorElement: "" },
    { path: "/photo", element: <Photo />, errorElement: "" },
    { path: "/admin", element: <Login />, errorElement: "" },
    { path: "/admin/dashboard", element: <AdminDashboard />, errorElement: "" },
    { path: "/portal", element: <UserLogin />, errorElement: "" },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

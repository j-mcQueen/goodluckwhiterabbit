import { RouterProvider, createBrowserRouter } from "react-router-dom";
// import Welcome from "./components/landing/Welcome";
import Photo from "./components/portfolio/photo/Photo";
import Login from "./components/admin/login/Login";
import AdminDashboard from "./components/admin/dashboard/Dashboard";
import UserLogin from "./components/user/login/UserLogin";
import UserDashboard from "./components/user/dashboard/UserDashboard";
// import Preview from "./components/portfolio/preview/Preview";
import Error from "./components/global/Error";
import UnderConstruction from "./components/landing/UnderConstruction";
import Art from "./components/portfolio/art/Art";

function App() {
  const router = createBrowserRouter([
    { path: "/", element: <UnderConstruction />, errorElement: <Error /> },
    { path: "/photo", element: <Photo />, errorElement: <Error /> },
    { path: "/art", element: <Art />, errorElement: <Error /> },
    // { path: "/portfolio", element: <Preview />, errorElement: <Error /> },
    { path: "/admin", element: <Login />, errorElement: <Error /> },
    {
      path: "/admin/dashboard",
      element: <AdminDashboard />,
      errorElement: <Error />,
    },
    { path: "/portal", element: <UserLogin />, errorElement: <Error /> },
    {
      path: "/user/:id/dashboard/",
      element: <UserDashboard />,
      errorElement: "",
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

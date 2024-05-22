import { RouterProvider, createBrowserRouter } from "react-router-dom";
<<<<<<< HEAD
import UnderConstruction from "./components/landing/UnderConstruction";

function App() {
  const router = createBrowserRouter([
    { path: "/", element: <UnderConstruction />, errorElement: "" },
=======
import Entry from "./components/landing/Entry";
import Photo from "./components/photo/Photo";
import Login from "./components/admin/login/Login";

function App() {
  const router = createBrowserRouter([
    { path: "/", element: <Entry />, errorElement: "" },
    { path: "/photo", element: <Photo />, errorElement: "" },
    { path: "/api", element: <Login />, errorElement: "" },
>>>>>>> c9d2b35 (Build admin login form)
  ]);

  return <RouterProvider router={router} />;
}

export default App;

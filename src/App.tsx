import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Entry from "./components/landing/Entry";
import Photo from "./components/photo/Photo";

function App() {
  const router = createBrowserRouter([
    { path: "/", element: <Entry />, errorElement: "" },
    { path: "/photo", element: <Photo />, errorElement: "" },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

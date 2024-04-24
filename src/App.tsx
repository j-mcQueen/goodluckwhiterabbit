import { RouterProvider, createBrowserRouter } from "react-router-dom";

function App() {
  const router = createBrowserRouter([
    { path: "/", element: "", errorElement: "" },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

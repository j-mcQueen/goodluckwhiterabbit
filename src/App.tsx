import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Entry from "./components/landing/Entry";

function App() {
  const router = createBrowserRouter([
    { path: "/", element: <Entry />, errorElement: "" },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

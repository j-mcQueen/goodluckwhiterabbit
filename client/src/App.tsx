import { RouterProvider, createBrowserRouter } from "react-router-dom";
import UnderConstruction from "./components/landing/UnderConstruction";

function App() {
  const router = createBrowserRouter([
    { path: "/", element: <UnderConstruction />, errorElement: "" },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

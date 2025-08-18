import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useEffect, useRef } from "react";
import { initSound } from "./components/global/utils/sound";

import Welcome from "./components/landing/Welcome";
import Login from "./components/admin/login/Login";
import AdminDashboard from "./components/admin/dashboard/Dashboard";
import UserLogin from "./components/user/login/UserLogin";
import UserDashboard from "./components/user/dashboard/UserDashboard";
import Error from "./components/global/Error";
// import Portfolio from "./components/portfolio/Portfolio";

import SAILOR from "./assets/media/sounds/CLOUD.DOMAIN.SLF..wav";

export default function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      initSound(audioRef.current);
    }
  }, []);

  // const portfolioPaths = ["/photo", "/art", "/design"];
  // const portfolioRoutes = portfolioPaths.map((path) => ({
  //   path,
  //   element: <Portfolio route={path} index={portfolioPaths.indexOf(path)} />,
  //   errorElement: <Error />,
  // }));

  const router = createBrowserRouter([
    { path: "/", element: <Welcome />, errorElement: <Error /> },
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
    // ...portfolioRoutes,
  ]);

  return (
    <>
      <audio src={SAILOR} ref={audioRef} preload="auto"></audio>
      <RouterProvider router={router} />
    </>
  );
}

import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import LeftBar from "./components/leftBar/LeftBar";
import RightBar from "./components/rightBar/RightBar";
import Home from "./pages/home/Home";
import Profile from "./pages/profile/Profile";
import "./style.scss";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/authContext";
import { useQuery } from "@tanstack/react-query"; // Thêm import
import { makeRequest } from "./axios"; // Thêm import

function App() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);

  // --- LOGIC MỚI: GỌI API Ở COMPONENT CHA ---
  const Layout = () => {
    // Gọi API để lấy tất cả thông báo ở đây, đúng một lần duy nhất
    const { isLoading, error, data: notifications } = useQuery(["notifications"], () =>
      makeRequest.get("/notifications").then((res) => res.data)
    );

    return (
      <div className={`theme-${darkMode ? "dark" : "light"}`}>
        {/* Truyền dữ liệu notifications xuống cho Navbar */}
        <Navbar notifications={notifications} />
        <div style={{ display: "flex" }}>
          <LeftBar />
          <div style={{ flex: 6 }}>
            <Outlet />
          </div>
          {/* Truyền dữ liệu notifications xuống cho RightBar */}
          <RightBar notifications={notifications} isLoading={isLoading} error={error} />
        </div>
      </div>
    );
  };

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        { path: "/", element: <Home /> },
        { path: "/profile/:id", element: <Profile /> },
      ],
    },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;

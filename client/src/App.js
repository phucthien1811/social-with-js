import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Friends from "./pages/friends/Friends";
import Groups from "./pages/groups/Groups";
import Watch from "./pages/watch/Watch";
import Memories from "./pages/memories/Memories";
import Gaming from "./pages/gaming/Gaming";
import Events from "./pages/events/Events";
import Gallery from "./pages/gallery/Gallery";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useLocation,
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
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "./axios";

function App() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);

  // Layout giờ đây là component duy nhất và thông minh nhất
  const Layout = () => {
    const location = useLocation();
    
    // Kiểm tra xem có phải đang ở trang Watch hay không
    const isWatchPage = location.pathname === "/watch";

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
          {/* PHẦN SỬA LỖI QUAN TRỌNG NHẤT */}
          {/* Phần nội dung chính sẽ luôn có flex: 6 */}
          {/* Khi RightBar bị ẩn, nó sẽ tự động chiếm không gian còn lại */}
          <div style={{ flex: 6 }}>
            <Outlet />
          </div>
          {/* Chỉ hiển thị RightBar khi KHÔNG PHẢI là trang Watch */}
          {!isWatchPage && (
            <RightBar notifications={notifications} isLoading={isLoading} error={error} />
          )}
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

  // Bao gồm tất cả các route của bạn
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
        { path: "/friends", element: <Friends /> },
        { path: "/groups", element: <Groups /> },
        { path: "/watch", element: <Watch /> },
        { path: "/memories", element: <Memories /> },
        { path: "/gaming", element: <Gaming /> },
        { path: "/events", element: <Events /> },
        { path: "/gallery", element: <Gallery /> },
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

import "./navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import Notifications from "../notifications/Notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

// Navbar giờ đây nhận 'notifications' từ props của component Layout (trong App.js)
const Navbar = ({ notifications }) => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State để quản lý việc mở/đóng menu thông báo
  const [openNotifications, setOpenNotifications] = useState(false);

  // Đếm số lượng thông báo chưa đọc từ props
  const unreadCount = notifications?.filter(n => n.isRead === 0).length || 0;

  // Mutation để gọi API đánh dấu đã đọc
  const readMutation = useMutation({
    mutationFn: () => makeRequest.put("/notifications/read"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleNotificationsClick = () => {
    // Khi mở menu, nếu có thông báo chưa đọc, thì gọi mutation
    if (!openNotifications && unreadCount > 0) {
      // Đánh dấu sau một khoảng trễ nhỏ để người dùng kịp thấy
      setTimeout(() => {
        readMutation.mutate();
      }, 2000); 
    }
    setOpenNotifications(!openNotifications);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span>My social</span>
        </Link>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <HomeOutlinedIcon />
        </Link>
        {darkMode ? (
          <WbSunnyOutlinedIcon onClick={toggle} />
        ) : (
          <DarkModeOutlinedIcon onClick={toggle} />
        )}
        <GridViewOutlinedIcon />
        <div className="search">
          <SearchOutlinedIcon />
          <input type="text" placeholder="Search..." />
        </div>
      </div>
      <div className="right">
        <PersonOutlinedIcon />
        <EmailOutlinedIcon />
        
        <div className="notification-icon-container">
          {unreadCount > 0 ? (
            <NotificationsActiveIcon onClick={handleNotificationsClick} style={{ color: '#5271ff' }} />
          ) : (
            <NotificationsOutlinedIcon onClick={handleNotificationsClick} />
          )}
          {unreadCount > 0 && <div className="notification-dot">{unreadCount}</div>}
        </div>
        
        <LogoutOutlinedIcon className="logout-icon" onClick={handleLogout}/>
        
        <div className="user">
          <Link to={`/profile/${currentUser.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={currentUser.profilePic ? `/upload/${currentUser.profilePic}` : "/path/to/default/avatar.png"}
              alt=""
            />
            <span>{currentUser.name}</span>
          </Link>
        </div>
      </div>
      
      {/* Truyền toàn bộ danh sách xuống cho component con */}
      {openNotifications && <Notifications notifications={notifications} />}
    </div>
  );
};

export default Navbar;

import { useState, useEffect } from "react"; // Thêm useEffect
import "./rightBar.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { Link } from "react-router-dom";
import SuggestedUser from "../suggestedUser/SuggestedUser";
import moment from "moment";

const RightBar = () => {
  // --- PHẦN LOGIC GỢI Ý NGƯỜI DÙNG (Giữ nguyên) ---
  const { isLoading: suggestionsLoading, error: suggestionsError, data: allSuggestions } = useQuery(["suggestedUsers"], () =>
    makeRequest.get("/users/suggested").then((res) => res.data)
  );
  const [actedOnUserIds, setActedOnUserIds] = useState(new Set());
  const handleAction = (userId) => {
    setActedOnUserIds(prev => new Set(prev).add(userId));
  };
  const displayedSuggestions = allSuggestions
    ? allSuggestions.filter(user => !actedOnUserIds.has(user.id)).slice(0, 3)
    : [];
  
  // --- PHẦN LOGIC LẤY THÔNG BÁO (Giữ nguyên) ---
  const { 
    isLoading: activitiesLoading, 
    error: activitiesError, 
    data: allNotifications 
  } = useQuery(["notifications"], () =>
    makeRequest.get("/notifications").then((res) => res.data)
  );
  
  // --- BƯỚC SỬA LỖI QUAN TRỌNG NHẤT ---
  // Tạo một state để tạo "nhịp đập" cho component
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    // Cập nhật lại state sau mỗi 60 giây (1 phút)
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); 

    // Dọn dẹp interval khi component bị unmount để tránh rò rỉ bộ nhớ
    return () => clearInterval(interval);
  }, []); // Chỉ chạy hiệu ứng này một lần duy nhất khi component được tạo


  // Hàm renderActivityText giữ nguyên
  const renderActivityText = (activity) => { /* ... code cũ của bạn ... */ };

  return (
    <div className="rightBar">
      <div className="container">
        <div className="item">
          <span>Suggestions For You</span>
          {/* ... code hiển thị suggestions ... */}
        </div>

        <div className="item">
          <span>Latest Activities</span>
          {activitiesError ? "Error!" 
           : activitiesLoading ? "loading..." 
           : allNotifications && allNotifications.slice(0, 5).map(activity => (
            <div className="user" key={activity.id}>
              <div className="userInfo">
                <img
                  src={activity.actorProfilePic ? "/upload/" + activity.actorProfilePic : "/path/to/default/avatar.png"}
                  alt=""
                />
                <p>
                  <Link to={`/profile/${activity.actorId}`} style={{textDecoration: 'none', color: 'inherit', fontWeight: 'bold'}}>
                    <span>{activity.actorName}</span>
                  </Link>
                  &nbsp;{renderActivityText(activity)}
                </p>
              </div>
              {/* Mỗi khi component re-render, dòng này sẽ được tính toán lại */}
              <span>{moment(activity.createdAt).fromNow()}</span>
            </div>
          ))}
        </div>

        <div className="item">
          <span>Online Friends</span>
          {/* ... code cũ của bạn ... */}
        </div>
      </div>
    </div>
  );
};

export default RightBar;
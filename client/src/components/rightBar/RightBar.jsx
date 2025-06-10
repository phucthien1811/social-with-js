import { useState, useEffect } from "react";
import "./rightBar.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { Link } from "react-router-dom";
import SuggestedUser from "../suggestedUser/SuggestedUser";
import moment from "moment"; // Đừng quên import moment

const RightBar = () => {
  // --- PHẦN GỢI Ý NGƯỜI DÙNG (Giữ nguyên) ---
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

  // --- PHẦN MỚI: LẤY DỮ LIỆU HOẠT ĐỘNG GẦN ĐÂY ---
  const { isLoading: activitiesLoading, error: activitiesError, data: latestActivities } = useQuery(["latestActivities"], () =>
    makeRequest.get("/activities").then((res) => res.data)
  );

  // Hàm để tạo ra nội dung thông báo dựa trên loại hoạt động
  const renderActivityText = (activity) => {
    switch (activity.type) {
      case 'like':
        return <span>liked your post.</span>;
      case 'comment':
        return <span>commented on your post.</span>;
      case 'follow':
        return <span>started following you.</span>;
      case 'post':
        return <span>added a new post.</span>;
      case 'story': // <--- THÊM CASE MỚI
        return <span>added a new story.</span>;
      default:
        return <span>had a new activity.</span>;
    }
  };

  return (
    <div className="rightBar">
      <div className="container">
        {/* Phần Suggestions For You */}
        <div className="item">
          <span>Suggestions For You</span>
          {suggestionsError ? "Something went wrong"
           : suggestionsLoading ? "loading..."
           : displayedSuggestions.map((user) => (
              <SuggestedUser 
                user={user} 
                key={user.id} 
                onAction={handleAction}
              />
            ))}
        </div>

        {/* --- PHẦN LATEST ACTIVITIES ĐÃ ĐƯỢC CẬP NHẬT --- */}
        <div className="item">
          <span>Latest Activities</span>
          {activitiesError ? "Error!" 
           : activitiesLoading ? "loading..." 
           : latestActivities && latestActivities.map(activity => (
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
              <span>{moment(activity.createdAt).fromNow()}</span>
            </div>
          ))}
        </div>

        {/* Phần Online Friends (Giữ nguyên) */}
        <div className="item">
          <span>Online Friends</span>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt=""
              />
              <div className="online" />
              <span>Jane Doe</span>
            </div>
          </div>
          {/* ... các bạn bè online khác ... */}
        </div>
      </div>
    </div>
  );
};

export default RightBar;

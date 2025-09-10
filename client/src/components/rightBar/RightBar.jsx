import { useState, useEffect } from "react";
import "./rightBar.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { Link } from "react-router-dom";
import SuggestedUser from "../suggestedUser/SuggestedUser";
import moment from "moment";

const RightBar = () => {
  // --- PHẦN LOGIC GỢI Ý NGƯỜI DÙNG ---
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
  
  // --- PHẦN LOGIC LẤY THÔNG BÁO ---
  const { 
    isLoading: activitiesLoading, 
    error: activitiesError, 
    data: allNotifications 
  } = useQuery(["notifications"], () =>
    makeRequest.get("/notifications").then((res) => res.data)
  );
  
  // --- PHẦN LOGIC TỰ ĐỘNG CẬP NHẬT THỜI GIAN ---

  // --- HÀM RENDER NỘI DUNG THÔNG BÁO (ĐẦY ĐỦ) ---
  const renderActivityText = (activity) => {
    const actorName = <Link to={`/profile/${activity.actorId}`} style={{textDecoration: 'none', color: 'inherit', fontWeight: 'bold'}}><span>{activity.actorName}</span></Link>;
    
    switch (activity.type) {
      case 'like':
        return <p>{actorName} liked your post.</p>;
      case 'comment':
        return <p>{actorName} commented on your post.</p>;
      case 'follow':
        return <p>{actorName} started following you.</p>;
      case 'post':
        return <p>{actorName} added a new post.</p>;
      case 'story':
        return <p>{actorName} added a new story.</p>;
      default:
        return <p>{actorName} had a new activity.</p>;
    }
  };

  return (
    <div className="rightBar">
      <div className="container">
        <div className="item">
          <span>Suggestions For You</span>
          {suggestionsError ? (
            <div className="no-data">Error loading suggestions</div>
          ) : suggestionsLoading ? (
            <div className="no-data">Loading...</div>
          ) : displayedSuggestions.length === 0 ? (
            <div className="no-data">No suggestions</div>
          ) : (
            displayedSuggestions.map((user) => (
              <SuggestedUser 
                user={user} 
                key={user.id} 
                onAction={handleAction}
              />
            ))
          )}
        </div>

        <div className="item">
          <span>Latest Activities</span>
          {activitiesError ? (
            <div className="no-data">Error loading activities</div>
          ) : activitiesLoading ? (
            <div className="no-data">Loading...</div>
          ) : allNotifications && allNotifications.length > 0 ? (
            allNotifications.slice(0, 5).map(activity => (
              <div className="user" key={activity.id}>
                <div className="userInfo">
                  <img
                    src={activity.actorProfilePic ? "/upload/" + activity.actorProfilePic : "/upload/default.jpg"}
                    alt=""
                  />
                  {renderActivityText(activity)}
                </div>
                <span>{moment(activity.createdAt).fromNow()}</span>
              </div>
            ))
          ) : (
            <div className="no-data">No recent activities</div>
          )}
        </div>

        <div className="item">
          <span>Online Friends</span>          <div className="user">
            <div className="userInfo">
              <img
                src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt=""
              />
              <div className="online" />
              <span>Jane Doe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightBar;

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { Link } from "react-router-dom";
import moment from "moment";
import "./notifications.scss";

const Notifications = ({ notifications, isLoading, error }) => {
  const queryClient = useQueryClient();

  // Mutation để đánh dấu đã đọc
  const mutation = useMutation({
    mutationFn: () => makeRequest.put("/notifications/read"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleMarkAsRead = () => {
    mutation.mutate();
  };

  // Hàm render nội dung thông báo
  const renderNotificationText = (notification) => {
    const actorName = <span className="actor-name">{notification.actorName}</span>;
    switch (notification.type) {
      case 'like': return <p>{actorName} liked your post.</p>;
      case 'comment': return <p>{actorName} commented on your post.</p>;
      case 'follow': return <p>{actorName} started following you.</p>;
      case 'post': return <p>{actorName} added a new post.</p>;
      case 'story': return <p>{actorName} added a new story.</p>;
      default: return <p>{actorName} had a new activity.</p>;
    }
  };

  return (
    <div className="notifications-dropdown">
      <div className="header">
        <h3>Thông báo</h3>
        <span className="mark-as-read" onClick={handleMarkAsRead}>
          Đánh dấu tất cả là đã đọc
        </span>
      </div>
      <div className="notification-list">
        {error ? "Lỗi!" 
         : isLoading ? "loading..." 
         : notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <Link 
                to={`/profile/${notification.actorId}`} 
                className="notification-item" 
                key={notification.id} 
                // Sử dụng isRead trực tiếp từ API
                data-read={notification.isRead}
              >
                <img src={notification.actorProfilePic ? "/upload/" + notification.actorProfilePic : "/path/to/default/avatar.png"} alt=""/>
                <div className="notification-content">
                  {renderNotificationText(notification)}
                  <span className="timestamp">{moment(notification.createdAt).fromNow()}</span>
                </div>
                {/* --- SỬA LỖI QUAN TRỌNG NHẤT --- */}
                {/* Hiển thị chấm xanh cho BẤT KỲ thông báo nào chưa đọc */}
                {!notification.isRead && <div className="unread-dot"></div>}
              </Link>
            ))
         ) : (
            <p className="no-notifications">Không có thông báo mới.</p>
         )}
      </div>
    </div>
  );
};

export default Notifications;

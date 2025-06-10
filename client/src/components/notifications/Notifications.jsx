import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { Link } from "react-router-dom";
import moment from "moment";
import "./notifications.scss";

const Notifications = ({ notifications, isLoading, error }) => {
  const queryClient = useQueryClient();

  // --- SỬA LẠI THEO PHƯƠNG PHÁP CHUẨN ĐỂ TRÁNH RACE CONDITION ---
  const mutation = useMutation({
    mutationFn: () => {
      // Hàm thực hiện việc gọi API
      return makeRequest.put("/notifications/read");
    },
    
    // onMutate sẽ được gọi ngay lập tức khi bạn bấm nút
    onMutate: async () => {
      // Hủy bỏ bất kỳ lượt fetch nào đang diễn ra để tránh nó ghi đè lên cập nhật của chúng ta
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      // Lưu lại trạng thái cũ để phòng trường hợp có lỗi
      const previousNotifications = queryClient.getQueryData(["notifications"]);

      // Cập nhật giao diện ngay lập tức một cách "lạc quan"
      queryClient.setQueryData(["notifications"], (oldData) => {
        if (!oldData) return [];
        return oldData.map(notification => ({ ...notification, isRead: 1 }));
      });

      // Trả về dữ liệu cũ để có thể khôi phục nếu lỗi
      return { previousNotifications };
    },
    
    // Nếu API gọi bị lỗi, quay trở lại trạng thái cũ
    onError: (err, variables, context) => {
      if (context.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
    },
    
    // CHÚNG TA SẼ KHÔNG DÙNG onSettled nữa để tránh việc refetch quá sớm gây nhấp nháy.
    // React Query sẽ tự động làm mới lại dữ liệu ở lần tiếp theo một cách thông minh.
  });

  const handleMarkAsRead = () => {
    // Chỉ thực hiện nếu có thông báo chưa đọc
    if (notifications?.some(n => n.isRead === 0)) {
      mutation.mutate();
    }
  };

  // Hàm render nội dung thông báo (đầy đủ)
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
              <Link to={`/profile/${notification.actorId}`} className="notification-item" key={notification.id} data-read={notification.isRead}>
                <img src={notification.actorProfilePic ? "/upload/" + notification.actorProfilePic : "/path/to/default/avatar.png"} alt=""/>
                <div className="notification-content">
                  {renderNotificationText(notification)}
                  <span className="timestamp">{moment(notification.createdAt).fromNow()}</span>
                </div>
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

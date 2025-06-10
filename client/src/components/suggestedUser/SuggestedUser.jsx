import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { Link } from "react-router-dom";
import "./suggestedUser.scss";

const SuggestedUser = ({ user, onAction }) => {
  const queryClient = useQueryClient();

  const followMutation = useMutation(
    () => {
      return makeRequest.post("/relationships", { userId: user.id });
    },
    {
      onSuccess: () => {
        // --- BƯỚC SỬA LỖI ---
        // Sau khi follow thành công, làm mới cả hai query
        queryClient.invalidateQueries(["posts"]);
        queryClient.invalidateQueries(["stories"]); // <--- THÊM DÒNG NÀY

        // Các lệnh khác giữ nguyên
        queryClient.invalidateQueries(["suggestedUsers"]);
        queryClient.invalidateQueries(["relationship", user.id]);
        onAction(user.id);
      },
    }
  );

  const handleFollow = () => {
    followMutation.mutate();
  };

  const handleDismiss = () => {
    onAction(user.id);
  };

  return (
    <div className="user">
      <div className="userInfo">
        <img
          src={user.profilePic ? "/upload/" + user.profilePic : "/path/to/default/avatar.png"}
          alt=""
        />
        <Link to={`/profile/${user.id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <span>{user.name}</span>
        </Link>
      </div>
      <div className="buttons">
        <button onClick={handleFollow}>follow</button>
        <button onClick={handleDismiss}>dismiss</button>
      </div>
    </div>
  );
};

export default SuggestedUser;

import { useState } from "react";
import "./rightBar.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import SuggestedUser from "../suggestedUser/SuggestedUser";

const RightBar = () => {
  // Số lượng gợi ý muốn hiển thị cùng lúc
  const SUGGESTIONS_TO_SHOW = 3;

  // Fetch danh sách gợi ý từ API
  const { isLoading, error, data: allSuggestions } = useQuery(["suggestedUsers"], () =>
    makeRequest.get("/users/suggested").then((res) => res.data)
  );

  // --- LOGIC MỚI ĐÃ ĐƯỢC SỬA LẠI HOÀN TOÀN ---
  // State để lưu ID của những người đã bị follow hoặc dismiss
  const [actedOnUserIds, setActedOnUserIds] = useState(new Set());

  // Hàm được gọi khi người dùng bấm follow hoặc dismiss
  const handleAction = (userId) => {
    // Chỉ cần thêm ID của người đó vào danh sách đã hành động
    setActedOnUserIds(prev => new Set(prev).add(userId));
  };

  // Lọc ra danh sách những người sẽ được hiển thị
  // Bằng cách lấy từ danh sách gốc, trừ đi những người đã hành động
  const displayedSuggestions = allSuggestions
    ? allSuggestions.filter(user => !actedOnUserIds.has(user.id)).slice(0, SUGGESTIONS_TO_SHOW)
    : [];

  return (
    <div className="rightBar">
      <div className="container">
        <div className="item">
          <span>Suggestions For You</span>
          {error
            ? "Something went wrong"
            : isLoading
            ? "loading..."
            : displayedSuggestions.map((user) => (
                <SuggestedUser 
                  user={user} 
                  key={user.id} 
                  onAction={handleAction} // Truyền hàm xử lý xuống component con
                />
              ))}
        </div>

        {/* CÁC PHẦN CŨ CỦA BẠN ĐƯỢC GIỮ NGUYÊN */}
        <div className="item">
          <span>Latest Activities</span>
          <div className="user">
            {/* ... code cũ của bạn ... */}
          </div>
        </div>
        <div className="item">
          <span>Online Friends</span>
          <div className="user">
            {/* ... code cũ của bạn ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightBar;

import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import "./friends.scss";
import { useState } from "react";

const Friends = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoading, error, data: friends } = useQuery({
    queryKey: ["friends"],
    queryFn: () =>
      makeRequest.get("/friends/list").then((res) => {
        return res.data;
      }),
  });

  // Filter friends based on search query
  const filteredFriends = friends?.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="friends">
      <div className="container">
        <div className="left">
          <h1>Bạn bè</h1>
          <div className="menu">
            <div 
              className={`item ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              <span>Tất cả bạn bè</span>
            </div>
            <div 
              className={`item ${activeTab === "requests" ? "active" : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              <span>Lời mời kết bạn</span>
            </div>
            <div 
              className={`item ${activeTab === "suggestions" ? "active" : ""}`}
              onClick={() => setActiveTab("suggestions")}
            >
              <span>Gợi ý kết bạn</span>
            </div>
          </div>
        </div>
        <div className="right">
          <div className="search">
            <input 
              type="text" 
              placeholder="Tìm kiếm bạn bè" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="friendList">
            {error ? (
              "Đã xảy ra lỗi!"
            ) : isLoading ? (
              "Đang tải..."
            ) : filteredFriends?.length === 0 ? (
              "Không tìm thấy bạn bè nào"
            ) : (
              filteredFriends?.map((friend) => (
                <div className="friend" key={friend.id}>
                  <div className="info">
                    <img src={"/upload/" + friend.profilePic} alt="" />
                    <div className="details">
                      <span className="name">{friend.name}</span>
                      <span className="mutualFriends">5 bạn chung</span>
                    </div>
                  </div>
                  <div className="actions">
                    <button className="message">Nhắn tin</button>
                    <button className="unfriend">Hủy kết bạn</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;

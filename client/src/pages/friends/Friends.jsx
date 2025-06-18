import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import "./friends.scss";
import { useState } from "react";

const Friends = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { isLoading: friendsLoading, error: friendsError, data: friends } = useQuery({
    queryKey: ["friends"],
    queryFn: () =>
      makeRequest.get("/friends/list").then((res) => {
        return res.data;
      }),
  });

  const { isLoading: suggestionsLoading, error: suggestionsError, data: suggestions } = useQuery({
    queryKey: ["friendSuggestions"],
    queryFn: () =>
      makeRequest.get("/friends/suggestions").then((res) => {
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
        <div className="left">          <h1>Bạn bè</h1>
          <div className="menu">
            <div 
              className={`item ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              <span>Tất cả bạn bè</span>
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
          </div>          {activeTab === "all" ? (
            <div className="friendList">
              {friendsError ? (
                "Đã xảy ra lỗi!"
              ) : friendsLoading ? (
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
                        <span className="mutualFriends">{friend.mutualFriends} bạn chung</span>
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
          ) : (
            // Tab Suggestions
            <div className="suggestions">
              <div className="title">Gợi ý cho bạn</div>
              <div className="friendList">
                {suggestionsError ? (
                  "Đã xảy ra lỗi!"
                ) : suggestionsLoading ? (
                  "Đang tải..."
                ) : suggestions?.length === 0 ? (
                  "Không có gợi ý nào"
                ) : (
                  suggestions?.map((user) => (
                    <div className="friend suggestion" key={user.id}>
                      <div className="info">
                        <img src={"/upload/" + user.profilePic} alt="" />
                        <div className="details">
                          <span className="name">{user.name}</span>
                          <span className="mutualFriends">{user.mutualFriends} bạn chung</span>
                        </div>
                      </div>
                      <div className="actions">
                        <button className="follow">Kết bạn</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;

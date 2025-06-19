import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import "./groups.scss";
import { useState } from "react";

const Groups = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { isLoading, error, data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: () =>
      makeRequest.get("/groups").then((res) => {
        return res.data;
      }),
  });

  // Filter groups based on search
  const filteredGroups = groups?.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="groups">
      <div className="container">
        <div className="left">
          <div className="search">
            <input 
              type="text" 
              placeholder="Tìm kiếm nhóm" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="menu">
            <div className="title">Nhóm</div>
            <div 
              className={`item ${activeTab === "feed" ? "active" : ""}`}
              onClick={() => setActiveTab("feed")}
            >
              <span>Bảng feed của bạn</span>
            </div>
            <div 
              className={`item ${activeTab === "discover" ? "active" : ""}`}
              onClick={() => setActiveTab("discover")}
            >
              <span>Khám phá</span>
            </div>
            <div 
              className={`item ${activeTab === "your-groups" ? "active" : ""}`}
              onClick={() => setActiveTab("your-groups")}
            >
              <span>Nhóm của bạn</span>
            </div>
            <button className="createGroup">+ Tạo nhóm mới</button>
          </div>

          <div className="joinedGroups">
            <div className="title">Nhóm bạn đã tham gia</div>
            {error ? (
              "Đã có lỗi xảy ra!"
            ) : isLoading ? (
              "Đang tải..."
            ) : filteredGroups?.filter(group => group.isMember).map((group) => (
              <div className="group" key={group.id}>
                <img src={group.cover_img || "/default-group-cover.jpg"} alt="" />
                <div className="details">
                  <span className="name">{group.name}</span>
                  <span className="members">{group.memberCount} thành viên</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="right">
          {activeTab === "feed" && (
            <div className="groupFeed">
              <h2>Bài viết từ nhóm của bạn</h2>
              {/* Group posts will go here */}
            </div>
          )}

          {activeTab === "discover" && (
            <div className="discoverGroups">
              <h2>Khám phá nhóm</h2>
              <div className="groupGrid">
                {error ? (
                  "Đã có lỗi xảy ra!"
                ) : isLoading ? (
                  "Đang tải..."
                ) : filteredGroups?.filter(group => !group.isMember).map((group) => (
                  <div className="groupCard" key={group.id}>
                    <img src={group.cover_img || "/default-group-cover.jpg"} alt="" />
                    <div className="info">
                      <h3>{group.name}</h3>
                      <p>{group.description}</p>
                      <span className="members">{group.memberCount} thành viên</span>
                      <button className="join">+ Tham gia nhóm</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "your-groups" && (
            <div className="yourGroups">
              <h2>Nhóm của bạn</h2>
              <div className="groupGrid">
                {error ? (
                  "Đã có lỗi xảy ra!"
                ) : isLoading ? (
                  "Đang tải..."
                ) : filteredGroups?.filter(group => group.isMember).map((group) => (
                  <div className="groupCard" key={group.id}>
                    <img src={group.cover_img || "/default-group-cover.jpg"} alt="" />
                    <div className="info">
                      <h3>{group.name}</h3>
                      <p>{group.description}</p>
                      <span className="members">{group.memberCount} thành viên</span>
                      {group.isAdmin && <span className="admin">Quản trị viên</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;

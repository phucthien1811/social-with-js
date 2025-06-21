import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import "./memories.scss";
import { useState } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import ReplayIcon from "@mui/icons-material/Replay";

const Memories = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Get memories/posts from the same day in previous years
  const { isLoading, error, data: memories } = useQuery(["memories"], () =>
    makeRequest.get("/posts/memories").then((res) => {
      return res.data;
    })
  );

  // Group memories by year
  const memoriesByYear = memories ? memories.reduce((acc, memory) => {
    const year = moment(memory.createdAt).year();
    if (!acc[year]) acc[year] = [];
    acc[year].push(memory);
    return acc;
  }, {}) : {};

  return (
    <div className="memories">
      <div className="memoryContainer">
        <div className="sidebar">
          <h2>Kỷ niệm của bạn</h2>
          <div className="yearsFilter">
            {Object.keys(memoriesByYear).map(year => (
              <div 
                key={year} 
                className={`yearItem ${selectedYear === parseInt(year) ? "active" : ""}`}
                onClick={() => setSelectedYear(parseInt(year))}
              >
                <AutoStoriesOutlinedIcon />
                <span>{year}</span>
                <span className="count">{memoriesByYear[year].length}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="memoryFeed">
          <div className="memoryHeader">
            <h1>Vào ngày này</h1>
            <p>Chúng tôi hy vọng bạn thích nhìn lại những kỷ niệm này</p>
          </div>

          {error ? (
            "Đã có lỗi khi tải kỷ niệm!"
          ) : isLoading ? (
            "Đang tải..."
          ) : memories && memories.length > 0 ? (
            <div className="memories-grid">
              {memoriesByYear[selectedYear]?.map((memory) => (
                <div className="memoryCard" key={memory.id}>
                  <div className="timeAgo">
                    <ReplayIcon />
                    <span>{moment(memory.createdAt).fromNow()}</span>
                  </div>
                  
                  <div className="user">
                    <div className="userInfo">
                      <img src={memory.profilePic} alt="" />
                      <div className="details">
                        <Link
                          to={`/profile/${memory.userId}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <span className="name">{memory.name}</span>
                        </Link>
                        <span className="date">{moment(memory.createdAt).format("MMMM D, YYYY")}</span>
                      </div>
                    </div>
                    <MoreHorizIcon />
                  </div>

                  <div className="content">
                    <p>{memory.desc}</p>
                    {memory.img && <img src={memory.img} alt="" />}
                  </div>

                  <div className="info">
                    <div className="item">
                      <ThumbUpOutlinedIcon />
                      <span>{memory.likes} likes</span>
                    </div>
                    <div className="item">
                      <span>{memory.comments} comments</span>
                    </div>
                  </div>

                  <div className="actions">
                    <div className="item">
                      <FavoriteOutlinedIcon />
                      <span>Like</span>
                    </div>
                    <div className="item">
                      <ShareOutlinedIcon />
                      <span>Share</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="noMemories">
              <img src="/memories-empty.png" alt="No memories" />
              <h3>Chưa có kỷ niệm nào vào ngày này</h3>
              <p>Hãy tiếp tục chia sẻ và tạo thêm kỷ niệm mới!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Memories;

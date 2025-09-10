import { useContext, useState } from "react";
import "./stories.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';

const Stories = () => {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [menuOpenId, setMenuOpenId] = useState(null);
  
  // State để theo dõi vị trí của slide hiện tại
  const [currentSlide, setCurrentSlide] = useState(0);

  const { isLoading, error, data } = useQuery(["stories"], () =>
    makeRequest.get("/stories").then((res) => res.data)
  );

  // --- LOGIC ĐĂNG STORY (Đầy đủ) ---
  const upload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      return res.data;
    } catch (err) { console.log(err); }
  };
  const addMutation = useMutation(
    (newStory) => { return makeRequest.post("/stories", newStory); },
    { onSuccess: () => { queryClient.invalidateQueries(["stories"]); } }
  );
  const handleAddStory = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imgUrl = await upload(file);
    if (imgUrl) { addMutation.mutate({ img: imgUrl }); }
  };

  // --- LOGIC XÓA STORY (Đầy đủ) ---
  const deleteMutation = useMutation(
    (storyId) => { return makeRequest.delete("/stories/" + storyId); },
    { onSuccess: () => { queryClient.invalidateQueries(["stories"]); } }
  );
  const handleDelete = (storyId) => {
    deleteMutation.mutate(storyId);
  };

  // --- LOGIC CUỘN QUA LẠI BẰNG TRANSFORM (Đầy đủ và Chính xác) ---
  const storiesPerPage = 4; // Số story của bạn bè hiển thị cùng lúc
  const totalStories = data ? data.length : 0;
  
  const handleScroll = (direction) => {
    if (direction === "left") {
      // Lùi lại 1 slide, nhưng không lùi quá slide đầu tiên (số 0)
      setCurrentSlide(Math.max(currentSlide - 1, 0));
    } else {
      // Tiến lên 1 slide, nhưng không vượt quá giới hạn
      // Tổng số slide có thể có = tổng số story - số story hiển thị
      const maxSlide = Math.max(totalStories - storiesPerPage, 0);
      setCurrentSlide(Math.min(currentSlide + 1, maxSlide));
    }
  };
  
  // Tính toán vị trí di chuyển
  const storyWidth = 140; // Chiều rộng 1 story
  const storyGap = 10;    // Khoảng cách
  const slideOffset = -currentSlide * (storyWidth + storyGap);

  return (
    <div className="stories">
      <div className="stories-container">
        {/* Nút cuộn sang trái - chỉ hiện khi không ở slide đầu tiên */}
        {currentSlide > 0 && (
          <button className="nav-btn prev" onClick={() => handleScroll('left')}>
            <ArrowBackIosNewOutlinedIcon />
          </button>
        )}
        
        {/* Khung nhìn, ẩn đi phần thừa */}
        <div className="stories-viewport">
          {/* Wrapper chứa tất cả các story, sẽ được di chuyển bằng transform */}
          <div className="stories-wrapper" style={{ transform: `translateX(${slideOffset}px)` }}>
            {/* Story để thêm mới */}
            <div className="story">
              <img src={"/upload/" + currentUser.profilePic} alt="" />
              <span>Add Story</span>
              <input type="file" id="storyFile" style={{ display: "none" }} onChange={handleAddStory}/>
              <label htmlFor="storyFile">+</label>
            </div>

            {/* Các story khác */}
            {error ? "Lỗi!" 
            : isLoading ? "loading..." 
            : data && data.map((story) => (
                <div className="story" key={story.id}>
                  <img src={"/upload/" + story.img} alt="" />
                  <span>{story.name}</span>
                  {story.userId === currentUser.id && (
                    <MoreHorizIcon
                      className="more-icon"
                      onClick={() => setMenuOpenId(menuOpenId === story.id ? null : story.id)}
                    />
                  )}
                  {menuOpenId === story.id && (
                    <button className="delete-button" onClick={() => handleDelete(story.id)}>
                      Delete
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
        
        {/* Nút cuộn sang phải - chỉ hiện khi vẫn còn story ở phía sau */}
        {data && totalStories > storiesPerPage && currentSlide < (totalStories - storiesPerPage) && (
            <button className="nav-btn next" onClick={() => handleScroll('right')}>
                <ArrowForwardIosOutlinedIcon />
            </button>
        )}
      </div>
    </div>
  );
};

export default Stories;

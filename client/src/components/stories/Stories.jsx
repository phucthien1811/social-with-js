import { useContext, useState } from "react";
import "./stories.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const Stories = () => {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  
  // State để lưu ID của story đang mở menu
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Lấy dữ liệu stories
  const { isLoading, error, data } = useQuery(["stories"], () =>
    makeRequest.get("/stories").then((res) => {
      return res.data;
    })
  );

  // --- LOGIC ĐĂNG STORY (Giữ nguyên) ---
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
    {
      onSuccess: () => { queryClient.invalidateQueries(["stories"]); },
    }
  );
  const handleAddStory = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imgUrl = await upload(file);
    if (imgUrl) { addMutation.mutate({ img: imgUrl }); }
  };

  // --- LOGIC XÓA STORY (Phần mới) ---
  const deleteMutation = useMutation(
    (storyId) => {
      return makeRequest.delete("/stories/" + storyId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["stories"]);
      },
    }
  );
  const handleDelete = (storyId) => {
    deleteMutation.mutate(storyId);
  };

  return (
    <div className="stories">
      <div className="story">
        <img src={"/upload/" + currentUser.profilePic} alt="" />
        <span>{currentUser.name}</span>
        <input type="file" id="storyFile" style={{ display: "none" }} onChange={handleAddStory}/>
        <label htmlFor="storyFile">+</label>
      </div>

      {error ? "Lỗi!" : isLoading ? "loading..."
        : data && data.map((story) => (
            <div className="story" key={story.id}>
              <img src={"/upload/" + story.img} alt="" />
              <span>{story.name}</span>
              
              {/* Chỉ hiển thị nút 3 chấm nếu story là của bạn */}
              {story.userId === currentUser.id && (
                <MoreHorizIcon 
                  className="more-icon" 
                  onClick={() => setMenuOpenId(menuOpenId === story.id ? null : story.id)}
                />
              )}
              {/* Nếu menu của story này đang mở, hiển thị nút xóa */}
              {menuOpenId === story.id && (
                <button className="delete-button" onClick={() => handleDelete(story.id)}>
                  Delete
                </button>
              )}
            </div>
          ))}
    </div>
  );
};

export default Stories;

import "./profile.scss";
import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Posts from "../../components/posts/Posts";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import Update from "../../components/update/Update";

const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const userId = parseInt(useLocation().pathname.split("/")[2]);
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery(
    ["user", userId],
    () => makeRequest.get("/users/find/" + userId).then((res) => res.data),
    { enabled: !!userId }
  );

  const { isLoading: rIsLoading, data: relationshipData } = useQuery(
    ["relationship", userId],
    () => makeRequest.get("/relationships?followedUserId=" + userId).then((res) => res.data),
    { enabled: !!userId }
  );

  const mutation = useMutation(
    (following) => {
      if (following) return makeRequest.delete("/relationships?userId=" + userId);
      return makeRequest.post("/relationships", { userId });
    },
    {
      onSuccess: () => {
        // --- BƯỚC SỬA LỖI QUAN TRỌNG NHẤT ---
        // Sau khi follow/unfollow thành công, làm mới tất cả các dữ liệu liên quan
        
        queryClient.invalidateQueries(["relationship", userId]);
        queryClient.invalidateQueries(["posts"]);
        queryClient.invalidateQueries(["stories"]);
        queryClient.invalidateQueries(["suggestedUsers"]); // <--- THÊM DÒNG NÀY
      },
    }
  );

  const handleFollow = () => {
    if (relationshipData) {
      mutation.mutate(relationshipData.includes(currentUser.id));
    }
  };

  return (
    <div className="profile">
      {error ? "Something went wrong!" 
      : (isLoading ? "loading" 
      : ( data &&
        <>
          <div className="images">
            <img src={"/upload/" + data.coverPic} alt="" className="cover" />
            <img src={"/upload/" + data.profilePic} alt="" className="profilePic" />
          </div>
          <div className="profileContainer">
            <div className="uInfo">
              <div className="left">
                <a href="http://facebook.com"><FacebookTwoToneIcon fontSize="large" /></a>
                <a href="#"><InstagramIcon fontSize="large" /></a>
                <a href="#"><LinkedInIcon fontSize="large" /></a>
              </div>
              <div className="center">
                <span>{data.name}</span>
                <div className="info">
                  <div className="item"><PlaceIcon /><span>{data.city}</span></div>
                  <div className="item"><LanguageIcon /><span>{data.website}</span></div>
                </div>
                {rIsLoading ? "loading" 
                : (userId === currentUser.id ? (
                  <button onClick={() => setOpenUpdate(true)}>Update</button>
                ) : (
                  <button onClick={handleFollow}>
                    {relationshipData && relationshipData.includes(currentUser.id)
                      ? "Following"
                      : "Follow"}
                  </button>
                ))}
              </div>
              <div className="right">
                <EmailOutlinedIcon />
                <MoreVertIcon />
              </div>
            </div>
            <Posts userId={userId} />
          </div>
        </>
      ))}
      {openUpdate && data && <Update setOpenUpdate={setOpenUpdate} user={data} />}
    </div>
  );
};

export default Profile;

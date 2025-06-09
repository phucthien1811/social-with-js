import { useContext, useState } from "react";
import { makeRequest } from "../../axios";
import "./update.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { AuthContext } from "../../context/authContext";

const Update = ({ setOpenUpdate, user }) => {
  const [cover, setCover] = useState(null);
  const [profile, setProfile] = useState(null);
  const [texts, setTexts] = useState({
    name: user.name,
    city: user.city,
    website: user.website,
  });

  const { updateUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const upload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setTexts((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const mutation = useMutation(
    (user) => {
      return makeRequest.put("/users", user);
    },
    {
      // =======================================================
      // THAY ĐỔI QUYẾT ĐỊNH NẰM Ở ĐÂY
      // =======================================================
      onSuccess: (axiosResponse) => {
        // 'axiosResponse' là cả object lớn, chúng ta chỉ cần 'axiosResponse.data'
        const userData = axiosResponse.data;
        
        // Gọi updateUser với ĐÚNG object user
        updateUser(userData);

        // Vô hiệu hóa query để trang profile tự cập nhật
        queryClient.invalidateQueries(["user"]);
      },
      onError: (error) => {
        console.error("LỖI KHI CẬP NHẬT:", error);
      }
    }
  );

  const handleClick = async (e) => {
    e.preventDefault();

    let coverUrl = cover ? await upload(cover) : user.coverPic;
    let profileUrl = profile ? await upload(profile) : user.profilePic;

    mutation.mutate({
      ...texts,
      coverPic: coverUrl,
      profilePic: profileUrl,
    });
    
    setOpenUpdate(false);
  };

  return (
    <div className="update">
        <div className="wrapper">
            <h1>Update Your Profile</h1>
            <form>
                {/* Phần JSX không có lỗi, giữ nguyên */}
                <div className="files">
                    <label htmlFor="cover">
                        <span>Cover Picture</span>
                        <div className="imgContainer"><img src={cover ? URL.createObjectURL(cover) : "/upload/" + user.coverPic} alt="" /><CloudUploadIcon className="icon" /></div>
                    </label>
                    <input type="file" id="cover" style={{ display: "none" }} onChange={(e) => setCover(e.target.files[0])}/>
                    <label htmlFor="profile">
                        <span>Profile Picture</span>
                        <div className="imgContainer"><img src={profile ? URL.createObjectURL(profile) : "/upload/" + user.profilePic} alt="" /><CloudUploadIcon className="icon" /></div>
                    </label>
                    <input type="file" id="profile" style={{ display: "none" }} onChange={(e) => setProfile(e.target.files[0])}/>
                </div>
                <label>Name</label>
                <input type="text" value={texts.name} name="name" onChange={handleChange}/>
                <label>Country / City</label>
                <input type="text" name="city" value={texts.city} onChange={handleChange}/>
                <label>Website</label>
                <input type="text" name="website" value={texts.website} onChange={handleChange}/>
                <button onClick={handleClick}>Update</button>
            </form>
            <button className="close" onClick={() => setOpenUpdate(false)}>Close</button>
        </div>
    </div>
  );
};

export default Update;

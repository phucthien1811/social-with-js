import "./rightBar.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { Link } from "react-router-dom";

const RightBar = () => {
  // --- PHẦN 1: LẤY DỮ LIỆU GỢI Ý NGƯỜI DÙNG ---
  const { isLoading, error, data: suggestedUsers } = useQuery(["suggestedUsers"], () =>
    makeRequest.get("/users/suggested").then((res) => {
      return res.data;
    })
  );

  return (
    <div className="rightBar">
      <div className="container">

        {/* --- PHẦN 2: HIỂN THỊ CÁC GỢI Ý --- */}
        <div className="item">
          <span>Suggestions For You</span>
          {error
            ? "Something went wrong"
            : isLoading
            ? "loading..."
            : suggestedUsers && suggestedUsers.map((user) => (
                <div className="user" key={user.id}>
                  <div className="userInfo">
                    <img
                      src={user.profilePic ? "/upload/" + user.profilePic : "/path/to/default/avatar.png"}
                      alt=""
                    />
                    <Link to={`/profile/${user.id}`} style={{textDecoration: "none", color: "inherit"}}>
                      <span>{user.name}</span>
                    </Link>
                  </div>
                  <div className="buttons">
                    {/* TODO: Thêm logic cho nút follow sau */}
                    <button>follow</button>
                    <button>dismiss</button>
                  </div>
                </div>
              ))}
        </div>

        {/* --- CÁC PHẦN CŨ CỦA BẠN ĐƯỢC GIỮ NGUYÊN --- */}
        <div className="item">
          <span>Latest Activities</span>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt=""
              />
              <p>
                <span>Jane Doe</span> changed their cover picture
              </p>
            </div>
            <span>1 min ago</span>
          </div>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt=""
              />
              <p>
                <span>Jane Doe</span> changed their cover picture
              </p>
            </div>
            <span>1 min ago</span>
          </div>
          {/* ... các hoạt động khác ... */}
        </div>
        <div className="item">
          <span>Online Friends</span>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt=""
              />
              <div className="online" />
              <span>Jane Doe</span>
            </div>
          </div>
          {/* ... các bạn bè online khác ... */}
        </div>
      </div>
    </div>
  );
};

export default RightBar;

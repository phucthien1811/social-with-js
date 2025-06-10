import { useContext, useState } from "react";
import "./comments.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import moment from "moment";

const Comments = ({ postId }) => {
  const [desc, setDesc] = useState("");
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // --- SỬA LỖI 1: THÊM postId VÀO QUERY KEY ---
  // "Khóa" giờ đây là duy nhất cho mỗi bài viết, ví dụ: ["comments", 1], ["comments", 2]
  const { isLoading, error, data } = useQuery(
    ["comments", postId], 
    () =>
      makeRequest.get("/comments?postId=" + postId).then((res) => {
        return res.data;
      })
  );

  // Mutation để thêm bình luận mới
  const mutation = useMutation(
    (newComment) => {
      return makeRequest.post("/comments", newComment);
    },
    {
      onSuccess: () => {
        // --- SỬA LỖI 2: INVALIDATE ĐÚNG QUERY KEY ---
        // Làm mới danh sách bình luận của đúng bài viết này thôi
        queryClient.invalidateQueries(["comments", postId]);
      },
    }
  );

  const handleClick = async (e) => {
    e.preventDefault();
    if (!desc.trim()) return; // Không gửi comment rỗng
    mutation.mutate({ desc, postId });
    setDesc(""); // Xóa nội dung trong ô input sau khi gửi
  };

  return (
    <div className="comments">
      <div className="write">
        <img src={"/upload/" + currentUser.profilePic} alt="" />
        <input
          type="text"
          placeholder="write a comment"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button onClick={handleClick}>Send</button>
      </div>
      {error
        ? "Something went wrong"
        : isLoading
        ? "loading"
        : data.map((comment) => (
            <div className="comment" key={comment.id}>
              <img src={"/upload/" + comment.profilePic} alt="" />
              <div className="info">
                <span>{comment.name}</span>
                <p>{comment.desc}</p>
              </div>
              <span className="date">
                {moment(comment.createdAt).fromNow()}
              </span>
            </div>
          ))}
    </div>
  );
};

export default Comments;

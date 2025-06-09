import Post from "../post/Post";
import "./posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const Posts = ({ userId }) => {
  // Nếu có userId, API sẽ là "/posts?userId=...".
  // Nếu không có userId (ở trang chủ), API sẽ là "/posts" để lấy bài của bạn bè.
  const endpoint = userId ? "/posts?userId=" + userId : "/posts";

  const { isLoading, error, data } = useQuery(["posts", userId], () =>
    makeRequest.get(endpoint).then((res) => {
      return res.data;
    })
  );

  return (
    <div className="posts">
      {error
        ? "Something went wrong!"
        : isLoading
        ? "loading"
        : data.map((post) => <Post post={post} key={post.id} />)}
    </div>
  );
};

export default Posts;

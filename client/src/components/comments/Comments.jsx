import { useContext, useState, useEffect, useRef } from "react";
import "./comments.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import moment from "moment";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const REPLIES_PER_PAGE = 3;

const Comments = ({ postId }) => {
  const [desc, setDesc] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [menuOpenMap, setMenuOpenMap] = useState({});
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const menuRef = useRef();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenMap({});
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { isLoading, error, data } = useQuery(["comments", postId], () =>
    makeRequest.get("/comments?postId=" + postId).then((res) => res.data)
  );

  const { data: repliesData } = useQuery(["replies", postId], () =>
    makeRequest.get("/comments/replies?postId=" + postId).then((res) => res.data)
  );

  const mutation = useMutation(
    (newComment) => {
      return makeRequest.post("/comments", newComment);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["comments", postId]);
      },
    }
  );

  const replyMutation = useMutation(
    (newReply) => {
      return makeRequest.post("/comments/reply", newReply);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["replies", postId]);
        setReplyingTo(null);
        setReplyContent("");
      },
    }
  );
  const deleteCommentMutation = useMutation(
    (commentId) => makeRequest.delete(`/comments/${commentId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["comments", postId]);
      },
    }
  );  const deleteReplyMutation = useMutation(
    (params) => {
      console.log("Deleting reply with params:", params);
      return makeRequest.delete(`/comments/reply/${params.replyId}?commentId=${params.commentId}`);
    },
    {
      onSuccess: () => {
        // Cập nhật cả replies và comments để đảm bảo UI được làm mới hoàn toàn
        queryClient.invalidateQueries(["replies", postId]);
        queryClient.invalidateQueries(["comments", postId]);
      },
      onError: (error) => {
        console.error("Error deleting reply:", error);
        alert("Có lỗi xảy ra khi xóa phản hồi. Vui lòng thử lại.");
      }
    }
  );
  const handleDelete = (id, type, parentCommentId = null) => {
    const confirmMessage = type === 'reply' 
      ? `Bạn có chắc muốn xóa phản hồi này?\nPhản hồi sẽ bị xóa vĩnh viễn.`
      : "Bạn có chắc muốn xóa bình luận này?\nMọi phản hồi của bình luận này cũng sẽ bị xóa vĩnh viễn.";

    if (window.confirm(confirmMessage)) {
      try {
        if (type === 'reply') {
          if (!id || !parentCommentId) {
            console.error("Missing required parameters for reply deletion:", { id, parentCommentId });
            alert("Thiếu thông tin cần thiết để xóa phản hồi");
            return;
          }
          deleteReplyMutation.mutate({ 
            replyId: id, 
            commentId: parentCommentId 
          });
        } else {
          if (!id) {
            console.error("Missing required parameter for comment deletion:", { id });
            alert("Thiếu thông tin cần thiết để xóa bình luận");
            return;
          }
          deleteCommentMutation.mutate(id);
        }
      } catch (error) {
        console.error("Error in handleDelete:", error);
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();
    if (!desc.trim()) return;
    mutation.mutate({ desc, postId });
    setDesc("");
  };

  const handleReply = async (commentId) => {
    if (!replyContent.trim()) return;
    replyMutation.mutate({ 
      commentId,
      content: replyContent,
    });
  };

  const toggleReplies = (commentId) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const toggleMenu = (commentId, event) => {
    event.stopPropagation();
    setMenuOpenMap(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Add keyboard navigation handler

  return (
    <div className="comments">
      <div className="write">
        <img src={"/upload/" + currentUser.profilePic} alt="" />
        <input
          type="text"
          placeholder="Write a comment..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button onClick={handleClick}>{mutation.isLoading ? "Sending..." : "Send"}</button>
      </div>
      
      {error ? (
        <div className="error-message">Something went wrong</div>
      ) : isLoading ? (
        <div className="loading">Loading comments...</div>
      ) : (
        data.map((comment) => {
          const replies = repliesData?.filter(
            (reply) => reply.comment_id === comment.id
          ) || [];
          const isExpanded = expandedComments.has(comment.id);
          const displayedReplies = isExpanded ? replies : replies.slice(0, REPLIES_PER_PAGE);
          
          return (
            <div key={comment.id} className="comment-container">
              <div className="comment">
                <img src={"/upload/" + comment.profilePic} alt="" />
                <div className="info">
                  <span className="username">{comment.name}</span>
                  <p>{comment.desc}</p>
                  <div className="actions">
                    <span className="date">{moment(comment.createdAt).fromNow()}</span>
                  </div>
                </div>
                <div className="menu" ref={menuRef}>
                  <button 
                    className="more-button" 
                    onClick={(e) => toggleMenu(comment.id, e)}
                    aria-label="More options"
                  >
                    <MoreHorizIcon />
                  </button>
                  {menuOpenMap[comment.id] && (
                    <div className="menu-dropdown">
                      <button onClick={() => {
                        setReplyingTo(comment.id);
                        setMenuOpenMap({});
                      }}>
                        Reply
                      </button>
                      {currentUser.id === comment.userId && (
                        <button                          className="delete"
                          onClick={() => {
                            handleDelete(comment.id, 'comment');
                            setMenuOpenMap({});
                          }}
                        >
                          Xoá
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {replyingTo === comment.id && (
                <div className="reply-input">
                  <img src={"/upload/" + currentUser.profilePic} alt="" />
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                  <button
                    onClick={() => handleReply(comment.id)}
                    disabled={replyMutation.isLoading}
                  >
                    {replyMutation.isLoading ? "Sending..." : "Reply"}
                  </button>
                </div>
              )}

              {replies.length > 0 && (
                <div className="replies">
                  {displayedReplies.map((reply) => (
                    <div key={reply.id} className="comment">
                      <img src={"/upload/" + reply.profilePic} alt="" />
                      <div className="info">
                        <span className="username">{reply.name}</span>
                        <p>{reply.content}</p>
                        <div className="actions">
                          <span className="date">{moment(reply.created_at).fromNow()}</span>
                        </div>
                      </div>
                      <div className="menu">
                        <button 
                          className="more-button" 
                          onClick={(e) => toggleMenu(reply.id, e)}
                          aria-label="More options"
                        >
                          <MoreHorizIcon />
                        </button>
                        {menuOpenMap[reply.id] && (
                          <div className="menu-dropdown">
                            {currentUser.id === reply.userId && (                              <button
                                className="delete"
                                onClick={() => {
                                  handleDelete(reply.id, 'reply', comment.id);
                                  setMenuOpenMap({});
                                }}
                              >
                                Xoá
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {replies.length > REPLIES_PER_PAGE && !isExpanded && (
                    <button
                      className="view-more"
                      onClick={() => toggleReplies(comment.id)}
                    >
                      View more replies ({replies.length - REPLIES_PER_PAGE})
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Comments;

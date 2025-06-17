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
  );  const deleteReplyMutation = useMutation({
    mutationFn: (replyId) => {
      // Clean the ID - remove any ':' and convert to number
      const cleanId = parseInt(replyId.toString().replace(':', ''));
      console.log("Deleting reply with cleaned ID:", cleanId);
      return makeRequest.delete(`/comments/reply/${cleanId}`);
    },
    onSuccess: () => {
      console.log("Reply deleted successfully");
      queryClient.invalidateQueries(["replies", postId]);
      queryClient.invalidateQueries(["comments", postId]);
    },
    onError: (error) => {
      console.error("Failed to delete reply:", error);
      alert("Không thể xóa phản hồi. Vui lòng thử lại sau.");
    }
  });const handleDelete = (id, type, parentCommentId = null) => {
    if (type === 'reply' && (!id || !parentCommentId)) {
      console.error("Invalid parameters for reply deletion:", { id, parentCommentId });
      alert("Thiếu thông tin cần thiết để xóa phản hồi");
      return;
    }

    const confirmMessage = type === 'reply'
      ? `Bạn có chắc muốn xóa phản hồi này?\nPhản hồi sẽ bị xóa vĩnh viễn.`
      : "Bạn có chắc muốn xóa bình luận này?\nMọi phản hồi của bình luận này cũng sẽ bị xóa vĩnh viễn.";

    if (window.confirm(confirmMessage)) {
      try {
        if (type === 'reply') {
          console.log("Preparing to delete reply:", {
            replyId: id,
            commentId: parentCommentId,
            type
          });

          deleteReplyMutation.mutate({
            replyId: id,
            commentId: parentCommentId
          });
        } else {
          if (!id) {
            console.error("Missing ID for comment deletion");
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
  };  const toggleMenu = (id, event, isReply = false) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Tạo một key duy nhất cho mỗi menu bằng cách thêm prefix
    const menuKey = isReply ? `reply_${id}` : `comment_${id}`;
    
    setMenuOpenMap(prev => {
      // Đóng tất cả các menu khác
      const newState = {};
      
      // Chỉ toggle menu được click
      newState[menuKey] = !prev[menuKey];
      
      return newState;
    });
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
                <div className="menu" ref={menuRef}>                  <button 
                    className="more-button" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleMenu(comment.id, e, false);
                    }}
                    aria-label="More options"
                  >
                    <MoreHorizIcon />
                  </button>                  {menuOpenMap[`comment_${comment.id}`] && (
                    <div className="menu-dropdown" onClick={(e) => e.stopPropagation()}>
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
                      <div className="menu">                        <button 
                          className="more-button" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleMenu(reply.id, e, true);
                          }}
                          aria-label="More options"
                        >
                          <MoreHorizIcon />
                        </button>                        {menuOpenMap[`reply_${reply.id}`] && (
                          <div className="menu-dropdown" onClick={(e) => e.stopPropagation()}>{currentUser.id === reply.userId && (
                              <button
                                className="delete"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (window.confirm("Bạn có chắc muốn xóa phản hồi này không?")) {
                                    // Ensure we're passing a clean number ID
                                    const replyId = parseInt(reply.id.toString().replace(':', ''));
                                    if (!isNaN(replyId)) {
                                      console.log("Attempting to delete reply with cleaned ID:", replyId);
                                      deleteReplyMutation.mutate(replyId);
                                    } else {
                                      console.error("Invalid reply ID:", reply.id);
                                      alert("ID phản hồi không hợp lệ");
                                    }
                                  }
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

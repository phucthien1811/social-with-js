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
  );

  const deleteReplyMutation = useMutation(
    (replyId) => {
      return makeRequest.delete(`/comments/reply/${replyId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["replies", postId]);
      },
    }
  );

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

  const handleDeleteReply = (replyId) => {
    if (window.confirm("Are you sure you want to delete this reply?")) {
      deleteReplyMutation.mutate(replyId);
    }
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
  const handleMenuKeyDown = (e, commentId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu(commentId, e);
    }
  };

  const handleDropdownKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setMenuOpenMap({});
    }
  };

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
                        <button
                          className="delete"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this comment?")) {
                              deleteCommentMutation.mutate(comment.id);
                            }
                            setMenuOpenMap({});
                          }}
                        >
                          Delete
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
                            {currentUser.id === reply.userId && (
                              <button
                                className="delete"
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to delete this reply?")) {
                                    deleteReplyMutation.mutate(reply.id);
                                  }
                                  setMenuOpenMap({});
                                }}
                              >
                                Delete
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

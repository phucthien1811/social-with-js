import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getComments = (req, res) => {
  const q = `SELECT c.*, u.id AS userId, name, profilePic FROM comments AS c JOIN users AS u ON (u.id = c.userId)
    WHERE c.postId = ? ORDER BY c.createdAt DESC
    `;

  db.query(q, [req.query.postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const addComment = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO comments(`desc`, `createdAt`, `userId`, `postId`) VALUES (?)";
    const values = [
      req.body.desc,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
      req.body.postId
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);

    const postOwnerQuery = "SELECT userId FROM posts WHERE id = ?";
      db.query(postOwnerQuery, [req.body.postId], (err, postData) => {
        if (err || postData.length === 0) return; // Bỏ qua nếu có lỗi
        const postOwnerId = postData[0].userId;

        // Chỉ tạo thông báo nếu người bình luận không phải là chủ bài viết
        if (postOwnerId !== userInfo.id) {
          const notificationQuery = "INSERT INTO notifications (`type`, `actorId`, `receiverId`, `entityId`, `createdAt`) VALUES (?)";
          const notificationValues = [
            'comment',
            userInfo.id,
            postOwnerId,
            req.body.postId,
            moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
          ];
          db.query(notificationQuery, [notificationValues]);
        }
      });
      
      return res.status(200).json("Comment has been created.");
    });
  });
};

export const deleteComment = (req, res) => {  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");    const commentId = req.params.id;
    // Đầu tiên xóa tất cả replies của comment này
    const deleteRepliesQuery = "DELETE FROM comment_replies WHERE comment_id = ?";
    db.query(deleteRepliesQuery, [commentId], (err) => {
      if (err) return res.status(500).json(err);

      // Sau đó xóa comment
      db.query("DELETE FROM comments WHERE `id` = ? AND `userId` = ?", [commentId, userInfo.id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.affectedRows > 0) {
          // Xóa tất cả thông báo liên quan đến comment này
          const deleteNotificationsQuery = "DELETE FROM notifications WHERE (`type` = 'comment' OR `type` = 'reply') AND `entityId` = ?";
          db.query(deleteNotificationsQuery, [commentId]);
          
          return res.json("Comment and its replies have been deleted!");
        }
        return res.status(403).json("You can delete only your comment!");
      });
    });
  });
};

export const getReplies = (req, res) => {
  const q = `
    SELECT r.*, u.id AS userId, u.name, u.profilePic 
    FROM comment_replies r 
    JOIN users u ON (u.id = r.user_id)
    JOIN comments c ON (r.comment_id = c.id)
    WHERE c.postId = ? 
    ORDER BY r.created_at DESC
  `;

  db.query(q, [req.query.postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const addReply = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO comment_replies(comment_id, user_id, content, created_at) VALUES (?)";
    const values = [
      req.body.commentId,
      userInfo.id,
      req.body.content,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);      // Thêm thông báo cho người comment gốc
      const notifyQuery = "SELECT c.userId, c.id FROM comments c WHERE c.id = ?";
      db.query(notifyQuery, [req.body.commentId], (err, commentData) => {
        if (!err && commentData.length > 0 && commentData[0].userId !== userInfo.id) {
          const notificationValues = [
            'reply',
            userInfo.id,
            commentData[0].userId,
            commentData[0].id,
            moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
          ];
          const insertNotification = "INSERT INTO notifications (`type`, `actorId`, `receiverId`, `entityId`, `createdAt`) VALUES (?)";
          db.query(insertNotification, [notificationValues], (err, result) => {
            if (err) console.log("Error creating notification:", err);
          });
        }
      });

      return res.status(200).json("Reply added successfully");
    });
  });
};

export const deleteReply = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");    const replyId = req.params.id;
    const commentId = req.query.commentId;
    
    console.log("Deleting reply:", {
      replyId,
      commentId,
      userId: userInfo.id
    });

    // Trực tiếp xóa reply và kiểm tra quyền thông qua user_id
    const deleteReplyQuery = "DELETE FROM comment_replies WHERE id = ? AND user_id = ?";
    db.query(deleteReplyQuery, [replyId, userInfo.id], (err, data) => {
      if (err) {
        console.log("Error deleting reply:", err);
        return res.status(500).json(err);
      }
        if (data.affectedRows > 0) {
        // Xóa thông báo liên quan đến reply này
        const deleteNotificationQuery = "DELETE FROM notifications WHERE type = 'reply' AND entityId = ? AND actorId = ?";
        db.query(deleteNotificationQuery, [commentId, userInfo.id], (err) => {
          if (err) {
            console.log("Error deleting notification:", err);
          } else {
            console.log("Successfully deleted notification for reply", {
              commentId,
              replyId,
              userId: userInfo.id
            });
          }
        });
        
        return res.json("Reply has been deleted!");
      }
      return res.status(403).json("You can delete only your reply!");
    });
  });
};

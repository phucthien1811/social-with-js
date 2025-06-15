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
    if (err) return res.status(403).json("Token is not valid!");    // Clean and validate the ID from params
    const replyId = parseInt(req.params.id.toString().replace(':', ''));
    
    if (isNaN(replyId)) {
      console.error("Invalid reply ID format:", req.params.id);
      return res.status(400).json("Invalid reply ID format");
    }
    
    console.log("Attempting to delete reply with cleaned ID:", replyId);
    console.log("User attempting deletion:", userInfo.id);

    // Kiểm tra quyền sở hữu với JOIN để lấy thông tin user
    const checkOwnershipQuery = `
      SELECT cr.*, u.id as userId, u.name as userName
      FROM comment_replies cr
      JOIN users u ON cr.user_id = u.id
      WHERE cr.id = ?
    `;

    db.query(checkOwnershipQuery, [replyId], (err, results) => {
      if (err) {
        console.error("Database error when checking ownership:", err);
        return res.status(500).json(err);
      }

      console.log("Query results:", results);

      if (results.length === 0) {
        console.log("No reply found with ID:", replyId);
        return res.status(404).json("Reply not found!");
      }

      const reply = results[0];
      console.log("Reply details:", {
        replyId: reply.id,
        userId: reply.user_id,
        currentUser: userInfo.id,
        isOwner: reply.user_id === userInfo.id
      });

      // Kiểm tra quyền sở hữu
      if (parseInt(reply.user_id) !== parseInt(userInfo.id)) {
        console.log("Permission denied - Users don't match:", {
          replyUserId: reply.user_id,
          currentUserId: userInfo.id
        });
        return res.status(403).json("You can only delete your own replies!");
      }

      // Người dùng có quyền, thực hiện xóa
      const deleteReplyQuery = "DELETE FROM comment_replies WHERE id = ? AND user_id = ?";
      db.query(deleteReplyQuery, [replyId, userInfo.id], (err, deleteResult) => {
        if (err) {
          console.error("Error during deletion:", err);
          return res.status(500).json(err);
        }

        if (deleteResult.affectedRows > 0) {
          // Xóa notifications liên quan
          const deleteNotifQuery = "DELETE FROM notifications WHERE type = 'reply' AND actorId = ? AND entityId = ?";
          db.query(deleteNotifQuery, [userInfo.id, reply.comment_id], (err) => {
            if (err) {
              console.error("Error deleting notifications:", err);
            }
          });

          console.log("Successfully deleted reply:", replyId);
          return res.status(200).json("Reply deleted successfully");
        } else {
          console.log("No reply was deleted");
          return res.status(404).json("Reply not found or already deleted");
        }
      });
    });
  });
};

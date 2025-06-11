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

export const deleteComment = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const commentId = req.params.id;
    const q = "DELETE FROM comments WHERE `id` = ? AND `userId` = ?";

    db.query(q, [commentId, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows > 0) return res.json("Comment has been deleted!");
      return res.status(403).json("You can delete only your comment!");
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
      if (err) return res.status(500).json(err);

      // Thêm thông báo cho người comment gốc
      const notifyQuery = "SELECT userId FROM comments WHERE id = ?";
      db.query(notifyQuery, [req.body.commentId], (err, commentData) => {
        if (!err && commentData.length > 0 && commentData[0].userId !== userInfo.id) {
          const notificationValues = [
            'reply',
            userInfo.id,
            commentData[0].userId,
            req.body.commentId,
            moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
          ];
          db.query("INSERT INTO notifications (`type`, `actorId`, `receiverId`, `entityId`, `createdAt`) VALUES (?)", 
            [notificationValues]
          );
        }
      });

      return res.status(200).json("Reply added successfully");
    });
  });
};

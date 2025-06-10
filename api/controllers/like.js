import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment"; // nhớ đã cài `moment`

export const getLikes = (req, res) => {
  const q = "SELECT userId FROM likes WHERE postId = ?";
  db.query(q, [req.query.postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data.map(like => like.userId));
  });
};

export const addLike = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // 1. Kiểm tra đã like chưa
    const checkQuery = "SELECT * FROM likes WHERE `userId` = ? AND `postId` = ?";
    db.query(checkQuery, [userInfo.id, req.body.postId], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length > 0) return res.status(409).json("Post already liked.");

      // 2. Thêm like mới
      const insertQuery = "INSERT INTO likes (`userId`,`postId`) VALUES (?)";
      const values = [userInfo.id, req.body.postId];
      db.query(insertQuery, [values], (err, data) => {
        if (err) return res.status(500).json(err);

        // 3. Lấy ID chủ bài viết để gửi thông báo
        const postOwnerQuery = "SELECT userId FROM posts WHERE id = ?";
        db.query(postOwnerQuery, [req.body.postId], (err, postData) => {
          if (err || postData.length === 0) {
            return res.status(200).json("Post has been liked."); // Không có lỗi nhưng không gửi thông báo
          }

          const postOwnerId = postData[0].userId;

          // 4. Nếu không phải chủ bài viết thì tạo thông báo
          if (postOwnerId !== userInfo.id) {
            const notificationQuery = "INSERT INTO notifications (`type`, `actorId`, `receiverId`, `entityId`, `createdAt`) VALUES (?)";
            const notificationValues = [
              'like',
              userInfo.id,
              postOwnerId,
              req.body.postId,
              moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
            ];

            db.query(notificationQuery, [notificationValues], (err, notifyRes) => {
              // Dù có lỗi khi gửi thông báo vẫn return 200 để không ảnh hưởng user
              return res.status(200).json("Post has been liked.");
            });
          } else {
            return res.status(200).json("Post has been liked.");
          }
        });
      });
    });
  });
};
export const deleteLike = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    const deleteLikeQuery = "DELETE FROM likes WHERE `userId` = ? AND `postId` = ?";
    db.query(deleteLikeQuery, [userInfo.id, req.query.postId], (err, data) => {
      if (err) return res.status(500).json(err);
      
      // 2. Xóa thông báo tương ứng khỏi bảng 'notifications'
      const deleteNotificationQuery = "DELETE FROM notifications WHERE `type` = 'like' AND `actorId` = ? AND `entityId` = ?";
      db.query(deleteNotificationQuery, [userInfo.id, req.query.postId]); // Không cần chờ kết quả

      return res.status(200).json("Post has been disliked.");
    });
  });
};
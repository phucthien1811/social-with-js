import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getNotifications = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // --- LOGIC MỚI ---
    // Câu lệnh này sẽ lấy 2 loại thông báo:
    // 1. Thông báo CÁ NHÂN (ai đó like, comment, follow BẠN) -> có receiverId = id của bạn
    // 2. Hoạt động của BẠN BÈ (người BẠN follow đăng bài/story) -> actorId là người bạn follow
    const q = `
      SELECT n.*, u.name as actorName, u.profilePic as actorProfilePic
      FROM notifications AS n
      JOIN users AS u ON (n.actorId = u.id)
      WHERE
        -- Lấy thông báo cá nhân gửi cho tôi
        n.receiverId = ? 
        OR 
        -- Lấy hoạt động (post/story) từ những người tôi follow
        (n.actorId IN (SELECT followedUserId FROM relationships WHERE followerUserId = ?) AND (n.type = 'post' OR n.type = 'story'))
      ORDER BY n.createdAt DESC
    `;

    const values = [userInfo.id, userInfo.id];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

// Hàm markAsRead giữ nguyên, không cần sửa
export const markNotificationsAsRead = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");
  
    jwt.verify(token, "secretkey", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
  
      const q = "UPDATE notifications SET `isRead` = 1 WHERE `receiverId` = ?";
  
      db.query(q, [userInfo.id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Notifications marked as read.");
      });
    });
};

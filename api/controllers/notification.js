import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getNotifications = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // --- LOGIC MỚI, HOÀN CHỈNH ---
    // Câu lệnh này sẽ lấy tất cả thông báo liên quan và kiểm tra trạng thái "đã đọc"
    // từ bảng `notification_reads`
    const q = `
      SELECT n.*, u.name as actorName, u.profilePic as actorProfilePic,
      -- Nếu có bản ghi trong notification_reads, isRead = 1, ngược lại isRead = 0
      CASE WHEN nr.id IS NOT NULL THEN 1 ELSE 0 END AS isRead
      FROM notifications AS n
      JOIN users AS u ON (n.actorId = u.id)
      LEFT JOIN notification_reads AS nr ON (n.id = nr.notificationId AND nr.userId = ?)
      WHERE
        -- 1. Lấy thông báo cá nhân gửi ĐẾN TÔI (like, comment, follow)
        n.receiverId = ? 
        OR 
        -- 2. Lấy hoạt động (post/story) TỪ NHỮNG NGƯỜI TÔI FOLLOW
        (n.actorId IN (SELECT followedUserId FROM relationships WHERE followerUserId = ?))
      ORDER BY n.createdAt DESC
    `;
    
    // Chúng ta cần truyền ID của người dùng vào cả 3 vị trí
    const values = [userInfo.id, userInfo.id, userInfo.id];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

export const markNotificationsAsRead = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // --- LOGIC MỚI, HOÀN CHỈNH ---
    // 1. Lấy tất cả ID của các thông báo chưa đọc của người dùng
    const getUnreadQuery = `
        SELECT n.id FROM notifications AS n
        LEFT JOIN notification_reads AS nr ON (n.id = nr.notificationId AND nr.userId = ?)
        WHERE 
          (
            n.receiverId = ? 
            OR 
            n.actorId IN (SELECT followedUserId FROM relationships WHERE followerUserId = ?)
          )
          AND nr.id IS NULL
    `;
    const values = [userInfo.id, userInfo.id, userInfo.id];

    db.query(getUnreadQuery, values, (err, unreadNotifications) => {
        if (err) return res.status(500).json(err);
        if (unreadNotifications.length === 0) return res.status(200).json("No new notifications to mark as read.");

        // 2. Chèn các bản ghi "đã đọc" mới vào bảng notification_reads
        const notificationIds = unreadNotifications.map(n => n.id);
        const insertQuery = "INSERT INTO notification_reads (notificationId, userId, readAt) VALUES ?";
        const insertValues = notificationIds.map(id => [
            id,
            userInfo.id,
            moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
        ]);

        db.query(insertQuery, [insertValues], (err, data) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json("Notifications marked as read.");
        });
    });
  });
};

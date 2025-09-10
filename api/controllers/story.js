import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getStories = (req, res) => {
    // =======================================================
    // LOGIC HOÀN CHỈNH - LẤY STORY CỦA BẠN VÀ BẠN BÈ
    // =======================================================
    // Câu lệnh này sẽ lấy story của chính người dùng (s.userId = ?)
    // HOẶC story của những người mà người dùng đang follow (r.followerUserId = ?)
    const q = `
      SELECT DISTINCT s.*, u.name 
      FROM stories AS s 
      JOIN users AS u ON (u.id = s.userId)
      LEFT JOIN relationships AS r ON (s.userId = r.followedUserId) 
      WHERE r.followerUserId = ? OR s.userId = ?
      ORDER BY s.createdAt DESC
    `;

    // Chúng ta cần truyền ID của người dùng vào cả hai vị trí `?`
    const values = [userInfo.id, userInfo.id];

    db.query(q, values, (err, data) => {
      if (err) {
        console.error("LỖI SQL KHI LẤY STORY BẠN BÈ:", err);
        return res.status(500).json(err);
      }
      return res.status(200).json(data);
    });
};

// Các hàm addStory và deleteStory 
export const addStory = (req, res) => {

    const q = "INSERT INTO stories(`img`, `createdAt`, `userId`) VALUES (?)";
    const values = [
      req.body.img,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      
      // --- THÊM ĐOẠN CODE NÀY VÀO ---
      // Sau khi tạo story thành công, tạo một thông báo hoạt động
      const notificationQuery = "INSERT INTO notifications (`type`, `actorId`, `entityId`, `createdAt`) VALUES (?)";
      // `entityId` sẽ là ID của story vừa được tạo
      const notificationValues = [
        'story', // Thêm một type mới là 'story'
        userInfo.id,
        data.insertId, 
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
      ];
      // Chạy query này nhưng không cần chờ kết quả
      db.query(notificationQuery, [notificationValues]);
      // --- KẾT THÚC PHẦN THÊM ---

      return res.status(200).json("Story has been created.");
    });
  
};

export const deleteStory = (req, res) => {
    // --- LOGIC MỚI ---
    const deleteStoryQuery = "DELETE FROM stories WHERE `id`=? AND `userId` = ?";
    db.query(deleteStoryQuery, [req.params.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows > 0) {
        // Xóa thông báo tương ứng
        const deleteNotificationQuery = "DELETE FROM notifications WHERE `type` = 'story' AND `entityId` = ?";
        db.query(deleteNotificationQuery, [req.params.id]);

        return res.status(200).json("Story has been deleted.");
      }
      return res.status(403).json("You can delete only your story!");
    });

};

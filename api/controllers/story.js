import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getStories = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

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
  });
};

// Các hàm addStory và deleteStory giữ nguyên, không có lỗi
export const addStory = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO stories(`img`, `createdAt`, `userId`) VALUES (?)";
    const values = [
      req.body.img,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Story has been created.");
    });
  });
};

export const deleteStory = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "DELETE FROM stories WHERE `id`=? AND `userId` = ?";

    db.query(q, [req.params.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows > 0)
        return res.status(200).json("Story has been deleted.");
      return res.status(403).json("You can delete only your story!");
    });
  });
};

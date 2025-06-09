import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getStories = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // =======================================================
    // DÙNG CÂU LỆNH SQL ĐƠN GIẢN HƠN RẤT NHIỀU ĐỂ TEST
    // Câu lệnh này chỉ lấy story của CHÍNH BẠN (người đang đăng nhập)
    // =======================================================
    const q = `
      SELECT s.*, u.name 
      FROM stories AS s 
      JOIN users AS u ON (u.id = s.userId) 
      WHERE s.userId = ? 
      ORDER BY s.createdAt DESC
    `;

    // Chúng ta chỉ cần truyền ID của người dùng vào
    const values = [userInfo.id];

    db.query(q, values, (err, data) => {
      // Nếu có lỗi ở đây, nó sẽ hiện trong terminal của backend
      if (err) {
        console.error("LỖI SQL KHI LẤY STORY:", err);
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

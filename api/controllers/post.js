import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getPosts = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const userId = req.query.userId;
    
    // --- LOGIC LẤY BÀI VIẾT ĐÃ ĐƯỢC SỬA LẠI HOÀN CHỈNH ---

    // Nếu ở trang cá nhân (có userId), chỉ lấy bài của người đó.
    // Nếu ở trang chủ (không có userId), lấy bài của bạn VÀ những người bạn đang follow.
    // Sử dụng subquery để logic rõ ràng và chính xác hơn.
    const q =
      userId && userId !== "undefined"
        ? `SELECT p.*, u.id AS userId, name, profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId) WHERE p.userId = ? ORDER BY p.createdAt DESC`
        : `SELECT DISTINCT p.*, u.id AS userId, name, profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId)
           WHERE p.userId = ? OR p.userId IN (SELECT followedUserId FROM relationships WHERE followerUserId = ?)
           ORDER BY p.createdAt DESC`;

    const values =
      userId && userId !== "undefined" ? [userId] : [userInfo.id, userInfo.id];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

// Hàm addPost đã đúng, giữ nguyên
export const addPost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "INSERT INTO posts(`desc`, `img`, `createdAt`, `userId`) VALUES (?)";
    const values = [
      req.body.desc,
      req.body.img,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Post has been created.");
    });
  });
};

// Hàm deletePost đã đúng, giữ nguyên
export const deletePost = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");
  
    jwt.verify(token, "secretkey", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
  
      const q =
        "DELETE FROM posts WHERE `id`=? AND `userId` = ?";
  
      db.query(q, [req.params.id, userInfo.id], (err, data) => {
        if (err) return res.status(500).json(err);
        if(data.affectedRows>0) return res.status(200).json("Post has been deleted.");
        return res.status(403).json("You can delete only your post")
      });
    });
  };

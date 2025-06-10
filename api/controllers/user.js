import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getUser = (req, res) => {
  // ... (phần này không cần thay đổi)
  const userId = req.params.userId;
  const q = "SELECT * FROM users WHERE id=?";
  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found!");
    const { password, ...info } = data[0];
    return res.json(info);
  });
};

export const updateUser = (req, res) => {
  console.log("\n\n--- [BACKEND LOG 1] API /users ĐƯỢC GỌI ---");
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    
    console.log("--- [BACKEND LOG 2] Dữ liệu nhận được từ frontend:", req.body);
    const q =
      "UPDATE users SET `name`=?,`city`=?,`website`=?,`profilePic`=?,`coverPic`=? WHERE id=? ";

    const values = [
      req.body.name,
      req.body.city,
      req.body.website,
      req.body.profilePic,
      req.body.coverPic,
      userInfo.id,
    ];
    
    console.log("--- [BACKEND LOG 3] Chuẩn bị cập nhật DB với các giá trị:", values);
    db.query(q, values, (err, data) => {
      if (err) {
        console.error("--- [BACKEND ERROR] Lỗi khi cập nhật DB:", err);
        return res.status(500).json(err);
      }
      if (data.affectedRows > 0) {
        const selectQuery = "SELECT id, name, city, website, profilePic, coverPic, email FROM users WHERE id = ?";
        db.query(selectQuery, [userInfo.id], (selectErr, selectData) => {
          if (selectErr) return res.status(500).json(selectErr);
          console.log("--- [BACKEND LOG 4] Gửi object này về cho frontend:", selectData[0]);
          return res.status(200).json(selectData[0]);
        });
      } else {
        return res.status(403).json("You can only update your profile!");
      }
    });
  });
};
export const getSuggestedUsers = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // Câu lệnh SQL này sẽ:
    // 1. Lấy tất cả user (u.id)
    // 2. TRỪ ĐI chính user hiện tại (u.id != ?)
    // 3. TRỪ ĐI những user mà user hiện tại đã follow (u.id NOT IN (...))
    // 4. Lấy ngẫu nhiên 5 người (RAND()) và giới hạn kết quả (LIMIT 5)
    const q = `
      SELECT id, username, profilePic, name 
      FROM users 
      WHERE id != ? AND id NOT IN (
        SELECT followedUserId FROM relationships WHERE followerUserId = ?
      ) 
      ORDER BY RAND() 
      LIMIT 5
    `;

    const values = [userInfo.id, userInfo.id];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};


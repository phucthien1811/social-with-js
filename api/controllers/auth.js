import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = (req, res) => {
  const q = "SELECT * FROM users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found!");

    const checkPassword = bcrypt.compareSync(req.body.password, data[0].password);
    if (!checkPassword) return res.status(400).json("Wrong password or username!");

    const token = jwt.sign({ id: data[0].id }, process.env.JWT_SECRET || "secretkey");
    const { password, ...others } = data[0];

    // Gửi cookie đi với cấu hình chuẩn
    res
      .cookie("accessToken", token, {
        httpOnly: true, // Tăng bảo mật, không cho JavaScript ở client truy cập
      })
      .status(200)
      .json(others);
  });
};

export const register = (req, res) => {
  // Phần code register của bạn giữ nguyên
  const q = "SELECT * FROM users WHERE username = ?";
  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("User already exists!");
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    const insertQuery = "INSERT INTO users (`username`,`email`,`password`,`name`) VALUE (?)";
    const values = [req.body.username, req.body.email, hashedPassword, req.body.name];
    db.query(insertQuery, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("User has been created.");
    });
  });
};

export const logout = (req, res) => {
  // Xóa cookie khi đăng xuất
  res.clearCookie("accessToken",{
    secure:true,
    sameSite:"none"
  }).status(200).json("User has been logged out.")
};

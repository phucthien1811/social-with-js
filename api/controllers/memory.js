import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getMemories = (req, res) => {
  const userId = req.user.id;
  const today = moment();
  
  const query = `
    SELECT p.*, u.id AS userId, name, profilePic,
    (SELECT COUNT(*) FROM likes WHERE postId = p.id) AS likes,
    (SELECT COUNT(*) FROM comments WHERE postId = p.id) AS comments
    FROM posts AS p 
    JOIN users AS u ON (u.id = p.userId)
    WHERE p.userId = ? 
    AND (
      DAY(createdAt) = ? 
      AND MONTH(createdAt) = ?
      AND YEAR(createdAt) < ?
    )
    ORDER BY createdAt DESC
  `;

  const values = [
    userId,
    today.date(),
    today.month() + 1,  // moment months are 0-indexed
    today.year()
  ];

  db.query(query, values, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

import { db } from "../connect.js";
import jwt from "jsonwebtoken";



export const getLatestActivities = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // Câu lệnh này sẽ lấy các hoạt động của những người bạn đã follow
    const q = `
      SELECT n.*, u.name as actorName, u.profilePic as actorProfilePic
      FROM notifications AS n
      JOIN users AS u ON (n.actorId = u.id)
      JOIN relationships AS r ON (n.actorId = r.followedUserId)
      WHERE r.followerUserId = ? AND n.actorId != ?
      ORDER BY n.createdAt DESC
      LIMIT 5
    `;

    db.query(q, [userInfo.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

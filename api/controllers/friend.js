import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getFriends = (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({ error: "Not logged in!" });
    }

    jwt.verify(token, "secretkey", (err, userInfo) => {
      if (err) {
        return res.status(403).json({ error: "Token is not valid!" });
      }

      // Improved query to get mutual friends and all friend info
      const q = `
        SELECT DISTINCT 
          u.id, 
          u.name, 
          u.profilePic,
          COUNT(DISTINCT r2.followerUserId) as mutualFriends
        FROM relationships AS r
        JOIN users AS u ON (u.id = r.followedUserId)
        LEFT JOIN relationships AS r2 ON (
          r2.followedUserId IN (
            SELECT followedUserId 
            FROM relationships 
            WHERE followerUserId = ?
          )
          AND r2.followerUserId = u.id
          AND r2.followerUserId != ?
        )
        WHERE r.followerUserId = ? 
        AND r.followedUserId IN (
          SELECT followerUserId 
          FROM relationships 
          WHERE followedUserId = ?
        )
        GROUP BY u.id, u.name, u.profilePic
        ORDER BY mutualFriends DESC, u.name ASC
      `;

      db.query(q, [userInfo.id, userInfo.id, userInfo.id, userInfo.id], (err, data) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Error fetching friends" });
        }
        console.log("Found", data.length, "friends for user", userInfo.id);
        return res.status(200).json(data);
      });
    });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const createGroup = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO groups (name, description, cover_img, creator_id, privacy) VALUES (?)";
    const values = [
      req.body.name,
      req.body.description,
      req.body.coverImg,
      userInfo.id,
      req.body.privacy || 'public'
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      
      // Add creator as admin
      const groupId = data.insertId;
      const memberQ = "INSERT INTO group_members (group_id, user_id, role) VALUES (?)";
      const memberValues = [groupId, userInfo.id, 'admin'];
      
      db.query(memberQ, [memberValues], (err) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Group has been created!");
      });
    });
  });
};

export const getGroups = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      SELECT g.*, 
        COUNT(DISTINCT gm.user_id) as memberCount,
        MAX(CASE WHEN gm.user_id = ? THEN 1 ELSE 0 END) as isMember,
        MAX(CASE WHEN gm.user_id = ? AND gm.role = 'admin' THEN 1 ELSE 0 END) as isAdmin
      FROM groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `;

    db.query(q, [userInfo.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

export const getGroupPosts = (req, res) => {
  const groupId = req.params.groupId;
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      SELECT p.*, u.id AS userId, name, profilePic 
      FROM group_posts AS p 
      JOIN users AS u ON (u.id = p.user_id)
      WHERE p.group_id = ?
      ORDER BY p.created_at DESC
    `;

    db.query(q, [groupId], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

export const joinGroup = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO group_members (group_id, user_id) VALUES (?)";
    const values = [req.body.groupId, userInfo.id];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Joined group!");
    });
  });
};

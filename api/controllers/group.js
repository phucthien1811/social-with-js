import { db } from "../connect.js";
import { promisify } from "util";

// Utility to run queries as promises
const query = (sql, params) => new Promise((resolve, reject) => {
  db.query(sql, params, (err, data) => {
    if (err) return reject(err);
    resolve(data);
  });
});

// Create a new group and add creator as admin
export const createGroup = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json("Not authenticated");

    const q = "INSERT INTO groups (name, description, cover_img, creator_id, privacy) VALUES (?)";
    const values = [
      req.body.name,
      req.body.description || null,
      req.body.coverImg || null,
      userId,
      req.body.privacy || "public",
    ];

    const result = await query(q, [values]);
    const groupId = result.insertId;

    const memberQ = "INSERT INTO group_members (group_id, user_id, role) VALUES (?)";
    const memberValues = [groupId, userId, "admin"];
    await query(memberQ, [memberValues]);

    return res.status(201).json({ message: "Group created", groupId });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// List groups with membership flags
export const getGroups = async (req, res) => {
  try {
    const userId = req.user?.id || 0;
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

    const data = await query(q, [userId, userId]);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Get posts for a group
export const getGroupPosts = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const q = `
      SELECT p.*, u.id AS userId, u.name, u.profilePic 
      FROM group_posts AS p 
      JOIN users AS u ON (u.id = p.user_id)
      WHERE p.group_id = ?
      ORDER BY p.created_at DESC
    `;
    const data = await query(q, [groupId]);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Join a group (creates membership)
export const joinGroup = async (req, res) => {
  try {
    const userId = req.user?.id;
    const groupId = req.body.groupId;
    if (!userId) return res.status(401).json("Not authenticated");

    // Prevent double join
    const existsQ = "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?";
    const exists = await query(existsQ, [groupId, userId]);
    if (exists.length) return res.status(400).json("Already a member");

    const q = "INSERT INTO group_members (group_id, user_id, role) VALUES (?)";
    const values = [groupId, userId, "member"];
    await query(q, [values]);
    return res.status(200).json({ message: "Joined group" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Leave group
export const leaveGroup = async (req, res) => {
  try {
    const userId = req.user?.id;
    const groupId = req.body.groupId;
    if (!userId) return res.status(401).json("Not authenticated");

    const q = "DELETE FROM group_members WHERE group_id = ? AND user_id = ?";
    await query(q, [groupId, userId]);
    return res.status(200).json({ message: "Left group" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Get group members
export const getGroupMembers = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const q = `SELECT u.id, u.name, u.profilePic, gm.role FROM users u JOIN group_members gm ON u.id = gm.user_id WHERE gm.group_id = ?`;
    const data = await query(q, [groupId]);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Update group (only admin/creator)
export const updateGroup = async (req, res) => {
  try {
    const userId = req.user?.id;
    const groupId = req.params.groupId;
    if (!userId) return res.status(401).json("Not authenticated");

    // Check admin
    const checkQ = "SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role IN ('admin')";
    const check = await query(checkQ, [groupId, userId]);
    if (!check.length) return res.status(403).json("Not allowed");

    const q = "UPDATE groups SET name = ?, description = ?, cover_img = ?, privacy = ? WHERE id = ?";
    const values = [req.body.name, req.body.description, req.body.coverImg, req.body.privacy || 'public', groupId];
    await query(q, values);
    return res.status(200).json({ message: "Group updated" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Remove member (admin only)
export const removeMember = async (req, res) => {
  try {
    const userId = req.user?.id;
    const groupId = req.body.groupId;
    const targetUserId = req.body.userId;
    if (!userId) return res.status(401).json("Not authenticated");

    const checkQ = "SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role IN ('admin')";
    const check = await query(checkQ, [groupId, userId]);
    if (!check.length) return res.status(403).json("Not allowed");

    const q = "DELETE FROM group_members WHERE group_id = ? AND user_id = ?";
    await query(q, [groupId, targetUserId]);
    return res.status(200).json({ message: "Member removed" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Add post to group
export const addGroupPost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const groupId = req.body.groupId;
    if (!userId) return res.status(401).json("Not authenticated");

    const q = "INSERT INTO group_posts (group_id, user_id, content, image) VALUES (?)";
    const values = [groupId, userId, req.body.content || null, req.body.image || null];
    const result = await query(q, [values]);
    return res.status(201).json({ postId: result.insertId });
  } catch (err) {
    return res.status(500).json(err);
  }
};

// Delete group
export const deleteGroup = async (req, res) => {
  try {
    const userId = req.user?.id;
    const groupId = req.params.groupId;
    if (!userId) return res.status(401).json("Not authenticated");

    // Only creator can delete
    const checkQ = "SELECT * FROM groups WHERE id = ? AND creator_id = ?";
    const check = await query(checkQ, [groupId, userId]);
    if (!check.length) return res.status(403).json("Not allowed");

    // cascade delete members/posts then group (or rely on FK cascade)
    await query("DELETE FROM group_posts WHERE group_id = ?", [groupId]);
    await query("DELETE FROM group_members WHERE group_id = ?", [groupId]);
    await query("DELETE FROM groups WHERE id = ?", [groupId]);

    return res.status(200).json({ message: "Group deleted" });
  } catch (err) {
    return res.status(500).json(err);
  }
};

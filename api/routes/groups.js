import express from "express";
import {
	createGroup,
	getGroups,
	getGroupPosts,
	joinGroup,
	leaveGroup,
	getGroupMembers,
	updateGroup,
	removeMember,
	addGroupPost,
	deleteGroup,
} from "../controllers/group.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken, createGroup);
router.get("/", verifyToken, getGroups);
router.get("/:groupId/posts", verifyToken, getGroupPosts);
router.post("/join", verifyToken, joinGroup);
router.post("/leave", verifyToken, leaveGroup);
router.get("/:groupId/members", verifyToken, getGroupMembers);
router.put("/:groupId", verifyToken, updateGroup);
router.post("/:groupId/remove", verifyToken, removeMember);
router.post("/:groupId/posts", verifyToken, addGroupPost);
router.delete("/:groupId", verifyToken, deleteGroup);

export default router;

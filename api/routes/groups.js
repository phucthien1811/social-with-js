import express from "express";
import { createGroup, getGroups, getGroupPosts, joinGroup } from "../controllers/group.js";

const router = express.Router();

router.post("/create", createGroup);
router.get("/", getGroups);
router.get("/:groupId/posts", getGroupPosts);
router.post("/join", joinGroup);

export default router;

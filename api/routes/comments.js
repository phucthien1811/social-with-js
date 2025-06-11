import express from "express";
import {
  getComments,
  addComment,
  deleteComment,
  getReplies,
  addReply
} from "../controllers/comment.js";

const router = express.Router();

router.get("/", getComments);
router.post("/", addComment);
router.delete("/:id", deleteComment);
router.get("/replies", getReplies);
router.post("/reply", addReply);

export default router;

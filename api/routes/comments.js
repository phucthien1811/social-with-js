import express from "express";
import {
  getComments,
  addComment,
  deleteComment,
  getReplies,
  addReply,
  deleteReply
} from "../controllers/comment.js";

const router = express.Router();

router.get("/", getComments);
router.post("/", addComment);
router.delete("/:id", deleteComment);

router.get("/replies", getReplies);
router.post("/reply", addReply);
router.delete("/reply/:id", deleteReply);

export default router;

import express from "express";
import { getFriends, getSuggestedFriends } from "../controllers/friend.js";

const router = express.Router();

router.get("/list", getFriends);
router.get("/suggestions", getSuggestedFriends);

export default router;

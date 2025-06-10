import express from "express";
import { getLatestActivities } from "../controllers/activity.js";
const router = express.Router();
router.get("/", getLatestActivities);
export default router;
import express from "express";
import { getNotifications, markNotificationsAsRead } from "../controllers/notification.js";

const router = express.Router();

router.get("/", getNotifications);
router.put("/read", markNotificationsAsRead); // Dùng PUT để cập nhật trạng thái

export default router;
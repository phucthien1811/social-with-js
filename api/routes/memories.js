import express from "express";
import { getMemories } from "../controllers/memory.js";


const router = express.Router();

router.get("/", getMemories);

export default router;

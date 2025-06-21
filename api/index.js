import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";

// Import các routes của bạn
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import relationshipRoutes from "./routes/relationships.js";
import storyRoutes from "./routes/stories.js"
import notificationRoutes from "./routes/notifications.js";
import friendRoutes from "./routes/friends.js";
import memoryRoutes from "./routes/memories.js";

const app = express();

// --- MIDDLEWARES (Cấu hình theo đúng thứ tự này) ---

// 1. Cho phép backend xử lý JSON và đọc cookie từ request
app.use(express.json());
app.use(cookieParser());

// 2. Cấu hình CORS để "tin tưởng" frontend và cho phép nhận cookie
app.use(
  cors({
    origin: "http://localhost:3000", // Chỉ cho phép địa chỉ này
    credentials: true, // Cho phép trình duyệt gửi cookie đính kèm request
  })
);

// --- Cấu hình Multer để upload file ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});


// --- ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/relationships", relationshipRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/memories", memoryRoutes);

app.listen(8800, () => {
  console.log("API server is running!");
});

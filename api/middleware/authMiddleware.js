import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    req.user = userInfo;
    next();
  });
};

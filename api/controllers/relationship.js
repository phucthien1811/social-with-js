import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getRelationships = (req,res)=>{
    const q = "SELECT followerUserId FROM relationships WHERE followedUserId = ?";

    db.query(q, [req.query.followedUserId], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data.map(relationship=>relationship.followerUserId));
    });
}

export const addRelationship = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO relationships (`followerUserId`,`followedUserId`) VALUES (?)";
    const values = [
      userInfo.id,
      req.body.userId
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      // Sau khi follow thành công, tạo một thông báo hoạt động
      const notificationQuery = "INSERT INTO notifications (`type`, `actorId`, `receiverId`, `createdAt`) VALUES (?)";
      const notificationValues = [
        'follow',
        userInfo.id, // người thực hiện hành động
        req.body.userId, // người nhận thông báo (người được follow)
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
      ];
      // Chạy query này nhưng không cần chờ kết quả
      db.query(notificationQuery, [notificationValues]);

      return res.status(200).json("Following");
    });
  });
};

export const deleteRelationship = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    
    // --- LOGIC MỚI ---
    const deleteRelationshipQuery = "DELETE FROM relationships WHERE `followerUserId` = ? AND `followedUserId` = ?";
    db.query(deleteRelationshipQuery, [userInfo.id, req.query.userId], (err, data) => {
      if (err) return res.status(500).json(err);
      
      // Xóa thông báo tương ứng
      const deleteNotificationQuery = "DELETE FROM notifications WHERE `type` = 'follow' AND `actorId` = ? AND `receiverId` = ?";
      db.query(deleteNotificationQuery, [userInfo.id, req.query.userId]);

      return res.status(200).json("Unfollow");
    });
  });
};
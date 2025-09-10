import { createContext, useEffect, useState } from "react";
import { makeRequest } from "../axios"; // Sử dụng makeRequest để đảm bảo cookie được gửi đi

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (inputs) => {
    // Sửa lại để dùng makeRequest
    const res = await makeRequest.post("/auth/login", inputs);
    setCurrentUser(res.data);
  };

  // Bỏ các dòng console.log không cần thiết
  const updateUser = (data) => {
    const updatedUser = { ...currentUser, ...data };
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // --- THÊM HÀM LOGOUT MỚI ---
  const logout = async () => {
    await makeRequest.post("/auth/logout");
    setCurrentUser(null); // Set user về null ở frontend
  };

  useEffect(() => {
    // Sửa lại logic để xóa item khỏi localStorage khi logout
    if (currentUser === null) {
      localStorage.removeItem("user");
    } else {
      localStorage.setItem("user", JSON.stringify(currentUser));
    }
  }, [currentUser]);

  return (
    // Thêm `logout` vào Provider
    <AuthContext.Provider value={{ currentUser, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

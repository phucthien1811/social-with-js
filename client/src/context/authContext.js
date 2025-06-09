import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (inputs) => {
    const res = await axios.post("http://localhost:8800/api/auth/login", inputs);
    setCurrentUser(res.data);
  };

  const updateUser = (data) => {
    console.log("--- [FRONTEND LOG 3] Hàm updateUser trong Context được gọi với data:", data);
    console.log("--- [FRONTEND LOG 4] currentUser TRƯỚC KHI cập nhật:", currentUser);
    
    const updatedUser = { ...currentUser, ...data };
    
    console.log("--- [FRONTEND LOG 5] currentUser SAU KHI cập nhật sẽ là:", updatedUser);
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  useEffect(() => {
    // Không cần log ở đây để tránh nhiễu
  }, [currentUser]);
  
  // Dòng log này sẽ cho thấy mỗi khi Context Provider render lại
  console.log("AuthContext Provider is rendering. Current user is:", currentUser?.name);

  return (
    <AuthContext.Provider value={{ currentUser, login, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

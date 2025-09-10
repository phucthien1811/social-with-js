import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthContextProvider } from "./context/authContext";
import { DarkModeContextProvider } from "./context/darkModeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// // === THÊM 2 DÒNG NÀY VÀO ĐỂ SLIDER HIỂN THỊ ĐÚNG ===
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// Tạo queryClient ở bên ngoài để nó không bị tạo lại
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* Bọc toàn bộ App bằng QueryClientProvider ở đây */}
    <QueryClientProvider client={queryClient}>
      <DarkModeContextProvider>
        <AuthContextProvider>
          <App />
        </AuthContextProvider>
      </DarkModeContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

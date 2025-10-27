import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import App from "./App.tsx";
import LoginScreen from "./components/LoginScreen.tsx";
import SignupScreen from "./components/SignupScreen.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
import { Route, Routes } from "react-router-dom";
import LoginPage from "../modules/auth/LoginPage";
import RegisterPage from "../modules/auth/RegisterPage";
import ProtectedRoute from "../shared/layout/ProtectedRoute";

const Router = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<div className="p-4 text-xl">🏠 Home — Protected ✅</div>} />
            </Route>
        </Routes>
    );
};

export default Router;
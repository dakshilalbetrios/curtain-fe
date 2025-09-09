import React from "react";
import { Badge, Button, Typography } from "antd";
import { ArrowLeft, ShoppingCart, Bell, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";

const { Title } = Typography;

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showCart?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  showCart = false,
}) => {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="sticky top-0 left-0 right-0 z-50 px-4 py-3 theme-shadow-md theme-bg-elevated theme-text-primary border-b theme-border-primary">
      <div className="flex items-center justify-between mx-auto">
        <div className="flex items-center space-x-3">
          {showBack && (
            <Button
              type="text"
              icon={<ArrowLeft className="w-5 h-5 theme-text-primary" />}
              onClick={handleBack}
              className="theme-text-primary hover:theme-bg-tertiary border-0"
            />
          )}

          {/* YD Logo */}
          <div className="lg:hidden w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/25">
            <span className="text-white font-bold text-sm">YD</span>
          </div>

          <Title level={4} className="!theme-text-primary !mb-0">
            {title}
          </Title>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            type="text"
            icon={
              isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )
            }
            onClick={toggleTheme}
            className="theme-text-primary hover:theme-bg-tertiary border-0"
            title={`Switch to ${isDark ? "light" : "dark"} theme`}
          />

          <Button
            type="text"
            icon={<Bell className="w-5 h-5 theme-text-primary" />}
            className="theme-text-primary hover:theme-bg-tertiary border-0"
          />

          {showCart && user?.role === "CUSTOMER" && (
            <Badge count={getTotalItems()} size="small">
              <Button
                type="text"
                icon={<ShoppingCart className="w-5 h-5 theme-text-primary" />}
                onClick={handleCartClick}
                className="theme-text-primary hover:theme-bg-tertiary border-0"
              />
            </Badge>
          )}

          <Button
            type="text"
            icon={<LogOut className="w-5 h-5 theme-text-primary" />}
            onClick={handleLogout}
            className="theme-text-primary hover:theme-bg-tertiary border-0"
          />
        </div>
      </div>
    </div>
  );
};

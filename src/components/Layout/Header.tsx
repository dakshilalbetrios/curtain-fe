import React from "react";
import { Badge, Button, Typography } from "antd";
import { ArrowLeft, ShoppingCart, Bell, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { USER_ROLE } from "../../constants";

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
    <div
      className="w-full px-4 py-3 theme-shadow-md theme-bg-elevated theme-text-primary border-b theme-border-primary"
      style={{ height: "64px" }}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          {showBack && (
            <Button
              type="text"
              icon={<ArrowLeft className="w-5 h-5 theme-text-primary" />}
              onClick={handleBack}
              className="theme-text-primary hover:theme-bg-tertiary border-0"
            />
          )}

          {/* Responsive Logo */}
          <div className="flex items-center space-x-3">
            {/* YD Logo - Always visible */}
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="text-white font-bold text-sm">YD</span>
            </div>

            {/* Full Logo - Only visible on lg screens and up */}
            <div className="hidden lg:block">
              <h1 className="text-lg font-bold theme-text-primary">
                Yamini Drape
              </h1>
              <p className="text-xs theme-text-tertiary -mt-1">
                Curtain Solutions
              </p>
            </div>
          </div>

          {title && (
            <Title level={4} className="!theme-text-primary !mb-0 lg:hidden">
              {title}
            </Title>
          )}
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

          {showCart && user?.role === USER_ROLE.CUSTOMER && (
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

import React from "react";
import { Badge, Button, Typography } from "antd";
import { ArrowLeft, ShoppingCart, Bell, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
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

  const getPageTitle = () => {
    if (title) return title;

    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/collections":
        return "Collections";
      case "/orders":
        return "My Orders";
      case "/retailers":
        return "Retailers";
      case "/profile":
        return "Profile";
      case "/cart":
        return "Cart";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="sticky top-0 left-0 right-0 z-50 bg-gray-800 text-white px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between mx-auto">
        <div className="flex items-center space-x-3">
          {showBack && (
            <Button
              type="text"
              icon={<ArrowLeft className="w-5 h-5 text-white" />}
              onClick={handleBack}
              className="text-white hover:bg-gray-700 border-0"
            />
          )}
          <Title level={4} className="!text-white !mb-0 ">
            {getPageTitle()}
          </Title>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            type="text"
            icon={<Bell className="w-5 h-5 text-white" />}
            className="text-white hover:bg-gray-700 border-0"
          />

          {showCart && user?.role === "CUSTOMER" && (
            <Badge count={getTotalItems()} size="small">
              <Button
                type="text"
                icon={<ShoppingCart className="w-5 h-5 text-white" />}
                onClick={handleCartClick}
                className="text-white hover:bg-gray-700 border-0"
              />
            </Badge>
          )}

          <Button
            type="text"
            icon={<LogOut className="w-5 h-5 text-white" />}
            onClick={handleLogout}
            className="text-white hover:bg-gray-700 border-0"
          />
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Package, ShoppingBag, Users, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <Home className="w-5 h-5" />,
      label: "Dashboard",
    },
    {
      key: "/collections",
      icon: <Package className="w-5 h-5" />,
      label: "Collections",
    },
    {
      key: "/orders",
      icon: <ShoppingBag className="w-5 h-5" />,
      label: "Orders",
    },
    ...(user?.role === "ADMIN" || user?.role === "SALES"
      ? [
          {
            key: "/retailers",
            icon: <Users className="w-5 h-5" />,
            label: "Retailers",
          },
        ]
      : []),
    {
      key: "/profile",
      icon: <User className="w-5 h-5" />,
      label: "Profile",
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <div className="h-full bg-gray-800 pt-[4rem]">
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={handleMenuClick}
        theme="dark"
        items={menuItems}
        className="border-0 bg-gray-800"
      />
    </div>
  );
};

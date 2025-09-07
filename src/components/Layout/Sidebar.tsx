import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Package, ShoppingBag, Users, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { key: "dashboard", icon: Home, label: "Dashboard", path: "/dashboard" },
    {
      key: "collections",
      icon: Package,
      label: "Collections",
      path: "/collections",
    },
    {
      key: "orders",
      icon: ShoppingBag,
      label: "Orders",
      path: "/orders",
    },
    ...(user?.role === "ADMIN" || user?.role === "SALES"
      ? [
          {
            key: "users",
            icon: Users,
            label: "Users",
            path: "/users",
          },
        ]
      : []),
    {
      key: "profile",
      icon: User,
      label: "Profile",
      path: "/profile",
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Function to determine if a navigation item should be active
  const isNavItemActive = (navItem: any) => {
    const currentPath = location.pathname;

    switch (navItem.key) {
      case "dashboard":
        return currentPath === "/dashboard";

      case "collections":
        return (
          currentPath === "/collections" ||
          currentPath.startsWith("/collections/") ||
          currentPath === "/cart"
        );

      case "orders":
        return currentPath === "/orders" || currentPath.startsWith("/orders/");

      case "users":
        return currentPath === "/users" || currentPath.startsWith("/users/");

      case "profile":
        return (
          currentPath === "/profile" ||
          currentPath === "/profile/edit" ||
          currentPath === "/profile/change-password"
        );

      default:
        return currentPath === navItem.path;
    }
  };

  return (
    <div className="h-full theme-bg-secondary pt-[4rem]">
      <div className="px-4 py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavItemActive(item);

          return (
            <button
              key={item.key}
              onClick={() => handleNavigation(item.path)}
              className={`group relative flex items-center w-full px-4 py-3 mb-2 rounded-xl transition-all duration-300 ease-out ${
                isActive
                  ? "theme-text-primary"
                  : "theme-text-tertiary hover:theme-text-secondary"
              }`}
            >
              {/* Icon container with active state */}
              <div
                className={`relative mr-3 transition-all duration-300 ${
                  isActive ? "scale-110" : "group-hover:scale-105"
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25"
                      : "group-hover:theme-bg-tertiary"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive
                        ? "text-white drop-shadow-sm"
                        : "group-hover:theme-text-secondary"
                    }`}
                  />
                </div>
              </div>

              {/* Label */}
              <span
                className={`font-medium transition-all duration-300 ${
                  isActive
                    ? "theme-text-primary"
                    : "theme-text-tertiary group-hover:theme-text-secondary"
                }`}
              >
                {item.label}
              </span>

              {/* Hover effect */}
              {!isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

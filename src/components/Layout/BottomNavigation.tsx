import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Package, ShoppingBag, User, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { key: "dashboard", icon: Home, label: "Dashboard", path: "/dashboard" },
    {
      key: "collections",
      icon: Package,
      label: "Collections",
      path: "/collections",
    },
    { key: "orders", icon: ShoppingBag, label: "Orders", path: "/orders" },
    ...(user?.role === "ADMIN" || user?.role === "SALES"
      ? [
          {
            key: "retailers",
            icon: Users,
            label: "Retailers",
            path: "/users",
          },
        ]
      : []),
    { key: "profile", icon: User, label: "Profile", path: "/profile" },
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

      case "retailers":
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
    <>
      {/* Main navigation bar */}
      <div className="fixed bottom-4 left-4 right-4 lg:hidden z-50">
        <div className="theme-bg-elevated/95 backdrop-blur-xl border theme-border-primary/50 rounded-2xl theme-shadow-lg">
          <div className="flex justify-around items-center py-3 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavItemActive(item);

              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigation(item.path)}
                  className={`group relative flex flex-col items-center px-3 rounded-xl transition-all duration-300 ease-out min-w-0 flex-1 ${
                    isActive
                      ? "theme-text-primary"
                      : "theme-text-tertiary hover:theme-text-secondary"
                  }`}
                >
                  {/* Icon container with active state */}
                  <div
                    className={`relative mb-1.5 transition-all duration-300 ${
                      isActive ? "scale-110" : "group-hover:scale-105"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-xl transition-all duration-300 ${
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

                  {/* Hover effect */}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

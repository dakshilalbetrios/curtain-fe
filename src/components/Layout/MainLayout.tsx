import React from "react";
import { Header } from "./Header";
import { BottomNavigation } from "./BottomNavigation";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  showCart?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  showBack = false,
  showCart = true,
}) => {
  return (
    <div className="h-screen theme-bg-primary overflow-hidden">
      {/* Header - Full width at the top */}
      <Header title={title} showBack={showBack} showCart={showCart} />

      {/* Main layout below header */}
      <div className="flex h-full" style={{ height: "calc(100vh - 64px)" }}>
        {/* Desktop Sidebar - Left side */}
        <div className="hidden lg:block w-60 theme-bg-secondary border-r theme-border-primary">
          <Sidebar />
        </div>

        {/* Main Content Area - Right side */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 theme-bg-primary w-full overflow-hidden min-h-0">
            <div className="h-full w-full px-4 py-4 min-h-0 max-h-full overflow-x-hidden">
              {children}
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <BottomNavigation />
        </div>
      </div>
    </div>
  );
};

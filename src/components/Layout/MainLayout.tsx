import React from "react";
import { Layout } from "antd";
import { Header } from "./Header";
import { BottomNavigation } from "./BottomNavigation";
import { Sidebar } from "./Sidebar";

const { Content, Sider } = Layout;

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
    <Layout className="h-screen theme-bg-primary overflow-hidden">
      {/* Desktop Sidebar */}
      <Sider
        width={240}
        className="hidden lg:block theme-bg-secondary border-r theme-border-primary fixed left-0 top-0 bottom-0 z-40"
        breakpoint="lg"
      >
        <Sidebar />
      </Sider>

      <Layout className="lg:ml-60">
        {/* Header */}
        <Header title={title} showBack={showBack} showCart={showCart} />

        {/* Main Content */}
        <Content className="pb-[140px] theme-bg-primary min-h-screen overflow-y-auto w-full">
          <div className="px-4 py-4 w-full mx-auto">{children}</div>
        </Content>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation />
      </Layout>
    </Layout>
  );
};

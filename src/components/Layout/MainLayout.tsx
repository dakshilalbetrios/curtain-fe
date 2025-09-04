import React from 'react';
import { Layout } from 'antd';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

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
  showCart = true 
}) => {
  const { user } = useAuth();

  return (
    <Layout className="h-screen bg-gray-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sider 
        width={240} 
        className="hidden lg:block bg-gray-800 border-r border-gray-700 fixed left-0 top-0 bottom-0 z-40"
        breakpoint="lg"
      >
        <Sidebar />
      </Sider>

      <Layout className="lg:ml-60">
        {/* Header */}
        <Header title={title} showBack={showBack} showCart={showCart} />
        
        {/* Main Content */}
         <Content className="pt-16 pb-[100px] bg-gray-900 min-h-screen overflow-y-auto w-full">
          <div className="px-4 py-4 w-full max-w-6xl mx-auto">{children}</div>
        </Content>

        
        {/* Mobile Bottom Navigation */}
        <BottomNavigation />
      </Layout>
    </Layout>
  );
};
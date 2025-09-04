import React from 'react';
import { Card, Row, Col, Typography, Statistic, Button } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, ShoppingBag, TrendingUp, Users, Plus, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { chartData, mockOrders, mockUsers, mockCollections } from '../../data/mockData';
import { MainLayout } from '../Layout/MainLayout';

const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isWholesaler = user?.role === 'ADMIN' || user?.role === 'SALES';
  const isRetailer = user?.role === 'CUSTOMER';

  const pendingOrders = mockOrders.filter(order => order.status === 'PENDING').length;
  const totalOrders = mockOrders.length;
  const totalRetailers = mockUsers.filter(u => u.role === 'CUSTOMER').length;
  const totalCollections = mockCollections.length;

  const quickActions = isRetailer ? [
    {
      title: 'My Orders',
      description: 'View your order history',
      icon: <ShoppingBag className="w-8 h-8 text-purple-400" />,
      action: () => navigate('/orders'),
      color: 'bg-purple-900/20 border-purple-500/30'
    },
    {
      title: 'Collections',
      description: 'Browse available collections',
      icon: <Package className="w-8 h-8 text-blue-400" />,
      action: () => navigate('/collections'),
      color: 'bg-blue-900/20 border-blue-500/30'
    },
    {
      title: 'New Order',
      description: 'Place a new order',
      icon: <Plus className="w-8 h-8 text-green-400" />,
      action: () => navigate('/collections'),
      color: 'bg-green-900/20 border-green-500/30'
    },
    {
      title: 'Profile',
      description: 'View your profile',
      icon: <Eye className="w-8 h-8 text-orange-400" />,
      action: () => navigate('/profile'),
      color: 'bg-orange-900/20 border-orange-500/30'
    }
  ] : [
    {
      title: 'Orders',
      description: 'Manage all orders',
      icon: <ShoppingBag className="w-8 h-8 text-purple-400" />,
      action: () => navigate('/orders'),
      color: 'bg-purple-900/20 border-purple-500/30'
    },
    {
      title: 'Collections',
      description: 'Manage collections',
      icon: <Package className="w-8 h-8 text-blue-400" />,
      action: () => navigate('/collections'),
      color: 'bg-blue-900/20 border-blue-500/30'
    },
    {
      title: 'Retailers',
      description: 'Manage retailers',
      icon: <Users className="w-8 h-8 text-green-400" />,
      action: () => navigate('/retailers'),
      color: 'bg-green-900/20 border-green-500/30'
    },
    {
      title: 'Analytics',
      description: 'View business insights',
      icon: <TrendingUp className="w-8 h-8 text-orange-400" />,
      action: () => {},
      color: 'bg-orange-900/20 border-orange-500/30'
    }
  ];

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white">
          <div className="p-4">
            <Title level={3} className="!text-white !mb-2">
              {isRetailer ? 'Exclusive Summer Sale' : `Welcome, ${user?.name}`}
            </Title>
            <Text className="text-purple-100">
              {isRetailer 
                ? 'Up to 50% off on selected items!' 
                : 'Manage your business efficiently'}
            </Text>
          </div>
        </Card>

        {/* Statistics */}
        <Row gutter={[16, 16]}>
          {isWholesaler ? (
            <>
              <Col xs={12} sm={6}>
                <Card className="bg-gray-800 border-gray-700 text-center">
                  <Statistic
                    title={<span className="text-gray-300">Total Orders</span>}
                    value={totalOrders}
                    valueStyle={{ color: '#8B5CF6' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="bg-gray-800 border-gray-700 text-center">
                  <Statistic
                    title={<span className="text-gray-300">Pending</span>}
                    value={pendingOrders}
                    valueStyle={{ color: '#F59E0B' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="bg-gray-800 border-gray-700 text-center">
                  <Statistic
                    title={<span className="text-gray-300">Retailers</span>}
                    value={totalRetailers}
                    valueStyle={{ color: '#10B981' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="bg-gray-800 border-gray-700 text-center">
                  <Statistic
                    title={<span className="text-gray-300">Collections</span>}
                    value={totalCollections}
                    valueStyle={{ color: '#3B82F6' }}
                  />
                </Card>
              </Col>
            </>
          ) : (
            <>
              <Col xs={8}>
                <Card className="bg-gray-800 border-gray-700 text-center">
                  <Statistic
                    title={<span className="text-gray-300 text-xs">Orders in Progress</span>}
                    value={5}
                    valueStyle={{ color: '#8B5CF6', fontSize: '24px' }}
                  />
                </Card>
              </Col>
              <Col xs={8}>
                <Card className="bg-gray-800 border-gray-700 text-center">
                  <Statistic
                    title={<span className="text-gray-300 text-xs">Latest Collection</span>}
                    value="New"
                    valueStyle={{ color: '#10B981', fontSize: '24px' }}
                  />
                </Card>
              </Col>
              <Col xs={8}>
                <Card className="bg-gray-800 border-gray-700 text-center">
                  <Statistic
                    title={<span className="text-gray-300 text-xs">Exclusive Offers</span>}
                    value="20%"
                    valueStyle={{ color: '#F59E0B', fontSize: '24px' }}
                  />
                </Card>
              </Col>
            </>
          )}
        </Row>

        {/* Quick Actions */}
        <div>
          <Title level={4} className="!text-white !mb-4">
            Quick Actions
          </Title>
          <Row gutter={[16, 16]}>
            {quickActions.map((action, index) => (
              <Col xs={12} sm={6} md={6} lg={6} key={index}>
                <Card
                  hoverable
                  onClick={action.action}
                  className={`bg-gray-800 border ${action.color} cursor-pointer transition-all duration-300 hover:scale-105`}
                >
                  <div className="text-center p-2 sm:p-4">
                    <div className="mb-3 flex justify-center">
                      {action.icon}
                    </div>
                    <Title level={5} className="!text-white !mb-1 !text-sm sm:!text-base">
                      {action.title}
                    </Title>
                    <Text className="text-gray-400 text-xs sm:text-sm">
                      {action.description}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Chart for Wholesalers */}
        {isWholesaler && (
          <Card className="bg-gray-800 border-gray-700">
            <Title level={4} className="!text-white !mb-4">
              Monthly Orders Overview
            </Title>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      color: '#F9FAFB'
                    }} 
                  />
                  <Bar dataKey="orders" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};
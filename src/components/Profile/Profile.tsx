import React from 'react';
import { Card, Typography, Button, Avatar, Tag, Divider, Space } from 'antd';
import { User, Phone, Store, Calendar, Settings, LogOut, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../Layout/MainLayout';
import moment from 'moment';

const { Title, Text } = Typography;

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'purple';
      case 'SALES': return 'blue';
      case 'CUSTOMER': return 'green';
      default: return 'gray';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'SALES': return 'Sales Manager';
      case 'CUSTOMER': return 'Retailer';
      default: return role;
    }
  };

  if (!user) return null;

  return (
    <MainLayout title="Profile">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="bg-gray-800 border-gray-700">
          <div className="text-center space-y-4">
            <Avatar
              size={80}
              className="bg-purple-600 mx-auto"
              icon={<User className="w-8 h-8" />}
            />
            <div>
              <Title level={3} className="!text-white !mb-1">
                {user.name}
              </Title>
              <Tag color={getRoleColor(user.role)} className="mb-2">
                {getRoleName(user.role)}
              </Tag>
              <br />
              <Tag color={user.status === 'ACTIVE' ? 'green' : 'red'}>
                {user.status}
              </Tag>
            </div>
          </div>
        </Card>

        {/* Profile Details */}
        <Card className="bg-gray-800 border-gray-700">
          <Title level={4} className="!text-white !mb-4">
            Personal Information
          </Title>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-purple-400" />
              <div>
                <Text className="text-gray-300">Mobile Number</Text>
                <br />
                <Text className="text-white font-medium">{user.mobile_no}</Text>
              </div>
            </div>

            <Divider className="border-gray-600" />

            <div className="flex items-center space-x-3">
              <Store className="w-5 h-5 text-blue-400" />
              <div>
                <Text className="text-gray-300">Shop Name</Text>
                <br />
                <Text className="text-white font-medium">{user.shop_name}</Text>
              </div>
            </div>

            <Divider className="border-gray-600" />

            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-green-400" />
              <div>
                <Text className="text-gray-300">Member Since</Text>
                <br />
                <Text className="text-white font-medium">
                  {moment(user.created_at).format('MMMM DD, YYYY')}
                </Text>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card className="bg-gray-800 border-gray-700">
          <Title level={4} className="!text-white !mb-4">
            Settings
          </Title>
          
          <Space direction="vertical" className="w-full" size="middle">
            <Button
              size="large"
              icon={<Edit className="w-5 h-5" />}
              onClick={handleEditProfile}
              className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600 flex items-center"
            >
              Edit Profile
            </Button>
            
            <Button
              size="large"
              icon={<Settings className="w-5 h-5" />}
              onClick={() => navigate('/profile/change-password')}
              className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600 flex items-center"
            >
              Change Password
            </Button>
            
            <Button
              size="large"
              icon={<Settings className="w-5 h-5" />}
              className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600 flex items-center"
            >
              App Settings
            </Button>
            
            <Button
              size="large"
              danger
              icon={<LogOut className="w-5 h-5" />}
              onClick={handleLogout}
              className="w-full flex items-center"
            >
              Logout
            </Button>
          </Space>
        </Card>
      </div>
    </MainLayout>
  );
};